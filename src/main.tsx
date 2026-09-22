import React, {useEffect,useState} from 'react';
import ReactDOM from 'react-dom/client';
import {ArrowRight,CheckCircle2,Gauge,Heart,Info,Pause,Play,RefreshCw,RotateCcw,Search,Share2,Shield,ShieldCheck,Sparkles,Users} from 'lucide-react';
import './styles.css';
import {hasAnalyticsConsent,setAnalyticsConsent,track} from './tracking';

type Locale='en'|'bn';
type Metrics={reach:number;hostility:number;safety:number;trust:number};
type Choice={id:string;label:string;helper:string;kind:'risk'|'safe'|'neutral'|'support';delta:Partial<Metrics>;score:number;title:string;body:string};
type Scenario={id:string;title:string;tag:string;intro:string;post:string;prompt:string;choices:Choice[];peace:Choice[];xray:{t:string;s:string;b:string}[];shield?:string[]};

const base:Metrics={reach:48,hostility:34,safety:70,trust:66};

const scenariosEn:Scenario[]=[
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

const scenariosBn:Scenario[]=[
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

const ui={
 en:{
  navMeta:'Fictional digital community · Bangladesh', hero:'Every click has a', heroAccent:'consequence.', heroBody:'Experience how online harm spreads. Rewind the moment. Practise a safer response. See what changed.',
  start:'Enter Nodi', resume:'Continue', duration:'6–8 minutes', noLogin:'No login', privacy:'No sensitive story submission', cost:'৳0 software cost',
  guideKicker:'Before you begin', guideTitle:'Three simple steps. That’s it.', guideBody:'You do not need to learn the interface. Just follow the numbers and make the choice that feels most natural to you.',
  g1Title:'Choose naturally', g1Body:'On the first choice, pick what you would actually do. Do not try to guess the “correct” answer.',
  g2Title:'See the ripple', g2Body:'RIPPLE shows how that decision changes reach, hostility, safety and trust inside the simulation.',
  g3Title:'Rewind & retry', g3Body:'Return to the same moment, practise a safer response, then finish all three scenarios.',
  guideCta:'Got it — continue', guideBack:'Back',
  noticeKicker:'Before you enter Nodi', noticeTitle:'A safe simulation, not a real incident', noticeBody:'All scenarios are fictional composites. No real person, community or political actor is accused. You can exit any time, and no sensitive disclosure is required.',
  n1:'No login or personal data',n2:'Scores describe in-app choices only',n3:'Simulation indicators are not real-world causal estimates',
  consentTitle:'Share anonymous pilot usage data',consentBody:'Optional. We record only steps, choices, timing, completion and device class — never your name, phone, email, GPS or personal story.', noticeCta:'I understand — enter Nodi',
  scenario:'Scenario', welcome:'Welcome to Nodi', welcomeBody:'A fictional digital community of 10,000 people. Your choices change what happens next.', seePost:'See the post',
  mirror:'MIRROR · first instinct', mirrorHelp:'No score is shown yet. Choose what you would most naturally do.',
  simulation:'SIMULATION', now:'now',
  ripple:'RIPPLE ENGINE', rippleTitle:'One action. Multiple consequences.', rippleBody:'Watch how this simulation responds to your first decision.',
  click:'Your click', network:'Network effect', human:'Human consequence', indicators:'Simulation indicators · not effect sizes', reflectBtn:'Reflect on what changed',
  reflect:'REFLECT', reflectTitle:'What changed because of your action?', reflectNote:'The point is not to label a person “good” or “bad.” It is to make consequences visible enough to practise a different decision.', rewindBtn:'Rewind the moment',
  rewind:'REWIND', rewindTitle:'You saw the ripple. Now change the first click.', rewindBody:'The timeline is yours again. Practise a response that protects context, people and trust.', peaceBtn:'Try the PEACE path',
  peace:'PEACE · practise again', peaceTitle:'Choose a safer path.', peaceBody:'Safer responses can have trade-offs. The goal is evidence-informed practice.',
  xray:'MANIPULATION X-RAY', xrayTitle:'Make invisible cues visible.', xrayBody:'Tap at least one signal to inspect it.', inspect:'Tap to inspect this signal.', signals:'signals inspected', continue:'Continue',
  shield:'SHIELD MODE', shieldTitle:'Turn support into a safer sequence.', shieldBody:'Educational guidance — not emergency support.', step:'STEP', of:'OF', back:'Back', finishShield:'Finish SHIELD', nextStep:'Next step',
  complete:'COMPLETE', completeTitle:'The first click changed. So did the ripple.', safer:'safer direction', nextScenario:'Continue to next scenario', profileBtn:'See my Digital Reflex Profile',
  profile:'DIGITAL REFLEX PROFILE', strong:'Strong peacebuilding reflexes', developing:'Developing strong reflexes', growing:'Growing digital awareness', profileBody:'A transparent learning summary based only on choices made inside this simulation.',
  sessionScore:'Session score', reflexes:'YOUR FIVE REFLEXES', higher:'Higher = safer in-session choices',
  d1:'Verify before sharing',d2:'Manipulation detection',d3:'Bystander response',d4:'Target support',d5:'De-escalation',
  resultNote:'This score is an in-session learning indicator — not a psychological diagnosis, validated impact estimate or pilot result. Submission evidence must come from a separate consented pilot.',
  replay:'Replay experience', exit:'Exit', metricReach:'Reach',metricHostility:'Hostility',metricSafety:'Safety',metricTrust:'Trust', beforeAfter:'Before → after',
  stages:['MIRROR','RIPPLE','REWIND','PEACE','REFLECT'], stageHelp:['Choose naturally','See what changes','Return to the moment','Practise a safer path','Leave with a reflex']
 },
 bn:{
  navMeta:'কাল্পনিক ডিজিটাল কমিউনিটি · বাংলাদেশ', hero:'প্রতিটি ক্লিকেরই', heroAccent:'পরিণতি আছে।', heroBody:'অনলাইনে ক্ষতি কীভাবে ছড়ায় দেখুন। একই মুহূর্তে ফিরে যান, আরও নিরাপদ প্রতিক্রিয়া অনুশীলন করুন, তারপর দেখুন কী বদলেছে।',
  start:'নদীতে প্রবেশ করুন', resume:'চালিয়ে যান', duration:'৬–৮ মিনিট', noLogin:'লগইন লাগবে না', privacy:'ব্যক্তিগত গল্প দিতে হবে না', cost:'৳০ সফটওয়্যার খরচ',
  guideKicker:'শুরু করার আগে', guideTitle:'মাত্র ৩টি ধাপ। খুব সহজ।', guideBody:'ইন্টারফেস শেখার দরকার নেই। শুধু ১–২–৩ অনুসরণ করুন এবং প্রথম সিদ্ধান্তে বাস্তবে যা করতেন সেটিই বেছে নিন।',
  g1Title:'নিজের মতো সিদ্ধান্ত নিন', g1Body:'প্রথমবার বাস্তবে যা করতেন সেটিই বেছে নিন। “সঠিক উত্তর” আন্দাজ করার চেষ্টা করবেন না।',
  g2Title:'প্রভাব দেখুন', g2Body:'আপনার সিদ্ধান্তে নাগাল, উত্তেজনা, নিরাপত্তা ও আস্থা কীভাবে বদলায়—RIPPLE তা দেখাবে।',
  g3Title:'ফিরে গিয়ে আবার চেষ্টা করুন', g3Body:'একই মুহূর্তে ফিরে গিয়ে আরও নিরাপদ প্রতিক্রিয়া অনুশীলন করুন। এভাবে ৩টি দৃশ্য শেষ করুন।',
  guideCta:'বুঝেছি — এগিয়ে যাই', guideBack:'ফিরে যান',
  noticeKicker:'নদীতে ঢোকার আগে', noticeTitle:'এটি নিরাপদ অনুশীলন — বাস্তব ঘটনা নয়', noticeBody:'সব দৃশ্যই কাল্পনিক। কোনো বাস্তব ব্যক্তি, সম্প্রদায় বা রাজনৈতিক পক্ষকে অভিযুক্ত করা হয়নি। যেকোনো সময় বের হতে পারবেন, এবং কোনো সংবেদনশীল ব্যক্তিগত তথ্য দিতে হবে না।',
  n1:'লগইন বা ব্যক্তিগত তথ্য লাগবে না',n2:'স্কোর শুধু এই অ্যাপের সিদ্ধান্ত বোঝায়',n3:'সিমুলেশন সূচক বাস্তব জগতের প্রভাবের মাপ নয়',
  consentTitle:'নামবিহীন pilot usage data শেয়ার করতে রাজি',consentBody:'ঐচ্ছিক। শুধু ধাপ, পছন্দ, সময়, completion ও device class রেকর্ড হবে — নাম, ফোন, ইমেইল, GPS বা ব্যক্তিগত গল্প নয়।', noticeCta:'বুঝেছি — নদীতে প্রবেশ করি',
  scenario:'দৃশ্য', welcome:'নদীতে স্বাগতম', welcomeBody:'১০,০০০ মানুষের একটি কাল্পনিক ডিজিটাল কমিউনিটি। আপনার সিদ্ধান্তে পরের ঘটনা বদলাবে।', seePost:'পোস্টটি দেখুন',
  mirror:'MIRROR · প্রথম সিদ্ধান্ত', mirrorHelp:'এখনো কোনো স্কোর দেখানো হচ্ছে না। বাস্তবে যা করতেন সেটিই বেছে নিন।',
  simulation:'সিমুলেশন', now:'এখন',
  ripple:'RIPPLE ENGINE', rippleTitle:'একটি সিদ্ধান্ত, একাধিক প্রভাব।', rippleBody:'আপনার প্রথম সিদ্ধান্তে সিমুলেশন কীভাবে বদলায় দেখুন।',
  click:'আপনার সিদ্ধান্ত', network:'অনলাইনে ছড়িয়ে পড়ার প্রভাব', human:'মানুষের ওপর প্রভাব', indicators:'সিমুলেশন সূচক · বাস্তব effect size নয়', reflectBtn:'কী বদলেছে দেখি',
  reflect:'REFLECT', reflectTitle:'আপনার সিদ্ধান্তের কারণে কী বদলেছে?', reflectNote:'উদ্দেশ্য কাউকে “ভালো” বা “খারাপ” বলা নয়। উদ্দেশ্য হলো পরিণতি এতটা পরিষ্কার করা, যাতে নতুন সিদ্ধান্ত অনুশীলন করা যায়।', rewindBtn:'মুহূর্তে ফিরে যান',
  rewind:'REWIND', rewindTitle:'প্রভাব দেখেছেন। এবার প্রথম সিদ্ধান্তটি বদলান।', rewindBody:'একই মুহূর্ত আবার আপনার সামনে। এবার প্রেক্ষাপট, মানুষ ও আস্থা রক্ষা করে এমন প্রতিক্রিয়া অনুশীলন করুন।', peaceBtn:'PEACE পথে আবার চেষ্টা করুন',
  peace:'PEACE · দ্বিতীয় চেষ্টা', peaceTitle:'আরও নিরাপদ পথ বেছে নিন।', peaceBody:'নিরাপদ প্রতিক্রিয়াতেও কিছু সমঝোতা থাকতে পারে। লক্ষ্য হলো তথ্যভিত্তিক অনুশীলন।',
  xray:'MANIPULATION X-RAY', xrayTitle:'লুকানো সংকেতগুলো দৃশ্যমান করুন।', xrayBody:'অন্তত একটি সংকেত খুলে দেখুন।', inspect:'কেন এটি গুরুত্বপূর্ণ জানতে খুলুন।', signals:'টি সংকেত দেখা হয়েছে', continue:'এগিয়ে যান',
  shield:'SHIELD MODE', shieldTitle:'সহায়তাকে ধাপে ধাপে নিরাপদ করুন।', shieldBody:'এটি শেখার নির্দেশনা — জরুরি সহায়তা নয়।', step:'ধাপ', of:'এর মধ্যে', back:'পেছনে', finishShield:'SHIELD শেষ করুন', nextStep:'পরের ধাপ',
  complete:'সম্পন্ন', completeTitle:'প্রথম সিদ্ধান্ত বদলেছে — তার সঙ্গে বদলেছে প্রভাবও।', safer:'আরও নিরাপদ দিক', nextScenario:'পরের দৃশ্যে যান', profileBtn:'আমার Digital Reflex Profile দেখুন',
  profile:'DIGITAL REFLEX PROFILE', strong:'দায়িত্বশীল ডিজিটাল সিদ্ধান্তে শক্তিশালী অভ্যাস', developing:'দায়িত্বশীল ডিজিটাল অভ্যাস গড়ে উঠছে', growing:'ডিজিটাল সচেতনতা তৈরি হচ্ছে', profileBody:'এই প্রোফাইল শুধু এই সেশনে আপনার নেওয়া সিদ্ধান্তগুলোর শেখার সারাংশ।',
  sessionScore:'সেশন স্কোর', reflexes:'আপনার ৫টি ডিজিটাল রিফ্লেক্স', higher:'বেশি স্কোর = এই সেশনে তুলনামূলক নিরাপদ সিদ্ধান্ত',
  d1:'শেয়ার করার আগে যাচাই',d2:'প্রভাবিত করার কৌশল শনাক্ত',d3:'দর্শক হিসেবে দায়িত্বশীল প্রতিক্রিয়া',d4:'আক্রান্ত ব্যক্তিকে সহায়তা',d5:'উত্তেজনা কমানো',
  resultNote:'এটি শুধু এই সেশনের শেখার সূচক — মনস্তাত্ত্বিক মূল্যায়ন, বৈজ্ঞানিকভাবে যাচাইকৃত প্রভাব বা pilot result নয়।',
  replay:'আবার শুরু করুন', exit:'বের হোন', metricReach:'নাগাল',metricHostility:'উত্তেজনা',metricSafety:'নিরাপত্তা',metricTrust:'আস্থা', beforeAfter:'আগে → পরে',
  stages:['MIRROR','RIPPLE','REWIND','PEACE','REFLECT'], stageHelp:['নিজের মতো সিদ্ধান্ত নিন','কী বদলায় দেখুন','মুহূর্তে ফিরে যান','নিরাপদ পথ অনুশীলন করুন','নতুন অভ্যাস নিয়ে শেষ করুন']
 }
};

const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const metrics=(c:Choice):Metrics=>({reach:clamp(base.reach+(c.delta.reach||0)),hostility:clamp(base.hostility+(c.delta.hostility||0)),safety:clamp(base.safety+(c.delta.safety||0)),trust:clamp(base.trust+(c.delta.trust||0))});

function LanguageSwitch({locale,onChange}:{locale:Locale;onChange:(l:Locale)=>void}){
 return <div className="language-switch" aria-label="Language">
  <button className={locale==='en'?'active':''} onClick={()=>onChange('en')}>EN</button>
  <button className={locale==='bn'?'active':''} onClick={()=>onChange('bn')}>বাংলা</button>
 </div>;
}

function App(){
 const [locale,setLocale]=useState<Locale>('en');
 const [screen,setScreen]=useState('landing');
 const [i,setI]=useState(0);
 const [bId,setBId]=useState<string|null>(null);
 const [pId,setPId]=useState<string|null>(null);
 const [results,setResults]=useState<number[]>(()=>JSON.parse(localStorage.getItem('ripple-results')||'[]'));
 const [seen,setSeen]=useState<number[]>([]);
 const [shield,setShield]=useState(0);
 const [analyticsConsent,setConsentState]=useState(()=>hasAnalyticsConsent());
 const [screenStartedAt,setScreenStartedAt]=useState(()=>Date.now());

 const t=ui[locale];
 const scenarios=locale==='en'?scenariosEn:scenariosBn;
 const s=scenarios[i]!;
 const b=bId?s.choices.find(x=>x.id===bId)||null:null;
 const p=pId?s.peace.find(x=>x.id===pId)||null:null;

 useEffect(()=>{
  document.documentElement.lang=locale;
  document.title=locale==='en'?'RIPPLE BD — CHAOS → PEACE':'RIPPLE BD — বিশৃঙ্খলা → শান্তি';
  track('language_changed',{screen,scenario_id:s.id,scenario_index:i+1});
 },[locale]);

 useEffect(()=>{
  localStorage.setItem('ripple-results',JSON.stringify(results));
  window.scrollTo({top:0,behavior:'smooth'});
  setScreenStartedAt(Date.now());
  track('screen_view',{screen,scenario_id:s.id,scenario_index:i+1});
 },[results,screen,i]);

 const score=Math.round(results.reduce((a,n)=>a+(n||0),0)/Math.max(1,results.length));
 const dimensions=[
  {label:t.d1,value:results[0]||0},
  {label:t.d2,value:Math.round(((results[0]||0)+(results[2]||0))/2)},
  {label:t.d3,value:results[1]||0},
  {label:t.d4,value:Math.round(((results[1]||0)+(results[2]||0))/2)},
  {label:t.d5,value:Math.round(((results[0]||0)+(results[1]||0)+(results[2]||0))/3)}
 ];
 const metricLabel=(k:keyof Metrics)=>({reach:t.metricReach,hostility:t.metricHostility,safety:t.metricSafety,trust:t.metricTrust}[k]);

 const reset=()=>{
  localStorage.removeItem('ripple-results');
  setResults([]);setI(0);setBId(null);setPId(null);setSeen([]);setShield(0);setScreen('guide');
 };
 const resume=()=>{
  if(results.length>=3){setScreen('results');return}
  setI(results.length);setBId(null);setPId(null);setSeen([]);setShield(0);setScreen('intro');
 };
 const save=()=>{
  if(!b||!p)return;
  const scenarioScore=Math.round((b.score+p.score)/2);
  const next=[...results];next[i]=scenarioScore;setResults(next);
  track('scenario_completed',{screen:'complete',scenario_id:s.id,scenario_index:i+1,scenario_score:scenarioScore,duration_ms:Date.now()-screenStartedAt});
  setScreen('complete');
 };
 const next=()=>{
  if(i===2){track('session_complete',{screen:'results',session_score:score});setScreen('results')}
  else{setI(i+1);setBId(null);setPId(null);setSeen([]);setShield(0);setScreen('intro')}
 };
 const mm=(c:Choice)=>metrics(c);

 return <div className="app" data-locale={locale}>
  {screen!=='landing'&&screen!=='guide'&&screen!=='notice'&&
   <header className="app-header">
    <button className="brand-button" onClick={()=>setScreen('landing')}>
     <span className="logo">◎</span><span className="brand-text"><b>RIPPLE BD</b><small>CHAOS → PEACE</small></span>
    </button>
    <div className="scenario-progress">
     {scenarios.map((x,n)=><span key={x.id} className={n<i?'done':n===i?'active':''}>{n<i?'✓':n+1}</span>)}
    </div>
    <div className="header-actions"><LanguageSwitch locale={locale} onChange={setLocale}/><button className="exit-button" onClick={()=>setScreen('landing')}>{t.exit}</button></div>
   </header>
  }

  {screen==='landing'&&<main className="landing">
   <nav className="landing-nav">
    <div className="brand"><span className="logo">◎</span><div><b>RIPPLE BD</b><small>CHAOS → PEACE</small></div></div>
    <div className="nav-actions"><LanguageSwitch locale={locale} onChange={setLocale}/><span className="cost-pill">{t.cost}</span></div>
   </nav>
   <section className="hero">
    <div className="copy">
     <span className="pill">{t.navMeta}</span>
     <h1>{t.hero} <em>{t.heroAccent}</em></h1>
     <p>{t.heroBody}</p>
     <div className="actions">
      <button className="primary" onClick={reset}>{t.start}<ArrowRight/></button>
      {results.length>0&&<button className="secondary" onClick={resume}>{t.resume}</button>}
     </div>
     <div className="trust"><span><Gauge/>{t.duration}</span><span><ShieldCheck/>{t.noLogin}</span><span><Pause/>{t.privacy}</span></div>
    </div>
    <div className="rings" aria-hidden="true"><i/><i/><i/><strong><Sparkles/></strong></div>
   </section>
   <div className="loop">{t.stages.map((x,n)=><span key={x}><small>{'0'+(n+1)}</small><b>{x}</b><em>{t.stageHelp[n]}</em></span>)}</div>
  </main>}

  {screen==='guide'&&<main className="guide-page">
   <div className="page-tools"><LanguageSwitch locale={locale} onChange={setLocale}/></div>
   <section className="guide-panel">
    <span className="eyebrow">{t.guideKicker}</span>
    <h2>{t.guideTitle}</h2><p className="lead">{t.guideBody}</p>
    <div className="guide-grid">
     {[['01',t.g1Title,t.g1Body],['02',t.g2Title,t.g2Body],['03',t.g3Title,t.g3Body]].map(x=>
      <article key={x[0]}><span>{x[0]}</span><div><b>{x[1]}</b><p>{x[2]}</p></div></article>
     )}
    </div>
    <div className="guide-footer"><button className="secondary" onClick={()=>setScreen('landing')}>{t.guideBack}</button><button className="primary" onClick={()=>{track('guide_completed',{screen:'guide'});setScreen('notice')}}>{t.guideCta}<ArrowRight/></button></div>
   </section>
  </main>}

  {screen==='notice'&&<main className="center notice-page">
   <div className="page-tools"><LanguageSwitch locale={locale} onChange={setLocale}/></div>
   <div className="panel notice">
    <ShieldCheck className="big"/><span className="eyebrow">{t.noticeKicker}</span><h2>{t.noticeTitle}</h2><p>{t.noticeBody}</p>
    <div className="noticegrid"><span>✓ {t.n1}</span><span>✓ {t.n2}</span><span>✓ {t.n3}</span></div>
    <label className="consent-card"><input type="checkbox" checked={analyticsConsent} onChange={e=>setConsentState(e.target.checked)}/><span><b>{t.consentTitle}</b><small>{t.consentBody}</small></span></label>
    <button className="primary" onClick={()=>{setAnalyticsConsent(analyticsConsent);if(analyticsConsent){track('analytics_consent_granted',{screen:'notice'});track('app_open',{screen:'notice'});}setScreen('intro')}}>{t.noticeCta}<ArrowRight/></button>
   </div>
  </main>}

  {screen==='intro'&&<main className="center intro-page">
   <span className="eyebrow">{t.scenario} {'0'+(i+1)} · {s.tag}</span><h2>{s.title}</h2><p className="lead">{s.intro}</p>
   {i===0&&<div className="nodi"><span className="logo">◎</span><div><b>{t.welcome}</b><small>{t.welcomeBody}</small></div></div>}
   <button className="primary" onClick={()=>{track('scenario_started',{screen:'intro',scenario_id:s.id,scenario_index:i+1});setScreen('mirror')}}>{t.seePost}<ArrowRight/></button>
  </main>}

  {screen==='mirror'&&<main className="wide grid">
   <section><span className="eyebrow">{t.mirror}</span><h2>{s.prompt}</h2><p className="lead">{t.mirrorHelp}</p>
    <div className="choices">{s.choices.map((c,n)=><button key={c.id} className="choice mirror-choice" onClick={()=>{track('mirror_choice',{screen:'mirror',scenario_id:s.id,scenario_index:i+1,choice_id:c.id,choice_kind:c.kind,choice_score:c.score,duration_ms:Date.now()-screenStartedAt});setBId(c.id);setScreen('ripple')}}><span className="choice-number">{'0'+(n+1)}</span><div><b>{c.label}</b><small>{c.helper}</small></div><ArrowRight/></button>)}</div>
   </section>
   <article className="feed"><div className="feedtop"><span className="avatar">N</span><div><b>Nodi Feed</b><small>@nodi_live · {t.now}</small></div><label>{t.simulation}</label></div><p>{s.post}</p><div className="visual"><Play/></div><div className="stats"><span><Heart/>1.8k</span><span><Users/>426</span><span><Share2/>713</span></div></article>
  </main>}

  {screen==='ripple'&&b&&<main className="wide">
   <span className="eyebrow">{t.ripple}</span><h2>{t.rippleTitle}</h2><p className="lead">{t.rippleBody}</p>
   <div className="outcome"><div className="timeline"><span>1</span><div><small>{t.click}</small><b>{b.label}</b></div><span>2</span><div><small>{t.network}</small><b>{b.title}</b></div><span className="human"><Heart/></span><div><small>{t.human}</small><b>{b.body}</b></div></div>
    <div className="metrics"><small><Info/>{t.indicators}</small>{(['reach','hostility','safety','trust'] as (keyof Metrics)[]).map(k=>{const v=mm(b)[k],d=v-base[k],good=(k==='safety'||k==='trust')?d>=0:d<=0;return <div className="metric" key={k}><div><span>{metricLabel(k)}</span><b className={good?'good':'bad'}>{d>=0?'+':''}{d}</b></div><i><em style={{width:v+'%'}} className={good?'goodbg':'badbg'}/></i><small>{base[k]} → {v}</small></div>})}</div>
   </div>
   <button className="primary" onClick={()=>{track('ripple_viewed',{screen:'ripple',scenario_id:s.id,scenario_index:i+1});setScreen('reflect')}}>{t.reflectBtn}<ArrowRight/></button>
  </main>}

  {screen==='reflect'&&b&&<main className="center"><div className="panel">
   <span className="eyebrow">{t.reflect}</span><h2>{t.reflectTitle}</h2><blockquote>{b.body}</blockquote><p className="callout">{t.reflectNote}</p>
   <button className="primary" onClick={()=>{track('rewind_started',{screen:'reflect',scenario_id:s.id,scenario_index:i+1});setScreen('rewind')}}>{t.rewindBtn}<RotateCcw/></button>
  </div></main>}

  {screen==='rewind'&&<main className="center"><div className="panel rewind"><div className="miniRings"><i/><i/><i/><RotateCcw/></div><span className="eyebrow">{t.rewind}</span><h2>{t.rewindTitle}</h2><p className="lead">{t.rewindBody}</p><button className="primary" onClick={()=>setScreen('peace')}>{t.peaceBtn}<ArrowRight/></button></div></main>}

  {screen==='peace'&&<main className="center"><span className="eyebrow">{t.peace}</span><h2>{t.peaceTitle}</h2><p className="lead">{t.peaceBody}</p><div className="choices peace-choices">{s.peace.map((c,n)=><button key={c.id} className="choice peace-choice" onClick={()=>{track('peace_choice',{screen:'peace',scenario_id:s.id,scenario_index:i+1,choice_id:c.id,choice_kind:c.kind,choice_score:c.score,duration_ms:Date.now()-screenStartedAt});setPId(c.id);setSeen([]);setScreen('xray')}}><span className="choice-number">{'0'+(n+1)}</span><div><b>{c.label}</b><small>{c.helper}</small></div><ArrowRight/></button>)}</div></main>}

  {screen==='xray'&&<main className="wide"><span className="eyebrow">{t.xray}</span><h2>{t.xrayTitle}</h2><p className="lead">{t.xrayBody}</p>
   <div className="xray">{s.xray.map((x,n)=><button key={x.t} className={seen.includes(n)?'open':''} onClick={()=>setSeen(v=>{const opening=!v.includes(n);if(opening)track('xray_signal_opened',{screen:'xray',scenario_id:s.id,scenario_index:i+1,signals_count:v.length+1});return opening?[...v,n]:v.filter(z=>z!==n)})}><small>{'0'+(n+1)}</small><label>{x.s}</label><b>{x.t}</b><p>{seen.includes(n)?x.b:t.inspect}</p>{seen.includes(n)?<CheckCircle2/>:<Search/>}</button>)}</div>
   <div className="stick"><span><b>{seen.length}</b>/5 {t.signals}</span><button className="primary" disabled={!seen.length} onClick={()=>{track('xray_completed',{screen:'xray',scenario_id:s.id,scenario_index:i+1,signals_count:seen.length});s.shield?setScreen('shield'):save()}}>{t.continue}<ArrowRight/></button></div>
  </main>}

  {screen==='shield'&&s.shield&&<main className="center"><span className="eyebrow">{t.shield}</span><h2>{t.shieldTitle}</h2><p className="lead">{t.shieldBody}</p>
   <div className="shieldsteps">{s.shield.map((x,n)=><span key={x} className={n===shield?'active':n<shield?'done':''}>{n<shield?'✓':n+1}</span>)}</div>
   <div className="panel shield"><Shield/><small>{t.step} {shield+1} {t.of} 5</small><h3>{s.shield[shield]!.split(' — ')[0]}</h3><p>{s.shield[shield]!.split(' — ')[1]}</p></div>
   <div className="actions"><button className="secondary" disabled={shield===0} onClick={()=>setShield(shield-1)}>{t.back}</button><button className="primary" onClick={()=>{if(shield===4){track('shield_completed',{screen:'shield',scenario_id:s.id,scenario_index:i+1});save()}else setShield(shield+1)}}>{shield===4?t.finishShield:t.nextStep}<ArrowRight/></button></div>
  </main>}

  {screen==='complete'&&b&&p&&<main className="wide">
   <div className="success"><CheckCircle2/><span className="eyebrow">{t.scenario} {i+1} {t.complete}</span><h2>{t.completeTitle}</h2></div>
   <div className="compare">{(['reach','hostility','safety','trust'] as (keyof Metrics)[]).map(k=><div key={k}><span>{metricLabel(k)}</span><strong>{mm(b)[k]} → {mm(p)[k]}</strong><small>{t.safer}</small></div>)}</div>
   <div className="switch"><div><small>MIRROR</small><b>{b.label}</b></div><ArrowRight/><div><small>PEACE</small><b>{p.label}</b></div></div>
   <button className="primary" onClick={next}>{i===2?t.profileBtn:t.nextScenario}<ArrowRight/></button>
  </main>}

  {screen==='results'&&<main className="wide results">
   <section><span className="eyebrow">{t.profile}</span><h2>{score>=85?t.strong:score>=65?t.developing:t.growing}</h2><p className="lead">{t.profileBody}</p></section>
   <div className="orb"><strong>{score}</strong><span>/100</span><small>{t.sessionScore}</small></div>
   <div className="dimensions">{dimensions.map((d,n)=><div key={d.label}><div><span>{'0'+(n+1)}</span><b>{d.label}</b><strong>{d.value}%</strong></div><i><em style={{width:d.value+'%'}}/></i></div>)}</div>
   <div className="resultcards">{scenarios.map((x,n)=><div key={x.id}><small>{t.scenario} {n+1}</small><b>{x.title}</b><strong>{results[n]||0}%</strong></div>)}</div>
   <div className="callout result-note"><Info/><p>{t.resultNote}</p></div>
   <footer><div><b>#EveryClickRipples</b><small>{locale==='en'?'Every click has a consequence.':'প্রতিটি ক্লিকেরই পরিণতি আছে।'}</small></div><button className="secondary" onClick={reset}><RefreshCw/>{t.replay}</button></footer>
  </main>}
 </div>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
