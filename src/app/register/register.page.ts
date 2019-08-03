import { Component, OnInit } from '@angular/core';
import { sha256 } from 'sha.js';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage {
  username = '';
  password = '';
  accessCode = '';

  constructor() {}

  async register() {
    const hashedPassword = new sha256()
      .update(this.password + 'wtag')
      .digest('hex');
    const response = await fetch(
      'https://wtag-api.supermegadex.net/api/v1/register',
      {
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: this.username,
          password: hashedPassword,
          accessCode: this.accessCode
        })
      }
    );
    console.log(await response.json());
  }
}
