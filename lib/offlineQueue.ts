import { supabase } from "./supabase";

type Action = "insert" | "update" | "delete";
export type Pending = { id:string; table:string; action:Action; payload?:Record<string,unknown>; match?:{column:string;value:string}; createdAt:number };
const KEY="degusty:persistent-mutation-queue:v2";
const OLD_KEY="degusty:persistent-mutation-queue:v1";
const EVENT="degusty-sync";
let flushing=false;
function readQueue():Pending[]{if(typeof window==="undefined")return[];try{const current=localStorage.getItem(KEY);if(current)return JSON.parse(current) as Pending[];const old=localStorage.getItem(OLD_KEY);if(old){const parsed=JSON.parse(old) as Pending[];localStorage.setItem(KEY,JSON.stringify(parsed));localStorage.removeItem(OLD_KEY);return parsed;}return []}catch{return []}}
function writeQueue(queue:Pending[]){if(typeof window!=="undefined")localStorage.setItem(KEY,JSON.stringify(queue));}
function notify(state:"start"|"done"|"error",pending:number){if(typeof window!=="undefined")window.dispatchEvent(new CustomEvent(EVENT,{detail:{state,pending}}));}
export function getPendingMutations(){return readQueue();}
export function queueMutation(input:Omit<Pending,"id"|"createdAt">){const item:Pending={...input,id:crypto.randomUUID(),createdAt:Date.now()};const queue=readQueue();queue.push(item);writeQueue(queue);notify("start",queue.length);void flushPendingMutations();return item;}
export function removeQueuedMutation(queueId:string){writeQueue(readQueue().filter(item=>item.id!==queueId));}
export async function flushPendingMutations(){if(typeof window==="undefined"||!navigator.onLine||flushing)return;const queue=readQueue();if(!queue.length)return;flushing=true;notify("start",queue.length);try{const remaining:Pending[]=[];for(const item of queue){let error:unknown=null;try{if(item.action==="insert"){const result=await supabase.from(item.table).insert(item.payload||{});error=result.error}else if(item.action==="update"&&item.match){const result=await supabase.from(item.table).update(item.payload||{}).eq(item.match.column,item.match.value);error=result.error}else if(item.action==="delete"&&item.match){const result=await supabase.from(item.table).delete().eq(item.match.column,item.match.value);error=result.error}}catch(err){error=err}if(error)remaining.push(item)}writeQueue(remaining);notify(remaining.length?"error":"done",remaining.length)}finally{flushing=false}}
export function startMutationSync(){if(typeof window==="undefined")return()=>{};const sync=()=>void flushPendingMutations();const onVisibility=()=>{if(document.visibilityState==="visible")sync()};window.addEventListener("online",sync);window.addEventListener("focus",sync);document.addEventListener("visibilitychange",onVisibility);const timer=window.setInterval(sync,3000);sync();return()=>{window.removeEventListener("online",sync);window.removeEventListener("focus",sync);document.removeEventListener("visibilitychange",onVisibility);window.clearInterval(timer)}}
