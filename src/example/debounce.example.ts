import { debounce } from 'kk-debounce/debounce';

// Simulate a search task: only the latest call should run after idle time.
const search = debounce(
  async (query: string) => {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const result = await response.json();
    console.log('Latest result:', result);
  },
  { seconds: 0.5 },
  { autoAbort: true }
);

search('rea');
search('react');
search('react 19');
