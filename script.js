const display = document.querySelector("#display");
const keys = document.querySelector(".keys");

let currentValue = "0";
let storedValue = null;
let pendingOperator = null;
let waitingForOperand = false;

function render() {
  display.textContent = currentValue;
  display.setAttribute("aria-label", `Display: ${currentValue}`);
}

function clear() {
  currentValue = "0";
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = false;
  render();
}

function enterDigit(digit) {
  if (currentValue === "Error" || waitingForOperand) {
    currentValue = digit;
    waitingForOperand = false;
  } else if (currentValue.replace("-", "").length < 12) {
    currentValue = currentValue === "0" ? digit : currentValue + digit;
  }
  render();
}

function enterDecimal() {
  if (currentValue === "Error" || waitingForOperand) {
    currentValue = "0.";
    waitingForOperand = false;
  } else if (!currentValue.includes(".")) {
    currentValue += ".";
  }
  render();
}

function calculate(left, right, operator) {
  switch (operator) {
    case "+": return left + right;
    case "-": return left - right;
    case "*": return left * right;
    case "/": return right === 0 ? NaN : left / right;
    default: return right;
  }
}

function formatResult(value) {
  if (!Number.isFinite(value)) return "Error";
  return String(Number(value.toPrecision(12)));
}

function chooseOperator(operator) {
  if (currentValue === "Error") return;
  const inputValue = Number(currentValue);

  if (pendingOperator && !waitingForOperand) {
    const result = calculate(storedValue, inputValue, pendingOperator);
    currentValue = formatResult(result);
    if (currentValue === "Error") {
      storedValue = null;
      pendingOperator = null;
      waitingForOperand = true;
      render();
      return;
    }
    storedValue = Number(currentValue);
  } else {
    storedValue = inputValue;
  }

  pendingOperator = operator;
  waitingForOperand = true;
  render();
}

function equals() {
  if (!pendingOperator || waitingForOperand || currentValue === "Error") return;
  currentValue = formatResult(calculate(storedValue, Number(currentValue), pendingOperator));
  storedValue = null;
  pendingOperator = null;
  waitingForOperand = true;
  render();
}

function applyAction(action, value) {
  switch (action) {
    case "digit": enterDigit(value); break;
    case "decimal": enterDecimal(); break;
    case "operator": chooseOperator(value); break;
    case "equals": equals(); break;
    case "clear": clear(); break;
    case "sign":
      if (currentValue !== "0" && currentValue !== "Error") {
        currentValue = currentValue.startsWith("-") ? currentValue.slice(1) : `-${currentValue}`;
        render();
      }
      break;
    case "percent":
      if (currentValue !== "Error") {
        currentValue = formatResult(Number(currentValue) / 100);
        render();
      }
      break;
    case "backspace":
      if (currentValue === "Error" || waitingForOperand) {
        currentValue = "0";
        waitingForOperand = false;
      } else {
        currentValue = currentValue.length > 1 ? currentValue.slice(0, -1) : "0";
        if (currentValue === "-") currentValue = "0";
      }
      render();
      break;
  }
}

keys.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  applyAction(button.dataset.action, button.dataset.value);
});

document.addEventListener("keydown", (event) => {
  if (/^[0-9]$/.test(event.key)) applyAction("digit", event.key);
  else if (event.key === ".") applyAction("decimal");
  else if (["+", "-", "*", "/"].includes(event.key)) applyAction("operator", event.key);
  else if (event.key === "Enter" || event.key === "=") applyAction("equals");
  else if (event.key === "Backspace") applyAction("backspace");
  else if (event.key === "Escape") applyAction("clear");
  else return;
  event.preventDefault();
});

render();
