"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function ShowError(error) {
    if (error._body) {
        var errObj = JSON.parse(error._body);
        if ((errObj) && errObj.Message) {
            //alert(errObj.Message);
            $("#ErrorBlock").html(" " + errObj.Message);
            $("#ErrorModalBox").modal("show");
        }
    }
    else {
        $("#ErrorBlock").html(" " + error);
        $("#ErrorModalBox").modal("show");
    }
}
exports.ShowError = ShowError;
function ShowComplete() {
    $("#CompleteModalBox").modal("show");
}
exports.ShowComplete = ShowComplete;
function ShowMessage(message) {
    $("#MessageBlock").html(message);
    $("#MessageModalBox").modal("show");
}
exports.ShowMessage = ShowMessage;
function ShowRecordInfo(crName, createdDate, luName, lastUpdatedDate) {
    var recInfo = "\u041A\u0435\u043C \u0441\u043E\u0437\u0434\u0430\u043D\u043E: <strong>" + crName + "</strong><br/>\u041A\u043E\u0433\u0434\u0430 \u0441\u043E\u0437\u0434\u0430\u043D\u043E: <strong>" + createdDate + "</strong><br/>\u041A\u0435\u043C \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u043E: <strong>" + luName + "</strong><br/>\u041A\u043E\u0433\u0434\u0430 \u0438\u0437\u043C\u0435\u043D\u0435\u043D\u043E: <strong>" + lastUpdatedDate + "</strong>";
    $("#RecordInfo").html(recInfo);
    $("#RecordInfoModalBox").modal("show");
}
exports.ShowRecordInfo = ShowRecordInfo;
//Преобразует строку в дату (время отсекается)
//В случае ошибки возвращает undefined
function StringToDate(str) {
    var parts = [];
    if (str && str.split(" ").length > 0 && str.split(" ")[0].split(".").length > 2) {
        str.split(" ")[0].split(".").forEach(function (currentValue, index, array) {
            parts.push(parseInt(currentValue));
        });
        return new Date(parts[2], parts[1], parts[0]);
    }
    else {
        return undefined;
    }
}
exports.StringToDate = StringToDate;
//Преобразует строку в дату и время 
function StringToDateTime(str) {
    var parts = [];
    if (str &&
        str.split(" ").length == 2) {
        str.split(" ")[0].split(".").forEach(function (currentValue, index, array) {
            parts.push(parseInt(currentValue));
        });
        str.split(" ")[1].split(":").forEach(function (currentValue, index, array) {
            parts.push(parseInt(currentValue));
        });
        return new Date(parts[2], parts[1], parts[0], parts[3], parts[4], parts[5]);
    }
    else {
        return undefined;
    }
}
exports.StringToDateTime = StringToDateTime;
function ShowModal(id) {
    $("#" + id).modal("show");
}
exports.ShowModal = ShowModal;
