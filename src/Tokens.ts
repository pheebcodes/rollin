export type DatalessTokenType =
  | "ADDITION"
  | "SUBTRACTION"
  | "MULTIPLICATION"
  | "DIVISION"
  | "DICE";

export type DataTokenType = "NUMBER";

export type TokenValue = number;

export interface DatalessToken {
  type: DatalessTokenType;
}

export interface DataToken {
  type: DataTokenType;
  value: TokenValue;
}

export function isDatalessToken(token: Token): token is DatalessToken {
  return (<DataToken>token).value === undefined;
}

export function isDataToken(token: Token): token is DataToken {
  return (<DataToken>token).value !== undefined;
}

export type Token = DatalessToken | DataToken;
