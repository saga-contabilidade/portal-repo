function parsePublicationDate(input?: string): Date | undefined {
  if (!input) return undefined;
  const ts = Date.parse(input);
  if (!Number.isNaN(ts)) return new Date(ts);
  const sanitized = input
    .replace(/Publicado\s+em\s+/i, '')
    .replace(/Atualizado\s+em\s+/i, '')
    .trim();

  const fallbackTs = Date.parse(sanitized);
  return Number.isNaN(fallbackTs) ? undefined : new Date(fallbackTs);
}

export { parsePublicationDate };