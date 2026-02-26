import { Component, inject, Inject, Input, NgZone, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { getMatSelectDisplayedLabel, hideMatSelectById } from '../shared/utils';
import { HttpService } from '../services/http.service';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, shareReplay, take } from 'rxjs';
import { selectInstitutionCode, selectViewId } from '../primo-store.service';

@Component({
  selector: 'custom-uborrow-request',
  standalone: true,
  imports: [],
  templateUrl: './uborrow-request.component.html',
  styleUrl: './uborrow-request.component.scss'
})
export class UborrowRequestComponent implements OnInit {
  pickupCtrl = new FormControl('');
  ownerCtrl = new FormControl('');
  citationType: string = "";
  chapter: string = "";
  pages: string = "";
  specific: boolean = false;
  institutionCode: string = "";
  viewId: string = "";
  @Input() private hostComponent!: any;
  public store = inject(Store);
  showAction: boolean = false;
  readonly institutionCode$ = this.store.select(selectInstitutionCode).pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );
  readonly viewId$ = this.store.select(selectViewId).pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    @Inject('MODULE_PARAMETERS') public moduleParameters: any,
    private httpService: HttpService,
    private zone: NgZone,
  ) { }

  ngOnInit(): void {
    const enabled = this.moduleParameters.uborrowRequestEnabled === "true";
    const viewsParam = this.moduleParameters.uborrowRequestViews;
    const views = viewsParam?.replace(/^\[|\]$/g, "").split(",").map((s: string) => s.trim());

    if (!enabled) {
      return;
    }

    this.institutionCode$
      .pipe(take(1))
      .subscribe(code => {
        this.institutionCode = code ?? '';
      });

    this.viewId$
      .pipe(take(1))
      .subscribe(code => {
        this.viewId = code ?? '';
      });

    if (views != undefined && !views.includes(this.viewId)) {
      console.log('No matching view found for ' + this.viewId + ' options are ' + views)
      return;
    }

    const url = 'https://alma-apps.flvc.org/owner/get.jsp?' +
      "institution_code=" + encodeURIComponent(this.institutionCode) +
      "&pickup_location=ALL";

    this.hostComponent.isLoading$.subscribe((isLoading: any) => {
      if (!isLoading) {
        var requestType = this.hostComponent.formType;
        if (requestType === 'AlmaRequest') {
          return;
        }

        this.httpService.getData(url).subscribe((data) => {
          const result = data.trim();
          if (result === '0') return;
        });

        const sub = this.zone.onStable.subscribe(() => {
          const pickupCtrl = this.hostComponent.form.get('pickupLocation');
          const ownerCtrl = this.hostComponent.form.get('owner');
          const citationType = this.hostComponent.form.get('citationType');
          const specific = this.hostComponent.form.get('specificChapterPages');

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

          if (citationType) {
            citationType.valueChanges.subscribe(() => {
              this.citationType = citationType.value;
              this.checkPickupState();
            });
          }

          if (specific) {
            specific.valueChanges.subscribe(() => {
              this.specific = specific.value;
              this.checkSpecific();
            });
          }

          if (pickupCtrl && specific) {
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

    const url = 'https://alma-apps.flvc.org/owner/get.jsp?' +
      "institution_code=" + encodeURIComponent(this.institutionCode) +
      "&pickup_location=" + encodeURIComponent(label);

    if (this.institutionCode === 'UFL' && this.citationType === 'CR') {
      console.log('setting owner to RES_SHARE');
      this.ownerCtrl.setValue('RES_SHARE');
      this.ownerCtrl.updateValueAndValidity({ emitEvent: false });
    }
    else if (this.institutionCode === 'UFL' && this.specific == true && (this.pages != '' || this.chapter != '')) {
      console.log('setting owner to RES_SHARE');
      this.ownerCtrl.setValue('RES_SHARE');
      this.ownerCtrl.updateValueAndValidity({ emitEvent: false });
    }
    else {
      this.httpService.getData(url).subscribe((data) => {
        const result = data.trim();

        if (result && this.ownerCtrl.value != result) {
          console.log('setting owner to ' + result);
          this.ownerCtrl.setValue(result);
          this.ownerCtrl.updateValueAndValidity({ emitEvent: false });
        }
        else {
          console.log("nothing to do owner already set to " + result);
        }
      });
    }

    submitButton.disabled = false;
    submitButton.removeAttribute('disabled');
  }

  checkSpecific() {
    if (this.specific == true) {
      const sub = this.zone.onStable.subscribe(() => {
        const chapter = this.hostComponent.form.get('chapter');
        const pages = this.hostComponent.form.get('pagesToPhotocopy');

        if (chapter) {
          chapter.valueChanges.subscribe(() => {
            this.chapter = chapter.value;
            this.checkPickupState();
          });
        }

        if (pages) {
          pages.valueChanges.subscribe(() => {
            this.pages = pages.value;
            this.checkPickupState();
          });
        }
        if (chapter && pages) {
          sub.unsubscribe();
        }
      });
    }
  }
}