import { validate as isUuid, version as uuidVersion } from 'uuid';

export function isValidUuid(value: string): boolean {
  return value && isUuid(value) && uuidVersion(value) === 4;
}
