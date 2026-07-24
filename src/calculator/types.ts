/**
 * Тип экспертизы: первичная или повторная.
 * Повторная считается с коэффициентом 0.3 от суммы первичной.
 */
export type ExpertiseKind = 'primary' | 'repeat';

export type Variant =
  | 'engineering_survey_residential' // 1. Инженерные изыскания, жилые объекты
  | 'design_docs_residential' // 2. Проектная документация, жилые объекты
  | 'design_docs_and_survey_residential' // 3. ПД + изыскания, жилые объекты
  | 'design_docs_non_residential' // 4. ПД и/или изыскания, нежилые объекты
  | 'estimate_verification'; // 5. Проверка достоверности сметной стоимости капремонта

export type DocPurpose = 'construction' | 'capital_repair';

export type NonResidentialScope = 'design_only' | 'survey_only' | 'both';

export interface CalculatorState {
  expertiseKind: ExpertiseKind | null;
  variant: Variant | null;

  // Вариант 1: инженерные изыскания, жилые
  landArea1: string; // Xж, м²

  // Вариант 2: проектная документация, жилые
  landArea2: string; // Xж, м²
  totalArea2: string; // Yж, м²
  purpose2: DocPurpose | null;

  // Вариант 3: ПД + изыскания, жилые
  landArea3: string; // Xж, м²
  totalArea3: string; // Yж, м²
  purpose3: DocPurpose | null;

  // Вариант 4: нежилые объекты
  scope4: NonResidentialScope | null;
  designCost4: string; // Спд, руб. в ценах 2001 года
  surveyCost4: string; // Сиж, руб. в ценах 2001 года

  // Вариант 5: проверка сметной стоимости капремонта
  estimateCost5: string; // руб., без НДС
}

export interface CalculationResult {
  /** Стоимость услуги без НДС, округлённая */
  total: number;
  /** Стоимость услуги с НДС, округлённая */
  totalWithVat: number;
  breakdown: string;
}

export const initialCalculatorState: CalculatorState = {
  expertiseKind: null,
  variant: null,
  landArea1: '',
  landArea2: '',
  totalArea2: '',
  purpose2: null,
  landArea3: '',
  totalArea3: '',
  purpose3: null,
  scope4: null,
  designCost4: '',
  surveyCost4: '',
  estimateCost5: '',
};
