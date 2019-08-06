import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ViewChild
} from '@angular/core';
import {
  NavParams,
  ModalController,
  PopoverController,
  IonItem,
  IonInput
} from '@ionic/angular';
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
  focus = 0;
  commitSave: (tags: string[]) => void;
  @ViewChildren('suggestion') suggestions: QueryList<IonItem & { el: Element }>;
  @ViewChild('input', { static: false }) input: IonInput & { el: Element };

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
    this.commitSave = navParams.get('commitSave');
  }

  ngOnInit() {}

  removeTag(idx: number) {
    this.tags.splice(idx, 1);
    this.save();
  }

  async save() {
    console.log('wtf');
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
    if (!json.success) {
      alert('Something failed.');
    } else {
      this.commitSave(this.tags);
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
          this.tags = [...this.tags, this.newTag];
          this.newTag = '';
          this.save();
        }
      }
    }
    this.updateSuggestedTags();
  }

  chooseSuggestion(tag: string) {
    this.newTag = '';
    this.tags = [...this.tags, tag];
    this.updateSuggestedTags();
    this.save();
  }

  dismiss() {
    this.modal.dismiss({
      tags: this.tags
    });
  }
}
