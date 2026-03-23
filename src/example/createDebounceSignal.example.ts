import { createDebouncedSignal } from '../packages/createDebounceSignal';

let internalSearchState = '';

const fakeApi = {
  search(query: string) {
    console.log('Searching:', query);
  },
};

const searchAction = createDebouncedSignal(
  () => internalSearchState,
  (val) => {
    internalSearchState = val;
    fakeApi.search(val);
  },
  { seconds: 1 }
);

// User types
searchAction('กะเพรา');

// UI can read pending state
if (searchAction.isPending) {
  console.log('กำลังรอหยุดพิมพ์เพื่อค้นหา...');
}

// User presses Enter -> force immediate update
searchAction.flush();
