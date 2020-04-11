export class NotFoundError extends Error {
    constructor(message?: string) {
        super(message);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export type ValidationViolation = {
    location?: string;
    msg: string;
    param: string;
}

export class ValidationError extends Error {
    public readonly violations: Array<ValidationViolation>

    constructor(message?: string, violations?: Array<ValidationViolation>) {
        super(message);
        this.name = 'ValidationError';
        this.violations = violations;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
