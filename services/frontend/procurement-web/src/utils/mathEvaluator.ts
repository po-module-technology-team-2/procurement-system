/**
 * Safe mathematical expression evaluator for text-to-quantity logic.
 * Evaluates expressions like "2 machines * 3 heads * 2 shifts" -> 12
 */
export function evaluateMathExpression(text: string): number | null {
  try {
    const sanitized = text
      .replace(/[^0-9+\-*/().]/g, ' ')
      .trim()
      .replace(/\s+/g, ' ');

    if (!sanitized) return null;

    const tokens = sanitized.split(' ').filter(Boolean);
    const mathExpr = tokens.join('');
    if (!/^[0-9+\-*/().]+$/.test(mathExpr)) return null;

    const result = new Function(`'use strict'; return (${mathExpr})`)();
    if (typeof result === 'number' && !isNaN(result) && isFinite(result)) {
      return Math.max(1, Math.round(result));
    }
  } catch {
    return null;
  }
  return null;
}
