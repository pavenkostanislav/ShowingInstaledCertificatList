/// <reference path="../../../../node_modules/angular2/typings/browser.d.ts" />
import {bootstrap}    from "angular2/platform/browser";
import {Component, enableProdMode} from "angular2/core";
import {CORE_DIRECTIVES, FORM_DIRECTIVES} from "angular2/common";
import {HTTP_PROVIDERS} from "angular2/http";
import {ROUTER_PROVIDERS, ROUTER_DIRECTIVES, RouteConfig} from "angular2/router";
import "rxjs/Rx";

import { DiadocService } from "Services/diadoc.service";
import { CryptoProPlugin } from "Plugins/cryptopro.plugin";
window["CryptoProPlugin"] = CryptoProPlugin;

import { DefaultComponent } from "./default";

@RouteConfig([
    { path: "/Views/Tests/Default", name: "Default", component: DefaultComponent, useAsDefault: true }
])
@Component({
    selector: "my-app",
    template: "<router-outlet></router-outlet>",
    directives: [CORE_DIRECTIVES,   FORM_DIRECTIVES,   ROUTER_DIRECTIVES]
})
export class AppComponent {
}
enableProdMode();
bootstrap(AppComponent, [   HTTP_PROVIDERS
    , ROUTER_PROVIDERS
    , CryptoProPlugin
    , DiadocService]);