import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import {
  MatButtonModule,
  MatRippleModule,
  MatSnackBarModule,
  MatCardModule,
  MatIconModule,
  MatDialogModule,
  MatInputModule,
  MatProgressSpinnerModule,
  MatListModule,
  MatExpansionModule,
  MatTooltipModule,
  MatDividerModule,
  MatSelectModule,
  MatOptionModule,
  MatToolbarModule,
  MatChipsModule,
  MatMenuModule,
  MatBadgeModule,
  MatTableModule
} from '@angular/material';

import { Addon } from '@materia/addons';

import { LocalUploaderViewComponent } from './local-uploader-view/local-uploader-view.component';
import { UploadFormComponent } from './components/upload-form/upload-form.component';
import { BytePipe } from './pipes/byte.pipe';
import { ConfirmModalComponent } from './dialogs/confirm-modal';

@Addon('@materia/local-uploader')
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatRippleModule,
    MatButtonModule,
    MatSnackBarModule,
    MatCardModule,
    MatIconModule,
    MatDialogModule,
    MatInputModule,
    MatProgressSpinnerModule,
    FlexLayoutModule,
    MatListModule,
    MatExpansionModule,
    MatTooltipModule,
    MatDividerModule,
    MatSelectModule,
    MatOptionModule,
    MatToolbarModule,
    MatChipsModule,
    MatMenuModule,
    MatBadgeModule,
    MatTableModule
  ],
  declarations: [LocalUploaderViewComponent, UploadFormComponent, BytePipe, ConfirmModalComponent],
  exports: [LocalUploaderViewComponent]
})
export class LocalUploaderModule {}
