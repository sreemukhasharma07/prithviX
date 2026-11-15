// Single integration point. Each call takes farm coordinates; swap the body for fetch(`${BASE}/...`) to reach FastAPI.
import type {Farm,Plot,Crop,Alert,Plan,Series} from '../types';
import {ZONES,SERIES} from '../data/demo';
export const BASE=import.meta.env.VITE_API_URL as string|undefined;
const wait=<T,>(v:T)=>new Promise<T>(r=>setTimeout(()=>r(v),200));
export const getPlots=(f:Farm):Promise<Plot[]>=>wait(f.pl.map((v,i)=>({id:'AB'[i],name:'Plot '+'AB'[i],ha:[1.8,2.4][i],crop:ZONES[f.z]['AB'[i] as 'A'|'B'][0],moist:v[0],lst:v[1],ndvi:v[2]})));
export const getCrops=(f:Farm):Promise<Crop[]>=>wait(ZONES[f.z].crops.map(c=>({n:c[0],sc:c[1],w:c[2],why:c[3]})));
export const getRotation=(f:Farm):Promise<Record<string,Plan>>=>{const z=ZONES[f.z];return wait({'Current plan':{A:z.A,B:z.B,note:'Region-aware demo plan for '+z.n+'.'},'Cereal-heavy':{A:[z.cer[0],z.cer[0],z.cer[1],z.cer[0]],B:[z.cer[1],z.cer[0],z.cer[1],z.cer[0]],note:'Few legumes; higher pest and disease carry-over risk.'}})};
export const getSeries=(_f?:Farm):Promise<Series>=>wait(SERIES);
export async function getAlerts(f:Farm):Promise<Alert[]>{const pl=await getPlots(f),l=pl.find(x=>x.moist<.2),d=new Date().toLocaleString([],{timeZone:f.tz,dateStyle:'medium',timeStyle:'short'});
const first:Alert=l?{s:'c',t:'Water stress',p:l.id,d,x:`Soil moisture is ${Math.round(l.moist*100)}%, below the demo threshold.`,a:`Irrigate ${l.name} within 2 days.`}:{s:'n',t:'Soil moisture',p:'All',d,x:'Moisture is in the normal demo range.',a:'No action needed.'};
return [first,
{s:'w',t:'Rainfall',p:'All',d,x:'Heavy rain forecast in 3 days (demo value).',a:'Delay sowing until it passes.'},
{s:'i',t:'Planting',p:'A',d,x:`A planting window may open soon for ${ZONES[f.z].crops[0][0]}.`,a:'Prepare the seedbed.'},
{s:'n',t:'Temperature',p:'All',d,x:'Surface temperature is near the seasonal norm (demo).',a:'No action needed.'}]}

export interface Place{name:string;lat:number;lng:number}
// Place search via OpenStreetMap Nominatim (worldwide). Call on submit only, not per keystroke (usage policy). Replace with your own geocoder for production.
export async function searchPlaces(q:string):Promise<Place[]>{
 const r=await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&accept-language=en&q=${encodeURIComponent(q)}`);
 if(!r.ok)throw new Error('Search failed ('+r.status+')');
 const j=await r.json() as {display_name:string;lat:string;lon:string}[];
 return j.map(p=>({name:p.display_name,lat:+p.lat,lng:+p.lon}))}
