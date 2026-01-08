import { createFeatureSelector, createSelector } from '@ngrx/store';

interface FullDisplayState {
  selectedRecordId: string | null;
}

interface SearchState {
  entities: { [key: string]: any };
}

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
