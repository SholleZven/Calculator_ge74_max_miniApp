import type { CalculationResult, CalculatorState } from './types';

/** Коэффициент-дефлятор Ki (инфляционный, к ценам 2001 года) */
const KI = 8.6;

/** Ставка НДС, заложенная в исходном калькуляторе (b * 1.22) */
const VAT_MULTIPLIER = 1.22;

/** Коэффициент для повторной экспертизы (30% от суммы первичной) */
const REPEAT_COEFFICIENT = 0.3;

/** БСиж = Aиж + Bиж × Xж */
const A_IZH = 13_000;
const B_IZH = 5;

/** БСпдж = (Aпдж + Bпдж × Xж + Cпдж × Yж) × Kн × Kс */
const A_PDZH = 100_000;
const B_PDZH = 35;
const C_PDZH = 3.5;

/** Kс — коэффициент сложности проектной документации.*/
const KS = 1;

/** Минимальная плата за проверку сметной стоимости капремонта МКД, руб. с НДС */
const MIN_ESTIMATE_FEE_WITH_VAT = 24_000;

/** Парсит строку из инпута в неотрицательное число. Невалидные значения → 0 */
function parsePositive(value: string): number {
  const n = Math.abs(parseFloat(value.replace(',', '.')));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Процент от суммарной стоимости проектных/изыскательских работ (табл. к Пост. №145),
 * применяется к вариантам с нежилыми объектами (вариант 4).
 * Возвращает значение в процентах (например, 33.75), не в долях.
 */
function getNonResidentialPercent(totalCost: number): number {
  const tiers: Array<[limit: number, percent: number]> = [
    [150_000, 33.75],
    [250_000, 29.25],
    [500_000, 27.3],
    [750_000, 20.22],
    [1_000_000, 16.65],
    [1_500_000, 12.69],
    [3_000_000, 11.88],
    [4_000_000, 10.98],
    [6_000_000, 8.77],
    [8_000_000, 7.07],
    [12_000_000, 6.15],
    [18_000_000, 4.76],
    [24_000_000, 4.13],
    [30_000_000, 3.52],
    [36_000_000, 3.06],
    [45_000_000, 2.62],
    [52_500_000, 2.33],
    [60_000_000, 2.01],
    [70_000_000, 1.68],
    [80_000_000, 1.56],
    [100_000_000, 1.22],
    [120_000_000, 1.04],
    [140_000_000, 0.9],
    [160_000_000, 0.8],
    [180_000_000, 0.73],
    [200_000_000, 0.66],
    [220_000_000, 0.61],
  ];
  const tier = tiers.find(([limit]) => totalCost <= limit);
  return tier ? tier[1] : 0.58;
}

/** Коэффициент Ki для проверки сметной стоимости капремонта (вариант 5) */
function getEstimateVerificationCoefficient(estimateCost: number): number {
  if (estimateCost <= 10_000_000) return 1;
  if (estimateCost <= 30_000_000) return 0.35;
  if (estimateCost <= 100_000_000) return 0.23;
  if (estimateCost <= 200_000_000) return 0.1;
  if (estimateCost <= 500_000_000) return 0.09;
  return 0.08;
}

const rubles = (n: number) => new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(n);

function finalize(rawBase: number, isRepeat: boolean, round: (n: number) => number, breakdown: string): CalculationResult {
  const base = isRepeat ? rawBase * REPEAT_COEFFICIENT : rawBase;
  return {
    total: round(base),
    totalWithVat: round(base * VAT_MULTIPLIER),
    breakdown: isRepeat
      ? `${breakdown}\n\nЭто повторная экспертиза: итог × ${REPEAT_COEFFICIENT} (30% от стоимости первичной экспертизы).`
      : breakdown,
  };
}

export function calculate(state: CalculatorState): CalculationResult | null {
  const isRepeat = state.expertiseKind === 'repeat';

  switch (state.variant) {
    case 'engineering_survey_residential': {
      const x = parsePositive(state.landArea1);
      if (x <= 0) return null;

      const base = KI * (B_IZH * x + A_IZH);
      const breakdown =
        `БСиж = ${A_IZH.toLocaleString('ru-RU')} + ${B_IZH} × Xж\n` +
        `РПиж = БСиж × Ki\n` +
        `РПиж = (${B_IZH} × ${x} + ${A_IZH.toLocaleString('ru-RU')}) × ${KI} = ${rubles(base)} руб.`;
      return finalize(base, isRepeat, Math.ceil, breakdown);
    }

    case 'design_docs_residential': {
      const x = parsePositive(state.landArea2);
      const y = parsePositive(state.totalArea2);
      if (x <= 0 || y <= 0 || !state.purpose2) return null;

      const kn = state.purpose2 === 'capital_repair' ? 0.5 : 1;
      const base = KI * (A_PDZH + B_PDZH * x + C_PDZH * y) * KS * kn;
      const breakdown =
        `БСпдж = (${A_PDZH.toLocaleString('ru-RU')} + ${B_PDZH} × Xж + ${C_PDZH} × Yж) × Kс × Kн\n` +
        `РПпдж = БСпдж × Ki\n` +
        `РПпдж = (${A_PDZH.toLocaleString('ru-RU')} + ${B_PDZH} × ${x} + ${C_PDZH} × ${y}) × ${KS} × ${kn} × ${KI} = ${rubles(base)} руб.`;
      return finalize(base, isRepeat, Math.ceil, breakdown);
    }

    case 'design_docs_and_survey_residential': {
      const x = parsePositive(state.landArea3);
      const y = parsePositive(state.totalArea3);
      if (x <= 0 || y <= 0 || !state.purpose3) return null;

      const kn = state.purpose3 === 'capital_repair' ? 0.5 : 1;
      const bsPdzh = KI * (A_PDZH + B_PDZH * x + C_PDZH * y) * KS * kn;
      const bsIzh = KI * (B_IZH * x + A_IZH);
      const base = 0.9 * (bsPdzh + bsIzh);
      const breakdown =
        `БСпдж = (${A_PDZH.toLocaleString('ru-RU')} + ${B_PDZH} × Xж + ${C_PDZH} × Yж) × Kс × Kн × Ki = ${rubles(bsPdzh)} руб.\n` +
        `БСиж = (${B_IZH} × Xж + ${A_IZH.toLocaleString('ru-RU')}) × Ki = ${rubles(bsIzh)} руб.\n` +
        `РПж = (БСпдж + БСиж) × 0.9 = ${rubles(base)} руб.`;
      return finalize(base, isRepeat, Math.ceil, breakdown);
    }

    case 'design_docs_non_residential': {
      const designCost = state.scope4 === 'survey_only' ? 0 : parsePositive(state.designCost4);
      const surveyCost = state.scope4 === 'design_only' ? 0 : parsePositive(state.surveyCost4);
      const totalCost = designCost + surveyCost;
      if (!state.scope4 || totalCost <= 0) return null;

      const percent = getNonResidentialPercent(totalCost) / 100;
      const base = KI * designCost * percent + KI * surveyCost * percent;
      const breakdown =
        `П (процент по табл. к Пост. №145 для суммы ${rubles(totalCost)} руб.) = ${(percent * 100).toFixed(2)}%\n` +
        `РПнж = Спд × П × Ki + Сиж × П × Ki\n` +
        `РПнж = ${rubles(designCost)} × ${(percent * 100).toFixed(2)}% × ${KI} + ${rubles(surveyCost)} × ${(percent * 100).toFixed(2)}% × ${KI} = ${rubles(base)} руб.`;
      return finalize(base, isRepeat, Math.ceil, breakdown);
    }

    case 'estimate_verification': {
      const cost = parsePositive(state.estimateCost5);
      if (cost <= 0) return null;

      const ki = getEstimateVerificationCoefficient(cost);
      const minFee = MIN_ESTIMATE_FEE_WITH_VAT / VAT_MULTIPLIER;
      let base = cost * 0.01 * ki;
      const wasClamped = base < minFee;
      if (wasClamped) base = minFee;

      const breakdown =
        `Стоимость проверки = Сметная стоимость × 1% × Ki\n` +
        `Ki (поправочный коэффициент для суммы ${rubles(cost)} руб.) = ${ki}\n` +
        (wasClamped
          ? `Результат ниже минимальной платы — применена минимальная плата ${MIN_ESTIMATE_FEE_WITH_VAT.toLocaleString('ru-RU')} руб. с НДС.`
          : `Стоимость проверки = ${rubles(cost)} × 1% × ${ki} = ${rubles(base)} руб.`);
      return finalize(base, isRepeat, Math.floor, breakdown);
    }

    default:
      return null;
  }
}
