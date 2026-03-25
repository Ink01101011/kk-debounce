import { useMemo, useEffect } from 'react';
import { debounce } from 'kk-debounce';

function SearchComponent() {
  
  const debouncedSearch = useMemo(
    () =>
      debounce(
        async (query: string) => {
          try {
            const response = await fetch(`/api/search?q=${query}`);
            const data = await response.json();
            console.log(data);
          } catch (err) {
            if (err.name === 'AbortError') console.log('Fetch aborted');
          }
        },
        { ms: 500 },
        { autoAbort: true }
      ),
    [] // สร้างแค่ครั้งเดียวตอน Mount
  );

  // สำคัญมาก: ต้อง Cleanup เมื่อ Component ถูก Unmount
  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  return (
    <input
      type="text"
      onChange={(e) => debouncedSearch(e.target.value)}
      placeholder="Search..."
    />
  );
}
