"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { contentSchema, emptyChecks, reviewLabels, searchPsychoeducation, type PsychoRecord } from "./psychoeducation";
import styles from "./PsychoeducationLibrary.module.css";
export type PsychoeducationHandle = { open:()=>void; openContent:(id:string)=>Promise<void>; suggest:(query:string, topic?:string)=>Promise<boolean>; clearSuggestions:()=>void };
type Props={storageKey:string;visible:boolean;onBack:()=>void;onOpenDetail:(id:string)=>void;onDetailBack:()=>void;immediateActionActive?:boolean;onCompleteImmediate?:()=>void;onDeferImmediate?:()=>void};
async function api(token="",body?:Record<string,unknown>):Promise<{items?:PsychoRecord[]}> {
  const response=await fetch("/api/psychoeducation"+(token&&!body?"?admin=1":""),{
    method:body?"POST":"GET",cache:"no-store",signal:AbortSignal.timeout(8000),
    headers:{...(token?{Authorization:`Bearer ${token}`} : {}),...(body?{"Content-Type":"application/json"}:{})},
    ...(body?{body:JSON.stringify(body)}:{}),
  });
  const data=await response.json();if(!response.ok)throw new Error(data.error??"Aanvraag mislukt.");return data;
}
function ContentView({record,saved,onToggleSave}:{record:PsychoRecord;saved?:boolean;onToggleSave?:()=>void}) {
  const c=record.content;
  return <article><h3>{c.title}</h3><p>{c.summary}</p>
    {c.video&&<video key={c.video.url} controls preload="none"><source src={c.video.url}/><track default kind="captions" src={c.video.captionsUrl} srcLang="nl" label="Nederlands"/>Je browser ondersteunt deze video niet.</video>}
    {c.paragraphs.map((p,i)=><p key={i}>{p}</p>)}
    <p><strong>Om bij stil te staan:</strong> {c.reflectionQuestion}</p>
    <p><strong>Mogelijke kleine actie:</strong> {c.suggestedAction}</p>
    <details><summary>Bronnen</summary><ul>{c.sources.map(s=><li key={s.url}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a></li>)}</ul></details>
    {onToggleSave&&<button type="button" className={styles.saveButton} onClick={onToggleSave}>{saved?"✓ Opgeslagen bij Leren":"Opslaan bij Leren"}</button>}
  </article>;
}
const PsychoeducationLibrary=forwardRef<PsychoeducationHandle,Props>(function PsychoeducationLibrary({storageKey,visible,onBack,onOpenDetail,onDetailBack,immediateActionActive,onCompleteImmediate,onDeferImmediate},ref){
  const [items,setItems]=useState<PsychoRecord[]>([]),[query,setQuery]=useState("");
  const [format,setFormat]=useState("all"),[topic,setTopic]=useState("");
  const [selectedId,setSelectedId]=useState<string|null>(null),[assignedIds,setAssignedIds]=useState<string[]>([]);
  const [token,setToken]=useState(""),[authenticated,setAuthenticated]=useState(false);
  const [adminItems,setAdminItems]=useState<PsychoRecord[]>([]),[reviewId,setReviewId]=useState("");
  const [checks,setChecks]=useState(emptyChecks),[busy,setBusy]=useState(false);
  const [error,setError]=useState(""),[notice,setNotice]=useState("");
  const [chatSuggestions,setChatSuggestions]=useState(false);
  const [suggestedIds,setSuggestedIds]=useState<string[]>([]);
  const root=useRef<HTMLElement>(null),requestGeneration=useRef(0);
  const selected=items.find(i=>i.content.id===selectedId),reviewItem=adminItems.find(i=>i.content.id===reviewId);
  const selectedIsAct = Boolean(selected?.content.id.startsWith("act-") || selected?.content.topics.includes("ACT"));
  async function refreshPublic(){const list=(await api()).items??[];setItems(list);return list;}
  async function reloadAdmin(){const data=await api(token);setAdminItems(data.items??[]);setChecks(emptyChecks());await refreshPublic();}
  async function run(operation:()=>Promise<void>){setBusy(true);setError("");setNotice("");try{await operation();}catch(e){setError(e instanceof Error?e.message:"Er ging iets mis.");}finally{setBusy(false);}}
  useEffect(()=>{
    let active=true;
    api().then(d=>{if(active)setItems(d.items??[]);}).catch(()=>{if(active)setError("De bibliotheek kon niet worden geladen.");});
    try{const ids=JSON.parse(localStorage.getItem(storageKey)??"[]");setAssignedIds(Array.isArray(ids)?ids.filter((id):id is string=>typeof id==="string"):[]);}catch{setAssignedIds([]);setError("Eerdere selectie kon niet worden geladen.");}
    return()=>{active=false;requestGeneration.current+=1;};
  },[storageKey]);
  // Bij terugkeer naar Home opnieuw ophalen; geen oude concepten blijven aanbieden.
  useEffect(()=>{if(visible)void refreshPublic().catch(()=>undefined);},[visible]);
  useImperativeHandle(ref,()=>({
    async openContent(id){
      requestGeneration.current+=1;setQuery(id === "coping-toen-en-nu" ? "coping" : "");setFormat("all");setTopic("");setChatSuggestions(false);
      root.current?.scrollIntoView({block:"start",behavior:"smooth"});
      await openItem(id);
    },
    open(){ root.current?.scrollIntoView({block:"start",behavior:"smooth"}); root.current?.querySelector<HTMLInputElement>("input")?.focus({preventScroll:true}); },
    clearSuggestions(){requestGeneration.current+=1;setChatSuggestions(false);setQuery("");setSelectedId(null);setNotice("");},
    async suggest(text, topic){const generation=++requestGeneration.current;
      try{const list=(await api()).items??[];if(generation!==requestGeneration.current)return false;
        setItems(list);
        const topicIds:Record<string,string[]> = {
          COPING:["coping-toen-en-nu"], RELAPSE_SIGNS:["vroege-signalen-terugval"],
          CRISIS_SAFETY:["crisisplan-veiligheid"], SLEEP:["slaap-en-dag-nachtritme"],
          MEDICATION_PURPOSE:["medicatie-doel-en-werking"], MEDICATION_SIDE_EFFECTS:["medicatie-bijwerkingen"],
          ANXIETY_PANIC:["angst-en-paniek"], PSYCHOSIS_VOICES:["psychose-en-stemmen"],
          EMOTION_REGULATION:["emoties-reguleren"], SUBSTANCE_USE:["middelen-en-psychische-klachten"],
        };
        const byTopic = topic && topicIds[topic]
          ? list.filter(item => topicIds[topic].includes(item.content.id))
          : [];
        const semanticQuery = [text, topic && !topicIds[topic] ? topic : ""].filter(Boolean).join(" ");
        const matches = searchPsychoeducation(list,semanticQuery);
        const publishedIds = new Set(searchPsychoeducation(list, "").map(item => item.content.id));
        const matchingIds = new Set([...byTopic,...matches].filter(item => publishedIds.has(item.content.id)).map(item => item.content.id));
        if(!matchingIds.size)return false;
        setSuggestedIds([...matchingIds]);setQuery(topic && byTopic.length ? "" : semanticQuery);setFormat("all");setTopic("");setSelectedId(null);setChatSuggestions(true);setNotice("Passende uitleg bij je gesprek");return true;
      }catch{return false;}
    },
  }));
  const publishedById = new Map(searchPsychoeducation(items, "").map(item => [item.content.id, item]));
  const candidateResults = chatSuggestions ? suggestedIds.flatMap(id => { const item = publishedById.get(id); return item ? [item] : []; }) : searchPsychoeducation(items,query);
  const results=candidateResults.filter(i=>(format!=="video"||i.content.video)&&(!topic||i.content.topics.includes(topic)));
  function assign(id:string,checked:boolean){const next=checked?[...new Set([...assignedIds,id])]:assignedIds.filter(v=>v!==id);
    try{localStorage.setItem(storageKey,JSON.stringify(next));setAssignedIds(next);setNotice("Selectie opgeslagen voor deze browser.");}catch{setError("Selectie kon niet worden opgeslagen.");}}
  async function openItem(id:string){await run(async()=>{const list=await refreshPublic();if(!list.some(i=>i.content.id===id)){setSelectedId(null);throw new Error("Deze uitleg is nog niet gepubliceerd of is ingetrokken.");}setSelectedId(id);onOpenDetail(id);root.current?.scrollIntoView({block:"start"});});}
  function download(record:PsychoRecord){const blob=new Blob([JSON.stringify(record.content,null,2)],{type:"application/json"});const url=URL.createObjectURL(blob);const link=document.createElement("a");link.href=url;link.download=`${record.content.id}.json`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  function closeDetail() {
    setSelectedId(null);
    onDetailBack();
  }
  return <section ref={root} hidden={!visible} className={styles.library} aria-label="Psychoeducatiebibliotheek">
    {selected ? <button type="button" className={styles.backButton} onClick={closeDetail}>← Sluiten en terug naar Leren</button> : <button type="button" className={styles.backButton} onClick={onBack}>← Terug</button>}
    <h2>Leren en begrijpen</h2><p><a href="https://verhalenbankpsychiatrie.nl/verhalen-2/" target="_blank" rel="noreferrer">Herstelverhalen lezen</a></p><p>Korte uitleg die je kan helpen begrijpen wat er speelt.</p>
    {error&&<p role="alert" className={styles.error}>{error}</p>}{notice&&<p role="status">{notice}</p>}
    {selected ? <div className={styles.detailView}>
      <p className={styles.detailEyebrow}>{selectedIsAct ? "ACT-MODULE" : "PSYCHOEDUCATIE"}</p>
      <button type="button" className={styles.backButton} onClick={closeDetail}>← Sluiten en terug naar Leren</button>
      <ContentView record={selected} saved={assignedIds.includes(selected.content.id)} onToggleSave={()=>assign(selected.content.id,!assignedIds.includes(selected.content.id))}/>
      {immediateActionActive&&<div className={styles.immediateFooter}><button type="button" className={styles.completeButton} onClick={onCompleteImmediate}>Actie voltooien</button><button type="button" className={styles.deferButton} onClick={onDeferImmediate}>Actie voor later</button></div>}
      <button type="button" className={styles.homeButton} onClick={closeDetail}>Terug naar overzicht van Leren</button>
    </div> : <>
    <label>Waar wil je meer over weten?<input value={query} onChange={e=>{setQuery(e.target.value);setChatSuggestions(false);}} placeholder="Bijvoorbeeld: nee zeggen"/></label>
    <div className={styles.row}><label>Inhoud<select value={format} onChange={e=>setFormat(e.target.value)}><option value="all">Teksten en filmpjes</option><option value="video">Met filmpje</option></select></label>
    <label>Onderwerp<select value={topic} onChange={e=>setTopic(e.target.value)}><option value="">Alle onderwerpen</option>{[...new Set(items.flatMap(i=>i.content.topics))].sort().map(t=><option key={t}>{t}</option>)}</select></label></div>
    <ul className={styles.results}>{results.slice(0,chatSuggestions?3:results.length).map(item=><li key={item.content.id}>
      <button type="button" disabled={busy} onClick={()=>void openItem(item.content.id)}>{item.content.title}</button><p>{item.content.summary}</p><small>{item.content.languageLevel} · {Math.max(1,Math.ceil(item.content.paragraphs.join(" ").split(/\s+/).length/180))} min lezen{item.content.video?" · filmpje beschikbaar":""}</small>
      {authenticated&&<label className={styles.check}><input type="checkbox" checked={assignedIds.includes(item.content.id)} onChange={e=>assign(item.content.id,e.target.checked)}/>Klaarzetten voor deze gebruiker</label>}
    </li>)}</ul>
    {!results.length&&<p>{query?"Geen passende uitleg gevonden. Probeer een ander zoekwoord.":"Er is nog geen gepubliceerde uitleg."}</p>}
    {items.some(i=>assignedIds.includes(i.content.id))&&<div className={styles.savedSection}><h3>Opgeslagen bij Leren</h3>{items.filter(i=>assignedIds.includes(i.content.id)).map(i=><p key={i.content.id}><button type="button" disabled={busy} onClick={()=>void openItem(i.content.id)}>{i.content.title}</button></p>)}</div>}
    </>}
    <details><summary>Voor de professional</summary>
    {!authenticated?<form onSubmit={e=>{e.preventDefault();void run(async()=>{await reloadAdmin();setAuthenticated(true);});}}><label>Beoordelaarscode<input type="password" value={token} onChange={e=>setToken(e.target.value)} autoComplete="off"/></label><button disabled={busy} type="submit">Open beheer</button></form>:<div>
      <button type="button" disabled={busy} onClick={()=>{setAuthenticated(false);setToken("");setAdminItems([]);setReviewId("");setChecks(emptyChecks());}}>Beheer sluiten</button>
      <p>Ingebouwde teksten staan hieronder al klaar voor beoordeling. Importeer eventueel een extra tekst als concept. Een vervangende import trekt de oude publicatie in. Controleer ook de zoekwoorden voordat je publiceert.</p>
      <label>JSON-template importeren<input type="file" accept=".json,application/json" disabled={busy} onChange={e=>{const file=e.target.files?.[0];e.target.value="";if(!file)return;
        void run(async()=>{if(file.size>150000)throw new Error("Gebruik een JSON-bestand tot 150 kB.");const parsed=contentSchema.safeParse(JSON.parse(await file.text()));if(!parsed.success)throw new Error(parsed.error.issues.map(i=>`${i.path.join(".")}: ${i.message}`).join("\n"));const content=parsed.data;const existing=adminItems.find(i=>i.content.id===content.id);
          await api(token,{action:"import",content,expectedRevision:existing?.revision??0});await reloadAdmin();setReviewId(content.id);setNotice("Concept geïmporteerd. Controleer de inhoud.");});}}/></label>
      <button type="button" disabled={busy} onClick={()=>void run(reloadAdmin)}>Vernieuwen</button>
      <label>Te beoordelen item<select disabled={busy} value={reviewId} onChange={e=>{setReviewId(e.target.value);setChecks(emptyChecks());}}><option value="">Kies een item</option>{adminItems.map(i=><option key={i.content.id} value={i.content.id}>{i.content.title} — {i.status==="draft"?"concept":"gepubliceerd"} — revisie {i.revision}</option>)}</select></label>
      {reviewItem&&<div className={styles.reading}><ContentView record={reviewItem}/><p>Auteur: {reviewItem.content.author}</p><p>Zoekwoorden: {reviewItem.content.keywords.join(", ")}</p><p>Voorbeeldvragen: {reviewItem.content.exampleQueries.join("; ")}</p>
        <button type="button" onClick={()=>download(reviewItem)}>Download tekst om te bewerken</button>
        {reviewItem.review&&<p>Beoordeeld door {reviewItem.review.reviewer} op {new Date(reviewItem.review.reviewedAt).toLocaleDateString("nl-NL")}.</p>}
        {(Object.keys(reviewLabels) as Array<keyof typeof reviewLabels>).map(key=><label key={key} className={styles.check}><input disabled={busy} type="checkbox" checked={checks[key]} onChange={e=>setChecks({...checks,[key]:e.target.checked})}/>{reviewLabels[key]}</label>)}
        <div className={styles.row}><button type="button" disabled={busy||!Object.values(checks).every(Boolean)} onClick={()=>void run(async()=>{await api(token,{action:"publish",id:reviewItem.content.id,expectedRevision:reviewItem.revision,checks});await reloadAdmin();setNotice("Gepubliceerd en vindbaar.");})}>Goedkeuren en publiceren</button>
        {reviewItem.status==="published"&&<button type="button" disabled={busy} onClick={()=>void run(async()=>{await api(token,{action:"withdraw",id:reviewItem.content.id,expectedRevision:reviewItem.revision});await reloadAdmin();setNotice("Publicatie ingetrokken.");})}>Publicatie intrekken</button>}</div>
      </div>}
    </div>}</details>
  </section>;
});
export default PsychoeducationLibrary;
