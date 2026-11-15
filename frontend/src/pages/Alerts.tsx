import {useState} from 'react';import {useAsync} from '../hooks/useAsync';import {getAlerts} from '../services/api';import {Load} from '../components/ui';import type {Farm} from '../types';
const F:[string,string][]=[['all','All'],['c','Critical'],['w','Warning'],['i','Info'],['n','Normal']];
export default function Alerts({farm}:{farm:Farm}){
 const al=useAsync(()=>getAlerts(farm),[farm]);const [f,setF]=useState('all');
 return <><h1>Alerts &amp; advice</h1><div className="chips" style={{marginTop:10}}>{F.map(([k,l])=><button key={k} className={k===f?'on':''} onClick={()=>setF(k)}>{l}</button>)}</div>
 <Load s={al}>{list=>{const v=list.filter(a=>f==='all'||a.s===f);return v.length?v.map(a=><div key={a.t} className={'act '+a.s}><b>{a.t}: {a.x}</b>{a.a}<br/><small>{a.d} · Plot {a.p}</small></div>):<p className="src">No alerts in this category.</p>}}</Load></>}
