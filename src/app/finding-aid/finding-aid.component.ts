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
    const findingAidArray:string[] = this.moduleParameters.findingAidArray;
    const digitizedMaterialArray:string[] = this.moduleParameters.digitizedMaterialArray;
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
        this.findRecordLinks(record, findingAidArray, digitizedMaterialArray);
      }
      else {
        this.isFullRecord = false;
      }
    });
		if (!this.isFullRecord) {
			this.record$ = this.store.select(selectListViewRecord(this.hostComponent?.searchResult?.pnx?.control?.recordid[0]));
			this.record$.subscribe((record) => {
				this.findRecordLinks(record, findingAidArray, digitizedMaterialArray);
			});
		}        
  }

  findRecordLinks = (record: any, findingAidArray:string[], digitizedMaterialArray:string[]): any => {
    if (record) {
      if (record?.pnx?.display) {
        Object.entries(record?.pnx?.display).forEach((key, value) => {
          const compareValue = String(key[1]);

          if (compareValue.includes("Finding aid") || findingAidArray?.some(item => compareValue.includes(item))) {
            this.findingAidLink = compareValue.substring(compareValue.indexOf(':')+1).trim();
          }
          if (compareValue.includes("Digitized material") || digitizedMaterialArray?.some(item => compareValue.includes(item))) {
            this.digitizedMaterialLink = compareValue.substring(compareValue.indexOf(':')+1);
          }
        });
      }
    }
  }
}
