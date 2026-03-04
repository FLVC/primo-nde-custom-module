import { Component, ElementRef, Input, inject, Inject, OnInit } from '@angular/core';
import { findClosestTargetFromElement } from '../shared/utils';
import { Store } from '@ngrx/store';
import { selectViewId } from '../primo-store.service';
import { distinctUntilChanged, shareReplay, take } from 'rxjs';

@Component({
  selector: 'custom-remove-equipment',
  standalone: true,
  imports: [],
  templateUrl: './remove-equipment.component.html',
  styleUrl: './remove-equipment.component.scss'
})
export class RemoveEquipmentComponent implements OnInit {

  @Input() private hostComponent!: any;
  element: HTMLElement | null = null;
  viewId: string = '';
  public store = inject(Store);

  readonly viewId$ = this.store.select(selectViewId).pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    private elementRef: ElementRef,
    @Inject('MODULE_PARAMETERS') public moduleParameters: any
  ) { }
  
  ngOnInit(): void {
    const enabled = this.moduleParameters.removeEquipmentEnabled === "true";
    const viewsParam = this.moduleParameters.removeEquipmentViews;
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

    if (this.hostComponent?.filterGroup?.id === 'lds01' && this.hostComponent?.filterValue?.value === 'Equipment') {
      this.element = findClosestTargetFromElement(this.elementRef.nativeElement.parentElement, 'ng-star-inserted');
      if (this.element != null) {
        const h4 = findClosestTargetFromElement(this.element,'h4');
        if (h4 != null && h4.textContent != null) {
          if (h4.textContent.toLowerCase().includes('equipment')) {
            this.element.style.display = 'none';
          }
        }
      }
    }
  }
}
