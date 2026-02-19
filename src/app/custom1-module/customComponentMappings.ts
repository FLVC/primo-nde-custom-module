import { FlvcBannerComponent } from "../flvc-banner/flvc-banner.component";
import { HathiAvailabilityComponent } from "../hathi-availability/hathi-availability.component";
import { HathiRequestComponent } from "../hathi-request/hathi-request.component";
import { LibChatComponent } from "../lib-chat/lib-chat.component";
import { NicheAcademyComponent } from "../niche-academy/niche-academy.component";
import { UborrowRequestComponent } from "../uborrow-request/uborrow-request.component";
import { UborrowVolumeComponent } from "../uborrow-volume/uborrow-volume.component";
import { WorldCatFacetComponent } from "../world-cat-facet/world-cat-facet.component";

// Define the map
export const selectorComponentMap = new Map<string, any>([

['nde-header-top', FlvcBannerComponent],
['nde-record-actions-bottom', HathiRequestComponent],
['nde-base-request-form-after', UborrowRequestComponent],
['nde-base-request-form-bottom', UborrowVolumeComponent],
['nde-record-availability-after', HathiAvailabilityComponent],
['nde-search-filters-side-nav-bottom', WorldCatFacetComponent],
['nde-footer-after', LibChatComponent],
['nde-header-after', NicheAcademyComponent],

]);
