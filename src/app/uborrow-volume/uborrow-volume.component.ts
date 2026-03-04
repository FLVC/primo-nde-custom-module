import { Component, inject, Inject, Input, NgZone, OnChanges, OnInit } from '@angular/core';
import { distinctUntilChanged, map, shareReplay, take } from 'rxjs';
import { selectViewId } from '../primo-store.service';
import { Store } from '@ngrx/store';

@Component({
  selector: 'custom-uborrow-volume',
  standalone: true,
  imports: [],
  templateUrl: './uborrow-volume.component.html',
  styleUrl: './uborrow-volume.component.scss'
})
export class UborrowVolumeComponent implements OnInit, OnChanges {

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

          if (volumeCtrl) {
            volumeCtrl.valueChanges.pipe(
              map(v => (v ?? '').toString().trim()),
            ).subscribe((val: string) => {
              if (val === '') {
                if (volumeCtrl.value !== 'NONE') {
                  volumeCtrl.setValue('NONE', { emitEvent: false });
                }
              }
            });
            sub.unsubscribe();
          }
        });
      }
    });
  }

  ngOnChanges(): void {
    const sub = this.zone.onStable.subscribe(() => {
      const volumeCtrl = this.hostComponent.form.get('volume');
      if (volumeCtrl) {
        if ((String(volumeCtrl.value ?? '').trim() === '')) {
          volumeCtrl.setValue('NONE');
        }
        sub.unsubscribe();
      }
    });
  }
}