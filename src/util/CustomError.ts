export class CustomError extends Error {
    public constructor(name: string, message?: string | undefined) {
        super(message);
        // eslint-disable-next-line unicorn/custom-error-definition
        this.name = name;
    }
}
