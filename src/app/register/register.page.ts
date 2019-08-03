import { Component, OnInit } from '@angular/core';
import { sha256 } from 'sha.js';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss']
})
export class RegisterPage {
  username = '';
  password = '';
  accessCode = '';

  constructor(private router: Router) {}

  async register() {
    const hashedPassword = new sha256()
      .update(this.password + 'wtag')
      .digest('hex');
    const response = await fetch(
      'https://wtag-api.supermegadex.net/api/v1/register',
      {
        method: 'post',
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
    const json = (await response.json()) as { token: string };
    localStorage.setItem('token', json.token);
    this.router.navigateByUrl('/dash');
  }
}
