export type Zone='trop'|'humid'|'med'|'temp';
export type Units='m'|'i';
export interface Farm{key:string;name:string;lat:number;lng:number;tz:string;z:Zone;pl:[number,number,number][]}
export interface Plot{id:string;name:string;ha:number;crop:string;moist:number;lst:number;ndvi:number}
export interface Crop{n:string;sc:number;w:string;why:string}
export interface Alert{s:'c'|'w'|'i'|'n';t:string;p:string;d:string;x:string;a:string}
export interface Plan{A:string[];B:string[];note:string}
export interface Series{moist:number[];rain:number[];lst:number[];ndvi:number[]}
