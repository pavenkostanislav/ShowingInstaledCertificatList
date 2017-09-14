"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var es6_promise_js_1 = require("Scripts/angular2/es6-promise.js");
var cadesplugin = window['cadesplugin'];
var CryptoProPlugin = (function () {
    function CryptoProPlugin() {
        this.pathToFileAPI = "Scripts/angular2/cadesplugin_api.js";
        this.pathToChromiumAPI = "Scripts/angular2/async-crypto.es6.js";
        this.pathToFileAPIie = "Scripts/angular2/sync-crypto.js";
        this.isChromium = this.isChromiumBased();
        var pathToFileLib = (this.isChromium ? this.pathToChromiumAPI : this.pathToFileAPIie);
        this.cspAPI = this.scriptLoader([
            this.pathToFileAPI,
            pathToFileLib
        ]);
    }
    /**
    * Подгрузка скриптов
    * @param url
    */
    CryptoProPlugin.prototype.scriptLoader = function (url) {
        if (Array.isArray(url)) {
            var self_1 = this, prom_1 = [];
            url.forEach(function (item) {
                prom_1.push(self_1.scriptLoader(item));
            });
            return es6_promise_js_1.Promise.all(prom_1);
        }
        return new es6_promise_js_1.Promise(function (resolve, reject) {
            var r = false, scripts = document.getElementsByTagName("script"), t = scripts[scripts.length - 1], s = document.createElement("script");
            s.type = "text/javascript";
            s.src = url;
            s.defer = true;
            s["onload"] = s["onreadystatechange"] = function () {
                if (!r && (!this.readyState || this.readyState === "complete")) {
                    r = true;
                    resolve(this);
                }
            };
            s.onerror = s.onabort = reject;
            t.parentNode.insertBefore(s, t.nextSibling);
        });
    };
    CryptoProPlugin.prototype.isChromiumBased = function () {
        var retVal_chrome = navigator.userAgent.match(/chrome/i);
        var retVal_chromeframe = navigator.userAgent.match(/chromeframe/i);
        var isOpera = navigator.userAgent.match(/opr/i);
        var isYaBrowser = navigator.userAgent.match(/YaBrowser/i);
        if (retVal_chrome == null)
            return false;
        else {
            // В Chrome и Opera работаем через асинхронную версию
            if (retVal_chrome.length > 0 || isOpera != null) {
                return true;
            }
        }
        return false;
    };
    /**
     * Инициализация КриптоПро
     * @param resolve
     * @param reject
     */
    CryptoProPlugin.prototype.then = function (resolve, reject) {
        var _this = this;
        this.cspAPI.then(function () { });
        this.cspAPI.then(function () {
            var csp = window["cadesplugin"];
            if (_this.isChromium) {
                csp.then(function () { return resolve(csp); }, function (error) { return reject(error); });
            }
            else {
                window.addEventListener("message", function (event) {
                    if (event.data === "cadesplugin_loaded") {
                        resolve(cadesplugin);
                    }
                    else if (event.data === "cadesplugin_load_error") {
                        reject("cadesplugin_load_error");
                    }
                    resolve(cadesplugin);
                }, false);
                window.postMessage("cadesplugin_echo_request", "*");
            }
        }, reject);
    };
    /**
    * Подписание ЭЦП
     * @param certificateName
     * @param encodeString
    */
    CryptoProPlugin.prototype.signature = function (certificatethumbprint, encodeString, cadesTypeSelected, isbDetached, tspService) {
        var _this = this;
        return {
            then: function (resolve, reject) {
                if (_this.isChromium) {
                    var thenable = window["SignCreate"](certificatethumbprint, encodeString, cadesTypeSelected, isbDetached, tspService);
                    thenable.then(function (result) { return resolve(result); }, function (error) { return reject(error); });
                }
                else {
                    try {
                        var result = window["SignCreate"](certificatethumbprint, encodeString, cadesTypeSelected, isbDetached, tspService);
                        if (result === null)
                            reject(result);
                        else
                            resolve(result);
                    }
                    catch (error) {
                        reject(error);
                    }
                }
            }
        };
    };
    /**
     * Получение списка сертифкатов
     */
    CryptoProPlugin.prototype.getCertList = function () {
        if (this.isChromiumBased()) {
            return new es6_promise_js_1.Promise(function (resolve, reject) {
                return window["FillCertList_NPAPI"]().then(function (certList) { return resolve(certList); }, function (error) { return reject(error); }).catch(function (e) {
                    console.log(e);
                });
            });
        }
        else {
            return new es6_promise_js_1.Promise(function (resolve, reject) {
                setTimeout(function () {
                    var certList = window["FillCertList_NPAPI"]();
                    if (typeof certList === "string") {
                        reject(certList);
                    }
                    else {
                        resolve(certList);
                    }
                }, 1000);
            }).catch(function (e) {
                console.log(e);
            });
        }
    };
    return CryptoProPlugin;
}());
exports.CryptoProPlugin = CryptoProPlugin;
var CryptoProModel = (function () {
    function CryptoProModel() {
    }
    return CryptoProModel;
}());
exports.CryptoProModel = CryptoProModel;
