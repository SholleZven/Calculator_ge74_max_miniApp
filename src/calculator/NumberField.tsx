import type { ChangeEvent } from 'react';
import { Input, Typography } from '@maxhub/max-ui';

interface NumberFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suffix?: string;
  maxLength?: number;
}

/** Разрешаем только цифры и один разделитель дробной части (как в оригинальном калькуляторе, но чуть мягче) */
function sanitizeNumericInput(raw: string): string {
  const normalized = raw.replace(/,/g, '.');
  const match = normalized.match(/^\d*\.?\d*/);
  return match ? match[0] : '';
}

export function NumberField({ id, label, value, onChange, suffix, maxLength = 14 }: NumberFieldProps) {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(sanitizeNumericInput(event.target.value));
  };

  return (
    <div className="number-field">
      <label htmlFor={id} className="number-field__label">
        <Typography.Label variant="medium">{label}</Typography.Label>
      </label>
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        maxLength={maxLength}
        placeholder="0"
        value={value}
        onChange={handleChange}
        hint={suffix}
        withClearButton
      />
    </div>
  );
}
