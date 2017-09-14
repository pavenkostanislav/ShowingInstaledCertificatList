"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("angular2/core");
require("rxjs/Rx");
var diadoc_service_1 = require("Services/diadoc.service");
var datetimepicker_1 = require("Controls/datetimepicker");
var shadowbox_1 = require("Controls/shadowbox");
var common_1 = require("common");
var selectA2_1 = require("Controls/selectA2");
var select2_1 = require("Controls/select2");
var dropdown_1 = require("Controls/dropdown/dropdown");
var paging_1 = require("Controls/paging");
var DocumentsListComponent = (function () {
    function DocumentsListComponent(diadocSrv) {
        this.diadocSrv = diadocSrv;
        //initcollection
        this.listDocCard = [];
        ///initcollection
        this.updated = new core_1.EventEmitter();
        this.findModel = new diadoc_service_1.FindModel();
        this.isEdit = false;
        this.responceModel = new diadoc_service_1.DiadocResponceModel();
        this.freeze = false;
        // пейджинг
        this.pageSize = 15;
        this.countButton = 10;
        this.countPage = 10;
        this.isSeachOpen = false;
    }
    DocumentsListComponent.prototype.ngOnChanges = function (changes) {
        var _this = this;
        //if (localStorage.getItem("DocumentsListComponent_LocalStorage")) {
        //    this.findModel = JSON.parse(localStorage.getItem("DocumentsListComponent_LocalStorage"));
        //}
        if (changes['contractorId'] || changes['docTypeId'] || changes['num'] || changes['date'] || changes['text'] || changes['userId'] || changes['docCardId']) {
            this.findModel.currentPage = 0;
            this.findModel.pageSize = 10;
            this.findModel.contractorId = this.contractorId;
            this.findModel.docTypeId = this.docTypeId;
            this.findModel.num = this.num;
            this.findModel.date = this.date;
            this.findModel.text = this.text;
            this.findModel.docCardId = this.docCardId;
            if (this.docCardId > 0) {
                this.diadocSrv.getListDocCard(this.docCardId)
                    .subscribe(function (data) {
                    _this.listDocCard = data;
                    _this.clearFind(true);
                }, function (error) { return common_1.ShowError(error); }, function () { });
            }
            else {
                this.doSeach();
            }
        }
    };
    DocumentsListComponent.prototype.docCardIdChange = function (evt) {
        if (evt) {
            this.responceModel.List.filter(function (m) { return m.docCardId == evt; }).forEach(function (currentValue, index, array) {
                currentValue.active = true;
            });
        }
    };
    DocumentsListComponent.prototype.loadMessage = function (messageId) {
        var _this = this;
        if (!confirm("Создать связи и указать главную (ключевую) карточку в СЭД!")) {
            return;
        }
        if (!messageId) {
            return;
        }
        this.freeze = true;
        this.isEdit = false;
        this.diadocSrv.loadListDocumentsMessage(this.userId, messageId).subscribe(function (result) {
            common_1.ShowComplete();
            _this.responceModel = result;
            _this.calculatePages();
            _this.freeze = false;
            _this.updated.emit('refresh');
        }, function (error) {
            console.log(error);
            _this.freeze = false;
        });
    };
    DocumentsListComponent.prototype.doSeach2 = function (field_name, field_value) {
        if (field_name === 'messageId') {
            this.findModel = new diadoc_service_1.FindModel();
            this.findModel.messageId = field_value;
        }
        if (field_name === 'counteragentBoxId')
            this.findModel.counteragentBoxId = field_value;
        if (field_name === 'contractorId')
            this.findModel.contractorId = field_value;
        if (field_name === 'text')
            this.findModel.text = field_value;
        if (field_name === 'docTypeId')
            this.findModel.docTypeId = field_value;
        this.doSeach();
    };
    DocumentsListComponent.prototype.doSeach = function () {
        var _this = this;
        this.freeze = true;
        if (!this.findModel.currentPage)
            this.findModel.currentPage = 0;
        this.findModel.pageSize = this.pageSize;
        //localStorage.setItem("DocumentsListComponent_LocalStorage", JSON.stringify(this.findModel));
        this.diadocSrv.getListDocuments(this.userId, this.findModel).subscribe(function (result) {
            _this.responceModel = result;
            _this.calculatePages();
        }, function (error) { return console.log(error); }, function () {
            _this.freeze = false;
        });
    };
    DocumentsListComponent.prototype.doSave = function () {
        var _this = this;
        this.freeze = true;
        this.isEdit = false;
        this.diadocSrv.setListDocuments(this.userId, this.responceModel.List).subscribe(function (result) {
            _this.doSeach();
            _this.freeze = false;
            common_1.ShowComplete();
            _this.updated.emit('refresh');
        }, function (error) {
            console.log(error);
            _this.freeze = false;
        });
    };
    DocumentsListComponent.prototype.doEdit = function () {
        var _this = this;
        this.isEdit = !this.isEdit;
        if (this.docCardId > 0) {
            this.diadocSrv.getListDocCard(this.docCardId)
                .subscribe(function (data) {
                _this.listDocCard = data;
            }, function (error) { return common_1.ShowError(error); }, function () { });
        }
    };
    DocumentsListComponent.prototype.showSeach = function () {
        this.isSeachOpen = !this.isSeachOpen;
    };
    DocumentsListComponent.prototype.clearFind = function (isDefault) {
        this.isEdit = false;
        this.findModel = new diadoc_service_1.FindModel();
        if (isDefault) {
            this.findModel.docCardId = this.docCardId;
        }
        this.findModel.currentPage = 0;
        this.findModel.pageSize = this.pageSize;
        //localStorage.setItem("DocumentsListComponent_LocalStorage", JSON.stringify(this.findModel));
        this.doSeach();
    };
    DocumentsListComponent.prototype.getRevocationStatus = function (value) {
        switch (value) {
            case 0: return 'неизвестный статус аннулирования документа; может выдаваться лишь в случае, когда клиент использует устаревшую версию SDK и не может интерпретировать статус аннулирования документа, переданный сервером';
            case 1: return 'документ не аннулирован, и не было предложений об аннулировании';
            case 2: return 'отправлено исходящее предложение об аннулировании документа';
            case 3: return 'получено входящее предложение об аннулировании документа';
            case 4: return 'документ аннулирован';
            case 5: return 'получен или отправлен отказ от предложения об аннулировании документа';
            default: return '';
        }
    };
    DocumentsListComponent.prototype.getDocumentType = function (value) {
        switch (value) {
            case 0: return 'неформализованный документ';
            case 11: return 'запрос на инициацию канала обмена документами через Диадок';
            case 12: return 'товарная накладная ТОРГ-12';
            case 13: return 'исправление счета-фактуры';
            case 14: return 'корректировочный счет-фактура';
            case 15: return 'исправление корректировочного счета-фактуры';
            case 16: return 'акт о выполении работ / оказании услуг';
            case 18: return 'счет на оплату';
            case 19: return 'товарная накладная ТОРГ-12 в XML-формате';
            case 20: return 'акт о выполении работ / оказании услуг в XML-формате';
            case 26: return 'ценовой лист';
            case 30: return 'протокол согласования цены';
            case 34: return 'реестр сертификатов';
            case 35: return 'акт сверки';
            case 36: return 'договор';
            case 37: return 'накладная ТОРГ-13';
            case 38: return 'детализация';
            case 40: return 'дополнительное соглашение к договору';
            case 41: return 'универсальный передаточный документ (УПД)';
            case 45: return 'исправление универсального передаточного документа';
            case 49: return 'универсальный корректировочный документ (УКД)';
            case 50: return 'исправление универсального корректировочного документа';
            default: return 'неизвестный тип документа; может выдаваться лишь в случае, когда клиент использует устаревшую версию SDK и не может интерпретировать тип документа, переданный сервером';
        }
    };
    DocumentsListComponent.prototype.getProxySignatureStatus = function (value) {
        switch (value) {
            case 0: return 'Reserved status to report to legacy clients for newly introduced statuses';
            case 1: return 'Подпись промежуточного получателя не требуется';
            case 2: return 'Ожидается подпись промежуточного получателя';
            case 3: return 'Подпись промежуточного получателя проверена и валидна';
            case 4: return 'Промежуточный получатель отказал в подписи';
            case 5: return 'Подпись промежуточного получателя проверена и невалидна';
            default: return '';
        }
    };
    DocumentsListComponent.prototype.getSenderSignatureStatus = function (value) {
        switch (value) {
            case 0: return 'Reserved status to report to legacy clients for newly introduced statuses';
            case 1: return 'Ожидается подпись отправителя';
            case 2: return 'Подпись отправителя еще не проверена';
            case 3: return 'Подпись отправителя проверена и валидна';
            case 4: return 'Подпись отправителя проверена и невалидна';
            default: return '';
        }
    };
    DocumentsListComponent.prototype.getResolutionStatusType = function (value) {
        switch (value) {
            case 0: return 'Документ не согласовывался';
            case 1: return 'Согласован';
            case 2: return 'В согласовании отказано';
            case 3: return 'Запрошено согласование';
            case 4: return 'Запрошена подпись';
            case 5: return 'В подписи отказано';
            default: return '';
        }
    };
    DocumentsListComponent.prototype.getStatus = function (documentType, status, documentStatus, revocationStatus) {
        if (revocationStatus == 1) {
            switch (documentType) {
                //Nonformalized
                case 0:
                //PriceListAgreement
                case 30:
                //CertificateRegistry
                case 34:
                //ServiceDetails
                case 38:
                //UniversalTransferDocument
                case 41:
                //UniversalTransferDocumentRevision
                case 45:
                //UniversalCorrectionDocument 
                case 49:
                //UniversalCorrectionDocumentRevision
                case 50:
                    {
                        switch (documentStatus) {
                            //UnknownDocumentStatus = 0;
                            case 0: {
                                return ''; //'неизвестное состояние документа';
                            }
                            //OutboundWaitingForSenderSignature = 1;
                            case 1: {
                                return 'Требуется подпись'; //'документ исходящий, документ не отправлен, поскольку не подписан отправителем';
                            }
                            //OutboundWaitingForInvoiceReceiptAndRecipientSignature = 2;
                            case 2: {
                                return 'Ожидается подпись'; //'документ исходящий, ожидается извещение о получении и подпись получателя';
                            }
                            //OutboundWaitingForInvoiceReceipt = 3; 
                            case 3: {
                                return 'Не получен'; //'документ исходящий, ожидается извещение о получении';
                            }
                            //OutboundWaitingForRecipientSignature = 4;
                            case 4: {
                                return 'Ожидается подпись'; //'документ исходящий, ответная подпись, либо отказ от ее формирования еще не получены';
                            }
                            //OutboundInvalidSenderSignature = 5;
                            case 5: {
                                return 'Получен'; //'документ исходящий, документ не отправлен, поскольку подпись отправителя не является корректной';
                            }
                            //InboundWaitingForInvoiceReceiptAndRecipientSignature = 6;
                            case 6: {
                                return 'Требуется подпись'; //'документ входящий, ожидается извещение о получении и подпись получателя';
                            }
                            //InboundWaitingForRecipientSignature = 7;
                            case 7: {
                                return 'Требуется подпись'; //'документ входящий, ответная подпись, либо отказ от ее формирования еще не отправлены';
                            }
                            //InboundWaitingForInvoiceReceipt = 8;
                            case 8: {
                                return 'Не просмотрен'; //'документ входящий, ожидается извещение о получении';
                            }
                            //InboundWithRecipientSignature = 9;
                            case 9: {
                                return 'Подписан'; //'документ входящий, ответная подпись поставлена)';
                            }
                            //InboundInvalidRecipientSignature = 10;
                            case 10: {
                                return 'Доставлен'; //'документ входящий, документооборот не завершен, поскольку подпись получателя не является корректной';
                            }
                            default: {
                                return '';
                            }
                        }
                    }
                //Invoice
                case 1:
                //InvoiceRevision
                case 13:
                //InvoiceRevision
                case 13:
                //InvoiceCorrection
                case 14:
                //InvoiceCorrectionRevision
                case 15: {
                    switch (status) {
                        //UnknownInvoiceStatus = 0;
                        case 0: {
                            return ''; //'Неизвестный статус';
                        }
                        //OutboundWaitingForInvoiceReceipt = 1;
                        case 1: {
                            return 'Не просмотрен'; //'СФ/ИСФ/КСФ/ИКСФ исходящий, ожидается извещение о получении СФ/ИСФ/КСФ/ИКСФ от покупателя';
                        }
                        //OutboundNotFinished = 2;
                        case 2: {
                            return 'Документооборот не завершен'; //'СФ/ИСФ/КСФ/ИКСФ исходящий, извещение о получении СФ/ИСФ/КСФ/ИКСФ от покупателя уже есть, но документооборот еще не завершен';
                        }
                        //OutboundFinished = 3;
                        case 3: {
                            return 'Документооборот завершен'; //'СФ/ИСФ/КСФ/ИКСФ исходящий, документооборот завершен';
                        }
                        //InboundNotFinished = 4;
                        case 4: {
                            return 'Документооборот не завершен'; //'СФ/ИСФ/КСФ/ИКСФ входящий, документооборот не завершен';
                        }
                        //InboundFinished = 5;
                        case 5: {
                            return 'Документооборот завершен'; //'СФ/ИСФ/КСФ/ИКСФ входящий, документооборот завершен';
                        }
                        //OutboundWaitingForSenderSignature = 6;
                        case 6: {
                            return 'Требуется подпись'; //'СФ/ИСФ/КСФ/ИКСФ исходящий, документ не отправлен, поскольку не подписан отправителем';
                        }
                        //OutboundInvalidSenderSignature = 7;
                        case 7: {
                            return 'Доставлен'; //'СФ/ИСФ/КСФ/ИКСФ исходящий, документ не отправлен, поскольку подпись отправителя не является корректной';
                        }
                        default: {
                            return '';
                        }
                    }
                }
                //ProformaInvoice
                case 18: {
                    switch (documentStatus) {
                        //UnknownUnilateralDocumentStatus = 0;
                        case 0: {
                            return ''; //'Неизвестное состояние';
                        }
                        //Outbound = 1;
                        case 1: {
                            return 'Исходящий'; //'документ исходящий';
                        }
                        //Inbound = 2;
                        case 2: {
                            return 'Входящий'; //'документ входящий';
                        }
                        //Internal = 3;
                        case 3: {
                            return 'Внутренний'; //'документ внутренний';
                        }
                        //OutboundWaitingForSenderSignature = 4;
                        case 4: {
                            return 'Требуется подпись'; //'документ исходящий, документ не отправлен, поскольку не подписан отправителем';
                        }
                        //OutboundInvalidSenderSignature = 5;
                        case 5: {
                            return 'Доставлен'; //'документ исходящий, документ не отправлен, поскольку подпись отправителя не является корректной';
                        }
                        //InternalWaitingForSenderSignature = 6;
                        case 6: {
                            return 'Требуется подпись'; //'документ внутренний, документ не отправлен, поскольку не подписан отправителем';
                        }
                        //InternalInvalidSenderSignature = 7;
                        case 7: {
                            return 'На согласовании'; //'документ внутренний, документ не отправлен, поскольку подпись отправителя не является корректной';
                        }
                        default: {
                            return '';
                        }
                    }
                }
                //AcceptanceCertificate
                case 16: {
                    switch (documentStatus) {
                        case 0:
                        case 1:
                        case 2:
                        case 3:
                        case 4:
                        case 5:
                        case 6:
                        case 7:
                        case 8:
                        case 9:
                        case 10:
                        case 11:
                        case 12:
                        case 13:
                        case 14:
                        case 15: {
                            return this.GetBilateralDocumentStatus(documentStatus);
                        }
                        //OutboundNoRecipientSignatureRequest = 16;
                        case 16: {
                            return 'Подпись не запрошена'; //'документ исходящий, ответная подпись не запрошена';
                        }
                        //InboundNoRecipientSignatureRequest = 17;
                        case 17: {
                            return 'Подпись не запрошена'; //'документ входящий, ответная подпись не запрошена';
                        }
                        //InternalNoRecipientSignatureRequest = 18;
                        case 18: {
                            return 'Подпись не запрошена'; //'документ внутренний, ответная подпись не запрошена';
                        }
                        default: {
                            return '';
                        }
                    }
                }
                //TrustConnectionRequest
                case 11: {
                    return this.GetBilateralDocumentStatus(status);
                }
                //Torg12
                case 12:
                //XmlTorg12
                case 19:
                //Torg13
                case 37:
                //SupplementaryAgreement
                case 40:
                //PriceList
                case 26:
                //XmlAcceptanceCertificate
                case 20:
                //Contract
                case 36:
                //ReconciliationAct
                case 35: {
                    return this.GetBilateralDocumentStatus(documentStatus);
                }
                //UnknownDocumentType
                default: {
                    return '';
                }
            }
        }
        else {
            return this.getRevocationStatus(revocationStatus);
        }
    };
    DocumentsListComponent.prototype.GetBilateralDocumentStatus = function (documentStatus) {
        switch (documentStatus) {
            //UnknownBilateralDocumentStatus = 0;
            case 0: {
                return ''; //'неизвестное состояние документа';
            }
            //OutboundWaitingForRecipientSignature = 1;
            case 1: {
                return 'Требуется подпись'; //'документ исходящий, ответная подпись, либо отказ от ее формирования еще не получены';
            }
            //OutboundWithRecipientSignature = 2;
            case 2: {
                return 'Подписан'; //'документ исходящий, ответная подпись получена';
            }
            //OutboundRecipientSignatureRequestRejected = 3;
            case 3: {
                return 'Получен отказ'; //'документ исходящий, получен отказ от формирования ответной подписи';
            }
            //InboundWaitingForRecipientSignature = 4;
            case 4: {
                return 'Требуется подпись'; //'документ входящий, ответная подпись, либо отказ от ее формирования еще не отправлены';
            }
            //InboundWithRecipientSignature = 5;
            case 5: {
                return 'Подписан'; //'документ входящий, ответная подпись поставлена)';
            }
            //InboundRecipientSignatureRequestRejected = 6;
            case 6: {
                return 'Отправлен отказ'; //'документ входящий, отправлен отказ от формирования ответной подписи';
            }
            //InternalWaitingForRecipientSignature = 7;
            case 7: {
                return 'Не отправлен'; //'документ внутренний, ответная подпись, либо отказ от ее формирования еще не отправлены';
            }
            //InternalWithRecipientSignature = 8;
            case 8: {
                return 'Подписан'; //'документ внутренний, ответная подпись поставлена';
            }
            //InternalRecipientSignatureRequestRejected = 9;
            case 9: {
                return 'Отправлен отказ'; //'документ внутренний, отправлен отказ от формирования ответной подписи';
            }
            //OutboundWaitingForSenderSignature = 10;
            case 10: {
                return 'Не подписан отправителем'; //'документ исходящий, документ не отправлен, поскольку не подписан отправителем';
            }
            //OutboundInvalidSenderSignature = 11;
            case 11: {
                return 'Доставлен'; //'документ исходящий, документ не отправлен, поскольку подпись отправителя не является корректной';
            }
            //InboundInvalidRecipientSignature = 12;
            case 12: {
                return 'Получен'; //'документ входящий, документооборот не завершен, поскольку подпись полуателя не является корректной';
            }
            //InternalWaitingForSenderSignature = 13;
            case 13: {
                return 'Не подписан отправителем'; //'документ внутренний, документ не отправлен, поскольку не подписан отправителем';
            }
            //InternalInvalidSenderSignature = 14;
            case 14: {
                return 'На согласовании'; //'документ внутренний, документ не отправлен, поскольку подпись отправителя не является корректной';
            }
            //InternalInvalidRecipientSignature = 15;
            case 15: {
                return 'На согласовании'; //'документ внутренний, документооборот не завершен, поскольку подпись получателя не является корректной';
            }
            default: {
                return '';
            }
        }
    };
    // пейджинг
    DocumentsListComponent.prototype.calculatePages = function () {
        if (!this.responceModel) {
            this.countPage = 0;
            this.findModel.currentPage = 0;
            return;
        }
        this.pageSize = this.findModel.pageSize;
        this.countPage = Math.ceil(this.responceModel.TotalRowCount / this.findModel.pageSize);
        this.findModel.currentPage = this.responceModel.CurrentPage;
    };
    DocumentsListComponent.prototype.selectPage = function (n) {
        if (this.findModel.currentPage === n) {
            return;
        }
        this.pageSize = this.findModel.pageSize;
        this.findModel.currentPage = n;
        //localStorage.setItem("DocumentsListComponent_LocalStorage", JSON.stringify(this.findModel));
        this.doSeach();
    };
    //Url
    DocumentsListComponent.prototype.getDocUrl = function (messageId, entityId) {
        var _this = this;
        if (messageId && entityId) {
            this.diadocSrv.getDocUrl(messageId, entityId).subscribe(function (result) {
                _this.freeze = false;
                window.location.assign(result);
            }, function (error) {
                console.log(error);
                _this.freeze = false;
            });
        }
    };
    //строки
    DocumentsListComponent.prototype.doNewDocCard = function (row) {
        var _this = this;
        if (!row && !row.messageId && !row.entityId) {
            return;
        }
        this.freeze = true;
        if (!confirm("Создать новую карточку в СЭД для выбранного документа из диадок?")) {
            this.freeze = false;
            return;
        }
        this.diadocSrv.loadDocument(this.userId, row.messageId, row.entityId).subscribe(function (result) {
            _this.doSeach();
            _this.freeze = false;
            common_1.ShowComplete();
            _this.updated.emit('refresh');
        }, function (error) {
            console.log(error);
            _this.freeze = false;
        });
    };
    DocumentsListComponent.prototype.doSaveDocCard = function (row) {
        var _this = this;
        if (!row) {
            return;
        }
        if (!this.docCardId) {
            return;
        }
        this.freeze = true;
        if (row.docCardId) {
            if (row.docCardId == this.docCardId) {
                if (!confirm("Удалить связь и отменить скачивание архива?")) {
                    this.freeze = false;
                    return;
                }
                row.docCardId = null;
                row.active = false;
            }
            else {
                if (!confirm("Перезаписать связь с документом и начать скачивание архива!")) {
                    this.freeze = false;
                    return;
                }
                row.docCardId = this.docCardId;
                row.active = true;
            }
        }
        else {
            if (!confirm("Связать документ?")) {
                this.freeze = false;
                return;
            }
            row.docCardId = this.docCardId;
            row.active = true;
        }
        this.diadocSrv.setDocuments(this.userId, row).subscribe(function (result) {
            _this.doSeach();
            _this.freeze = false;
            common_1.ShowComplete();
            _this.updated.emit('refresh');
        }, function (error) {
            console.log(error);
            _this.freeze = false;
        });
    };
    DocumentsListComponent.prototype.doSaveActive = function (row) {
        var _this = this;
        if (!row) {
            return;
        }
        if (!this.docCardId) {
            return;
        }
        this.freeze = true;
        if (!row.active) {
            if (!confirm("Начать скачивание архива?")) {
                this.freeze = false;
                return;
            }
        }
        else {
            if (!confirm("Запретить скачивание архива?")) {
                this.freeze = false;
                return;
            }
        }
        row.active = !row.active;
        this.diadocSrv.setDocuments(this.userId, row).subscribe(function (result) {
            _this.doSeach();
            _this.freeze = false;
            common_1.ShowComplete();
        }, function (error) {
            console.log(error);
            _this.freeze = false;
        });
    };
    return DocumentsListComponent;
}());
__decorate([
    core_1.Output()
], DocumentsListComponent.prototype, "updated", void 0);
__decorate([
    core_1.Input()
], DocumentsListComponent.prototype, "contractorId", void 0);
__decorate([
    core_1.Input()
], DocumentsListComponent.prototype, "docTypeId", void 0);
__decorate([
    core_1.Input()
], DocumentsListComponent.prototype, "num", void 0);
__decorate([
    core_1.Input()
], DocumentsListComponent.prototype, "date", void 0);
__decorate([
    core_1.Input()
], DocumentsListComponent.prototype, "text", void 0);
__decorate([
    core_1.Input()
], DocumentsListComponent.prototype, "docCardId", void 0);
__decorate([
    core_1.Input()
], DocumentsListComponent.prototype, "userId", void 0);
DocumentsListComponent = __decorate([
    core_1.Component({
        selector: 'documents-list',
        moduleId: 'a2/_Shared/Components/Diadoc/documentsList',
        templateUrl: './documentslist.html',
        styles: ['.panel-body {position: relative;}'],
        directives: [shadowbox_1.ShadowBox, selectA2_1.SelectA2, select2_1.Select2, datetimepicker_1.DateTimePicker, paging_1.Paging,
            dropdown_1.DropDownComponent,
            dropdown_1.DropdownValueAccessor]
    })
], DocumentsListComponent);
exports.DocumentsListComponent = DocumentsListComponent;
