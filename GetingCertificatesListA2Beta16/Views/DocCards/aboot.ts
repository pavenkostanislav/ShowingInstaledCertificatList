/// <reference path="../../../../node_modules/angular2/typings/browser.d.ts" />
import {bootstrap}    from 'angular2/platform/browser';
import {Component, ViewChild, enableProdMode} from 'angular2/core';
import {CORE_DIRECTIVES, FORM_DIRECTIVES, FORM_PROVIDERS} from 'angular2/common';
import {RouteConfig, ROUTER_DIRECTIVES, ROUTER_PROVIDERS} from 'angular2/router';
import {HTTP_PROVIDERS} from 'angular2/http';

import {DocService} from		'shared/Services/doc.service';
import {AttachmentService} from 'shared/Services/attachment.service';
import {MetaUserService} from	'shared/Services/metauser.service';
import {DocTypeService} from	'shared/Services/doctype.service';
import { SelectService } from 'shared/Services/select.service';
import { DiadocService } from 'shared/Services/diadoc.service';
import {DocPropertyService} from 'shared/Services/docproperty.service';
import {MetaObjectService} from 'shared/Services/metaobject.service';
import {TaskService} from 'shared/Services/task.service';

import {DefaultComponent} from './default';
import { EditComponent } from './edit';
import { DiadocIntegrationComponent } from './diadocIntegration';
import {SearchComponent} from './search';
import {AttachSearchComponent} from './attachsearch';

//import {Select2} from '/a2/_Shared/Controls/select2';
//import {ITreeNode} from '/a2/_Shared/Controls/treeview';

//import {DocTreeComponent} from './doctree';
//import {DocCardListComponent} from './doclist';
import 'rxjs/Rx';

import {InitDateExt} from 'shared/datetime';


@Component({
	selector: 'my-app',
	moduleId: 'Views/DocCardSteps/app/aboot',
	template: '<router-outlet></router-outlet>',
    directives: [ROUTER_DIRECTIVES],
	providers: [FORM_PROVIDERS],
})

    @RouteConfig([
        { path: '/Views/DocCardSteps/Default2/DiadocIntegration', name: 'Diadoc', component: DiadocIntegrationComponent, useAsDefault: false },
		{ path: '/Views/DocCardSteps/Default2', name: 'Default', component: DefaultComponent, useAsDefault: true },
		{ path: '/Views/DocCardSteps/Default2/Edit/:id', name: 'Edit', component: EditComponent },
		{ path: '/Views/DocCardSteps/Default2/Edit/:id/:mode', name: 'New', component: EditComponent },
		{ path: '/Views/DocCardSteps/Default2/Search', name: 'Search', component: SearchComponent },
		{ path: '/Views/DocCardSteps/Default2/AttachSearch', name: 'AttachSearch', component: AttachSearchComponent }
])
export class AppComponent {

}

InitDateExt();
enableProdMode();
bootstrap(AppComponent, [HTTP_PROVIDERS, ROUTER_PROVIDERS,
	DocService,
    DocTypeService,
    DiadocService,
	AttachmentService,
	MetaUserService,
	MetaObjectService,
	SelectService,
	DocPropertyService,
	TaskService]);