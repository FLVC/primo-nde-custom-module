import { Component, Inject, Input, NgZone, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { getMatSelectDisplayedLabel, hideMatSelectById } from '../shared/utils';
import { HttpService } from '../services/http.service';

@Component({
  selector: 'custom-uborrow-request',
  standalone: true,
  imports: [],
  templateUrl: './uborrow-request.component.html',
  styleUrl: './uborrow-request.component.scss'
})
export class UborrowRequestComponent implements OnInit  {
  pickupCtrl = new FormControl('');
  ownerCtrl = new FormControl('');
  institutionCode: string = "";
  @Input() private hostComponent!: any;
  showAction: boolean = false;

  constructor(
    @Inject('MODULE_PARAMETERS') public moduleParameters: any,
    private httpService: HttpService,
    private zone: NgZone,
  ) { }

  ngOnInit(): void {
    const enabled = this.moduleParameters.uborrowRequestEnabled === "true";
    this.institutionCode = this.moduleParameters.institutionCode;

    const url = 'https://alma-apps.test.flvc.org/owner/get.jsp?' +
      "institution_code=" + encodeURIComponent(this.institutionCode) +
      "&pickup_location=ALL";

    if (!enabled) {
      return;
    }

    this.hostComponent.isLoading$.subscribe((isLoading: any) => {
      if (!isLoading) {
        var requestType = this.hostComponent.formType;
        if (requestType === 'AlmaRequest') {
          return;
        }

        this.httpService.getData(url).subscribe((data) => {
          console.log("data");
          console.log(data);
          const result = data.trim();
          if (result === '0') console.log('nothing to do');
          if (result === '0') return;
        });

        const sub = this.zone.onStable.subscribe(() => {
          const pickupCtrl = this.hostComponent.form.get('pickupLocation');
          const ownerCtrl = this.hostComponent.form.get('owner');

          if (pickupCtrl) {
            this.pickupCtrl = pickupCtrl;
            this.setInitialState();

            this.pickupCtrl.valueChanges.subscribe(() => {
              requestAnimationFrame(() => {
                this.checkPickupState();
              });
            });

          }

          if (ownerCtrl) {
            this.ownerCtrl = ownerCtrl;
            hideMatSelectById('owner');
          }

          if (pickupCtrl && ownerCtrl) {
            sub.unsubscribe();
          }

        });
      }
    });

  }

  setInitialState() {
    const pickupControl = this.pickupCtrl;
    const matSelect = document.querySelector('[id*="pickupLocation"]') as HTMLElement | null;
    if (!matSelect) return;

    const submitButton = document.querySelector('.submit-btn') as HTMLButtonElement | null;
    if (!submitButton) return;

    const formField = matSelect.closest('.mat-mdc-form-field') as HTMLElement | null;
    if (!formField) return;

    const label = formField.querySelector('.mdc-floating-label') as HTMLElement | null;
    if (!label) return;

    if (label.querySelector('.mat-form-field-required-marker')) return;

    const marker = document.createElement('span');
    marker.className = 'mat-form-field-required-marker';
    marker.textContent = ' *';
    label.appendChild(marker);

    matSelect.setAttribute('required', 'true');
    matSelect.setAttribute('aria-required', 'true');

    pickupControl.addValidators(Validators.required);
    pickupControl.setValue(null);

    submitButton.disabled = true;
    submitButton.setAttribute('disabled', 'disabled');
  }

  checkPickupState() {
    const pickupControl = this.pickupCtrl;
    const matSelect = document.querySelector('[id*="pickupLocation"]') as HTMLElement | null;
    const submitButton = document.querySelector('.submit-btn') as HTMLButtonElement | null;

    if (!matSelect || !submitButton) return;

    const value = pickupControl.value;

    if (!value) return;

    const label: string = getMatSelectDisplayedLabel(matSelect) ?? '';

    const url = 'https://alma-apps.test.flvc.org/owner/get.jsp?' +
      "institution_code=" + encodeURIComponent(this.institutionCode) +
      "&pickup_location=" + encodeURIComponent(label);


    this.httpService.getData(url).subscribe((data) => {
      const result = data.trim();

      if (result) {
        this.ownerCtrl.setValue(result);
        this.ownerCtrl.updateValueAndValidity({ emitEvent: false });
      }
    });

    submitButton.disabled = false;
    submitButton.removeAttribute('disabled');
  }
}