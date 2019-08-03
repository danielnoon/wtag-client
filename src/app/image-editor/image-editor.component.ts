import { Component, OnInit } from '@angular/core';
import { NavParams, ModalController } from '@ionic/angular';
import { IImage } from 'src/models/image.model';

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

  constructor(navParams: NavParams, private modal: ModalController) {
    const image = navParams.get('image') as IImage;
    this.tags = image.tags;
    this.name = image.name;
    this.hash = image.hash;
    this.imageUrl = `${image.baseUrl}/${image.hash}.${image.fileExt}`;
  }

  ngOnInit() {}

  checkCommit(ev: KeyboardEvent) {
    if (ev.code === 'Enter') {
      if (this.newTag.length > 0) {
        this.tags = [...this.tags, this.newTag];
        this.newTag = '';
      }
    }
  }

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
}
