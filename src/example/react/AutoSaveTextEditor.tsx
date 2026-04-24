import { useDebounce } from 'kk-debounce/react';
import { useEffect, useState } from 'react';

export default function Editor() {
  const [content, setContent] = useState('');
  
  const autoSave = useDebounce(async (text: string) => {
    console.log('Saving to Database...', text);
    // Simulate API Call
    await new Promise((res) => setTimeout(res, 1000));
  }, 2000); // Wait 2 seconds after the user stops typing before saving

  // Flush or cancel the pending save when the user closes or navigates away from the tab.
  useEffect(() => {
    const handleBeforeUnload = () => autoSave.cancel(); // use .flush() instead to save before closing
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [autoSave]);

  return (
    <textarea
      value={content}
      onChange={(e) => {
        setContent(e.target.value);
        autoSave(e.target.value);
      }}
      placeholder="Start writing..."
    />
  );
}
