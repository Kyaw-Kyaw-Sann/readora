// Isolated contract/cache tests. No live subscription changes or payment calls.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const calls=[],invalidations=[],writes=[],states=[];
let current=null,history=[],failUser=false,failLibrary=false,beforeFetch;
let profile={id:9,name:'Reader',emailVerified:true,role:'USER',subscriptionStatus:'NONE'};
const auth={status:'authenticated',user:profile,updateUser:user=>{auth.user=user;}};
const envelope=data=>({data:{success:true,message:'Success',data}});
const active={id:1,plan:'MONTHLY',status:'ACTIVE',startedAt:'2026-09-17T10:00:00',expiresAt:'2026-10-17T10:00:00',cancelledAt:null};
const apiClient={
  async get(url){calls.push({method:'GET',url});if (url==='/api/subscriptions/me') return envelope(current);if (url==='/api/subscriptions/history') return envelope(history);if (url==='/api/users/me') return envelope(profile);throw new Error('Unexpected endpoint');},
  async post(url,request){calls.push({method:'POST',url,request});if (url==='/api/subscriptions') {current={...active,plan:request.plan};history=[current];profile={...profile,subscriptionStatus:'ACTIVE'};return envelope(current);}if (url==='/api/subscriptions/cancel') {const cancelled={...current,status:'CANCELLED',cancelledAt:'2026-09-17T11:00:00'};current=null;history=[cancelled];profile={...profile,subscriptionStatus:'CANCELLED'};return envelope(cancelled);}throw new Error('Unexpected mutation');},
};
const dependencies={
  react:{useCallback:fn=>fn,useState:initial=>{const state={value:initial};states.push(state);return [initial,value=>{state.value=value;}];}},
  '@/api/client':{apiClient},'@/api/api-response':{getResponseData:response=>response.data.data},
  '@/stores/auth-store':{useAuthStore:{getState:()=>auth}},
};
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:name=>dependencies[name]});return exports;}
const keys=load('src/api/query-keys.ts').queryKeys;
dependencies['@/api/query-keys']={queryKeys:keys};
const api=load('src/api/subscriptions.api.ts');dependencies['@/api/subscriptions.api']=api;
dependencies['@/api/users.api']=load('src/api/users.api.ts');
const client={
  cancelQueries:async()=>{},
  setQueryData:(key,value)=>writes.push({key,value}),
  invalidateQueries:async (options,refetch)=>{invalidations.push({options,refetch});if (failLibrary && options.queryKey===keys.library) throw new Error('Test library refresh failure');},
  fetchQuery:async options=>{assert.equal(options.staleTime,0);beforeFetch?.();if (failUser) throw new Error('Test account refresh failure');const user=await options.queryFn();writes.push({key:options.queryKey,value:user});return user;},
};
dependencies['@tanstack/react-query']={useQuery:()=>{},useMutation:options=>options,useQueryClient:()=>client};
assert.equal(await api.getCurrentSubscription(),null,'No active subscription returns null');
assert.equal((await api.getSubscriptionHistory()).length,0);
const actions=load('src/hooks/use-subscription.ts').useSubscriptionActions();
assert.equal(actions.activate.retry,0);assert.equal(actions.cancel.retry,0);
assert.equal(actions.activate.scope.id,actions.cancel.scope.id,'Serialize subscription mutations');
const activated=await actions.activate.mutationFn('YEARLY');
assert.equal(calls.at(-1).url,'/api/subscriptions');assert.equal(calls.at(-1).request.plan,'YEARLY');
assert.equal(Object.keys(calls.at(-1).request).join(','),'plan','No invented checkout/payment fields');
await actions.activate.onSuccess(activated);
assert.equal(auth.user.subscriptionStatus,'ACTIVE');assert.equal(auth.user.role,'USER','Premium is not a role');
assert.ok(writes.some(value=>value.key===keys.subscription.current && value.value===activated));
for (const key of [keys.subscription.current,keys.subscription.history,keys.books.all,keys.library,keys.reading.all,keys.listening.all]) assert.ok(invalidations.some(value=>value.options.queryKey===key));
const cancelled=await actions.cancel.mutationFn();
assert.equal(calls.at(-1).url,'/api/subscriptions/cancel');assert.equal(calls.at(-1).request,undefined,'Cancel has no request body');
await actions.cancel.onSuccess(cancelled);
assert.equal(auth.user.subscriptionStatus,'CANCELLED');assert.equal(auth.user.role,'USER');
assert.equal(writes.filter(value=>value.key===keys.subscription.current).at(-1).value,null,'Cancelled object is not cached as active /me data');
assert.equal(await api.getCurrentSubscription(),null);assert.equal((await api.getSubscriptionHistory())[0].status,'CANCELLED');
failUser=true;failLibrary=true;
await actions.activate.onSuccess({...active,status:'ACTIVE'});
assert.ok(states[0].value.includes('Retry refresh'),'Committed operation remains successful; refresh failure has a separate retry');
assert.equal(states[1].value,false);
failUser=false;failLibrary=false;
const mutations=calls.filter(value=>value.method==='POST').length;
await actions.refresh();assert.equal(states[0].value,null);
assert.equal(calls.filter(value=>value.method==='POST').length,mutations,'Retry refresh never repeats checkout');
beforeFetch=()=>{auth.status='unauthenticated';auth.user=null;};
await actions.refresh();assert.equal(auth.user,null,'Late refresh must not resurrect logged-out session');
assert.ok(calls.every(value=>value.url.startsWith('/api/subscriptions') || value.url==='/api/users/me'));
console.log('PASS: exact subscription API contracts, nullable active subscription, plan-only mock activation, cancellation, role preservation, session/cache refresh, partial-failure retry and logout guard.');
