import {Component, Input} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';

@Component({
	selector: 'shadow-box',
	template: `
		<div *ngIf="show" class="shadow-box" >
			<div class="shadow-box-body">
			<i class="fa fa-2x fa-spinner fa-spin"></i>
			</div>
		</div>`,
	styles: [`
		.shadow-box {
			position: absolute;
			top: 0;
			left: 0;
			z-index: 1040;
			background-color: #000;
			opacity: .3;
			width: 100%;
			height: 100%;
			text-align: center;
		}`,
		`.shadow-box-body { 
			margin: auto;
			position: absolute;
			top: 0;
			left: 0;
			bottom: 0;
			right: 0;
			width: 50%;
			height: 50%;
			color: white;}`],
	directives: [CORE_DIRECTIVES]

})
export class ShadowBox {

	@Input() show: boolean = false;

	constructor() {
		var t = this.show;
	}
}