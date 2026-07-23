export function isAsyncSuccess(res) {
    return res.success === true;
}
export function isAsyncError(res) {
    return res.success === false;
}
export class AsyncResult {
    static ok(data) {
        return {
            success: true,
            data,
            isSuccess: true,
            isError: false,
        };
    }
    static fail(message, statusCode = 500, error) {
        return {
            success: false,
            message,
            statusCode,
            error,
            isSuccess: false,
            isError: true,
        };
    }
}
export class AsyncHandler {
    static async handle(fn) {
        try {
            const data = await fn();
            return AsyncResult.ok(data);
        }
        catch (err) {
            return AsyncHandler.normalizeError(err);
        }
    }
    static normalizeError(err) {
        if (AsyncHandler.isAlreadyAsyncError(err)) {
            return err;
        }
        if (typeof err === "object" && err !== null) {
            const anyErr = err;
            if (typeof anyErr.message === "string") {
                return AsyncResult.fail(anyErr.message, typeof anyErr.statusCode === "number" ? anyErr.statusCode : 500, err);
            }
        }
        if (err instanceof Error) {
            return AsyncResult.fail(err.message, 500, err);
        }
        return AsyncResult.fail("Something went wrong", 500, err);
    }
    static isAlreadyAsyncError(err) {
        return (typeof err === "object" &&
            err !== null &&
            err.success === false &&
            typeof err.message === "string");
    }
    static map(res, fn) {
        if (res.success === false)
            return res;
        return AsyncResult.ok(fn(res.data));
    }
    static async mapAsync(res, fn) {
        if (res.success === false)
            return res;
        return AsyncHandler.handle(() => fn(res.data));
    }
    static unwrap(res) {
        if (res.success === false) {
            throw new Error(res.message);
        }
        return res.data;
    }
    static unwrapOr(res, fallback) {
        return res.success ? res.data : fallback;
    }
    static match(res, handlers) {
        return res.success ? handlers.ok(res.data) : handlers.err(res);
    }
}
