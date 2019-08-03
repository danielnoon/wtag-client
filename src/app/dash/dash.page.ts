import { Component, OnInit } from '@angular/core';
import { IImage } from 'src/models/image.model';
import { ModalController } from '@ionic/angular';
import { ImageEditorComponent } from '../image-editor/image-editor.component';
import { UploadComponent } from '../upload/upload.component';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.page.html',
  styleUrls: ['./dash.page.scss']
})
export class DashPage implements OnInit {
  tags: string[] = [];
  images: IImage[][] = [];
  allImages: IImage[] = [];
  part = 0;
  maxImagesPerPart = 20;
  columns = 12;

  constructor(private modalController: ModalController) {}

  ngOnInit() {
    this.getImages();
  }

  async getImages() {
    const response = await fetch(
      `https://wtag-api.supermegadex.net/api/v1/images?tags=${this.tags.join(
        ','
      )}&max=${this.maxImagesPerPart}&skip=${this.part *
        this.maxImagesPerPart}`,
      {
        headers: {
          'Auth-Token': localStorage.getItem('token')
        }
      }
    );
    const all = ((await response.json()) as { images: IImage[] }).images;
    if (all.length === 0) {
      return false;
    }
    this.allImages.push(...all);
    const rows: IImage[][] = [];
    let row = 0;
    for (const image of this.allImages) {
      if (!rows[row]) {
        rows[row] = [];
      }
      rows[row].push(image);
      if (rows[row].length >= this.columns) {
        row++;
      }
    }
    this.images = rows;
    this.part++;
    return true;
  }

  async openImageEditor(image: IImage) {
    const modal = await this.modalController.create({
      component: ImageEditorComponent,
      componentProps: {
        image
      }
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    image.tags = data.tags as string[];
  }

  async openImageUploader() {
    const modal = await this.modalController.create({
      component: UploadComponent
    });
    await modal.present();
    await modal.onDidDismiss();
    this.refresh();
  }

  async loadData(ev) {
    const loadMore = await this.getImages();
    ev.target.complete();
    if (!loadMore) {
      ev.target.disabled = true;
    }
  }

  refresh() {
    this.allImages = [];
    this.part = 0;
  }
}
