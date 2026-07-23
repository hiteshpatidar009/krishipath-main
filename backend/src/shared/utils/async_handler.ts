export type AsyncResponse<T> = AsyncSuccess<T> | AsyncError;

export interface AsyncSuccess<T> {
  success: true;
  data: T;

  readonly isSuccess: true;
  readonly isError: false;
}

export interface AsyncError {
  success: false;
  message: string;
  statusCode: number;
  error?: unknown;

  readonly isSuccess: false;
  readonly isError: true;
}

export function isAsyncSuccess<T>(
  res: AsyncResponse<T>,
): res is AsyncSuccess<T> {
  return res.success === true;
}

export function isAsyncError<T>(res: AsyncResponse<T>): res is AsyncError {
  return res.success === false;
}

export class AsyncResult {
  static ok<T>(data: T): AsyncSuccess<T> {
    return {
      success: true,
      data,
      isSuccess: true,
      isError: false,
    };
  }

  static fail(
    message: string,
    statusCode: number = 500,
    error?: unknown,
  ): AsyncError {
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
  static async handle<T>(fn: () => Promise<T>): Promise<AsyncResponse<T>> {
    try {
      const data = await fn();
      return AsyncResult.ok(data);
    } catch (err: unknown) {
      return AsyncHandler.normalizeError(err);
    }
  }

  private static normalizeError(err: unknown): AsyncError {
    if (AsyncHandler.isAlreadyAsyncError(err)) {
      return err;
    }

    if (typeof err === "object" && err !== null) {
      const anyErr = err as any;

      if (typeof anyErr.message === "string") {
        return AsyncResult.fail(
          anyErr.message,
          typeof anyErr.statusCode === "number" ? anyErr.statusCode : 500,
          err,
        );
      }
    }

    if (err instanceof Error) {
      return AsyncResult.fail(err.message, 500, err);
    }

    return AsyncResult.fail("Something went wrong", 500, err);
  }

  private static isAlreadyAsyncError(err: unknown): err is AsyncError {
    return (
      typeof err === "object" &&
      err !== null &&
      (err as any).success === false &&
      typeof (err as any).message === "string"
    );
  }

  static map<T, U>(
    res: AsyncResponse<T>,
    fn: (data: T) => U,
  ): AsyncResponse<U> {
    if (res.success === false) return res;
    return AsyncResult.ok(fn(res.data));
  }

  static async mapAsync<T, U>(
    res: AsyncResponse<T>,
    fn: (data: T) => Promise<U>,
  ): Promise<AsyncResponse<U>> {
    if (res.success === false) return res;
    return AsyncHandler.handle(() => fn(res.data));
  }

  static unwrap<T>(res: AsyncResponse<T>): T {
    if (res.success === false) {
      throw new Error(res.message);
    }
    return res.data;
  }

  static unwrapOr<T>(res: AsyncResponse<T>, fallback: T): T {
    return res.success ? res.data : fallback;
  }

  static match<T, R>(
    res: AsyncResponse<T>,
    handlers: {
      ok: (data: T) => R;
      err: (error: AsyncError) => R;
    },
  ): R {
    return res.success ? handlers.ok(res.data) : handlers.err(res);
  }
}
