import { Component } from 'angular2/core';
import { Observable, Observer } from "rxjs";

import { ShadowBox } from "shared/Controls/shadowbox";

import { ShowError, ShowMessage, ShowRecordInfo } from "shared/common";

import { CryptoProPlugin } from "shared/Plugins/cryptopro";
import { CertsService, Cert } from "shared/Services/certs.service";

import { DiadocService } from "shared/Services/diadoc.service";
import { FileUploadService, FileModel } from "shared/Services/fileupload.service";

@Component({
    selector: "Default",
    moduleId: "a2/Tests/Default",
    templateUrl: "./default.html",
    directives: [ShadowBox]
    providers: [FileUploadService]

})
export class DefaultComponent {
    getCertslist: Cert[] = [];
    certslist: Cert[] = [];
    selected: Cert;
    file: FileModel = [];

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

    constructor(
        private fileSrv: FileUploadService,
        private diadocSrv: DiadocService,
        private srvCerts: CertsService,
        private crypto: CryptoProPlugin = new CryptoProPlugin()) {

    }

    ngOnInit() {
        this.srvCerts.loadCertsList(this.getCertslist);

        this.cadesTypelist = [];
        this.cadesTypelist.push({ id: 0, name: "Default" });
        this.cadesTypelist.push({ id: 1, name: "CAdES BES" });
        this.cadesTypelist.push({ id: 5, name: "CAdES T" });
        this.cadesTypelist.push({ id: 93, name: "CAdES-XLT1" });

        this.tsplist = [];
        this.tsplist.push({ id: 'http://www.cryptopro.ru/tsp/tsp.srf', name: "https://www.cryptopro.ru/ui/" });
        this.tsplist.push({ id: 'http://testca.cryptopro.ru/tsp/tsp.srf', name: "https://www.cryptopro.ru/certsrv/" });
        
    }

    onClickRefreshList() {
        this.certslist = [];
        this.certslist = this.srvCerts.getCertList();
    }

    onClickAuthentificate(cert: any) {
        if (cert && cert.signature) {
            this.diadocSrv.getDDAuthToken(cert)
                .subscribe(
                data => {
                    console.log(data);
                },
                error => {
                    console.log(error);
                    alert('Error message: ' + error._body + '\nURL: ' + error.url + '\nStatus: ' + error.status);
                });
        }
    }

    private fileChangeEvent(fileInput: any) {

        //this.file.file = <File>fileInput.target.files[0];
        this.file.description = fileInput.target.files[0].name;

        let selectedFile = fileInput.target.files;
        if (selectedFile.length > 0) {
            let fileToLoad = selectedFile[0];
            let oFReader: FileReader = new FileReader();

            if (typeof (oFReader.readAsDataURL) != "function") {
                alert("Method readAsDataURL() is not supported in FileReader.");
                return;
            }

            oFReader.onloadend = (e) => {
                let header = ";base64,";
                let sFileData = oFReader.result;
                this.file.file = sFileData.substr(sFileData.indexOf(header) + header.length);
                console.log(this.file);
            };
            oFReader.readAsDataURL(fileToLoad);

            this.onClickRefreshList();
        }

    }

    private onClickSignCreated() {
        this.srvCerts.signCreated(this.selected.thumbprint, this.file, this.cadesTypeSelected, this.isbDetached, this.tspServiceSelected);
    }

    private onSelected(row: any) {
        if (this.selected !== row) {
            this.selected = row;
        }
    }

    private onClickShowModal(id: string) {
        $(`#${id}`).modal("show");
    }
}