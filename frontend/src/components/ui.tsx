import type {ReactNode} from 'react';import type {State} from '../hooks/useAsync';
export function Load<T>({s,children}:{s:State<T>;children:(d:T)=>ReactNode}){
 if(s.loading)return <p className="src">Loading…</p>;
 if(s.error||!s.data)return <div className="act c"><b>Could not load data</b><small>{s.error??'No data returned.'} Check the connection and try again.</small></div>;
 return <>{children(s.data)}</>}
export const Demo=({children}:{children:ReactNode})=><div className="demo">{children}</div>;
export const Gauge=({l,v,t,src}:{l:string;v:number;t:string;src:string})=><div className="gauge"><span>{l}</span><div className="bar"><i style={{width:`${Math.min(1,v)*100}%`}}/></div><span>{t} <span className="src">{src}</span></span></div>;
