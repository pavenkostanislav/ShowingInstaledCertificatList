import { Injectable} from 'angular2/core';
import { Observable } from 'rxjs/Rx';
import { CryptoProPlugin } from "shared/Plugins/cryptopro";


@Injectable()
export class CertsService {
    certslist: Cert[] = [];
    public certsCount: number = -1;

    constructor(private crypto: CryptoProPlugin = new CryptoProPlugin()) {
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