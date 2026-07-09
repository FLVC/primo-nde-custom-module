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
              if (pickupCtrl && (!hasSpecific || specific)) {
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

    const volumeCtrl = this.hostComponent.form.get('volume');
    // Update selector to match Formly rendering with data-qa attribute
    const element = (document.querySelector('[data-qa="almaResourceSharing.volume"] input') || 
                     document.querySelector('input[formcontrolname="volume"]')) as HTMLElement;

    if (volumeCtrl && element) {
      // Set initial value to NONE if empty upon loading
      if (String(volumeCtrl.value ?? '').trim() === '') {
        volumeCtrl.setValue('NONE');
      }

      // Cleanup existing blur listener before attaching new one
      if (this.blurListenerCleanup) {
        this.blurListenerCleanup();
        this.blurListenerCleanup = undefined;
      }

      // Set to NONE if empty when field loses focus (blur)
      this.blurListenerCleanup = this.renderer.listen(element, 'blur', () => {
        if (String(volumeCtrl.value ?? '').trim() === '') {
          volumeCtrl.setValue('NONE');
        }
      });
    }
  }
}