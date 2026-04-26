import './NumberInput.css';

/**
 * NumberInput — input numérico con botones +/− acordes al diseño de la app.
 *
 * Props (misma API que <input type="number">):
 *   value     number | string
 *   onChange  fn(newValue: number)  — recibe el número ya parseado
 *   min       number  (default 0)
 *   max       number
 *   step      number  (default 1)
 *   disabled  bool
 *   style     object  — estilos extra al wrapper
 */
export default function NumberInput({
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  disabled = false,
  style,
}) {
  const parsed = parseFloat(value) || 0;

  function decrement() {
    const next = parsed - step;
    if (min !== undefined && next < min) return;
    onChange(next);
  }

  function increment() {
    const next = parsed + step;
    if (max !== undefined && next > max) return;
    onChange(next);
  }

  function handleInput(e) {
    const raw = e.target.value;
    if (raw === '' || raw === '-') { onChange(raw); return; }
    const n = parseFloat(raw);
    if (isNaN(n)) return;
    if (min !== undefined && n < min) return;
    if (max !== undefined && n > max) return;
    onChange(n);
  }

  const atMin = min !== undefined && parsed <= min;
  const atMax = max !== undefined && parsed >= max;

  return (
    <div className="num-input-wrap" style={style}>
      <button
        type="button"
        className="num-btn num-btn-dec"
        onClick={decrement}
        disabled={disabled || atMin}
        aria-label="Disminuir"
      >
        <svg width="12" height="2" viewBox="0 0 12 2" fill="none">
          <path d="M1 1h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>

      <input
        className="num-input-field"
        type="number"
        value={value}
        onChange={handleInput}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
      />

      <button
        type="button"
        className="num-btn num-btn-inc"
        onClick={increment}
        disabled={disabled || atMax}
        aria-label="Aumentar"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 1v10M1 6h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  );
}