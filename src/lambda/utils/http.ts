export interface LambdaEvent {
  body: string | null;
  isBase64Encoded?: boolean;
  pathParameters?: Record<string, string | undefined>;
  queryStringParameters?: Record<string, string | undefined>;
  headers?: Record<string, string | undefined>;
}

export interface LambdaResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

const defaultHeaders = {
  'Content-Type': 'application/json',
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization',
  'Access-Control-Allow-Methods': 'OPTIONS,GET,POST',
};

export const jsonResponse = (statusCode: number, data: unknown): LambdaResponse => ({
  statusCode,
  headers: defaultHeaders,
  body: JSON.stringify(data),
});

export const parseJsonBody = <T>(event: LambdaEvent): T => {
  if (!event.body) {
    throw new Error('Request body is required');
  }

  const rawBody = event.isBase64Encoded
    ? Buffer.from(event.body, 'base64').toString('utf8')
    : event.body;

  return JSON.parse(rawBody) as T;
};
