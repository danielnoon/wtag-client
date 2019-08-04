import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController, PopoverController } from '@ionic/angular';
import { IImage } from 'src/models/image.model';
import { AddTagComponent } from '../add-tag/add-tag.component';
import * as Fuse from 'fuse.js';

@Component({
  selector: 'app-image-editor',
  templateUrl: './image-editor.component.html',
  styleUrls: ['./image-editor.component.scss']
})
export class ImageEditorComponent implements OnInit {
  imageUrl: string;
  hash: string;
  tags: string[];
  name: string;
  newTag: string;
  allTags: string[];
  suggestedTags: string[];
  fuse: Fuse<string>;

  constructor(
    navParams: NavParams,
    private modal: ModalController,
    private popover: PopoverController
  ) {
    const image = navParams.get('image') as IImage;
    this.tags = image.tags;
    this.name = image.name;
    this.hash = image.hash;
    this.imageUrl = `${image.baseUrl}/${image.hash}.${image.fileExt}`;
    this.allTags = navParams.get('allTags') as string[];
    this.fuse = new Fuse(this.allTags, {});
  }

  ngOnInit() {}

  removeTag(idx: number) {
    this.tags.splice(idx, 1);
  }

  async save() {
    if (this.tags.length > 1) {
      this.tags = this.tags.filter(tag => tag !== 'untagged');
    }
    if (this.tags.length === 0) {
      this.tags = ['untagged'];
    }
    const result = await fetch(
      'https://wtag-api.supermegadex.net/api/v1/apply-tags',
      {
        method: 'post',
        headers: {
          'Auth-Token': localStorage.getItem('token'),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: this.hash,
          tags: this.tags
        })
      }
    );
    const json = (await result.json()) as { success: boolean };
    if (json.success) {
      this.modal.dismiss({
        tags: this.tags
      });
    }
  }

  async openAddTagPopover(ev: MouseEvent) {
    const pop = await this.popover.create({
      component: AddTagComponent,
      event: ev,
      componentProps: {
        commit: (tag: string) => (this.tags = [...this.tags, tag]),
        allTags: this.allTags
      }
    });
    await pop.present();
  }

  updateSuggestedTags() {
    if (this.newTag.length === 0) {
      this.suggestedTags = [];
    } else {
      const order = this.fuse.search(this.newTag);
      this.suggestedTags = order.slice(0, 5).map(idx => this.allTags[idx]);
    }
  }

  change(ev: KeyboardEvent) {
    if (ev.code === 'Enter') {
      if (this.newTag.length > 0) {
        this.tags = [...this.tags, this.newTag];
        this.newTag = '';
      }
    }
    this.updateSuggestedTags();
  }

  chooseSuggestion(tag: string) {
    this.newTag = '';
    this.tags = [...this.tags, tag];
    this.updateSuggestedTags();
  }

  dismiss() {
    this.modal.dismiss();
  }
}
