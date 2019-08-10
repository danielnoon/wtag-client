import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService implements CanActivate {
  noAuthRoutes = ['/', '/login', '/register', '/init'];
  authRoutes = ['/dash'];

  constructor(private router: Router) {}

  canActivate(route, state) {
    if (this.noAuthRoutes.includes(state.url)) {
      if (!localStorage.getItem('token') || !localStorage.getItem('apiUrl')) {
        return true;
      }
      this.router.navigateByUrl('/dash');
      return false;
    } else {
      if (localStorage.getItem('token') && localStorage.getItem('apiUrl')) {
        return true;
      }
      this.router.navigateByUrl('/login');
      return false;
    }
  }
}
