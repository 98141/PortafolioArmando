export function serializeJsonLd(data: Record<string, unknown> | Array<Record<string, unknown>>) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
