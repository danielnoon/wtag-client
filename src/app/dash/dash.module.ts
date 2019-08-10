import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { FileUploadModule } from 'ng2-file-upload';

import { IonicModule } from '@ionic/angular';

import { DashPage } from './dash.page';
import { ImageEditorComponent } from '../image-editor/image-editor.component';
import { UploadComponent } from '../upload/upload.component';
import { SortComponent } from '../sort/sort.component';
import { LightboxComponent } from '../lightbox/lightbox.component';
import { LogoutComponent } from '../logout/logout.component';

const routes: Routes = [
  {
    path: '',
    component: DashPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FileUploadModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
    DashPage,
    ImageEditorComponent,
    UploadComponent,
    SortComponent,
    LightboxComponent,
    LogoutComponent
  ],
  entryComponents: [
    ImageEditorComponent,
    UploadComponent,
    SortComponent,
    LightboxComponent,
    LogoutComponent
  ]
})
export class DashPageModule {}
