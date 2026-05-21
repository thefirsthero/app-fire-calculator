import { useCalculatorParams } from '../../hooks/useCalculatorParams'
import { SUPPORTED_CURRENCIES } from '../../utils/currency'

export default function CurrencySelector() {
  const { params, setParam } = useCalculatorParams()

  return (
    <label className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
      <span className="font-medium">Currency</span>
      <select
        value={params.currency}
        onChange={(event) => setParam('currency', event.target.value)}
        className="rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm text-gray-900 focus:border-fire-500 focus:outline-none focus:ring-2 focus:ring-fire-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100"
        aria-label="Select currency"
      >
        {SUPPORTED_CURRENCIES.map((currency) => (
          <option key={currency.code} value={currency.code}>
            {currency.code} - {currency.label}
          </option>
        ))}
      </select>
    </label>
  )
}
