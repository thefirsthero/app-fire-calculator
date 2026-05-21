export const DEFAULT_CURRENCY = 'USD' as const
export const CURRENCY_PARAM_KEY = 'cur'

export type CurrencyCode =
  | 'USD'
  | 'ZAR'
  | 'EUR'
  | 'GBP'
  | 'CAD'
  | 'AUD'
  | 'JPY'

export interface CurrencyOption {
  code: CurrencyCode
  label: string
  locale: string
}

// Approximate spot rates; refresh periodically.
// Values are "units of currency per 1 USD".
export const CURRENCY_RATES: Record<CurrencyCode, number> = {
  USD: 1,
  ZAR: 18.2,
  EUR: 0.93,
  GBP: 0.79,
  CAD: 1.37,
  AUD: 1.52,
  JPY: 156,
}

export const SUPPORTED_CURRENCIES: CurrencyOption[] = [
  { code: 'USD', label: 'US Dollar', locale: 'en-US' },
  { code: 'ZAR', label: 'South African Rand', locale: 'en-ZA' },
  { code: 'EUR', label: 'Euro', locale: 'de-DE' },
  { code: 'GBP', label: 'British Pound', locale: 'en-GB' },
  { code: 'CAD', label: 'Canadian Dollar', locale: 'en-CA' },
  { code: 'AUD', label: 'Australian Dollar', locale: 'en-AU' },
  { code: 'JPY', label: 'Japanese Yen', locale: 'ja-JP' },
]

export function isSupportedCurrency(value: string): value is CurrencyCode {
  return SUPPORTED_CURRENCIES.some((currency) => currency.code === value)
}

export function getCurrencyOption(currencyCode: CurrencyCode): CurrencyOption {
  return (
    SUPPORTED_CURRENCIES.find((currency) => currency.code === currencyCode) ??
    SUPPORTED_CURRENCIES[0]
  )
}

export function convertCurrencyAmount(
  amount: number,
  fromCurrency: CurrencyCode,
  toCurrency: CurrencyCode
): number {
  if (!Number.isFinite(amount) || fromCurrency === toCurrency) {
    return amount
  }

  const fromRate = CURRENCY_RATES[fromCurrency]
  const toRate = CURRENCY_RATES[toCurrency]

  // Convert to USD, then to target currency.
  const amountInUsd = amount / fromRate
  return amountInUsd * toRate
}

export function formatCurrencyAmount(
  value: number,
  currencyCode: CurrencyCode,
  maximumFractionDigits = 0
): string {
  const option = getCurrencyOption(currencyCode)

  return new Intl.NumberFormat(option.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits,
  }).format(value)
}

export function formatCompactCurrencyAmount(
  value: number,
  currencyCode: CurrencyCode
): string {
  if (Math.abs(value) >= 1_000_000) {
    return `${getCurrencySymbol(currencyCode)}${(value / 1_000_000).toFixed(1)}M`
  }

  if (Math.abs(value) >= 1_000) {
    return `${getCurrencySymbol(currencyCode)}${(value / 1_000).toFixed(0)}K`
  }

  return formatCurrencyAmount(value, currencyCode, 0)
}

export function getCurrencySymbol(currencyCode: CurrencyCode): string {
  const option = getCurrencyOption(currencyCode)

  const parts = new Intl.NumberFormat(option.locale, {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).formatToParts(0)

  return parts.find((part) => part.type === 'currency')?.value ?? '$'
}

export function getCurrentCurrencyCode(): CurrencyCode {
  if (typeof window === 'undefined') {
    return DEFAULT_CURRENCY
  }

  const searchParams = new URLSearchParams(window.location.search)
  const urlCurrency = searchParams.get(CURRENCY_PARAM_KEY)

  if (urlCurrency && isSupportedCurrency(urlCurrency)) {
    return urlCurrency
  }

  try {
    const raw = window.localStorage.getItem('fire-calc-params')
    if (raw) {
      const parsed = JSON.parse(raw) as { currency?: string }
      if (parsed.currency && isSupportedCurrency(parsed.currency)) {
        return parsed.currency
      }
    }
  } catch {
    // Ignore malformed values.
  }

  return DEFAULT_CURRENCY
}
