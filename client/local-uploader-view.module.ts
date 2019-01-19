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
  MatTableModule,
  MatCheckboxModule,
  MatAutocompleteModule
} from '@angular/material';

import { Addon } from '@materia/addons';

import { LocalUploaderViewComponent } from './components/local-uploader-view/local-uploader-view.component';
import { UploadFormComponent } from './components/upload-form/upload-form.component';
import { BytePipe } from './pipes/byte.pipe';
import { ConfirmModalComponent } from './dialogs/confirm-modal';
import { MateriaEndpointsService } from './services/materia-endpoints.service';
import { UploadEndpointsService } from './services/upload-endpoints.service';
import { HttpClientModule } from '@angular/common/http';

@Addon('@materia/local-uploader')
@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
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
    MatTableModule,
    MatCheckboxModule,
    MatAutocompleteModule
  ],
  declarations: [LocalUploaderViewComponent, UploadFormComponent, BytePipe, ConfirmModalComponent],
  exports: [LocalUploaderViewComponent],
  providers: []
})
export class LocalUploaderModule {}
