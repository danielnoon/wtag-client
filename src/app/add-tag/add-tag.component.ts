import { Component, OnInit } from '@angular/core';
import { NavParams } from '@ionic/angular';
import * as Fuse from 'fuse.js';

@Component({
  selector: 'app-add-tag',
  templateUrl: './add-tag.component.html',
  styleUrls: ['./add-tag.component.scss']
})
export class AddTagComponent implements OnInit {
  newTag = '';
  allTags: string[] = ['no tags available'];
  suggestedTags: string[];
  commit: (tag: string) => void;
  fuse: Fuse<string>;

  constructor(params: NavParams) {
    this.allTags = params.get('allTags');
    this.commit = params.get('commit');
    this.fuse = new Fuse(this.allTags, {});
  }

  updateSuggestedTags() {
    if (this.newTag.length === 0) {
      this.suggestedTags = [];
    } else {
      const order = this.fuse.search(this.newTag);
      this.suggestedTags = order.map(idx => this.allTags[idx]);
    }
  }

  change(ev: KeyboardEvent) {
    if (ev.code === 'Enter') {
      this.commit(this.newTag);
      this.newTag = '';
    }
    this.updateSuggestedTags();
  }

  chooseSuggestion(tag: string) {
    this.newTag = '';
    this.commit(tag);
    this.updateSuggestedTags();
  }

  ngOnInit() {}
}
