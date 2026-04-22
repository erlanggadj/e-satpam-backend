import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface WrappedResponse<T> {
    success: boolean;
    statusCode: number;
    message: string;
    data: T;
    meta?: Record<string, unknown>;
}

@Injectable()
export class ResponseInterceptor<T>
    implements NestInterceptor<T, WrappedResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<WrappedResponse<T>> {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();
        return next.handle().pipe(
            map((data) => {
                const statusCode = response.statusCode;
                // If the service already returned a wrapped format with meta, pass it through
                if (data && typeof data === 'object' && 'meta' in data && 'data' in data) {
                    return {
                        success: true,
                        statusCode,
                        message: 'OK',
                        data: data.data,
                        meta: data.meta,
                    };
                }
                return {
                    success: true,
                    statusCode,
                    message: 'OK',
                    data,
                };
            }),
        );
    }
}
