"use strict";

const display = document.getElementById("display");
const keypad = document.querySelector(".keypad");
const operators = new Set(["+", "-", "*", "/"]);

function appendToDisplay(value) {
  if (display.value === "Error") display.value = "";
  const last = display.value.slice(-1);

  if (operators.has(value)) {
    if (!display.value && value !== "-") return;
    if (operators.has(last)) {
      display.value = display.value.slice(0, -1) + value;
      return;
    }
  }

  if (value === ".") {
    const currentNumber = display.value.split(/[+\-*/]/).pop();
    if (currentNumber.includes(".")) return;
    if (!currentNumber) value = "0.";
  }

  display.value += value;
}

function clearDisplay() {
  display.value = "";
}

function deleteLastCharacter() {
  display.value = display.value === "Error" ? "" : display.value.slice(0, -1);
}

// Recursive-descent parser for basic arithmetic; avoids eval() and arbitrary code execution.
function calculateExpression(expression) {
  const tokens = expression.match(/\d*\.?\d+|[+\-*/]/g);
  if (!tokens || tokens.join("") !== expression.replace(/\s/g, "")) {
    throw new Error("Invalid expression");
  }

  let position = 0;
  function parseNumber() {
    if (tokens[position] === "+") {
      position++;
      return parseNumber();
    }
    if (tokens[position] === "-") {
      position++;
      return -parseNumber();
    }
    const token = tokens[position++];
    const value = Number(token);
    if (token === undefined || !Number.isFinite(value)) throw new Error("Invalid number");
    return value;
  }

  function parseTerm() {
    let value = parseNumber();
    while (tokens[position] === "*" || tokens[position] === "/") {
      const operator = tokens[position++];
      const right = parseNumber();
      if (operator === "/" && right === 0) throw new Error("Cannot divide by zero");
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  }

  function parseSum() {
    let value = parseTerm();
    while (tokens[position] === "+" || tokens[position] === "-") {
      const operator = tokens[position++];
      const right = parseTerm();
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  const result = parseSum();
  if (position !== tokens.length || !Number.isFinite(result)) throw new Error("Invalid result");
  return Number(result.toPrecision(12)).toString();
}

function calculateResult() {
  if (!display.value.trim()) return;
  try {
    display.value = calculateExpression(display.value);
  } catch {
    display.value = "Error";
  }
}

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;

  if (button.dataset.action === "clear") clearDisplay();
  else if (button.dataset.action === "delete") deleteLastCharacter();
  else if (button.dataset.action === "calculate") calculateResult();
  else if (button.dataset.value) appendToDisplay(button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9.]$/.test(event.key)) appendToDisplay(event.key);
  else if (operators.has(event.key)) appendToDisplay(event.key);
  else if (event.key === "Enter" || event.key === "=") {
    event.preventDefault();
    calculateResult();
  } else if (event.key === "Backspace") deleteLastCharacter();
  else if (event.key === "Escape") clearDisplay();
});
