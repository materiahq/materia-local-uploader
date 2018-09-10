import {
    Component,
    OnInit,
    Input,
    ViewChild,
    TemplateRef
} from '@angular/core';

@Component({
    selector: 'materia-lu-confirm-modal',
    templateUrl: './confirm-modal.component.html',
    styleUrls: ['./confirm-modal.component.scss']
})
export class ConfirmModalComponent implements OnInit {
    @Input() message: string;
    @Input() messageDetail: string;
    @Input() buttonNames: Array<string>;

    @ViewChild('confirmModal') template: TemplateRef<any>;

    constructor() { }

    ngOnInit() { }
}
