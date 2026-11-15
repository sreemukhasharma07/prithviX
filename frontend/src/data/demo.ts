// Demonstration data only. Replace via src/services/api.ts when the backend exists.
import type {Farm,Zone,Series} from '../types';
type ZoneDef={n:string;crops:[string,number,string,string][];A:string[];B:string[];cer:[string,string]};
export const ZONES:Record<Zone,ZoneDef>={
trop:{n:'Tropical (demo)',crops:[['Rice',80,'High','Monsoon rainfall suits paddy.'],['Groundnut',72,'Medium','Legume that suits light soils.'],['Sorghum',66,'Low','Tolerates dry spells.'],['Cotton',55,'Medium','Needs a long warm season.']],A:['Rice','Chickpea','Maize','Groundnut'],B:['Maize','Soybean','Sorghum','Pulses'],cer:['Rice','Maize']},
humid:{n:'Humid subtropical (demo)',crops:[['Rice',78,'High','Warm, wet summers suit paddy.'],['Soybean',74,'Medium','Fits a summer slot and adds nitrogen.'],['Wheat',68,'Medium','Cool, drier winter crop.'],['Barley',60,'Low','Short season, fits winter.']],A:['Rice','Wheat','Soybean','Barley'],B:['Soybean','Wheat','Rice','Barley'],cer:['Rice','Wheat']},
med:{n:'Mediterranean, irrigated (demo)',crops:[['Wheat',76,'Medium','Winter rains, dry summer.'],['Barley',70,'Low','Handles dry spring.'],['Tomato',64,'High','Needs irrigation in the dry season.'],['Chickpea',62,'Low','Legume suited to dry summers.']],A:['Wheat','Chickpea','Barley','Tomato'],B:['Barley','Chickpea','Wheat','Sunflower'],cer:['Wheat','Barley']},
temp:{n:'Temperate (demo)',crops:[['Wheat',75,'Medium','Cool season cereal.'],['Barley',72,'Low','Short, cool season.'],['Canola',66,'Medium','Oilseed that breaks cereal cycles.'],['Peas',60,'Low','Legume for cool springs.']],A:['Wheat','Peas','Barley','Canola'],B:['Barley','Canola','Wheat','Peas'],cer:['Wheat','Barley']}};
export const FARMS:Farm[]=[
{key:'hyd',name:'Hyderabad, India',lat:17.385,lng:78.487,tz:'Asia/Kolkata',z:'trop',pl:[[.31,34,.62],[.14,38,.41]]},
{key:'tok',name:'Tokyo, Japan',lat:35.68,lng:139.69,tz:'Asia/Tokyo',z:'humid',pl:[[.36,24,.7],[.29,25,.66]]},
{key:'cal',name:'Central Valley, California, USA',lat:36.74,lng:-119.79,tz:'America/Los_Angeles',z:'med',pl:[[.18,30,.38],[.22,29,.45]]}];
export const SERIES:Series={moist:[.34,.33,.31,.27,.22,.19,.17,.14],rain:[12,0,4,0,0,2,0,0],lst:[31,32,33,35,36,36,37,38],ndvi:[.58,.6,.62,.6,.55,.5,.46,.41]};
// Latitude-only guess for arbitrary points. Not a real climate classification.
export const zoneFor=(lat:number):Zone=>Math.abs(lat)<23.5?'trop':Math.abs(lat)<40?'humid':'temp';
