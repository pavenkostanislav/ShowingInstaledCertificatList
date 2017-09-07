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

        this.file.file = <File>fileInput.target.files[0];
        this.file.description = fileInput.target.files[0].name;
        this.file.metaObjectId = -1;
        this.file.objectId = -1;

        this.onClickRefreshList();

        let selectedFile = fileInput.target.files;
        if (selectedFile.length > 0) {
            let fileToLoad = selectedFile[0];
            let myReader: FileReader = new FileReader();
            myReader.onloadend = (e) => {
                this.file.file = myReader.result;
                console.log(this.file);
            };
            myReader.readAsDataURL(fileToLoad);
        }

    }

    private onClickSignCreated(cert: Cert) {

        this.srvCerts.signCreated(cert.thumbprint, this.file);
        
    }
}