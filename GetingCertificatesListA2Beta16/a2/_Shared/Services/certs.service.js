"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("angular2/core");
var cryptopro_1 = require("shared/Plugins/cryptopro");
var CertsService = (function () {
    function CertsService(crypto) {
        if (crypto === void 0) { crypto = new cryptopro_1.CryptoProPlugin(); }
        this.crypto = crypto;
        this.certslist = [];
        this.certsCount = -1;
    }
    CertsService.prototype.loadCertsList = function (certslist) {
        var _this = this;
        this.certsCount = -1;
        this.crypto.then(function () {
            _this.crypto.getCertList().then(function (res) { certslist = _this.setCertList(res); }, function (error) {
                console.error(error);
            });
        }, function (error) {
            console.error(error);
        });
    };
    CertsService.prototype.setCertList = function (collection) {
        var _this = this;
        collection.forEach(function (current) {
            _this.certsCount = _this.certslist.push(current);
            console.log("Fetched " + _this.certsCount + " certificates.");
        });
        return this.certslist;
    };
    CertsService.prototype.getCertList = function () {
        return this.certslist;
    };
    return CertsService;
}());
CertsService = __decorate([
    core_1.Injectable()
], CertsService);
exports.CertsService = CertsService;
var Cert = (function () {
    function Cert() {
    }
    return Cert;
}());
exports.Cert = Cert;
