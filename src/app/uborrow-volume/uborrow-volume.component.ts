import { Component, inject, Inject, Input, NgZone, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { distinctUntilChanged, shareReplay, take, Subscription } from 'rxjs';
import { selectViewId } from '../primo-store.service';
import { Store } from '@ngrx/store';

@Component({
  selector: 'custom-uborrow-volume',
  standalone: true,
  imports: [],
  templateUrl: './uborrow-volume.component.html',
  styleUrl: './uborrow-volume.component.scss'
})
export class UborrowVolumeComponent implements OnInit, OnDestroy {

  showAction: boolean = false;
  viewId: string = "";
  @Input() private hostComponent!: any;
  public store = inject(Store);

  citationType: string = "";
  specific: boolean = false;
  isDigitizationRequest: boolean = false;

  readonly viewId$ = this.store.select(selectViewId).pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  private hasSubscribedToSpecific = false;
  private citationTypeSet = false;
  private componentSubs = new Subscription();
  private blurListenerCleanup?: () => void;

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

    const isLoadingSub = this.hostComponent.isLoading$.subscribe((isLoading: any) => {
      if (!isLoading) {
        var requestType = this.hostComponent.formType;
        if (requestType === 'AlmaRequest') {
          return;
        }

        const sub = this.zone.onStable.subscribe(() => {
          this.initializeControls();

          const form = this.hostComponent?.form;
          if (form) {
            const specific = form.get('specificChapterPages');
            const ownerCtrl = form.get('owner');
            const pickupCtrl = form.get('pickupLocation');
            const articleTitle = form.get('articleTitle');
            const volumeCtrl = form.get('volume');

            const isDigitization = !!articleTitle;
            const isChapter = !!(specific && specific.value);

            if (isDigitization) {
              if (articleTitle) {
                sub.unsubscribe();
                this.handleRequestTypeChange();
              }
            } else if (isChapter) {
              if (specific) {
                sub.unsubscribe();
                this.handleRequestTypeChange();
              }
            } else {
              const hasSpecific = !!specific;
              const hasControls = Object.keys(form.controls).length > 0;
              
              if (pickupCtrl || volumeCtrl || hasControls) {
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
    if (this.blurListenerCleanup) {
      this.blurListenerCleanup();
    }
  }

  initializeControls() {
    const form = this.hostComponent?.form;
    if (!form) return;

    const specific = form.get('specificChapterPages');
    if (specific) {
      const currentSpecific = !!specific.value;
      if (this.specific !== currentSpecific) {
        this.specific = currentSpecific;
      }
      if (!this.hasSubscribedToSpecific) {
        this.hasSubscribedToSpecific = true;
        const specificCtrlSub = specific.valueChanges.subscribe(() => {
          const newSpecific = !!specific.value;
          if (this.specific !== newSpecific) {
            this.specific = newSpecific;
          }
          this.handleRequestTypeChange();
        });
        this.componentSubs.add(specificCtrlSub);
      }
    } else {
      if (this.specific !== false) {
        this.specific = false;
      }
    }

    const articleTitleCtrl = form.get('articleTitle');
    const currentIsDigitization = !!articleTitleCtrl;
    if (this.isDigitizationRequest !== currentIsDigitization) {
      this.isDigitizationRequest = currentIsDigitization;
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
  }

  handleRequestTypeChange() {
    requestAnimationFrame(() => {
      this.initializeControls();
      this.checkVolumeState();
    });
  }

  checkVolumeState() {
    if (this.isDigitizationRequest) {
      return;
    }

    const form = this.hostComponent?.form;
    if (!form) return;

    const volumeCtrl = form.get('volume');
    const dataQaSelector = '[data-qa="almaResourceSharing.volume"] input';
    const formControlNameSelector = 'input[formcontrolname="volume"]';
    
    const element = (document.querySelector(dataQaSelector) || 
                     document.querySelector(formControlNameSelector)) as HTMLElement;

    if (volumeCtrl && element) {
      if (String(volumeCtrl.value ?? '').trim() === '') {
        volumeCtrl.setValue('NONE');
      }

      if (this.blurListenerCleanup) {
        this.blurListenerCleanup();
        this.blurListenerCleanup = undefined;
      }

      this.blurListenerCleanup = this.renderer.listen(element, 'blur', () => {
        if (String(volumeCtrl.value ?? '').trim() === '') {
          volumeCtrl.setValue('NONE');
        }
      });
    }
  }
}