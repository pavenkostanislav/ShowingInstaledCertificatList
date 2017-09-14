/// <reference path="../../../scripts/typings/jquery/jquery.d.ts" />
/// <reference path="../../../scripts/typings/bootstrap.v3.datetimepicker/bootstrap.v3.datetimepicker-3.0.0.d.ts" />
import {Component, Input, Output, AfterViewInit, ViewChild, ElementRef, OnChanges, OnDestroy, EventEmitter} from 'angular2/core';
import {SimpleChange} from 'angular2/src/core/change_detection/change_detection_util';
import 'rxjs/Rx';

@Component({
	selector: 'date-time',
	template: `
		<div #group class='input-group date'>
			<input #input type='text' class="form-control" [disabled]="disabled" />
			<span class="input-group-addon">
				<span class="fa fa-calendar"></span>
			</span>
		</div>`
})
export class DateTimePicker implements AfterViewInit, OnDestroy {

	@ViewChild('group') group: ElementRef;
	@ViewChild('input') input: ElementRef;
	@Input() value: Date;
	@Input() options: any;
	@Input() disabled: boolean = false;
	@Output() valueChange: EventEmitter<string> = new EventEmitter<string>();

	private _group: JQuery;
	private _input: JQuery;
	private doEvent: boolean = true;
	private i9d: boolean = false;
	private dpShow: boolean = false;

	ngAfterViewInit() {

		if (!this.i9d) {
			this._input = $(this.input.nativeElement);
			this._group = $(this.group.nativeElement);
			this._group.datetimepicker(this.options);

			if (this.value) {
				this._group.data('DateTimePicker').setDate(this.value);
			}
			this._group.on('change', this.onValueChange.bind(this));
			this._group.on('dp.show', this.onShownCalendar.bind(this));
			this._group.on('dp.hide', this.onHideCalendar.bind(this));
			this.i9d = true;
		}
	}

	ngOnDestroy() {
		if (this._group.data('DateTimePicker')) {
			this._group.data('DateTimePicker').destroy();
		}
	}

	ngOnChanges(changes: { [key: string]: SimpleChange; }) {

		if (changes['value']) {
			var _newVal: string = changes['value'].currentValue;

			if (this.i9d && !this.dpShow) {

				this.doEvent = false;
				this._group.data('DateTimePicker').setDate(_newVal);
				this.doEvent = true;
				//let _ctrlVal = this._group.data('DateTimePicker').getDate();
				//let date = this.MomentToDate(_ctrlVal);
				//if (_newVal != _ctrlVal.toISOString()) {
				//}
			}
		}

		if (changes['disabled']) {
			if (!this.disabled && this.i9d) {
				this._group.data('DateTimePicker').enable();
			}
		}
	}

	onShownCalendar($event) {
		this.dpShow = true;
	}

	onHideCalendar($event) {
		this.dpShow = false;
	}

	onValueChange($event) {

		if (!this.i9d) {
			return;
		}

		if (this.doEvent) {
			let moment = this._group.data('DateTimePicker').getDate();
			if (moment) {
				var ret = moment.format('DD.MM.YYYY HH:mm:ss');
				this.valueChange.emit(ret);
			}
			else {
				this.valueChange.emit(undefined);
			}
		}
	}

	private MomentToDate(m: moment.Moment): Date {
		return new Date(m.year(), m.month(), m.date(), m.hours(), m.minutes(), m.seconds());
	}
}