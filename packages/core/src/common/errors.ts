function wrapMessage(message: string) {
  return `[micro-stacks] ${message}`;
}

export class StacksTransactionError extends Error {
  constructor(message: string) {
    super(message);
    this.message = wrapMessage(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class SerializationError extends Error {
  constructor(message: string) {
    super(message);
    this.message = wrapMessage(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class DeserializationError extends Error {
  constructor(message: string) {
    super(message);
    this.message = wrapMessage(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class NotImplementedError extends Error {
  constructor(message: string) {
    super(message);
    this.message = wrapMessage(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class SigningError extends Error {
  constructor(message: string) {
    super(message);
    this.message = wrapMessage(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class VerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.message = wrapMessage(message);
    this.name = this.constructor.name;
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class MissingParametersError extends Error {
  constructor(message: string) {
    super(message);
    this.message = wrapMessage(message);
    this.name = this.constructor.name;
  }
}

export class InvalidTokenError extends Error {
  constructor(message: string) {
    super(message);
    this.message = wrapMessage(message);
    this.name = this.constructor.name;
  }
}
