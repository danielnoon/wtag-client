import { Component, OnInit } from '@angular/core';
import { PopoverController } from '@ionic/angular';

@Component({
  selector: 'app-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss']
})
export class LogoutComponent implements OnInit {
  constructor(private popover: PopoverController) {}

  ngOnInit() {}

  dismiss(setting: string) {
    this.popover.dismiss({
      setting
    });
  }
}
