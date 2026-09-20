// Unit tests for debounce, serialized/coalesced PUTs, retry and cache invalidation.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const source = readFileSync(new URL('../src/hooks/use-reading-progress.ts',import.meta.url),'utf8');
const requests = [], caches = [], invalidations = [], timers = new Map();
let sequence = 0, behavior = async value => value, background, cleanup;
const queryKeys = {pdfAccess:id=>['pdf',id],reading:{detail:id=>['reading-progress','detail',id],all:['reading-progress']},library:['library','summary']};
const dependencies = {
  react: {useCallback:fn=>fn,useRef:value=>({current:value}),useState:value=>[value,()=>{}],useEffect:fn=>{cleanup=fn();}},
  'react-native': {AppState:{addEventListener:(_event,fn)=>{background=fn;return {remove:()=>{}};}}},
  '@tanstack/react-query': {
    useQuery:()=>{}, useQueryClient:()=>({setQueryData:(key,value)=>caches.push({key,value}),invalidateQueries:value=>{invalidations.push(value);return Promise.resolve();}}),
    useMutation:options=>({mutateAsync:async position=>{requests.push(position);const result=await behavior(position);options.onSuccess(result);return result;}}),
  },
  '@/api/books.api': {}, '@/api/progress.api': {}, '@/api/query-keys': {queryKeys},
};
const exports = {};
const context = {
  require:name=>dependencies[name],
  setTimeout:(fn,ms)=>{assert.equal(ms,2000);timers.set(++sequence,fn);return sequence;},
  clearTimeout:id=>timers.delete(id),
};
const shared = {};
vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../src/hooks/use-progress-auto-save.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{...context,exports:shared});
dependencies['@/hooks/use-progress-auto-save'] = shared;
vm.runInNewContext(ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{...context,exports});
const save = exports.useAutoSaveReadingProgress(9);
save.schedule({currentPage:0,totalPages:10});
assert.equal(timers.size,0);
save.schedule({currentPage:1,totalPages:10});
save.schedule({currentPage:2,totalPages:10});
assert.equal(requests.length,0,'No PUT before debounce');
assert.equal(timers.size,1,'Coalesced debounce');
await save.flush();
assert.equal(requests.at(-1).currentPage,2);
assert.equal(caches.at(-1).key.join('/'),'reading-progress/detail/9');
assert.ok(invalidations.some(value=>value.queryKey===queryKeys.library));
save.schedule({currentPage:2,totalPages:10});
assert.equal(timers.size,0,'Already-saved position is not duplicated');
let release;
behavior = value => new Promise(resolve=>{release=()=>resolve(value);});
save.schedule({currentPage:3,totalPages:10});
const first = save.flush();
save.schedule({currentPage:4,totalPages:10});
save.schedule({currentPage:5,totalPages:10});
await save.flush();
assert.equal(requests.at(-1).currentPage,3,'No overlapping PUT');
behavior = async value=>value;
release();await first;
assert.equal(requests.at(-1).currentPage,5,'Newest queued position saved after slow request');
assert.ok(!requests.some(value=>value.currentPage===4));
behavior = async()=>{throw new Error('Test connection failure');};
save.schedule({currentPage:6,totalPages:10});await save.flush();
behavior = async value=>value;await save.flush();
assert.equal(requests.filter(value=>value.currentPage===6).length,2,'Failed position retained for retry');
save.schedule({currentPage:7,totalPages:10});background('background');
await Promise.resolve();await Promise.resolve();await Promise.resolve();
assert.equal(requests.at(-1).currentPage,7,'Background flush');
cleanup();
console.log('PASS: debounce, valid positions, no duplicate/overlapping PUTs, coalescing, retry, background flush and Home/Library cache invalidation.');
