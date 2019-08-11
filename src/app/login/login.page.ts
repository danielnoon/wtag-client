import { Component } from '@angular/core';
import { sha256 } from 'sha.js';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  username: string;
  password: string;
  url = localStorage.getItem('apiUrl') || '';

  constructor(
    private router: Router,
    private api: ApiService,
    private loader: LoadingController
  ) {}

  submit() {
    this.login();
  }

  async login() {
    if (!this.username || !this.password || !this.url) {
      this.api.error('All fields are required.');
      return;
    }
    const spinny = await this.loader.create({
      message: 'Logging in'
    });
    await spinny.present();
    const correct = await this.api.checkApiUrl(this.url);
    if (correct) {
      localStorage.setItem('apiUrl', this.url);
      const hashedPw = new sha256()
        .update(this.password + 'wtag')
        .digest('hex');
      const result = await this.api.request<{ token: string }>({
        route: 'login',
        method: 'post',
        body: JSON.stringify({ username: this.username, password: hashedPw }),
        headers: { 'Content-Type': 'application/json' }
      });
      if (result.token) {
        localStorage.setItem('token', result.token);
        this.router.navigateByUrl('/dash');
      }
    }
    spinny.dismiss();
  }
}
