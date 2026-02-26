/** Base error class for the Forge SDK. */
export class ForgeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ForgeError";
  }
}

/** The server returned a 4xx/5xx response. */
export class ForgeServerError extends ForgeError {
  readonly status: number;

  constructor(status: number, message: string) {
    super(`server error (${status}): ${message}`);
    this.name = "ForgeServerError";
    this.status = status;
  }
}

/** Failed to connect to the Forge server. */
export class ForgeConnectionError extends ForgeError {
  readonly cause: unknown;

  constructor(cause: unknown) {
    super(`connection error: ${cause}`);
    this.name = "ForgeConnectionError";
    this.cause = cause;
  }
}
