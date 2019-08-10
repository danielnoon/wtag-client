import { Component, OnInit } from '@angular/core';
import { ApiService } from '../api.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-init',
  templateUrl: './init.page.html',
  styleUrls: ['./init.page.scss']
})
export class InitPage implements OnInit {
  authCode = '';
  loading = false;
  url = localStorage.getItem('apiUrl') || '';
  urlReady = false;

  constructor(private api: ApiService, private loader: LoadingController) {}

  ngOnInit() {
    if (this.url) {
      this.getAuthCode();
    }
  }

  async getAuthCode() {
    this.loading = true;
    const correct = await this.api.checkApiUrl(this.url);
    const spinny = await this.loader.create({
      message: 'Fetching Auth Code',
      duration: 4000
    });
    await spinny.present();
    if (correct) {
      localStorage.setItem('apiUrl', this.url);
      this.urlReady = true;
      const { authCode } = await this.api.request({
        route: 'init',
        method: 'get'
      });

      if (authCode) {
        this.authCode = authCode;
        localStorage.initCode = authCode;
      }

      this.loading = false;
    }
    spinny.dismiss();
  }
}
