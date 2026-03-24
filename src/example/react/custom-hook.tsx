import { useMemo, useEffect, useRef } from 'react';
import { useDebounce } from 'kk-debounce/react';

export default function DebounceHook() {
  const search = useDebounce(
    () => {
      // Your debounce logic here
    },
    { ms: 500 },
    { autoAbort: true }
  );

  return;
}
