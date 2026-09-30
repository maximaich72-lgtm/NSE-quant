/**
 * Formatters for Institutional Financial Data
 */

export function formatKES(
  value: number | null | undefined,
  options?: {
    compact?: boolean;
    decimals?: number;
    showCurrency?: boolean;
  }
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }

  const decimals = options?.decimals ?? 2;
  const showCurrency = options?.showCurrency ?? true;
  const prefix = showCurrency ? 'KES ' : '';

  if (options?.compact) {
    const absVal = Math.abs(value);
    const sign = value < 0 ? '-' : '';

    if (absVal >= 1_000_000_000_000) {
      return `${sign}${prefix}${(absVal / 1_000_000_000_000).toFixed(decimals)}T`;
    }
    if (absVal >= 1_000_000_000) {
      return `${sign}${prefix}${(absVal / 1_000_000_000).toFixed(decimals)}B`;
    }
    if (absVal >= 1_000_000) {
      return `${sign}${prefix}${(absVal / 1_000_000).toFixed(decimals)}M`;
    }
    if (absVal >= 1_000) {
      return `${sign}${prefix}${(absVal / 1_000).toFixed(decimals)}K`;
    }
  }

  return `${prefix}${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
}

export function formatPercent(
  value: number | null | undefined,
  decimals = 2,
  includeSign = false
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
}

export function formatMultiple(
  value: number | null | undefined,
  decimals = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  return `${value.toFixed(decimals)}x`;
}

export function formatNumber(
  value: number | null | undefined,
  decimals = 2
): string {
  if (value === null || value === undefined || isNaN(value)) {
    return 'N/A';
  }
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
}
