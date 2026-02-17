import { CommonModule } from '@angular/common';
import { Component, Inject, inject, Input, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { distinctUntilChanged, Observable, shareReplay, take } from 'rxjs';
import { selectFullDisplayRecord, selectListViewRecord, selectViewId } from '../primo-store.service';
import { HathiAvailabilityService } from '../hathi-availability.service';
import { truncateWithEllipsis } from '../shared/utils';

@Component({
	selector: 'custom-hathi-availability',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './hathi-availability.component.html',
	styleUrl: './hathi-availability.component.scss'
})
export class HathiAvailabilityComponent implements OnInit {
	@Input() private hostComponent!: any;
	record$: Observable<any> | undefined;
	public store = inject(Store);

	oclc: string | undefined;
	fullTextLink: string | boolean = false;
	hathiTrustLookupUrl: string | undefined;
	online: boolean = false;
	isFullRecord: boolean = false;
	msg: string = '';
	entityId: string = '';
	viewId: string = '';
	bibTitle: string = '';

	readonly viewId$ = this.store.select(selectViewId).pipe(
		distinctUntilChanged(),
		shareReplay({ bufferSize: 1, refCount: true })
	);
	
	constructor(
		@Inject('MODULE_PARAMETERS') public moduleParameters: any,
		private hathiTrust: HathiAvailabilityService,
	) { }

	ngOnInit() {
		const enabled = this.moduleParameters.hathiAvailabilityEnabled === "true";
		const msg = this.moduleParameters.hathiAvailabilityMsg ?? 'Full Text Available at HathiTrust';
		const entityId = this.moduleParameters.hathiAvailabilityEntityId ?? '';
		const viewsParam = this.moduleParameters.libChatViews;
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

		this.msg = msg;
		this.entityId = entityId;

		this.record$ = this.store.select(selectFullDisplayRecord);
		this.record$.subscribe((record) => {
			if (record) {
				this.isFullRecord = true;
				this.updateHathiTrustAvailability(record);
				this.updateHathiTrustRecords(record, this.hostComponent);
			}
			else {
				this.isFullRecord = false;
			}
		});
		if (!this.isFullRecord) {
			this.record$ = this.store.select(selectListViewRecord(this.hostComponent?.searchResult?.pnx?.control?.recordid[0]));
			this.record$.subscribe((record) => {
				this.updateHathiTrustAvailability(record);
				this.updateHathiTrustRecords(record, this.hostComponent);
			});
		}

	}

	updateHathiTrustAvailability = (record: any): Observable<string> | boolean => {
		this.fullTextLink = false;

		if (record?.pnx?.display?.title) {
			console.log('bibTitle=' + record?.pnx?.display?.title);
			this.bibTitle = truncateWithEllipsis(record?.pnx?.display?.title[0], 50);
			console.log('bibTitle=' + this.bibTitle);
		}

		if (record?.pnx?.addata?.oclcid) {
			var hathiTrustIds = (record?.pnx?.addata?.oclcid || []).filter(this.isOclcNum).map((id: string) => {
				return 'oclc:' + id.toLowerCase().replace('(ocolc)', '');
			});
		}
		if (hathiTrustIds && (hathiTrustIds.length > 0)) {
			this.hathiTrust.findFullViewRecord(hathiTrustIds).subscribe((url) => {
				if (url) this.fullTextLink = this.formatLink(url);
				else this.fullTextLink = false;
			});
		}
		return false;
	}

	updateHathiTrustRecords = (record: any, hostComponent: any): Observable<string> | boolean => {
		const source = record?.pnx?.control?.originalsourceid?.[0] ?? '';
		const services = hostComponent?.docDelivery?.electronicServices;
		const serviceUrl = Array.isArray(services) ? services?.[0]?.serviceUrl ?? '' : '';

		const isHathiSource = source.includes('oai:quod.lib.umich.edu') || source.includes('oai:hathitrust.org');
		const hasHttpUrl = serviceUrl.startsWith('http');

		if (isHathiSource && hasHttpUrl) {
			this.fullTextLink = this.formatLink(serviceUrl);
		}

		return false;
	};

	isOclcNum = (value: string): any => {
		return value.match(/^(\(ocolc\))?\d+$/i);
	}

	formatLink(url: string): string {
		return this.entityId ? url + '?signon=swle:' + this.entityId : url;
	}
}

