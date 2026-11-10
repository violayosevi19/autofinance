"use client";

import { useRef, useState } from "react";

interface Props {
  accept: string;
  label: string;
  onFile: (file: File) => void;
}

export default function UploadZone({ accept, label, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  function handleFile(file: File) {
    onFile(file);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  }

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={onDrop}
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer rounded-xl border-2 border-dashed p-12 text-center transition-colors select-none
        ${dragging
          ? "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
          : "border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-500 bg-white dark:bg-zinc-900"
        }`}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={onChange} />
      <div className="flex flex-col items-center gap-3 pointer-events-none">
        <svg className="w-10 h-10 text-zinc-300 dark:text-zinc-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M12 12V4m0 0L8 8m4-4l4 4" />
        </svg>
        <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">{label}</p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500">Drag & drop atau klik untuk pilih file</p>
        <p className="text-xs text-zinc-300 dark:text-zinc-600">{accept}</p>
      </div>
    </div>
  );
}
