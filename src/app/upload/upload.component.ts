import { Component, OnInit } from '@angular/core';
import { FileUploader, FileLikeObject } from 'ng2-file-upload';
import { ModalController } from '@ionic/angular';
import { ApiService } from '../api.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class UploadComponent implements OnInit {
  public uploader: FileUploader;
  public hasBaseDropZoneOver = false;

  constructor(private modal: ModalController, private api: ApiService) {
    this.uploader = new FileUploader({});
  }

  ngOnInit() {}

  getFiles(): FileLikeObject[] {
    return this.uploader.queue.map(fileItem => {
      return fileItem.file;
    });
  }

  remove(idx: number) {
    this.uploader.queue.splice(idx, 1);
  }

  fileOverBase(ev): void {
    this.hasBaseDropZoneOver = ev;
  }

  reorderFiles(reorderEvent: CustomEvent): void {
    const element = this.uploader.queue.splice(reorderEvent.detail.from, 1)[0];
    this.uploader.queue.splice(reorderEvent.detail.to, 0, element);
  }

  async uploadAll() {
    const files = this.getFiles();
    this.modal.dismiss({
      files
    });
  }

  dismiss() {
    this.modal.dismiss();
  }
}
