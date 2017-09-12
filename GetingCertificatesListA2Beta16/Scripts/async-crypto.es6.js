var CAPICOM_CURRENT_USER_STORE = 2;

var CAPICOM_MY_STORE = "My";

var CAPICOM_STORE_OPEN_READ_ONLY = 0;
var CAPICOM_STORE_OPEN_READ_WRITE = 1;
var CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED = 2;

var CAPICOM_CERTIFICATE_FIND_SUBJECT_NAME = 1;
var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
var CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN = 1;

var CADESCOM_CADES_X_LONG_TYPE_1 = 5; 
var CADESCOM_CADES_BES = 1;

var CADESCOM_ENCODE_BASE64 = 0;

//Задание кодировки подписываемых данных
var CADESCOM_STRING_TO_UCS2LE = 0; //Данные будут перекодированы в UCS-2 little endian.
var CADESCOM_BASE64_TO_BINARY = 1; //Данные будут перекодированы из Base64 в бинарный массив.

function GetErrorMessage(e) {
    let err = e.message;
    if (!err) {
        err = e;
    } else if (e.number) {
        err += " (" + e.number + ")";
    }
    return err;
}

function SignCreate(thumbprint, dataToSign, cadesTypeSelected, isbDetached, tspService) {
    return new Promise(function(resolve, reject){
        cadesplugin.async_spawn(function *(args) {
            try {    
                let oStore = yield cadesplugin.CreateObjectAsync("CAPICOM.Store");
                yield oStore.Open(CAPICOM_CURRENT_USER_STORE, CAPICOM_MY_STORE,CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);
                
                let CertificatesObj = yield oStore.Certificates;
                let oCertificates = yield CertificatesObj.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint);
                
                let Count = yield oCertificates.Count;
                let oCertificate = yield oCertificates.Item(1);
                let oSigner = yield cadesplugin.CreateObjectAsync("CAdESCOM.CPSigner");
                yield oSigner.propset_Certificate(oCertificate);
                yield oSigner.propset_Options(CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN);
                if(cadesTypeSelected != 1){
                    yield oSigner.propset_TSAAddress(tspService);
                }
                let oSignedData = yield cadesplugin.CreateObjectAsync("CAdESCOM.CadesSignedData");
                yield oSignedData.propset_ContentEncoding(CADESCOM_BASE64_TO_BINARY);
                yield oSignedData.propset_Content(dataToSign);

                let sSignedMessage = yield oSignedData.SignCades(oSigner, cadesTypeSelected, isbDetached);
                
                yield oSignedData.VerifyCades(sSignedMessage, cadesTypeSelected, isbDetached);

                yield oStore.Close();
                args[2](sSignedMessage);
                return true;

                resolve(true);

            } catch (err) {
                alert(err.message);
                reject(err);
            }
        }, thumbprint, dataToSign, resolve, reject);
    });
}

/**
 * Формирование строчки сертификата
 */
function CertificateAdjuster() {

    this.extract = function(from, what) {
        certName = "";

        let begin = from.indexOf(what);

        if(begin>=0)
        {
            let end = from.indexOf(', ', begin);
            certName = (end<0) ? from.substr(begin) : from.substr(begin, end - begin);
        }

        return certName;
    };

    this.Print2Digit = function(digit){
        return (digit<10) ? "0"+digit : digit;
    };

    this.GetCertDate = function(paramDate) {
        let certDate = new Date(paramDate);
        return this.Print2Digit(certDate.getUTCDate())+"."+this.Print2Digit(certDate.getMonth()+1)+"."+certDate.getFullYear();// + " " +
        //this.Print2Digit(certDate.getUTCHours()) + ":" + this.Print2Digit(certDate.getUTCMinutes()) + ":" + this.Print2Digit(certDate.getUTCSeconds());
    };

    this.GetCertName = function(certSubjectName){
        return this.extract(certSubjectName, 'CN=');
    };

    this.GetIssuer = function(certIssuerName){
        return this.extract(certIssuerName, 'CN=');
    };

    this.GetCertInfoString = function(certSubjectName, certFromDate, certToDate, issuedBy){
        return "Кому выдан: " + this.extract(certSubjectName,'CN=').replace("CN=", "") + "; Кем выдан: " + issuedBy +  "; Действителен c " + this.GetCertDate(certFromDate) + " по " + this.GetCertDate(certToDate);
    };

}

function FillCertList_NPAPI() {
    let certList = {};

    return new Promise(function(resolve, reject){
        cadesplugin.async_spawn(function *(args) {
            try {
                let oStore = yield cadesplugin.CreateObjectAsync("CAPICOM.Store");

                yield oStore.Open(CAPICOM_CURRENT_USER_STORE, CAPICOM_MY_STORE, CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);
                let CertificatesObj = yield oStore.Certificates;
                let Count = yield CertificatesObj.Count;

                if (Count == 0) {
                    certList.globalCountCertificate = 0;
                    reject({certListNotFound: true});
                    return;
                }

                if (!Array.isArray(certList.globalOptionList)) {
                    certList.globalOptionList = [];
                }

                let text;
                let dateObj = new Date();
                let count = 0;

                for (let i = 1; i <= Count; i++) {

                        
                    let cert = yield CertificatesObj.Item(i);

                    let ValidToDate = new Date((yield cert.ValidToDate));
                    let ValidFromDate = new Date((yield cert.ValidFromDate));
                    let HasPrivateKey = yield cert.HasPrivateKey();
                    let Validator = yield cert.IsValid();
                    let IsValid = yield Validator.Result;

                    if( dateObj < new Date(ValidToDate) && IsValid && HasPrivateKey) {
                        let issuedBy = yield cert.GetInfo(1);
                        issuedBy = issuedBy || "";
                               
                        let Adjust = new CertificateAdjuster();
                        text = new CertificateAdjuster().GetCertInfoString(yield cert.SubjectName, ValidFromDate, ValidToDate, issuedBy);

                        let pubKey = yield cert.PublicKey();
                        let algo = yield pubKey.Algorithm;
                        let fAlgoName = yield algo.FriendlyName;

                        let oPrivateKey = yield cert.PrivateKey;
                        let sProviderName = yield oPrivateKey.ProviderName;
                        let subjectName = yield Adjust.GetCertName(yield cert.SubjectName);
                             
                        let certBinary = yield cert.Export(CADESCOM_ENCODE_BASE64);

                        certList.globalOptionList.push({
                            //'value': text.replace(/^cn=([^;]+);.+/i, '$1'),
                            //'subject' : subjectName,
                            //'issuer' : Adjust.GetIssuer(yield cert.IssuerName),
                            //'from' : Adjust.GetCertDate(yield cert.ValidFromDate),
                            //'till' : Adjust.GetCertDate(yield cert.ValidToDate),
                            //'algorithm' : fAlgoName,
                            //'provname' : sProviderName,
                            //'privateKey' : yield cert.PrivateKey,
                            //'signature' : certBinary,
                            'text' : text,
                            'thumbprint' : yield cert.Thumbprint
                        });
                    count++;
                }
            }
            certList.globalCountCertificate = count;
            resolve(certList.globalOptionList, certList);
        } 
                catch (err) {
                    reject(err);
        //    throw errormes;
    }
    });
});
}
