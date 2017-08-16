import { Component } from 'angular2/core';
import 'rxjs/Rx';

import { CryptoProPlugin } from "shared/Plugins/cryptopro";
import { DiadocService } from "shared/Services/diadoc.service";
import { CertsService, Cert } from "shared/Services/certs.service";


@Component({
    selector: "Default",
    moduleId: "a2/Tests/Default",
    templateUrl: "./default.html"
})
export class DefaultComponent {
    private getCertslist: Cert[] = [];
    private certslist: Cert[] = [];
    
    constructor(
        private diadocSrv: DiadocService,
        private srvCerts: CertsService,
        private crypto: CryptoProPlugin) {

    }

    ngOnInit() {
        this.srvCerts.loadCertsList(this.getCertslist);
    }

    onClickRefreshList() {
        this.certslist = this.srvCerts.getCertList();
        if (this.certslist && this.certslist[0].signature) {
            this.diadocSrv.getDDAuthToken('pavenko_sv-9518812f-c6a1-4a4b-979a-857be09009ee', this.certslist[0].signature)
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

}