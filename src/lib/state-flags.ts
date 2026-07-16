/**
 * Generate a US state flag image URL via flagcdn.com.
 * Abbreviation should be the 2-letter state code (e.g. "CA", "NY").
 */
export function getStateFlagUrl(abbr: string, width = 40): string {
  return `https://flagcdn.com/w${width}/us-${abbr.toLowerCase()}.png`;
}