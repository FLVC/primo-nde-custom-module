import { Component, inject, Inject, Input, NgZone, OnInit, Renderer2 } from '@angular/core';
import { distinctUntilChanged, shareReplay, take } from 'rxjs';
import { selectViewId } from '../primo-store.service';
import { Store } from '@ngrx/store';

@Component({
  selector: 'custom-uborrow-volume',
  standalone: true,
  imports: [],
  templateUrl: './uborrow-volume.component.html',
  styleUrl: './uborrow-volume.component.scss'
})
export class UborrowVolumeComponent implements OnInit {

  showAction: boolean = false;
  viewId: string = "";
  @Input() private hostComponent!: any;
  public store = inject(Store);

  readonly viewId$ = this.store.select(selectViewId).pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    @Inject('MODULE_PARAMETERS') public moduleParameters: any,
    private zone: NgZone,
    private renderer: Renderer2,
  ) { }

  ngOnInit(): void {
    const enabled = this.moduleParameters.uborrowVolumeEnabled === "true";
    const viewsParam = this.moduleParameters.uborrowVolumeViews;
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

    this.hostComponent.isLoading$.subscribe((isLoading: any) => {
      if (!isLoading) {
        var requestType = this.hostComponent.formType;
        if (requestType === 'AlmaRequest') {
          return;
        }

        const sub = this.zone.onStable.subscribe(() => {
          const volumeCtrl = this.hostComponent.form.get('volume');
          // Update selector to match Formly rendering with data-qa attribute
          const element = (document.querySelector('[data-qa="almaResourceSharing.volume"] input') || 
                           document.querySelector('input[formcontrolname="volume"]')) as HTMLElement;

          if (volumeCtrl && element) {
            // Set initial value to NONE if empty upon loading
            if (String(volumeCtrl.value ?? '').trim() === '') {
              volumeCtrl.setValue('NONE');
            }

            // Set to NONE if empty when field loses focus (blur)
            this.renderer.listen(element, 'blur', () => {
              if (String(volumeCtrl.value ?? '').trim() === '') {
                volumeCtrl.setValue('NONE');
              }
            });

            sub.unsubscribe();
          }
        });
      }
    });
  }
}