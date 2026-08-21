import { Component, ElementRef, Input,  inject, Inject, OnInit } from '@angular/core';
import { findClosestTargetFromElement, findClosestIdFromElement, findSiblingElement, findSiblingElementById, findChildElement, doesChildElementWithInnerHTMLExist } from '../shared/utils';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectFullDisplayRecord } from '../primo-store.service';
import { selectViewId } from '../primo-store.service';
import { distinctUntilChanged, shareReplay, take } from 'rxjs';

@Component({
  selector: 'custom-remove-requests',
  standalone: true,
  imports: [],
  templateUrl: './remove-requests.component.html',
  styleUrl: './remove-requests.component.scss'
})
export class RemoveRequestsComponent implements OnInit {

  @Input() private hostComponent!: any;
  record$: Observable<any> | undefined;
  element: HTMLElement | null = null;
  viewId: string = '';
  public store = inject(Store);

  readonly viewId$ = this.store.select(selectViewId).pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private elementRef: ElementRef,
    @Inject('MODULE_PARAMETERS') public moduleParameters: any,
  ) { 
  }
  
  ngOnInit(): void {

    const enabled = this.moduleParameters.removeRequestsEnabled === "true";
    const findingAidParam = this.moduleParameters.findingAidArray;
    const findingAid = findingAidParam?.replace(/^\[|\]$/g, "").split(",").map((s: string) => s.trim());
    const digitizedMaterialParam = this.moduleParameters.digitizedMaterialArray;
    const digitizedMaterial = digitizedMaterialParam?.replace(/^\[|\]$/g, "").split(",").map((s: string) => s.trim());
    const viewsParam = this.moduleParameters.removeRequestsViews;
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

    this.element = findClosestTargetFromElement(this.elementRef.nativeElement, 'ng-star-inserted');
    this.record$ = this.store.select(selectFullDisplayRecord);
    this.record$.subscribe((record) => {
      if (record) {
        if (this.element != null) {
          if (this.noRequestsAvailable(this.hostComponent, findingAid, digitizedMaterial)) {
            this.element.style.display = 'none';
          }
        }
      }
    });
  }

  noRequestsAvailable = (hostComponent: any, findingAid: string[], digitizedMaterial: string[]): boolean => {
    const ndeRequestTitle = findClosestIdFromElement(this.elementRef.nativeElement.parentElement, 'nde.request.title');
    const nuiGetitServiceViewit = findSiblingElementById(ndeRequestTitle, 'nui.getit.service_viewit');
    const nuiBriefResultsTabsGetitOther = findSiblingElementById(ndeRequestTitle, 'nui.brief.results.tabs.getit_other');
    const cardContainer = findChildElement(nuiGetitServiceViewit, 'view-it-title');

    const ndeGetitLocations = findSiblingElement(ndeRequestTitle, 'nde.getit.locations');
    const locations = findChildElement(ndeGetitLocations, 'getit-location-available');
    const getitServiceButton = findChildElement(ndeGetitLocations, 'getit-service-button');

    const panelWrapper = findChildElement(nuiBriefResultsTabsGetitOther, 'mat-expansion-panel-content-wrapper');
    const getitLocationsContainer = findChildElement(panelWrapper, 'getit-locations-container');

    const isLoanable = doesChildElementWithInnerHTMLExist(getitLocationsContainer, 'May be loanable');
    const isFullTextAvailable = cardContainer != null && cardContainer?.innerHTML.includes("Full text availability");
    const isAvalableOrRequestable:boolean = (locations?.innerHTML === "Available") || (getitServiceButton?.innerHTML === "Request");
    const isFindingAidButtonLink = this.findingAidAndDigitizedMaterialButtonsLinkPresent(hostComponent, findingAid, digitizedMaterial);
    const digitzationRequestAvailable:boolean = (getitServiceButton != null && getitServiceButton?.innerHTML.includes("Digitization Rqst"));
    
    if (isLoanable || 
        isFullTextAvailable || 
        isAvalableOrRequestable || 
        isFindingAidButtonLink ||
        digitzationRequestAvailable) {
        return true;
      }

      return false;
  }  

  findingAidAndDigitizedMaterialButtonsLinkPresent = (hostComponent: any, findingAidArray: string[], digitizedMaterialArray: string[]): boolean => {
    const links = hostComponent?.docDelivery?.link || [];
    
    for (const link of links) {
      const label = link.displayLabel || '';
      const url = link.linkURL || '';

      if (findingAidArray.some(item => label.includes(item)) || digitizedMaterialArray.some(item => label.includes(item))) {
        return true;
      }
    }
    
    return false;
  }
}
