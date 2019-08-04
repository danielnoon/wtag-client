import { Component, OnInit, ViewChild } from '@angular/core';
import { IImage } from 'src/models/image.model';
import { ModalController, IonInfiniteScroll } from '@ionic/angular';
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
  columns = 3;
  @ViewChild(IonInfiniteScroll, { static: false })
  infiniteScroll: IonInfiniteScroll;

  constructor(private modalController: ModalController) {}

  async ngOnInit() {
    this.updateColumns();
    await this.getImages();
    await this.getImages();
    await this.getImages();
  }

  updateColumns() {
    const w = window.innerWidth;
    if (w <= 320) {
      this.columns = 2;
    } else if (w <= 425) {
      this.columns = 3;
    } else if (w <= 768) {
      this.columns = 4;
    } else if (w <= 1024) {
      this.columns = 6;
    } else if (w <= 1440) {
      this.columns = 8;
    } else {
      this.columns = 12;
    }
  }

  async getImages() {
    const response = await fetch(
      `https://wtag-api.supermegadex.net/api/v1/images?tags=${this.tags}&max=${
        this.maxImagesPerPart
      }&skip=${this.part * this.maxImagesPerPart}`,
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

  async refresh() {
    this.infiniteScroll.disabled = false;
    this.allImages = [];
    this.part = 0;
    await this.getImages();
    await this.getImages();
    this.getImages();
  }
}
