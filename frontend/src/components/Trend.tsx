import {LineChart,Line,BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer} from 'recharts';
export default function Trend({data,color='#6B8A57',unit='',bar=false}:{data:number[];color?:string;unit?:string;bar?:boolean}){
 const d=data.map((v,i)=>({w:'W'+(i+1),v}));const tip=<Tooltip formatter={(v)=>`${v}${unit}`}/>;
 return <div style={{height:140}}><ResponsiveContainer>{bar
  ?<BarChart data={d}><XAxis dataKey="w" fontSize={11}/><YAxis fontSize={11} width={34}/>{tip}<Bar dataKey="v" fill={color}/></BarChart>
  :<LineChart data={d}><XAxis dataKey="w" fontSize={11}/><YAxis fontSize={11} width={34} domain={['auto','auto']}/>{tip}<Line dataKey="v" stroke={color} dot={false} strokeWidth={2}/></LineChart>}</ResponsiveContainer></div>}
