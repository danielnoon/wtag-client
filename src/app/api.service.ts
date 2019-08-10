import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { ToastController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  constructor(private toastController: ToastController) {}

  getBaseUrl() {
    return localStorage.getItem('apiUrl') || environment.apiUrl;
  }

  constructEndpoint(route: string, query?: string) {
    return `${this.getBaseUrl()}/api/v1/${route}${query ? '?' + query : ''}`;
  }

  async request<T>(options: {
    route: string;
    method: 'get' | 'post' | 'put' | 'delete';
    headers?: any;
    query?: string;
    body?: string | FormData;
  }): Promise<T> {
    try {
      const { route, method, headers, query, body } = options;
      const response = await fetch(this.constructEndpoint(route, query), {
        method,
        headers,
        body
      });
      const json = await response.json();
      if (json.statusCode && json.statusCode >= 400) {
        this.error(json.message);
      }
      return json as T;
    } catch (err) {
      this.error(err);
    }
  }

  async checkApiUrl(url: string) {
    const response = await fetch(url);
    const txt = await response.text();
    if (txt === 'Hello World!') {
      return true;
    } else {
      this.error('Provided API URL is not valid.');
      return false;
    }
  }

  async error(message: string) {
    const toast = await this.toastController.create({
      color: 'danger',
      message,
      showCloseButton: true,
      // enterAnimation:
      position: 'bottom',
      duration: 4000
    });
    toast.present();
  }
}
