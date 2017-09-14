/// <reference path="../../../scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../../scripts/typings/select2/select2.d.ts" />
import {Component, OnChanges, OnDestroy, Input, Output, EventEmitter, ElementRef, AfterViewInit, AfterViewChecked, ViewChild, SimpleChange} from "angular2/core";
import {CORE_DIRECTIVES} from "angular2/common";
import "rxjs/Rx";

/*
<select #select [disabled]="disabled">
			<option value="">Значение не выбрано...</option>
			<template [ngIf]="!usegroup">
				<option *ngFor="#option of options" [value]="option.id">{{option.name}}</option>
			</template>
			<template [ngIf]="usegroup">
				<optgroup *ngFor="#group of options" label="{{group.name}}">
				<option *ngFor="#option of group.children" [value]="option.id">{{option.name}}</option>
				</optgroup>
			</template>
		</select>

*/

@Component({
	selector: "select2",
	template: "<input #elInput [disabled]=\"disabled\"/>",
	directives: [CORE_DIRECTIVES]
})
export class Select2 implements OnChanges, OnDestroy, AfterViewInit, AfterViewChecked {

	private jqueryElement: JQuery;
	private i9d: boolean;

	@ViewChild("elInput") private select: ElementRef;

	@Input() options: Array<any>;
	@Input() value: any;
	@Input() usegroup: boolean;
	@Input() disabled: boolean;

	@Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

	ngAfterViewInit() {
		this.jqueryElement = $(this.select.nativeElement);
	}

	ngAfterViewChecked() {}

	onSelectChange($event) {

		if (this.jqueryElement) {
			this.valueChange.emit(this.jqueryElement.val());
		}
	}

	ngOnChanges(changes: { [key: string]: SimpleChange }) {

		if ((changes["options"]) && this.jqueryElement) {

			if (this.i9d) {
				this.jqueryElement.select2("destroy");
				this.i9d = false;
			}

			this.jqueryElement.select2({
				placeholder: "Значение не выбрано...",
				allowClear: true,
				width: "100%",
				theme: "classic",
				data: this.options
			});

			if (this.value) {
				this.jqueryElement.select2("val", this.value);
			}

			this.jqueryElement.on("change", this.onSelectChange.bind(this));
			this.i9d = true;
		}

		if (changes["value"]) {

			if (this.jqueryElement && this.jqueryElement.select2) {
				if (!this.i9d) {

					this.jqueryElement.select2({
						placeholder: "Значение не выбрано...",
						allowClear: true,
						width: "100%",
						theme: "classic",
						data: this.options
					});
					this.i9d = true;
				}
				else {
					this.jqueryElement.select2("val", this.value);
				}
			}
		}
	}

	ngOnDestroy() {
		if (this.jqueryElement) {
			this.jqueryElement.select2("destroy");
		}
	}
}
 