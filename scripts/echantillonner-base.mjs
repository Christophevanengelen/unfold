import fs from "fs";
import * as Si from "./ref/silence.js";
import * as M from "./ref/maison-du-boudin.js";
const IDS=[5400,5403,5415,5428,5430,5433,5434,5435,5439,5440,5443,5448,5456,5459,5465,5466,5469,5470,5471,5472,5473,5479,5480,5481,5484,5488,5491,5501,5508,5510,5515,5531,5532,5545,5553,5554,5558,5526,5507];
const noms=JSON.parse(fs.readFileSync("base-noms.json","utf8"));
const ZB="https://ai.zebrapad.io/full-suite-spiritual-api";
const AL="https://app.astrolearn.io/api/astrolearn/public";
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function post(ep,body){const r=await fetch(`${ZB}/${ep}.php`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});return r.json();}
function fenetres(short,yb){
  const ref=M.referentielDepuisAnnee(yb); if(!ref) return null; M.nourrirPointsNatals(ref,short);
  const norm=short.map(b=>({...b,category:b.cat,natalPoint:b.np,startDate:b.s,endDate:b.e,score:b.sc,label:b.lbl,transitPlanet:b.tp,periodHousePlacement:b.pH!=null?{house:b.pH}:null,periodSign:b.pSign??null,eclipseSign:b.eSign??null}));
  const votes=Si.votesDepuisBoudins(norm,ref); const F=Si.fenetresDeConvergence(votes);
  return F.map(w=>({du:Si.enIso(w.debut),au:Si.enIso(w.fin),maison:w.maison,force:w.force??(w.participants?.length),familles:[...new Set((w.participants||[]).map(p=>String(p.famille||"").split(":")[0]).filter(Boolean))]}));
}
for(const id of IDS){
  const out=`base/fen_${id}.json`; if(fs.existsSync(out)){console.log(id,"deja");continue;}
  const p=noms.find(n=>n.id===id); if(!p){console.log(id,"pas de naissance");continue;}
  const birth={nickname:p.name,birthDate:p.birthDate,birthTime:p.birthTime,latitude:p.latitude,longitude:p.longitude,timezone:p.timezone,placeOfBirth:p.city};
  try{
    const ev=await (await fetch(`${AL}/events?personId=${id}`)).json();
    const short=await post("toctoc-app-short",birth); await sleep(400);
    const year=await post("toctoc-year",birth);
    const sb=short?.data?.boudins||short?.boudins||[]; const yb=year?.data?.boudins||year?.boudins||[];
    const F=fenetres(sb,yb);
    fs.writeFileSync(out,JSON.stringify({id,personne:p,boudins:sb.length,annee:yb.length,fenetres:F,evenements:(ev.data||ev)},null,0));
    console.log(id,p.name,"boudins",sb.length,"fenetres",F?F.length:null,"evenements",(ev.data||ev).length);
  }catch(e){console.log(id,p.name,"ERREUR",String(e).slice(0,120));}
  await sleep(800);
}
console.log("FINI");
