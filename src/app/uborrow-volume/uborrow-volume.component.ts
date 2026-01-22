import { Component, Inject, Input, NgZone, OnChanges, OnInit } from '@angular/core';
import { map } from 'rxjs';

@Component({
  selector: 'custom-uborrow-volume',
  standalone: true,
  imports: [],
  templateUrl: './uborrow-volume.component.html',
  styleUrl: './uborrow-volume.component.scss'
})
export class UborrowVolumeComponent implements OnInit, OnChanges {

  showAction: boolean = false;
  institutionCode: string = "";
  @Input() private hostComponent!: any;

  constructor(
    @Inject('MODULE_PARAMETERS') public moduleParameters: any,
    private zone: NgZone,
  ) { }

  ngOnInit(): void {
    const enabled = this.moduleParameters.uborrowVolumeEnabled === "true";
    this.institutionCode = this.moduleParameters.institutionCode;

    if (!enabled) {
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