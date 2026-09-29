import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { TOUR_STEPS } from './steps';

interface TourContextValue {
  active: boolean;
  stepIndex: number;
  total: number;
  autoplay: boolean;
  start: () => void;
  stop: () => void;
  next: () => void;
  prev: () => void;
  goTo: (i: number) => void;
  toggleAutoplay: () => void;
}

const TourContext = createContext<TourContextValue | null>(null);

export function useTour(): TourContextValue {
  const ctx = useContext(TourContext);
  if (!ctx) throw new Error('useTour must be used inside TourProvider');
  return ctx;
}

const AUTOPLAY_MS = 14000;

export function TourProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [autoplay, setAutoplay] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const timer = useRef<number | undefined>(undefined);

  const stop = useCallback(() => {
    setActive(false);
    setAutoplay(false);
    if (timer.current !== undefined) {
      window.clearInterval(timer.current);
      timer.current = undefined;
    }
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const clamped = Math.max(0, Math.min(TOUR_STEPS.length - 1, i));
      setStepIndex(clamped);
      const route = TOUR_STEPS[clamped].route;
      navigate(route);
    },
    [navigate]
  );

  const start = useCallback(() => {
    setStepIndex(0);
    setActive(true);
    navigate(TOUR_STEPS[0].route);
  }, [navigate]);

  const next = useCallback(() => {
    setStepIndex((prev) => {
      const clamped = Math.min(TOUR_STEPS.length - 1, prev + 1);
      navigate(TOUR_STEPS[clamped].route);
      return clamped;
    });
  }, [navigate]);

  const prev = useCallback(() => {
    setStepIndex((prevIdx) => {
      const clamped = Math.max(0, prevIdx - 1);
      navigate(TOUR_STEPS[clamped].route);
      return clamped;
    });
  }, [navigate]);

  const toggleAutoplay = useCallback(() => {
    setAutoplay((v) => !v);
  }, []);

  // Auto-advance while autoplay is on; stop (not loop) at the final step.
  useEffect(() => {
    if (timer.current !== undefined) {
      window.clearInterval(timer.current);
      timer.current = undefined;
    }
    if (active && autoplay) {
      timer.current = window.setInterval(() => {
        setStepIndex((prevIdx) => {
          if (prevIdx >= TOUR_STEPS.length - 1) {
            setAutoplay(false);
            return prevIdx;
          }
          const nxt = prevIdx + 1;
          navigate(TOUR_STEPS[nxt].route);
          return nxt;
        });
      }, AUTOPLAY_MS);
    }
    return () => {
      if (timer.current !== undefined) {
        window.clearInterval(timer.current);
        timer.current = undefined;
      }
    };
  }, [active, autoplay, navigate]);

  // Esc exits the tour.
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') stop();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [active, stop, next, prev]);

  // If the user navigates away manually mid-tour, keep the tour card alive —
  // it re-anchors on the next Next/route match. Location is subscribed so the
  // overlay re-measures after route renders.
  void location.pathname;

  const value = useMemo(
    () => ({ active, stepIndex, total: TOUR_STEPS.length, autoplay, start, stop, next, prev, goTo, toggleAutoplay }),
    [active, stepIndex, autoplay, start, stop, next, prev, goTo, toggleAutoplay]
  );

  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}
