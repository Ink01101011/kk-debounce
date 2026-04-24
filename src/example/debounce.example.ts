import { debounce } from 'kk-debounce/debounce';

// Simulate a search task: only the latest call should run after idle time.
const search = debounce(
  async (query: string) => {
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      const result = await response.json();
      console.log('Latest result:', result);
    } catch (error) {
      // autoAbort cancels the previous call's signal; AbortError is expected and not a failure.
      if (error instanceof Error && error.name === 'AbortError') return;
      console.error('Search failed:', error);
    }
  },
  { seconds: 0.5 },
  { autoAbort: true }
);

search('rea');
search('react');
search('react 19');
