"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("angular2/core");
var http_1 = require("angular2/http");
require("Scripts/angular2/base64.js");
var DiadocService = (function () {
    function DiadocService(http) {
        this.http = http;
    }
    DiadocService.prototype.getDDAuthToken = function (ddauth_api_client_id, signature) {
        /*
            let body: any = Base64.decode(signature);
    
            Base64.decode('ZGFua29nYWk=');  // dankogai
                Base64.decode('5bCP6aO85by+');  // 小飼弾
                Base64.decode('5bCP6aO85by-');  // 小飼弾
    
                Base64.encode('dankogai');  // ZGFua29nYWk=
                Base64.encode('小飼弾');    // 5bCP6aO85by+
                Base64.encodeURI('小飼弾'); // 5bCP6aO85by-
         */
        var body = signature;
        var headers = new http_1.Headers();
        headers.append("Host", 'https://diadoc-api.kontur.ru HTTP/ 1.1');
        headers.append("Content-Length", '1252');
        headers.append("Connection", 'Keep-Alive');
        headers.append("Authorization", "DiadocAuth ddauth_api_client_id=" + ddauth_api_client_id);
        headers.append("Content-Type", 'application/json charset=utf-8');
        headers.append("Accept", 'application/json');
        var requestoptions = new http_1.RequestOptions({
            method: http_1.RequestMethod.Post,
            headers: headers,
            body: body,
            url: 'https://diadoc-api.kontur.ru/Authenticate'
        });
        var req = new http_1.Request(requestoptions);
        console.log('req.method:', http_1.RequestMethod[req.method]);
        console.log('requestoptions.url:', requestoptions.url);
        return this.http.request(requestoptions.url, req).map(function (res) { return res.json(); });
    };
    return DiadocService;
}());
DiadocService = __decorate([
    core_1.Injectable()
], DiadocService);
exports.DiadocService = DiadocService;
