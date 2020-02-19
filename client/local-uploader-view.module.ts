import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule, MatOptionModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';

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
