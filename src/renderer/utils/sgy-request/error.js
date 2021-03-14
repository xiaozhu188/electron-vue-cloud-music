class FlyError extends Error {
    constructor(message, config, code, response) {
        super(message);
        this.config = config;
        this.code = code;
        this.response = response;
    }
}

export function createError(message, config, code, response) {
    const error = new FlyError(message, config, code, response);
    return error;
}
