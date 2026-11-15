import {useAsync} from '../hooks/useAsync';import {getSeries} from '../services/api';import {Load,Demo} from '../components/ui';import Trend from '../components/Trend';import {R,Tn} from '../utils/units';import type {Farm,Units} from '../types';
export default function SoilClimate({farm,units}:{farm:Farm;units:Units}){
 const se=useAsync(()=>getSeries(farm),[farm]);
 return <><Demo>Demonstration series for {farm.name}.</Demo><h1>Soil &amp; climate</h1>
 <Load s={se}>{s=><div className="cols" style={{marginTop:10}}>
  <div className="panel"><h2>Soil moisture (SMAP)</h2><Trend data={s.moist.map(v=>Math.round(v*100))} unit="%"/></div>
  <div className="panel"><h2>Land surface temperature (ECOSTRESS)</h2><Trend data={s.lst.map(v=>Tn(v,units))} unit={units==='m'?' °C':' °F'} color="#9A7B3A"/></div>
  <div className="panel"><h2>Rainfall per week (GPM)</h2><Trend data={s.rain.map(v=>R(v,units))} unit={units==='m'?' mm':' in'} bar color="#3C6E8F"/></div>
  <div className="panel"><h2>Vegetation, NDVI (Landsat)</h2><Trend data={s.ndvi} color="#1F3D2B"/></div></div>}</Load></>}
