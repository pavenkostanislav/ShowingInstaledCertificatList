import { Component, Input, OnChanges, SimpleChange, Output, EventEmitter } from 'angular2/core';
import "rxjs/Rx";

import { DiadocService, FindModel, DiadocResponceModel } from 'Services/diadoc.service';
import { DateTimePicker } from "Controls/datetimepicker";

import { ShadowBox } from 'Controls/shadowbox';
import { ShowError, ShowComplete } from 'common';
import { SelectA2 } from 'Controls/selectA2';
import { Select2 } from 'Controls/select2';
import { DropDownComponent, DropdownValueAccessor } from "Controls/dropdown/dropdown";
import { Paging } from 'Controls/paging';

@Component({
    selector: 'documents-list',
    moduleId: 'a2/_Shared/Components/Diadoc/documentsList',
    templateUrl: './documentslist.html',
    styles: ['.panel-body {position: relative;}'],
    directives: [ShadowBox, SelectA2, Select2, DateTimePicker, Paging
        , DropDownComponent
        , DropdownValueAccessor]
})
export class DocumentsListComponent implements OnChanges {
//initcollection

    private listDocCard: Array<any> = [];
///initcollection

    @Output() updated: EventEmitter<string> = new EventEmitter<string>();

    @Input() contractorId: number;
    @Input() docTypeId: number;
    @Input() num: string;
    @Input() date: string;
    @Input() text: string;
    @Input() docCardId: number;

    @Input() userId: number;

    private findModel: FindModel = new FindModel();

    private isEdit: boolean = false;

    private responceModel: DiadocResponceModel = new DiadocResponceModel();
    private freeze: boolean = false;


    // пейджинг
    pageSize = 15;
    countButton = 10;
    countPage = 10;

    constructor(private diadocSrv: DiadocService) {
    }

