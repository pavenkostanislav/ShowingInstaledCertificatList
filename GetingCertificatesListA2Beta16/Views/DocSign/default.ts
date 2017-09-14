import { Component } from 'angular2/core';
"rxjs";

import { SignCreatedComponent } from 'Components/signcreated';

@Component({
    selector: "Default",
    moduleId: "Views/DocSign/Default",
    templateUrl: "./default.html",
    directives: [SignCreatedComponent]
})
export class DefaultComponent {

    constructor() {

    }
}