import { Component, inject, Inject, Input, NgZone, OnInit } from '@angular/core';
import { ScriptLoaderService } from '../script-loader.service';
import { Store } from '@ngrx/store';
import { selectViewId } from '../primo-store.service';
import { distinctUntilChanged, shareReplay, take } from 'rxjs';

@Component({
  selector: 'custom-lib-chat',
  standalone: true,
  imports: [],
  templateUrl: './lib-chat.component.html',
  styleUrl: './lib-chat.component.scss'
})
export class LibChatComponent implements OnInit {
  viewId: string = '';
  ready: boolean = false;
  @Input() private hostComponent!: any;
  public store = inject(Store);
  
  readonly viewId$ = this.store.select(selectViewId).pipe(
      distinctUntilChanged(),
      shareReplay({ bufferSize: 1, refCount: true })
    );

  constructor(
    @Inject('MODULE_PARAMETERS') public moduleParameters: any,
    private scripts: ScriptLoaderService,
    private zone: NgZone,
  ) { }

  async ngOnInit(): Promise<void> {
    const enabled = this.moduleParameters.libChatEnabled === "true";
    const chatScript = this.moduleParameters.libChatScript;
    const views = this.moduleParameters.hathiAvailabilityViews;

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

    await this.zone.runOutsideAngular(() =>
      this.scripts.load(
        chatScript,
        {
          defer: true,
          async: true,
          attrs: {
            // crossorigin: 'anonymous',
            // integrity: 'sha384-...',  // add if the CDN provides one
            // nonce: 'your-csp-nonce',  // if your CSP requires nonce
          },
        }
      )
    );

    this.ready = true;
  }
}