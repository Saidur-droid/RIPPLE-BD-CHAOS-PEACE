import React, {useEffect,useState} from 'react';
import ReactDOM from 'react-dom/client';
import {ArrowRight,CheckCircle2,Eye,Gauge,Heart,Info,Pause,Play,RefreshCw,RotateCcw,Search,Share2,Shield,ShieldCheck,Sparkles,Users,Zap} from 'lucide-react';
import './styles.css';
import {hasAnalyticsConsent,setAnalyticsConsent,track} from './tracking';

type Metrics={reach:number;hostility:number;safety:number;trust:number};
type Choice={id:string;label:string;helper:string;kind:'risk'|'safe'|'neutral'|'support';delta:Partial<Metrics>;score:number;title:string;body:string};
type Scenario={id:string;title:string;tag:string;intro:string;post:string;prompt:string;choices:Choice[];peace:Choice[];xray:{t:string;s:string;b:string}[];shield?:string[]};

const base:Metrics={reach:48,hostility:34,safety:70,trust:66};
const scenarios:Scenario[]=[
{id:'clip',title:'কাটা ভিডিও',tag:'ভুল তথ্য · সাম্প্রদায়িক উত্তেজনা',intro:'নদীতে একটি ছোট ভিডিও দ্রুত ছড়িয়ে পড়ছে। ক্যাপশন খুব নিশ্চিত—কিন্তু উৎসটি নয়।',post:'“সবাই এখনই দেখুন।” ৯ সেকেন্ডের একটি কাটা ভিডিওতে দাবি করা হচ্ছে, একটি স্থানীয় ধর্মীয় গোষ্ঠী একটি কমিউনিটি অনুষ্ঠানে হামলা করেছে। মূল ভিডিও, তারিখ বা জায়গার কোনো নির্ভরযোগ্য তথ্য নেই।',prompt:'বন্ধু ভিডিওটি গ্রুপ চ্যাটে পাঠাল। আপনি প্রথমে কী করবেন?',choices:[
{id:'share',label:'এখনই শেয়ার করব',helper:'হারিয়ে যাওয়ার আগে অন্যদেরও দেখাই',kind:'risk',delta:{reach:28,hostility:24,safety:-17,trust:-20},score:8,title:'গতি তথ্যকে পেছনে ফেলল',body:'ভিডিওটি আরও বেশি মানুষের কাছে পৌঁছায় এবং আলোচনা ঘটনাটি যাচাই করার বদলে পুরো একটি গোষ্ঠীকে নিয়ে সাধারণীকরণের দিকে চলে যায়।'},
{id:'comment',label:'রাগের মন্তব্য করব',helper:'পাবলিকভাবে প্রতিবাদ জানাই',kind:'risk',delta:{reach:14,hostility:30,safety:-19,trust:-23},score:12,title:'উত্তেজনা আরও শক্ত হলো',body:'আপনার মন্তব্য অন্যদের কাছে “সবাই এমনই ভাবছে” ধরনের সংকেত তৈরি করে; যাচাই ছাড়াই একই পরিচয়ভিত্তিক ভাষা ছড়িয়ে পড়ে।'},
{id:'verify',label:'উৎস যাচাই করব',helper:'থামি, মূল ভিডিও ও প্রেক্ষাপট খুঁজি',kind:'safe',delta:{reach:-6,hostility:-8,safety:8,trust:12},score:82,title:'ছড়িয়ে পড়ার গতি কমল',body:'আপনি বুঝতে পারেন ভিডিওটি মাঝখান থেকে শুরু হয়েছে এবং মূল উৎস পরিষ্কার নয়—তাই অনিশ্চিত দাবিটি আর ছড়ান না।'},
{id:'ignore',label:'এড়িয়ে যাব',helper:'কোনো প্রতিক্রিয়া দেব না',kind:'neutral',delta:{reach:2,hostility:5,safety:-2,trust:-3},score:38,title:'আপনি বাড়তি আগুন দিলেন না',body:'আপনি নিজে পোস্টটি ছড়ালেন না, তবে আপনার গ্রুপে বিভ্রান্তিকর ব্যাখ্যাটি চ্যালেঞ্জ ছাড়াই থেকে গেল।'}],
peace:[
{id:'trace',label:'মূল উৎস খুঁজব',helper:'পূর্ণ ভিডিও, তারিখ ও প্রথম আপলোডার যাচাই',kind:'safe',delta:{reach:-14,hostility:-13,safety:14,trust:20},score:96,title:'প্রেক্ষাপট পরিষ্কার হলো',body:'মূল দাবিটি যাচাই করা যাচ্ছে না। আপনি শেয়ার-চেইন থামান এবং অনিশ্চয়তাটি স্পষ্ট রাখেন।'},
{id:'context',label:'শান্তভাবে প্রেক্ষাপট যোগ করব',helper:'অভিযোগ না বাড়িয়ে অনিশ্চয়তা জানাই',kind:'support',delta:{reach:-8,hostility:-18,safety:12,trust:18},score:90,title:'আলোচনার তাপ কমল',body:'মানুষ স্পষ্টভাবে দেখতে পায় যে উৎসটি যাচাইকৃত নয় এবং একটি ঘটনার ভিত্তিতে পুরো গোষ্ঠীকে দায়ী করা ঠিক নয়।'},
{id:'pause',label:'থামব, শেয়ার করব না',helper:'বিশ্বস্ত তথ্য আসা পর্যন্ত অপেক্ষা',kind:'safe',delta:{reach:-10,hostility:-8,safety:9,trust:12},score:78,title:'একটি ছড়িয়ে পড়ার পথ বন্ধ হলো',body:'আপনার মাধ্যমে ভিডিওটি আরেক দফা ছড়িয়ে পড়ল না।'}],
xray:[
{t:'জরুরি আবেগ তৈরি',s:'“এখনই”',b:'জরুরি ভাষা মানুষকে যাচাইয়ের আগেই কাজ করতে চাপ দিতে পারে।'},
{t:'মূল উৎস নেই',s:'Original upload নেই',b:'Repost নিজে কোনো উৎস নয়। সম্ভব হলে সবচেয়ে পুরোনো যাচাইযোগ্য সংস্করণটি খুঁজুন।'},
{t:'কাটা প্রেক্ষাপট',s:'মাত্র ৯ সেকেন্ড',b:'ছোট ভিডিও ঘটনার আগে বা পরে কী হয়েছিল তা লুকিয়ে ফেলতে পারে।'},
{t:'সংখ্যার প্রভাব',s:'৭১৩ শেয়ার',b:'অনেক শেয়ার হওয়া সত্যতার প্রমাণ নয়; জনপ্রিয়তা ও যাচাই এক জিনিস নয়।'},
{t:'পরিচয় দিয়ে ফ্রেম করা',s:'পুরো গোষ্ঠীকে দায়ী',b:'একটি ঘটনার দাবি খুব দ্রুত একটি পুরো সম্প্রদায় সম্পর্কে দাবিতে পরিণত হতে পারে।'}]},

{id:'meme',title:'ভাইরাল মিম',tag:'সাইবার বুলিং · লিঙ্গভিত্তিক হয়রানি',intro:'একজন কাল্পনিক শিক্ষার্থীকে নিয়ে “মজা” এখন দলবদ্ধ অপমানে পরিণত হচ্ছে। মন্তব্যগুলো ক্রমেই কঠোর হচ্ছে।',post:'ক্লাস প্রেজেন্টেশনের পর কাল্পনিক শিক্ষার্থী রিমাকে নিয়ে একটি মিম ছড়িয়েছে। মন্তব্যগুলো যৌন ইঙ্গিতপূর্ণ হয়ে উঠেছে এবং একটি স্ক্রিনশটে শত্রুতাপূর্ণ ব্যক্তিগত মেসেজের ইঙ্গিত আছে।',prompt:'রিমাকে আপনি চেনেন। আপনার প্রথম পদক্ষেপ কী?',choices:[
{id:'laugh',label:'হাসির রিঅ্যাক্ট দেব',helper:'ভাবব—এটা তো “শুধু মিম”',kind:'risk',delta:{reach:15,hostility:21,safety:-18,trust:-12},score:10,title:'ভিড় এটাকে অনুমোদন হিসেবে নিল',body:'আরেকটি রিঅ্যাক্ট অন্যদেরও যোগ দেওয়ার সামাজিক বাধা কমিয়ে দেয়।'},
{id:'reshare',label:'আরেক গ্রুপে পাঠাব',helper:'বন্ধুদের সঙ্গে “মজা” শেয়ার করি',kind:'risk',delta:{reach:26,hostility:24,safety:-23,trust:-17},score:4,title:'রিমা পোস্টটির নাগাল নিয়ন্ত্রণ হারাল',body:'মিমটি মূল জায়গার বাইরে যায় এবং আরও অপরিচিত মানুষ এতে যোগ দেয়।'},
{id:'ignore',label:'স্ক্রল করে চলে যাব',helper:'নিজেকে এর বাইরে রাখি',kind:'neutral',delta:{reach:4,hostility:8,safety:-5,trust:-4},score:42,title:'আপনি ক্ষতি বাড়ালেন না',body:'দলবদ্ধ অপমান চলতে থাকে, তবে আপনার কারণে তা আর বাড়ে না।'},
{id:'check',label:'রিমার সঙ্গে ব্যক্তিগতভাবে কথা বলব',helper:'সে কী ধরনের সহায়তা চায় জিজ্ঞেস করি',kind:'support',delta:{reach:-2,hostility:-5,safety:14,trust:12},score:88,title:'সহায়তার নিয়ন্ত্রণ রিমার হাতে থাকল',body:'আপনি মিমটি আবার না ছড়িয়ে সরাসরি জিজ্ঞেস করেন—সে কী ধরনের সহায়তা চায়।'}],
peace:[
{id:'support',label:'সহায়তা + রিপোর্ট',helper:'খোঁজ নিই, প্রয়োজনীয় প্রমাণ রাখি, রিপোর্ট করি',kind:'support',delta:{reach:-8,hostility:-14,safety:20,trust:17},score:98,title:'প্রতিক্রিয়াটি ভুক্তভোগীর প্রয়োজন অনুযায়ী হলো',body:'আপনি অপমানজনক কনটেন্টকে আরও ছড়িয়ে না দিয়ে সহায়তা করেন।'},
{id:'interrupt',label:'শান্তভাবে অপমানের ধারা থামাব',helper:'আক্রমণ না করে সীমা স্পষ্ট করি',kind:'safe',delta:{reach:-5,hostility:-19,safety:14,trust:18},score:92,title:'নতুন সামাজিক মানদণ্ড দৃশ্যমান হলো',body:'শান্ত উত্তরটি “এটা শুধু মজা” ফ্রেমকে চ্যালেঞ্জ করে এবং উত্তেজনা কমায়।'},
{id:'private',label:'আগে ব্যক্তিগত সহায়তা দেব',helper:'পাবলিক কিছু করার আগে তার মতামত নিই',kind:'support',delta:{reach:-2,hostility:-7,safety:18,trust:14},score:91,title:'সিদ্ধান্ত নেওয়ার ক্ষমতা রিমার কাছেই থাকল',body:'রিমা নিজেই ঠিক করতে পারে সে কী ধরনের সহায়তা চায়।'}],
xray:[
{t:'“শুধু মজা” ঢাল',s:'Humor frame',b:'রসিকতার আড়ালে সামাজিক শাস্তি বা অপমান লুকিয়ে থাকতে পারে।'},
{t:'দলবদ্ধ আক্রমণের প্রভাব',s:'বারবার একই আচরণ',b:'প্রত্যেকটি ছোট রিঅ্যাক্ট পরের মানুষটির যোগ দেওয়াকে আরও সহজ করে।'},
{t:'যাকে নিয়ে কথা, তাকে বাদ দেওয়া',s:'তার সঙ্গে নয়—তাকে নিয়ে',b:'নিরাপদ সহায়তা আক্রান্ত ব্যক্তির সিদ্ধান্তের ক্ষমতা ফিরিয়ে দেয়।'},
{t:'প্রমাণ বনাম পুনরায় ছড়ানো',s:'Screenshot ঝুঁকি',b:'শুধু প্রয়োজনীয় প্রমাণ রাখুন; “প্রমাণ” দেখানোর নামে ক্ষতিকর কনটেন্ট ছড়াবেন না।'},
{t:'ঝুঁকি বাড়ার সংকেত',s:'শত্রুতাপূর্ণ DM',b:'বিশ্বাসযোগ্য হুমকি থাকলে বিশ্বস্ত ব্যক্তি বা প্রয়োজনীয় আনুষ্ঠানিক সহায়তা নেওয়া জরুরি হতে পারে।'}],
shield:[
'চিহ্নিত করুন — আচরণটিকে নাম দিন, কিন্তু আক্রান্ত ব্যক্তিকে দায়ী করবেন না।',
'সহায়তা করুন — ব্যক্তিগতভাবে খোঁজ নিন এবং সে কী চায় জিজ্ঞেস করুন।',
'প্রমাণ রাখুন — শুধু প্রয়োজনীয় অংশ সংরক্ষণ করুন; আবার ছড়াবেন না।',
'রিপোর্ট করুন — প্রাসঙ্গিক প্ল্যাটফর্ম বা কমিউনিটি ব্যবস্থায় রিপোর্ট করুন।',
'প্রয়োজনে বাড়তি সহায়তা নিন — বিশ্বাসযোগ্য হুমকি থাকলে বিশ্বস্ত বা আনুষ্ঠানিক সহায়তায় যান।'
]},

{id:'voice',title:'অনুপস্থিত কণ্ঠ',tag:'উৎসের বৈচিত্র্য · অন্তর্ভুক্তি',intro:'একটি কাল্পনিক সংখ্যালঘু সম্প্রদায়কে নিয়ে বড় একটি দাবি ছড়াচ্ছে। সবাই তাদের নিয়ে কথা বলছে—কিন্তু তাদের কারও সরাসরি বক্তব্য নেই।',post:'“ওরা আমাদের সঙ্গে মিশতে চায় না।” পোস্টটি “এলাকার লোকজন”কে উৎস হিসেবে উল্লেখ করেছে, কিন্তু কোনো সরাসরি সাক্ষ্য, নথি বা সংশ্লিষ্ট ব্যক্তির বক্তব্য নেই।',prompt:'আপনি আলোচনায় যোগ দিতে যাচ্ছেন। প্রথমে কী করবেন?',choices:[
{id:'share',label:'বাইরের ব্যাখ্যাটি শেয়ার করব',helper:'শুনতে বিশ্বাসযোগ্য লাগছে',kind:'risk',delta:{reach:18,hostility:15,safety:-11,trust:-18},score:18,title:'অনুমানটাই মূল গল্প হয়ে গেল',body:'একই কথা বারবার বলা হলে প্রমাণহীন ব্যাখ্যাও প্রতিষ্ঠিত সত্যের মতো মনে হতে শুরু করে।'},
{id:'stereo',label:'একটি সাধারণীকরণ যোগ করব',helper:'যা শুনেছি তা পুরো গোষ্ঠীর ওপর বসাই',kind:'risk',delta:{reach:12,hostility:26,safety:-18,trust:-25},score:4,title:'মানুষের জায়গা নিল একটি লেবেল',body:'আলোচনা একটি দাবির বদলে পুরো পরিচয়কে বিচার করার দিকে চলে যায়।'},
{id:'source',label:'প্রাথমিক উৎস খুঁজব',helper:'সরাসরি ও প্রাসঙ্গিক প্রমাণ খুঁজি',kind:'safe',delta:{reach:-4,hostility:-10,safety:10,trust:17},score:86,title:'তথ্যের ঘাটতি দৃশ্যমান হলো',body:'আপনি বুঝতে পারেন পোস্টটিতে সরাসরি প্রমাণও নেই, সংশ্লিষ্ট মানুষের কণ্ঠও নেই।'},
{id:'pause',label:'মন্তব্যের আগে থামব',helper:'প্রমাণের চেয়ে বেশি নিশ্চিত হয়ে কথা বলব না',kind:'neutral',delta:{reach:-3,hostility:-4,safety:5,trust:7},score:60,title:'অনিশ্চয়তার জায়গা রইল',body:'ভালো প্রেক্ষাপট খোঁজার সময় আপনি আরেকটি প্রমাণহীন দাবি যোগ করেন না।'}],
peace:[
{id:'first',label:'প্রাসঙ্গিক সরাসরি বক্তব্য খুঁজব',helper:'একজনকে পুরো গোষ্ঠীর প্রতিনিধি না বানিয়ে',kind:'support',delta:{reach:-7,hostility:-12,safety:13,trust:22},score:97,title:'আলোচনার ফ্রেম বড় হলো',body:'সরাসরি প্রেক্ষাপট যুক্ত হলো, কিন্তু একজন ব্যক্তিকে পুরো সম্প্রদায়ের মুখপাত্র বানানো হলো না।'},
{id:'label',label:'দাবি ও প্রমাণ আলাদা করব',helper:'কী জানা, কী অজানা, কী অনুপস্থিত—স্পষ্ট করি',kind:'safe',delta:{reach:-5,hostility:-14,safety:11,trust:20},score:95,title:'নিশ্চয়তার দায়বদ্ধতা তৈরি হলো',body:'এখন আলোচনায় ব্যাখ্যা, প্রমাণ ও অনিশ্চয়তার পার্থক্য পরিষ্কার।'},
{id:'amplify',label:'বিশ্বস্ত প্রাথমিক উৎস সামনে আনব',helper:'অর্থ বদলানো ছাড়াই প্রেক্ষাপট যোগ করি',kind:'support',delta:{reach:-2,hostility:-10,safety:12,trust:21},score:93,title:'অনুপস্থিত কণ্ঠ সরাসরি আলোচনায় এল',body:'আলোচনায় এখন শুধু বাইরের ব্যাখ্যা নয়, সরাসরি প্রেক্ষাপটও আছে।'}],
xray:[
{t:'সংশ্লিষ্ট মানুষের কণ্ঠ নেই',s:'First-person source নেই',b:'দেখতে বৈচিত্র্যময় আলোচনা হলেও সবচেয়ে প্রভাবিত মানুষগুলো অনুপস্থিত থাকতে পারে।'},
{t:'অস্পষ্ট কর্তৃত্ব',s:'“এলাকার লোকজন বলে…”',b:'অস্পষ্ট উৎস জবাবদিহি ছাড়াই আত্মবিশ্বাসী দাবি তৈরি করে।'},
{t:'স্টেরিওটাইপের শর্টকাট',s:'“ওরা এমন…”',b:'পুরো গোষ্ঠী নিয়ে ভাষা একটি নির্দিষ্ট দাবিকে পরিচয়ভিত্তিক বিচার বানিয়ে ফেলতে পারে।'},
{t:'একজনকে সবার প্রতিনিধি বানানো',s:'এক কণ্ঠ ≠ পুরো গোষ্ঠী',b:'একটি উৎসকে পুরো সম্প্রদায়ের একমাত্র প্রতিনিধিত্ব হিসেবে ব্যবহার করা ঠিক নয়।'},
{t:'প্রমাণের সীমা',s:'জানা / অজানা',b:'প্রমাণ, ব্যাখ্যা ও অনিশ্চয়তার সীমাটি দৃশ্যমান রাখুন।'}]}
];

