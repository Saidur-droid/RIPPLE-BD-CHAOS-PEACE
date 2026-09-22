import React, {useEffect,useMemo,useState} from 'react';
import ReactDOM from 'react-dom/client';
import {ArrowRight,CheckCircle2,Eye,Gauge,Heart,Info,Pause,Play,RefreshCw,RotateCcw,Search,Share2,Shield,ShieldCheck,Sparkles,Users,Zap} from 'lucide-react';
import './styles.css';

type Metrics={reach:number;hostility:number;safety:number;trust:number};
type Choice={id:string;label:string;helper:string;kind:'risk'|'safe'|'neutral'|'support';delta:Partial<Metrics>;score:number;title:string;body:string};
type Scenario={id:string;title:string;tag:string;intro:string;post:string;prompt:string;choices:Choice[];peace:Choice[];xray:{t:string;s:string;b:string}[];shield?:string[]};

const base:Metrics={reach:48,hostility:34,safety:70,trust:66};
const scenarios:Scenario[]=[
{id:'clip',title:'The Cropped Clip',tag:'Misinformation · Interfaith tension',intro:'A dramatic clip is moving fast through Nodi. The caption is certain. The source is not.',post:'“Everyone needs to see this NOW.” A 9-second cropped clip claims a local religious group attacked a community event. No original upload or location is shown.',prompt:'Your friend sends this to a group chat. What do you do first?',choices:[
{id:'share',label:'Share now',helper:'Pass it on before it disappears',kind:'risk',delta:{reach:28,hostility:24,safety:-17,trust:-20},score:8,title:'Speed beats context',body:'The clip reaches more feeds and comments shift from the event to broad claims about an entire community.'},
{id:'comment',label:'Post an angry comment',helper:'Call the group out publicly',kind:'risk',delta:{reach:14,hostility:30,safety:-19,trust:-23},score:12,title:'The frame hardens',body:'Your comment becomes social proof and replies repeat the same identity framing without checking the clip.'},
{id:'verify',label:'Verify the source',helper:'Pause and look for original context',kind:'safe',delta:{reach:-6,hostility:-8,safety:8,trust:12},score:82,title:'The spread slows',body:'You notice the clip begins mid-scene and the source remains unclear, so you do not amplify it.'},
{id:'ignore',label:'Ignore it',helper:'Do not interact',kind:'neutral',delta:{reach:2,hostility:5,safety:-2,trust:-3},score:38,title:'You do not add fuel',body:'You avoid amplifying the post, but the misleading framing continues unchecked in your group.'}],
peace:[
{id:'trace',label:'Trace the original source',helper:'Check full clip, date and uploader',kind:'safe',delta:{reach:-14,hostility:-13,safety:14,trust:20},score:96,title:'Context becomes visible',body:'You cannot verify the original claim. You stop the chain and keep the uncertainty explicit.'},
{id:'context',label:'Add calm context',helper:'Flag uncertainty without repeating the accusation',kind:'support',delta:{reach:-8,hostility:-18,safety:12,trust:18},score:90,title:'The temperature drops',body:'People see a clear reminder that the source is unverified and group-wide conclusions are unsafe.'},
{id:'pause',label:'Pause and do not amplify',helper:'Wait for reliable context',kind:'safe',delta:{reach:-10,hostility:-8,safety:9,trust:12},score:78,title:'One less acceleration point',body:'The clip does not gain another share through you.'}],
xray:[
{t:'Emotional urgency',s:'“NOW”',b:'Urgency can push people to act before they verify.'},
{t:'Missing source',s:'No original upload',b:'A repost is not a source. Look for the earliest verifiable version.'},
{t:'Cropped context',s:'9 seconds only',b:'Short clips can hide what happened immediately before or after.'},
{t:'Social proof',s:'713 shares',b:'Popularity can feel like evidence, but engagement does not verify a claim.'},
{t:'Identity framing',s:'Whole-group blame',b:'A claim about an event can become a claim about an entire community.'}]},
{id:'meme',title:'The Viral Meme',tag:'Cyberbullying · Gendered harassment',intro:'A “joke” about a fictional student is becoming a pile-on. The crowd keeps making it harsher.',post:'A meme mocks fictional student Rima after a class presentation. Replies turn sexualized and a screenshot hints that hostile DMs have started.',prompt:'You know Rima casually. What is your first move?',choices:[
{id:'laugh',label:'React with a laugh',helper:'It is “just a meme”',kind:'risk',delta:{reach:15,hostility:21,safety:-18,trust:-12},score:10,title:'The crowd reads approval',body:'Another reaction adds social proof and lowers the social cost for others to join.'},
{id:'reshare',label:'Re-share it',helper:'Send it to another chat',kind:'risk',delta:{reach:26,hostility:24,safety:-23,trust:-17},score:4,title:'The target loses control of reach',body:'The meme escapes its original context and more strangers join in.'},
{id:'ignore',label:'Keep scrolling',helper:'Stay out of it',kind:'neutral',delta:{reach:4,hostility:8,safety:-5,trust:-4},score:42,title:'You avoid adding harm',body:'The pile-on continues, but you do not make it worse.'},
{id:'check',label:'Check on Rima privately',helper:'Ask what support she wants',kind:'support',delta:{reach:-2,hostility:-5,safety:14,trust:12},score:88,title:'Support becomes target-led',body:'You ask what she wants and avoid recirculating the meme.'}],
peace:[
{id:'support',label:'Support + report',helper:'Check in, preserve only needed evidence, report',kind:'support',delta:{reach:-8,hostility:-14,safety:20,trust:17},score:98,title:'The response follows the target',body:'You support without turning the abuse into more content.'},
{id:'interrupt',label:'Interrupt the pile-on calmly',helper:'Set a boundary without attacking back',kind:'safe',delta:{reach:-5,hostility:-19,safety:14,trust:18},score:92,title:'A social norm becomes visible',body:'A calm response refuses the joke frame and lowers the temperature.'},
{id:'private',label:'Offer private support first',helper:'Ask what she wants before public action',kind:'support',delta:{reach:-2,hostility:-7,safety:18,trust:14},score:91,title:'Agency stays with the target',body:'Rima can decide what kind of support she wants.'}],
xray:[
{t:'“Just joking” shield',s:'Humor frame',b:'Humor can disguise social punishment.'},
{t:'Pile-on effect',s:'Crowd repetition',b:'Each small reaction lowers the cost for the next person to join.'},
{t:'Target displacement',s:'Talk about, not with',b:'Safe support restores agency to the person targeted.'},
{t:'Evidence vs recirculation',s:'Screenshot risk',b:'Preserve only what is needed. Do not spread harmful material as “evidence.”'},
{t:'Escalation cue',s:'Hostile DMs',b:'Credible threats may require trusted or official support.'}],
shield:['Recognize — name the behavior without blaming the target.','Support — check in privately and ask what the person wants.','Preserve — save only necessary evidence without recirculation.','Report — use the relevant platform or community pathway.','Escalate — credible threats may require trusted or official support.']},
{id:'voice',title:'The Missing Voice',tag:'Source diversity · Inclusion',intro:'A sweeping claim about a fictional minority community is everywhere. Everyone is speaking about them. Nobody from the community is quoted.',post:'“They do not want to integrate with the rest of us.” The post cites “people nearby” but gives no direct source, document or first-person voice.',prompt:'You are about to join the conversation. What do you do?',choices:[
{id:'share',label:'Share the outsider take',helper:'It sounds plausible',kind:'risk',delta:{reach:18,hostility:15,safety:-11,trust:-18},score:18,title:'The claim becomes the default story',body:'Repetition makes an unsupported interpretation feel settled.'},
{id:'stereo',label:'Add a stereotype',helper:'Generalize from what you heard',kind:'risk',delta:{reach:12,hostility:26,safety:-18,trust:-25},score:4,title:'A broad label replaces people',body:'The thread shifts from one claim to a fixed identity judgment.'},
{id:'source',label:'Seek a primary source',helper:'Look for direct, relevant context',kind:'safe',delta:{reach:-4,hostility:-10,safety:10,trust:17},score:86,title:'The information gap becomes visible',body:'You notice the post has no direct evidence and no first-person source.'},
{id:'pause',label:'Pause before commenting',helper:'Do not speak beyond the evidence',kind:'neutral',delta:{reach:-3,hostility:-4,safety:5,trust:7},score:60,title:'You leave room for uncertainty',body:'You avoid adding another unsupported claim while looking for better context.'}],
peace:[
{id:'first',label:'Find relevant first-person context',helper:'Use a direct source without tokenizing',kind:'support',delta:{reach:-7,hostility:-12,safety:13,trust:22},score:97,title:'The frame widens',body:'Direct context enters without making one person represent an entire community.'},
{id:'label',label:'Separate claim from evidence',helper:'State what is known, unknown and missing',kind:'safe',delta:{reach:-5,hostility:-14,safety:11,trust:20},score:95,title:'Certainty becomes accountable',body:'The thread can now distinguish interpretation from evidence.'},
{id:'amplify',label:'Amplify a credible primary source',helper:'Add context without rewriting it',kind:'support',delta:{reach:-2,hostility:-10,safety:12,trust:21},score:93,title:'The missing voice enters directly',body:'The conversation now includes direct context rather than only outsider interpretation.'}],
xray:[
{t:'Voice absence',s:'No first-person source',b:'A conversation can look diverse while excluding the people most affected.'},
{t:'Vague authority',s:'“People nearby say…”',b:'Vague attribution creates confidence without accountability.'},
{t:'Stereotype shortcut',s:'“They are…”',b:'Whole-group language turns a claim into identity judgment.'},
{t:'Tokenization risk',s:'One voice ≠ everyone',b:'One source should not become a spokesperson for a whole community.'},
{t:'Evidence boundary',s:'Known / unknown',b:'Keep the border between evidence, interpretation and uncertainty visible.'}]}
];

