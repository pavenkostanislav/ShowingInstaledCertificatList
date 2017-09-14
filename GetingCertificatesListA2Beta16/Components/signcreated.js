"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("angular2/core");
var shadowbox_1 = require("Controls/shadowbox");
var common_1 = require("common");
var fileupload_service_1 = require("Services/fileupload.service");
var cryptopro_plugin_1 = require("Plugins/cryptopro.plugin");
var SignCreatedComponent = (function () {
    function SignCreatedComponent(zone, fileSrv, crypto) {
        if (crypto === void 0) { crypto = new cryptopro_plugin_1.CryptoProPlugin(); }
        this.zone = zone;
        this.fileSrv = fileSrv;
        this.crypto = crypto;
        this.fileDocument = [];
        this.isfileLoadVisible = true;
        this.updated = new core_1.EventEmitter();
        this.certslist = [];
        this.fileSign = [];
        /*
            CADESCOM_CADES_BES  (Тип подписи CAdES BES) = 1
            CADESCOM_CADES_DEFAULT  (Тип подписи по умолчанию (CAdES-X Long Type 1)) = 0
            CADESCOM_CADES_T    (Тип подписи CAdES T) = 0x05
            CADESCOM_CADES_X_LONG_TYPE_1    (Тип подписи CAdES-X Long Type 1) = 0x5D
        */
        this.cadesTypeSelected = 0;
        this.cadesTypelist = [];
        this.isbDetached = true;
        /*
            *если тестовый личный сертификат выпускали здесь https://www.cryptopro.ru/ui/ то используйте стенд http://www.cryptopro.ru/tsp/tsp.srf
            *если тестовый личный сертификат выпускали здесь https://www.cryptopro.ru/certsrv/ используйте стенд http://testca.cryptopro.ru/tsp/tsp.srf
        */
        this.tspServiceSelected = 'http://testca.cryptopro.ru/tsp/tsp.srf';
        this.tsplist = [];
        this.freeze = false;
    }
    SignCreatedComponent.prototype.ngOnInit = function () {
        this.cadesTypelist.push({ id: 0, name: "Default" });
        this.cadesTypelist.push({ id: 1, name: "CAdES BES" });
        this.cadesTypelist.push({ id: 5, name: "CAdES T" });
        this.cadesTypelist.push({ id: 93, name: "CAdES-XLT1" });
        this.tsplist = [];
        this.tsplist.push({ id: 'http://www.cryptopro.ru/tsp/tsp.srf', name: "https://www.cryptopro.ru/ui/" });
        this.tsplist.push({ id: 'http://testca.cryptopro.ru/tsp/tsp.srf', name: "https://www.cryptopro.ru/certsrv/" });
        this.tsplist.push({ id: 'http://pki.skbkontur.ru/tsp/tsp.srf', name: "УЦ ЗАО ПФ СКБ Контур:" });
    };
    SignCreatedComponent.prototype.ngOnChanges = function (changes) {
        if (changes['fileDocument']) {
            this.isfileLoadVisible = false;
            this.refreshList();
        }
    };
    SignCreatedComponent.prototype.refreshList = function () {
        var _this = this;
        this.freeze = true;
        this.crypto.then(function () {
            _this.crypto.getCertList().then(function (res) {
                _this.zone.run(function () {
                    _this.certslist = res;
                    _this.freeze = false;
                    _this.updated.emit('refresh');
                });
            }, function (error) {
                _this.freeze = false;
                common_1.ShowError(error);
            });
        }, function (error) {
            _this.freeze = false;
            common_1.ShowError(error);
        });
    };
    SignCreatedComponent.prototype.fileChangeEvent = function (fileInput) {
        var _this = this;
        this.fileDocument.description = fileInput.target.files[0].name;
        this.fileDocument.metaObjectId = 716;
        this.fileDocument.objectId = this.docCardId;
        this.refreshList();
        var selectedFile = fileInput.target.files;
        if (selectedFile.length > 0) {
            var fileToLoad = selectedFile[0];
            var oFReader_1 = new FileReader();
            if (typeof (oFReader_1.readAsDataURL) != "function") {
                common_1.ShowError("Method readAsDataURL() is not supported in FileReader.");
                return;
            }
            oFReader_1.onloadend = function (e) {
                var header = ";base64,";
                var sFileData = oFReader_1.result;
                _this.fileDocument.file = sFileData.substr(sFileData.indexOf(header) + header.length);
                _this.updated.emit('fileload');
            };
            oFReader_1.readAsDataURL(fileToLoad);
            if (!this.certslist)
                this.refreshList();
        }
    };
    SignCreatedComponent.prototype.signCreated = function () {
        var _this = this;
        this.freeze = true;
        return this.crypto.signature(this.selected.thumbprint, this.fileDocument.file, this.cadesTypeSelected, this.isbDetached, this.tspServiceSelected)
            .then(function (res) {
            _this.updated.emit('signcreated');
            var blob = _this.newBlobFromBase64(res, 'application/pkcs7-signature');
            if (blob) {
                _this.uploadfile(blob);
                _this.downloadfile(blob, _this.fileDocument.description + ".p7s");
            }
            _this.freeze = false;
        }, function (error) {
            _this.freeze = false;
            common_1.ShowError(error);
        });
    };
    SignCreatedComponent.prototype.newBlobFromBase64 = function (b64Data, contentType) {
        if (b64Data) {
            var byteNumbers = new Array(b64Data.length);
            for (var i = 0; i < b64Data.length; i++)
                byteNumbers[i] = b64Data.charCodeAt(i);
            var byteArray = new Uint8Array(byteNumbers);
            return new Blob([byteArray], { type: contentType });
        }
        return null;
    };
    SignCreatedComponent.prototype.downloadfile = function (blob, fileName) {
        var url = window.URL.createObjectURL(blob);
        if (window.navigator.msSaveBlob) {
            window.navigator.msSaveOrOpenBlob(blob, fileName);
        }
        else {
            var link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
        this.updated.emit('filedownload');
    };
    SignCreatedComponent.prototype.uploadfile = function (_file) {
        if (!this.fileDocument.objectId && !this.docCardId) {
            common_1.ShowError("Данные НЕ сохранены! Нет привязки к карточки!");
        }
        else {
            var contentType = 'application/pkcs7-signature';
            this.fileSign = new fileupload_service_1.FileModel();
            this.fileSign.description = this.fileDocument.description + '.p7s';
            this.fileSign.metaObjectId = this.fileDocument.metaObjectId ? this.fileDocument.metaObjectId : 716;
            this.fileSign.objectId = this.fileDocument.objectId ? this.fileDocument.objectId : this.docCardId;
            this.fileSign.file = _file;
            this.fileSign.file.name = this.fileSign.description;
            this.fileSrv.uploadfile("api/cryptopro/uploadsignedfile", this.fileSign);
            this.updated.emit('fileupload');
        }
    };
    SignCreatedComponent.prototype.onClickRefreshList = function () {
        this.refreshList();
    };
    SignCreatedComponent.prototype.onClickShowModal = function (id) {
        common_1.ShowModal(id);
    };
    SignCreatedComponent.prototype.onClickSignCreated = function () {
        this.signCreated();
    };
    SignCreatedComponent.prototype.onSelected = function (row) {
        if (this.selected !== row) {
            this.selected = row;
        }
    };
    return SignCreatedComponent;
}());
__decorate([
    core_1.Input()
], SignCreatedComponent.prototype, "userId", void 0);
__decorate([
    core_1.Input()
], SignCreatedComponent.prototype, "docCardId", void 0);
__decorate([
    core_1.Input()
], SignCreatedComponent.prototype, "fileDocument", void 0);
__decorate([
    core_1.Output()
], SignCreatedComponent.prototype, "updated", void 0);
SignCreatedComponent = __decorate([
    core_1.Component({
        selector: 'signcreated',
        moduleId: "Components/signcreated",
        templateUrl: "./signcreated.html",
        directives: [shadowbox_1.ShadowBox],
        providers: [fileupload_service_1.FileUploadService, cryptopro_plugin_1.CryptoProPlugin]
    })
], SignCreatedComponent);
exports.SignCreatedComponent = SignCreatedComponent;
