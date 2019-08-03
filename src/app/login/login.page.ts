import { Component } from '@angular/core';
import { sha256 } from 'sha.js';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss']
})
export class LoginPage {
  username: string;
  password: string;

  constructor() {}

  async login() {
    console.log(`Hello, ${this.username}!`);
    const hashedPw = new sha256().update(this.password + 'wtag').digest('hex');
    console.log(`Your hashed password is ${hashedPw}`);
    const result = await fetch(
      'https://wtag-api.supermegadex.net/api/v1/login',
      {
        method: 'post',
        body: JSON.stringify({ username: this.username, password: hashedPw }),
        headers: { 'Content-Type': 'application/json' }
      }
    );
    console.log(await result.json());
  }
}
