"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="./node_modules/angular2/typings/browser.d.ts" />
var browser_1 = require("angular2/platform/browser");
var core_1 = require("angular2/core");
var common_1 = require("angular2/common");
var http_1 = require("angular2/http");
var router_1 = require("angular2/router");
require("rxjs/Rx");
var diadoc_service_1 = require("shared/Services/diadoc.service");
var certs_service_1 = require("shared/Services/certs.service");
var cryptopro_1 = require("shared/Plugins/cryptopro");
window["CryptoProPlugin"] = cryptopro_1.CryptoProPlugin;
var default_1 = require("./default");
var AppComponent = (function () {
    function AppComponent() {
    }
    return AppComponent;
}());
AppComponent = __decorate([
    router_1.RouteConfig([
        { path: "/Views/Tests/Default", name: "Default", component: default_1.DefaultComponent, useAsDefault: true }
    ]),
    core_1.Component({
        selector: "my-app",
        template: "<router-outlet></router-outlet>",
        directives: [common_1.CORE_DIRECTIVES, common_1.FORM_DIRECTIVES, router_1.ROUTER_DIRECTIVES]
    })
], AppComponent);
exports.AppComponent = AppComponent;
core_1.enableProdMode();
browser_1.bootstrap(AppComponent, [http_1.HTTP_PROVIDERS,
    router_1.ROUTER_PROVIDERS,
    cryptopro_1.CryptoProPlugin,
    certs_service_1.CertsService,
    diadoc_service_1.DiadocService]);
