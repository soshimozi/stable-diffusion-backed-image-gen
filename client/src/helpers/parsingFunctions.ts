export function isNumeric(str: string): boolean {
  if (typeof str !== 'string' || str.trim() === '') {
    return false; // Handle non-string inputs or empty strings
  }
  const num = Number(str); // Or parseFloat(str)
  return !isNaN(num) && isFinite(num);
}