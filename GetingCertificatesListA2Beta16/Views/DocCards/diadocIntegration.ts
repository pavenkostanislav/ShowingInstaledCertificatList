import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, AfterViewInit, ViewChildren, QueryList, SimpleChange } from 'angular2/core';
import { FORM_DIRECTIVES, ControlGroup, Control, Validator, Validators, FORM_PROVIDERS, FormBuilder } from 'angular2/common';
import { ROUTER_DIRECTIVES, RouteParams, Router } from 'angular2/router';
import { Subscription } from 'rxjs/Rx';

import { IMetaUser } from "shared/Services/metauser.service";

import { SubUser } from "shared/Components/subuser";
import { DocumentsListComponent } from 'shared/Components/Diadoc/documentsList';


@Component({
    selector: 'diadocIntegration',
    moduleId: 'a2/DocCards/diadocIntegration',
    templateUrl: './diadocIntegration.html',
    directives: [DocumentsListComponent, SubUser],
    
})
export class DiadocIntegrationComponent implements OnInit
{

    private currentUser: IMetaUser = {};

    constructor()
    { }

    ngOnInit() {
        //this.getCertificate();
    }

    getCertificate() {
        let isActiveXCapable = false;
        try {
            var crypt = new ActiveXObject("Diadoc.DiadocClient");
        }
        catch (e) {
            if (e.name == 'TypeError' || e.name == 'Error') {
                isActiveXCapable = true;
            }
        }

        //var customsDeclaration = new ActiveXObject("Diadoc.Api.CustomsDeclaration");
        
        //var diadoc = new ActiveXObject("Diadoc.Api.ComDiadocApi2");
        //diadoc.Initialize("pavenko_sv-9518812f-c6a1-4a4b-979a-857be09009ee", "https://diadoc-api.kontur.ru");

        //var certs = crypt.GetPersonalCertificates(true);
        var word = new ActiveXObject("Word.Application"); // запускает MS Word
        word.Documents.Open("Mydoc.doc"); // открывает документ
        word.ActiveDocument.SaveAs("Mydoc.txt", 4); // 4 = текстовый формат DOS
        word.Quit(); // завершает работу MS Word
    }

    onChangeCurrentUser(user)
    {
        this.currentUser = user;
    }
} 
