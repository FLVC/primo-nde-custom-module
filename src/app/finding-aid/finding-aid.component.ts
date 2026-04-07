import { Component, Input,  inject, Inject, OnInit  } from '@angular/core';
import { NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectFullDisplayRecord, selectListViewRecord } from '../primo-store.service';
import { MatIconRegistry, MatIcon } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { selectViewId } from '../primo-store.service';
import { distinctUntilChanged, shareReplay, take } from 'rxjs';

@Component({
  selector: 'custom-finding-aid',
  standalone: true,
  imports: [NgIf, MatIcon],
  templateUrl: './finding-aid.component.html',
  styleUrl: './finding-aid.component.scss'
})
export class FindingAidComponent implements OnInit {

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
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) { 
    this.matIconRegistry.addSvgIcon(
      'ic_folder_open_black_24px',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/images/ic_folder_open_black_24px.svg')
    );    
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
   
    if (this.hostComponent) {
      if (this.hostComponent?.docDelivery) {
        if (this.hostComponent?.docDelivery?.link) {
        Object.entries(this.hostComponent?.docDelivery?.link).forEach((key, value) => {
          if (key) {
            this.searchLink(key, findingAid, digitizedMaterial);
          }
        });
      }
    }
  }
}

searchLink = (link: any, findingAidArray:string[], digitizedMaterialArray:string[]): any => {
  let foundLink:string = "";

  if (link) {
      Object.entries(link[1]).forEach((key, value) => {
        const fieldValue = key[0];
        const compareValue = key[1];

        if (fieldValue === "linkURL") {
          foundLink = String(compareValue);
        }

        if (fieldValue === "displayLabel") {
          if (String(compareValue).includes("Finding aid") || findingAidArray?.some(item => String(compareValue).includes(item))) {
            this.findingAidLink = foundLink;
          }
          if (String(compareValue).includes("Digitized material") || digitizedMaterialArray?.some(item => String(compareValue).includes(item))) {
            this.digitizedMaterialLink = foundLink;
          }
        }
      });
    }
  }
}
