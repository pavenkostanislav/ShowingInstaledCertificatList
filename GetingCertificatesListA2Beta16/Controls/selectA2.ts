/// <reference path="../../../scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../../scripts/typings/select2/select2.d.ts" />
import {Component, OnInit, OnChanges, OnDestroy, Input, Output, EventEmitter, ElementRef, AfterViewInit, ViewChild, AfterViewChecked, SimpleChange} from 'angular2/core';
import {CORE_DIRECTIVES} from 'angular2/common';
import 'rxjs/Rx';

import {SelectService} from 'shared/Services/select.service';

@Component({
	selector: 'selectA2',
	template: '<input #select [disabled]="disabled==true" />',
	directives: [CORE_DIRECTIVES]
})
export class SelectA2 implements OnInit, OnChanges, OnDestroy, AfterViewInit {

	private jqueryElement: JQuery;
	private doEmit: boolean = true;
	private i9d: boolean = false;

	@ViewChild('select') private select: ElementRef;


	@Input() value: any;
	@Input() disabled: boolean;

	@Input() typeName: string;
	@Input() term: string;
	@Input() parentId: number;
	@Input() minTerm: number = 3;

	@Output() valueChange: EventEmitter<any> = new EventEmitter<any>();

	constructor(private selSrv: SelectService) { }

	ngOnInit() {

	}

	ngOnDestroy() {
		if (this.jqueryElement) {
			this.jqueryElement.select2('destroy');
			this.i9d = false;
		}
	}

	ngAfterViewInit() {

		this.jqueryElement = $(this.select.nativeElement);

		this.jqueryElement.select2({
			placeholder: "Значение не выбрано...",
			allowClear: true,
			width: '100%',
			theme: 'classic',
			minimumInputLength: this.minTerm,
			ajax: {
				url: '/api/select',
				dataType: 'json',
				delay: 250,
				data: this.getRequestParam.bind(this),
				results: function (data, page) {
					return {
						results: data
					};
				},
				cache: true
			},
            initSelection: this.getItem.bind(this)

		});

		this.i9d = true;

		if (this.value) {
			this.jqueryElement.select2('val', this.value);
		}
		this.jqueryElement.on('change', this.onSelectChange.bind(this));

	}

	getRequestParam(term: string, page: number, context: any) {

		return {
			type: this.typeName,
			parentId: this.parentId ? this.parentId : null,
			term: this.term ? this.term : term
		};
	}

    getItem(element: any, callback: (data: any) => void) {
        if (this.value) {
            if (typeof this.value === 'number') {
                this.selSrv.getSelectItemId(this.typeName, this.value).subscribe(
                    result => {

                        if (result) {
                            callback(result[0]);
                        }
                    },
                    error => {
                        console.log(error);
                    }
                );
            }
            if (typeof this.value === 'string') {
                this.selSrv.getSelectItemCode(this.typeName, this.value).subscribe(
                    result => {

                        if (result) {
                            callback(result[0]);
                        }
                    },
                    error => {
                        console.log(error);
                    }
                );
            }
        }
	}

	onSelectChange($event) {
		if (this.doEmit && this.jqueryElement) {
			this.valueChange.emit(this.jqueryElement.val());
		}
	}

	ngOnChanges(changes: { [key: string]: SimpleChange }) {

		if (changes['value']) {
			if (this.jqueryElement && this.i9d) {
				this.doEmit = false;
				this.jqueryElement.select2('val', this.value);
				this.doEmit = true;
			}
		}
		
	}
}
