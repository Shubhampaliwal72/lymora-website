/** @param {Record<string, unknown>} data */
export function serializeStructuredData(data) {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
