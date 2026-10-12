"use client";

import { useMemo, useState } from "react";
import {
  Activity, ArrowDownRight, ArrowUpRight, BookOpen, Check, ChevronDown,
  CircleHelp, ExternalLink, Eye, EyeOff, Filter, Landmark, LineChart,
  RefreshCw, Search, Settings2, ShieldCheck, SlidersHorizontal, X
} from "lucide-react";
import {
  CartesianGrid, Line, LineChart as RechartsLineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis
} from "recharts";

type Kind = "Toteutunut havainto" | "Ennuste" | "Budjettiesitys" | "Markkinahinta";
type Category = "Kasvu" | "Työmarkkinat" | "Julkinen talous" | "Hinnat ja markkinat" | "Ennusteet ja budjetti";

type Metric = {
  id: string;
  title: string;
  value: string;
  period: string;
  category: Category;
  kind: Kind;
  source: string;
  sourceUrl: string;
  note: string;
  status: "Lähtötieto" | "Rajapinta kytkemättä";
  history: { period: string; value: number }[];
  historyUnit?: string;
};

const metrics: Metric[] = [
  { id:"gdp", title:"BKT:n muutos", value:"+0,3 %", period:"Q2/2026 · q/q, kausitasoitettu", category:"Kasvu", kind:"Toteutunut havainto", source:"Tilastokeskus", sourceUrl:"https://stat.fi/tilasto/kan", note:"Käyttäjän antama lähtöarvo. Varmennettava virallisesta aikasarjasta ennen julkaisemista ajantasaisena lukuna.", status:"Lähtötieto", history:[] },
  { id:"gdp-yoy", title:"BKT:n vuosimuutos", value:"+1,4 %", period:"Q2/2026 · y/y", category:"Kasvu", kind:"Toteutunut havainto", source:"Tilastokeskus", sourceUrl:"https://stat.fi/", note:"Käyttäjän antama lähtöarvo; API-yhteys ei vielä varmista lukua.", status:"Lähtötieto", history:[] },
  { id:"public-spend", title:"Julkiset menot / BKT", value:"57,5 %", period:"2024", category:"Julkinen talous", kind:"Toteutunut havainto", source:"Eurostat / OECD", sourceUrl:"https://ec.europa.eu/eurostat/", note:"Käyttäjän antama vertailuluku. Määritelmä ja vertailuvuosi tarkistettava samasta lähdesarjasta.", status:"Lähtötieto", history:[] },
  { id:"public-jobs", title:"Työllisyys julkisella sektorilla", value:"25,2 %", period:"2023", category:"Työmarkkinat", kind:"Toteutunut havainto", source:"OECD", sourceUrl:"https://www.oecd.org/en/data/indicators/employment-in-government.html", note:"Käyttäjän antama lähtötieto. Kansainvälinen vertailu on riippuvainen julkisen sektorin määritelmästä.", status:"Lähtötieto", history:[] },
  { id:"bond", title:"10 vuoden valtionlainan korko", value:"3,885 %", period:"9.10.2026", category:"Hinnat ja markkinat", kind:"Markkinahinta", source:"Lähde vahvistettava", sourceUrl:"https://www.valtiokonttori.fi/", note:"Käyttäjän antama markkinahavainto. Ei reaaliaikainen eikä automaattisesti varmennettu tässä versiossa.", status:"Lähtötieto", history:[] },
  { id:"brent", title:"Brent-raakaöljy", value:"104,72 $", period:"9.10.2026", category:"Hinnat ja markkinat", kind:"Markkinahinta", source:"Lähde vahvistettava", sourceUrl:"https://www.eia.gov/", note:"Käyttäjän antama markkinahavainto. Kurssin aikaleima, noteeraus ja datalisenssi on vahvistettava.", status:"Lähtötieto", history:[] },
  { id:"unemployment", title:"Työttömyysaste", value:"9,1 %", period:"Elokuu 2026", category:"Työmarkkinat", kind:"Toteutunut havainto", source:"Tilastokeskus", sourceUrl:"https://stat.fi/tilasto/tyti", note:"Käyttäjän antama arvo. Erota kuukausihavainto trendisarjasta.", status:"Lähtötieto", history:[] },
  { id:"unemployment-trend", title:"Työttömyysasteen trendi", value:"10,1 %", period:"Elokuu 2026", category:"Työmarkkinat", kind:"Toteutunut havainto", source:"Tilastokeskus", sourceUrl:"https://stat.fi/tilasto/tyti", note:"Käyttäjän antama trendiarvo; ei varmennettu rajapinnasta.", status:"Lähtötieto", history:[] },
  { id:"unemployed", title:"Työttömät", value:"262 000", period:"Elokuu 2026", category:"Työmarkkinat", kind:"Toteutunut havainto", source:"Tilastokeskus", sourceUrl:"https://stat.fi/tilasto/tyti", note:"Käyttäjän antama lähtöarvo.", status:"Lähtötieto", history:[] },
  { id:"employment-rate", title:"Työllisyysasteen trendi", value:"75,9 %", period:"Viimeisin käyttäjän antama havainto", category:"Työmarkkinat", kind:"Toteutunut havainto", source:"Tilastokeskus", sourceUrl:"https://stat.fi/tilasto/tyti", note:"Havaintojakso ja tarkka määritelmä on vahvistettava ennen automaattista päivitystä.", status:"Lähtötieto", history:[] },
  { id:"cpi", title:"Kuluttajahintainflaatio (KHI)", value:"2,2 %", period:"Elokuu 2026", category:"Hinnat ja markkinat", kind:"Toteutunut havainto", source:"Tilastokeskus", sourceUrl:"https://stat.fi/tilasto/khi", note:"Käyttäjän antama lähtöarvo.", status:"Lähtötieto", history:[] },
  { id:"hicp-aug", title:"YKHI-inflaatio", value:"2,4 %", period:"Elokuu 2026", category:"Hinnat ja markkinat", kind:"Toteutunut havainto", source:"Eurostat", sourceUrl:"https://ec.europa.eu/eurostat/", note:"Käyttäjän antama lähtöarvo.", status:"Lähtötieto", history:[] },
  { id:"hicp-sep", title:"YKHI-inflaatio", value:"Ei saatavilla", period:"Syyskuu 2026 · arvoa ei annettu", category:"Hinnat ja markkinat", kind:"Toteutunut havainto", source:"Eurostat", sourceUrl:"https://ec.europa.eu/eurostat/", note:"Arvoa ei ole tässä versiossa täytetty. Puuttuva tieto jätetään näkyvästi puuttuvaksi.", status:"Rajapinta kytkemättä", history:[] },
  { id:"debt", title:"Julkinen velka (EDP)", value:"259,6 mrd. €", period:"Q2/2026", category:"Julkinen talous", kind:"Toteutunut havainto", source:"Tilastokeskus / Eurostat", sourceUrl:"https://ec.europa.eu/eurostat/", note:"Käyttäjän antama euromäärä. Velkasuhde näkyy omana mittarinaan.", status:"Lähtötieto", history:[] },
  { id:"debt-ratio", title:"Julkinen velka / BKT", value:"90,3 %", period:"Q2/2026", category:"Julkinen talous", kind:"Toteutunut havainto", source:"Tilastokeskus / Eurostat", sourceUrl:"https://ec.europa.eu/eurostat/", note:"Käyttäjän antama lähtöarvo; tarkistettava virallisesta EDP-aikasarjasta.", status:"Lähtötieto", history:[] },
  { id:"deficit", title:"Julkisyhteisöjen alijäämä", value:"0,5 mrd. €", period:"Q2/2026", category:"Julkinen talous", kind:"Toteutunut havainto", source:"Tilastokeskus / Eurostat", sourceUrl:"https://ec.europa.eu/eurostat/", note:"Käyttäjän antama euromäärä. Jakson ja tilastokäsitteen tarkistus tarpeen.", status:"Lähtötieto", history:[] },
  { id:"forecast-gdp-26", title:"BKT-ennuste 2026", value:"+1,6 %", period:"VM:n ennuste · 21.9.2026", category:"Ennusteet ja budjetti", kind:"Ennuste", source:"Valtiovarainministeriö", sourceUrl:"https://vm.fi/ennusteet", note:"Käyttäjän antama ennusteluku, ei toteutunut havainto.", status:"Lähtötieto", history:[] },
  { id:"forecast-gdp-27", title:"BKT-ennuste 2027", value:"+1,8 %", period:"VM:n ennuste · 21.9.2026", category:"Ennusteet ja budjetti", kind:"Ennuste", source:"Valtiovarainministeriö", sourceUrl:"https://vm.fi/ennusteet", note:"Käyttäjän antama ennusteluku, ei toteutunut havainto.", status:"Lähtötieto", history:[] },
  { id:"forecast-deficit-26", title:"Alijäämäennuste 2026", value:"4,2 % BKT:sta", period:"VM:n ennuste · 21.9.2026", category:"Ennusteet ja budjetti", kind:"Ennuste", source:"Valtiovarainministeriö", sourceUrl:"https://vm.fi/ennusteet", note:"Käyttäjän antama ennusteluku.", status:"Lähtötieto", history:[] },
  { id:"forecast-deficit-27", title:"Alijäämäennuste 2027", value:"4,5 % BKT:sta", period:"VM:n ennuste · 21.9.2026", category:"Ennusteet ja budjetti", kind:"Ennuste", source:"Valtiovarainministeriö", sourceUrl:"https://vm.fi/ennusteet", note:"Käyttäjän antama ennusteluku.", status:"Lähtötieto", history:[] },
  { id:"forecast-debt-30", title:"Velkasuhde-ennuste 2030", value:"Lähes 98 %", period:"VM:n ennuste · 21.9.2026", category:"Ennusteet ja budjetti", kind:"Ennuste", source:"Valtiovarainministeriö", sourceUrl:"https://vm.fi/ennusteet", note:"Suuntaa kuvaava ennuste. Ei toteutunut havainto.", status:"Lähtötieto", history:[] },
  { id:"budget-spending", title:"Budjettiesityksen menot", value:"92,5 mrd. €", period:"Vuoden 2027 budjettiesitys", category:"Ennusteet ja budjetti", kind:"Budjettiesitys", source:"Valtiovarainministeriö", sourceUrl:"https://budjetti.vm.fi/", note:"Käyttäjän antama budjettiesityksen luku, ei toteutunut meno.", status:"Lähtötieto", history:[] },
  { id:"budget-deficit", title:"Budjettiesityksen alijäämä", value:"12,4 mrd. €", period:"Vuoden 2027 budjettiesitys", category:"Ennusteet ja budjetti", kind:"Budjettiesitys", source:"Valtiovarainministeriö", sourceUrl:"https://budjetti.vm.fi/", note:"Käyttäjän antama budjettiesityksen luku.", status:"Lähtötieto", history:[] },
  { id:"interest-cost", title:"Valtion korkomenot", value:"4,3 mrd. €", period:"Vuoden 2027 budjettiesitys", category:"Ennusteet ja budjetti", kind:"Budjettiesitys", source:"Valtiovarainministeriö", sourceUrl:"https://budjetti.vm.fi/", note:"Käyttäjän antama budjettiesityksen arvio.", status:"Lähtötieto", history:[] },
  { id:"borrowing-net", title:"Valtion nettolainanotto", value:"13,25 mrd. €", period:"2026 · viimeisin LTA käyttäjän mukaan", category:"Julkinen talous", kind:"Toteutunut havainto", source:"Valtiokonttori", sourceUrl:"https://www.valtiokonttori.fi/", note:"Käyttäjän antama luku; tarkista lisätalousarvion versio ja päivämäärä.", status:"Lähtötieto", history:[] },
  { id:"borrowing-gross", title:"Valtion bruttolainanotto", value:"44,40 mrd. €", period:"2026 · viimeisin LTA käyttäjän mukaan", category:"Julkinen talous", kind:"Toteutunut havainto", source:"Valtiokonttori", sourceUrl:"https://www.valtiokonttori.fi/", note:"Käyttäjän antama luku; tarkista lisätalousarvion versio ja päivämäärä.", status:"Lähtötieto", history:[] }
];

