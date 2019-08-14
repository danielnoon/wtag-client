import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ViewChild,
  AfterViewInit,
  OnDestroy
} from '@angular/core';
import {
  NavParams,
  ModalController,
  IonItem,
  IonInput,
  NavController
} from '@ionic/angular';
import { IImage } from 'src/models/image.model';
import * as Fuse from 'fuse.js';
import { ApiService } from '../api.service';
import { LightboxComponent } from '../lightbox/lightbox.component';

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.scss']
})
export class ImageEditorComponent implements OnInit, AfterViewInit, OnDestroy {
  imageUrl: string;
  hash: string;
  tags: string[];
  name: string;
  newTag: string;
  allTags: string[];
  suggestedTags: string[];
  fuse: Fuse<string>;
  focus = 0;
  controller: ModalController;
  commitSave: (hash: string, tags: string[]) => void;
  getNext: (hash: string) => IImage;
  getPrev: (hash: string) => IImage;
  @ViewChildren('suggestion') suggestions: QueryList<IonItem & { el: Element }>;
  @ViewChild('input', { static: false }) input: IonInput & { el: Element };
  keyboardListener = (ev: KeyboardEvent) => this.checkKeyboardInput(ev);

  constructor(
    navParams: NavParams,
    private modal: ModalController,
    private api: ApiService,
    private nav: NavController
  ) {
    const image = navParams.get('image') as IImage;
    this.tags = image.tags;
    this.name = image.name;
    this.hash = image.hash;
    this.imageUrl = `${image.baseUrl}/${image.hash}.${image.fileExt}`;
    this.allTags = navParams.get('allTags') as string[];
    this.fuse = new Fuse(this.allTags, {});
    this.commitSave = navParams.get('commitSave');
    this.getNext = navParams.get('next');
    this.getPrev = navParams.get('prev');
    this.controller = navParams.get('controller');
  }

  ngOnInit() {
    this.update();
  }

  ngAfterViewInit() {
    // setTimeout(() => this.input.setFocus(), 200);
    addEventListener('keydown', this.keyboardListener);
  }

  ngOnDestroy() {
    removeEventListener('keydown', this.keyboardListener);
  }

  removeTag(idx: number) {
    this.tags.splice(idx, 1);
    this.save();
  }

  checkKeyboardInput(ev: KeyboardEvent) {
    if (ev.code === 'ArrowRight' && ev.shiftKey && ev.ctrlKey) {
      this.goToNextImage();
    }
    if (ev.code === 'ArrowLeft' && ev.shiftKey && ev.ctrlKey) {
      this.goToPrevImage();
    }
  }

  async save() {
    if (this.tags.length > 1) {
      this.tags = this.tags.filter(tag => tag !== 'untagged');
    }
    if (this.tags.length === 0) {
      this.tags = ['untagged'];
    }
    const result = await this.api.request<{ success: boolean }>({
      route: 'apply-tags',
      method: 'post',
      headers: {
        'Auth-Token': localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: this.hash,
        tags: this.tags
      })
    });
    if (result.success) {
      this.commitSave(this.hash, this.tags);
    }
  }

  async update() {
    this.allTags = (await this.api.request<{ tags: string[] }>({
      route: 'tags',
      method: 'get',
      headers: {
        'Auth-Token': localStorage.getItem('token')
      }
    })).tags;
    this.fuse = new Fuse(this.allTags, {});
    const image = (await this.api.request<{ image: IImage }>({
      route: 'image',
      method: 'get',
      headers: {
        'Auth-Token': localStorage.getItem('token')
      },
      query: `hash=${this.hash}`
    })).image;
    this.tags = image.tags;
  }

  updateSuggestedTags() {
    if (this.newTag.length === 0) {
      this.suggestedTags = [];
    } else {
      const order = this.fuse.search(this.newTag);
      this.suggestedTags = order
        .map(idx => this.allTags[idx])
        .filter(tag => !this.tags.includes(tag));
    }
  }

  change(ev: KeyboardEvent) {
    if (this.tags.includes(this.newTag)) {
      this.input.color = 'danger';
    } else {
      this.input.color = 'light';
      if (ev.code === 'Enter') {
        if (this.newTag.length > 0) {
          this.tags = [...this.tags, this.newTag].sort();
          if (!this.allTags.includes(this.newTag)) {
            this.allTags.push(this.newTag);
          }
          this.newTag = '';
          this.save();
        }
      }
    }
    this.updateSuggestedTags();
  }

  chooseSuggestion(tag: string) {
    this.newTag = '';
    this.tags = [...this.tags, tag].sort();
    this.updateSuggestedTags();
    this.input.setFocus();
    this.save();
  }

  dismiss() {
    this.modal.dismiss({
      tags: this.tags
    });
  }

  async goToNextImage() {
    const nextImage = this.getNext(this.hash);
    if (nextImage) {
      this.hash = nextImage.hash;
      this.name = nextImage.name;
      this.tags = nextImage.tags;
      this.imageUrl = `${nextImage.baseUrl}/${nextImage.hash}.${
        nextImage.fileExt
      }`;
      this.update();
    }
  }

  goToPrevImage() {
    const nextImage = this.getPrev(this.hash);
    if (nextImage) {
      this.hash = nextImage.hash;
      this.name = nextImage.name;
      this.tags = nextImage.tags;
      this.imageUrl = `${nextImage.baseUrl}/${nextImage.hash}.${
        nextImage.fileExt
      }`;
      this.update();
    }
  }

  lightboxUpdate(image: IImage) {
    this.hash = image.hash;
    this.name = image.name;
    this.tags = image.tags;
    this.imageUrl = `${image.baseUrl}/${image.hash}.${image.fileExt}`;
    this.update();
  }

  async openLightbox() {
    const lightbox = await this.controller.create({
      component: LightboxComponent,
      componentProps: {
        imageUrl: this.imageUrl,
        hash: this.hash,
        next: this.getNext,
        prev: this.getPrev,
        update: (image: IImage) => this.lightboxUpdate(image)
      },
      cssClass: 'lightbox-modal'
    });
    await lightbox.present();
    await lightbox.onDidDismiss();
    setTimeout(() => this.input.setFocus(), 10);
  }
}
