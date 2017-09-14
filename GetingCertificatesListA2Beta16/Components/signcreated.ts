import { Component, Input, OnChanges, SimpleChange, Output, EventEmitter, NgZone } from 'angular2/core';
import { Observable, Observer } from "rxjs";

import { ShadowBox } from "Controls/shadowbox";
import { ShowError, ShowMessage, ShowRecordInfo, ShowModal } from "common";

import { FileUploadService, FileModel } from "Services/fileupload.service";

import { CryptoProPlugin, CryptoProModel } from "Plugins/cryptopro.plugin";

@Component({
    selector: 'signcreated',
    moduleId: "a2/_Shared/Components/Diadoc/signcreated",
    templateUrl: "./signcreated.html",
    directives: [ShadowBox],
    providers: [FileUploadService, CryptoProPlugin]

})
export class SignCreatedComponent {

    @Input() userId: number;
    @Input() docCardId: number;
    @Input() fileDocument: FileModel = [];
    isfileLoadVisible: boolean = true;

    @Output() updated: EventEmitter<string> = new EventEmitter<string>();

    certslist: CryptoProModel[] = [];
    selected: CryptoProModel;
    fileSign: FileModel = [];

    /*
        CADESCOM_CADES_BES  (Тип подписи CAdES BES) = 1
        CADESCOM_CADES_DEFAULT  (Тип подписи по умолчанию (CAdES-X Long Type 1)) = 0
        CADESCOM_CADES_T    (Тип подписи CAdES T) = 0x05
        CADESCOM_CADES_X_LONG_TYPE_1    (Тип подписи CAdES-X Long Type 1) = 0x5D
    */
    cadesTypeSelected: number = 0;
    cadesTypelist: any[] = [];

    isbDetached: boolean = true;

    /*
        *если тестовый личный сертификат выпускали здесь https://www.cryptopro.ru/ui/ то используйте стенд http://www.cryptopro.ru/tsp/tsp.srf
        *если тестовый личный сертификат выпускали здесь https://www.cryptopro.ru/certsrv/ используйте стенд http://testca.cryptopro.ru/tsp/tsp.srf
    */
    tspServiceSelected: string = 'http://testca.cryptopro.ru/tsp/tsp.srf';
    tsplist: any[] = [];

    freeze: boolean = false;

    constructor(
        private zone: NgZone,
        private fileSrv: FileUploadService,
        private crypto: CryptoProPlugin = new CryptoProPlugin()) {
    }

    ngOnInit() {
        this.cadesTypelist.push({ id: 0, name: "Default" });
        this.cadesTypelist.push({ id: 1, name: "CAdES BES" });
        this.cadesTypelist.push({ id: 5, name: "CAdES T" });
        this.cadesTypelist.push({ id: 93, name: "CAdES-XLT1" });

        this.tsplist = [];
        this.tsplist.push({ id: 'http://www.cryptopro.ru/tsp/tsp.srf', name: "https://www.cryptopro.ru/ui/" });
        this.tsplist.push({ id: 'http://testca.cryptopro.ru/tsp/tsp.srf', name: "https://www.cryptopro.ru/certsrv/" });
        this.tsplist.push({ id: 'http://pki.skbkontur.ru/tsp/tsp.srf', name: "УЦ ЗАО ПФ СКБ Контур:" });

    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        if (changes['fileDocument']) {
            this.isfileLoadVisible = false;
            this.refreshList();
        }
    }

    refreshList() {
        this.freeze = true;
        this.crypto.then(
            () => {
                this.crypto.getCertList().then(
                    (res: any) => {
                        this.zone.run(() => {
                            this.certslist = res;
                            this.freeze = false;
                            this.updated.emit('refresh');
                        });

                    }
                    , (error) => {
                        this.freeze = false;
                        ShowError(error);
                    });
            }
            , (error) => {
                this.freeze = false;
                ShowError(error);
            });
    }

    fileChangeEvent(fileInput: any) {
        this.fileDocument.description = fileInput.target.files[0].name;
        this.fileDocument.metaObjectId = 716;
        this.fileDocument.objectId = this.docCardId;
        this.refreshList();

        let selectedFile = fileInput.target.files;
        if (selectedFile.length > 0) {
            let fileToLoad = selectedFile[0];
            let oFReader: FileReader = new FileReader();
            if (typeof (oFReader.readAsDataURL) != "function") {
                ShowError("Method readAsDataURL() is not supported in FileReader.");
                return;
            }
            oFReader.onloadend = (e) => {
                let header = ";base64,";
                let sFileData = oFReader.result;
                this.fileDocument.file = sFileData.substr(sFileData.indexOf(header) + header.length);
                this.updated.emit('fileload');
            };
            oFReader.readAsDataURL(fileToLoad);
            if (!this.certslist)
                this.refreshList();
        }
    }

    signCreated() {
        this.freeze = true;
        return this.crypto.signature(this.selected.thumbprint, this.fileDocument.file, this.cadesTypeSelected, this.isbDetached, this.tspServiceSelected)
            .then(
            (res: any) => {
                this.updated.emit('signcreated');
                let blob = this.newBlobFromBase64(res, 'application/pkcs7-signature');
                if (blob) {
                    this.uploadfile(blob);
                    this.downloadfile(blob, `${this.fileDocument.description}.p7s`);
                }
                this.freeze = false;
            }
            , (error) => {
                this.freeze = false;
                ShowError(error);
            });
    }


    newBlobFromBase64(b64Data: string, contentType: string) {
        if (b64Data) {
            let byteNumbers = new Array(b64Data.length);
            for (var i = 0; i < b64Data.length; i++)
                byteNumbers[i] = b64Data.charCodeAt(i);
            let byteArray = new Uint8Array(byteNumbers);
            return new Blob([byteArray], { type: contentType });
        }
        return null;
    }

    downloadfile(blob: Blob, fileName: string) {
        let url = window.URL.createObjectURL(blob);
        if (window.navigator.msSaveBlob) {
            window.navigator.msSaveOrOpenBlob(blob, fileName);
        } else {
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        this.updated.emit('filedownload');
    }

    uploadfile(_file: any) {
        if (!this.fileDocument.objectId && !this.docCardId) {
            ShowError("Данные НЕ сохранены! Нет привязки к карточки!");
        } else {
            let contentType = 'application/pkcs7-signature';
            this.fileSign = new FileModel();
            this.fileSign.description = this.fileDocument.description + '.p7s';
            this.fileSign.metaObjectId = this.fileDocument.metaObjectId ? this.fileDocument.metaObjectId : 716;
            this.fileSign.objectId = this.fileDocument.objectId ? this.fileDocument.objectId : this.docCardId;
            this.fileSign.file = <File>_file;
            this.fileSign.file.name = this.fileSign.description;
            this.fileSrv.uploadfile(`api/cryptopro/uploadsignedfile`, this.fileSign);
            this.updated.emit('fileupload');
        }
    }

    onClickRefreshList() {
        this.refreshList();
    }

    onClickShowModal(id: string) {
        ShowModal(id);
    }

    onClickSignCreated() {
        this.signCreated();
    }

    onSelected(row: any) {
        if (this.selected !== row) {
            this.selected = row;
        }
    }
}