import { supabase } from "./supabase";

type Action = "insert" | "update" | "delete";
export type Pending = { id:string; table:string; action:Action; payload?:Record<string,unknown>; match?:{column:string;value:string}; createdAt:number };
const KEY="degusty:persistent-mutation-queue:v4";
const OLD_KEYS=["degusty:persistent-mutation-queue:v3","degusty:persistent-mutation-queue:v2","degusty:persistent-mutation-queue:v1"];
const EVENT="degusty-sync";
let flushing=false;
function readQueue():Pending[]{if(typeof window==="undefined")return[];try{const current=localStorage.getItem(KEY);if(current)return JSON.parse(current) as Pending[];for(const oldKey of OLD_KEYS){const old=localStorage.getItem(oldKey);if(old){const parsed=JSON.parse(old) as Pending[];localStorage.setItem(KEY,JSON.stringify(parsed));localStorage.removeItem(oldKey);return parsed;}}return []}catch{return []}}
function writeQueue(queue:Pending[]){if(typeof window!=="undefined")localStorage.setItem(KEY,JSON.stringify(queue));}
function notify(state:"start"|"done"|"error",pending:number){if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent(EVENT,{detail:{state,pending}}));}
export function getPendingMutations(){return readQueue();}
export function queueMutation(input:Omit<Pending,"id"|"createdAt">){const item:Pending={...input,id:crypto.randomUUID(),createdAt:Date.now()};const queue=readQueue();queue.push(item);writeQueue(queue);notify("start",queue.length);void flushPendingMutations();return item;}
export function removeQueuedMutation(queueId:string){writeQueue(readQueue().filter(item=>item.id!==queueId));}

async function executeMutation(item:Pending){
  const request=item.action==="insert"
    ? supabase.from(item.table).insert(item.payload||{})
    : item.action==="update"&&item.match
      ? supabase.from(item.table).update(item.payload||{}).eq(item.match.column,item.match.value)
      : item.action==="delete"&&item.match
        ? supabase.from(item.table).delete().eq(item.match.column,item.match.value)
        : null;
  if(!request)return new Error("Mutação inválida");
  const timeout=new Promise<never>((_,reject)=>setTimeout(()=>reject(new Error("Tempo limite de sincronização")),5000));
  try{const result=await Promise.race([request,timeout]);return result.error??null}catch(error){return error}
}

export async function flushPendingMutations(){
  if(typeof window==="undefined"||!navigator.onLine||flushing)return;
  const queue=readQueue();
  if(!queue.length)return;
  flushing=true;
  notify("start",queue.length);
  try{
    // Process all pending writes at once instead of making a slow queue wait
    // behind an older mutation. The UI is already optimistic, so persistence
    // happens in the background and failures remain queued for retry.
    const results=await Promise.all(queue.map(async item=>({item,error:await executeMutation(item)})));
    const remaining=results.filter(result=>result.error).map(result=>result.item);
    writeQueue(remaining);
    notify(remaining.length?"error":"done",remaining.length);
  }finally{flushing=false}
}

export function startMutationSync(){if(typeof window==="undefined")return()=>{};const sync=()=>void flushPendingMutations();const onVisibility=()=>{if(document.visibilityState==="visible")sync()};window.addEventListener("online",sync);window.addEventListener("focus",sync);document.addEventListener("visibilitychange",onVisibility);const timer=window.setInterval(sync,15000);sync();return()=>{window.removeEventListener("online",sync);window.removeEventListener("focus",sync);document.removeEventListener("visibilitychange",onVisibility);window.clearInterval(timer)}}
