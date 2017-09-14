"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function InitDateExt() {
    Date.prototype.addDays = function (days) {
        var d = this.getDate() + days;
        this.setDate(d);
        return this;
    };
    Date.prototype.toStringRu = function () {
        var d = this.getDate();
        var M = this.getMonth();
        var y = this.getFullYear();
        var H = this.getHours();
        var m = this.getMinutes();
        var s = this.getSeconds();
        return '' + d.toString(2) + '.' + M.toString(2) + '.' + y.toString(4) + ' ' + H.toString(2) + ':' + m.toString(2) + ':' + s.toString(2);
    };
}
exports.InitDateExt = InitDateExt;
