import { Component, OnInit } from '@angular/core';
import { sha256 } from 'sha.js';
import { Router } from '@angular/router';
import { ApiService } from '../api.service';
import { LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage {
  username = '';
  password = '';
  url = localStorage.getItem('apiUrl') || '';
  accessCode = localStorage.getItem('initCode') || '';

  constructor(
    private router: Router,
    private api: ApiService,
    private loader: LoadingController
  ) {}

  submit() {
    this.register();
  }

  async register() {
    if (!this.accessCode || !this.username || !this.password || !this.url) {
      this.api.error('All fields are required.');
      return;
    }
    const spinny = await this.loader.create({
      message: 'Registering'
    });
    await spinny.present();
    const correct = await this.api.checkApiUrl(this.url);
    if (correct) {
      const hashedPassword = new sha256()
        .update(this.password + 'wtag')
        .digest('hex');
      const response = await this.api.request<{ token: string }>({
        route: 'register',
        method: 'post',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.username,
          password: hashedPassword,
          accessCode: this.accessCode
        })
      });
      if (response.token) {
        localStorage.setItem('token', response.token);
        this.router.navigateByUrl('/dash');
      }
    }
    spinny.dismiss();
  }
}
