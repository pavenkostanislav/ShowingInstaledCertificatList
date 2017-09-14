/// <reference path="../../../../node_modules/angular2/typings/browser.d.ts" />
import {bootstrap}    from 'angular2/platform/browser';
import {Component, ViewChild, enableProdMode} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES, FORM_PROVIDERS} from 'angular2/common';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';
import 'rxjs/Rx';

import { SelectService } from 'Services/select.service';
import { DiadocService } from 'Services/diadoc.service';

import { DiadocIntegrationComponent } from './diadocIntegration';

import {InitDateExt} from 'Controls/datetime';


@Component({
	selector: 'my-app',
	moduleId: 'Views/DocCardSteps/app/aboot',
	template: '<router-outlet></router-outlet>',
    directives: [ROUTER_DIRECTIVES],
	providers: [FORM_PROVIDERS],
})

    @RouteConfig([
        { path: '/Views/DocCards/Default', name: 'Diadoc', component: DiadocIntegrationComponent, useAsDefault: true }
])
export class AppComponent {
}

InitDateExt();
enableProdMode();
bootstrap(AppComponent, [HTTP_PROVIDERS, ROUTER_PROVIDERS, DiadocService, SelectService]);