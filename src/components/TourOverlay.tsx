import { useEffect, useLayoutEffect, useState } from 'react';
import { useTour } from '../tour/TourContext';
import { TOUR_STEPS } from '../tour/steps';

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/**
 * Judge tour overlay — spotlights [data-tour] targets with a ring and a
 * narrated card. Overlay itself is pointer-transparent (the app stays
 * visible and alive); only the narration card captures clicks.
 */
export default function TourOverlay() {
  const { active, stepIndex, total, autoplay, stop, next, prev, goTo, toggleAutoplay } = useTour();
  const [rect, setRect] = useState<Rect | null>(null);

  const step = TOUR_STEPS[stepIndex];

  const measure = () => {
    if (!step.target) {
      setRect(null);
      return;
    }
    const el = document.querySelector(`[data-tour="${step.target}"]`);
    if (!el) {
      setRect(null);
      return;
    }
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Measure after smooth-scroll settles + charts mount.
    window.setTimeout(() => {
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
    }, 450);
  };

  useLayoutEffect(measure, [active, stepIndex, step.target]);
  useEffect(() => {
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex, step.target]);

  if (!active) return null;

  const isLast = stepIndex === total - 1;
  const pad = 8;

  // Card placement: below the spotlight if room, else above, else bottom-docked.
  const cardStyle: React.CSSProperties = rect
    ? rect.top + rect.height + 320 < window.innerHeight
      ? { top: rect.top + rect.height + pad + 8, left: Math.max(12, Math.min(rect.left, window.innerWidth - 412)) }
      : rect.top - 300 > 0
        ? { top: rect.top - 296, left: Math.max(12, Math.min(rect.left, window.innerWidth - 412)) }
        : { bottom: 16, left: '50%', transform: 'translateX(-50%)' }
    : { bottom: 16, left: '50%', transform: 'translateX(-50%)' };

  return (
    <div className="tour-layer" aria-live="polite">
      {/* dim everything except via transparency — app remains visible */}
      <div className="tour-dim" onClick={stop} />

      {rect && (
        <div
          className="tour-ring"
          style={{
            top: rect.top - pad + window.scrollY * 0,
            left: rect.left - pad,
            width: rect.width + pad * 2,
            height: rect.height + pad * 2,
          }}
        />
      )}

      <div className="tour-card" style={{ ...cardStyle, width: 400, maxWidth: 'calc(100vw - 24px)' }}>
        <div className="tour-card-top">
          <span className="tour-step-count">
            {stepIndex + 1} / {total}
          </span>
          <span className={`tour-autoplay${autoplay ? ' on' : ''}`} onClick={toggleAutoplay} title="Auto-advance every ~14s">
            ▶ AUTO {autoplay ? 'ON' : 'OFF'}
          </span>
          <button className="tour-close" onClick={stop} title="Exit tour (Esc)">
            ✕
          </button>
        </div>
        <div className="tour-progress">
          <div className="tour-progress-fill" style={{ width: `${((stepIndex + 1) / total) * 100}%` }} />
        </div>
        <div className="tour-title">{step.title}</div>
        <div className="tour-body">{step.body}</div>
        {step.hint && <div className="tour-hint">{step.hint}</div>}
        <div className="tour-dots">
          {TOUR_STEPS.map((_, i) => (
            <span
              key={i}
              className={`tour-dot${i === stepIndex ? ' active' : ''}${i < stepIndex ? ' seen' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <div className="tour-actions">
          <button className="btn" onClick={prev} disabled={stepIndex === 0}>
            ← Back
          </button>
          {!isLast ? (
            <button className="btn primary" onClick={next}>
              Next →
            </button>
          ) : (
            <button className="btn primary" onClick={stop}>
              Finish tour ✓
            </button>
          )}
          <button className="btn" onClick={stop}>
            Exit
          </button>
        </div>
        <div className="tour-keys">← → navigate · Esc exit</div>
      </div>
    </div>
  );
}
