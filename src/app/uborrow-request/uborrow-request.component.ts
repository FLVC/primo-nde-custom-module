import { Component, inject, Inject, Input, NgZone, OnInit, OnDestroy } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Validators } from '@angular/forms';
import { getMatSelectDisplayedLabel, hideMatSelectById } from '../shared/utils';
import { HttpService } from '../services/http.service';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, shareReplay, take, Subscription } from 'rxjs';
import { selectInstitutionCode, selectViewId } from '../primo-store.service';

@Component({
  selector: 'custom-uborrow-request',
  standalone: true,
  imports: [],
  templateUrl: './uborrow-request.component.html',
  styleUrl: './uborrow-request.component.scss'
})
export class UborrowRequestComponent implements OnInit, OnDestroy {
  pickupCtrl = new FormControl('');
  ownerCtrl = new FormControl('');
  citationType: string = "";
  chapter: string = "";
  pages: string = "";
  specific: boolean = false;
  isDigitizationRequest: boolean = false;
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

  private hasSubscribedToSpecific = false;
  private ownerCtrlSet = false;
  private citationTypeSet = false;
  private pickupCtrlSet = false;
  private specificSub = new Subscription();
  private componentSubs = new Subscription();

  constructor(
    @Inject('MODULE_PARAMETERS') public moduleParameters: any,
    private httpService: HttpService,
    private zone: NgZone,
  ) { }

  isDigitalOrChapterRequest(): boolean {
    return this.specific || this.isDigitizationRequest;
  }

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

