import {Injectable} from 'angular2/core';
import {Http} from 'angular2/http';


@Injectable()
export class FileUploadService {

    constructor(private http: Http) {}

    public uploadfile(url: string, filemodel: FileModel): Promise<any> {
        return new Promise((resolve, reject) => {
            //Оформление FormData
            let formData: FormData = new FormData();

            formData.append("description", filemodel.description);
            formData.append("metaObjectId", filemodel.metaObjectId);
            formData.append("objectId", filemodel.objectId);
            if (filemodel.file) {
                formData.append("file", filemodel.file, filemodel.file.name);
            }
            else {
                formData.append("file", null);
            }

            //Дёргаем сервис и смотрим ответ
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.onreadystatechange = () => {

                //Список состояний readyState такой:
                //0 - Unitialized
                //1 - Loading
                //2 - Loaded
                //3 - Interactive
                //4 - Complete

                if (xmlhttp.readyState === 4) {
                    if (xmlhttp.status === 200) {
                        resolve(xmlhttp.response);
                    } else {
                        reject(xmlhttp.response);
                    }
                }
            };
            xmlhttp.open("POST", url, true);
            xmlhttp.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xmlhttp.withCredentials = true;
            xmlhttp.send(formData);
        });
    }

    getXmlHttp() {
        var xmlhttp;
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        } catch (e) {
            try {
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (E) {
                xmlhttp = false;
            }
        }
        if (!xmlhttp && typeof XMLHttpRequest != "undefined") {
            xmlhttp = new XMLHttpRequest();
        }
        return xmlhttp;
    }
}


export class FileModel {
    file: File;
    description: string;
    metaObjectId: number;
    objectId: number;
}