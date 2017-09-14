export interface ISelectItem {
	id: any;
	name: string;
	text: string;
	children: Array<ISelectItem>;
}


export function ShowError(error: any) {

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

export function ShowComplete() {
	$("#CompleteModalBox").modal("show");

}

export function ShowMessage(message: string) {
	$("#MessageBlock").html(message);
	$("#MessageModalBox").modal("show");
}

export function ShowRecordInfo(crName: string, createdDate: string, luName: string, lastUpdatedDate:string) {

	var recInfo = `Кем создано: <strong>${crName}</strong><br/>Когда создано: <strong>${createdDate}</strong><br/>Кем изменено: <strong>${luName}</strong><br/>Когда изменено: <strong>${lastUpdatedDate}</strong>`;

	$("#RecordInfo").html(recInfo);
	$("#RecordInfoModalBox").modal("show");
}

//Преобразует строку в дату (время отсекается)
//В случае ошибки возвращает undefined
export function StringToDate(str): Date {
    let parts: Array<number> = [];
    if (str && str.split(" ").length > 0 && str.split(" ")[0].split(".").length > 2) {
        str.split(" ")[0].split(".").forEach((currentValue, index, array) => {
            parts.push(parseInt(currentValue));
        };
        return new Date(parts[2], parts[1], parts[0]);
    } else {
        return undefined;
    }
}

//Преобразует строку в дату и время 
export function StringToDateTime(str): Date {
    let parts: Array<number> = [];
    if (str &&
        str.split(" ").length == 2) {
        str.split(" ")[0].split(".").forEach((currentValue, index, array) => {
            parts.push(parseInt(currentValue));
        };
        str.split(" ")[1].split(":").forEach((currentValue, index, array) => {
            parts.push(parseInt(currentValue));
        };
        return new Date(parts[2], parts[1], parts[0], parts[3], parts[4], parts[5]);
    } else {
        return undefined;
    }
}

export function ShowModal(id: string) {
    $(`#${id}`).modal("show");
}

