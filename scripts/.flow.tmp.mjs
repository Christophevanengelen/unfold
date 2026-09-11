import { chromium, devices } from '@playwright/test';
const S=process.argv[2], BASE="http://localhost:3333";
const MOI={nickname:"Christophe",birthDate:"1977-09-27",birthTime:"00:00",latitude:50.8503,longitude:4.3517,timezone:"Europe/Brussels",placeOfBirth:"Bruxelles"};
const CONNS=[
 {id:"c1",name:"Marie-Ange",initial:"M",relationship:"colleague",birthData:{nickname:"Marie-Ange",birthDate:"1980-10-24",birthTime:"01:41",latitude:50.8503,longitude:4.3517,timezone:"Europe/Brussels",placeOfBirth:"Bruxelles"},connectedSince:"2026-08-02",inviteCode:"AB12CD"},
 {id:"c2",name:"Lou",initial:"L",relationship:"partner",birthData:{nickname:"Lou",birthDate:"1982-09-02",birthTime:"02:15",latitude:51.2194,longitude:4.4025,timezone:"Europe/Brussels",placeOfBirth:"Anvers"},connectedSince:"2026-05-14",inviteCode:"EF34GH"},
];
// Reponse au format exact du prompt v5, pour voir la mise en page reelle sans appeler le modele.
const LECTURE={personA:{titre:"Ton métier au premier plan",annee:"Cette année, c'est ta place publique et ton travail qui occupent le devant de la scène : ce que tu montres, et à qui.",eclipse:"Une bascule touche l'axe de ce que tu possèdes et de ce que tu partages.",passage:"Ces jours-ci, un passage lent appuie sur tes engagements — ce n'est pas le premier.",fond:null,defi:"Tenir la ligne sans t'épuiser à convaincre ceux qui ne regardent pas.",tempo:"lent"},
 personB:{titre:"Le chez-soi se réorganise",annee:"Son année tourne autour du chez-soi et de la famille : ce qui s'installe, ce qui se déplace.",eclipse:null,passage:"Un passage rapide agite ses échanges cette semaine.",fond:"Le chapitre qui portait ce thème se referme — une fin naturelle.",defi:"Ne pas confondre un calme de fond avec un moment où rien ne compte.",tempo:"rapide"},
 ensemble:{titre:"Deux terrains, une écoute",annees:"Tu travailles ta place publique pendant qu'elle réorganise son chez-soi : deux terrains différents, tous les deux exigeants.",eclipses:null,passages:"Ton passage est lent, le sien est rapide — vous ne vivez pas la même semaine.",empathie:"Elle a besoin que tu ne lui demandes pas d'être disponible comme d'habitude pendant qu'elle referme une page. Tu as besoin qu'on ne prenne pas ta concentration pour de la distance.",aFaireEnsemble:"Cette semaine, dites-vous chacun en une phrase le sujet qui vous occupe vraiment, sans chercher à résoudre celui de l'autre."}};
const b=await chromium.launch();
const ecrans=[["01-liste-vide","/app/compatibility",false],["02-liste","/app/compatibility",true],["03-detail","/app/compatibility/view/?c=c2",true],["04-partage","/app/invite/share",true],["05-rejoindre","/app/invite/join",true],["06-connecte","/app/invite/connected",true]];
for(const [nom,url,avecDonnees] of ecrans){
  const ctx=await b.newContext({...devices['iPhone 13'], colorScheme:'dark'});
  await ctx.addInitScript(([moi,conns,peupler])=>{try{
    localStorage.setItem("unfold_birth_data",JSON.stringify(moi));
    localStorage.setItem("unfold_onboarding_complete","true");
    localStorage.setItem("unfold_onboarding_done","true");
    if(peupler) localStorage.setItem("unfold_connections",JSON.stringify(conns));
  }catch{}},[MOI,CONNS,avecDonnees]);
  const p=await ctx.newPage();
  const erreurs=[];
  p.on('pageerror',e=>erreurs.push(e.message.slice(0,80)));
  await p.route('**/api/openai/**', r=>r.fulfill({status:200,contentType:'application/json',body:JSON.stringify(LECTURE)}));
  await p.goto(BASE+url).catch(e=>erreurs.push("nav"));
  await p.waitForTimeout(9000);
  await p.screenshot({path:`${S}/flow/${nom}.png`,fullPage:true});
  const txt=(await p.evaluate(()=>document.body.innerText)).replace(/\s+/g," ").slice(0,180);
  console.log(`${nom.padEnd(15)} ${erreurs.length?"ERR "+erreurs[0]:"ok"}\n   ${txt}`);
  await ctx.close();
}
await b.close();
