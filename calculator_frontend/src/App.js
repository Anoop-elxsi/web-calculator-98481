import React, { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Basic arithmetic helpers with safe division and precision handling.
 */
const ops = {
  '+': (a, b) => a + b,
  '−': (a, b) => a - b,
  '×': (a, b) => a * b,
  '÷': (a, b) => b === 0 ? NaN : a / b,
};

/**
 * Format numbers to a user-friendly string with trimming of trailing zeros.
 */
function formatNumber(value) {
  if (value === null || value === undefined) return '0';
  if (Number.isNaN(value)) return 'Error';
  const str = Number(value).toFixed(10);
  const trimmed = str.replace(/\.?0+$/, '');
  return trimmed;
}

/**
 * PUBLIC_INTERFACE
 * Calculator App - Ocean Professional themed.
 * - Central column layout with display and button grid.
 * - Supports +, −, ×, ÷ with instant evaluation and keyboard input.
 */
function App() {
  const [current, setCurrent] = useState('0');         // string being typed
  const [previous, setPrevious] = useState(null);      // number
  const [operator, setOperator] = useState(null);      // '+','−','×','÷'
  const [history, setHistory] = useState('');          // small expression preview
  const [isVisible, setIsVisible] = useState(true);    // visibility toggle for calculator

  // Derived number from current string
  const currentNumber = useMemo(() => {
    if (current === '' || current === '-') return 0;
    return Number(current);
  }, [current]);

  const updateHistory = useCallback((prev, op, curr) => {
    const left = prev !== null ? formatNumber(prev) : '';
    const right = curr !== null && curr !== undefined ? formatNumber(curr) : '';
    const parts = [left, op || '', right].filter(Boolean);
    setHistory(parts.join(' '));
  }, []);

  // Handle digit input
  const onDigit = useCallback((digit) => {
    setCurrent((val) => {
      if (val === '0' && digit !== '.') return String(digit);
      if (digit === '.' && val.includes('.')) return val;
      return `${val}${digit}`;
    });
  }, []);

  // Clear everything
  const onClear = useCallback(() => {
    setCurrent('0');
    setPrevious(null);
    setOperator(null);
    setHistory('');
  }, []);

  // Choose operator; perform instant evaluation when appropriate
  const onOperator = useCallback((opSymbol) => {
    setCurrent((currStr) => {
      const currVal = Number(currStr);
      let nextPrev = null;

      setPrevious((prev) => {
        if (prev === null) {
          nextPrev = currVal;
        } else if (operator) {
          const fn = ops[operator];
          const result = fn(prev, currVal);
          nextPrev = result;
        } else {
          nextPrev = prev;
        }
        return nextPrev;
      });

      setOperator(opSymbol);
      updateHistory(nextPrev, opSymbol, null);
      return '0';
    });
  }, [operator, updateHistory]);

  // Equals: finalize computation
  const onEquals = useCallback(() => {
    if (operator === null || previous === null) return;
    const fn = ops[operator];
    const result = fn(previous, currentNumber);
    setCurrent(String(formatNumber(result)));
    setPrevious(null);
    setOperator(null);
    setHistory('');
  }, [operator, previous, currentNumber]);

  // Toggle sign
  const onToggleSign = useCallback(() => {
    setCurrent((val) => (val.startsWith('-') ? val.slice(1) : (val === '0' ? '0' : `-${val}`)));
  }, []);

  // Percent (like iOS): converts current to current/100, applied to current entry
  const onPercent = useCallback(() => {
    setCurrent((val) => {
      const num = Number(val);
      return String(formatNumber(num / 100));
    });
  }, []);

  // Keyboard support
  useEffect(() => {
    const handler = (e) => {
      const { key } = e;
      if (!isVisible) return; // ignore keyboard when hidden
      if (/\d/.test(key)) { onDigit(key); return; }
      if (key === '.') { onDigit('.'); return; }
      if (key === 'Escape') { onClear(); return; }
      if (key === 'Enter' || key === '=') { onEquals(); return; }
      if (key === '+' ) { onOperator('+'); return; }
      if (key === '-' ) { onOperator('−'); return; }
      if (key === '*' ) { onOperator('×'); return; }
      if (key === '/' ) { onOperator('÷'); return; }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onDigit, onOperator, onEquals, onClear, isVisible]);

  useEffect(() => {
    updateHistory(previous, operator, null);
  }, [previous, operator, updateHistory]);

  const opIs = (sym) => operator === sym;

  // If hidden, render a minimal reopen control for usability
  if (!isVisible) {
    return (
      <div className="app" role="application" aria-label="Ocean Professional Calculator">
        <button
          className="reopen-btn"
          onClick={() => setIsVisible(true)}
          aria-label="Reopen Calculator"
          title="Reopen Calculator"
        >
          Open Calculator
        </button>
      </div>
    );
  }

  return (
    <div className="app" role="application" aria-label="Ocean Professional Calculator">
      <div className="calculator" aria-live="polite">
        <div className="calc-header">
          <div className="brand-dot" aria-hidden="true" />
          <h1 className="calc-title">Calculator</h1>
          <button
            className="close-btn"
            onClick={() => setIsVisible(false)}
            aria-label="Close Calculator"
            title="Close"
          >
            ×
          </button>
        </div>

        <div className="display" aria-label="calculator display">
          <div className="display-screen">
            <div className="display-history" aria-live="polite">
              {history}
            </div>
            <div className="display-current" data-testid="display">
              {current}
            </div>
          </div>
        </div>

        <div className="grid" role="group" aria-label="calculator keypad">
          <button className="btn btn-clear" onClick={onClear} aria-label="Clear">AC</button>
          <button className="btn" onClick={onToggleSign} aria-label="Toggle Sign">+/−</button>
          <button className="btn" onClick={onPercent} aria-label="Percent">%</button>
          <button className={`btn btn-operator ${opIs('÷') ? 'active' : ''}`} onClick={() => onOperator('÷')} aria-label="Divide">÷</button>

          <button className="btn" onClick={() => onDigit('7')} aria-label="7">7</button>
          <button className="btn" onClick={() => onDigit('8')} aria-label="8">8</button>
          <button className="btn" onClick={() => onDigit('9')} aria-label="9">9</button>
          <button className={`btn btn-operator ${opIs('×') ? 'active' : ''}`} onClick={() => onOperator('×')} aria-label="Multiply">×</button>

          <button className="btn" onClick={() => onDigit('4')} aria-label="4">4</button>
          <button className="btn" onClick={() => onDigit('5')} aria-label="5">5</button>
          <button className="btn" onClick={() => onDigit('6')} aria-label="6">6</button>
          <button className={`btn btn-operator ${opIs('−') ? 'active' : ''}`} onClick={() => onOperator('−')} aria-label="Subtract">−</button>

          <button className="btn" onClick={() => onDigit('1')} aria-label="1">1</button>
          <button className="btn" onClick={() => onDigit('2')} aria-label="2">2</button>
          <button className="btn" onClick={() => onDigit('3')} aria-label="3">3</button>
          <button className={`btn btn-operator ${opIs('+') ? 'active' : ''}`} onClick={() => onOperator('+')} aria-label="Add">+</button>

          <button className="btn btn-zero" onClick={() => onDigit('0')} aria-label="0">0</button>
          <button className="btn" onClick={() => onDigit('.')} aria-label="Decimal">.</button>
          <button className="btn btn-equals" onClick={onEquals} aria-label="Equals">=</button>
        </div>

        <div className="calc-footer">
          Tip: Use your keyboard. Try <kbd>+</kbd> <kbd>-</kbd> <kbd>*</kbd> <kbd>/</kbd> and <kbd>Enter</kbd>.
        </div>
      </div>
    </div>
  );
}

export default App;
