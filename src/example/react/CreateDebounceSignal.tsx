import React, { useState } from 'react';
import { useDebounceSignal } from 'kk-debounce/react';

export function ProfileEditor() {
  const [name, setName] = useState("John Doe");
  const [localName, setLocalName] = useState(name);
  // 🚀 Initialize our custom hook
  const debouncedUpdate = useDebounceSignal(
    () => name,           // Current source of truth
    (val) => setName(val), // Update the real state
    { ms: 800 },          // Wait 800ms
    { autoAbort: true }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setLocalName(val);      // Update UI immediately (smooth typing)
    debouncedUpdate(val);   // Start debounce timer
  };

  return (
    <div className="p-4 border rounded shadow">
      <label className="block text-sm font-bold mb-2">Display Name</label>
      
      <div className="relative">
        <input
          type="text"
          value={localName}
          onChange={handleChange}
          className="border p-2 w-full"
        />
        
        {/* ✨ UI Feedback using .isPending */}
        {debouncedUpdate.isPending && (
          <span className="absolute right-2 top-2 text-blue-500 text-sm animate-pulse">
            Saving...
          </span>
        )}
      </div>

      <div className="mt-4 text-gray-600 text-sm">
        <p>Database State: <span className="font-mono text-black">{name}</span></p>
      </div>

      {/* ⌨️ Keyboard shortcut or button to save immediately */}
      <button 
        onClick={() => debouncedUpdate.flush()}
        className="mt-2 text-xs text-blue-600 hover:underline"
      >
        Save Immediately (Flush)
      </button>
    </div>
  );
}