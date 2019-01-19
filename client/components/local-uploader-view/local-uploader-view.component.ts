import {
  Component,
  OnInit,
  Input,
  Output,
  EventEmitter,
  TemplateRef,
  ViewChild,
  ElementRef
} from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  FormGroup,
  FormBuilder,
  Validators,
  FormControl
} from "@angular/forms";
import { MatDialog, MatAutocompleteSelectedEvent } from "@angular/material";
import { COMMA, ENTER } from "@angular/cdk/keycodes";
import { Observable } from "rxjs";
import { startWith, map } from "rxjs/operators";

import { MIMETypes } from "./mime-types.list";

import { AddonView } from "@materia/addons";
import { IEndpoint, IPermission, IApp } from "@materia/interfaces";

import { BytePipe } from "../../pipes/byte.pipe";
import { ConfirmModalComponent } from "../../dialogs/confirm-modal";
import { ILocalUploaderEndpoint, ILocalUploaderSetting } from "../../models/upload-endpoint.model";
import { UploadEndpointsService } from "../../services/upload-endpoints.service";
import { MateriaEndpointsService } from "../../services/materia-endpoints.service";

@AddonView("@materia/local-uploader")
@Component({
  selector: "materia-lu-view",
  templateUrl: "./local-uploader-view.component.html",
  styleUrls: ["./local-uploader-view.component.scss"],
  providers: [MateriaEndpointsService, UploadEndpointsService]
})
export class LocalUploaderViewComponent implements OnInit {
  @Input() app: IApp;
  @Input() settings: ILocalUploaderSetting;
  @Input() baseUrl: string;
  @Input() apiUrl: string;

  @Output() openSetup = new EventEmitter<void>();
  @Output() refreshApi = new EventEmitter<void>();
  @ViewChild("endpointEditor") endpointEditor: TemplateRef<any>;
  @ViewChild(ConfirmModalComponent) confirmModal: ConfirmModalComponent;

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  uploadedFiles: File[];
  permissions: IPermission[];
  endpointForm: FormGroup;
  edition: boolean;
  deleteMessage: string;
  deleteMessageDetail: string;
  endpoints: IEndpoint[];
  uploadEndpoints : ILocalUploaderEndpoint[] = [];
  selectedEndpoint: ILocalUploaderEndpoint;
  watchingFormUrl: boolean;

  mimeTypesControl: FormControl;
  filteredMimeTypes$: Observable<string[]>;
  allMimeTypes: string[];
  mimeTypesAllowed: string[];

  methodsColor: { [method: string]: string } = {
    get: "#C8E6C9",
    post: "#B3E5FC",
    put: "#FFCCBC",
    delete: "#FFCDD2",
    patch: "#D7CCC8"
  };

