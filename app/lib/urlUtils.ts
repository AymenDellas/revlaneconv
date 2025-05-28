export const validateAndNormalizeUrl = (input: string): string | null => {
  try {
    const trimmed = input.trim();
    const url = trimmed.startsWith("http") ? trimmed : `https://${trimmed}`;
    const parsed = new URL(url);
    return ["http:", "https:"].includes(parsed.protocol) ? url : null;
  } catch {
    return null;
  }
};
