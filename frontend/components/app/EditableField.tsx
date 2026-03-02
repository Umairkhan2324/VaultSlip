"use client";
import { useState, useRef, useEffect } from "react";

type EditableFieldProps = {
  value: string | null | undefined;
  onSave: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function EditableField({
  value,
  onSave,
  placeholder = "Click to edit",
  className = "",
}: EditableFieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value || "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  function handleBlur() {
    setIsEditing(false);
    if (editValue !== (value || "")) {
      onSave(editValue);
    } else {
      setEditValue(value || "");
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter") {
      handleBlur();
    } else if (e.key === "Escape") {
      setEditValue(value || "");
      setIsEditing(false);
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className={`min-w-0 flex-1 rounded border border-blue-500 px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
      />
    );
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className={`cursor-text rounded px-2 py-1 text-sm hover:bg-slate-100 ${className}`}
    >
      {value || <span className="text-slate-400">{placeholder}</span>}
    </span>
  );
}
