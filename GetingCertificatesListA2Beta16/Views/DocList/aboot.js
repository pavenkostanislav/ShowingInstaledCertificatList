"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
/// <reference path="../../../../node_modules/angular2/typings/browser.d.ts" />
var browser_1 = require("angular2/platform/browser");
var core_1 = require("angular2/core");
var common_1 = require("angular2/common");
var router_1 = require("angular2/router");
var http_1 = require("angular2/http");
require("rxjs/Rx");
var select_service_1 = require("Services/select.service");
var diadoc_service_1 = require("Services/diadoc.service");
var diadocIntegration_1 = require("./diadocIntegration");
var datetime_1 = require("Controls/datetime");
var AppComponent = (function () {
    function AppComponent() {
    }
    return AppComponent;
}());
AppComponent = __decorate([
    core_1.Component({
        selector: 'my-app',
        moduleId: 'Views/DocCardSteps/app/aboot',
        template: '<router-outlet></router-outlet>',
        directives: [router_1.ROUTER_DIRECTIVES],
        providers: [common_1.FORM_PROVIDERS],
    }),
    router_1.RouteConfig([
        { path: '/Views/DocCards/Default', name: 'Diadoc', component: diadocIntegration_1.DiadocIntegrationComponent, useAsDefault: true }
    ])
], AppComponent);
exports.AppComponent = AppComponent;
datetime_1.InitDateExt();
core_1.enableProdMode();
browser_1.bootstrap(AppComponent, [http_1.HTTP_PROVIDERS, router_1.ROUTER_PROVIDERS, diadoc_service_1.DiadocService, select_service_1.SelectService]);