const categories: ("Kaikki" | Category)[] = ["Kaikki", "Kasvu", "Työmarkkinat", "Julkinen talous", "Hinnat ja markkinat", "Ennusteet ja budjetti"];
const kindClass: Record<Kind, string> = {
  "Toteutunut havainto": "actual", "Ennuste": "forecast", "Budjettiesitys": "budget", "Markkinahinta": "market"
};

function MiniChart({ points }: { points: { period: string; value: number }[] }) {
  if (points.length < 2) {
    return <div className="chart-empty"><LineChart size={17}/><span>Historiakuvaaja tulee näkyviin, kun varmennettu aikasarja on kytketty.</span></div>;
  }
  return <div className="chart-wrap"><ResponsiveContainer width="100%" height={100}>
    <RechartsLineChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -24 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e8e6e0"/>
      <XAxis dataKey="period" tick={{ fontSize: 10, fill: "#77766f" }} axisLine={false} tickLine={false}/>
      <YAxis tick={{ fontSize: 10, fill: "#77766f" }} axisLine={false} tickLine={false} width={34}/>
      <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e5e2db", fontSize: 12 }}/>
      <Line type="monotone" dataKey="value" stroke="#226b58" strokeWidth={2.4} dot={false} activeDot={{ r: 4 }}/>
    </RechartsLineChart>
  </ResponsiveContainer></div>;
}

