import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, forkJoin, map, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HathiAvailabilityService {

  constructor(private http: HttpClient) { }
  hathiTrustBaseUrl = 'https://catalog.hathitrust.org/api/volumes/brief/json/';

  lookup(ids: string[]): Observable<any> {

    if (ids && ids.length > 0) {
      const maxIdsPerRequest = 20;
      const chunks: string[][] = [];
      for (let i = 0; i < ids.length; i += maxIdsPerRequest) {
        chunks.push(ids.slice(i, i + maxIdsPerRequest));
      }

      const requests = chunks.map(chunk => {
        const hathiTrustLookupUrl = this.hathiTrustBaseUrl + chunk.join('|');
        return this.http.jsonp(hathiTrustLookupUrl, 'callback').pipe(
          catchError(this.handleError)
        );
      });

      return forkJoin(requests).pipe(
        map(responses => {
          return responses.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        })
      );
    } else {
      return of(null);
    }
  };

  findRecord(ids: string[]): Observable<string | null> {
    return this.lookup(ids).pipe(map((bibData) => {
      for (var i = 0; i < ids.length; i++) {
        var recordId = Object.keys(bibData[ids[i]].records)[0];
        if (recordId) {
          return bibData[ids[i]].records[recordId].recordURL;
        }
      }
      return null;
    }
    ));
  };

  findFullViewRecord(ids: string[]): Observable<string | null> {
    return this.lookup(ids).pipe(map((bibData) => {
      var fullTextUrl = null;
      for (var i = 0; !fullTextUrl && i < ids.length; i++) {
        var result = bibData[ids[i]];
        if (result) {
          for (var j = 0; j < result.items.length; j++) {
            var item = result.items[j];
            if (item.usRightsString.toLowerCase() === 'full view') {
              fullTextUrl = result.records[item.fromRecord].recordURL;
              break;
            }
          }
        }
      }
      return fullTextUrl;
    }
    ));
  };

  findFullViewRecordItems(ids: string[], filter: boolean): Observable<HathiSearchItem[] | null> {
    return this.lookup(ids).pipe(map((bibData) => {
      var items: HathiSearchItem[] = [];
      for (var i = 0; i < ids.length; i++) {
        var result = bibData[ids[i]];
        if (result) {
          for (var j = 0; j < result.items.length; j++) {
            var item = result.items[j];
            if (filter) {
              if ("htid:" + item.htid === ids[i] && (item.rightsCode === 'pdus' || item.rightsCode === 'pd' || item.rightsCode.startsWith('cc-'))) {
                items.push({ htid: item.htid, enumcron: item.enumcron, itemURL: item.itemURL, rightsCode: item.rightsCode, orig: item.orig });
              }
            }
            else {
              if ("htid:" + item.htid === ids[i]) {
                items.push({ htid: item.htid, enumcron: item.enumcron, itemURL: item.itemURL, rightsCode: item.rightsCode, orig: item.orig });
              }
            }
          }
        }
      }
      return items;
    }
    ));
  };

  private handleError(error: HttpErrorResponse) {
    // Return an observable with a user-facing error message.
    console.error(
      `Error retrieving HathiTrust information: Backend returned code ${error.status}: `,
      error.error
    );
    return throwError(() => new Error('Something went wrong'))
  }
}


export interface HathiSearchItem {
  htid: string | null;
  itemURL: string | null;
  rightsCode: string | null;
  enumcron: string | null;
  orig: string | null;
}