// Hook-level lifecycle tests with a deterministic native-player double.
// Actual audio decoding/output still requires physical Expo Go testing.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const slots=[],effects=[],listeners=new Set(),requests=[],saved=[];
let cursor=0,dirty=true,result,background,flushes=0,emitSeek=true,delaySeek=false,releaseSeek;
let status={id:'test',isLoaded:false,isBuffering:true,isLive:false,error:null,currentTime:0,duration:0,didJustFinish:false,playing:false};
const changed=(a,b)=>!a || a.length!==b.length || a.some((value,index)=>!Object.is(value,b[index]));
const react={
  useState(initial){const index=cursor++;if (!slots[index]) slots[index]={value:initial};const slot=slots[index];return [slot.value,value=>{if (!Object.is(slot.value,value)) {slot.value=value;dirty=true;}}];},
  useRef(initial){const index=cursor++;return slots[index] ??= {current:initial};},
  useMemo(fn,deps){const index=cursor++;if (!slots[index] || changed(slots[index].deps,deps)) slots[index]={deps,value:fn()};return slots[index].value;},
  useCallback(fn,deps){return react.useMemo(()=>fn,deps);},
  useEffect(fn,deps){const index=cursor++;const previous=slots[index];if (!previous || changed(previous.deps,deps)) {slots[index]={deps,cleanup:previous?.cleanup};effects.push(()=>{slots[index].cleanup?.();slots[index].cleanup=fn();});}},
};
function emit(value){status={...status,...value};dirty=true;for(const listener of listeners) listener(status);}
const player={
  get currentStatus(){return status;},
  async seekTo(target){requests.push({type:'seek',target});if (delaySeek) await new Promise(resolve=>{releaseSeek=resolve;});if (emitSeek) emit({currentTime:target,didJustFinish:false});},
  play(){requests.push({type:'play'});emit({playing:true,didJustFinish:false});},
  pause(){requests.push({type:'pause'});if (status.playing) emit({playing:false});},
  addListener(_event,fn){listeners.add(fn);return {remove:()=>listeners.delete(fn)};},
};
const dependencies={react,
  'react-native':{AppState:{currentState:'active',addEventListener:(_event,fn)=>{background=fn;return {remove:()=>{}};}}},
  'expo-router':{useFocusEffect:fn=>react.useEffect(fn,[fn])},
  'expo-audio':{
    setAudioModeAsync:async mode=>{assert.equal(mode.shouldPlayInBackground,false);assert.equal(mode.allowsRecording,false);},
    useAudioPlayer:(source,options)=>{assert.equal(source.uri,'https://storage.invalid/audio.mp3');assert.equal(source.headers,undefined);assert.equal(options.downloadFirst,false);return player;},
    useAudioPlayerStatus:()=>status,
  },
};
const context={require:name=>dependencies[name],setTimeout:()=>1,clearTimeout:()=>{}};
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{...context,exports});return exports;}
dependencies['@/lib/audio-progress']=load('src/lib/audio-progress.ts');
const hooks=load('src/hooks/use-book-audio-player.ts');
const queue={schedule:value=>saved.push(value),flush:async()=>{flushes++;}};
async function pump(){
  for(let turn=0;turn<20;turn++){
    if (dirty){dirty=false;cursor=0;result=hooks.useBookAudioPlayer('https://storage.invalid/audio.mp3',150,queue);while(effects.length) effects.shift()();}
    await Promise.resolve();await Promise.resolve();
    if (!dirty && turn>2) return;
  }
  throw new Error('Unstable player render lifecycle');
}
await pump();assert.equal(result.restored,false);
emit({isLoaded:true,isBuffering:false,duration:600});await pump();
assert.equal(result.restored,true);assert.equal(result.status.currentTime,150);
assert.equal(requests.filter(value=>value.type==='play').length,0,'Restoration does not auto-play');
assert.equal(saved.length,0,'Opening a book alone does not overwrite listening progress');
await result.toggle();await pump();assert.equal(result.status.playing,true);
emit({currentTime:165});await pump();assert.equal(saved.at(-1).currentSeconds,165);
emitSeek=false;
const count=saved.length;
await result.seek(180);await pump();assert.equal(result.seeking,true);assert.equal(saved.length,count,'No fake requested-position save');
emit({currentTime:180});await pump();assert.equal(result.seeking,false);assert.equal(saved.at(-1).currentSeconds,180);
emitSeek=true;
await result.seek(result.status.currentTime-15);await pump();assert.equal(result.status.currentTime,165);
await result.toggle();await pump();assert.equal(result.status.playing,false);assert.ok(flushes>0);
await result.toggle();await pump();background('background');await pump();assert.equal(result.status.playing,false,'Foreground-only playback');
emit({currentTime:600,didJustFinish:true});await pump();assert.equal(saved.at(-1).currentSeconds,600);
await result.toggle();await pump();assert.equal(result.status.currentTime,0);assert.equal(result.status.playing,true);
emit({currentTime:600,didJustFinish:true,playing:false});await pump();
delaySeek=true;
const replay=result.toggle();await pump();
dependencies['react-native'].AppState.currentState='background';background('background');await pump();
releaseSeek();await replay;await pump();
assert.equal(result.status.playing,false,'A delayed replay must not start after backgrounding');
dependencies['react-native'].AppState.currentState='active';
emit({error:'Private URL deliberately omitted from user-facing errors'});await pump();assert.ok(result.error.startsWith('Unable to play'));assert.equal(result.status.playing,false);
for(const slot of slots) slot?.cleanup?.();
console.log('PASS: native-confirmed restoration/seek, no JWT/download, play/pause, position updates, replay, background pause and safe playback errors.');
