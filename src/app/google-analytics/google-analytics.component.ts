import { Component, inject, Inject, NgZone, OnInit, Renderer2 } from '@angular/core';
import { ScriptLoaderService } from '../script-loader.service';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, Observable, shareReplay, take } from 'rxjs';
import { selectBrowseSearchParamsOnSuccess, selectRouterState, selectSearchParamsOnSuccess, selectViewId } from '../primo-store.service';

@Component({
  selector: 'custom-google-analytics',
  standalone: true,
  imports: [],
  templateUrl: './google-analytics.component.html',
  styleUrl: './google-analytics.component.scss'
})
export class GoogleAnalyticsComponent implements OnInit {
  private searchParams$: Observable<any> | undefined;
  private browseSearchParams$: Observable<any> | undefined;
  public store = inject(Store);

  private viewId: string = "";
  private route: string = "";

  readonly viewId$ = this.store.select(selectViewId).pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  readonly route$ = this.store.select(selectRouterState).pipe(
    distinctUntilChanged(),
    shareReplay({ bufferSize: 1, refCount: true })
  );

  constructor(
    @Inject('MODULE_PARAMETERS') public moduleParameters: any,
    private scripts: ScriptLoaderService,
    private zone: NgZone,
    private renderer: Renderer2
  ) { }

  async ngOnInit(): Promise<void> {
    const enabled = this.moduleParameters.googleAnalyticsEnabled === "true";
    const viewStreamIdsParam = this.moduleParameters.googleAnalyticsViewStreamIds;
    const viewStreamIds: { [key: string]: string } = viewStreamIdsParam?.replace(/^\[|"|\]$/g, "").split(',').reduce((list:any, item:string) => {
      const keyValue = item.split(':');
      return {...list, [keyValue[0]]: keyValue[1]}
    }, {});

    if (!enabled || viewStreamIdsParam == undefined) {
      return;
    }

    this.viewId$
      .pipe(take(1))
      .subscribe(code => {
        this.viewId = code ?? '';
      });

    if (viewStreamIds == undefined || viewStreamIds[this.viewId] == undefined) {
      return;
    }

    const googleAnalyticsId = viewStreamIds[this.viewId];
    const googleAnalyticsScript = "https://www.googletagmanager.com/gtag/js?id=" + googleAnalyticsId;
    const googleAnalyticsCode = `window.dataLayer = window.dataLayer || [];
                                        function gtag(){dataLayer.push(arguments);}
                                        gtag('js', new Date());
                                        gtag('config', '` + googleAnalyticsId + `', { 'debug_mode':false });`;

    await this.zone.runOutsideAngular(() =>
      this.scripts.load(
        googleAnalyticsScript,
        {
          defer: true,
          async: true,
        }
      )
    );

    const script = this.renderer.createElement('script') as HTMLScriptElement;
    script.innerHTML = googleAnalyticsCode;
    script.type = 'text/javascript';
    const target = document.head || document.body;
    this.renderer.appendChild(target, script);

    this.searchParams$ = this.store.select(selectSearchParamsOnSuccess); 	//only works when search completed
    this.searchParams$.subscribe((searchParams) => {
      if (searchParams) {

        this.route$
          .pipe(take(1))
          .subscribe(rt => {
            this.route = rt ?? '';
          });
        
        const query = searchParams.q ?? null;
        const tab = searchParams.tab ?? null;
        const search_scope = searchParams.scope ?? null;
        const search_mode = searchParams.mode ?? null;
        const facet = searchParams.multiFacets && searchParams.multiFacets.length > 0 ? searchParams.multiFacets[0] : null;
        const event_parameters: Record<string, any> = {
          page_location: window.location.href,
          debug_mode: false,
          send_to: googleAnalyticsId
        };
        if (query != null) {
          event_parameters['search_term'] = query;
        }
        if (tab != null) {
          event_parameters['tab'] = tab;
        }
        if (search_scope != null) {
          event_parameters['search_scope'] = search_scope;
        }
        if (facet != null) {
          event_parameters['facet'] = facet;
        }
        if (search_mode != null) {
          event_parameters['search_mode'] = search_mode;
        }
        if (query) {
          if (this.route == "search") {
            event_parameters['search_type'] = 'Library';
          }
          else if (this.route == "jsearch") {
            event_parameters['search_type'] = 'Journal';
          }
          else if (this.route == "dbsearch") {
            event_parameters['search_type'] = 'Database';
          }
          else if (this.route == "npsearch") {
            event_parameters['search_type'] = 'Newspaper';
          }
          else if (this.route == "collectionDiscovery") {
            event_parameters['search_type'] = 'Collection';
          }
          (window as any).gtag('event', 'view_search_results', event_parameters);
        }
      }
    });

    this.browseSearchParams$ = this.store.select(selectBrowseSearchParamsOnSuccess); 	//only works when browse search completed
    this.browseSearchParams$.subscribe((browseSearchParams) => {
      if (browseSearchParams) {

        this.route$
          .pipe(take(1))
          .subscribe(rt => {
            this.route = rt ?? '';
          });
        
        const browseQuery = browseSearchParams.searchWord ?? null;
        const browseScope = browseSearchParams.browseField ?? null;

        const event_parameters: Record<string, any> = {
          page_location: window.location.href,
          debug_mode: false,
          send_to: googleAnalyticsId
        };
        if (browseQuery != null) {
          event_parameters['search_term'] = browseQuery;
          event_parameters['browseQuery'] = browseQuery;
        }
        if (browseScope != null) {
          event_parameters['browseScope'] = browseScope;
        }
        if (browseQuery) {
          if (this.route == "browse") {
            event_parameters['search_type'] = 'Browse';
            (window as any).gtag('event', 'view_search_results', event_parameters);
          }
        }
      }
    });
  }
}
