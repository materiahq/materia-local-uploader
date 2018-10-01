import { Component, OnInit, Input, Output, EventEmitter, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { MatDialog, MatAutocompleteSelectedEvent } from '@angular/material';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { startWith, map } from 'rxjs/operators';
import { MIMETypes } from './mime-types.list';

import { AddonView } from '@materia/addons';

import { BytePipe } from '../../pipes/byte.pipe';
import { ConfirmModalComponent } from '../../dialogs/confirm-modal';

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
    watchingFormUrl: boolean;
    filteredMimeTypes: any;
    mimeTypesControl: FormControl;
    allMimeTypes: string[];
    methodsColor: { [method: string]: string } = {
        get: '#C8E6C9',
        post: '#B3E5FC',
        put: '#FFCCBC',
        delete: '#FFCDD2',
        patch: '#D7CCC8'
    };

    @ViewChild('mimeTypes') mimeTypesInput: ElementRef<HTMLInputElement>;

    get uploadEndpoints() {
        if (this.settings && this.settings.endpoints && this.settings.endpoints.length) {
            return this.settings.endpoints;
        } else {
            return null;
        }
    }

    constructor(private http: HttpClient, private fb: FormBuilder, private dialog: MatDialog) {
        this.allMimeTypes = MIMETypes;
        this.mimeTypesControl = new FormControl(null);
        this.filteredMimeTypes = this.mimeTypesControl.valueChanges.pipe(
            startWith(null),
            map((fruit: string | null) => fruit ? this._filter(fruit) : this.allMimeTypes.slice()));
    }

    private _filter(value: string): string[] {
        const filterValue = value.toLowerCase();
        return this.allMimeTypes.filter(fruit => fruit.toLowerCase().indexOf(filterValue) === 0);
    }

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
        if (!this.settings.endpoints) {
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
        const dialogRef = this.dialog.open(this.endpointEditor, {
            panelClass: ['no-padding', 'mat-dialog-content-no-padding'], width: '350px', maxHeight: '90%'
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result === 'save') {
                const newEndpoint = this.endpointForm.value;
                newEndpoint.url = `/${newEndpoint.url}`;
                newEndpoint.mime_types = this.mimeTypesAllowed.map(type => type.trim());
                if (newEndpoint.type === 'single') {
                    delete newEndpoint.max_file_count;
                }
                if (!newEndpoint.fetch_uploaded_file) {
                    delete newEndpoint.fetch_uploaded_file_url;
                    delete newEndpoint.fetch_uploaded_file_permissions;
                } else {
                    newEndpoint.fetch_uploaded_file_url = `/${this.endpointForm.controls['fetch_uploaded_file_url'].value}`;
                }
                this.addEndpoint(newEndpoint);
            }
        });
    }

    editEndpoint(endpoint) {
        this.initEndpointFormWithValue(endpoint);
        this.selectedEndpoint = endpoint;
        const dialogRef = this.dialog.open(this.endpointEditor, {
            panelClass: ['no-padding', 'mat-dialog-content-no-padding'], width: '350px', maxHeight: '90%'
        });
        dialogRef.afterClosed().subscribe(result => {
            if (result === 'save') {
                const newEndpoint = this.endpointForm.value;
                newEndpoint.url = endpoint.url;
                newEndpoint.mime_types = this.mimeTypesAllowed.map(type => type.trim());
                if (newEndpoint.type === 'single') {
                    delete newEndpoint.max_file_count;
                }
                if (!newEndpoint.fetch_uploaded_file) {
                    delete newEndpoint.fetch_uploaded_file_url;
                    delete newEndpoint.fetch_uploaded_file_permissions;
                } else {
                    newEndpoint.fetch_uploaded_file_url = `${endpoint.url}/:name`;
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
        if (type.value && type.value.length > 5 && this.mimeTypesAllowed.indexOf(type.value) === -1) {
            this.mimeTypesAllowed.push(type.value);
        }
        if (type.input) {
            type.input.value = '';
        }
        this.mimeTypesControl.setValue(null);
    }

    selected(event: MatAutocompleteSelectedEvent): void {
        if (this.mimeTypesAllowed.indexOf(event.option.viewValue) === -1) {
            this.mimeTypesAllowed.push(event.option.viewValue);
            this.mimeTypesControl.setValue(null);
            this.mimeTypesInput.nativeElement.value = '';
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
            input_name: ['file', Validators.required],
            size_limit: 10000000,
            permissions: [['Anyone']],
            max_file_count: null,
            fetch_uploaded_file: false,
            fetch_uploaded_file_url: [{ value: '', disabled: true }, [this.fetchUrlValidator.bind(this)]],
            fetch_uploaded_file_permissions: [['Anyone']]
        });
        this.watchFormUrl();
    }

    private initEndpointFormWithValue(endpoint) {
        this.mimeTypesAllowed = endpoint.mime_types ? [...endpoint.mime_types] : [];
        this.endpointForm = this.fb.group({
            type: [endpoint.type ? endpoint.type : 'single', Validators.required],
            url: [{ value: endpoint.url.substr(1), disabled: true }, Validators.required],
            dest: [endpoint.dest, Validators.required],
            input_name: [endpoint.input_name, Validators.required],
            size_limit: endpoint.size_limit,
            permissions: [endpoint.permissions],
            max_file_count: endpoint.max_file_count ? endpoint.max_file_count : null,
            fetch_uploaded_file: endpoint.fetch_uploaded_file,
            fetch_uploaded_file_url: endpoint.fetch_uploaded_file ?
                [{ value: endpoint.fetch_uploaded_file_url, disabled: true }, [this.fetchUrlValidator.bind(this)]] :
                [{ value: `${endpoint.url.substr(1)}/:name`, disabled: true }, [this.fetchUrlValidator.bind(this)]],
            fetch_uploaded_file_permissions: endpoint.fetch_uploaded_file ? [endpoint.fetch_uploaded_file_permissions] : [['Anyone']]
        });
        this.watchFormUrl();
    }

    private watchFormUrl() {
        this.endpointForm.controls['url'].valueChanges.subscribe((val) => {
            this.endpointForm.controls['fetch_uploaded_file_url'].setValue(`${val}/:name`);
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

    fetchUrlValidator(control: FormControl) {
        const url = control.value;
        const existingUrl = this.endpoints.map(e => e.method + e.url);
        if (existingUrl.indexOf(`get/${url}`) !== -1) {
            return {
                exists: true
            };
        }
        return null;
    }
}
