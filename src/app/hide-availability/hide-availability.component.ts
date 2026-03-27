import { Component, ElementRef, Inject, Input, OnInit } from '@angular/core';
import { findClosestTargetFromElement } from '../shared/utils';

@Component({
  selector: 'custom-hide-availability',
  standalone: true,
  imports: [],
  templateUrl: './hide-availability.component.html',
  styleUrl: './hide-availability.component.scss'
})
export class HideAvailabilityComponent implements OnInit {
  @Input() private hostComponent!: any;

  constructor(
    private elementRef: ElementRef,
    @Inject('MODULE_PARAMETERS') public moduleParameters: any
  ) { }

  async ngOnInit(): Promise<void> {
    const enabled = this.moduleParameters.hideAvailabilityEnabled === "true";
    const locationsParam = this.moduleParameters.hideAvailabilityLocations;
    const locations: string[] = locationsParam?.replace(/^\[|\]$/g, "").split(",").map((s: string) => s.trim());

    if (!enabled) {
      return;
    }

    locations.forEach(async locationCode => {
      if (this.hostComponent.location.subLocationCode != null && locationCode === this.hostComponent.location.subLocationCode) {

        const maybe = findClosestTargetFromElement(this.elementRef.nativeElement.parentElement.parentElement, 'span.getit-location-maybe');
        if (maybe) {
          maybe.style.display = 'none';
        }
        
        const copies = await this.waitForCopiesSpan();
        if (copies) {
          copies.style.display = 'none';
        }
      }
    });

  }

  private waitForCopiesSpan(timeoutMs = 10000): Promise<HTMLSpanElement> {
    return new Promise((resolve, reject) => {
      const host = this.elementRef.nativeElement;
      const ndeLocation = host.closest('nde-location') as HTMLElement | null;
      if (!ndeLocation) return reject(new Error('No <nde-location> ancestor found.'));

      const existing = ndeLocation.querySelector('span.location-copies') as HTMLSpanElement | null;
      if (existing) return resolve(existing);

      const obs = new MutationObserver(() => {
        const span = ndeLocation.querySelector('span.location-copies') as HTMLSpanElement | null;
        if (span) {
          obs.disconnect();
          resolve(span);
        }
      });

      obs.observe(ndeLocation, { childList: true, subtree: true });

      setTimeout(() => {
        obs.disconnect();
        reject(new Error('Timed out waiting for .location-copies'));
      }, timeoutMs);
    });
  }
}
