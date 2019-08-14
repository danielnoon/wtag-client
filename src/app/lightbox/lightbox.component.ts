import { Component, ViewChild, AfterViewInit, ElementRef } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { IImage } from 'src/models/image.model';

@Component({
  selector: 'app-lightbox',
  templateUrl: './lightbox.component.html',
  styleUrls: ['./lightbox.component.scss']
})
export class LightboxComponent implements AfterViewInit {
  hash: string;
  url: string;
  hideNav = false;
  hideTimeout: NodeJS.Timer;
  prev: (hash: string) => IImage;
  next: (hash: string) => IImage;
  update: (image: IImage) => void;
  @ViewChild('events', { static: false }) events: ElementRef<HTMLInputElement>;

  constructor(params: NavParams, private modal: ModalController) {
    this.hash = params.get('hash');
    this.url = params.get('imageUrl');
    this.prev = params.get('prev');
    this.next = params.get('next');
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.events.nativeElement.focus();
    }, 10);
    setTimeout(() => (this.hideNav = true), 3000);
  }

  revealNav() {
    this.hideNav = false;
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
    }
    this.hideTimeout = setTimeout(() => (this.hideNav = true), 1000);
  }

  refocus() {
    this.events.nativeElement.focus();
  }

  listener(ev: KeyboardEvent) {
    if (ev.code === 'ArrowRight') {
      this.getNext();
    }
    if (ev.code === 'ArrowLeft') {
      this.getPrev();
    }
  }

  setUrl(image: IImage) {
    this.url = image.baseUrl + '/' + image.hash + '.' + image.fileExt;
  }

  getNext() {
    const next = this.next(this.hash);
    if (next.hash) {
      this.hash = next.hash;
      this.setUrl(next);
      this.update(next);
    }
  }

  getPrev() {
    const prev = this.prev(this.hash);
    if (prev.hash) {
      this.hash = prev.hash;
      this.setUrl(prev);
      this.update(prev);
    }
  }

  dismiss() {
    this.modal.dismiss();
  }
}
