export function InitDateExt() {

	Date.prototype.addDays = function(days:number){
		let d = this.getDate() + days;
		this.setDate(d);
		return this;
	}

	Date.prototype.toStringRu = function () {

		let d:number = this.getDate();
		let M: number = this.getMonth();
		let y: number = this.getFullYear();
		let H: number = this.getHours();
		let m: number = this.getMinutes();
		let s: number = this.getSeconds();

		return '' + d.toString(2) + '.' + M.toString(2) + '.' + y.toString(4) + ' ' + H.toString(2) + ':' + m.toString(2) + ':' + s.toString(2);

	}
}