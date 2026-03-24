import { useEffect, useMemo, useState } from 'react';
import { debounce } from 'kk-debounce';

function Editor() {
  const [content, setContent] = useState('');

  const autoSave = useMemo(
    () =>
      debounce(
        async (text: string) => {
          console.log('Saving to Database...', text);
          // Simulate API Call
          await new Promise((res) => setTimeout(res, 1000));
        },
        { seconds: 2 }
      ), // รอ 2 วินาทีหลังจากหยุดพิมพ์
    []
  );

  // 🛡️ Safety Mechanism: ถ้า User จะปิดแท็บ ให้เซฟทันที!
  useEffect(() => {
    const handleBeforeUnload = () => autoSave.cancel(); // หรือใช้ .flush() ถ้าต้องการเซฟก่อนปิด
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      autoSave.flush(); // เซฟงานค้างตอน Component Unmount
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