  @ViewChild("mimeTypes") mimeTypesInput: ElementRef<HTMLInputElement>;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private dialog: MatDialog,
    private uploadEndpointsService: UploadEndpointsService
  ) {}

  ngOnInit() {
    this.allMimeTypes = MIMETypes;
    this.mimeTypesControl = new FormControl(null);
    this.filteredMimeTypes$ = this.mimeTypesControl.valueChanges.pipe(
      startWith(null),
      map((controlValue: string) =>
        controlValue
          ? this._filterMimeTypes(controlValue)
          : this.allMimeTypes.slice()
      )
    );
    this.getUploadedFiles();
    this.getMateriaEndpoints();
    this.getMateriaPermissions();
    this.getLocalUploaderEndpoints();
  }

  getUploadedFiles() {
    this.runQuery("uploaded_file", "list").then(
      (result: { count: number; data: any[] }) => {
        this.uploadedFiles = result.data;
      }
    );
  }

  async addEndpoint(newEndpoint: ILocalUploaderEndpoint) {
    this.uploadEndpoints.push(newEndpoint);
    this.uploadEndpointsService.add(this.baseUrl, newEndpoint).then(() =>
      this.saveSettings()
    ).catch(err => console.log('Add endpoint error : ', err));
  }

  async deleteEndpoint(endpoint: ILocalUploaderEndpoint) {
    this.deleteMessage = `Are your sure you want to delete endpoint: ${
      endpoint.url
    } ?`;
    const dialogRef = this.dialog.open(this.confirmModal.template);
    const result = await dialogRef.afterClosed().toPromise();
    if (result === "confirm") {
      await this.uploadEndpointsService.delete(this.baseUrl, endpoint);
      const index = this.uploadEndpoints.findIndex(e => e.url === endpoint.url);
      this.uploadEndpoints.splice(index, 1);
      this.saveSettings();
    }
  }

  async updateEndpoint(endpoint: ILocalUploaderEndpoint) {
    await this.uploadEndpointsService.delete(this.baseUrl, endpoint);
    await this.uploadEndpointsService.add(this.baseUrl, endpoint);
    const index = this.uploadEndpoints.findIndex(e => e.url === endpoint.url);
    this.uploadEndpoints[index] = Object.assign({}, endpoint);
    this.saveSettings();
  }

  openEndpointEditor() {
    this.initEndpointForm();
    const dialogRef = this.dialog.open(this.endpointEditor, {
      panelClass: ["no-padding", "mat-dialog-content-no-padding"],
      width: "350px",
      maxHeight: "90%"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === "save") {
        const newEndpoint = this.endpointForm.value;
        newEndpoint.url = `/${newEndpoint.url}`;
        newEndpoint.mime_types = this.mimeTypesAllowed.map(type => type.trim());
        if (newEndpoint.type === "single") {
          delete newEndpoint.max_file_count;
        }
        if (!newEndpoint.fetch_uploaded_file) {
          delete newEndpoint.fetch_uploaded_file_url;
          delete newEndpoint.fetch_uploaded_file_permissions;
        } else {
          newEndpoint.fetch_uploaded_file_url = `/${
            this.endpointForm.controls["fetch_uploaded_file_url"].value
          }`;
        }
        this.addEndpoint(newEndpoint);
      }
    });
  }

  editEndpoint(endpoint: ILocalUploaderEndpoint) {
    this.initEndpointFormWithValue(endpoint);
    this.selectedEndpoint = endpoint;
    const dialogRef = this.dialog.open(this.endpointEditor, {
      panelClass: ["no-padding", "mat-dialog-content-no-padding"],
      width: "350px",
      maxHeight: "90%"
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result === "save") {
        const newEndpoint = this.endpointForm.value;
        newEndpoint.url = endpoint.url;
        newEndpoint.mime_types = this.mimeTypesAllowed.map(type => type.trim());
        if (newEndpoint.type === "single") {
          delete newEndpoint.max_file_count;
        }
        if ( ! newEndpoint.fetch_uploaded_file ) {
          delete newEndpoint.fetch_uploaded_file_url;
          delete newEndpoint.fetch_uploaded_file_permissions;
        } else {
          newEndpoint.fetch_uploaded_file_url = `${endpoint.url}/:name`;
        }
        this.updateEndpoint(newEndpoint);
      }
    });
  }

  addAllowedMimeType(event) {
    if (
      event.value &&
      event.value.length > 5 &&
      this.mimeTypesAllowed.indexOf(event.value) === -1
    ) {
      this.mimeTypesAllowed.push(event.value);
    }
    if (event.input) {
      event.input.value = "";
    }
    this.mimeTypesControl.setValue(null);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    if (this.mimeTypesAllowed.indexOf(event.option.viewValue) === -1) {
      this.mimeTypesAllowed.push(event.option.viewValue);
      this.mimeTypesControl.setValue(null);
      this.mimeTypesInput.nativeElement.value = "";
    }
  }

  removeAllowedMimeType(event) {
    const index = this.mimeTypesAllowed.findIndex(t => t === event.value);
    this.mimeTypesAllowed.splice(index, 1);
  }

  private _filterMimeTypes(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.allMimeTypes.filter(
      fruit => fruit.toLowerCase().indexOf(filterValue) === 0
    );
  }

  private initEndpointForm() {
    this.mimeTypesAllowed = [];
    this.endpointForm = this.fb.group({
      type: ["single", Validators.required],
      url: ["", [Validators.required, this.urlEndpointValidator.bind(this)]],
      dest: ["uploads", Validators.required],
      input_name: ["file", Validators.required],
      size_limit: 10000000,
      permissions: [["Anyone"]],
      max_file_count: null,
      fetch_uploaded_file: false,
      fetch_uploaded_file_url: [
        { value: "", disabled: true },
        [this.fetchUrlValidator.bind(this)]
      ],
      fetch_uploaded_file_permissions: [["Anyone"]]
    });
    this.watchFormUrl();
  }

  private initEndpointFormWithValue(endpoint: ILocalUploaderEndpoint) {
    this.mimeTypesAllowed = endpoint.mime_types ? [...endpoint.mime_types] : [];
    this.endpointForm = this.fb.group({
      type: [endpoint.type ? endpoint.type : "single", Validators.required],
      url: [
        { value: endpoint.url.substr(1), disabled: true },
        Validators.required
      ],
      dest: [endpoint.dest, Validators.required],
      input_name: [endpoint.input_name, Validators.required],
      size_limit: endpoint.size_limit,
      permissions: [endpoint.permissions],
      max_file_count: endpoint.max_file_count ? endpoint.max_file_count : null,
      fetch_uploaded_file: endpoint.fetch_uploaded_file,
      fetch_uploaded_file_url: endpoint.fetch_uploaded_file
        ? [
            { value: endpoint.fetch_uploaded_file_url, disabled: true },
            [this.fetchUrlValidator.bind(this)]
          ]
        : [
            { value: `${endpoint.url.substr(1)}/:name`, disabled: true },
            [this.fetchUrlValidator.bind(this)]
          ],
      fetch_uploaded_file_permissions: endpoint.fetch_uploaded_file
        ? [endpoint.fetch_uploaded_file_permissions]
        : [["Anyone"]]
    });
    this.watchFormUrl();
  }

  private watchFormUrl() {
    this.endpointForm.controls["url"].valueChanges.subscribe(val => {
      this.endpointForm.controls["fetch_uploaded_file_url"].setValue(
        `${val}/:name`
      );
    });
  }

  private saveSettings() {
    return this.http
      .post(
        `${this.baseUrl}/addons/@materia/local-uploader/setup`,
       { endpoints: this.uploadEndpoints }
      )
      .toPromise()
      .then(() => {
        this.refreshApi.emit();
      });
  }

  private runQuery(entity: string, query: string, params?: any) {
    return this.http
      .post(`${this.baseUrl}/entities/${entity}/queries/${query}`, params)
      .toPromise();
  }

  private getLocalUploaderEndpoints() {
    return this.http
      .get(`${this.baseUrl}/addons/@materia/local-uploader/setup`)
      .toPromise()
      .then((setup: ILocalUploaderSetting) => {
        this.uploadEndpoints =
          setup && setup.endpoints && setup.endpoints.length
            ? [...setup.endpoints]
            : [];
      });
  }

  private getMateriaPermissions() {
    return this.http
      .get(`${this.baseUrl}/permissions`)
      .toPromise()
      .then((permissions: IPermission[]) => {
        this.permissions = permissions;
      });
  }

  private getMateriaEndpoints() {
    return this.http
      .get(`${this.baseUrl}/endpoints`)
      .toPromise()
      .then((endpoints: IEndpoint[]) => {
        this.endpoints = endpoints;
      });
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
