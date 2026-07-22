import { CommonModule } from '@angular/common';
import { Component, Inject, inject, Input } from '@angular/core';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, Observable, shareReplay, take } from 'rxjs';
import { selectViewId } from '../primo-store.service';
import { HathiAvailabilityService } from '../hathi-availability.service';

@Component({
  selector: 'custom-hathi-links',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './hathi-links.component.html',
  styleUrl: './hathi-links.component.scss'
})
export class HathiLinksComponent {
  @Input() private hostComponent!: any;
  record$: Observable<any> | undefined;
  public store = inject(Store);
  viewId: string = '';
  showLimit: number = 3;
  filter: boolean = false;
  enabled: boolean = false;
  
  readonly viewId$ = this.store.select(selectViewId).pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    @Inject('MODULE_PARAMETERS') public moduleParameters: any,
    private hathiTrust: HathiAvailabilityService,
  ) { }

  ngOnInit() {
    const enabled = this.moduleParameters.hathiLinksEnabled === "true";
    const viewsParam = this.moduleParameters.hathiLinksViews;
    const views = viewsParam?.replace(/^\[|\]$/g, "").split(",").map((s: string) => s.trim());
    const showLimitParam = this.moduleParameters.hathiLinksLimit;
    const filter = this.moduleParameters.hathiLinksFilter === "true";
    
    this.filter = filter;
    this.enabled = enabled;

    if (showLimitParam !== undefined && showLimitParam !== null && showLimitParam !== '') {
      const parsed = parseInt(showLimitParam, 10);
      if (!isNaN(parsed)) {
        this.showLimit = parsed;
      }
    }

    if (!enabled) {
      return;
    }

    this.viewId$
      .pipe(take(1))
      .subscribe(code => {
        this.viewId = code ?? '';
      });

    if (views != undefined && !views.includes(this.viewId)) {
      console.log(new Date().toLocaleTimeString() + 'No matching view found for ' + this.viewId + ' options are ' + views)
      return;
    }
  }

  ngAfterViewInit() {
    if (!this.enabled) {
      return;
    }

    setTimeout(() => {
      this.enrichLinks(this.filter, null, 'afterviewinit');
      
      const button = document.querySelector(
        '[data-qa="view-it-section-show-more-or-show-less"]'
      );

      if (!button) return;

      button.addEventListener('click', () => {
        const expanded =
          button.getAttribute('aria-expanded') === 'true';

        const label = button.querySelector('.mdc-button__label span');
        if (label) {
          label.textContent = expanded ? 'Show less' : 'Show more';
        }

        this.enrichLinks(this.filter, expanded, "after");
      });
    }, 800);
    
  }

  enrichLinks(filter:boolean, expanded?: boolean | null, source?:string) {
    const services: ServiceEntry[] = this.hostComponent.electronicServices;

    if (!services || services.length == 0) return;

    const hathiServices = services
      .filter(
        (item: ServiceEntry) =>
          item.packageName?.startsWith("HathiTrust") &&
          typeof item.serviceUrl === "string" &&
          item.serviceUrl.includes("http://hdl.handle.net")
      );

    const otherServices = services
      .filter(
        (item: ServiceEntry) =>
          !item.packageName?.startsWith("HathiTrust") ||
          !(typeof item.serviceUrl === "string" && item.serviceUrl.includes("http://hdl.handle.net"))
      );

    const results = services
      .filter(
        (item: ServiceEntry) =>
          item.packageName?.startsWith("HathiTrust") &&
          typeof item.serviceUrl === "string" &&
          item.serviceUrl.includes("http://hdl.handle.net")
      )
      .map(item => {
        return "htid:" + this.extractHtid(item.serviceUrl!);
      });

    this.hathiTrust.findFullViewRecordItems(results, this.filter).subscribe((searchResults) => {
      if (searchResults) {
        const updatedServices = services
          .filter(service => {
            const htid = this.extractHtid(service.serviceUrl);
            return (
              !!htid &&
              searchResults.some(item => item.htid === htid)
            );
          })

          .map(service => {
            const htid = this.extractHtid(service.serviceUrl);
            const match = searchResults.find(item => item.htid === htid)!;

            const alreadyEnriched = (match.orig && service.packageName?.includes(match.orig)) ||
                                    (match.enumcron && service.packageName?.includes(match.enumcron));

            if (expanded == undefined && !alreadyEnriched) {
              let packageName = service.packageName || '';
              if (match.enumcron) {
                packageName += ` (${match.enumcron})`;
              }
              if (match.orig) {
                packageName += `<br><small>source: ${match.orig}</small>`;
              }
              return {
                ...service,
                packageName: packageName
              };
            }
            else {
              return {
                ...service,
                packageName: service.packageName
              };
            }
          });
          
        this.hostComponent.electronicServices = otherServices.concat(updatedServices);
        
        if (!expanded) {
          this.hostComponent.electronicServicesToShow = this.hostComponent.electronicServices.slice(0, this.showLimit);
        }
        else if (expanded) {
          this.hostComponent.electronicServicesToShow = this.hostComponent.electronicServices;
        }

        const button = document.querySelector(
          '[data-qa="view-it-section-show-more-or-show-less"]'
        ) as HTMLElement;
        if (button) {
          button.style.display = this.hostComponent.electronicServices.length <= this.showLimit ? 'none' : 'block';
        }
      }
    });
  }

  private extractHtid(url: string | null): string {
    if (!url) return '';
    return url.split('/2027/')[1] || url.split('/').pop() || '';
  }
}

interface ServiceEntry {
  serviceUrl: string | null;
  packageName: string | null;
}