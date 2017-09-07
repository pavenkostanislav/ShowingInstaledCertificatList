var CAPICOM_CURRENT_USER_STORE = 2;
var CAPICOM_MY_STORE = "My";
var CAPICOM_STORE_OPEN_READ_ONLY = 0;
var CAPICOM_STORE_OPEN_READ_WRITE = 1;
var CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED = 2;
var CAPICOM_CERTIFICATE_FIND_SUBJECT_NAME = 1;
var CAPICOM_CERTIFICATE_FIND_SHA1_HASH = 0;
var CAPICOM_CERTIFICATE_INCLUDE_WHOLE_CHAIN = 1;
var CADESCOM_CADES_X_LONG_TYPE_1 = 0x5d; 
var CADESCOM_CADES_BES = 0x01;
var CADESCOM_ENCODE_BASE64 = 0;
var CADESCOM_BASE64_TO_BINARY = 1;


function GetErrorMessage(e) {
    let err = e.message;
    if (!err) {
        err = e;
    } else if (e.number) {
        err += " (" + e.number + ")";
    }
    return err;
}

function SignCreate(thumbprint, dataToSign) {

    let oCertificate;
    let oSigner;
    let oSignedData;
    let sSignedMessage;

    let oStore = cadesplugin.CreateObject("CAPICOM.Store");
    oStore.Open(CAPICOM_CURRENT_USER_STORE, CAPICOM_MY_STORE, CAPICOM_STORE_OPEN_MAXIMUM_ALLOWED);

    let oCertificates = oStore.Certificates.Find(CAPICOM_CERTIFICATE_FIND_SHA1_HASH, thumbprint);

    if (oCertificates.Count == 0) {
        return "Certificate not found: " + thumbprint;
    }

    oCertificate = oCertificates.Item(1);
    oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");
    oSigner.Certificate = oCertificate;
    oSigner.TSAAddress = "http://testca.cryptopro.ru/tsp/tsp.srf";

    oSignedData = cadesplugin.CreateObject("CAdESCOM.CadesSignedData");
    oSignedData.ContentEncoding = CADESCOM_BASE64_TO_BINARY;
    oSignedData.Content = dataToSign;

    try {
        sSignedMessage = oSignedData.SignCades(oSigner, CADESCOM_CADES_X_LONG_TYPE_1);
    } catch (err) {
        return "Failed to create signature. Error: " + GetErrorMessage(err);
    }

    try {
        oSignedData.VerifyCades(sSignedMessage, CADESCOM_CADES_X_LONG_TYPE_1);
    } catch (err) {
        alert("Failed to verify signature. Error: " + cadesplugin.getLastError(err));
        return false;
    }

    oStore.Close();
    return sSignedMessage;
}

function FillCertList_NPAPI() {

    let certList = [];
    let dateObj = new Date();
    let count = 0;
    let text;
    let certCnt;
    let oStore;
    let cert;

    try {
        oStore = cadesplugin.CreateObject("CAdESCOM.Store");
        //https://msdn.microsoft.com/ru-ru/library/windows/desktop/aa388130(v=vs.85).aspx
        oStore.Open();
    } catch (ex) {
        return "Ошибка при открытии хранилища: " + GetErrorMessage(ex);
    }

    try {
        certCnt = oStore.Certificates.Count;
        if (certCnt == 0) {
            return certList;
        }

    } catch (ex) {

        let message = GetErrorMessage(ex);
        if ("Cannot find object or property. (0x80092004)" == message ||
            "oStore.Certificates is undefined" == message ||
            "Объект или свойство не найдено. (0x80092004)" == message) {
            oStore.Close();
            return message;
        }
    }

    for (let i = 1; i <= certCnt; i++) {

        try {
            cert = oStore.Certificates.Item(i);
        } catch (ex) {
            return "Ошибка при перечислении сертификатов: " + GetErrorMessage(ex);
        }

        try {

            if (dateObj < cert.ValidToDate && cert.HasPrivateKey() && cert.IsValid().Result) {
                let issuedBy = cert.GetInfo(1);
                issuedBy = issuedBy || "";
                let certObj = new CertificateObj(cert);
                text = certObj.GetCertString();                
                
                //let oSigner = cadesplugin.CreateObject("CAdESCOM.CPSigner");
                //oSigner.Certificate = cert;

                let certBinary = cert.Export(CADESCOM_ENCODE_BASE64);
               
                certList.push({
                    'value': text.replace(/^cn=([^;]+);.+/i, '$1'),
                    'text': text.replace("CN=", ""),
                    'subject': certObj.GetCertName(),
                    'issuer': certObj.GetIssuer(),
                    'from': certObj.GetCertFromDate(),
                    'till': certObj.GetCertTillDate(),
                    'algorithm': certObj.GetPubKeyAlgorithm(),
                    'provname': certObj.GetPrivateKeyProviderName(),
                    'thumbprint': cert.Thumbprint.split(" ").reverse().join("").replace(/\s/g, "").toUpperCase(),
                    'privateKey': cert.PrivateKey,
                    'signature': certBinary
                });

                count++;

            } else { continue; }
        } catch (ex) {
            return "Ошибка при получении параметров установленных сертификатов: " + GetErrorMessage(ex);
        }
    }

    oStore.Close();
    return certList;
}

function CertificateObj(certObj) {
    this.cert = certObj;
    this.certFromDate = new Date(this.cert.ValidFromDate);
    this.certTillDate = new Date(this.cert.ValidToDate);
}

CertificateObj.prototype.check = function (digit) {
    return (digit < 10) ? "0" + digit : digit;
}

CertificateObj.prototype.extract = function (from, what) {
    let certName = "";
    let begin = from.indexOf(what);

    if (begin >= 0) {
        let end = from.indexOf(', ', begin);
        certName = (end < 0) ? from.substr(begin) : from.substr(begin, end - begin);
    }

    return certName;
}

CertificateObj.prototype.DateTimePutTogether = function (certDate) {
    return this.check(certDate.getUTCDate()) + "." + this.check(certDate.getMonth() + 1) + "." + certDate.getFullYear();// + " " +
        //this.check(certDate.getUTCHours()) + ":" + this.check(certDate.getUTCMinutes()) + ":" + this.check(certDate.getUTCSeconds());
}

CertificateObj.prototype.GetCertString = function () {
    return this.extract(this.cert.SubjectName, 'CN=') + "; Выдан: " + this.GetCertFromDate() + "; Действителен до: " + this.GetCertTillDate() + " " + this.GetIssuer();
}

CertificateObj.prototype.GetCertFromDate = function () {
    return this.DateTimePutTogether(this.certFromDate);
}

CertificateObj.prototype.GetCertTillDate = function () {
    return this.DateTimePutTogether(this.certTillDate);
}

CertificateObj.prototype.GetPubKeyAlgorithm = function () {
    return this.cert.PublicKey().Algorithm.FriendlyName;
}

CertificateObj.prototype.GetCertName = function () {
    var sn = this.cert.SubjectName;
    return this.extract(this.cert.SubjectName, 'CN=').replace("CN=", "");
}

CertificateObj.prototype.GetIssuer = function () {
    return this.extract(this.cert.IssuerName, 'CN=').replace("CN=", "");
}

CertificateObj.prototype.GetPrivateKeyProviderName = function () {
    return this.cert.PrivateKey.ProviderName;
}
