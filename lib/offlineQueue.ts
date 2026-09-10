import { supabase } from "./supabase";

type Action = "insert" | "update" | "delete";
export type Pending = { id:string; table:string; action:Action; payload?:Record<string,unknown>; match?:{column:string;value:string}; createdAt:number };
const KEY="degusty:persistent-mutation-queue:v1";
function readQueue():Pending[]{if(typeof window==="undefined")return[];try{return JSON.parse(localStorage.getItem(KEY)||"[]") as Pending[]}catch{return[]}}
function writeQueue(queue:Pending[]){if(typeof window!=="undefined")localStorage.setItem(KEY,JSON.stringify(queue));}
export function getPendingMutations(){return readQueue();}
export function queueMutation(input:Omit<Pending,"id"|"createdAt">){const item:Pending={...input,id:crypto.randomUUID(),createdAt:Date.now()};const queue=readQueue();queue.push(item);writeQueue(queue);void flushPendingMutations();return item;}
export function removeQueuedMutation(queueId:string){writeQueue(readQueue().filter(item=>item.id!==queueId));}
export async function flushPendingMutations(){if(typeof window==="undefined"||!navigator.onLine)return;const queue=readQueue();if(!queue.length)return;const remaining:Pending[]=[];for(const item of queue){let error:unknown=null;try{if(item.action==="insert"){const result=await supabase.from(item.table).insert(item.payload||{});error=result.error}else if(item.action==="update"&&item.match){const result=await supabase.from(item.table).update(item.payload||{}).eq(item.match.column,item.match.value);error=result.error}else if(item.action==="delete"&&item.match){const result=await supabase.from(item.table).delete().eq(item.match.column,item.match.value);error=result.error}}catch(err){error=err}if(error)remaining.push(item)}writeQueue(remaining);window.dispatchEvent(new Event("degusty-sync"));}
export function startMutationSync(){if(typeof window==="undefined")return()=>{};const sync=()=>void flushPendingMutations();const onVisibility=()=>{if(document.visibilityState==="visible")sync()};window.addEventListener("online",sync);window.addEventListener("focus",sync);document.addEventListener("visibilitychange",onVisibility);const timer=window.setInterval(sync,15000);sync();return()=>{window.removeEventListener("online",sync);window.removeEventListener("focus",sync);document.removeEventListener("visibilitychange",onVisibility);window.clearInterval(timer)}}
