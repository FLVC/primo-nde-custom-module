import { Component, ElementRef, inject, Inject, Input, Renderer2 } from '@angular/core';
import { Store } from '@ngrx/store';
import { CommonModule } from '@angular/common';
import { distinctUntilChanged, Observable, shareReplay, take, tap } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { selectFullDisplayRecord, selectListViewRecord, selectViewId } from '../primo-store.service';

@Component({
  selector: 'custom-hathi-request',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTooltipModule],
  templateUrl: './hathi-request.component.html',
  styleUrl: './hathi-request.component.scss'
})

export class HathiRequestComponent {

  store = inject(Store);
  record$: Observable<any> | undefined;
  @Input() hostComponent!: any;
  viewId: string = '';

  showAction: boolean = false;
  isFullRecord: boolean = false;
  recordId: string = '';
  title: string = "";
  isbn: string = "";
  oclc: string = "";
  author: string = "";
  edition: string = "";
  imprint: string = "";
  hathiTag: string = "";

  readonly viewId$ = this.store.select(selectViewId).pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private elementRef: ElementRef,
    private renderer: Renderer2,
    @Inject('MODULE_PARAMETERS') public moduleParameters: any,
  ) { }

  ngOnInit(): void {
    const enabled = this.moduleParameters.hathiRequestEnabled === "true";
    const viewsParam = this.moduleParameters.hathiRequestViews;
    const views = viewsParam?.replace(/^\[|\]$/g, "").split(",").map((s: string) => s.trim());

    if (!enabled) {
      return;
    }

    this.viewId$
      .pipe(take(1))
      .subscribe(code => {
        this.viewId = code ?? '';
      });

    if (views != undefined && !views.includes(this.viewId)) {
      console.log('No matching view found for ' + this.viewId + ' options are ' + views)
      return;
    }

    this.record$ = this.store.select(selectFullDisplayRecord);
    this.record$.subscribe((record) => {
      if (record) {
        this.isFullRecord = true;
        this.showAction = false;
        this.hathiTag = this.getFirstValue(record.pnx?.display?.lds62);
        if (this.hathiTag == "HATHI-IC" || this.hathiTag == "HATHI-OP") {
          this.title = this.getFirstValue(record.pnx?.display?.title);
          this.isbn = this.getFirstValue(record.pnx?.addata?.isbn);
          this.oclc = this.getFirstOCLC(record.pnx?.addata?.oclcid);
          this.author = this.getFirstValue(record.pnx?.addata?.au) == '' ? this.getFirstValue(record.pnx?.addata?.addau) : this.getFirstValue(record.pnx?.addata?.au);
          this.edition = this.getFirstValue(record.pnx?.addata?.edition);
          this.imprint = this.getFirstValue(record.pnx?.addata?.pub) + ", " + this.getFirstValue(record.pnx?.addata?.date);
          this.showAction = true;
          setTimeout(() => {
            const targetDiv = this.findClosestTargetInHost();

            if (targetDiv) {
              const currentElement = this.elementRef.nativeElement;

              while (currentElement.firstChild) {
                this.renderer.appendChild(targetDiv, currentElement.firstChild);
              }
            }
          }, 0);
        }
      }
      else {
        this.isFullRecord = false;
      }
    });

    if (!this.isFullRecord) {
      this.record$ = this.store.select(selectListViewRecord(this.hostComponent?.searchResult?.pnx?.control?.recordid[0]));
      this.record$.subscribe((record) => {
        if (record && record.pnx && record.pnx.display) {
          this.hathiTag = this.getFirstValue(record.pnx?.display?.lds62);
          if (this.hathiTag == "HATHI-IC" || this.hathiTag == "HATHI-OP") {
            this.title = this.getFirstValue(record.pnx?.display?.title);
            this.isbn = this.getFirstValue(record.pnx?.addata?.isbn);
            this.oclc = this.getFirstOCLC(record.pnx?.addata?.oclcid);
            this.author = this.getFirstValue(record.pnx?.addata?.au) == '' ? this.getFirstValue(record.pnx?.addata?.addau) : this.getFirstValue(record.pnx?.addata?.au);
            this.edition = this.getFirstValue(record.pnx?.addata?.edition);
            this.imprint = this.getFirstValue(record.pnx?.addata?.pub) + ", " + this.getFirstValue(record.pnx?.addata?.date);
            this.showAction = true;
            setTimeout(() => {
              const targetDiv = this.findClosestTargetInHost();

              if (targetDiv) {
                const currentElement = this.elementRef.nativeElement;

                while (currentElement.firstChild) {
                  this.renderer.appendChild(targetDiv, currentElement.firstChild);
                }
              }
            }, 0);
          }
        }
      });
    }
  }

  private findClosestTargetInHost(): HTMLElement | null {
    let current: HTMLElement | null = this.elementRef.nativeElement.parentElement;

    while (current && current !== document.body) {
      if (current.classList.contains('record-actions-container')) {
        return current;
      }

      const found = current.querySelector('.record-actions-container');
      if (found) {
        return found as HTMLElement;
      }

      current = current.parentElement;
    }

    return null;
  }

  private getFirstValue(data: string[]): string {
    if (data) {
      return data[0] ?? "";
    } else {
      return "";
    }
  }

  private getFirstOCLC(data: string[]): string {
    if (data) {
      for (let i = 0; i < data.length; i++) {
        let pos = data[i].toLowerCase().indexOf("(ocolc)");
        if (pos >= 0) {
          return data[i].substring(pos + 7);
        }
      }
    } else {
      return "";
    }
    return "";
  }

  public processLink() {
    let processedLink: string = "https://alma-apps.flvc.org/alma-form-email/email.jsp?inst=XXX&bib=" +
      encodeURIComponent(this.title) +
      ";;;" +
      encodeURIComponent(this.author) +
      ";;;" +
      encodeURIComponent(this.imprint) +
      ";;;" +
      encodeURIComponent(this.edition) +
      ";;;" +
      encodeURIComponent(this.isbn) +
      ";;;" +
      encodeURIComponent(this.oclc);
    window.open(processedLink, '_blank');
  }
}