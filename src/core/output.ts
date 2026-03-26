import type { GlobalOptions } from './types.js';
import { formatError } from './errors.js';

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  const parts = path.split('.');
  let current: unknown = obj;
  for (const part of parts) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function pickFields(
  obj: Record<string, unknown>,
  fields: string[],
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const field of fields) {
    const value = getNestedValue(obj, field);
    if (value !== undefined) {
      // Reconstruct nested path in result
      const parts = field.split('.');
      let current = result;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!(parts[i] in current)) current[parts[i]] = {};
        current = current[parts[i]] as Record<string, unknown>;
      }
      current[parts[parts.length - 1]] = value;
    }
  }
  return result;
}

export function applyFieldFilter(
  data: unknown,
  fields: string[],
): unknown {
  if (!data || typeof data !== 'object') return data;

  if (Array.isArray(data)) {
    return data.map((item) =>
      typeof item === 'object' && item !== null
        ? pickFields(item as Record<string, unknown>, fields)
        : item,
    );
  }

  // Handle paginated-style responses with a top-level array field
  const obj = data as Record<string, unknown>;
  for (const key of ['results', 'employees', 'competitors', 'ads', 'technologies']) {
    if (Array.isArray(obj[key])) {
      return {
        ...obj,
        [key]: (obj[key] as unknown[]).map((item) =>
          typeof item === 'object' && item !== null
            ? pickFields(item as Record<string, unknown>, fields)
            : item,
        ),
      };
    }
  }

  return pickFields(obj, fields);
}

export function output(data: unknown, options: GlobalOptions = {}): void {
  if (options.quiet) return;

  let result = data;

  if (options.fields) {
    const fields = options.fields.split(',').map((f) => f.trim()).filter(Boolean);
    result = applyFieldFilter(data, fields);
  }

  if (options.output === 'pretty' || options.pretty) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    console.log(JSON.stringify(result));
  }
}

export function outputError(error: unknown, options: GlobalOptions = {}): void {
  const formatted = formatError(error);

  if (options.quiet) {
    process.exitCode = 1;
    return;
  }

  if (options.output === 'pretty' || options.pretty) {
    console.error(`Error [${formatted.code}]: ${formatted.message}`);
  } else {
    console.error(JSON.stringify({ error: formatted.message, code: formatted.code }));
  }

  process.exitCode = 1;
}
