import { Component } from 'angular2/core';
"rxjs";

import { SignCreatedComponent } from 'Components/Diadoc/signcreated';

@Component({
    selector: "Default",
    moduleId: "a2/Tests/Default",
    templateUrl: "./default.html",
    directives: [SignCreatedComponent]
})
export class DefaultComponent {

    constructor() {

    }
}