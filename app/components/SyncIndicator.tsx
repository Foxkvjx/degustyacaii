"use client";

import { useEffect, useState } from "react";
import { getPendingMutations } from "../../lib/offlineQueue";

export default function SyncIndicator(){
 const [syncing,setSyncing]=useState(false);
 useEffect(()=>{const onSync=(event:Event)=>{const detail=(event as CustomEvent).detail as {state?:string;pending?:number}|undefined;setSyncing(detail?.state==="start"||Number(detail?.pending)>0)};window.addEventListener("degusty-sync",onSync);setSyncing(getPendingMutations().length>0);return()=>window.removeEventListener("degusty-sync",onSync)},[]);
 if(!syncing)return null;
 return <div className="fixed left-1/2 top-3 z-[100] -translate-x-1/2 rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] font-semibold text-black shadow-lg dark:border-white/10 dark:bg-black dark:text-white"><span className="mr-1 inline-block animate-ping">•</span>Sincronizando...</div>;
}
