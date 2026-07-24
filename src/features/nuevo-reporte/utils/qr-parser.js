const MAX_CODE_LENGTH = 50;
const CODE_PATTERN = /^[A-Z0-9_-]+$/;

function isValidCodeCandidate(candidate) {
  if (typeof candidate !== 'string') return false;
  if (!candidate || candidate.length > MAX_CODE_LENGTH) return false;
  if ([...candidate].some((char) => {
    const code = char.charCodeAt(0);
    return code <= 31 || code === 127;
  })) return false;
  if (/[\\/]/.test(candidate)) return false;
  if (/\s/.test(candidate)) return false;
  if (!CODE_PATTERN.test(candidate)) return false;

  return true;
}

export function extractMachineCode(rawText) {
  if (typeof rawText !== 'string') return null;

  const text = rawText.trim();
  if (!text) return null;

  if (/^https?:\/\//i.test(text)) {
    let url;
    try {
      url = new URL(text);
    } catch {
      return null;
    }

    if (url.protocol !== 'https:') return null;

    const prefill = url.searchParams.get('prefill');
    if (!prefill) return null;

    const candidate = prefill.trim().toUpperCase();
    return isValidCodeCandidate(candidate) ? candidate : null;
  }

  const candidate = text.toUpperCase();
  return isValidCodeCandidate(candidate) ? candidate : null;
}
