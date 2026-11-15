import {useEffect,useState} from 'react';
export interface State<T>{data?:T;loading:boolean;error?:string}
export function useAsync<T>(fn:()=>Promise<T>,deps:unknown[]):State<T>{
 const [s,set]=useState<State<T>>({loading:true});
 useEffect(()=>{let ok=true;set({loading:true});fn().then(d=>{if(ok)set({data:d,loading:false})},e=>{if(ok)set({loading:false,error:String(e)})});return()=>{ok=false}},deps); // eslint-disable-line
 return s}
