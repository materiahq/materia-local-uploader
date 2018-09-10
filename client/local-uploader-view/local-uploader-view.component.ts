import { Component, OnInit, Input, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';

import { AddonView } from '@materia/addons';

import { BytePipe } from '../pipes/byte.pipe';
import { ConfirmModalComponent } from '../dialogs/confirm-modal';

@AddonView('@materia/local-uploader')
@Component({
    selector: 'materia-lu-view',
    templateUrl: './local-uploader-view.component.html',
    styleUrls: ['./local-uploader-view.component.scss'],
    providers: []
})
export class LocalUploaderViewComponent implements OnInit {
    @Input() app;
    @Input() settings;
    @Input() baseUrl: string;
    @Input() apiUrl: string;

    @Output() openSetup = new EventEmitter<void>();
    @ViewChild('endpointEditor') endpointEditor: TemplateRef<any>;
    @ViewChild(ConfirmModalComponent) confirmModal: ConfirmModalComponent;

    readonly separatorKeysCodes: number[] = [ENTER, COMMA];
    uploadedFiles: any[];
    permissions: Object;
    endpointForm: FormGroup;
    edition: boolean;
    mimeTypesAllowed: any[];
    deleteMessage: string;
    deleteMessageDetail: string;
    endpoints: any[];
    selectedEndpoint: any;

    get uploadEndpoints() {
        if (this.settings && this.settings.endpoints && this.settings.endpoints.length) {
            return this.settings.endpoints;
        } else {
            return null;
        }
    }

    constructor(private http: HttpClient, private fb: FormBuilder, private dialog: MatDialog) { }

    ngOnInit() {
        this.getUploadedFiles();
        this.getMateriaPermissions().then(permissions => {
            this.permissions = permissions;
        });
        this.getEnpoints().then((endpoints: any[]) => {
            this.endpoints = endpoints;
        });
    }

    private getMateriaPermissions() {
        return this.http.get(`${this.baseUrl}/permissions`).toPromise();
    }

    private getEnpoints() {
        return this.http.get(`${this.baseUrl}/endpoints`).toPromise();
    }

    getUploadedFiles() {
        this.runQuery('uploaded_file', 'list').then((result: { count: number, data: any[] }) => {
            this.uploadedFiles = result.data;
        }).catch((err) => {
            console.log('Error loading uploaded files : ', err);
        });
    }

    addEndpoint(newEndpoint) {
        if (! this.settings.endpoints) {
            this.settings.endpoints = [];
        }
        this.settings.endpoints.push(newEndpoint);
        this.saveSettings();
    }

    updateEndpoint(endpoint) {
        const index = this.settings.endpoints.findIndex(e => e.url === endpoint.url);
        this.settings.endpoints[index] = Object.assign({}, endpoint);
        this.saveSettings();
    }

    openEndpointEditor() {
        this.initEndpointForm();
        const dialogRef = this.dialog.open(this.endpointEditor, {panelClass: 'no-padding', maxWidth: '350px'});
        dialogRef.afterClosed().subscribe(result => {
            if (result === 'save') {
                const newEndpoint = this.endpointForm.value;
                newEndpoint.url = `/${newEndpoint.url}`;
                newEndpoint.mimeTypes = this.mimeTypesAllowed;
                if (newEndpoint.type === 'single') {
                    delete newEndpoint.maxFileCount;
                }
                this.addEndpoint(newEndpoint);
            }
        });
    }

    editEndpoint(endpoint) {
        this.initEndpointFormWithValue(endpoint);
        this.selectedEndpoint = endpoint;
        const dialogRef = this.dialog.open(this.endpointEditor, {panelClass: 'no-padding', maxWidth: '350px'});
        dialogRef.afterClosed().subscribe(result => {
            if (result === 'save') {
                const newEndpoint = this.endpointForm.value;
                newEndpoint.url = endpoint.url;
                newEndpoint.mimeTypes = this.mimeTypesAllowed;
                if (newEndpoint.type === 'single') {
                    delete newEndpoint.maxFileCount;
                }
                this.updateEndpoint(newEndpoint);
            }
        });
    }

    deleteEndpoint(endpoint) {
        this.deleteMessage = `Are your sure you want to delete endpoint: ${endpoint.url} ?`;
        const dialogRef = this.dialog.open(this.confirmModal.template);
        dialogRef.afterClosed().subscribe((result) => {
            if (result === 'confirm') {
                const index = this.settings.endpoints.findIndex(e => e.url === endpoint.url);
                this.settings.endpoints.splice(index, 1);
                this.saveSettings();
            }
        });
    }

    addAllowedMimeType(type) {
        if (type.value && type.value.length > 5) {
            this.mimeTypesAllowed.push(type.value);
        }
        if (type.input) {
            type.input.value = '';
        }
    }

    removeAllowedMimeType(type) {
        const index = this.mimeTypesAllowed.findIndex(t => t === type.value);
        this.mimeTypesAllowed.splice(index, 1);
    }

    private initEndpointForm() {
        this.mimeTypesAllowed = [];
        this.endpointForm = this.fb.group({
            type: ['single', Validators.required],
            url: ['', [Validators.required, this.urlEndpointValidator.bind(this)]],
            dest: ['uploads', Validators.required],
            sizeLimit: 10000000,
            permissions: [['Anyone']],
            maxFileCount: null
        });
    }

    private initEndpointFormWithValue(endpoint) {
        this.mimeTypesAllowed = endpoint.mimeTypes ? [...endpoint.mimeTypes] : [];
        this.endpointForm = this.fb.group({
            type: [endpoint.type ? endpoint.type : 'single', Validators.required],
            url: [{value: endpoint.url.substr(1), disabled: true}, Validators.required],
            dest: [endpoint.dest, Validators.required],
            sizeLimit: endpoint.sizeLimit,
            permissions: [endpoint.permissions],
            maxFileCount: endpoint.maxFileCount ? endpoint.maxFileCount : null
        });
    }

    private saveSettings() {
        return this.http.post(`${this.baseUrl}/addons/@materia/local-uploader/setup`, this.settings).toPromise();
    }

    private runQuery(entity: string, query: string, params?: any) {
        return this.http
            .post(`${this.baseUrl}/entities/${entity}/queries/${query}`, params)
            .toPromise();
    }

    urlEndpointValidator(control: FormControl) {
        const url = control.value;
        const existingUrl = this.endpoints.map(e => e.method + e.url);
        if (existingUrl.indexOf(`post/${url}`) !== -1) {
            return {
              exists: true
            };
        }
        return null;
      }
}
