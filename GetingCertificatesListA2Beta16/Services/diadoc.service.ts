import { Injectable} from 'angular2/core';
import { Http, Headers, RequestOptions, Request, RequestMethod, Blob, BlobPropertyBag } from 'angular2/http';
import { Observable } from 'rxjs/Rx';
import 'Scripts/angular2/base64.js';
@Injectable()
export class DiadocService {

    constructor(private http: Http) {
    }

    public getListDocuments(userid: number, findModel: any): Observable<DiadocResponceModel> {
        var dateb = '';
        if (findModel.dateB) {
            if (typeof (findModel.dateB) === 'string') {
                dateb = findModel.dateB;
            }
        }

        var datee = '';
        if (findModel.dateE) {
            if (typeof (findModel.dateE) === 'string') {
                datee = findModel.dateE;
            }
        }
        let body = JSON.stringify(findModel);
        let headers = new Headers({ 'Content-Type': "application/json" });
        return this.http.post(`/api/diadoc/documents/list/get?userId=${userid}&dateb=${dateb}&datee=${datee}&currentPage=${findModel.currentPage}&pageSize=${findModel.pageSize}`, body, { headers: headers }).map(res => res.json());
    }

    public loadListDocumentsMessage(userid: number, messageId: string) {
        return this.http.get(`api/diadoc/documents/list/load/${messageId}?userId=${userid}`).map((res) => res.json());
    }

    public loadDocument(userid: number, messageId: string, entityId: string) {
        return this.http.get(`api/diadoc/document/load/${messageId}/${entityId}?userId=${userid}`).map((res) => res.json());
    }

    public getDocUrl(messageId: string, entityId: string) {
        return this.http.get(`api/diadoc/document/get/url/${messageId}/${entityId}`).map((res) => res.json());
    }

    public getDocUrl2(docId: number) {
        return this.http.get(`api/diadoc/document/get/url/${docId}`).map((res) => res.json());
    }

    public setListDocuments(userid: number, model: any) {
        let body = JSON.stringify(model);
        let headers = new Headers({ 'Content-Type': "application/json" });
        return this.http.post(`/api/diadoc/documents/list/set?userId=${userid}`, body, { headers: headers }).map(res => res.json());
    }

    public setDocuments(userid: number, model: any) {
        let body = JSON.stringify(model);
        let headers = new Headers({ 'Content-Type': "application/json" });
        return this.http.post(`/api/diadoc/documents/set?userId=${userid}`, body, { headers: headers }).map(res => res.json());
    }

    public getListDocCard(docId: number) {
        return this.http.get(`/api/docs/id/${docId}`).map(res => res.json());
    }

    public getDDAuthToken(cert: any) {
    /*
        let body: any = Base64.decode(signature);

        Base64.decode('ZGFua29nYWk=');  // dankogai
            Base64.decode('5bCP6aO85by+');  // 小飼弾
            Base64.decode('5bCP6aO85by-');  // 小飼弾

            Base64.encode('dankogai');  // ZGFua29nYWk=
            Base64.encode('小飼弾');    // 5bCP6aO85by+
            Base64.encodeURI('小飼弾'); // 5bCP6aO85by-
     */
        let body = JSON.stringify(cert);

        let headers = new Headers();
        //headers.append("Access-Control-Expose-Headers", 'Authentication');
        //headers.append('Origin', 'localhost');
        //headers.append("Host", 'diadoc-api.kontur.ru');
        //headers.append("Content-Length", '1252');
        //headers.append("Connection", 'keep-alive');
        //headers.append("Accept", 'application/json');
        //headers.append("Authorization", `DiadocAuth ddauth_api_client_id=${ddauth_api_client_id}`);
        headers.append("Content-Type", 'application/json');

        //const requestoptions  = new RequestOptions({
        //    method: RequestMethod.Post,
        //    headers: headers,
        //    body: body
        //});
        //console.log('RequestOptions:', requestoptions);
        return this.http.post('api/diadoc/Authenticate', body, { headers: headers }).map(res => res.json());
    }
    public blobPDF(base64: string): any {
        //base64 = 'data:application/pkcs7-signature;base64,' + base64;
        let byteCharacters = window.atob(base64);
        let byteNumbers = new Array(base64.length);
        for (var i = 0; i < byteCharacters.length; i++)
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        let byteArray = new Uint8Array(byteNumbers);
        
        let blob = new Blob([byteArray], {
            type: 'application/pkcs7-signature',
            endings: 'native' });
        console.log(blob.size);

        return blob;
    }

}

export class FindModel {
    contractorId: number;
    counteragentBoxId: string;
    docTypeId: number;
    num: string;
    date: string;
    text: string;
    messageId: string;
    docCardId: number;
    dateB: string;
    dateE: string;
    currentPage: number;
    pageSize: number;
}
export class DiadocResponceModel {
    totalRowCount: number;
    currentPage: number;
    list: any[];
}