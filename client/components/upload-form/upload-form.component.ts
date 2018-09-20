import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'materia-upload-form',
  templateUrl: './upload-form.component.html',
  styleUrls: ['./upload-form.component.scss']
})
export class UploadFormComponent implements OnInit {
  @Input() type: string; // single or multiple
  @Input() url: string;
  @Input() input_name: string;
  @Output() uploadSucceed = new EventEmitter<void>();
  @ViewChild('fileInput') fileInput: ElementRef<HTMLInputElement>;

  selectedFiles: File[];
  uploading: boolean;
  uploadSuccessResponse: any;
  uploadFailResponse: string;

  constructor(private http: HttpClient, private snackBar: MatSnackBar, private cd: ChangeDetectorRef) { }

  ngOnInit() {
  }

  fileChange(event) {
    if (event.target.files && event.target.files[0]) {
      if (this.type === 'single') {
        this.selectedFiles = [event.target.files[0]];
      } else {
        this.selectedFiles = [...event.target.files];
      }
      this.cd.detectChanges();
    }
  }

  upload() {
    if (this.selectedFiles) {
      this.uploading = true;
      this.uploadFailResponse = null;
      this.uploadSuccessResponse = null;
      const data = new FormData();
      if (this.type === 'single') {
        data.append(this.input_name, this.selectedFiles[0]);
      } else {
        this.selectedFiles.forEach((file) => {
          data.append(this.input_name, file);
        });
      }
      this.http.post(this.url, data).subscribe((result: any) => {
          this.uploadSucceed.emit();
          this.uploadSuccessResponse = result;
          this.uploading = false;
      }, (err) => {
        this.uploading = false;
        let errorMessage = '';
        if (typeof err.error === 'string') {
          errorMessage = err.error;
        } else {
          errorMessage = err.error.code;
        }
        this.uploadFailResponse = errorMessage;
      });
    } else {
      this.snackBar.open('You should select a file first', 'Error');
    }
  }

  removeFile(index) {
    this.selectedFiles.splice(index, 1);
    if ( ! this.selectedFiles.length) {
      this.selectedFiles = null;
    }
  }
  refresh() {
    this.selectedFiles = null;
    this.uploadFailResponse = null;
    this.uploadSuccessResponse = null;
  }

}
