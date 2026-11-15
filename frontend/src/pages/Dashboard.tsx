import {useAsync} from '../hooks/useAsync';import {getPlots,getAlerts,getSeries} from '../services/api';
import {Load,Demo,Gauge} from '../components/ui';import Trend from '../components/Trend';import {T,A} from '../utils/units';import type {Farm,Units} from '../types';
export default function Dashboard({farm,units}:{farm:Farm;units:Units}){
 const pl=useAsync(()=>getPlots(farm),[farm]),al=useAsync(()=>getAlerts(farm),[farm]),se=useAsync(()=>getSeries(farm),[farm]);
 return <><Demo>Demonstration data for {farm.name}. No NASA feed is connected yet.</Demo><h1>What to do today</h1>
 <div className="cols" style={{marginTop:10}}>
  <div className="panel"><h2>Recommended actions</h2><Load s={al}>{a=>a.filter(x=>x.s!=='n').map(x=><div key={x.t} className={'act '+x.s}><b>{x.a}</b><small>{x.t} · Plot {x.p}</small></div>)}</Load></div>
  <div className="panel"><Load s={pl}>{plots=>{const p=[...plots].sort((a,b)=>a.moist-b.moist)[0];return <><h2>Conditions ({p.name})</h2>
   <Gauge l="Soil moisture" v={p.moist} t={`${Math.round(p.moist*100)}%`} src="SMAP"/><Gauge l="Vegetation" v={p.ndvi} t={`NDVI ${p.ndvi}`} src="Landsat"/>
   <Gauge l="Water available" v={p.moist*2} t={p.moist<.2?'Low':'Adequate'} src="GPM / POWER"/><div className="gauge"><span>Surface temp</span><b>{T(p.lst,units)}</b><span className="src">ECOSTRESS</span></div></>}}</Load></div></div>
 <div className="panel"><h2>Plots</h2><Load s={pl}>{plots=><div className="scroll"><table><thead><tr><th>Plot</th><th>Area</th><th>Crop</th><th>Moisture</th><th>NDVI</th><th>Status</th></tr></thead><tbody>
  {plots.map(x=><tr key={x.id}><td>{x.name}</td><td>{A(x.ha,units)}</td><td>{x.crop}</td><td>{Math.round(x.moist*100)}%</td><td>{x.ndvi}</td><td>{x.moist<.2?'Water stress':'Healthy'}</td></tr>)}</tbody></table></div>}</Load></div>
 <p className="src">Coverage: SMAP is coarse (about 9 km) with a revisit of 2 to 3 days. ECOSTRESS passes are irregular and may skip a location. Landsat repeats every 16 days and is cloud-limited. Gaps will be shown as gaps.</p>
 <Load s={se}>{s=><div className="cols"><div className="panel"><h2>Soil moisture, 8 weeks</h2><Trend data={s.moist}/></div><div className="panel"><h2>Vegetation (NDVI), 8 weeks</h2><Trend data={s.ndvi} color="#1F3D2B"/></div></div>}</Load></>}
