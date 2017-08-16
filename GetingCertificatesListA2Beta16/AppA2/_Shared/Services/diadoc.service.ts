import { Injectable} from 'angular2/core';
import { Http, Headers, RequestOptions, Request, RequestMethod } from 'angular2/http';
import { Observable } from 'rxjs/Rx';
import 'Scripts/angular2/base64.js';

@Injectable()
export class DiadocService {

    constructor(private http: Http) {
    }

    public getDDAuthToken(ddauth_api_client_id: string, signature: string) {
    /*
        let body: any = Base64.decode(signature);

        Base64.decode('ZGFua29nYWk=');  // dankogai
            Base64.decode('5bCP6aO85by+');  // 小飼弾
            Base64.decode('5bCP6aO85by-');  // 小飼弾

            Base64.encode('dankogai');  // ZGFua29nYWk=
            Base64.encode('小飼弾');    // 5bCP6aO85by+
            Base64.encodeURI('小飼弾'); // 5bCP6aO85by-
     */
        let body = signature;

        let headers = new Headers();
        headers.append("Host", 'https://diadoc-api.kontur.ru HTTP/ 1.1');
        headers.append("Content-Length", '1252');
        headers.append("Connection", 'Keep-Alive');
        headers.append("Authorization", `DiadocAuth ddauth_api_client_id=${ddauth_api_client_id}`);
        headers.append("Content-Type", 'application/json charset=utf-8');
        headers.append("Accept", 'application/json');

        const requestoptions  = new RequestOptions({
            method: RequestMethod.Post,
            headers: headers,
            body: body,
            url: 'https://diadoc-api.kontur.ru/Authenticate'
        });

        const req = new Request(requestoptions);
        console.log('req.method:', RequestMethod[req.method]);
        console.log('requestoptions.url:', requestoptions.url);

        return this.http.request(requestoptions.url, req).map(res => res.json());
    }


}