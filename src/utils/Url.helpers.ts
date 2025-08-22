function toAbsoluteUrl(url: string, baseUrl: string): string {
  try {
    return new URL(url, baseUrl).href;
  } catch {
    throw new Error(`URL inválida: ${url}`);
  }
}

function safeAbsoluteUrl(urlLike?: string, baseUrl?: string): string | undefined {
  if (!urlLike || !baseUrl) return undefined;
  try {
    return new URL(urlLike, baseUrl).href;
  } catch {
    return undefined;
  }
}

export { toAbsoluteUrl, safeAbsoluteUrl };