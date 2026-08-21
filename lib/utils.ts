// Utility functions for the 日奸清算器 application

/**
 * Formats a Chinese name with title information
 */
export function formatChineseName(name: string, title: string): string {
  return `${name} (${title})`;
}

/**
 * Converts Chinese text to searchable format
 */
export function normalizeChineseText(text: string): string {
  return text
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Validates if search query is valid
 */
export function isValidSearchQuery(query: string): boolean {
  const trimmedQuery = query.trim();
  // Should contain at least 1 Chinese character
  return /[\u4e00-\u9fa5]/.test(trimmedQuery);
}

/**
 * Extracts search terms from query
 */
export function extractSearchTerms(query: string): string[] {
  const normalized = normalizeChineseText(query);
  return normalized.split(' ').filter(term => term.length > 0);
}

/**
 * Determines result type styling
 */
export function getResultTypeClass(type: string): string {
  switch (type) {
    case 'traitor':
      return 'type-pro-japanese';
    case 'hero':
      return 'type-independence';
    default:
      return '';
  }
}

/**
 * Formats result type text
 */
export function getResultTypeText(type: string): string {
  switch (type) {
    case 'traitor':
      return '汉奸';
    case 'hero':
      return '抗日英雄';
    default:
      return '未知类型';
  }
}

/**
 * Debounces function calls
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Checks if text contains Chinese characters
 */
export function containsChinese(text: string): boolean {
  return /[\u4e00-\u9fa5]/.test(text);
}

/**
 * Gets historical period description
 */
export function getPeriodDescription(year: number): string {
  if (year >= 1931 && year <= 1937) {
    return "局部抗战时期 (1931-1937)";
  } else if (year >= 1937 && year <= 1945) {
    return "全面抗战时期 (1937-1945)";
  } else if (year === 1931) {
    return "九一八事变";
  } else if (year === 1937) {
    return "七七事变";
  } else if (year === 1945) {
    return "抗战胜利";
  }
  return "抗战时期";
}

/**
 * Formats historical date
 */
export function formatHistoricalDate(dateStr: string): string {
  // Format: "1931-1945" -> "1931年至1945年"
  return dateStr.replace('-', '年至') + '年';
}
