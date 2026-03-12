import { Component, Input,  inject, Inject, OnInit  } from '@angular/core';
import { NgIf } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectFullDisplayRecord, selectListViewRecord } from '../primo-store.service';
import { MatIconRegistry, MatIcon } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { AssetsPublicPathDirective } from '../services/assets-public-path.directive';

@Component({
  selector: 'custom-finding-aid',
  standalone: true,
  imports: [NgIf, MatIcon, AssetsPublicPathDirective],
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
  public findingAidLink: string = "";
  public digitizedMaterialLink: string = "";
  
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
    
    if (!enabled) {
      return;
    }

    this.record$ = this.store.select(selectFullDisplayRecord);
    this.record$.subscribe((record) => {
      if (record) {
        this.isFullRecord = true;
        this.findRecordLinks(record);
      }
      else {
        this.isFullRecord = false;
      }
    });
		if (!this.isFullRecord) {
			this.record$ = this.store.select(selectListViewRecord(this.hostComponent?.searchResult?.pnx?.control?.recordid[0]));
			this.record$.subscribe((record) => {
				this.findRecordLinks(record);
			});
		}        
  }

  findRecordLinks = (record: any): any => {
    if (record) {
      if (record?.pnx?.display) {
        Object.entries(record?.pnx?.display).forEach((key, value) => {
          const compareValue = String(key[1]);
          if (compareValue.includes("Finding aid")) {
            this.findingAidLink = compareValue.substring(compareValue.indexOf(':')+1).trim();
          }
          if (compareValue.includes("Digitized material")) {
            this.digitizedMaterialLink = compareValue.substring(compareValue.indexOf(':')+1);
            console.log("Digitized Material Link:", this.digitizedMaterialLink);
          }
        });
      }
    }
  }
}
