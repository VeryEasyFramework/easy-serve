export class ServerException extends Error {
  constructor(
    message: string,
    public status: number,
    override name = "ServerException",
  ) {
    super(message);
  }
}

export function isServerException(error: unknown): error is ServerException {
  return error instanceof ServerException;
}

export function raiseServerException(
  status: number,
  message: string,
): never {
  throw new ServerException(message, status);
}