export default function Home() {
  const [selected, setSelected] = useState<string[]>(["gdp", "unemployment", "debt-ratio", "bond", "cpi", "forecast-gdp-26", "interest-cost", "public-spend"]);
  const [category, setCategory] = useState<(typeof categories)[number]>("Kaikki");
  const [search, setSearch] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const [kindFilter, setKindFilter] = useState("Kaikki tyypit");

  const filtered = useMemo(() => metrics.filter(m =>
    (category === "Kaikki" || m.category === category) &&
    (kindFilter === "Kaikki tyypit" || m.kind === kindFilter) &&
    `${m.title} ${m.category} ${m.source}`.toLowerCase().includes(search.toLowerCase())
  ), [category, search, kindFilter]);

  const visibleMetrics = useMemo(() => {
    const chosen = metrics.filter(m => selected.includes(m.id));
    return showAll ? chosen : chosen.slice(0, 12);
  }, [selected, showAll]);

  function toggleMetric(id: string) {
    setSelected(current => current.includes(id) ? current.filter(x => x !== id) : [...current, id]);
  }

  return <main>
    <header className="topbar">
      <a className="brand" href="#" aria-label="Suomen talousvahti etusivu">
        <span className="brand-mark"><Activity size={22}/></span>
        <span><strong>Suomen talousvahti</strong><small>Talouden kokonaiskuva yhdellä sivulla</small></span>
      </a>
      <nav><a href="#mittarit">Mittaristo</a><a href="#lahteet">Tietolähteet</a><a href="#periaatteet">Tietojen tila</a></nav>
      <button className="button button-outline header-button" onClick={() => setShowPicker(true)}><SlidersHorizontal size={16}/> Muokkaa mittareita</button>
    </header>

    <section className="hero">
      <div className="hero-copy">
        <div className="eyebrow"><span className="eyebrow-dot"/> SUOMEN TALOUS · SEURANTANÄKYMÄ</div>
        <h1>Miltä Suomen talous<br/><em>näyttää juuri nyt?</em></h1>
        <p>Keskeiset talousluvut, julkinen talous ja markkinat samassa näkymässä. Jokaisella luvulla on lähde ja havaintojakso.</p>
        <div className="hero-note"><ShieldCheck size={17}/><span>Ei tekaistuja reaaliaikalukuja. Varmennetut aikasarjat näytetään, kun lähde on kytketty.</span></div>
      </div>
      <aside className="hero-panel">
        <div className="panel-head"><span>MITTARISTON TILA</span><span className="status-pill"><span/> Ensimmäinen versio</span></div>
        <div className="panel-stat"><strong>{selected.length}</strong><span>valittua mittaria</span></div>
        <div className="panel-rule"/>
        <div className="panel-row"><span>Automaattiset dataliitännät</span><strong>Ei vielä kytketty</strong></div>
        <div className="panel-row"><span>Varmennetut historiakuvaajat</span><strong>0</strong></div>
        <div className="panel-row"><span>Viimeisin tarkistus</span><strong>Ei saatavilla</strong></div>
        <p className="panel-foot">Lähtöarvot on syötetty käyttäjän toimittamasta listasta. Ne eivät ole automaattisesti vahvistettuja nykyarvoja.</p>
      </aside>
    </section>

    <section className="ticker">
      <div><span className="ticker-label">TOTEUMA</span><strong>Tilastot</strong><small>Julkaisurytmin mukaan</small></div>
      <div><span className="ticker-label forecast-label">ENNUSTE</span><strong>VM:n arviot</strong><small>Erotettu toteumista</small></div>
      <div><span className="ticker-label budget-label">BUDJETTI</span><strong>Esitykset</strong><small>Ei toteutuneita menoja</small></div>
      <div><span className="ticker-label market-label">MARKKINAT</span><strong>Korko ja öljy</strong><small>Ajankohta aina näkyviin</small></div>
    </section>

    <section className="dashboard-section" id="mittarit">
      <div className="section-heading">
        <div><div className="eyebrow">OMA NÄKYMÄ</div><h2>Valitut mittarit</h2><p>Valitse vain luvut, joita haluat seurata. Muut löytyvät mittarivalitsimesta.</p></div>
        <button className="button button-primary" onClick={() => setShowPicker(true)}><Settings2 size={16}/> Valitse mittarit</button>
      </div>
      <div className="filter-row">
        <div className="category-tabs">
          {categories.map(c => <button key={c} className={category === c ? "tab active" : "tab"} onClick={() => setCategory(c)}>{c}</button>)}
        </div>
        <label className="select-wrap"><Filter size={15}/><select value={kindFilter} onChange={e => setKindFilter(e.target.value)}><option>Kaikki tyypit</option><option>Toteutunut havainto</option><option>Ennuste</option><option>Budjettiesitys</option><option>Markkinahinta</option></select><ChevronDown size={14}/></label>
      </div>

      <div className="metric-grid">
        {visibleMetrics.map((m, i) => <article className="metric-card" key={m.id}>
          <div className="metric-top"><span className="metric-category">{m.category}</span><button className="icon-button" title="Poista omasta näkymästä" onClick={() => toggleMetric(m.id)}><EyeOff size={15}/></button></div>
          <h3>{m.title}</h3>
          <div className="metric-value">{m.value}</div>
          <div className="metric-period">{m.period}</div>
          <span className={`kind-pill ${kindClass[m.kind]}`}>{m.kind}</span>
          <MiniChart points={m.history}/>
          <div className="metric-footer">
            <div><span className="source-label">LÄHDE</span><a href={m.sourceUrl} target="_blank" rel="noreferrer">{m.source} <ExternalLink size={11}/></a></div>
            <span className={`data-status ${m.status === "Lähtötieto" ? "seed" : "missing"}`}>{m.status}</span>
          </div>
          <details className="metric-details"><summary>Lisätiedot <ChevronDown size={13}/></summary><p>{m.note}</p></details>
        </article>)}
      </div>
      {visibleMetrics.length === 0 && <div className="empty-state"><CircleHelp/><strong>Ei valittuja mittareita tässä näkymässä</strong><p>Valitse mittareita tai vaihda suodatusta.</p><button className="button button-primary" onClick={() => setShowPicker(true)}>Avaa mittarivalitsin</button></div>}
      {selected.length > 12 && <button className="show-more" onClick={() => setShowAll(!showAll)}>{showAll ? "Näytä vähemmän" : `Näytä kaikki valitut (${selected.length})`}</button>}
    </section>

    <section className="source-section" id="lahteet">
      <div className="section-heading">
        <div><div className="eyebrow">LÄPINÄKYVYYS</div><h2>Mistä luvut tulevat?</h2><p>Ensisijaisia lähteitä ovat viralliset tilastot ja alkuperäiset julkaisut.</p></div>
      </div>
      <div className="source-grid">
        <a className="source-card" href="https://stat.fi/" target="_blank" rel="noreferrer"><span className="source-icon"><BookOpen/></span><strong>Tilastokeskus</strong><span>BKT, työmarkkinat ja kuluttajahinnat</span><ExternalLink size={14}/></a>
        <a className="source-card" href="https://ec.europa.eu/eurostat/" target="_blank" rel="noreferrer"><span className="source-icon"><Landmark/></span><strong>Eurostat</strong><span>Julkinen velka, alijäämä ja EU-vertailut</span><ExternalLink size={14}/></a>
        <a className="source-card" href="https://vm.fi/" target="_blank" rel="noreferrer"><span className="source-icon"><LineChart/></span><strong>Valtiovarainministeriö</strong><span>Ennusteet ja talousarviot</span><ExternalLink size={14}/></a>
        <a className="source-card" href="https://www.valtiokonttori.fi/" target="_blank" rel="noreferrer"><span className="source-icon"><Activity/></span><strong>Valtiokonttori</strong><span>Valtion lainanotto ja taloustiedot</span><ExternalLink size={14}/></a>
        <a className="source-card" href="https://www.oecd.org/en/data.html" target="_blank" rel="noreferrer"><span className="source-icon"><BookOpen/></span><strong>OECD</strong><span>Julkisen sektorin ja kansainväliset vertailut</span><ExternalLink size={14}/></a>
      </div>
    </section>

    <section className="principles" id="periaatteet">
      <div className="principle-icon"><ShieldCheck size={23}/></div>
      <div><h2>Tietojen luotettavuus ennen näyttävyyttä</h2><p>Tämä ensimmäinen versio ei hae vielä arvoja automaattisesti. Käyttäjän antamat lähtöarvot on merkitty erikseen, ja historiakuvaajat pysyvät tyhjinä, kunnes oikeat aikasarjat on kytketty. Näin puuttuva data ei muutu vahingossa keksityksi tiedoksi.</p></div>
    </section>

    <footer><a className="footer-brand" href="#"><Activity size={17}/> Suomen talousvahti</a><span>Ensimmäinen versio · Lähteet näkyvissä · Ei sijoitusneuvontaa</span><a href="https://pxdata.stat.fi/api1.html" target="_blank" rel="noreferrer">Tilastokeskuksen PxWeb API <ExternalLink size={12}/></a></footer>

    {showPicker && <div className="modal-backdrop" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) setShowPicker(false); }}>
      <section className="picker-modal" role="dialog" aria-modal="true" aria-labelledby="picker-title">
        <div className="modal-header"><div><div className="eyebrow">OMA NÄKYMÄ</div><h2 id="picker-title">Valitse seurattavat mittarit</h2><p>{selected.length} mittaria valittuna</p></div><button className="icon-button close-button" onClick={() => setShowPicker(false)} aria-label="Sulje"><X/></button></div>
        <div className="picker-tools"><label className="search-box"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Hae mittaria tai lähdettä"/></label><button className="text-button" onClick={() => setSelected(metrics.map(m => m.id))}>Valitse kaikki</button><button className="text-button" onClick={() => setSelected([])}>Tyhjennä</button></div>
        <div className="picker-categories">{categories.map(c => <button key={c} className={category === c ? "tab active" : "tab"} onClick={() => setCategory(c)}>{c}</button>)}</div>
        <div className="picker-list">{filtered.map(m => <label className="picker-item" key={m.id}><input type="checkbox" checked={selected.includes(m.id)} onChange={() => toggleMetric(m.id)}/><span className="checkmark"><Check size={13}/></span><span className="picker-info"><strong>{m.title}</strong><small>{m.category} · {m.period}</small></span><span className={`kind-pill ${kindClass[m.kind]}`}>{m.kind}</span><span className="picker-value">{m.value}</span></label>)}</div>
        <div className="modal-footer"><span>{selected.length} mittaria valittuna</span><button className="button button-primary" onClick={() => { setShowPicker(false); setShowAll(true); }}>Valmis <Check size={16}/></button></div>
      </section>
    </div>}
  </main>;
}
