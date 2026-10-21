'use client';

import { useState } from 'react';

/** One row of filter pills: its label, the "all" option, then the values to pick from. */
export type Facet = { key: string; label: string; all: string; options: { value: string; label: string }[] };
/** An item's value for each facet, or what is picked in each row ('' or missing means all). */
export type Facets = Record<string, string>;

export const matches = (item: Facets, picked: Facets) => Object.entries(picked).every(([k, v]) => !v || item[k] === v);

/** What is picked in each filter row. */
export function useFilters() {
  const [picked, setPicked] = useState<Facets>({});
  return { picked, pick: (key: string, value: string) => setPicked(s => ({ ...s, [key]: value })) };
}

/** `data-f-*` attributes with an item's facet values, read by the static preview's filter script. */
export const facetAttrs = (f: Facets) => Object.fromEntries(Object.entries(f).map(([k, v]) => ['data-f-' + k, v]));

/**
 * Rows of filter pills that combine. Each count follows what is picked in the other rows,
 * and an option with nothing to show is disabled, so the list never comes up empty.
 */
export function FilterBar({ facets, items, picked, onPick }: { facets: Facet[]; items: Facets[]; picked: Facets; onPick: (key: string, value: string) => void }) {
  return (
    <div className="filterbar">
      {facets.map(f => (
        <div key={f.key} className="filters" role="group" aria-labelledby={'filter-' + f.key}>
          <span id={'filter-' + f.key} className="filters__label">{f.label}</span>
          <div className="filters__pills">
            {[{ value: '', label: f.all }, ...f.options].map(o => {
              const n = items.filter(it => matches(it, { ...picked, [f.key]: o.value })).length;
              const on = (picked[f.key] ?? '') === o.value;
              return (
                <button key={o.value} type="button" className="filter" data-key={f.key} data-value={o.value} aria-pressed={on} disabled={!n && !on} onClick={() => onPick(f.key, o.value)}>
                  {o.label}<small>{n}</small>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
