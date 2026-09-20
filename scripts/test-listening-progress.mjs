// Deterministic unit tests; no real user/backend mutations.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const requests=[],invalidations=[],caches=[],timers=new Map();
let id=0,behavior=async value=>value;
const keys={audioAccess:id=>['audio',id],listening:{all:['listening-progress'],detail:id=>['listening-progress','detail',id]},library:['library','summary']};
const dependencies={
  react:{useCallback:fn=>fn,useRef:value=>({current:value}),useState:value=>[value,()=>{}],useEffect:fn=>fn()},
  'react-native':{AppState:{addEventListener:()=>({remove:()=>{}})}},
  '@tanstack/react-query':{useQuery:()=>{},useQueryClient:()=>({setQueryData:(key,value)=>caches.push({key,value}),invalidateQueries:value=>{invalidations.push(value);return Promise.resolve();}}),useMutation:options=>({mutateAsync:async value=>{requests.push(value);const result=await behavior(value);options.onSuccess(result);return result;}})},
  '@/api/books.api':{},'@/api/progress.api':{},'@/api/query-keys':{queryKeys:keys},
};
const context={URL,require:name=>dependencies[name],setTimeout:(fn,ms)=>{timers.set(++id,{fn,ms});return id;},clearTimeout:id=>timers.delete(id)};
function load(file) {
  const exports={};
  vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{...context,exports});
  return exports;
}
dependencies['@/hooks/use-progress-auto-save']=load('src/hooks/use-progress-auto-save.ts');
const hooks=load('src/hooks/use-listening-progress.ts');
const utils=load('src/lib/audio-progress.ts');
assert.equal(utils.listeningSnapshot(0,0),null);
assert.equal(utils.listeningSnapshot(1,NaN),null);
assert.equal(utils.listeningSnapshot(3.69,3.7).currentSeconds,3);
assert.equal(utils.listeningSnapshot(3.7,3.7).currentSeconds,4);
assert.equal(utils.listeningSnapshot(0,3.7,true).currentSeconds,4);
assert.equal(utils.clampAudioPosition(-15,120),0);
assert.equal(utils.clampAudioPosition(500,120),120);
assert.equal(utils.formatAudioTime(5400),'1:30:00');
assert.equal(utils.isAudioStorageUrl('http://storage.invalid/audio.mp3'),false);
assert.equal(utils.isAudioStorageUrl('https://user:password@storage.invalid/audio.mp3'),false);
assert.equal(utils.isAudioStorageUrl('https://storage.invalid/audio.mp3'),true);
const save=hooks.useAutoSaveListeningProgress(9);
save.schedule({currentSeconds:-1,durationSeconds:30});assert.equal(timers.size,0);
for(let second=0;second<15;second++) save.schedule({currentSeconds:second,durationSeconds:100});
assert.equal(requests.length,0);
assert.equal(timers.size,2,'One debounce and one maximum-wait timer');
assert.equal([...timers.values()].filter(timer=>timer.ms===15000).length,1);
[...timers.values()].find(timer=>timer.ms===15000).fn();
await Promise.resolve();await Promise.resolve();await Promise.resolve();
assert.equal(requests.at(-1).currentSeconds,14,'Continuous playback saves despite resetting debounce');
assert.equal(caches.at(-1).key.join('/'),'listening-progress/detail/9');
assert.ok(invalidations.some(value=>value.queryKey===keys.library));
behavior=async()=>{throw new Error('Test network error');};
save.schedule({currentSeconds:20,durationSeconds:100});await save.flush();
behavior=async value=>value;await save.flush();
assert.equal(requests.filter(value=>value.currentSeconds===20).length,2);
save.schedule({currentSeconds:20,durationSeconds:100});assert.equal(timers.size,0);
console.log('PASS: listening validation, real-duration rounding/completion, seek bounds, URL safety, bounded debounce, retry and Home/Library invalidation.');
