import { Component, Input,  inject, Inject, OnInit, AfterContentChecked  } from '@angular/core';
import { NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectFullDisplayRecord, selectListViewRecord } from '../primo-store.service';
import { selectViewId } from '../primo-store.service';
import { distinctUntilChanged, shareReplay, take } from 'rxjs';

@Component({
  selector: 'custom-finding-aid',
  standalone: true,
  imports: [NgIf],
  templateUrl: './finding-aid.component.html',
  styleUrl: './finding-aid.component.scss'
})
export class FindingAidComponent implements OnInit, AfterContentChecked {

  @Input() private hostComponent!: any;
  record$: Observable<any> | undefined;
  element: HTMLElement | null = null;
  viewId: string = '';
  public store = inject(Store);
  isFullRecord: boolean = false;
  findingAidLink: string = "";
  digitizedMaterialLink: string = "";

  readonly viewId$ = this.store.select(selectViewId).pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    @Inject('MODULE_PARAMETERS') public moduleParameters: any,
  ) { 
  }
  
  ngOnInit(): void {
    const enabled = this.moduleParameters.findingAidEnabled === "true";
    const findingAidParam = this.moduleParameters.findingAidArray;
    const findingAid = findingAidParam?.replace(/^\[|\]$/g, "").split(",").map((s: string) => s.trim());
    const digitizedMaterialParam = this.moduleParameters.digitizedMaterialArray;
    const digitizedMaterial = digitizedMaterialParam?.replace(/^\[|\]$/g, "").split(",").map((s: string) => s.trim());
    const viewsParam = this.moduleParameters.findingAidViews;
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
   
    this.record$ = this.store.select(selectFullDisplayRecord);
    this.record$.subscribe((record) => {
      if (record) {
        this.isFullRecord = true;
        this.searchLink(this.hostComponent, findingAid, digitizedMaterial);
      }
      else {
        this.isFullRecord = false;
        }
    });
    if (!this.isFullRecord) {
        let docDelivery =  this.hostComponent.docDelivery;
        if (docDelivery) {
          this.searchLink(this.hostComponent, findingAid, digitizedMaterial);
      }
    }
}

ngAfterContentChecked() {
  const findingAidParam = this.moduleParameters.findingAidArray;
  const findingAid = findingAidParam?.replace(/^\[|\]$/g, "").split(",").map((s: string) => s.trim());
  const digitizedMaterialParam = this.moduleParameters.digitizedMaterialArray;
  const digitizedMaterial = digitizedMaterialParam?.replace(/^\[|\]$/g, "").split(",").map((s: string) => s.trim());

  if (!this.isFullRecord) {
    let docDelivery =  this.hostComponent.docDelivery;
    if (docDelivery) {
      this.searchLink(this.hostComponent, findingAid, digitizedMaterial);
    }
  }
}

searchLink = (hostComponent: any, findingAidArray:string[], digitizedMaterialArray:string[]): any => {
  const links =  hostComponent?.docDelivery?.link
  let foundLink:string = "";

  if (links) {
    links.forEach((link:Object) => {
      Object.entries(link).forEach((key, value) => {
        const fieldValue = key[0];
        const compareValue = key[1];

        if (fieldValue === "linkURL") {
          foundLink = String(compareValue);
          }

        if (fieldValue === "displayLabel") {
          if (findingAidArray?.some(item => String(compareValue).includes(item))) {
            this.findingAidLink = foundLink;
            }
          if (digitizedMaterialArray?.some(item => String(compareValue).includes(item))) {
            this.digitizedMaterialLink = foundLink;
            }
          }
        });
      }
    )}
  }
}
  