    ngOnChanges(changes: { [propName: string]: SimpleChange }) {
        //if (localStorage.getItem("DocumentsListComponent_LocalStorage")) {
        //    this.findModel = JSON.parse(localStorage.getItem("DocumentsListComponent_LocalStorage"));
        //}
        if (changes['contractorId'] || changes['docTypeId'] || changes['num'] || changes['date'] || changes['text'] || changes['userId'] || changes['docCardId'])
        {
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
                        .subscribe(
                        data => {
                            this.listDocCard = data;
                            this.clearFind(true);
                        },
                        error => ShowError(error),
                        () => { }
                        );
                } else {
                    this.doSeach();
                }
        }
    }

    docCardIdChange(evt) {
        if (evt) {
            this.responceModel.List.filter(m => m.docCardId == evt).forEach((currentValue, index, array) => {
                currentValue.active = true;
            });
        }
    }

    loadMessage(messageId: string) {


        if (!confirm("Создать связи и указать главную (ключевую) карточку в СЭД!")) {
            return;
        }

        if (!messageId) {
            return;
        }
        this.freeze = true;
        this.isEdit = false;
        this.diadocSrv.loadListDocumentsMessage(this.userId, messageId).subscribe(
            result => {
                ShowComplete();
                this.responceModel = result;
                this.calculatePages();
                this.freeze = false;
                this.updated.emit('refresh');
            },
            error => {
                console.log(error);
                this.freeze = false;
            });
    }

    doSeach2(field_name: string, field_value: object) {
        if (field_name === 'messageId') {
            this.findModel = new FindModel();
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
    }

    doSeach() {
        this.freeze = true;
        if(!this.findModel.currentPage)
            this.findModel.currentPage = 0;
        this.findModel.pageSize = this.pageSize;
        //localStorage.setItem("DocumentsListComponent_LocalStorage", JSON.stringify(this.findModel));

        this.diadocSrv.getListDocuments(this.userId, this.findModel).subscribe(
            result => {
                this.responceModel = result;
                this.calculatePages();
            },
            error => console.log(error)
            , () => {
                this.freeze = false
            });
    }

    doSave() {
        this.freeze = true;
        this.isEdit = false;
        this.diadocSrv.setListDocuments(this.userId, this.responceModel.List).subscribe(
            result => {
                this.doSeach();
                this.freeze = false;
                ShowComplete();
                this.updated.emit('refresh');
            },
            error => {
                console.log(error);
                this.freeze = false;
            });
    }

    doEdit() {
        this.isEdit = !this.isEdit;
        if (this.docCardId > 0) {
            this.diadocSrv.getListDocCard(this.docCardId)
                .subscribe(
                data => {
                    this.listDocCard = data;
                },
                error => ShowError(error),
                () => { }
                );
        }
    }

    isSeachOpen: boolean = false;

    showSeach() {
        this.isSeachOpen = !this.isSeachOpen;
    }
    
    clearFind(isDefault) {
        this.isEdit = false;
        this.findModel = new FindModel();
        if (isDefault) {
            this.findModel.docCardId = this.docCardId;
        }
        this.findModel.currentPage = 0;
        this.findModel.pageSize = this.pageSize;
        //localStorage.setItem("DocumentsListComponent_LocalStorage", JSON.stringify(this.findModel));
        this.doSeach();
    }

    getRevocationStatus(value: number) {
        switch (value){
            case 0: return 'неизвестный статус аннулирования документа; может выдаваться лишь в случае, когда клиент использует устаревшую версию SDK и не может интерпретировать статус аннулирования документа, переданный сервером';
            case 1: return 'документ не аннулирован, и не было предложений об аннулировании';
            case 2: return 'отправлено исходящее предложение об аннулировании документа';
            case 3: return 'получено входящее предложение об аннулировании документа';
            case 4: return 'документ аннулирован';
            case 5: return 'получен или отправлен отказ от предложения об аннулировании документа';
            default: return '';
        }
    }

    getDocumentType(value: number) {
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
    }

    getProxySignatureStatus(value: number) {
        switch (value) {
            case 0: return 'Reserved status to report to legacy clients for newly introduced statuses';
            case 1: return 'Подпись промежуточного получателя не требуется';
            case 2: return 'Ожидается подпись промежуточного получателя';
            case 3: return 'Подпись промежуточного получателя проверена и валидна';
            case 4: return 'Промежуточный получатель отказал в подписи';
            case 5: return 'Подпись промежуточного получателя проверена и невалидна';
            default: return '';
        }
    }

    getSenderSignatureStatus(value: number) {
        switch (value) {
            case 0: return 'Reserved status to report to legacy clients for newly introduced statuses';
            case 1: return 'Ожидается подпись отправителя';
            case 2: return 'Подпись отправителя еще не проверена';
            case 3: return 'Подпись отправителя проверена и валидна';
            case 4: return 'Подпись отправителя проверена и невалидна';
            default: return '';
        }
    }

    getResolutionStatusType(value: number) {
        switch (value) {
            case 0: return 'Документ не согласовывался';
            case 1: return 'Согласован';
            case 2: return 'В согласовании отказано';
            case 3: return 'Запрошено согласование';
            case 4: return 'Запрошена подпись';
            case 5: return 'В подписи отказано';
            default: return '';
        }
    }

    getStatus(documentType: number, status: number, documentStatus: number, revocationStatus: number) {
        if (revocationStatus == 1){
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
                                return '';//'неизвестное состояние документа';
                            }
                            //OutboundWaitingForSenderSignature = 1;
                            case 1: {
                                return 'Требуется подпись';//'документ исходящий, документ не отправлен, поскольку не подписан отправителем';
                            }
                            //OutboundWaitingForInvoiceReceiptAndRecipientSignature = 2;
                            case 2: {
                                return 'Ожидается подпись';//'документ исходящий, ожидается извещение о получении и подпись получателя';
                            }
                            //OutboundWaitingForInvoiceReceipt = 3; 
                            case 3: {
                                return 'Не получен';//'документ исходящий, ожидается извещение о получении';
                            }
                            //OutboundWaitingForRecipientSignature = 4;
                            case 4: {
                                return 'Ожидается подпись';//'документ исходящий, ответная подпись, либо отказ от ее формирования еще не получены';
                            }
                            //OutboundInvalidSenderSignature = 5;
                            case 5: {
                                return 'Получен';//'документ исходящий, документ не отправлен, поскольку подпись отправителя не является корректной';
                            }
                            //InboundWaitingForInvoiceReceiptAndRecipientSignature = 6;
                            case 6: {
                                return 'Требуется подпись';//'документ входящий, ожидается извещение о получении и подпись получателя';
                            }
                            //InboundWaitingForRecipientSignature = 7;
                            case 7: {
                                return 'Требуется подпись';//'документ входящий, ответная подпись, либо отказ от ее формирования еще не отправлены';
                            }
                            //InboundWaitingForInvoiceReceipt = 8;
                            case 8: {
                                return 'Не просмотрен';//'документ входящий, ожидается извещение о получении';
                            }
                            //InboundWithRecipientSignature = 9;
                            case 9: {
                                return 'Подписан';//'документ входящий, ответная подпись поставлена)';
                            }
                            //InboundInvalidRecipientSignature = 10;
                            case 10: {
                                return 'Доставлен';//'документ входящий, документооборот не завершен, поскольку подпись получателя не является корректной';
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
                            return '';//'Неизвестный статус';
                        }
                        //OutboundWaitingForInvoiceReceipt = 1;
                        case 1: {
                            return 'Не просмотрен';//'СФ/ИСФ/КСФ/ИКСФ исходящий, ожидается извещение о получении СФ/ИСФ/КСФ/ИКСФ от покупателя';
                        }
                        //OutboundNotFinished = 2;
                        case 2: {
                            return 'Документооборот не завершен';//'СФ/ИСФ/КСФ/ИКСФ исходящий, извещение о получении СФ/ИСФ/КСФ/ИКСФ от покупателя уже есть, но документооборот еще не завершен';
                        }
                        //OutboundFinished = 3;
                        case 3: {
                            return 'Документооборот завершен';//'СФ/ИСФ/КСФ/ИКСФ исходящий, документооборот завершен';
                        }
                        //InboundNotFinished = 4;
                        case 4: {
                            return 'Документооборот не завершен';//'СФ/ИСФ/КСФ/ИКСФ входящий, документооборот не завершен';
                        }
                        //InboundFinished = 5;
                        case 5: {
                            return 'Документооборот завершен';//'СФ/ИСФ/КСФ/ИКСФ входящий, документооборот завершен';
                        }
                        //OutboundWaitingForSenderSignature = 6;
                        case 6: {
                            return 'Требуется подпись';//'СФ/ИСФ/КСФ/ИКСФ исходящий, документ не отправлен, поскольку не подписан отправителем';
                        }
                        //OutboundInvalidSenderSignature = 7;
                        case 7: {
                            return 'Доставлен';//'СФ/ИСФ/КСФ/ИКСФ исходящий, документ не отправлен, поскольку подпись отправителя не является корректной';
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
                            return '';//'Неизвестное состояние';
                        }
                        //Outbound = 1;
                        case 1: {
                            return 'Исходящий';//'документ исходящий';
                        }
                        //Inbound = 2;
                        case 2: {
                            return 'Входящий';//'документ входящий';
                        }
                        //Internal = 3;
                        case 3: {
                            return 'Внутренний';//'документ внутренний';
                        }
                        //OutboundWaitingForSenderSignature = 4;
                        case 4: {
                            return 'Требуется подпись';//'документ исходящий, документ не отправлен, поскольку не подписан отправителем';
                        }
                        //OutboundInvalidSenderSignature = 5;
                        case 5: {
                            return 'Доставлен';//'документ исходящий, документ не отправлен, поскольку подпись отправителя не является корректной';
                        }
                        //InternalWaitingForSenderSignature = 6;
                        case 6: {
                            return 'Требуется подпись';//'документ внутренний, документ не отправлен, поскольку не подписан отправителем';
                        }
                        //InternalInvalidSenderSignature = 7;
                        case 7: {
                            return 'На согласовании';//'документ внутренний, документ не отправлен, поскольку подпись отправителя не является корректной';
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
                            return 'Подпись не запрошена';//'документ исходящий, ответная подпись не запрошена';
                        }
                        //InboundNoRecipientSignatureRequest = 17;
                        case 17: {
                            return 'Подпись не запрошена';//'документ входящий, ответная подпись не запрошена';
                        }
                        //InternalNoRecipientSignatureRequest = 18;
                        case 18: {
                            return 'Подпись не запрошена';//'документ внутренний, ответная подпись не запрошена';
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
        } else {
            return this.getRevocationStatus(revocationStatus);
        }
    }

    GetBilateralDocumentStatus(documentStatus: number)
    {
        switch (documentStatus) {
            //UnknownBilateralDocumentStatus = 0;
            case 0: {
                return '';//'неизвестное состояние документа';
            }
            //OutboundWaitingForRecipientSignature = 1;
            case 1: {
                return 'Требуется подпись';//'документ исходящий, ответная подпись, либо отказ от ее формирования еще не получены';
            }
            //OutboundWithRecipientSignature = 2;
            case 2: {
                return 'Подписан';//'документ исходящий, ответная подпись получена';
            }
            //OutboundRecipientSignatureRequestRejected = 3;
            case 3: {
                return 'Получен отказ';//'документ исходящий, получен отказ от формирования ответной подписи';
            }
            //InboundWaitingForRecipientSignature = 4;
            case 4: {
                return 'Требуется подпись';//'документ входящий, ответная подпись, либо отказ от ее формирования еще не отправлены';
            }
            //InboundWithRecipientSignature = 5;
            case 5: {
                return 'Подписан';//'документ входящий, ответная подпись поставлена)';
            }
            //InboundRecipientSignatureRequestRejected = 6;
            case 6: {
                return 'Отправлен отказ';//'документ входящий, отправлен отказ от формирования ответной подписи';
            }
            //InternalWaitingForRecipientSignature = 7;
            case 7: {
                return 'Не отправлен';//'документ внутренний, ответная подпись, либо отказ от ее формирования еще не отправлены';
            }
            //InternalWithRecipientSignature = 8;
            case 8: {
                return 'Подписан';//'документ внутренний, ответная подпись поставлена';
            }
            //InternalRecipientSignatureRequestRejected = 9;
            case 9: {
                return 'Отправлен отказ';//'документ внутренний, отправлен отказ от формирования ответной подписи';
            }
            //OutboundWaitingForSenderSignature = 10;
            case 10: {
                return 'Не подписан отправителем';//'документ исходящий, документ не отправлен, поскольку не подписан отправителем';
            }
            //OutboundInvalidSenderSignature = 11;
            case 11: {
                return 'Доставлен';//'документ исходящий, документ не отправлен, поскольку подпись отправителя не является корректной';
            }
            //InboundInvalidRecipientSignature = 12;
            case 12: {
                return 'Получен';//'документ входящий, документооборот не завершен, поскольку подпись полуателя не является корректной';
            }
            //InternalWaitingForSenderSignature = 13;
            case 13: {
                return 'Не подписан отправителем';//'документ внутренний, документ не отправлен, поскольку не подписан отправителем';
            }
            //InternalInvalidSenderSignature = 14;
            case 14: {
                return 'На согласовании';//'документ внутренний, документ не отправлен, поскольку подпись отправителя не является корректной';
            }
            //InternalInvalidRecipientSignature = 15;
            case 15: {
                return 'На согласовании';//'документ внутренний, документооборот не завершен, поскольку подпись получателя не является корректной';
            }
            default: {
                return '';
            }
        }
    }

    // пейджинг
    calculatePages() {

        if (!this.responceModel) {
            this.countPage = 0;
            this.findModel.currentPage = 0;
            return;
        }

        this.pageSize = this.findModel.pageSize;
        this.countPage = Math.ceil(this.responceModel.TotalRowCount / this.findModel.pageSize);
        this.findModel.currentPage = this.responceModel.CurrentPage;
    }

    selectPage(n: number) {

        if (this.findModel.currentPage === n) {
            return;
        }
        
        this.pageSize = this.findModel.pageSize;
        this.findModel.currentPage = n;
        
        //localStorage.setItem("DocumentsListComponent_LocalStorage", JSON.stringify(this.findModel));
        this.doSeach();
    }


    //Url
    getDocUrl(messageId: string, entityId: string) {
        if (messageId && entityId) {
            this.diadocSrv.getDocUrl(messageId, entityId).subscribe(
                result => {
                    this.freeze = false;
                    window.location.assign(result);
                },
                error => {
                    console.log(error);
                    this.freeze = false;
                });
        }
    }

    //строки


    doNewDocCard(row: any) {
        if (!row && !row.messageId && !row.entityId) { return; }
        this.freeze = true;

        if (!confirm("Создать новую карточку в СЭД для выбранного документа из диадок?")) { this.freeze = false; return; }

        this.diadocSrv.loadDocument(this.userId, row.messageId, row.entityId).subscribe(
            result => {
                this.doSeach();
                this.freeze = false;
                ShowComplete();
                this.updated.emit('refresh');
            },
            error => {
                console.log(error);
                this.freeze = false;
            });
    }

    doSaveDocCard(row: any) {
        if (!row) { return; }
        if (!this.docCardId) { return; }

        this.freeze = true;

        if (row.docCardId) {
            if (row.docCardId == this.docCardId) {
                if (!confirm("Удалить связь и отменить скачивание архива?")) { this.freeze = false; return; }
                row.docCardId = null;
                row.active = false;
            } else {
                if (!confirm("Перезаписать связь с документом и начать скачивание архива!")) { this.freeze = false; return; }
                row.docCardId = this.docCardId;
                row.active = true;
            }
        } else {
            if (!confirm("Связать документ?")) { this.freeze = false; return; }
            row.docCardId = this.docCardId;
            row.active = true;
        }

        this.diadocSrv.setDocuments(this.userId, row).subscribe(
            result => {
                this.doSeach();
                this.freeze = false;
                ShowComplete();
                this.updated.emit('refresh');
            },
            error => {
                console.log(error);
                this.freeze = false;
            });
    }

    doSaveActive(row: any) {
        if (!row) { return; }
        if (!this.docCardId) { return; }

        this.freeze = true;
        if (!row.active) {
            if (!confirm("Начать скачивание архива?")) { this.freeze = false; return; }
        } else {
            if (!confirm("Запретить скачивание архива?")) { this.freeze = false; return; }
        }
        row.active = !row.active;

        this.diadocSrv.setDocuments(this.userId, row).subscribe(
            result => {
                this.doSeach();
                this.freeze = false;
                ShowComplete();
            },
            error => {
                console.log(error);
                this.freeze = false;
            });
    }
}
}