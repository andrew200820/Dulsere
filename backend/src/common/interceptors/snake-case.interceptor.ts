import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

function toSnakeCase(str: string): string {
  return str.replace(/([A-Z])/g, (c) => `_${c.toLowerCase()}`);
}

function isDecimal(val: unknown): boolean {
  return (
    val !== null &&
    typeof val === 'object' &&
    typeof (val as Record<string, unknown>)['toFixed'] === 'function' &&
    typeof (val as Record<string, unknown>)['toNumber'] === 'function'
  );
}

function transformKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(transformKeys);
  if (isDecimal(obj)) return Number((obj as { toString(): string }).toString());
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && !Buffer.isBuffer(obj)) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([k, v]) => [
        toSnakeCase(k),
        transformKeys(v),
      ])
    );
  }
  return obj;
}

@Injectable()
export class SnakeCaseInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map(transformKeys));
  }
}