import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

interface INamedTags {
  fileName: string;
  tags: string[];
}

interface INamedHash {
  fileName: string;
  hash: string;
}

@Injectable({
  providedIn: 'root'
})
export class ImportService {
  queue: INamedTags[] = [];
  waitingToReceive: INamedHash[] = [];

  constructor(private api: ApiService) {}

  formatTags(tags: string) {
    const arr = tags
      .toLowerCase()
      .split(',')
      .concat('autotagged');
    const set = new Set(arr);
    const dedup = Array.from(set);
    return dedup.sort();
  }

  async addTags(namedTags: INamedTags) {
    const adjustedName = {
      fileName: namedTags.fileName
        .split('.')
        .reverse()
        .slice(1)
        .reverse()
        .join('.'),
      tags: namedTags.tags
    };
    const waiting = this.waitingToReceive.find(
      item => item.fileName === adjustedName.fileName
    );
    if (waiting) {
      return await this.submitTags(waiting.hash, adjustedName.tags);
    } else {
      this.queue.push(adjustedName);
      return true;
    }
  }

  async publish(namedHash: INamedHash) {
    const waiting = this.queue.find(
      item => item.fileName === namedHash.fileName
    );
    if (waiting) {
      return await this.submitTags(namedHash.hash, waiting.tags);
    } else {
      this.waitingToReceive.push(namedHash);
      return true;
    }
  }

  async submitTags(hash: string, tags: string[]) {
    console.log('Applying tags!');
    const result = await this.api.request<{ success: boolean }>({
      route: 'apply-tags',
      method: 'post',
      headers: {
        'Auth-Token': localStorage.getItem('token'),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        image: hash,
        tags
      })
    });
    if (result.success) {
      return true;
    } else {
      return false;
    }
  }
}