const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const metrics=(c:Choice):Metrics=>({reach:clamp(base.reach+(c.delta.reach||0)),hostility:clamp(base.hostility+(c.delta.hostility||0)),safety:clamp(base.safety+(c.delta.safety||0)),trust:clamp(base.trust+(c.delta.trust||0))});

function App(){
 const [screen,setScreen]=useState('landing');
 const [i,setI]=useState(0);
 const [b,setB]=useState<Choice|null>(null);
 const [p,setP]=useState<Choice|null>(null);
 const [results,setResults]=useState<number[]>(()=>JSON.parse(localStorage.getItem('ripple-results')||'[]'));
 const [seen,setSeen]=useState<number[]>([]);
 const [shield,setShield]=useState(0);
 const s=scenarios[i]!;

 useEffect(()=>{
  localStorage.setItem('ripple-results',JSON.stringify(results));
  window.scrollTo({top:0,behavior:'smooth'});
 },[results,screen,i]);

 const next=()=>{
  if(i===2){setScreen('results')}
  else{
   setI(i+1);setB(null);setP(null);setSeen([]);setShield(0);setScreen('intro');
  }
 };
 const save=()=>{
  if(!b||!p)return;
  const r=[...results];
  r[i]=Math.round((b.score+p.score)/2);
  setResults(r);
  setScreen('complete');
 };
 const mm=(c:Choice)=>metrics(c);
 const reset=()=>{
  localStorage.removeItem('ripple-results');
  setResults([]);setI(0);setB(null);setP(null);setSeen([]);setShield(0);setScreen('notice');
 };
 const score=Math.round((results.reduce((a,n)=>a+(n||0),0)/Math.max(1,results.length)));
 const dimensions=[
  {label:'Verify before sharing',value:results[0]||0},
  {label:'Manipulation detection',value:Math.round(((results[0]||0)+(results[2]||0))/2)},
  {label:'Bystander response',value:results[1]||0},
  {label:'Target support',value:Math.round(((results[1]||0)+(results[2]||0))/2)},
  {label:'De-escalation',value:Math.round(((results[0]||0)+(results[1]||0)+(results[2]||0))/3)}
 ];
 const stageLabel=screen==='mirror'?'MIRROR':screen==='ripple'||screen==='reflect'?'RIPPLE':screen==='rewind'?'REWIND':screen==='peace'?'PEACE':screen==='xray'||screen==='shield'?'TOOLS':'LEARN';
 const resume=()=>{
  if(results.length>=3){setScreen('results');return}
  setI(results.length);setB(null);setP(null);setSeen([]);setShield(0);setScreen('intro');
 };

 return <div className="app-v2">
  {screen!=='landing'&&screen!=='notice'&&
   <header className="product-header">
    <button className="brand-button" onClick={()=>setScreen('landing')} aria-label="Return to home">
     <span className="brand-mark">R</span>
     <span className="brand-copy"><b>RIPPLE BD</b><small>decision practice</small></span>
    </button>
    <div className="header-progress" aria-label="Scenario progress">
     {scenarios.map((x,n)=>
      <div key={x.id} className={'progress-item '+(n<i?'is-done':n===i?'is-active':'')}>
       <span>{n<i?'✓':'0'+(n+1)}</span>
       <i/>
      </div>
     )}
    </div>
    <div className="header-stage">
     <small>{stageLabel}</small>
     <button className="exit-button" onClick={()=>setScreen('landing')}>Exit</button>
    </div>
   </header>
  }

  {screen==='landing'&&
   <main className="landing-v2">
    <nav className="nav-v2">
     <div className="brand-lockup">
      <span className="brand-mark">R</span>
      <div><b>RIPPLE BD</b><small>CHAOS → PEACE</small></div>
     </div>
     <div className="nav-meta">
      <span>Prototype v1</span>
      <span className="status-dot"><i/> Live</span>
     </div>
    </nav>

    <section className="hero-v2">
     <div className="hero-copy">
      <span className="kicker">Decision practice for digital life</span>
      <h1>Every click has a <span>consequence.</span></h1>
      <p>RIPPLE turns online safety from advice into practice. Make a choice, see what it changes, rewind the moment, then try again with better information.</p>
      <div className="hero-actions">
       <button className="btn-primary" onClick={reset}>Start the simulation <ArrowRight/></button>
       {results.length>0&&<button className="btn-secondary" onClick={resume}>Continue session</button>}
      </div>
      <div className="proof-row">
       <span><Gauge/> 6–8 min</span>
       <span><ShieldCheck/> No login</span>
       <span><Pause/> Fictional scenarios</span>
      </div>
     </div>

     <div className="product-preview" aria-label="Product preview">
      <div className="preview-topbar">
       <div><span className="mini-avatar">N</span><b>Nodi / community feed</b></div>
       <span className="simulation-label">SIMULATION</span>
      </div>
      <div className="preview-post">
       <small>TRENDING · 2 MIN AGO</small>
       <p>“Everyone needs to see this now.”</p>
       <div className="preview-media"><Play/></div>
       <div className="preview-stats"><span>1.8k reactions</span><span>713 shares</span></div>
      </div>
      <div className="preview-decision">
       <small>Before you act</small>
       <b>What would you do first?</b>
       <div><span>Share it</span><span>Check the source</span></div>
      </div>
      <div className="preview-note"><span>REWIND</span><p>The same moment becomes a second chance to practise.</p></div>
     </div>
    </section>

    <section className="journey-strip">
     {[
      ['01','MIRROR','Choose naturally'],
      ['02','RIPPLE','See what changes'],
      ['03','REWIND','Return to the moment'],
      ['04','PEACE','Practise a safer path'],
      ['05','REFLECT','Leave with a reflex']
     ].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><small>{x[2]}</small></div>)}
    </section>
   </main>
  }

  {screen==='notice'&&
   <main className="notice-page">
    <button className="back-link" onClick={()=>setScreen('landing')}>← Back</button>
    <section className="notice-card">
     <div className="notice-index">Before you enter</div>
     <h2>This is a practice space, not a real incident.</h2>
     <p>Every person, post and community in Nodi is fictional. You will never be asked to disclose a personal experience, and your choices stay on this device.</p>
     <div className="principles-grid">
      <article><span>01</span><b>Fictional by design</b><p>No real person, community or political actor is accused.</p></article>
      <article><span>02</span><b>Private by default</b><p>No account, identity or sensitive story submission.</p></article>
      <article><span>03</span><b>Learning, not diagnosis</b><p>Scores describe this session only—not your character or psychology.</p></article>
     </div>
     <div className="notice-footer">
      <p>Simulation indicators are educational—not real-world causal estimates.</p>
      <button className="btn-primary" onClick={()=>setScreen('intro')}>Enter Nodi <ArrowRight/></button>
     </div>
    </section>
   </main>
  }

  {screen==='intro'&&
   <main className="experience-page intro-layout">
    <section className="scenario-intro">
     <span className="scenario-number">0{i+1}</span>
     <span className="topic-chip">{s.tag}</span>
     <h1>{s.title}</h1>
     <p>{s.intro}</p>
     <button className="btn-primary" onClick={()=>setScreen('mirror')}>Open the post <ArrowRight/></button>
    </section>
    <aside className="context-panel">
     <span className="context-label">NODI BRIEF</span>
     <h3>A fictional community of 10,000 people.</h3>
     <p>Your choices change the simulation. There is no timer and no “correct answer” shown before you decide.</p>
     <div className="context-list">
      <span><b>01</b> Choose what feels natural.</span>
      <span><b>02</b> Watch the consequence unfold.</span>
      <span><b>03</b> Rewind and practise again.</span>
     </div>
    </aside>
   </main>
  }

  {screen==='mirror'&&
   <main className="experience-page decision-layout">
    <section className="decision-panel">
     <span className="stage-chip">MIRROR · first instinct</span>
     <h2>{s.prompt}</h2>
     <p className="section-copy">Choose what you would most naturally do. We intentionally do not mark any option as safe or risky yet.</p>
     <div className="decision-list">
      {s.choices.map((c,n)=>
       <button key={c.id} className="decision-option" onClick={()=>{setB(c);setScreen('ripple')}}>
        <span className="choice-index">0{n+1}</span>
        <span className="choice-copy"><b>{c.label}</b><small>{c.helper}</small></span>
        <ArrowRight/>
       </button>
      )}
     </div>
    </section>

    <article className="feed-card">
     <div className="feed-card-head">
      <div><span className="mini-avatar">N</span><div><b>Nodi Feed</b><small>@nodi_live · now</small></div></div>
      <span className="simulation-label">SIMULATION</span>
     </div>
     <p className="feed-text">{s.post}</p>
     <div className="feed-media"><Play/></div>
     <div className="feed-actions">
      <span><Heart/>1.8k</span><span><Users/>426</span><span><Share2/>713</span>
     </div>
    </article>
   </main>
  }

  {screen==='ripple'&&b&&
   <main className="experience-page ripple-page">
    <section className="ripple-heading">
     <div>
      <span className="stage-chip">RIPPLE · consequence map</span>
      <h2>One action can change more than one thing.</h2>
     </div>
     <div className="choice-recap"><small>You chose</small><b>{b.label}</b></div>
    </section>

    <section className="ripple-grid">
     <article className="consequence-story">
      <span className="story-step">01</span><div><small>YOUR CLICK</small><h3>{b.label}</h3><p>{b.helper}</p></div>
      <span className="story-line"/>
      <span className="story-step">02</span><div><small>NETWORK EFFECT</small><h3>{b.title}</h3><p>The system changes reach, hostility, safety and trust in response to the decision.</p></div>
      <span className="story-line"/>
      <span className="story-step human-step"><Heart/></span><div><small>HUMAN CONSEQUENCE</small><h3>What people experience</h3><p>{b.body}</p></div>
     </article>

     <article className="metrics-card">
      <div className="metrics-head"><div><small>SIMULATION INDICATORS</small><b>Before → after</b></div><Info/></div>
      {(['reach','hostility','safety','trust'] as const).map(k=>{
       const v=mm(b)[k],d=v-base[k],good=(k==='safety'||k==='trust')?d>=0:d<=0;
       return <div className="metric-row-v2" key={k}>
        <div><span>{k}</span><strong className={good?'delta-good':'delta-bad'}>{d>=0?'+':''}{d}</strong></div>
        <div className="metric-track"><i style={{width:v+'%'}} className={good?'track-good':'track-bad'}/></div>
        <small>{base[k]} → {v}</small>
       </div>
      })}
      <p className="metrics-disclaimer">These numbers illustrate the model’s direction—not measured real-world effect sizes.</p>
     </article>
    </section>
    <button className="btn-primary" onClick={()=>setScreen('reflect')}>Continue to reflection <ArrowRight/></button>
   </main>
  }

  {screen==='reflect'&&b&&
   <main className="reflection-page">
    <section className="reflection-card">
     <span className="stage-chip">REFLECT · before you retry</span>
     <h2>What changed because of that first click?</h2>
     <blockquote>{b.body}</blockquote>
     <div className="reflection-prompt">
      <small>ONE QUESTION</small>
      <p>If you could return to the exact same moment, what would you change first?</p>
     </div>
     <button className="btn-dark" onClick={()=>setScreen('rewind')}>Rewind the moment <RotateCcw/></button>
    </section>
   </main>
  }

  {screen==='rewind'&&
   <main className="rewind-page">
    <div className="rewind-rule"><span>THE SAME MOMENT</span><i/><span>A DIFFERENT CHOICE</span></div>
    <section className="rewind-copy">
     <span className="rewind-symbol"><RotateCcw/></span>
     <small>REWIND</small>
     <h1>Go back without forgetting what happened.</h1>
     <p>You have seen the consequence. Now return to the decision with more context and practise a safer response.</p>
     <button className="btn-light" onClick={()=>setScreen('peace')}>Return to the choice <ArrowRight/></button>
    </section>
   </main>
  }

  {screen==='peace'&&
   <main className="experience-page peace-page">
    <section className="peace-heading">
     <span className="stage-chip">PEACE · second attempt</span>
     <h2>Same moment. Better information.</h2>
     <p className="section-copy">Choose the response you would practise now. Safer choices can still involve trade-offs.</p>
    </section>
    <div className="peace-options">
     {s.peace.map((c,n)=>
      <button key={c.id} className="peace-option" onClick={()=>{setP(c);setSeen([]);setScreen('xray')}}>
       <span>0{n+1}</span><div><b>{c.label}</b><small>{c.helper}</small></div><ArrowRight/>
      </button>
     )}
    </div>
   </main>
  }

  {screen==='xray'&&
   <main className="experience-page xray-page">
    <div className="xray-heading">
     <div><span className="stage-chip">MANIPULATION X-RAY</span><h2>Notice what the post was doing to your attention.</h2></div>
     <p>Open at least one signal. The goal is not suspicion—it is knowing when to slow down.</p>
    </div>
    <div className="xray-grid">
     {s.xray.map((x,n)=>
      <button key={x.t} className={'xray-card '+(seen.includes(n)?'is-open':'')} onClick={()=>setSeen(v=>v.includes(n)?v.filter(z=>z!==n):[...v,n])}>
       <div className="xray-card-top"><span>0{n+1}</span>{seen.includes(n)?<CheckCircle2/>:<Search/>}</div>
       <small>{x.s}</small>
       <h3>{x.t}</h3>
       <p>{seen.includes(n)?x.b:'Open this signal to see why it matters.'}</p>
      </button>
     )}
    </div>
    <div className="sticky-continue">
     <span><b>{seen.length}</b> of 5 signals inspected</span>
     <button className="btn-primary" disabled={!seen.length} onClick={()=>s.shield?setScreen('shield'):save()}>Continue <ArrowRight/></button>
    </div>
   </main>
  }

  {screen==='shield'&&s.shield&&
   <main className="experience-page shield-page">
    <div className="shield-heading"><span className="stage-chip">SHIELD MODE</span><h2>Support works better as a sequence.</h2><p>Educational guidance for bystander action—not emergency support.</p></div>
    <div className="shield-progress">
     {s.shield.map((x,n)=><span key={x} className={n<shield?'is-done':n===shield?'is-active':''}>{n<shield?'✓':n+1}</span>)}
    </div>
    <section className="shield-card">
     <div className="shield-icon"><Shield/></div>
     <small>STEP {shield+1} OF 5</small>
     <h3>{s.shield[shield]!.split(' — ')[0]}</h3>
     <p>{s.shield[shield]!.split(' — ')[1]}</p>
    </section>
    <div className="shield-actions">
     <button className="btn-secondary" disabled={shield===0} onClick={()=>setShield(shield-1)}>Back</button>
     <button className="btn-primary" onClick={()=>shield===4?save():setShield(shield+1)}>{shield===4?'Finish SHIELD':'Next step'} <ArrowRight/></button>
    </div>
   </main>
  }

  {screen==='complete'&&b&&p&&
   <main className="experience-page complete-page">
    <div className="complete-heading">
     <span className="completion-check"><CheckCircle2/></span>
     <span className="stage-chip">SCENARIO 0{i+1} COMPLETE</span>
     <h2>The first click changed. So did the ripple.</h2>
    </div>
    <section className="comparison-board">
     <div className="path-compare">
      <article><small>MIRROR</small><b>{b.label}</b><p>{b.title}</p></article>
      <span><ArrowRight/></span>
      <article><small>PEACE</small><b>{p.label}</b><p>{p.title}</p></article>
     </div>
     <div className="metric-compare-grid">
      {(['reach','hostility','safety','trust'] as const).map(k=>
       <div key={k}><span>{k}</span><strong>{mm(b)[k]} <ArrowRight/> {mm(p)[k]}</strong><small>new direction</small></div>
      )}
     </div>
    </section>
    <button className="btn-primary" onClick={next}>{i===2?'See my Digital Reflex Profile':'Continue to next scenario'} <ArrowRight/></button>
   </main>
  }

  {screen==='results'&&
   <main className="results-page">
    <section className="results-hero">
     <div>
      <span className="stage-chip">DIGITAL REFLEX PROFILE</span>
      <h1>{score>=85?'Strong peacebuilding reflexes':score>=65?'Developing strong reflexes':'Growing digital awareness'}</h1>
      <p>Your profile summarises only the choices you made inside this session. It is a learning reflection—not a diagnosis.</p>
     </div>
     <div className="score-block"><small>SESSION SCORE</small><strong>{score}</strong><span>/100</span></div>
    </section>

    <section className="dimension-board">
     <div className="board-heading"><div><small>YOUR FIVE REFLEXES</small><h2>Where your practice was strongest.</h2></div><span>Higher = safer in-session choices</span></div>
     <div className="dimension-list">
      {dimensions.map((d,n)=><div className="dimension-row" key={d.label}>
       <span>0{n+1}</span><b>{d.label}</b><div><i style={{width:d.value+'%'}}/></div><strong>{d.value}</strong>
      </div>)}
     </div>
    </section>

    <section className="scenario-summary">
     {scenarios.map((x,n)=><article key={x.id}><small>SCENARIO 0{n+1}</small><b>{x.title}</b><strong>{results[n]||0}<span>/100</span></strong></article>)}
    </section>

    <div className="results-note"><Info/><p>This is an in-session learning indicator, not a psychological assessment, validated impact estimate or pilot result. Submission evidence must come from a separate consented pilot.</p></div>

    <footer className="results-footer">
     <div><span className="brand-mark">R</span><div><b>#EveryClickRipples</b><small>Every click has a consequence.</small></div></div>
     <button className="btn-secondary" onClick={reset}><RefreshCw/> Replay experience</button>
    </footer>
   </main>
  }
 </div>
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
