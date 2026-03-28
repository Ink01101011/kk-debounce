import { debouncedSignal } from 'kk-debounce/debounceSignal';

let internalSearchState = '';
const abortController = new AbortController();
const fakeApi = {
  search(query: string) {
    console.log('Searching:', query);
  },
};

const searchAction = debouncedSignal(
  () => internalSearchState,
  (val) => {
    internalSearchState = val;
    fakeApi.search(val);
  },
  { seconds: 1 },
  { signal: abortController.signal }
);

// User types
searchAction('กะเพรา');

// UI can read pending state
if (searchAction.isPending) {
  console.log('กำลังรอหยุดพิมพ์เพื่อค้นหา...');
}

// User presses Enter -> force immediate update
searchAction.flush();
