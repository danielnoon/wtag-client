import { Component, OnInit, ViewChild } from '@angular/core';
import { IImage } from 'src/models/image.model';
import {
  ModalController,
  IonInfiniteScroll,
  PopoverController
} from '@ionic/angular';
import { ImageEditorComponent } from '../image-editor/image-editor.component';
import { UploadComponent } from '../upload/upload.component';
import { ApiService } from '../api.service';
import { SortComponent } from '../sort/sort.component';
import { LogoutComponent } from '../logout/logout.component';
import { Router } from '@angular/router';
import { FileLikeObject } from 'ng2-file-upload';

@Component({
  selector: 'app-dash',
  templateUrl: './dash.page.html',
  styleUrls: ['./dash.page.scss']
})
export class DashPage implements OnInit {
  tags = '';
  allTags: string[] = [];
  images: IImage[][] = [];
  allImages: IImage[] = [];
  part = 0;
  maxImagesPerPart = 500;
  columns = 3;
  sortBy = 'name';
  showUploader = false;
  uploadProgress = 0.75;
  uploadTotal = 100;
  uploadLeft = 25;
  uploadETR = 2;
  uploadImageOrImages = 'images';
  uploadMinuteOrMinutes = 'minutes';
  @ViewChild(IonInfiniteScroll, { static: false })
  infiniteScroll: IonInfiniteScroll;

  constructor(
    private modalController: ModalController,
    private api: ApiService,
    private popover: PopoverController,
    private router: Router
  ) {}

  async ngOnInit() {
    this.updateTags();
    this.updateColumns();
    this.getImages();
  }

  async updateTags() {
    const response = await this.api.request<{ tags: string[] }>({
      route: 'tags',
      method: 'get',
      headers: {
        'Auth-Token': localStorage.getItem('token')
      }
    });
    this.allTags = response.tags;
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
    const response = await this.api.request<{ images: IImage[] }>({
      route: 'images',
      method: 'get',
      query: `tags=${this.tags}&max=${this.maxImagesPerPart}&skip=${this.part *
        this.maxImagesPerPart}&sort-by=${this.sortBy}`,
      headers: {
        'Auth-Token': localStorage.getItem('token')
      }
    });
    const all = response.images;
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
        image,
        allTags: this.allTags,
        commitSave: (tags: string[]) => {
          console.log(tags);
          image.tags = tags;
        }
      }
    });
    await modal.present();
    await modal.onDidDismiss();
    this.updateTags();
  }

  async openImageUploader() {
    const modal = await this.modalController.create({
      component: UploadComponent
    });
    await modal.present();
    const { data } = await modal.onDidDismiss();
    if (data.files as FileLikeObject[]) {
      await this.uploadAll(data.files);
      this.refresh();
    }
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
    this.updateTags();
    this.getImages();
  }

  async openSortPopover(ev: MouseEvent) {
    const po = await this.popover.create({
      event: ev,
      component: SortComponent,
      componentProps: {
        currentValue: this.sortBy
      }
    });
    await po.present();
    const { data } = await po.onDidDismiss();
    if (data.newValue) {
      if (data.newValue !== this.sortBy) {
        this.sortBy = data.newValue;
        this.refresh();
      }
    }
  }

  async openLogoutPopover(event: MouseEvent) {
    const pop = await this.popover.create({
      component: LogoutComponent,
      event
    });
    await pop.present();
    const { data } = await pop.onDidDismiss();
    if (data.setting as string) {
      if (data.setting === 'logout') {
        localStorage.removeItem('token');
        this.router.navigateByUrl('/login');
      } else if (data.setting === 'nuke') {
        localStorage.clear();
        this.router.navigateByUrl('/login');
      }
    }
  }

  track(idx: number, item: IImage[]) {
    return item.map(img => img.hash).join('');
  }

  async uploadAll(files: FileLikeObject[]) {
    const hashes: string[] = [];
    const times: number[] = [];
    this.uploadTotal = files.length;
    this.uploadLeft = files.length;
    this.uploadImageOrImages = files.length === 1 ? 'image' : 'images';
    this.uploadProgress = 0;
    this.uploadETR = Math.round((5 * this.uploadTotal) / 60);
    this.uploadMinuteOrMinutes = this.uploadETR === 1 ? 'minute' : 'minutes';
    this.showUploader = true;
    for (const file of files) {
      const start = Date.now();
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
      }
      const time = Date.now() - start;
      times.push(time);
      this.uploadLeft--;
      this.uploadProgress =
        (this.uploadTotal - this.uploadLeft) / this.uploadTotal;
      this.uploadETR = Math.round(
        ((times.reduce((acc, cur) => acc + cur, 0) / times.length) *
          this.uploadLeft) /
          1000 /
          60
      );
      this.uploadMinuteOrMinutes = this.uploadETR === 1 ? 'minute' : 'minutes';
    }
    this.showUploader = false;
  }
}
