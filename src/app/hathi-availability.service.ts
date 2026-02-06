import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HathiAvailabilityService {

  constructor(private http: HttpClient) { }
  hathiTrustBaseUrl = 'https://catalog.hathitrust.org/api/volumes/brief/json/';

  lookup(ids: []): Observable<any> {

    if (ids && ids.length > 0) {
      var hathiTrustLookupUrl = this.hathiTrustBaseUrl + ids.join('|');
      const req$ = this.http.jsonp(hathiTrustLookupUrl, 'callback').pipe(
        map(response => { return response; }),
        catchError(this.handleError));
      return req$;
    } else {
      return of(null);
    }
  };

  findRecord(ids: []): Observable<string | null> {
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

  findFullViewRecord(ids: []): Observable<string | null> {
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

  private handleError(error: HttpErrorResponse) {
    // Return an observable with a user-facing error message.
    console.error(
      `Error retrieving HathiTrust information: Backend returned code ${error.status}: `,
      error.error
    );
    return throwError(() => new Error('Something went wrong'))
  }
}
