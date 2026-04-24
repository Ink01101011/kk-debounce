import { debounce } from 'kk-debounce/debounce';

const externalController = new AbortController();

const debouncedFetch = debounce(
  async (query: string, signal: AbortSignal) => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`, {
        signal,
      });
      const result = await response.json();
      console.log('result:', result);
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Fetch failed:', error);
    }
  },
  { ms: 500 },
  {
    autoAbort: true,
    signal: externalController.signal,
  }
);

const perRequestController = new AbortController();
debouncedFetch('react hooks', perRequestController.signal);

// Cancel pending debounce work from outside.
setTimeout(() => {
  externalController.abort('component unmounted');
}, 200);
