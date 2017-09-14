"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("angular2/core");
var subuser_1 = require("Components/subuser");
var documentsList_1 = require("Components/documentsList");
var DefaultComponent = (function () {
    function DefaultComponent() {
        this.currentUser = {};
    }
    DefaultComponent.prototype.ngOnInit = function () {
        //this.getCertificate();
    };
    DefaultComponent.prototype.getCertificate = function () {
        var isActiveXCapable = false;
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
    };
    DefaultComponent.prototype.onChangeCurrentUser = function (user) {
        this.currentUser = user;
    };
    return DefaultComponent;
}());
DefaultComponent = __decorate([
    core_1.Component({
        selector: 'Default',
        moduleId: 'Views/DocList/Default',
        templateUrl: './default.html',
        directives: [documentsList_1.DocumentsListComponent, subuser_1.SubUser],
    })
], DefaultComponent);
exports.DefaultComponent = DefaultComponent;
