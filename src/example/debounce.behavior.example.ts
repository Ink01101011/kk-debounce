import { debounce } from 'kk-debounce/debounce';

const trailingSearch = debounce(
  (query: string) => {
    console.log('[trailing] search:', query);
  },
  400,
  { behavior: 'trailing' }
);

const leadingSearch = debounce(
  (query: string) => {
    console.log('[leading] search immediately:', query);
  },
  400,
  { behavior: 'leading' }
);

// Trailing: only the latest call after idle time.
trailingSearch('re');
trailingSearch('rea');
trailingSearch('react');

// Leading: fire immediately once per debounce window.
leadingSearch('a');
leadingSearch('ab');
leadingSearch('abc');

setTimeout(() => {
  leadingSearch('abcd');
}, 450);

// Manual cleanup if needed.
setTimeout(() => {
  trailingSearch.cancel();
  leadingSearch.cancel();
}, 2000);
