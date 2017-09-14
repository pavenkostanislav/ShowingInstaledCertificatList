import {Component, Pipe, PipeTransform} from 'angular2/core';
import {Item} from './dropdown';

@Pipe({
	name: "search"
})
export class SearchPipe {
	transform(value, sterm: string) {
		if (!value) {
			return value;
		}

		return value.filter((item: Item) => item.text.toLowerCase().indexOf(sterm.toLowerCase()) >= 0);
	}
} 