    const isLoadingSub = this.hostComponent.isLoading$.subscribe((isLoading: any) => {
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
          this.initializeControls();

          const form = this.hostComponent?.form;
          if (form) {
            const specific = form.get('specificChapterPages');
            const ownerCtrl = form.get('owner');
            const pickupCtrl = form.get('pickupLocation');
            const articleTitle = form.get('articleTitle');

            const isDigitization = !!articleTitle;
            const isChapter = !!(specific && specific.value);

            if (isDigitization) {
              if (articleTitle && ownerCtrl) {
                sub.unsubscribe();
                this.handleRequestTypeChange();
              }
            } else if (isChapter) {
              if (specific && ownerCtrl) {
                sub.unsubscribe();
                this.handleRequestTypeChange();
              }
            } else {
              const hasSpecific = !!specific;
              if (pickupCtrl && ownerCtrl && (!hasSpecific || specific)) {
                sub.unsubscribe();
                this.handleRequestTypeChange();
              }
            }
          }
        });
        this.componentSubs.add(sub);
      }
    });
    this.componentSubs.add(isLoadingSub);
  }

  ngOnDestroy(): void {
    this.componentSubs.unsubscribe();
    this.specificSub.unsubscribe();
  }

  initializeControls() {
    const form = this.hostComponent?.form;
    if (!form) return;

    const specific = form.get('specificChapterPages');
    if (specific) {
      this.specific = !!specific.value;
      if (!this.hasSubscribedToSpecific) {
        this.hasSubscribedToSpecific = true;
        const specificCtrlSub = specific.valueChanges.subscribe(() => {
          this.specific = !!specific.value;
          this.handleRequestTypeChange();
        });
        this.componentSubs.add(specificCtrlSub);
      }
    } else {
      this.specific = false;
    }

    const articleTitleCtrl = form.get('articleTitle');
    this.isDigitizationRequest = !!articleTitleCtrl;

    const ownerCtrl = form.get('owner');
    if (ownerCtrl && !this.ownerCtrlSet) {
      this.ownerCtrl = ownerCtrl;
      this.ownerCtrlSet = true;
      hideMatSelectById('owner');
    }

    const citationType = form.get('citationType');
    if (citationType && !this.citationTypeSet) {
      this.citationTypeSet = true;
      this.citationType = citationType.value;
      const citationTypeSub = citationType.valueChanges.subscribe(() => {
        this.citationType = citationType.value;
        this.handleRequestTypeChange();
      });
      this.componentSubs.add(citationTypeSub);
    }

    const pickupCtrl = form.get('pickupLocation');
    if (pickupCtrl && !this.pickupCtrlSet) {
      this.pickupCtrl = pickupCtrl;
      this.pickupCtrlSet = true;

      const pickupCtrlSub = this.pickupCtrl.valueChanges.subscribe(() => {
        requestAnimationFrame(() => {
          this.checkPickupState();
        });
      });
      this.componentSubs.add(pickupCtrlSub);
    }
  }

  handleRequestTypeChange() {
    requestAnimationFrame(() => {
      this.initializeControls();

      this.specificSub.unsubscribe();
      this.specificSub = new Subscription();

      this.setInitialState();

      if (this.specific) {
        this.checkSpecific();
      }
      this.checkPickupState();
    });
  }

  setInitialState() {
    if (this.isDigitalOrChapterRequest()) {
      this.setInitialStateForDigitalOrChapterRequest();
    } else {
      this.setInitialStateForRegularRequest();
    }
  }

  setInitialStateForDigitalOrChapterRequest() {
    const submitButton = document.querySelector('.submit-btn') as HTMLButtonElement | null;
    if (submitButton) {
      submitButton.disabled = false;
      submitButton.removeAttribute('disabled');
    }
  }

  setInitialStateForRegularRequest() {
    const pickupControl = this.pickupCtrl;
    if (!this.pickupCtrlSet) return;

    const matSelect = document.querySelector('[id*="pickupLocation"]') as HTMLElement | null;
    if (!matSelect) return;

    const submitButton = document.querySelector('.submit-btn') as HTMLButtonElement | null;
    if (!submitButton) return;

    const formField = matSelect.closest('.mat-mdc-form-field') as HTMLElement | null;
    if (!formField) return;

    const label = formField.querySelector('.mdc-floating-label') as HTMLElement | null;
    if (!label) return;

    if (label.querySelector('.mat-form-field-required-marker')) {
      submitButton.disabled = true;
      submitButton.setAttribute('disabled', 'disabled');
      return;
    }

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
    if (this.isDigitalOrChapterRequest()) {
      this.checkPickupStateForDigitalOrChapterRequest();
    } else {
      this.checkPickupStateForRegularRequest();
    }
  }

  checkPickupStateForDigitalOrChapterRequest() {
    const submitButton = document.querySelector('.submit-btn') as HTMLButtonElement | null;
    if (submitButton && submitButton.disabled) {
      submitButton.disabled = false;
      submitButton.removeAttribute('disabled');
    }

    const digitalOwner = this.moduleParameters.uborrowRequestDigitalOwner;
    if (digitalOwner) {
      if (this.ownerCtrl.value != digitalOwner) {
        console.log('setting owner to digital owner: ' + digitalOwner);
        this.ownerCtrl.setValue(digitalOwner);
        this.ownerCtrl.updateValueAndValidity({ emitEvent: false });
      }
      else {
        console.log("nothing to do owner already set to " + digitalOwner);
      }
    } else if (this.specific) {
      if (this.institutionCode === 'UFL') {
        if (this.citationType === 'CR' || this.pages !== '' || this.chapter !== '') {
          console.log('setting owner to RES_SHARE');
          this.ownerCtrl.setValue('RES_SHARE');
          this.ownerCtrl.updateValueAndValidity({ emitEvent: false });
        }
      }
    }
  }

  checkPickupStateForRegularRequest() {
    const pickupControl = this.pickupCtrl;
    if (!this.pickupCtrlSet) return;

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
    } else {
      this.httpService.getData(url).subscribe((data) => {
        const result = data.trim();

        if (result && this.ownerCtrl.value != result) {
          console.log('setting owner to ' + result);
          this.ownerCtrl.setValue(result);
          this.ownerCtrl.updateValueAndValidity({ emitEvent: false });
        } else {
          console.log("nothing to do owner already set to " + result);
        }
      });
    }

    submitButton.disabled = false;
    submitButton.removeAttribute('disabled');
  }

  checkSpecific() {
    if (!this.specific) {
      return;
    }

    const sub = this.zone.onStable.subscribe(() => {
      const chapter = this.hostComponent.form.get('chapter');
      const pages = this.hostComponent.form.get('pagesToPhotocopy');

      if (chapter) {
        this.specificSub.add(
          chapter.valueChanges.subscribe(() => {
            this.chapter = chapter.value;
            this.checkPickupState();
          })
        );
      }

      if (pages) {
        this.specificSub.add(
          pages.valueChanges.subscribe(() => {
            this.pages = pages.value;
            this.checkPickupState();
          })
        );
      }
      if (chapter && pages) {
        sub.unsubscribe();
      }
    });
  }
}