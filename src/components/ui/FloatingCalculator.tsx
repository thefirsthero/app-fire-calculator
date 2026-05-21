import { useMemo, useState } from "react";

type Operator = "+" | "-" | "*" | "/";

const PRECEDENCE: Record<Operator, number> = {
  "+": 1,
  "-": 1,
  "*": 2,
  "/": 2,
};

function isOperator(value: string): value is Operator {
  return value === "+" || value === "-" || value === "*" || value === "/";
}

function tokenize(expression: string): string[] {
  const cleaned = expression.replace(/\s+/g, "");
  const tokens: string[] = [];
  let current = "";

  for (let index = 0; index < cleaned.length; index += 1) {
    const char = cleaned[index];

    if (/[0-9.]/.test(char)) {
      current += char;
      continue;
    }

    if (char === "-" && (index === 0 || isOperator(cleaned[index - 1]))) {
      current += char;
      continue;
    }

    if (isOperator(char)) {
      if (current) {
        tokens.push(current);
        current = "";
      }
      tokens.push(char);
      continue;
    }

    throw new Error("invalid_char");
  }

  if (current) {
    tokens.push(current);
  }

  return tokens;
}

function toRpn(tokens: string[]): string[] {
  const output: string[] = [];
  const operators: Operator[] = [];

  for (const token of tokens) {
    if (isOperator(token)) {
      while (
        operators.length > 0 &&
        PRECEDENCE[operators[operators.length - 1]] >= PRECEDENCE[token]
      ) {
        output.push(operators.pop() as Operator);
      }
      operators.push(token);
    } else {
      const value = Number(token);
      if (!Number.isFinite(value)) {
        throw new Error("invalid_number");
      }
      output.push(token);
    }
  }

  while (operators.length > 0) {
    output.push(operators.pop() as Operator);
  }

  return output;
}

function evaluateExpression(expression: string): number {
  const tokens = tokenize(expression);
  const rpn = toRpn(tokens);
  const stack: number[] = [];

  for (const token of rpn) {
    if (!isOperator(token)) {
      stack.push(Number(token));
      continue;
    }

    const right = stack.pop();
    const left = stack.pop();

    if (right === undefined || left === undefined) {
      throw new Error("invalid_stack");
    }

    if (token === "+") {
      stack.push(left + right);
    } else if (token === "-") {
      stack.push(left - right);
    } else if (token === "*") {
      stack.push(left * right);
    } else {
      if (right === 0) {
        throw new Error("divide_by_zero");
      }
      stack.push(left / right);
    }
  }

  if (stack.length !== 1) {
    throw new Error("invalid_result");
  }

  return stack[0];
}

const KEYS = [
  ["7", "8", "9", "/"],
  ["4", "5", "6", "*"],
  ["1", "2", "3", "-"],
  ["0", ".", "⌫", "+"],
];

export default function FloatingCalculator() {
  const [isOpen, setIsOpen] = useState(false);
  const [expression, setExpression] = useState("");
  const [error, setError] = useState<string | null>(null);

  const displayValue = useMemo(() => {
    if (!expression) {
      return "0";
    }
    return expression;
  }, [expression]);

  const append = (value: string) => {
    setExpression((current) => current + value);
    setError(null);
  };

  const backspace = () => {
    setExpression((current) => current.slice(0, -1));
    setError(null);
  };

  const clear = () => {
    setExpression("");
    setError(null);
  };

  const evaluate = () => {
    if (!expression.trim()) {
      return;
    }

    try {
      const result = evaluateExpression(expression);
      const normalized = Number(result.toFixed(10)).toString();
      setExpression(normalized);
      setError(null);
    } catch {
      setError("Invalid expression");
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-label={isOpen ? "Close calculator" : "Open calculator"}
        aria-expanded={isOpen}
        className="fixed bottom-5 right-5 z-40 h-14 w-14 rounded-full bg-fire-500 text-white shadow-lg hover:bg-fire-600 focus:outline-none focus:ring-2 focus:ring-fire-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
      >
        <svg
          className="mx-auto h-7 w-7"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 7h6m-6 4h6m-6 4h6M7 3h10a2 2 0 012 2v14a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-5 z-40 w-72 rounded-2xl border border-gray-200 bg-white p-3 shadow-2xl dark:border-gray-700 dark:bg-gray-900">
          <div className="mb-3 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-right font-mono text-xl text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100">
            {displayValue}
          </div>

          {error && (
            <p className="mb-2 text-right text-xs text-red-600 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="grid grid-cols-4 gap-2">
            {KEYS.flat().map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => {
                  if (key === "⌫") {
                    backspace();
                    return;
                  }
                  append(key);
                }}
                className="rounded-lg bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
              >
                {key}
              </button>
            ))}

            <button
              type="button"
              onClick={clear}
              className="col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={evaluate}
              className="col-span-2 rounded-lg bg-fire-500 px-3 py-2 text-sm font-semibold text-white hover:bg-fire-600"
            >
              =
            </button>
          </div>
        </div>
      )}
    </>
  );
}
