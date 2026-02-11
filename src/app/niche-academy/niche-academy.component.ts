import { Component, inject, Inject, Input, NgZone, OnInit } from '@angular/core';
import { ScriptLoaderService } from '../script-loader.service';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, shareReplay, take } from 'rxjs';

@Component({
  selector: 'custom-niche-academy',
  standalone: true,
  imports: [],
  templateUrl: './niche-academy.component.html',
  styleUrl: './niche-academy.component.scss'
})

export class NicheAcademyComponent implements OnInit {

  @Input() private hostComponent!: any;
  public store = inject(Store);

  constructor(
    @Inject('MODULE_PARAMETERS') public moduleParameters: any,
    private scripts: ScriptLoaderService,
    private zone: NgZone,
  ) { }

  async ngOnInit(): Promise<void> {
    const enabled = this.moduleParameters.nicheAcademyEnabled === "true";
    const nicheAcademyScript = this.moduleParameters.nicheAcademyScript;

    if (!enabled) {
      return;
    }

    await this.zone.runOutsideAngular(() =>
      this.scripts.load(
        nicheAcademyScript,
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

    window.dispatchEvent(new Event("na-widget-reload"));
  }
}
