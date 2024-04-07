export function ErrorBoundaryFallback({ error, resetErrorBoundary }) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

export function logError(error, errorInfo) {
  console.log("logError:", error.message, errorInfo.componentStack);
  displayErrorDisplay(`Error: ${error.message} ${errorInfo.componentStack}`);
}

function createErrorDisplayStyles() {
  const styleEl = document.createElement("style");
  document.head.appendChild(styleEl);
  styleEl.sheet.insertRule(
    `
    .cc-error-display {
    display: flex;
    cursor: pointer;
    font-family: monospace;
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    right: 1rem;
    background-color: #be1809;
    color: white;
    border-radius: 3px;
    padding: 0.25rem 0.5rem;
    border: 2px solid #10162F;
  }
  `,
    0
  );
  styleEl.sheet.insertRule(
    `
    .cc-error-display-close {
      
    color: white;
    right: 0.25rem;
    margin-left: auto;
    font-family: helvetica, arial, sans-serif;
    font-weight: normal;
  }
`,
    1
  );
}

function getErrorEl() {
  return document.querySelector(".cc-error-display");
}

function removeErrorEl() {
  const errorEl = getErrorEl();
  if (errorEl) document.body.removeChild(errorEl);
}

function displayErrorDisplay(message) {
  removeErrorEl();
  const errorEl = document.createElement("div");
  const errorElClose = document.createElement("span");
  errorEl.className = "cc-error-display";
  errorEl.addEventListener("click", removeErrorEl);
  errorEl.setAttribute("aria-live", "polite");
  errorEl.innerText = message;
  errorElClose.className = "cc-error-display-close";
  errorElClose.innerHTML = String.fromCodePoint(0x2715);
  errorEl.appendChild(errorElClose);
  document.body.appendChild(errorEl);
}

createErrorDisplayStyles();