const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const metrics=(c:Choice):Metrics=>({reach:clamp(base.reach+(c.delta.reach||0)),hostility:clamp(base.hostility+(c.delta.hostility||0)),safety:clamp(base.safety+(c.delta.safety||0)),trust:clamp(base.trust+(c.delta.trust||0))});

function App(){
 const [guideStep,setGuideStep]=useState(0);
 const [analyticsConsent,setConsentState]=useState(()=>hasAnalyticsConsent());
 const [screen,setScreen]=useState('landing');
 const [i,setI]=useState(0);
 const [b,setB]=useState<Choice|null>(null);
 const [p,setP]=useState<Choice|null>(null);
 const [results,setResults]=useState<number[]>(()=>JSON.parse(localStorage.getItem('ripple-results')||'[]'));
 const [seen,setSeen]=useState<number[]>([]);
 const [shield,setShield]=useState(0);
 const [screenStartedAt,setScreenStartedAt]=useState(()=>Date.now());
 const s=scenarios[i]!;

 useEffect(()=>{
  localStorage.setItem('ripple-results',JSON.stringify(results));
  window.scrollTo({top:0,behavior:'smooth'});
  setScreenStartedAt(Date.now());
  track('screen_view',{screen,scenario_id:s.id,scenario_index:i+1});
 },[results,screen,i]);

 const next=()=>{
  if(i===2){track('session_complete',{screen:'results',session_score:score});setScreen('results')}
  else{
   setI(i+1);setB(null);setP(null);setSeen([]);setShield(0);setScreen('intro');
  }
 };
 const save=()=>{
  if(!b||!p)return;
  const scenarioScore=Math.round((b.score+p.score)/2);
  const r=[...results];
  r[i]=scenarioScore;
  setResults(r);
  track('scenario_completed',{screen:'complete',scenario_id:s.id,scenario_index:i+1,scenario_score:scenarioScore,duration_ms:Date.now()-screenStartedAt});
  setScreen('complete');
 };
 const mm=(c:Choice)=>metrics(c);
 const reset=()=>{
  localStorage.removeItem('ripple-results');
  setResults([]);setI(0);setB(null);setP(null);setSeen([]);setShield(0);setGuideStep(0);setScreen('guide');
 };
 const score=Math.round((results.reduce((a,n)=>a+(n||0),0)/Math.max(1,results.length)));
 const dimensions=[
  {label:'শেয়ার করার আগে যাচাই',value:results[0]||0},
  {label:'প্রভাবিত করার কৌশল শনাক্ত',value:Math.round(((results[0]||0)+(results[2]||0))/2)},
  {label:'দর্শক হিসেবে দায়িত্বশীল প্রতিক্রিয়া',value:results[1]||0},
  {label:'আক্রান্ত ব্যক্তিকে সহায়তা',value:Math.round(((results[1]||0)+(results[2]||0))/2)},
  {label:'উত্তেজনা কমানো',value:Math.round(((results[0]||0)+(results[1]||0)+(results[2]||0))/3)}
 ];
 const stageLabel=screen==='mirror'?'প্রথম সিদ্ধান্ত':screen==='ripple'||screen==='reflect'?'পরিণতি':screen==='rewind'?'ফিরে দেখা':screen==='peace'?'দ্বিতীয় চেষ্টা':screen==='xray'||screen==='shield'?'সহায়ক টুল':'শেখা';
 const resume=()=>{
  if(results.length>=3){setScreen('results');return}
  setI(results.length);setB(null);setP(null);setSeen([]);setShield(0);setScreen('intro');
 };

 return <div className="app-v2">
  {screen!=='landing'&&screen!=='notice'&&
   <header className="product-header">
    <button className="brand-button" onClick={()=>setScreen('landing')} aria-label="Return to home">
     <span className="brand-mark">R</span>
     <span className="brand-copy"><b>RIPPLE BD</b><small>ডিজিটাল সিদ্ধান্ত অনুশীলন</small></span>
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
     <button className="exit-button" onClick={()=>setScreen('landing')}>বের হোন</button>
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
      <span>প্রোটোটাইপ v1</span>
      <span className="status-dot"><i/> লাইভ</span>
     </div>
    </nav>

    <section className="hero-v2">
     <div className="hero-copy">
      <span className="kicker">ডিজিটাল জীবনের সিদ্ধান্ত—অনুশীলনের মাধ্যমে</span>
      <h1>প্রতিটি ক্লিকেরই <span>পরিণতি আছে।</span></h1>
      <p>RIPPLE শুধু কী করা উচিত তা বলে না। আপনি সিদ্ধান্ত নেবেন, তার প্রভাব দেখবেন, একই মুহূর্তে ফিরে যাবেন—তারপর আরও ভালো তথ্য নিয়ে আবার চেষ্টা করবেন।</p>
      <div className="hero-actions">
       <button className="btn-primary" onClick={reset}>শুরু করুন <ArrowRight/></button>
       {results.length>0&&<button className="btn-secondary" onClick={resume}>আগের জায়গা থেকে চালিয়ে যান</button>}
      </div>
      <div className="proof-row">
       <span><Gauge/> ৬–৮ মিনিট</span>
       <span><ShieldCheck/> লগইন লাগবে না</span>
       <span><Pause/> সব ঘটনা কাল্পনিক</span>
      </div>
     </div>

     <div className="product-preview" aria-label="Product preview">
      <div className="preview-topbar">
       <div><span className="mini-avatar">N</span><b>নদী / কমিউনিটি ফিড</b></div>
       <span className="simulation-label">SIMULATION</span>
      </div>
      <div className="preview-post">
       <small>ট্রেন্ডিং · ২ মিনিট আগে</small>
       <p>“সবাই এটা এখনই দেখুন।”</p>
       <div className="preview-media"><Play/></div>
       <div className="preview-stats"><span>১.৮ হাজার রিঅ্যাকশন</span><span>৭১৩ শেয়ার</span></div>
      </div>
      <div className="preview-decision">
       <small>কিছু করার আগে</small>
       <b>আপনি প্রথমে কী করবেন?</b>
       <div><span>শেয়ার করব</span><span>উৎস দেখব</span></div>
      </div>
      <div className="preview-note"><span>REWIND</span><p>একই মুহূর্ত আবার আসে—এবার অনুশীলনের দ্বিতীয় সুযোগ হিসেবে।</p></div>
     </div>
    </section>

    <section className="journey-strip">
     {[
      ['01','MIRROR','নিজের মতো সিদ্ধান্ত নিন'],
      ['02','RIPPLE','কী বদলায় দেখুন'],
      ['03','REWIND','মুহূর্তে ফিরে যান'],
      ['04','PEACE','নিরাপদ পথ অনুশীলন করুন'],
      ['05','REFLECT','একটি নতুন অভ্যাস নিয়ে শেষ করুন']
     ].map(x=><div key={x[0]}><span>{x[0]}</span><b>{x[1]}</b><small>{x[2]}</small></div>)}
    </section>
   </main>
  }


  {screen==='guide'&&
   <main className="guide-page">
    <button className="back-link" onClick={()=>setScreen('landing')}>← ফিরে যান</button>
    <section className="guide-shell">
     <div className="guide-progress" aria-label="শুরুর নির্দেশনা">
      {[0,1,2].map(n=><i key={n} className={n<=guideStep?'active':''}/>)}
     </div>
     {guideStep===0&&<div className="guide-step">
      <span className="guide-number">১</span>
      <span className="kicker">প্রথমে নিজের মতো সিদ্ধান্ত নিন</span>
      <h2>“সঠিক উত্তর” খুঁজবেন না।</h2>
      <p>প্রতিটি দৃশ্যে প্রথমে আপনি বাস্তবে যা করতেন, সেটিই বেছে নেবেন। আমরা আগে থেকে কোনো অপশনকে ভালো বা খারাপ দেখাব না।</p>
      <div className="guide-demo"><span>আপনার প্রথম সিদ্ধান্ত</span><b>আমি বাস্তবে কী করতাম?</b><small>একটি অপশন বেছে নিলেই পরের ধাপে যাবেন</small></div>
     </div>}
     {guideStep===1&&<div className="guide-step">
      <span className="guide-number">২</span>
      <span className="kicker">তারপর প্রভাব দেখুন</span>
      <h2>আপনার সিদ্ধান্ত কী বদলাল—RIPPLE দেখাবে।</h2>
      <p>নাগাল, উত্তেজনা, নিরাপত্তা ও আস্থার দিক কীভাবে বদলেছে—সহজভাবে দেখানো হবে। এরপর REWIND চাপলে একই মুহূর্তে ফিরে যেতে পারবেন।</p>
      <div className="guide-demo guide-metrics"><span>নাগাল <b>48 → 76</b></span><span>আস্থা <b>66 → 46</b></span></div>
     </div>}
     {guideStep===2&&<div className="guide-step">
      <span className="guide-number">৩</span>
      <span className="kicker">শেষে আবার চেষ্টা করুন</span>
      <h2>নতুন তথ্য নিয়ে দ্বিতীয় সিদ্ধান্ত নিন।</h2>
      <p>PEACE ধাপে আরও নিরাপদ প্রতিক্রিয়া অনুশীলন করবেন। তিনটি দৃশ্য শেষ হলে আপনার Digital Reflex Profile দেখবেন। মোট সময় সাধারণত ৬–৮ মিনিট।</p>
      <div className="guide-demo"><span>৩টি দৃশ্য</span><b>সিদ্ধান্ত → প্রভাব → ফিরে দেখা → দ্বিতীয় চেষ্টা</b><small>কোনো লগইন লাগবে না</small></div>
     </div>}
     <div className="guide-actions">
      <button className="btn-secondary" disabled={guideStep===0} onClick={()=>setGuideStep(v=>Math.max(0,v-1))}>পেছনে</button>
      {guideStep<2
       ?<button className="btn-primary" onClick={()=>setGuideStep(v=>v+1)}>বুঝেছি, পরের ধাপ <ArrowRight/></button>
       :<button className="btn-primary" onClick={()=>setScreen('notice')}>শুরু করার জন্য প্রস্তুত <ArrowRight/></button>}
     </div>
    </section>
   </main>
  }

  {screen==='notice'&&
   <main className="notice-page">
    <button className="back-link" onClick={()=>setScreen('landing')}>← ফিরে যান</button>
    <section className="notice-card">
     <div className="notice-index">শুরুর আগে</div>
     <h2>এটি অনুশীলনের জায়গা—কোনো বাস্তব ঘটনা নয়।</h2>
     <p>নদীর প্রতিটি মানুষ, পোস্ট ও কমিউনিটি কাল্পনিক। আপনাকে কোনো ব্যক্তিগত অভিজ্ঞতা জানাতে হবে না। আপনার সিদ্ধান্ত এই শেখার অভিজ্ঞতার জন্যই ব্যবহৃত হবে।</p>
     <div className="principles-grid">
      <article><span>01</span><b>ইচ্ছাকৃতভাবে কাল্পনিক</b><p>কোনো বাস্তব ব্যক্তি, সম্প্রদায় বা রাজনৈতিক পক্ষকে এখানে অভিযুক্ত করা হয়নি।</p></article>
      <article><span>02</span><b>গোপনীয়তাকে অগ্রাধিকার</b><p>অ্যাকাউন্ট, পরিচয় বা সংবেদনশীল ব্যক্তিগত গল্প লাগবে না।</p></article>
      <article><span>03</span><b>শেখা—মূল্যায়ন নয়</b><p>স্কোর শুধু এই সেশনের সিদ্ধান্তকে বোঝায়; আপনার চরিত্র বা মানসিক অবস্থাকে নয়।</p></article>
     </div>
     <label className="consent-card">
      <input type="checkbox" checked={analyticsConsent} onChange={e=>setConsentState(e.target.checked)}/>
      <span><b>গবেষণার জন্য নামবিহীন ব্যবহার-তথ্য শেয়ার করতে রাজি</b><small>শুধু কোন ধাপে গেলেন, কোন অপশন বেছে নিলেন, কত সময় লাগল, সম্পন্ন করেছেন কি না এবং ডিভাইসের ধরন রেকর্ড হবে। নাম, ফোন, ইমেইল, GPS বা ব্যক্তিগত গল্প নেওয়া হবে না। এটি ঐচ্ছিক।</small></span>
     </label>
     <div className="notice-footer">
      <p>এই সূচকগুলো শেখানোর জন্য; বাস্তব জগতের প্রভাবের পরিমাপ নয়।</p>
      <button className="btn-primary" onClick={()=>{setAnalyticsConsent(analyticsConsent);if(analyticsConsent){track('analytics_consent_granted',{screen:'notice'});track('app_open',{screen:'notice'});track('guide_completed',{screen:'notice'});}setScreen('intro');}}>নদীতে প্রবেশ করুন <ArrowRight/></button>
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
     <button className="btn-primary" onClick={()=>{track('scenario_started',{screen:'intro',scenario_id:s.id,scenario_index:i+1});setScreen('mirror')}}>পোস্টটি দেখুন <ArrowRight/></button>
    </section>
    <aside className="context-panel">
     <span className="context-label">নদী পরিচিতি</span>
     <h3>১০,০০০ মানুষের একটি কাল্পনিক ডিজিটাল কমিউনিটি।</h3>
     <p>আপনার সিদ্ধান্তে সিমুলেশন বদলাবে। কোনো টাইমার নেই, আর সিদ্ধান্ত নেওয়ার আগে “সঠিক উত্তর” দেখানো হবে না।</p>
     <div className="context-list">
      <span><b>01</b> বাস্তবে যা করতেন, সেটিই বেছে নিন।</span>
      <span><b>02</b> তারপর কী ঘটে দেখুন।</span>
      <span><b>03</b> ফিরে গিয়ে নতুনভাবে চেষ্টা করুন।</span>
     </div>
    </aside>
   </main>
  }

  {screen==='mirror'&&
   <main className="experience-page decision-layout">
    <section className="decision-panel">
     <span className="stage-chip">MIRROR · আপনার প্রথম সিদ্ধান্ত</span>
     <h2>{s.prompt}</h2>
     <p className="section-copy">আপনি বাস্তবে যা করতেন, সেটিই বেছে নিন। এই ধাপে কোনো অপশনকে ভালো বা খারাপ হিসেবে চিহ্নিত করা হয়নি।</p>
     <div className="decision-list">
      {s.choices.map((c,n)=>
       <button key={c.id} className="decision-option" onClick={()=>{track('mirror_choice',{screen:'mirror',scenario_id:s.id,scenario_index:i+1,choice_id:c.id,choice_kind:c.kind,choice_score:c.score,duration_ms:Date.now()-screenStartedAt});setB(c);setScreen('ripple')}}>
        <span className="choice-index">0{n+1}</span>
        <span className="choice-copy"><b>{c.label}</b><small>{c.helper}</small></span>
        <ArrowRight/>
       </button>
      )}
     </div>
    </section>

    <article className="feed-card">
     <div className="feed-card-head">
      <div><span className="mini-avatar">N</span><div><b>নদী ফিড</b><small>@nodi_live · এখন</small></div></div>
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
      <span className="stage-chip">RIPPLE · সিদ্ধান্তের প্রভাব</span>
      <h2>একটি সিদ্ধান্ত একসঙ্গে অনেক কিছু বদলে দিতে পারে।</h2>
     </div>
     <div className="choice-recap"><small>আপনি বেছে নিয়েছেন</small><b>{b.label}</b></div>
    </section>

    <section className="ripple-grid">
     <article className="consequence-story">
      <span className="story-step">01</span><div><small>আপনার সিদ্ধান্ত</small><h3>{b.label}</h3><p>{b.helper}</p></div>
      <span className="story-line"/>
      <span className="story-step">02</span><div><small>অনলাইনে ছড়িয়ে পড়ার প্রভাব</small><h3>{b.title}</h3><p>সিদ্ধান্তের ভিত্তিতে নাগাল, উত্তেজনা, নিরাপত্তা ও আস্থার সূচক বদলায়।</p></div>
      <span className="story-line"/>
      <span className="story-step human-step"><Heart/></span><div><small>মানুষের ওপর প্রভাব</small><h3>মানুষ কী অনুভব করতে পারে</h3><p>{b.body}</p></div>
     </article>

     <article className="metrics-card">
      <div className="metrics-head"><div><small>সিমুলেশন সূচক</small><b>আগে → পরে</b></div><Info/></div>
      {(['reach','hostility','safety','trust'] as const).map(k=>{
       const v=mm(b)[k],d=v-base[k],good=(k==='safety'||k==='trust')?d>=0:d<=0;
       return <div className="metric-row-v2" key={k}>
        <div><span>{({reach:'নাগাল',hostility:'উত্তেজনা',safety:'নিরাপত্তা',trust:'আস্থা'} as const)[k]}</span><strong className={good?'delta-good':'delta-bad'}>{d>=0?'+':''}{d}</strong></div>
        <div className="metric-track"><i style={{width:v+'%'}} className={good?'track-good':'track-bad'}/></div>
        <small>{base[k]} → {v}</small>
       </div>
      })}
      <p className="metrics-disclaimer">এগুলো শুধু পরিবর্তনের দিক দেখায়; বাস্তব জগতের মাপা প্রভাব নয়।</p>
     </article>
    </section>
    <button className="btn-primary" onClick={()=>{track('ripple_viewed',{screen:'ripple',scenario_id:s.id,scenario_index:i+1});setScreen('reflect')}}>একটু ভেবে দেখি <ArrowRight/></button>
   </main>
  }

  {screen==='reflect'&&b&&
   <main className="reflection-page">
    <section className="reflection-card">
     <span className="stage-chip">REFLECT · আবার চেষ্টা করার আগে</span>
     <h2>প্রথম সিদ্ধান্তটির কারণে কী বদলেছে?</h2>
     <blockquote>{b.body}</blockquote>
     <div className="reflection-prompt">
      <small>একটি প্রশ্ন</small>
      <p>ঠিক একই মুহূর্তে ফিরে যেতে পারলে, প্রথমে কী বদলাতেন?</p>
     </div>
     <button className="btn-dark" onClick={()=>{track('rewind_started',{screen:'reflect',scenario_id:s.id,scenario_index:i+1});setScreen('rewind')}}>মুহূর্তে ফিরে যান <RotateCcw/></button>
    </section>
   </main>
  }

  {screen==='rewind'&&
   <main className="rewind-page">
    <div className="rewind-rule"><span>একই মুহূর্ত</span><i/><span>নতুন সিদ্ধান্ত</span></div>
    <section className="rewind-copy">
     <span className="rewind-symbol"><RotateCcw/></span>
     <small>REWIND</small>
     <h1>যা ঘটেছে তা মনে রেখেই ফিরে যান।</h1>
     <p>আপনি পরিণতি দেখেছেন। এবার আরও প্রেক্ষাপট নিয়ে একই সিদ্ধান্তে ফিরে যান এবং নিরাপদ প্রতিক্রিয়া অনুশীলন করুন।</p>
     <button className="btn-light" onClick={()=>setScreen('peace')}>সিদ্ধান্তে ফিরে যান <ArrowRight/></button>
    </section>
   </main>
  }

  {screen==='peace'&&
   <main className="experience-page peace-page">
    <section className="peace-heading">
     <span className="stage-chip">PEACE · দ্বিতীয় চেষ্টা</span>
     <h2>একই মুহূর্ত। এবার আরও ভালো তথ্য।</h2>
     <p className="section-copy">এখন যে প্রতিক্রিয়াটি অনুশীলন করতে চান সেটি বেছে নিন। নিরাপদ সিদ্ধান্তেও কিছু সমঝোতা থাকতে পারে।</p>
    </section>
    <div className="peace-options">
     {s.peace.map((c,n)=>
      <button key={c.id} className="peace-option" onClick={()=>{track('peace_choice',{screen:'peace',scenario_id:s.id,scenario_index:i+1,choice_id:c.id,choice_kind:c.kind,choice_score:c.score,duration_ms:Date.now()-screenStartedAt});setP(c);setSeen([]);setScreen('xray')}}>
       <span>0{n+1}</span><div><b>{c.label}</b><small>{c.helper}</small></div><ArrowRight/>
      </button>
     )}
    </div>
   </main>
  }

  {screen==='xray'&&
   <main className="experience-page xray-page">
    <div className="xray-heading">
     <div><span className="stage-chip">MANIPULATION X-RAY · প্রভাবের সংকেত</span><h2>পোস্টটি কীভাবে আপনার মনোযোগকে প্রভাবিত করছিল—খেয়াল করুন।</h2></div>
     <p>অন্তত একটি সংকেত খুলুন। উদ্দেশ্য সন্দেহপ্রবণ হওয়া নয়—কখন একটু থামতে হবে তা শেখা।</p>
    </div>
    <div className="xray-grid">
     {s.xray.map((x,n)=>
      <button key={x.t} className={'xray-card '+(seen.includes(n)?'is-open':'')} onClick={()=>setSeen(v=>{const opening=!v.includes(n);if(opening)track('xray_signal_opened',{screen:'xray',scenario_id:s.id,scenario_index:i+1,signals_count:v.length+1,signals:[...v,n].map(z=>s.xray[z]!.t)});return opening?[...v,n]:v.filter(z=>z!==n)})}>
       <div className="xray-card-top"><span>0{n+1}</span>{seen.includes(n)?<CheckCircle2/>:<Search/>}</div>
       <small>{x.s}</small>
       <h3>{x.t}</h3>
       <p>{seen.includes(n)?x.b:'কেন এটি গুরুত্বপূর্ণ জানতে খুলুন।'}</p>
      </button>
     )}
    </div>
    <div className="sticky-continue">
     <span><b>{seen.length}</b> / ৫ সংকেত দেখা হয়েছে</span>
     <button className="btn-primary" disabled={!seen.length} onClick={()=>{track('xray_completed',{screen:'xray',scenario_id:s.id,scenario_index:i+1,signals_count:seen.length,signals:seen.map(z=>s.xray[z]!.t)});s.shield?setScreen('shield'):save()}}>এগিয়ে যান <ArrowRight/></button>
    </div>
   </main>
  }

  {screen==='shield'&&s.shield&&
   <main className="experience-page shield-page">
    <div className="shield-heading"><span className="stage-chip">SHIELD · সহায়তার ধাপ</span><h2>সহায়তা সবচেয়ে কার্যকর হয় যখন ধাপে ধাপে করা যায়।</h2><p>এটি দায়িত্বশীল সহায়তার অনুশীলন; জরুরি সেবা নয়।</p></div>
    <div className="shield-progress">
     {s.shield.map((x,n)=><span key={x} className={n<shield?'is-done':n===shield?'is-active':''}>{n<shield?'✓':n+1}</span>)}
    </div>
    <section className="shield-card">
     <div className="shield-icon"><Shield/></div>
     <small>ধাপ {shield+1} / ৫</small>
     <h3>{s.shield[shield]!.split(' — ')[0]}</h3>
     <p>{s.shield[shield]!.split(' — ')[1]}</p>
    </section>
    <div className="shield-actions">
     <button className="btn-secondary" disabled={shield===0} onClick={()=>setShield(shield-1)}>পেছনে</button>
     <button className="btn-primary" onClick={()=>{if(shield===4){track('shield_completed',{screen:'shield',scenario_id:s.id,scenario_index:i+1});save()}else setShield(shield+1)}}>{shield===4?'SHIELD শেষ করুন':'পরের ধাপ'} <ArrowRight/></button>
    </div>
   </main>
  }

  {screen==='complete'&&b&&p&&
   <main className="experience-page complete-page">
    <div className="complete-heading">
     <span className="completion-check"><CheckCircle2/></span>
     <span className="stage-chip">দৃশ্য ০{i+1} সম্পন্ন</span>
     <h2>প্রথম সিদ্ধান্ত বদলেছে—তার সঙ্গে বদলেছে প্রভাবও।</h2>
    </div>
    <section className="comparison-board">
     <div className="path-compare">
      <article><small>MIRROR</small><b>{b.label}</b><p>{b.title}</p></article>
      <span><ArrowRight/></span>
      <article><small>PEACE</small><b>{p.label}</b><p>{p.title}</p></article>
     </div>
     <div className="metric-compare-grid">
      {(['reach','hostility','safety','trust'] as const).map(k=>
       <div key={k}><span>{({reach:'নাগাল',hostility:'উত্তেজনা',safety:'নিরাপত্তা',trust:'আস্থা'} as const)[k]}</span><strong>{mm(b)[k]} <ArrowRight/> {mm(p)[k]}</strong><small>নতুন দিক</small></div>
      )}
     </div>
    </section>
    <button className="btn-primary" onClick={next}>{i===2?'আমার ডিজিটাল রিফ্লেক্স দেখুন':'এগিয়ে যান to next scenario'} <ArrowRight/></button>
   </main>
  }

  {screen==='results'&&
   <main className="results-page">
    <section className="results-hero">
     <div>
      <span className="stage-chip">ডিজিটাল রিফ্লেক্স প্রোফাইল</span>
      <h1>{score>=85?'দায়িত্বশীল ডিজিটাল সিদ্ধান্তে শক্তিশালী অভ্যাস':score>=65?'দায়িত্বশীল ডিজিটাল অভ্যাস দ্রুত গড়ে উঠছে':'ডিজিটাল সচেতনতা গড়ে উঠছে'}</h1>
      <p>এই প্রোফাইল শুধু এই সেশনে আপনার নেওয়া সিদ্ধান্তগুলোকে সংক্ষেপে দেখায়। এটি শেখার প্রতিফলন—কোনো ব্যক্তিগত মূল্যায়ন নয়।</p>
     </div>
     <div className="score-block"><small>সেশন স্কোর</small><strong>{score}</strong><span>/100</span></div>
    </section>

    <section className="dimension-board">
     <div className="board-heading"><div><small>আপনার ৫টি ডিজিটাল রিফ্লেক্স</small><h2>কোন জায়গায় আপনার অনুশীলন সবচেয়ে শক্তিশালী ছিল।</h2></div><span>বেশি স্কোর = এই সেশনে তুলনামূলক নিরাপদ সিদ্ধান্ত</span></div>
     <div className="dimension-list">
      {dimensions.map((d,n)=><div className="dimension-row" key={d.label}>
       <span>0{n+1}</span><b>{d.label}</b><div><i style={{width:d.value+'%'}}/></div><strong>{d.value}</strong>
      </div>)}
     </div>
    </section>

    <section className="scenario-summary">
     {scenarios.map((x,n)=><article key={x.id}><small>দৃশ্য ০{n+1}</small><b>{x.title}</b><strong>{results[n]||0}<span>/100</span></strong></article>)}
    </section>

    <div className="results-note"><Info/><p>এটি শুধু এই সেশনের শেখার সূচক। এটি মনস্তাত্ত্বিক মূল্যায়ন, বৈজ্ঞানিকভাবে যাচাইকৃত প্রভাব বা pilot result নয়।</p></div>

    <footer className="results-footer">
     <div><span className="brand-mark">R</span><div><b>#প্রতিটি_ক্লিকের_প্রভাব</b><small>প্রতিটি ক্লিকেরই পরিণতি আছে।</small></div></div>
     <button className="btn-secondary" onClick={reset}><RefreshCw/> আবার শুরু করুন</button>
    </footer>
   </main>
  }
 </div>
}
ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
