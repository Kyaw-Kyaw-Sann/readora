import type { UpdateListeningProgressRequest } from '@/types/progress.types';

export function clampAudioPosition(seconds: number, duration: number) {
  return Math.max(0, Math.min(Number.isFinite(seconds) ? seconds : 0, duration));
}

export function listeningSnapshot(seconds: number, duration: number, finished = false): UpdateListeningProgressRequest | null {
  if (!Number.isFinite(seconds) || !Number.isFinite(duration) || duration <= 0) return null;
  // Backend stores integer seconds. Do not mark a fractional final second complete early.
  const durationSeconds = Math.ceil(duration);
  return {currentSeconds:finished || seconds>=duration ? durationSeconds : Math.floor(clampAudioPosition(seconds,duration)),durationSeconds};
}

export function formatAudioTime(seconds: number) {
  const total = Math.max(0,Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const hours = Math.floor(total/3600);
  const minutes = Math.floor((total%3600)/60);
  const remaining = String(total%60).padStart(2,'0');
  return hours ? `${hours}:${String(minutes).padStart(2,'0')}:${remaining}` : `${minutes}:${remaining}`;
}

export function isAudioStorageUrl(url: string | undefined) {
  try {
    if (!url) return false;
    const storage = new URL(url);
    return storage.protocol === 'https:' && !storage.username && !storage.password;
  } catch {return false;}
}
