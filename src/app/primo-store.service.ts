import { createFeatureSelector, createSelector } from '@ngrx/store';
import { parseVid } from './shared/utils';

interface FullDisplayState {
  selectedRecordId: string | null;
}

interface SearchState {
  searchParams: { [key: string]: any };
  entities: { [key: string]: any };
}

interface RouterState {
  isFirstNavigation: string | null;
  routerState: string | null;
}

type ViewConfig = { config: { vid: string } };
export const selectViewConfig = createFeatureSelector<ViewConfig>('viewConfig');

export const selectView = createSelector(
  selectViewConfig,
  (viewConfig) => parseVid(viewConfig.config.vid)
);

export const selectInstitutionCode = createSelector(
  selectView,
  (parsed) => parsed.institutionCode
);

export const selectViewId = createSelector(
  selectView,
  (parsed) => parsed.viewId
);

const selectFullDisplay = createFeatureSelector<FullDisplayState>('full-display');
const selectSearchState = createFeatureSelector<SearchState>('Search');
const selectFullDisplayRecordId = createSelector(
  selectFullDisplay,
  (fullDisplay: FullDisplayState) => fullDisplay?.selectedRecordId ?? null
);
const selectSearchEntities = createSelector(
  selectSearchState,
  state => state.entities
);

export const selectFullDisplayRecord = createSelector(
  selectFullDisplayRecordId,
  selectSearchState,
  (recordId: string | null, searchState: SearchState) => recordId ? searchState.entities[recordId] : null
);

export const selectListViewRecord = (recordId: string) =>
  createSelector(
    selectSearchEntities,
    entities => entities[recordId]
  );

export const selectSearchParams = createSelector(
  selectSearchState,
  state => state.searchParams ?? null
);

const selectFeatureRouterState = createFeatureSelector<RouterState>('routerState');
export const selectRouterState = createSelector(
  selectFeatureRouterState,
  state => state.routerState ?? null
);