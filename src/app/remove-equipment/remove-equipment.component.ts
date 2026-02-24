import { Component, ElementRef, Input, Inject, OnInit } from '@angular/core';
import { findClosestTargetFromElement } from '../shared/utils';

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

  constructor(
    private elementRef: ElementRef,
    @Inject('MODULE_PARAMETERS') public moduleParameters: any
  ) { }
  
  ngOnInit(): void {
    const enabled = this.moduleParameters.removeEquipmentEnabled === "true";

    if (!enabled) {
      return;
    }

    this.element = this.findClosestTargetInHost();
    if (this.element != null) {
      const h4 = findClosestTargetFromElement(this.element,'h4');
      if (h4 != null && h4.textContent != null) {
        if (h4.textContent.includes('equipment')) {
          this.element.style.display = 'none';
        }
      }
    }
  }

  private findClosestTargetInHost(): HTMLElement | null {
    let current: HTMLElement | null = this.elementRef.nativeElement.parentElement;

    return findClosestTargetFromElement(current, 'ng-star-inserted')
  }
}
