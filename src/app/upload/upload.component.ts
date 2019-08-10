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
    this.uploader = new FileUploader({
      method: 'put',
      headers: [{ name: 'Auth-Token', value: localStorage.getItem('token') }],
      url: 'https://wtag-api.supermegadex.net/api/v1/new-image'
    });
  }

  ngOnInit() {}

  getFiles(): FileLikeObject[] {
    return this.uploader.queue.map(fileItem => {
      return fileItem.file;
    });
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
    const hashes: string[] = [];
    for (const file of files) {
      const fd = new FormData();
      fd.append('image', file.rawFile);
      const response = await this.api.request<{ hash: string }>({
        route: 'new-image',
        query: `name=${file.name}`,
        method: 'put',
        headers: {
          'Auth-Token': localStorage.getItem('token')
        },
        body: fd
      });
      if (response.hash) {
        hashes.push(response.hash);
        this.uploader.queue.shift();
      }
    }
    this.modal.dismiss();
  }

  dismiss() {
    this.modal.dismiss();
  }
}
