import { useMemo, useState } from 'react';
import { Button, Typography } from '@maxhub/max-ui';
import { calculate } from './calc';
import { NumberField } from './NumberField';
import { RadioGroup, type RadioOption } from './RadioGroup';
import { initialCalculatorState, type CalculatorState, type DocPurpose, type NonResidentialScope, type Variant } from './types';

const EXPERTISE_KIND_OPTIONS: RadioOption<NonNullable<CalculatorState['expertiseKind']>>[] = [
  { value: 'primary', label: 'Первичная' },
  { value: 'repeat', label: 'Повторная', hint: '30% от стоимости первичной экспертизы' },
];

const VARIANT_OPTIONS: RadioOption<Variant>[] = [
  {
    value: 'engineering_survey_residential',
    label:
      'Государственная экспертиза результатов инженерных изысканий, выполняемых для строительства, реконструкции, капитального ремонта жилых объектов капитального строительства.',
  },
  {
    value: 'design_docs_residential',
    label: 'Государственная экспертиза проектной документации жилых объектов капитального строительства.',
  },
  {
    value: 'design_docs_and_survey_residential',
    label:
      'Государственная экспертиза проектной документации жилых объектов капитального строительства и результатов инженерных изысканий, выполняемых для подготовки такой проектной документации.',
  },
  {
    value: 'design_docs_non_residential',
    label:
      'Государственная экспертиза проектной документации нежилых объектов капитального строительства и (или) результатов инженерных изысканий, выполняемых для подготовки такой проектной документации.',
  },
  {
    value: 'estimate_verification',
    label: 'Проверка достоверности определения сметной стоимости капитального ремонта.',
  },
];

const PURPOSE_OPTIONS: RadioOption<DocPurpose>[] = [
  {
    value: 'construction',
    label: 'Проектная документация предназначена для строительства или реконструкции объекта капитального строительства',
  },
  { value: 'capital_repair', label: 'Капитальный ремонт объекта капитального строительства' },
];

const SCOPE4_OPTIONS: RadioOption<NonResidentialScope>[] = [
  { value: 'design_only', label: 'Только проектная документация' },
  { value: 'survey_only', label: 'Только результаты инженерных изысканий' },
  { value: 'both', label: 'Проектная документация и результаты инженерных изысканий' },
];

const currencyFormatter = new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 });
const formatRubles = (n: number) => `${currencyFormatter.format(n)} руб.`;

function update<K extends keyof CalculatorState>(
  setState: (updater: (prev: CalculatorState) => CalculatorState) => void,
  key: K,
) {
  return (value: CalculatorState[K]) => setState((prev) => ({ ...prev, [key]: value }));
}

