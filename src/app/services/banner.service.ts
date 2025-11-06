import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BannerService {

  constructor(private http: HttpClient) {}

  getBanner(url: string): Observable<string> {
    return this.http.get(url, { responseType: 'text' });
  }
}
