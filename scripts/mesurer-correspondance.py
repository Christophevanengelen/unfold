# Correspondance : Brad (5507) face a chaque vie de l'echantillon, et la population.
import json,glob,datetime as dt,statistics as st,sys
from collections import Counter
S=sys.argv[1]
MAISONS={1:"toi-même",2:"argent, ressources",3:"échanges, entourage",4:"foyer, famille",5:"création, enfants",6:"santé, quotidien",7:"relations, couple",8:"ce qui est partagé",9:"idées, voyages",10:"carrière, réputation",11:"amis, projets",12:"retrait, intériorité"}
D=lambda x:dt.date.fromisoformat(x); L=lambda f:(D(f['au'])-D(f['du'])).days+1
vies={}
for f in glob.glob(f"{S}/base/fen_*.json"):
    d=json.load(open(f))
    if not d.get('fenetres'): continue
    vies[d['id']]=d
def profil(F):
    c=Counter(f['maison'] for f in F); n=len(F); return {k:v/n for k,v in c.items()}
def stats(d):
    F=sorted(d['fenetres'],key=lambda f:f['du']); t0=min(D(f['du']) for f in F); t1=max(D(f['au']) for f in F); T=(t1-t0).days or 1
    p=profil(F); dom=max(p,key=p.get)
    return dict(n=len(F),couv=sum(L(f) for f in F)/T,mediane=st.median(L(f) for f in F),profil=p,dominant=dom,part_dom=p[dom],T=T,t0=t0,t1=t1)
def correspondance(A,B):
    sa,sb=stats(A),stats(B); FA,FB=A['fenetres'],B['fenetres']
    sujets=sum(min(sa['profil'].get(k,0),sb['profil'].get(k,0)) for k in set(sa['profil'])|set(sb['profil']))
    # calendrier : on superpose les deux vies par AGE (jours depuis la naissance), pas par date — deux vies ne se comparent qu'a age egal
    nA=D(A['personne']['birthDate']); nB=D(B['personne']['birthDate'])
    age=lambda f,n:((D(f['du'])-n).days,(D(f['au'])-n).days)
    ov=[(a,b) for a in FA for b in FB if age(a,nA)[0]<=age(b,nB)[1] and age(b,nB)[0]<=age(a,nA)[1]]
    T=max(sa['T'],sb['T']); attendu=sum((L(a)+L(b)-1)/T for a in FA for b in FB)
    meme=[(a['du'],b['du'],a['maison']) for a,b in ov if a['maison']==b['maison']]
    rythme=1-abs(sa['mediane']-sb['mediane'])/max(sa['mediane'],sb['mediane'])
    dens=1-abs(sa['couv']-sb['couv'])/max(sa['couv'],sb['couv'])
    score=round(100*(0.6*sujets+0.2*rythme+0.2*dens))
    return dict(score=score,sujets=round(100*sujets),ov=len(ov),attendu=round(attendu,1),ratio=round(len(ov)/attendu,2) if attendu else None,meme=len(meme),rythme=round(100*rythme),dens=round(100*dens),sb=sb)
brad=vies[5507]; sbrad=stats(brad)
print("Brad :",sbrad['n'],"fenetres, dominant",MAISONS[sbrad['dominant']],round(100*sbrad['part_dom']),"%")
rows=[]
for i,v in vies.items():
    if i==5507: continue
    c=correspondance(brad,v); rows.append((c['score'],v['personne']['name'],i,c))
rows.sort(reverse=True)
print("\n== classement par correspondance ==")
for sc,nom,i,c in rows: print(f"{sc:3d}  {nom:28s} sujets {c['sujets']:3d}%  cal {c['ov']:2d}/{c['attendu']:4.1f} ({c['ratio']})  meme {c['meme']}  rythme {c['rythme']}  dens {c['dens']}  dom {MAISONS[c['sb']['dominant']]} {round(100*c['sb']['part_dom'])}%")
# population
doms=Counter(stats(v)['dominant'] for v in vies.values())
n=len(vies); print("\n== population",n,"vies ==")
for m,c in doms.most_common(): print(f"  {MAISONS[m]:24s} {c:2d}  {round(100*c/n)}%")
same=sum(1 for v in vies.values() if stats(v)['dominant']==sbrad['dominant'])
print(f"meme sujet dominant que Brad : {same}/{n} = {round(100*same/n)}%")
couvs=[stats(v)['couv'] for v in vies.values()]; print("couverture mediane %.1f%%  brad %.1f%%  rang de brad (plus silencieux) %d/%d"%(100*st.median(couvs),100*sbrad['couv'],sorted(couvs).index(sbrad['couv'])+1,n))
# ce qu'ils ont fait de fenetres comme la tienne : evenements dates tombant dans une fenetre maison 3 (hors traits a la naissance)
print("\n== faits dates tombes dans une fenetre 'echanges, entourage' (maison 3), chez les autres ==")
def evs(v):
    out=[]
    for e in v['evenements']:
        ed=e.get('event_date',''); 
        if len(ed)!=8 or ed==v['personne']['birthDate'].replace('-',''): continue
        try: d=dt.date(int(ed[:4]),int(ed[4:6]),max(1,int(ed[6:])))
        except Exception: continue
        out.append((d,e.get('category'),e.get('subcategory'),e.get('detail')))
    return out
for i,v in vies.items():
    if i==5507: continue
    hits=[(d,cat,sub,det) for d,cat,sub,det in evs(v) for f in v['fenetres'] if f['maison']==3 and D(f['du'])-dt.timedelta(days=15)<=d<=D(f['au'])+dt.timedelta(days=15)]
    tous=[(d,cat,det) for d,cat,sub,det in evs(v) for f in v['fenetres'] if D(f['du'])<=d<=D(f['au'])]
    print(v['personne']['name'],": evenements dates",len(evs(v)),"dans une fenetre",len(tous),"dans une fenetre echanges",len(hits), [(str(d),cat,det[:50]) for d,cat,sub,det in hits[:2]])
json.dump({'brad':{k:(str(x) if isinstance(x,dt.date) else x) for k,x in sbrad.items()},'rows':[(sc,nom,i,{k:(x if k!='sb' else None) for k,x in c.items()}) for sc,nom,i,c in rows],'doms':{MAISONS[m]:c for m,c in doms.items()},'n':n,'same':same},open(f"{S}/base-correspondance.json","w"),ensure_ascii=False,indent=1)
