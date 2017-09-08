import { Injectable} from 'angular2/core';
import { Observable } from 'rxjs/Rx';
import { CryptoProPlugin } from "shared/Plugins/cryptopro";
import 'Scripts/angular2/base64.js';
/*
    let body: any = Base64.decode(signature);

    Base64.decode('ZGFua29nYWk=');  // dankogai
        Base64.decode('5bCP6aO85by+');  // 小飼弾
        Base64.decode('5bCP6aO85by-');  // 小飼弾

        Base64.encode('dankogai');  // ZGFua29nYWk=
        Base64.encode('小飼弾');    // 5bCP6aO85by+
        Base64.encodeURI('小飼弾'); // 5bCP6aO85by-

    let encodeString: string = Base64.encode(file);
    */

import { DiadocService } from "shared/Services/diadoc.service";
import { FileModel } from "shared/Services/fileupload.service";



@Injectable()
export class CertsService {
    certslist: Cert[] = [];
    public certsCount: number = -1;
    public PDFBase64String: string;

    constructor(private diadocSrv: DiadocService,
                private crypto: CryptoProPlugin = new CryptoProPlugin()) {
    }

    public loadCertsList(certslist: Cert[]): void {
        this.certsCount = -1;
        this.crypto.then(
            () => {
                this.crypto.getCertList().then(
                    (res: Cert[]) => { certslist = this.setCertList(res); }
                    , (error) => {
                        console.error(error);
                    });
            }
            , (error) => {
                console.error(error);
            });
    }

    setCertList(collection: Cert[]): Cert[] {
        collection.forEach((current) => {
            this.certsCount = this.certslist.push(current);
            console.log(`Fetched ${this.certsCount} certificates.`);
        });
        return this.certslist;
    }

    public getCertList(): Cert[] {
        return this.certslist;
    }
    public getPDFBase64String(): string {
        return this.PDFBase64String;
    }


    public signCreated(certThumbprint: string, file: FileModel): void {
        this.crypto.then(
            () => {
                this.crypto.signature(certThumbprint, file.file)
                    .then(
                    (res: any) => {
                        this.PDFBase64String = res;
                        console.log(this.PDFBase64String);
                        this.createFileResponce(this.PDFBase64String, file.description);
                    }
                    , (error) => {
                        console.error(error);
                    });
            }
            , (error) => {
                console.error(error);
            });
    }

    private createFileResponce(b64Data: string, fileName: string) {
        if (b64Data) {
            let contentType = 'application/pkcs7-signature';

            let byteNumbers = new Array(b64Data.length);

            for (var i = 0; i < b64Data.length; i++)
                byteNumbers[i] = b64Data.charCodeAt(i);

            let byteArray = new Uint8Array(byteNumbers);

            let blob = new Blob([byteArray], { type: contentType });

            console.log(blob.size);

            let url = window.URL.createObjectURL(blob);

            if (window.navigator.msSaveBlob) {
                window.navigator.msSaveOrOpenBlob(blob, fileName + ".p7s");
            } else {
                var link = document.createElement('a');
                link.href = window.URL.createObjectURL(blob);
                link.setAttribute('download', fileName + ".p7s");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
}
export class Cert {
    value: string;
    text: string;
    subject: string;
    issuer: string;
    from: string;
    till: string;
    provname: string;
    algorithm: string;
    signature: string;
    thumbprint: string;
}