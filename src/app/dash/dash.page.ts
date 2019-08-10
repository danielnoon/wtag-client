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
}
