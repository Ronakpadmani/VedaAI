"use client";

import { Minus, Plus } from "lucide-react";

interface StepperInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  label?: string;
}

export function StepperInput({
  value,
  onChange,
  min = 1,
  label,
}: StepperInputProps) {
  return (
    <div>
      {label && (
        <label className="mb-1 block text-xs text-brand-muted">{label}</label>
      )}
      <div className="flex items-center rounded-xl bg-gray-100 px-2 py-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(min, value - 1))}
          className="rounded-lg p-2 hover:bg-white"
          aria-label="Decrease"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="w-10 text-center text-sm font-medium">{value}</span>
        <button
          type="button"
          onClick={() => onChange(value + 1)}
          className="rounded-lg p-2 hover:bg-white"
          aria-label="Increase"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
