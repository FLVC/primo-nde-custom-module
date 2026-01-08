import { FlvcBannerComponent } from "../flvc-banner/flvc-banner.component";
import { HathiRequestComponent } from "../hathi-request/hathi-request.component";

// Define the map
export const selectorComponentMap = new Map<string, any>([

['nde-header-top', FlvcBannerComponent],
['nde-record-actions-bottom', HathiRequestComponent],

]);
