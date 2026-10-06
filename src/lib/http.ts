import { ApiError } from '@/lib/auth';

export async function readJsonBody(request: Request): Promise<Record<string, unknown>> {
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    throw new ApiError('Request body must be valid JSON.', 400);
  }
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new ApiError('Request body must be a JSON object.', 400);
  }
  return value as Record<string, unknown>;
}

export function requireUuid(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new ApiError(`${fieldName} must be a valid UUID.`, 400);
  }
  return value;
}

export function requireText(value: unknown, fieldName: string, maxLength: number): string {
  if (typeof value !== 'string' || value.trim().length === 0 || value.trim().length > maxLength) {
    throw new ApiError(`${fieldName} is required and must not exceed ${maxLength} characters.`, 400);
  }
  return value.trim();
}

export function optionalText(value: unknown, fieldName: string, maxLength: number): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.length > maxLength) {
    throw new ApiError(`${fieldName} must not exceed ${maxLength} characters.`, 400);
  }
  return value.trim() || null;
}
