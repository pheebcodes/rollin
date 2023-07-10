import * as AST from "./AST";
import * as Tokens from "./Tokens";

function single(
  type: Tokens.DatalessTokenType,
  s: string
): [Tokens.DatalessToken, string] {
  return [{ type }, s.substring(1)];
}

function matchToken(s: string): [Tokens.Token, string] {
  const maybeNumber = s.match(/^\d+/);
  if (maybeNumber) {
    const [number] = maybeNumber;
    return [
      { type: "NUMBER", value: parseInt(number, 10) },
      s.substring(number.length)
    ];
  }

  const maybeAdd = s.match(/^\+/);
  if (maybeAdd) {
    return single("ADDITION", s);
  }

  const maybeSub = s.match(/^-/);
  if (maybeSub) {
    return single("SUBTRACTION", s);
  }

  const maybeMul = s.match(/^\*/);
  if (maybeMul) {
    return single("MULTIPLICATION", s);
  }

  const maybeDiv = s.match(/^\//);
  if (maybeDiv) {
    return single("DIVISION", s);
  }

  const maybeDice = s.match(/^d/);
  if (maybeDice) {
    return single("DICE", s);
  }

  throw "Invalid token";
}

function tokenize(s: string): Tokens.Token[] {
  const [token, rest] = matchToken(s);

  if (rest.length) {
    return [token, ...tokenize(rest)];
  }

  return [token];
}

function buildAst(tokens: Tokens.Token[]): AST.ASTNode {
  const [firstToken] = tokens;
  if (
    tokens.length === 1 &&
    Tokens.isDataToken(firstToken) &&
    firstToken.type === "NUMBER"
  ) {
    return firstToken.value;
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "ADDITION" || token.type === "SUBTRACTION") {
      const left = tokens.slice(0, i);
      const right = tokens.slice(i + 1);

      if (!right.length) {
        throw "Invalid syntax";
      }
      return {
        type: "ADD",
        left: left.length ? buildAst(left) : 0,
        right:
          token.type === "SUBTRACTION"
            ? { type: "NEGATE", value: buildAst(right) }
            : buildAst(right)
      };
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "MULTIPLICATION" || token.type === "DIVISION") {
      const left = tokens.slice(0, i);
      const right = tokens.slice(i + 1);

      if (!left.length || !right.length) {
        throw "Invalid syntax";
      }
      return {
        type: "MULTIPLY",
        left: buildAst(left),
        right:
          token.type === "DIVISION"
            ? { type: "RECIPROCAL", value: buildAst(right) }
            : buildAst(right)
      };
    }
  }

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];

    if (token.type === "DICE") {
      const left = tokens.slice(0, i);
      const right = tokens.slice(i + 1);

      if (!right.length) {
        throw "Invalid syntax";
      }
      return {
        type: "ROLL",
        left: left.length ? buildAst(left) : 1,
        right: buildAst(right)
      };
    }
  }

  throw "Invalid syntax";
}

function rand(i: number): number {
  return Math.floor(Math.random() * i) + 1;
}

function evalUnaryAst(ast: AST.UnaryASTNode): number {
  const value = evalAst(ast.value);

  if (ast.type === "NEGATE") {
    return -value;
  }

  return 1 / value;
}

function evalBinaryAst(ast: AST.BinaryASTNode): number {
  const left = evalAst(ast.left);
  const right = evalAst(ast.right);

  if (ast.type === "ADD") {
    return left + right;
  }

  if (ast.type === "MULTIPLY") {
    return left * right;
  }

  let acc = 0;
  for (let i = 0; i < left; i++) {
    acc += rand(right);
  }
  return acc;
}

function evalAst(ast: AST.ASTNode): number {
  if (typeof ast === "number") {
    return ast;
  }

  if (AST.isUnaryASTNode(ast)) {
    return evalUnaryAst(ast);
  }

  return evalBinaryAst(ast);
}

export function evaluate(s: string): number {
  const tokens = tokenize(s);
  const ast = buildAst(tokens);
  return evalAst(ast);
}
