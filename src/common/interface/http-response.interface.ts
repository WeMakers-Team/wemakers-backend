interface SuccessResponse {
  statusCode: number;
  message: string;
  result?: object;
}

export class GetResponseImpl implements SuccessResponse {
  statusCode: 200;
  message: 'ok';
  result: object;
}

export class PostResponseImpl implements SuccessResponse {
  statusCode: 201;
  message: 'ok';
  result: object;
}

export class DeleteResponseImpl implements SuccessResponse {
  statusCode: 204;
  message: 'ok';
}

export interface ErrorResponse {
  statusCode: number;
  message: string[];
  error?: string;
}
