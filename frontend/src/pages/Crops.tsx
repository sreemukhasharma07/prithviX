import {useAsync} from '../hooks/useAsync';import {getCrops} from '../services/api';import {Load,Demo} from '../components/ui';import {ZONES} from '../data/demo';import type {Farm} from '../types';
export default function Crops({farm}:{farm:Farm}){
 const c=useAsync(()=>getCrops(farm),[farm]);
 return <><Demo>Scores are demonstration values, not model predictions.</Demo><h1>Crop recommendations · {farm.name}</h1>
 <p className="src">Climate zone: {ZONES[farm.z].n}{farm.key==='custom'?', estimated from latitude only':''}. Real scoring needs local climate, soil and crop calendar data from the backend.</p>
 <div className="panel"><Load s={c}>{list=><div className="scroll"><table><thead><tr><th>Crop</th><th>Suitability (demo)</th><th>Water need</th><th>Why</th></tr></thead><tbody>
  {list.map(x=><tr key={x.n}><td><b>{x.n}</b></td><td><div className="bar" style={{width:120}}><i style={{width:`${x.sc}%`}}/></div>{x.sc}</td><td>{x.w}</td><td>{x.why}</td></tr>)}</tbody></table></div>}</Load></div></>}
