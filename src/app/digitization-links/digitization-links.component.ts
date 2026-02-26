import { CommonModule } from '@angular/common';
import { Component, Inject, inject, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, Observable, shareReplay, take } from 'rxjs';
import { selectFullDisplayRecord, selectListViewRecord, selectViewId } from '../primo-store.service';
import { truncateWithEllipsis } from '../shared/utils';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'custom-digitization-links',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './digitization-links.component.html',
  styleUrl: './digitization-links.component.scss'
})
export class DigitizationLinksComponent implements OnInit {
  @Input() private hostComponent!: any;
  record$: Observable<any> | undefined;
  public store = inject(Store);

  isFullRecord: boolean = false;
  msg: string = '';
  viewId: string = '';
  wolfUrl: string = 'https://wolfsonian.org/research/image-rights-reproductions/';
  bibTitle: string = '';

  readonly viewId$ = this.store.select(selectViewId).pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    @Inject('MODULE_PARAMETERS') public moduleParameters: any
  ) { }

  ngOnInit() {
    const enabled = this.moduleParameters.digitizationLinksEnabled === "true";
    const msg = this.moduleParameters.digitizationLinksMsg ?? 'Request Digitization';
    const viewsParam = this.moduleParameters.digitizationLinksViews;
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

    this.msg = msg;

    this.record$ = this.store.select(selectFullDisplayRecord);
    this.record$.subscribe((record) => {
      if (record) {
        this.isFullRecord = true;
        this.bibTitle = this.updateLink(record);
      }
      else {
        this.isFullRecord = false;
      }
    });
    if (!this.isFullRecord) {
      this.record$ = this.store.select(selectListViewRecord(this.hostComponent?.searchResult?.pnx?.control?.recordid[0]));
      this.record$.subscribe((record) => {
        this.bibTitle = this.updateLink(record);
      });
    }
  }

  private updateLink(record: any): string {
    let title: string = '';
    if (record?.pnx?.display?.title) {
      title = truncateWithEllipsis(record?.pnx?.display?.title[0], 50);
    }
    return title;
  }

  public openExternal(url: string) {
    window.open(url, '_blank', 'noopener,noreferrer');
  }
}
