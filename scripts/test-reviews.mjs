// Contract/cache unit tests. Never create or delete live backend reviews.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { z } from 'zod';

const calls=[],invalidations=[],writes=[],cancellations=[];
const own={id:30,bookId:6,user:{id:9,name:'Reader',profileImageUrl:null},rating:4,comment:null,createdAt:'2026-09-17T10:00:00',updatedAt:'2026-09-17T10:00:00'};
let pages=[{content:[{...own,id:29,user:{...own.user,id:10}}],page:0,size:100,last:false,totalElements:2,totalPages:2},{content:[own],page:1,size:100,last:true,totalElements:2,totalPages:2}];
const envelope=value=>({data:{success:true,message:'Success',data:value}});
const apiClient={
  async get(url,config){calls.push({method:'GET',url,config});return envelope(url.endsWith('/summary') ? {averageRating:4,reviewCount:2} : pages[config.params.page]);},
  async post(url,request){calls.push({method:'POST',url,request});return envelope(own);},
  async put(url,request){calls.push({method:'PUT',url,request});return envelope({...own,...request});},
  async delete(url){calls.push({method:'DELETE',url});return envelope(null);},
};
const keys={reviews:{all:id=>['reviews',id],mine:(id,user)=>['reviews',id,'mine',user]},books:{detail:id=>['books','detail',id]}};
const dependencies={zod:{z},'@/api/client':{apiClient},'@/api/api-response':{getResponseData:response=>response.data.data},'@/api/query-keys':{queryKeys:keys},
  '@tanstack/react-query':{useQuery:()=>{},useMutation:options=>options,useQueryClient:()=>({cancelQueries:async value=>cancellations.push(value),setQueryData:(key,value)=>writes.push({key,value}),invalidateQueries:async value=>invalidations.push(value)})},
};
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(readFileSync(new URL('../'+file,import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText,{exports,require:name=>dependencies[name]});return exports;}
const api=load('src/api/reviews.api.ts');dependencies['@/api/reviews.api']=api;
const signal=new AbortController().signal;
assert.equal((await api.findMyReview(6,9,signal)).id,30);
assert.equal(calls.length,2,'Ownership lookup includes later pages');
assert.equal(calls[0].config.params.size,100);assert.equal(calls[1].config.params.page,1);assert.equal(calls[0].config.signal,signal);
assert.equal(await api.findMyReview(6,99),null,'Other reviews are never treated as mine');
await api.getReviews(6,1,10,'OLDEST');assert.equal(calls.at(-1).config.params.sort,'OLDEST');
assert.equal((await api.getReviewSummary(6)).reviewCount,2);
const schema=load('src/schemas/review.schema.ts').reviewSchema;
for(const rating of [0,6,2.5]) assert.equal(schema.safeParse({rating,comment:''}).success,false);
assert.equal(schema.safeParse({rating:5,comment:''}).success,true);
assert.equal(schema.safeParse({rating:1,comment:'a'.repeat(2000)}).success,true);
assert.equal(schema.safeParse({rating:1,comment:'a'.repeat(2001)}).success,false);
const mutation=load('src/hooks/use-reviews.ts').useReviewMutation(6,9);
assert.equal(mutation.retry,0,'No automatic POST retry');
const created=await mutation.mutationFn({type:'create',request:{rating:4}});
assert.equal(calls.at(-1).url,'/api/books/6/reviews');assert.equal(calls.at(-1).method,'POST');
await mutation.onSuccess(created);
assert.equal(cancellations.at(-1).queryKey.join('/'),'reviews/6/mine/9');
assert.equal(writes.at(-1).value,own,'Backend result is the authority');
assert.ok(invalidations.some(value=>value.queryKey.join('/')==='reviews/6'));
assert.ok(invalidations.some(value=>value.queryKey.join('/')==='books/detail/6'));
await mutation.mutationFn({type:'update',request:{rating:5,comment:''}});
assert.equal(calls.at(-1).method,'PUT');assert.equal(calls.at(-1).url,'/api/books/6/reviews/me');assert.equal(calls.at(-1).request.comment,'');
const deleted=await mutation.mutationFn({type:'delete'});
assert.equal(deleted,null);assert.equal(calls.at(-1).method,'DELETE');assert.equal(calls.at(-1).url,'/api/books/6/reviews/me');
await mutation.onSuccess(deleted);assert.equal(writes.at(-1).value,null);
mutation.onError();assert.equal(invalidations.at(-1).queryKey.join('/'),'reviews/6/mine/9');
assert.ok(!calls.some(call=>call.method==='GET' && call.url.endsWith('/me')),'No invented GET /me');
pages=[{...pages[0],content:[],last:true}];assert.equal(await api.findMyReview(6,9),null);
console.log('PASS: exact API methods/bodies, paginated ownership, optional comment/rating bounds, server authority, stale lookup cancellation and review/summary/Book Detail cache refresh.');
