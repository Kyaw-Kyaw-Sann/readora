import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';

// Shared Reader/Player queue: coalesce updates, serialize saves and retain failures for retry.
export function useProgressAutoSave<T>(save: (position: T) => Promise<unknown>, valid: (position: T) => boolean,
  equals: (a: T | null, b: T) => boolean, maxWait?: number) {
  const pending = useRef<T | null>(null);
  const lastSaved = useRef<T | null>(null);
  const inFlight = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hasUnsaved, setHasUnsaved] = useState(false);
  const flush = useCallback(async () => {
    if (timer.current) clearTimeout(timer.current);
    if (maxTimer.current) clearTimeout(maxTimer.current);
    timer.current = null; maxTimer.current = null;
    if (inFlight.current) return;
    while (pending.current) {
      const position = pending.current;
      inFlight.current = true;
      try {
        await save(position);
        lastSaved.current = position;
        if (pending.current === position) {pending.current = null;setHasUnsaved(false);}
      } catch {
        // The mutation exposes this error to the screen; retain the unsaved snapshot.
        if (pending.current === position) break;
      } finally {inFlight.current = false;}
    }
  }, [save]);
  const schedule = useCallback((position: T) => {
    if (!valid(position) || equals(pending.current,position) || (!pending.current && equals(lastSaved.current,position))) return;
    pending.current = position;setHasUnsaved(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => void flush(),2000);
    // Playback keeps advancing: a pure debounce would otherwise never save until paused.
    if (maxWait && !maxTimer.current) maxTimer.current = setTimeout(() => void flush(),maxWait);
  }, [equals,flush,maxWait,valid]);
  useEffect(() => {
    const listener = AppState.addEventListener('change',state => {if (state !== 'active') void flush();});
    return () => {listener.remove();void flush();};
  }, [flush]);
  return {schedule,flush,hasUnsaved};
}
