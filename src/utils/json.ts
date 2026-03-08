/**
 * Safely parse a JSON string that may be wrapped in markdown code fences.
 * GitHub Models / GPT-4o sometimes responds with ```json ... ``` even when
 * instructed not to. This strips the fences before parsing.
 */
export function safeParseJSON<T = Record<string, any>>(raw: string): T {
  // Strip markdown code fences: ```json ... ``` or ``` ... ```
  const stripped = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
  // Extract the first complete JSON object or array
  const objStart = stripped.indexOf('{');
  const arrStart = stripped.indexOf('[');
  let start = -1;
  if (objStart !== -1 && (arrStart === -1 || objStart < arrStart)) start = objStart;
  else if (arrStart !== -1) start = arrStart;

  const isObj = start === objStart && objStart !== -1;
  const end = isObj ? stripped.lastIndexOf('}') : stripped.lastIndexOf(']');

  if (start === -1 || end <= start) {
    throw new SyntaxError(`No JSON object/array found in response: ${raw.substring(0, 80)}`);
  }
  return JSON.parse(stripped.substring(start, end + 1)) as T;
}
