import type { ReactNode } from 'react';
import { CellHeader, CellList, CellSimple } from '@maxhub/max-ui';

export interface RadioOption<T extends string> {
  value: T;
  label: string;
  hint?: ReactNode;
}

interface RadioGroupProps<T extends string> {
  name: string;
  title: string;
  options: RadioOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
}

export function RadioGroup<T extends string>({ name, title, options, value, onChange }: RadioGroupProps<T>) {
  return (
    <fieldset className="radio-group">
      <legend className="radio-group__legend-reset" />
      <CellList mode="island" header={<CellHeader>{title}</CellHeader>}>
        {options.map((option, index) => {
          const inputId = `${name}-${option.value}`;
          const checked = value === option.value;
          return (
            <div key={option.value} className="radio-cell">
              <input
                id={inputId}
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="radio-cell__input"
              />
              {}
              <label htmlFor={inputId} className="radio-cell__label">
                <CellSimple
                  title={option.label}
                  subtitle={option.hint}
                  before={<span className={`radio-dot${checked ? ' radio-dot--checked' : ''}`} aria-hidden="true" />}
                  separator={index < options.length - 1}
                  className={checked ? 'radio-cell__body radio-cell__body--checked' : 'radio-cell__body'}
                />
              </label>
            </div>
          );
        })}
      </CellList>
    </fieldset>
  );
}
