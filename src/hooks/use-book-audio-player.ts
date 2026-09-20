import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus, type AudioStatus } from 'expo-audio';
import { useFocusEffect } from 'expo-router';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState } from 'react-native';

import { clampAudioPosition, listeningSnapshot } from '@/lib/audio-progress';
import type { UpdateListeningProgressRequest } from '@/types/progress.types';

interface SaveQueue {schedule: (position: UpdateListeningProgressRequest) => void; flush: () => Promise<void>}

export function useBookAudioPlayer(url: string, initialSeconds: number, {schedule,flush}: SaveQueue) {
  // Storage requests are independent of Axios and deliberately have NO Readora authorization headers.
  const source = useMemo(()=>({uri:url}),[url]);
  const player = useAudioPlayer(source,{updateInterval:1000,downloadFirst:false});
  const status = useAudioPlayerStatus(player);
  const [start] = useState(initialSeconds);
  const [modeReady,setModeReady] = useState(false);
  const [restored,setRestored] = useState(false);
  const [seeking,setSeeking] = useState(true);
  const [tracking,setTracking] = useState(false);
  const [localError,setError] = useState<string | null>(null);
  const error = localError ?? (status.error ? 'Unable to play this audio. Check your connection or try another book.' : null)
    ?? (status.isLoaded && (status.isLive || !Number.isFinite(status.duration) || status.duration<=0) ? 'This audio has no supported finite duration.' : null);
  const restoring = useRef(false);
  const pendingSeek = useRef<{target: number; resolved: boolean} | null>(null);
  const mounted = useRef(true);
  const focused = useRef(true);
  const latest = useRef({status,tracking,restored,seeking});
  useEffect(()=>{latest.current={status,tracking,restored,seeking};},[status,tracking,restored,seeking]);
  const confirmSeek = useCallback((value: AudioStatus)=>{
    const pending = pendingSeek.current;
    if (mounted.current && pending?.resolved && value.isLoaded && Math.abs(value.currentTime-pending.target)<1.5) {
      pendingSeek.current=null;setRestored(true);setSeeking(false);
    }
  },[]);
  useEffect(()=>{
    const listener = player.addListener('playbackStatusUpdate',value=>{latest.current.status=value;confirmSeek(value);});
    return ()=>listener.remove();
  },[confirmSeek,player]);
  useEffect(()=>{
    mounted.current = true;
    void setAudioModeAsync({playsInSilentMode:true,allowsRecording:false,shouldPlayInBackground:false,interruptionMode:'doNotMix'})
      .then(()=>{if (mounted.current) setModeReady(true);})
      .catch(()=>{if (mounted.current) setError('Unable to configure audio. Please retry.');});
    return ()=>{mounted.current=false;};
  },[]);
  useEffect(()=>{
    if (!modeReady || !status.isLoaded || !(status.duration>0) || restored || restoring.current || error) return;
    restoring.current = true;
    const target = clampAudioPosition(start,status.duration);
    pendingSeek.current={target,resolved:false};
    void player.seekTo(target,0,0)
      .then(()=>{
        if (mounted.current && pendingSeek.current) {pendingSeek.current.resolved=true;confirmSeek(player.currentStatus);}
      })
      .catch(()=>{if (mounted.current) setError('Unable to restore your listening position. Please retry.');});
  },[confirmSeek,error,modeReady,player,restored,start,status.duration,status.isLoaded]);
  useEffect(()=>{
    if (error) {try {player.pause();} catch { /* The visible error already asks for retry. */ }}
  },[error,player]);
  useEffect(()=>{
    if (error || (restored && !status.isBuffering && !seeking)) return;
    const timer = setTimeout(()=>setError('Audio loading timed out. Please retry.'),60000);
    return ()=>clearTimeout(timer);
  },[error,restored,seeking,status.isBuffering]);
  useEffect(()=>{
    if (!restored || !tracking || !status.isLoaded || seeking || error) return;
    const position = listeningSnapshot(status.currentTime,status.duration,status.didJustFinish);
    if (position) schedule(position);
    if (!status.playing || status.didJustFinish) void flush();
  },[error,flush,restored,schedule,seeking,status.currentTime,status.didJustFinish,status.duration,status.isLoaded,status.playing,tracking]);
  const stop = useCallback(()=>{
    const current = latest.current;
    if (current.restored && current.tracking && !current.seeking) {
      const position = listeningSnapshot(current.status.currentTime,current.status.duration,current.status.didJustFinish);
      if (position) schedule(position);
    }
    try {player.pause();} catch {if (mounted.current) setError('Unable to pause audio. Please retry.');}
    void flush();
  },[flush,player,schedule]);
  useFocusEffect(useCallback(()=>{
    focused.current=true;
    return ()=>{focused.current=false;stop();};
  },[stop]));
  useEffect(()=>{
    const listener = AppState.addEventListener('change',state=>{if (state!=='active') stop();});
    return ()=>listener.remove();
  },[stop]);
  const seek = async (seconds: number) => {
    if (!restored || seeking || error) return;
    setSeeking(true);
    try {
      const target = clampAudioPosition(seconds,status.duration);
      pendingSeek.current={target,resolved:false};
      await player.seekTo(target,0,0);
      if (mounted.current && pendingSeek.current) {setTracking(true);pendingSeek.current.resolved=true;confirmSeek(player.currentStatus);}
      // Save only the next native status position, not the requested (possibly failed) seek.
      return true;
    } catch {if (mounted.current) setError('Unable to seek this audio. Please retry.');return false;}
  };
  const toggle = async () => {
    if (!restored || seeking || error) return;
    try {
      if (status.playing) {player.pause();void flush();}
      else {
        if ((status.didJustFinish || status.currentTime>=status.duration) && !(await seek(0))) return;
        if (!mounted.current || !focused.current || AppState.currentState!=='active') return;
        setTracking(true);player.play();
      }
    } catch {setError('Unable to start or pause audio. Please retry.');}
  };
  return {status,restored,seeking,error,seek,toggle,stop};
}