export function Calculator() {
  const [state, setState] = useState<CalculatorState>(initialCalculatorState);
  const [showBreakdown, setShowBreakdown] = useState(false);

  const result = useMemo(() => calculate(state), [state]);

  const set = <K extends keyof CalculatorState>(key: K) => update(setState, key);

  const handleVariantChange = (variant: Variant) => {
    setState((prev) => ({ ...initialCalculatorState, expertiseKind: prev.expertiseKind, variant }));
    setShowBreakdown(false);
  };

  const handleReset = () => {
    setState(initialCalculatorState);
    setShowBreakdown(false);
  };

  return (
    <div className="calc-shell">
      <div className="calc-stack">
        <header className="calc-header">
          <Typography.Title variant="large-strong">Калькулятор стоимости госэкспертизы</Typography.Title>
          <Typography.Body variant="medium" className="calc-intro">
            Рассчитывает примерную стоимость проведения государственной экспертизы. Итоговая сумма будет определена
            при подаче заявления и полного комплекта документации.
          </Typography.Body>
        </header>

        <RadioGroup
          name="expertise-kind"
          title="Выберите тип экспертизы"
          options={EXPERTISE_KIND_OPTIONS}
          value={state.expertiseKind}
          onChange={set('expertiseKind')}
        />

        <RadioGroup
          name="variant"
          title="Выберите вариант экспертизы"
          options={VARIANT_OPTIONS}
          value={state.variant}
          onChange={handleVariantChange}
        />

        {state.variant === 'engineering_survey_residential' && (
          <div className="calc-subsection">
            <NumberField
              id="land-area-1"
              label="Площадь земли в пределах периметра жилого объекта капитального строительства"
              suffix="м²"
              value={state.landArea1}
              onChange={set('landArea1')}
            />
          </div>
        )}

        {state.variant === 'design_docs_residential' && (
          <div className="calc-subsection calc-subsection--stack">
            <NumberField
              id="land-area-2"
              label="Площадь земли в пределах периметра жилого объекта капитального строительства"
              suffix="м²"
              value={state.landArea2}
              onChange={set('landArea2')}
            />
            <NumberField
              id="total-area-2"
              label="Общая площадь объекта при новом строительстве либо площадь помещений при реконструкции, капремонте"
              suffix="м²"
              value={state.totalArea2}
              onChange={set('totalArea2')}
            />
            <RadioGroup
              name="purpose-2"
              title="Назначение проектной документации"
              options={PURPOSE_OPTIONS}
              value={state.purpose2}
              onChange={set('purpose2')}
            />
          </div>
        )}

        {state.variant === 'design_docs_and_survey_residential' && (
          <div className="calc-subsection calc-subsection--stack">
            <NumberField
              id="land-area-3"
              label="Площадь земли в пределах периметра жилого объекта капитального строительства"
              suffix="м²"
              value={state.landArea3}
              onChange={set('landArea3')}
            />
            <NumberField
              id="total-area-3"
              label="Общая площадь объекта при новом строительстве либо площадь помещений при реконструкции, капремонте"
              suffix="м²"
              value={state.totalArea3}
              onChange={set('totalArea3')}
            />
            <RadioGroup
              name="purpose-3"
              title="Назначение проектной документации"
              options={PURPOSE_OPTIONS}
              value={state.purpose3}
              onChange={set('purpose3')}
            />
          </div>
        )}

        {state.variant === 'design_docs_non_residential' && (
          <div className="calc-subsection calc-subsection--stack">
            <RadioGroup
              name="scope-4"
              title="Что считаем"
              options={SCOPE4_OPTIONS}
              value={state.scope4}
              onChange={set('scope4')}
            />
            {(state.scope4 === 'design_only' || state.scope4 === 'both') && (
              <NumberField
                id="design-cost-4"
                label="Стоимость изготовления проектной документации, в ценах 2001 года без НДС"
                suffix="руб."
                value={state.designCost4}
                onChange={set('designCost4')}
              />
            )}
            {(state.scope4 === 'survey_only' || state.scope4 === 'both') && (
              <NumberField
                id="survey-cost-4"
                label="Стоимость изготовления материалов инженерных изысканий, в ценах 2001 года без НДС"
                suffix="руб."
                value={state.surveyCost4}
                onChange={set('surveyCost4')}
              />
            )}
          </div>
        )}

        {state.variant === 'estimate_verification' && (
          <div className="calc-subsection calc-subsection--stack">
            <NumberField
              id="estimate-cost-5"
              label="Сметная стоимость капитального ремонта без НДС"
              suffix="руб."
              value={state.estimateCost5}
              onChange={set('estimateCost5')}
            />
            <Typography.Label variant="medium" className="calc-note">
              *За экспертизу в объёме проверки сметной стоимости капремонта многоквартирных домов (общего имущества в
              МКД), без экспертизы результатов инженерных изысканий и оценки соответствия проектной документации,
              взимается плата 24 000 руб., включая НДС.
            </Typography.Label>
          </div>
        )}

        {result && (
          <div className="calc-result">
            <div className="calc-result__row">
              <Typography.Body variant="medium">Стоимость услуги:</Typography.Body>
              <Typography.Title variant="medium-strong">{formatRubles(result.total)}</Typography.Title>
            </div>
            <div className="calc-result__row">
              <Typography.Body variant="medium">Стоимость услуги с НДС:</Typography.Body>
              <Typography.Headline variant="medium-strong">{formatRubles(result.totalWithVat)}</Typography.Headline>
            </div>

            <Button
              variant="secondary"
              size="small"
              onClick={() => setShowBreakdown((prev) => !prev)}
              className="calc-breakdown-toggle"
            >
              {showBreakdown ? 'Скрыть алгоритм расчёта' : 'Посмотреть алгоритм расчёта'}
            </Button>

            {showBreakdown && (
              <div className="calc-breakdown">
                <Typography.Label variant="medium" asChild>
                  <pre className="calc-breakdown__text">{result.breakdown}</pre>
                </Typography.Label>
              </div>
            )}
          </div>
        )}

        <Button variant="ghost" onClick={handleReset}>
          Сбросить
        </Button>
      </div>
    </div>
  );
}
