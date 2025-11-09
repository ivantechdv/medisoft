export function normalizeText(text) {
  return text
    ? text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, ' ')
        .trim()
    : '';
}

export function textContains(text, searchTerm) {
  return normalizeText(text).includes(normalizeText(searchTerm));
}
