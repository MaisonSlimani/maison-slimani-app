export class DomainError extends Error {
    constructor(message, code = 'DOMAIN_ERROR') {
        super(message);
        this.message = message;
        this.code = code;
        this.name = 'DomainError';
    }
}
//# sourceMappingURL=index.js.map