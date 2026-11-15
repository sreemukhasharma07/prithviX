import {useState} from 'react';import {useAsync} from '../hooks/useAsync';import {getRotation} from '../services/api';import {Load,Demo} from '../components/ui';import type {Farm} from '../types';
const cls=(c:string)=>/Chick|Soy|Pulse|Pea/.test(c)?'leg':/Ground|Canola|Sunflower/.test(c)?'oil':'cer';
export default function Rotation({farm}:{farm:Farm}){
 const r=useAsync(()=>getRotation(farm),[farm]);const [sel,setSel]=useState('Current plan');
 return <><Demo>Example rotations for illustration, not agronomic advice.</Demo><h1>Crop rotation · {farm.name}</h1>
 <Load s={r}>{plans=>{const p=plans[sel]??plans['Current plan'];return <>
  <div className="chips">{Object.keys(plans).map(k=><button key={k} className={k===sel?'on':''} onClick={()=>setSel(k)}>{k}</button>)}</div>
  <div className="panel"><div className="tl"><div className="h"/>{[1,2,3,4].map(i=><div key={i} className="h">Season {i}</div>)}
   {(['A','B'] as const).map(id=>[<div key={id} className="h">Plot {id}</div>,...p[id].map((c,i)=><div key={id+i} className={cls(c)}>{c}</div>)])}</div>
   <p><b>{sel}:</b> {p.note}</p><p className="src">Green: legume · Dark: cereal · Gold: oilseed</p></div></>}}</Load></>}
