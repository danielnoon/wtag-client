import { Component, OnInit } from '@angular/core';
import { NavParams, PopoverController } from '@ionic/angular';
import * as Fuse from 'fuse.js';

@Component({
  selector: 'app-sort',
  templateUrl: './sort.component.html',
  styleUrls: ['./sort.component.scss']
})
export class SortComponent implements OnInit {
  options = [
    {
      display: 'Name (asc)',
      value: 'name'
    },
    {
      display: 'Name (desc)',
      value: '-name'
    },
    {
      display: 'Uploaded (asc)',
      value: 'uploaded'
    },
    {
      display: 'Uploaded (desc)',
      value: '-uploaded'
    },
    {
      display: 'Modified (asc)',
      value: 'updated'
    },
    {
      display: 'Modified (desc)',
      value: '-updated'
    }
  ];

  selected: string;

  constructor(private params: NavParams, private popover: PopoverController) {
    this.selected = params.get('currentValue') || 'name';
  }

  select(value: string) {
    this.selected = value;
    this.popover.dismiss({
      newValue: value
    });
  }

  ngOnInit() {}
}
