import type {Units} from '../types';
export const T=(c:number,u:Units)=>u==='m'?`${c} °C`:`${Math.round(c*9/5+32)} °F`;
export const A=(ha:number,u:Units)=>u==='m'?`${ha.toFixed(2)} ha`:`${(ha*2.471).toFixed(2)} ac`;
export const R=(mm:number,u:Units)=>u==='m'?mm:+(mm/25.4).toFixed(2);
export const Tn=(c:number,u:Units)=>u==='m'?c:Math.round(c*9/5+32);
// Spherical polygon area in hectares from WGS84 lat/lng.
export function geoArea(ll:{lat:number;lng:number}[]):number{const Rr=6378137;let s=0;
 for(let i=0;i<ll.length;i++){const a=ll[i],b=ll[(i+1)%ll.length];s+=(b.lng-a.lng)*Math.PI/180*(2+Math.sin(a.lat*Math.PI/180)+Math.sin(b.lat*Math.PI/180))}
 return Math.abs(s*Rr*Rr/2)/1e4}
