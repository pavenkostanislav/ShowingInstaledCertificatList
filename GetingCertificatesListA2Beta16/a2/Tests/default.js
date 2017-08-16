"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("angular2/core");
require("rxjs/Rx");
var DefaultComponent = (function () {
    function DefaultComponent(diadocSrv, srvCerts, crypto) {
        this.diadocSrv = diadocSrv;
        this.srvCerts = srvCerts;
        this.crypto = crypto;
        this.getCertslist = [];
        this.certslist = [];
    }
    DefaultComponent.prototype.ngOnInit = function () {
        this.srvCerts.loadCertsList(this.getCertslist);
    };
    DefaultComponent.prototype.onClickRefreshList = function () {
        this.certslist = this.srvCerts.getCertList();
        if (this.certslist && this.certslist[0].signature) {
            this.diadocSrv.getDDAuthToken('pavenko_sv-9518812f-c6a1-4a4b-979a-857be09009ee', this.certslist[0].signature)
                .subscribe(function (data) {
                console.log(data);
            }, function (error) {
                console.log(error);
                alert('Error message: ' + error._body + '\nURL: ' + error.url + '\nStatus: ' + error.status);
            });
        }
    };
    return DefaultComponent;
}());
DefaultComponent = __decorate([
    core_1.Component({
        selector: "Default",
        moduleId: "a2/Tests/Default",
        templateUrl: "./default.html"
    })
], DefaultComponent);
exports.DefaultComponent = DefaultComponent;
