export type ApiResult<T> = {
    success: true;
    data: T;
    error?: never;
} | {
    success: false;
    data?: never;
    error: ApiErrorDetail;
};
export interface ApiErrorDetail {
    code: string;
    message: string;
    details?: any;
}
export declare class DomainError extends Error {
    message: string;
    code: string;
    constructor(message: string, code?: string);
}
//# sourceMappingURL=index.d.ts.map