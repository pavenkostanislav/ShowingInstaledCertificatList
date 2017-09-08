import { Component } from 'angular2/core';
import { Observable, Observer } from "rxjs";
import 'Scripts/angular2/base64.js';

import { CryptoProPlugin } from "shared/Plugins/cryptopro";
import { DiadocService } from "shared/Services/diadoc.service";
import { CertsService, Cert } from "shared/Services/certs.service";
import { FileUploadService, FileModel } from "shared/Services/fileupload.service";

@Component({
    selector: "Default",
    moduleId: "a2/Tests/Default",
    templateUrl: "./default.html",
    providers: [FileUploadService]

})
export class DefaultComponent {
    getCertslist: Cert[] = [];
    certslist: Cert[] = [];
    file: FileModel = [];
    
    constructor(
        private fileSrv: FileUploadService,
        private diadocSrv: DiadocService,
        private srvCerts: CertsService,
        private crypto: CryptoProPlugin = new CryptoProPlugin()) {

    }

    ngOnInit() {
        this.srvCerts.loadCertsList(this.getCertslist);
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

    private onClickSignCreated(cert: Cert) {
        this.srvCerts.signCreated(cert.thumbprint, this.file);
    }
}