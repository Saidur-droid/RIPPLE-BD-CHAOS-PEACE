import React, {useEffect,useState} from 'react';
import ReactDOM from 'react-dom/client';
import {ArrowRight,CheckCircle2,Gauge,Heart,Info,Pause,RefreshCw,RotateCcw,Search,Share2,Shield,ShieldCheck,Users} from 'lucide-react';
import './styles.css';
import {hasAnalyticsConsent,setAnalyticsConsent,track} from './tracking';
import {buildGeneratedScenarios,currentSessionIds,rotateSessionIds,type Locale,type Metrics,type Scenario,type Choice} from './scenarioEngine';

const base:Metrics={reach:48,hostility:34,safety:70,trust:66};

const scenariosEn:Scenario[]=[
{id:'clip',family:'verify',title:'The Cropped Clip',tag:'Misinformation · Interfaith tension',human:'A fictional family closes their small shop early after threatening messages target people who share their community identity. Their teenage daughter is told not to travel alone that evening.',intro:'A dramatic clip is moving fast through group chats and public feeds. The caption sounds certain. The source is not.',post:'“Everyone needs to see this NOW.” A 9-second cropped clip claims a local religious group attacked a community event. No original upload or location is shown.',prompt:'Your friend sends this to a group chat. What do you do first?',choices:[
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
{id:'meme',family:'bystander',title:'The Viral Meme',tag:'Cyberbullying · Gendered harassment',human:'Rima stops attending class for several days, deletes her public photos, and asks a friend to walk home with her because hostile DMs no longer feel confined to the screen.',intro:'A “joke” about a fictional student is becoming a pile-on. The crowd keeps making it harsher.',post:'A meme mocks fictional student Rima after a class presentation. Replies turn sexualized and a screenshot hints that hostile DMs have started.',prompt:'You know Rima casually. What is your first move?',choices:[
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
{id:'voice',family:'verify',title:'The Missing Voice',tag:'Source diversity · Inclusion',human:'A fictional young volunteer from the community receives angry messages demanding that she defend claims she never made, while outsiders keep defining her community for her.',intro:'A sweeping claim about a fictional minority community is everywhere. Everyone is speaking about them. Nobody from the community is quoted.',post:'“They do not want to integrate with the rest of us.” The post cites “people nearby” but gives no direct source, document or first-person voice.',prompt:'You are about to join the conversation. What do you do?',choices:[
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
{id:'clip',family:'verify',title:'কাটা ভিডিও',tag:'ভুল তথ্য · সাম্প্রদায়িক উত্তেজনা',human:'হুমকিমূলক বার্তায় একই পরিচয়ের মানুষদের টার্গেট করা শুরু হলে একটি কাল্পনিক পরিবার ছোট দোকানটি আগেই বন্ধ করে দেয়। তাদের কিশোরী মেয়েকে সেদিন একা বাইরে যেতে নিষেধ করা হয়।',intro:'গ্রুপ চ্যাট ও পাবলিক ফিডে একটি ছোট ভিডিও দ্রুত ছড়িয়ে পড়ছে। ক্যাপশন খুব নিশ্চিত—কিন্তু উৎসটি নয়।',post:'“সবাই এখনই দেখুন।” ৯ সেকেন্ডের একটি কাটা ভিডিওতে দাবি করা হচ্ছে, একটি স্থানীয় ধর্মীয় গোষ্ঠী একটি কমিউনিটি অনুষ্ঠানে হামলা করেছে। মূল ভিডিও, তারিখ বা জায়গার কোনো নির্ভরযোগ্য তথ্য নেই।',prompt:'বন্ধু ভিডিওটি গ্রুপ চ্যাটে পাঠাল। আপনি প্রথমে কী করবেন?',choices:[
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

{id:'meme',family:'bystander',title:'ভাইরাল মিম',tag:'সাইবার বুলিং · লিঙ্গভিত্তিক হয়রানি',human:'রিমা কয়েকদিন ক্লাসে যায় না, নিজের পাবলিক ছবি মুছে দেয় এবং শত্রুতাপূর্ণ DM আর শুধু স্ক্রিনে সীমাবদ্ধ থাকবে কি না—এই ভয়ে বন্ধুকে সঙ্গে নিয়ে বাসায় ফিরতে বলে।',intro:'একজন কাল্পনিক শিক্ষার্থীকে নিয়ে “মজা” এখন দলবদ্ধ অপমানে পরিণত হচ্ছে। মন্তব্যগুলো ক্রমেই কঠোর হচ্ছে।',post:'ক্লাস প্রেজেন্টেশনের পর কাল্পনিক শিক্ষার্থী রিমাকে নিয়ে একটি মিম ছড়িয়েছে। মন্তব্যগুলো যৌন ইঙ্গিতপূর্ণ হয়ে উঠেছে এবং একটি স্ক্রিনশটে শত্রুতাপূর্ণ ব্যক্তিগত মেসেজের ইঙ্গিত আছে।',prompt:'রিমাকে আপনি চেনেন। আপনার প্রথম পদক্ষেপ কী?',choices:[
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

{id:'voice',family:'verify',title:'অনুপস্থিত কণ্ঠ',human:'কমিউনিটির একজন কাল্পনিক তরুণ স্বেচ্ছাসেবক এমন দাবির জবাব দিতে রাগান্বিত বার্তা পায় যা সে কখনো করেনি, অথচ বাইরের লোকজন তার কমিউনিটির গল্প তার হয়ে বলে যেতে থাকে।',tag:'উৎসের বৈচিত্র্য · অন্তর্ভুক্তি',intro:'একটি কাল্পনিক সংখ্যালঘু সম্প্রদায়কে নিয়ে বড় একটি দাবি ছড়াচ্ছে। সবাই তাদের নিয়ে কথা বলছে—কিন্তু তাদের কারও সরাসরি বক্তব্য নেই।',post:'“ওরা আমাদের সঙ্গে মিশতে চায় না।” পোস্টটি “এলাকার লোকজন”কে উৎস হিসেবে উল্লেখ করেছে, কিন্তু কোনো সরাসরি সাক্ষ্য, নথি বা সংশ্লিষ্ট ব্যক্তির বক্তব্য নেই।',prompt:'আপনি আলোচনায় যোগ দিতে যাচ্ছেন। প্রথমে কী করবেন?',choices:[
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
  navMeta:'Interactive digital safety practice · Bangladesh', hero:'A small online action can', heroAccent:'hurt — or protect someone.', heroBody:'See a realistic social-media situation, make the choice you would actually make, then see who is affected. Rewind it and try a safer response.',
  start:'Start', resume:'Continue session', howItWorks:'How it works', duration:'6–8 minutes', noLogin:'No login', privacy:'No personal story required', cost:'৳0 software cost',
  guideKicker:'How it works', guideTitle:'See it. See the impact. Redo it better.', guideBody:'You will complete three short fictional scenarios. The goal is not to guess a perfect answer — it is to see how a small digital action can affect a real person’s safety, reputation or daily life.',
  g1Title:'See a realistic post', g1Body:'Read a fictional post designed to feel like the situations people meet in feeds, group chats and campus communities.',
  g2Title:'See who gets affected', g2Body:'Your first action leads to a clear human consequence. Small simulation indicators support the story; they are not real-world predictions.',
  g3Title:'Redo the moment', g3Body:'Rewind to the same post, choose a safer action, then compare the two outcomes side by side.',
  guideCta:'Start the scenarios', guideBack:'Back',
  noticeKicker:'Before you start', noticeTitle:'Fictional practice, real-world patterns', noticeBody:'Every scenario is fictional or fictionalized. No real person is depicted, and simulated activity numbers are not real data. The situations are inspired by common patterns of online harm.',
  n1:'No login or personal data',n2:'Scenario activity is simulated',n3:'Impact indicators are learning aids, not predictions',
  consentTitle:'Share anonymous pilot usage data',consentBody:'Optional. We record only steps, choices, timing, completion and device class — never your name, phone, email, GPS or personal story.', noticeCta:'Start scenario 1',
  scenario:'Scenario', welcome:'Three scenarios. One simple question.', welcomeBody:'What would you actually do when a risky post appears on your screen?', seePost:'See the post',
  mirror:'YOUR FIRST MOVE', mirrorHelp:'Choose what you would actually do first. No score is shown yet.',
  simulation:'FICTIONAL PRACTICE POST', now:'2m',
  ripple:'WHAT HAPPENED NEXT', rippleTitle:'Your action changed what happened next.', rippleBody:'First see the human impact. The small indicators underneath are only there to support the story.',
  click:'Your first action', network:'What spread online', human:'Who felt it offline', indicators:'Supporting simulation indicators · not real-world effect sizes', reflectBtn:'See who was affected',
  reflect:'WHO WAS AFFECTED', reflectTitle:'The harm does not stay on the screen.', reflectNote:'This is a fictional consequence pathway. It shows a plausible way online amplification can affect a person’s safety, reputation, study, work, relationships or daily movement.', rewindBtn:'Try that moment again',
  rewind:'TRY THE MOMENT AGAIN', rewindTitle:'Same post. Better choice.', rewindBody:'Go back to the exact decision point. This time, choose an action that reduces spread, protects the person affected, or adds verified context.', peaceBtn:'Choose a safer action',
  peace:'SAFER RETRY', peaceTitle:'What would you do differently now?', peaceBody:'Choose the response that best reduces harm while protecting context, evidence and the person affected.',
  xray:'WHY THIS POST DESERVES A PAUSE', xrayTitle:'Spot the warning signs.', xrayBody:'Open at least one signal. These are the cues that should slow a share, reaction or reply.', inspect:'Open to see why this matters.', signals:'signals checked', continue:'See the outcome',
  shield:'SUPPORT SAFELY', shieldTitle:'If a person is being targeted, what helps?', shieldBody:'A simple support sequence for practice — not emergency guidance.', step:'STEP', of:'OF', back:'Back', finishShield:'Finish support steps', nextStep:'Next step',
  complete:'DONE', completeTitle:'Now compare the two futures.', safer:'after safer retry', nextScenario:'Next scenario', profileBtn:'See what I practised',
  profile:'YOUR SESSION SUMMARY', strong:'Strong safer-choice practice', developing:'Safer digital habits are developing', growing:'You are building safer digital habits', profileBody:'A learning summary based only on the three choices you made inside this practice session.',
  sessionScore:'Session score', reflexes:'YOUR FIVE REFLEXES', higher:'Higher = safer in-session choices',
  d1:'Verify before sharing',d2:'Manipulation detection',d3:'Bystander response',d4:'Target support',d5:'De-escalation',
  resultNote:'This score is an in-session learning indicator — not a psychological diagnosis, validated impact estimate or pilot result. Submission evidence must come from a separate consented pilot.',
  replay:'Replay experience', exit:'Exit', metricReach:'Reach',metricHostility:'Hostility',metricSafety:'Safety',metricTrust:'Trust', beforeAfter:'Before → after',
  stages:['MIRROR','RIPPLE','REWIND','PEACE','REFLECT'], stageHelp:['Choose naturally','See what changes','Return to the moment','Practise a safer path','Leave with a reflex']
 },
 bn:{
  navMeta:'ইন্টার‍্যাকটিভ ডিজিটাল সেফটি প্র্যাকটিস · বাংলাদেশ', hero:'একটি ছোট অনলাইন কাজ কাউকে', heroAccent:'ক্ষতি করতে পারে — আবার রক্ষা করতেও পারে।', heroBody:'বাস্তব সামাজিক-মাধ্যমের মতো একটি পরিস্থিতি দেখুন, নিজের মতো সিদ্ধান্ত নিন, তারপর দেখুন সেই সিদ্ধান্তে কার ওপর কী প্রভাব পড়ে। একই মুহূর্তে ফিরে গিয়ে আরও নিরাপদভাবে আবার চেষ্টা করুন।',
  start:'শুরু করুন', resume:'সেশন চালিয়ে যান', howItWorks:'কীভাবে কাজ করে', duration:'৬–৮ মিনিট', noLogin:'লগইন লাগবে না', privacy:'ব্যক্তিগত গল্প দিতে হবে না', cost:'৳০ সফটওয়্যার খরচ',
  guideKicker:'কীভাবে কাজ করে', guideTitle:'দেখুন। প্রভাব বুঝুন। আবার ভালোভাবে করুন।', guideBody:'আপনি ৩টি ছোট কাল্পনিক দৃশ্য শেষ করবেন। লক্ষ্য “সঠিক উত্তর” আন্দাজ করা নয়—ছোট একটি অনলাইন কাজ কীভাবে কারও নিরাপত্তা, সুনাম বা দৈনন্দিন জীবনে প্রভাব ফেলতে পারে তা পরিষ্কারভাবে দেখা।',
  g1Title:'বাস্তবের মতো পোস্ট দেখুন', g1Body:'ফিড, গ্রুপ চ্যাট বা ক্যাম্পাস কমিউনিটিতে দেখা যায়—এমন পরিস্থিতির মতো একটি কাল্পনিক পোস্ট পড়ুন।',
  g2Title:'কার ওপর প্রভাব পড়ল দেখুন', g2Body:'আপনার প্রথম কাজের পর স্পষ্ট মানবিক পরিণতি দেখানো হবে। ছোট সিমুলেশন সূচকগুলো শুধু ব্যাখ্যায় সহায়তা করবে; এগুলো বাস্তব ভবিষ্যদ্বাণী নয়।',
  g3Title:'মুহূর্তটা আবার করুন', g3Body:'একই পোস্টে ফিরে গিয়ে আরও নিরাপদ সিদ্ধান্ত নিন, তারপর দুই ফলাফল পাশাপাশি তুলনা করুন।',
  guideCta:'দৃশ্যগুলো শুরু করুন', guideBack:'ফিরে যান',
  noticeKicker:'শুরু করার আগে', noticeTitle:'কাল্পনিক অনুশীলন, বাস্তব জীবনের পরিচিত ধরণ', noticeBody:'প্রতিটি দৃশ্য কাল্পনিক বা কাল্পনিকভাবে পুনর্গঠিত। কোনো বাস্তব ব্যক্তিকে দেখানো হয়নি এবং activity সংখ্যা বাস্তব data নয়। পরিস্থিতিগুলো অনলাইনে দেখা সাধারণ ক্ষতির ধরণ থেকে অনুপ্রাণিত।',
  n1:'লগইন বা ব্যক্তিগত তথ্য লাগবে না',n2:'পোস্টের activity সংখ্যা সিমুলেটেড',n3:'Impact সূচক শেখার সহায়ক, ভবিষ্যদ্বাণী নয়',
  consentTitle:'নামবিহীন pilot usage data শেয়ার করতে রাজি',consentBody:'ঐচ্ছিক। শুধু ধাপ, পছন্দ, সময়, completion ও device class রেকর্ড হবে — নাম, ফোন, ইমেইল, GPS বা ব্যক্তিগত গল্প নয়।', noticeCta:'দৃশ্য ১ শুরু করুন',
  scenario:'দৃশ্য', welcome:'৩টি দৃশ্য। একটাই সহজ প্রশ্ন।', welcomeBody:'ঝুঁকিপূর্ণ একটি পোস্ট আপনার স্ক্রিনে এলে আপনি আসলে কী করতেন?', seePost:'পোস্টটি দেখুন',
  mirror:'আপনার প্রথম কাজ', mirrorHelp:'প্রথমে আপনি বাস্তবে যা করতেন সেটিই বেছে নিন। এখন কোনো স্কোর দেখানো হচ্ছে না।',
  simulation:'কাল্পনিক প্র্যাকটিস পোস্ট', now:'২ মিনিট',
  ripple:'এরপর কী হলো', rippleTitle:'আপনার কাজের পর ঘটনাটা বদলে গেল।', rippleBody:'প্রথমে মানুষের ওপর প্রভাব দেখুন। নিচের ছোট সূচকগুলো শুধু গল্পটি বুঝতে সাহায্য করবে।',
  click:'আপনার প্রথম কাজ', network:'অনলাইনে কী ছড়াল', human:'স্ক্রিনের বাইরে কে প্রভাবিত হলো', indicators:'সহায়ক সিমুলেশন সূচক · বাস্তব effect size নয়', reflectBtn:'কার ওপর প্রভাব পড়ল দেখি',
  reflect:'কার ওপর প্রভাব পড়ল', reflectTitle:'ক্ষতি শুধু স্ক্রিনে থেমে থাকে না।', reflectNote:'এটি একটি কাল্পনিক consequence pathway। অনলাইনে ছড়িয়ে পড়া কীভাবে কারও নিরাপত্তা, সুনাম, পড়াশোনা, কাজ, সম্পর্ক বা দৈনন্দিন চলাচলে প্রভাব ফেলতে পারে—তা বোঝাতে এটি তৈরি।', rewindBtn:'মুহূর্তটা আবার চেষ্টা করুন',
  rewind:'মুহূর্তটা আবার চেষ্টা করুন', rewindTitle:'একই পোস্ট। এবার আরও ভালো সিদ্ধান্ত।', rewindBody:'ঠিক সেই সিদ্ধান্তের জায়গায় ফিরে যান। এবার এমন একটি কাজ বেছে নিন যা ছড়িয়ে পড়া কমায়, আক্রান্ত ব্যক্তিকে রক্ষা করে বা যাচাইকৃত প্রেক্ষাপট যোগ করে।', peaceBtn:'আরও নিরাপদ কাজ বেছে নিন',
  peace:'আরও নিরাপদ দ্বিতীয় চেষ্টা', peaceTitle:'এবার আপনি কী আলাদা করবেন?', peaceBody:'যে প্রতিক্রিয়া ক্ষতি কমায় এবং প্রেক্ষাপট, প্রমাণ ও আক্রান্ত ব্যক্তির নিয়ন্ত্রণ রক্ষা করে—সেটি বেছে নিন।',
  xray:'কেন এই পোস্টে থামা দরকার', xrayTitle:'সতর্কতার সংকেতগুলো খুঁজুন।', xrayBody:'অন্তত একটি সংকেত খুলুন। এগুলোই share, reaction বা reply দেওয়ার আগে থামার কারণ।', inspect:'কেন গুরুত্বপূর্ণ দেখুন।', signals:'টি সংকেত দেখা হয়েছে', continue:'ফলাফল দেখুন',
  shield:'নিরাপদভাবে সহায়তা করুন', shieldTitle:'কেউ টার্গেট হলে কীভাবে সাহায্য করবেন?', shieldBody:'সহায়তার সহজ অনুশীলন — জরুরি নির্দেশনা নয়।', step:'ধাপ', of:'এর মধ্যে', back:'পেছনে', finishShield:'সহায়তার ধাপ শেষ করুন', nextStep:'পরের ধাপ',
  complete:'শেষ', completeTitle:'এখন দুই ফলাফল পাশাপাশি দেখুন।', safer:'নিরাপদ দ্বিতীয় সিদ্ধান্তের পর', nextScenario:'পরের দৃশ্য', profileBtn:'আমি কী অনুশীলন করেছি দেখুন',
  profile:'আপনার সেশন সারাংশ', strong:'নিরাপদ সিদ্ধান্তের শক্তিশালী অনুশীলন', developing:'নিরাপদ ডিজিটাল অভ্যাস গড়ে উঠছে', growing:'আপনি নিরাপদ ডিজিটাল অভ্যাস তৈরি করছেন', profileBody:'এই সারাংশ শুধু এই সেশনের ৩টি অনুশীলনের সিদ্ধান্তের ওপর ভিত্তি করে।',
  sessionScore:'সেশন স্কোর', reflexes:'আপনার ৫টি ডিজিটাল রিফ্লেক্স', higher:'বেশি স্কোর = এই সেশনে তুলনামূলক নিরাপদ সিদ্ধান্ত',
  d1:'শেয়ার করার আগে যাচাই',d2:'প্রভাবিত করার কৌশল শনাক্ত',d3:'দর্শক হিসেবে দায়িত্বশীল প্রতিক্রিয়া',d4:'আক্রান্ত ব্যক্তিকে সহায়তা',d5:'উত্তেজনা কমানো',
  resultNote:'এটি শুধু এই সেশনের শেখার সূচক — মনস্তাত্ত্বিক মূল্যায়ন, বৈজ্ঞানিকভাবে যাচাইকৃত প্রভাব বা pilot result নয়।',
  replay:'আবার শুরু করুন', exit:'বের হোন', metricReach:'নাগাল',metricHostility:'উত্তেজনা',metricSafety:'নিরাপত্তা',metricTrust:'আস্থা', beforeAfter:'আগে → পরে',
  stages:['MIRROR','RIPPLE','REWIND','PEACE','REFLECT'], stageHelp:['নিজের মতো সিদ্ধান্ত নিন','কী বদলায় দেখুন','মুহূর্তে ফিরে যান','নিরাপদ পথ অনুশীলন করুন','নতুন অভ্যাস নিয়ে শেষ করুন']
 }
};

const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const metrics=(c:Choice):Metrics=>({reach:clamp(base.reach+(c.delta.reach||0)),hostility:clamp(base.hostility+(c.delta.hostility||0)),safety:clamp(base.safety+(c.delta.safety||0)),trust:clamp(base.trust+(c.delta.trust||0))});
const stableCount=(id:string,offset:number,span:number)=>{
 let h=0;for(const ch of id)h=(h*31+ch.charCodeAt(0))>>>0;
 return offset+(h%span);
};

const socialMeta=(s:Scenario,locale:Locale)=>{
 const bn=locale==='bn';
 const family=s.family||'verify';
 const map={
  privacy:{name:bn?'কমিউনিটি গ্রুপ':'Community Group',handle:'@community_group',warning:bn?'ব্যক্তিগত তথ্য দেখা যাচ্ছে':'PRIVATE INFO VISIBLE',initial:'C'},
  bystander:{name:bn?'ক্যাম্পাস ফিড':'Campus Feed',handle:'@campus_feed',warning:bn?'একজন মানুষকে টার্গেট করা হয়েছে':'PERSON BEING TARGETED',initial:'F'},
  deescalate:{name:bn?'লোকাল আপডেট':'Local Updates',handle:'@local_updates',warning:bn?'গোষ্ঠীকে দোষ দেওয়া হচ্ছে':'GROUP BLAME',initial:'L'},
  synthetic:{name:bn?'ট্রেন্ডিং ক্লিপ':'Trending Clip',handle:'@trending_clip',warning:bn?'মিডিয়ার সত্যতা পরিষ্কার নয়':'MEDIA AUTHENTICITY UNCLEAR',initial:'T'},
  verify:{name:bn?'পাবলিক আপডেট':'Public Update',handle:'@public_update',warning:bn?'উৎস যাচাই করা হয়নি':'SOURCE NOT VERIFIED',initial:'P'}
 } as const;
 return map[family as keyof typeof map]||map.verify;
};

const impactPoints=(s:Scenario,c:Choice,locale:Locale,better=false)=>{
 const bn=locale==='bn';
 const family=s.family||'verify';
 if(better){
  const common=[
   bn?'আপনি আরেকটি কপি ছড়িয়ে দেননি।':'You did not add another copy of the harmful or unverified content.',
   bn?'মানুষকে থামতে, যাচাই করতে বা নিরাপদভাবে সহায়তা করতে একটি স্পষ্ট পথ দেওয়া হয়েছে।':'You created a clear reason for others to pause, verify or support the person safely.',
   bn?'আক্রান্ত ব্যক্তি পরের পদক্ষেপে বেশি নিয়ন্ত্রণ রাখতে পারে।':'The person affected keeps more control over what happens next.'
  ];
  if(family==='privacy')common[1]=bn?'ব্যক্তিগত তথ্য আর ছড়ানোর বদলে রিপোর্ট/সতর্ক করার পথ বেছে নেওয়া হয়েছে।':'Instead of recirculating private information, the safer path reports it or warns others not to spread it.';
  if(family==='bystander')common[1]=bn?'ভিড়ের অপমানকে আরেকটি reaction না দিয়ে আক্রান্ত ব্যক্তিকে সহায়তা করা হয়েছে।':'Instead of rewarding the pile-on with another reaction, the safer path supports the person targeted.';
  if(family==='deescalate')common[1]=bn?'গোষ্ঠীকে দোষ না দিয়ে নির্দিষ্ট দাবি ও প্রমাণ আলাদা করা হয়েছে।':'The safer path separates the specific claim from group blame and asks for evidence.';
  return common;
 }
 if(c.kind!=='risk'){
  return [
   bn?'আপনার কাজটি ক্ষতিকর পোস্টের ছড়িয়ে পড়া বাড়ায়নি।':'Your action did not add another major push to the harmful post.',
   bn?'তবু পোস্টটি অন্যদের মাধ্যমে চলতে পারে—তাই পরের পদক্ষেপ গুরুত্বপূর্ণ।':'The post can still keep moving through other people, so the next step still matters.',
   bn?(s.human||c.body):('Possible human effect: '+(s.human||c.body))
  ];
 }
 const byFamily={
  privacy:[
   bn?'ব্যক্তিগত তথ্য আরও বেশি মানুষের সামনে পৌঁছাতে পারে।':'Private information can reach more people.',
   bn?'অপরিচিতরা ফোন, মেসেজ বা লোকেশন ব্যবহার করে ব্যক্তিটিকে টার্গেট করতে পারে।':'Strangers can use a phone number, screenshot or location detail to target the person.',
   bn?(s.human||c.body):('Human consequence: '+(s.human||c.body))
  ],
  bystander:[
   bn?'আরেকটি share/reaction ভিড়কে জানায় যে অপমানটি গ্রহণযোগ্য।':'Another share or reaction tells the crowd the pile-on is acceptable.',
   bn?'পোস্টটি মূল গ্রুপের বাইরে গিয়ে আরও অপরিচিত মানুষের কাছে পৌঁছাতে পারে।':'The post can escape the original group and reach more strangers.',
   bn?(s.human||c.body):('Human consequence: '+(s.human||c.body))
  ],
  deescalate:[
   bn?'একটি নির্দিষ্ট ঘটনাকে পুরো গোষ্ঠীর দোষ হিসেবে ছড়িয়ে দেওয়া হয়।':'A specific incident can turn into blame against an entire group.',
   bn?'রাগ ও মুখোমুখি হওয়ার ভাষা আরও মানুষকে উত্তেজিত করতে পারে।':'Angry replies can pull more people into confrontation.',
   bn?(s.human||c.body):('Human consequence: '+(s.human||c.body))
  ],
  synthetic:[
   bn?'পরিচিত মুখ বা নাটকীয় মিডিয়া যাচাইয়ের আগেই বিশ্বাস তৈরি করতে পারে।':'A familiar face or dramatic media can create trust before verification.',
   bn?'শেয়ার করলে ভুয়া বা বদলানো মিডিয়ার নাগাল দ্রুত বাড়ে।':'Sharing can rapidly increase the reach of fake or manipulated media.',
   bn?(s.human||c.body):('Human consequence: '+(s.human||c.body))
  ],
  verify:[
   bn?'অযাচাইকৃত দাবিটি আরও মানুষের কাছে সত্যের মতো পৌঁছায়।':'The unverified claim reaches more people as if it were already true.',
   bn?'অন্যরা অসম্পূর্ণ তথ্যের ওপর ভিত্তি করে সিদ্ধান্ত নিতে শুরু করতে পারে।':'Other people can start making decisions based on incomplete context.',
   bn?(s.human||c.body):('Human consequence: '+(s.human||c.body))
  ]
 } as const;
 return [...(byFamily[family as keyof typeof byFamily]||byFamily.verify)];
};

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
 const generatedEn=buildGeneratedScenarios('en');
 const generatedBn=buildGeneratedScenarios('bn');
 const allEn=[...scenariosEn,...generatedEn];
 const allBn=[...scenariosBn,...generatedBn];
 const allIds=allEn.map(x=>x.id);
 const [sessionIds,setSessionIds]=useState<string[]>(()=>currentSessionIds(allIds));

 const t=ui[locale];
 const catalog=locale==='en'?allEn:allBn;
 const scenarios=sessionIds.map(id=>catalog.find(x=>x.id===id)).filter((x):x is Scenario=>Boolean(x));
 const s=scenarios[i]||catalog[0]!;
 const b=bId?s.choices.find(x=>x.id===bId)||null:null;
 const p=pId?s.peace.find(x=>x.id===pId)||null:null;

 useEffect(()=>{
  document.documentElement.lang=locale;
  document.title=locale==='en'?'RIPPLE BD — CHAOS → PEACE':'RIPPLE BD — বিশৃঙ্খলা → শান্তি';
  track('language_changed',{screen,scenario_id:s.id,scenario_index:i+1});
 },[locale]);

 useEffect(()=>{
  localStorage.setItem('ripple-results',JSON.stringify(results));
  window.scrollTo({top:0,behavior:'auto'});
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

 const reset=(rotate=false)=>{
  localStorage.removeItem('ripple-results');
  if(rotate){
   const nextIds=rotateSessionIds(allIds);
   setSessionIds(nextIds);
  }
  setResults([]);setI(0);setBId(null);setPId(null);setSeen([]);setShield(0);setScreen('notice');
 };
 const resume=()=>{
  if(results.length>=scenarios.length){setScreen('results');return}
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
  if(i===scenarios.length-1){track('session_complete',{screen:'results',session_score:score});setScreen('results')}
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
    <div className="nav-actions"><LanguageSwitch locale={locale} onChange={setLocale}/></div>
   </nav>

   <section className="hero">
    <div className="copy">
     <span className="pill">{t.navMeta}</span>
     <h1>{t.hero} <em>{t.heroAccent}</em></h1>
     <p>{t.heroBody}</p>
     <div className="actions">
      <button className="primary" onClick={results.length>0?resume:()=>reset(false)}>{results.length>0?t.resume:t.start}<ArrowRight/></button>
      <button className="secondary" onClick={()=>setScreen('guide')}>{t.howItWorks}</button>
     </div>
     <div className="trust"><span><Gauge/>{t.duration}</span><span><ShieldCheck/>{t.noLogin}</span><span><Pause/>{t.privacy}</span><span><RefreshCw/>{locale==='en'?'3 complete scenarios':'৩টি সম্পূর্ণ দৃশ্য'}</span></div>
    </div>

    <aside className="hero-preview" aria-label={locale==='en'?'Example scenario preview':'উদাহরণ দৃশ্যের প্রিভিউ'}>
     <div className="preview-label">{locale==='en'?'EXAMPLE · FICTIONAL POST':'উদাহরণ · কাল্পনিক পোস্ট'}</div>
     <div className="preview-head"><span className="preview-avatar">C</span><div><b>{locale==='en'?'Community Group':'কমিউনিটি গ্রুপ'}</b><small>@community_group · {t.now}</small></div></div>
     <p>{locale==='en'?'“Sharing this so everyone knows.” A screenshot includes a person’s phone number and home area.':'“সবাই যেন জানে তাই শেয়ার করছি।” একটি screenshot-এ একজন ব্যক্তির ফোন নম্বর ও বাসার এলাকা দেখা যাচ্ছে।'}</p>
     <div className="preview-media"><span>{locale==='en'?'PRIVATE INFO VISIBLE':'ব্যক্তিগত তথ্য দেখা যাচ্ছে'}</span><i/><i/><i className="short"/></div>
     <div className="preview-impact"><b>{locale==='en'?'If you reshare it':'আপনি আবার শেয়ার করলে'}</b><span>{locale==='en'?'more strangers can contact or target that person.':'আরও অপরিচিত মানুষ ওই ব্যক্তিকে যোগাযোগ বা টার্গেট করতে পারে।'}</span></div>
    </aside>
   </section>

   <section className="how-simple">
    <header><span className="eyebrow">{locale==='en'?'HOW IT WORKS':'কীভাবে কাজ করে'}</span><h2>{locale==='en'?'Three clear steps.':'৩টি পরিষ্কার ধাপ।'}</h2></header>
    <div className="how-cards">
     <article><span>01</span><b>{locale==='en'?'See a realistic post':'বাস্তবের মতো পোস্ট দেখুন'}</b><p>{locale==='en'?'A fictional feed, group-chat or campus situation.':'ফিড, গ্রুপ চ্যাট বা ক্যাম্পাসের মতো একটি কাল্পনিক পরিস্থিতি।'}</p></article>
     <article><span>02</span><b>{locale==='en'?'See the human consequence':'মানুষের ওপর প্রভাব দেখুন'}</b><p>{locale==='en'?'See exactly how a small action can affect someone’s safety, reputation or daily life.':'ছোট একটি কাজ কীভাবে কারও নিরাপত্তা, সুনাম বা দৈনন্দিন জীবনে প্রভাব ফেলে দেখুন।'}</p></article>
     <article><span>03</span><b>{locale==='en'?'Redo it better':'আবার আরও ভালোভাবে করুন'}</b><p>{locale==='en'?'Rewind the same moment, choose a safer action, then compare both outcomes.':'একই মুহূর্তে ফিরে গিয়ে নিরাপদ সিদ্ধান্ত নিন, তারপর দুই ফলাফল তুলনা করুন।'}</p></article>
    </div>
   </section>

   <section className="why-matters">
    <div className="why-copy"><span className="eyebrow">{locale==='en'?'WHY THIS MATTERS':'কেন এটি গুরুত্বপূর্ণ'}</span><h2>{locale==='en'?'Misinformation is already a daily stressor.':'ভুলতথ্য ইতিমধ্যেই দৈনন্দিন চাপের অংশ।'}</h2><p>{locale==='en'?'RIPPLE practises the moment before a share, reaction or reply becomes part of the harm.':'RIPPLE সেই মুহূর্তটি অনুশীলন করায়—যখন share, reaction বা reply ক্ষতির অংশ হয়ে উঠতে পারে।'}</p></div>
    <div className="evidence-card"><strong>2 in 3</strong><span>{locale==='en'?'young respondents in a 2025 UNICEF Bangladesh U-Report poll said too much fake news / misinformation was their biggest social-media stressor.':'২০২৫ সালের UNICEF Bangladesh U-Report poll-এ প্রতি ৩ জনে ২ জন তরুণ উত্তরদাতা অতিরিক্ত fake news / misinformation-কে social media-র সবচেয়ে বড় stressor বলেছেন।'}</span><small>{locale==='en'?'Almost 29,000 respondents · UNICEF Bangladesh, 2025':'প্রায় ২৯,০০০ উত্তরদাতা · UNICEF Bangladesh, ২০২৫'} · <a href="https://www.unicef.org/bangladesh/en/press-releases/unicef-youth-poll-misinformation-leading-cause-stress-youth-social-media" target="_blank" rel="noreferrer">{locale==='en'?'source':'উৎস'}</a></small></div>
   </section>
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
   {i===0&&<div className="scenario-intro-note"><b>{t.welcome}</b><span>{t.welcomeBody}</span></div>}
   <button className="primary" onClick={()=>{track('scenario_started',{screen:'intro',scenario_id:s.id,scenario_index:i+1});setScreen('mirror')}}>{t.seePost}<ArrowRight/></button>
  </main>}

  {screen==='mirror'&&<main className="wide grid">
   <section><span className="eyebrow">{t.mirror}</span><h2>{s.prompt}</h2><p className="lead">{t.mirrorHelp}</p>
    <div className="choices">{s.choices.map((c,n)=><button key={c.id} className="choice mirror-choice" onClick={()=>{track('mirror_choice',{screen:'mirror',scenario_id:s.id,scenario_index:i+1,choice_id:c.id,choice_kind:c.kind,choice_score:c.score,duration_ms:Date.now()-screenStartedAt});setBId(c.id);setScreen('ripple')}}><span className="choice-number">{'0'+(n+1)}</span><div><b>{c.label}</b><small>{c.helper}</small></div><ArrowRight/></button>)}</div>
   </section>
   {(()=>{const meta=socialMeta(s,locale);const reactions=stableCount(s.id,180,1300);const comments=stableCount(s.id+'c',24,240);const shares=stableCount(s.id+'s',18,390);return <article className="feed social-post">
    <div className="feedtop"><span className="avatar">{meta.initial}</span><div><b>{meta.name}</b><small>{meta.handle} · {t.now}</small></div><label>{t.simulation}</label></div>
    <p className="post-copy">{s.post}</p>
    <div className="social-media-preview" role="img" aria-label={locale==='en'?'Fictional attached screenshot preview':'কাল্পনিক সংযুক্ত screenshot প্রিভিউ'}>
     <span className="media-warning">{meta.warning}</span>
     <div className="mock-window"><i/><i/><i className="short"/><b>{s.title}</b><i/><i className="short"/></div>
     <small>{locale==='en'?'Fictional example · no real person, account or private data is shown.':'কাল্পনিক উদাহরণ · কোনো বাস্তব ব্যক্তি, account বা ব্যক্তিগত তথ্য দেখানো হয়নি।'}</small>
    </div>
    <div className="simulated-activity">{locale==='en'?'SIMULATED ACTIVITY':'সিমুলেটেড ACTIVITY'}</div>
    <div className="stats"><span><Heart/>{reactions.toLocaleString()}</span><span><Users/>{comments}</span><span><Share2/>{shares}</span></div>
   </article>})()}
  </main>}

  {screen==='ripple'&&b&&<main className="wide consequence-page">
   <span className="eyebrow">{t.ripple}</span><h2>{t.rippleTitle}</h2><p className="lead">{t.rippleBody}</p>

   <div className="action-recap"><small>{t.click}</small><b>{b.label}</b><span>{b.helper}</span></div>

   <div className={'human-impact-card '+(b.kind==='risk'?'harm':'protected')}>
      <span className="impact-kicker"><Heart/>{b.kind==='risk'?(locale==='en'?'WHAT THIS CAN DO TO A PERSON':'এতে একজন মানুষের কী হতে পারে'):(locale==='en'?'YOU DID NOT PUSH THE HARM FURTHER':'আপনি ক্ষতিটা আর বাড়াননি')}</span>
      <h3>{b.kind==='risk'
       ? (locale==='en'?'Your action pushed the harm further.':'আপনার কাজটি ক্ষতিটা আরও এগিয়ে দিল।')
       : (locale==='en'?'Your first move already reduced some harm.':'আপনার প্রথম কাজেই কিছু ক্ষতি কমেছে।')}</h3>
      <p>{b.kind==='risk'?(s.human||b.body):b.body}</p>
      <small>{locale==='en'?'Fictional consequence pathway · plausible, not a prediction about a real person.':'কাল্পনিক consequence pathway · সম্ভাব্য উদাহরণ, কোনো বাস্তব ব্যক্তির ভবিষ্যদ্বাণী নয়।'}</small>
   </div>

   <div className="impact-list">
    {impactPoints(s,b,locale).map((point,n)=><div key={point}><span>{n+1}</span><p>{point}</p></div>)}
   </div>

   <details className="metric-details">
    <summary>{locale==='en'?'See supporting simulation indicators':'সহায়ক সিমুলেশন সূচক দেখুন'}</summary>
    <div className="metrics"><small><Info/>{t.indicators}</small>{(['reach','hostility','safety','trust'] as (keyof Metrics)[]).map(k=>{const v=mm(b)[k],d=v-base[k],good=(k==='safety'||k==='trust')?d>=0:d<=0;return <div className="metric" key={k}><div><span>{metricLabel(k)}</span><b className={good?'good':'bad'}>{d>=0?'+':''}{d}</b></div><i><em style={{width:v+'%'}} className={good?'goodbg':'badbg'}/></i><small>{base[k]} → {v}</small></div>})}</div>
   </details>

   <button className="primary" onClick={()=>{track('ripple_viewed',{screen:'ripple',scenario_id:s.id,scenario_index:i+1});setScreen('reflect')}}>{t.reflectBtn}<ArrowRight/></button>
  </main>}

  {screen==='reflect'&&b&&<main className="center"><div className="panel person-focus">
   <span className="eyebrow">{t.reflect}</span><h2>{t.reflectTitle}</h2>
   <div className="person-story"><span><Heart/></span><p>{s.human||b.body}</p></div>
   <p className="callout">{t.reflectNote}</p>
   <button className="primary" onClick={()=>{track('rewind_started',{screen:'reflect',scenario_id:s.id,scenario_index:i+1});setScreen('rewind')}}>{t.rewindBtn}<RotateCcw/></button>
  </div></main>}

  {screen==='rewind'&&<main className="center"><div className="panel rewind"><div className="miniRings"><i/><i/><i/><RotateCcw/></div><span className="eyebrow">{t.rewind}</span><div className="rewind-line">{locale==='en'?'ONE CLICK. TWO POSSIBLE FUTURES.':'একটি ক্লিক। দুটি সম্ভাব্য ভবিষ্যৎ।'}</div><h2>{t.rewindTitle}</h2><p className="lead">{t.rewindBody}</p><button className="primary" onClick={()=>setScreen('peace')}>{t.peaceBtn}<ArrowRight/></button></div></main>}

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

   <div className="future-compare">
    <section className="future bad-future">
     <small>{locale==='en'?'FIRST CHOICE':'প্রথম সিদ্ধান্ত'}</small><h3>{b.label}</h3>
     <div className="future-points">{impactPoints(s,b,locale).map((point,n)=><div key={point}><span>{n+1}</span><p>{point}</p></div>)}</div>
    </section>
    <div className="future-arrow"><ArrowRight/></div>
    <section className="future good-future">
     <small>{locale==='en'?'SAFER RETRY':'নিরাপদ দ্বিতীয় চেষ্টা'}</small><h3>{p.label}</h3>
     <div className="future-points">{impactPoints(s,p,locale,true).map((point,n)=><div key={point}><CheckCircle2/><p>{point}</p></div>)}</div>
    </section>
   </div>

   <div className="compare compact-metrics">{(['reach','hostility','safety','trust'] as (keyof Metrics)[]).map(k=><div key={k}><span>{metricLabel(k)}</span><strong>{mm(b)[k]} → {mm(p)[k]}</strong><small>{t.safer}</small></div>)}</div>

   <div className="complete-actions"><button className="primary" onClick={next}>{i===scenarios.length-1?t.profileBtn:t.nextScenario}<ArrowRight/></button></div>
  </main>}

  {screen==='results'&&<main className="wide results">
   <section><span className="eyebrow">{t.profile}</span><h2>{score>=85?t.strong:score>=65?t.developing:t.growing}</h2><p className="lead">{t.profileBody}</p></section>
   <div className="orb"><strong>{score}</strong><span>/100</span><small>{t.sessionScore}</small></div>
   <div className="dimensions">{dimensions.map((d,n)=><div key={d.label}><div><span>{'0'+(n+1)}</span><b>{d.label}</b><strong>{d.value}%</strong></div><i><em style={{width:d.value+'%'}}/></i></div>)}</div>
   <div className="resultcards">{scenarios.map((x,n)=><div key={x.id}><small>{t.scenario} {n+1}</small><b>{x.title}</b><strong>{results[n]||0}%</strong></div>)}</div>
   <div className="callout result-note"><Info/><p>{t.resultNote}</p></div>
   <footer><div><b>#EveryClickRipples</b><small>{locale==='en'?'Every click has a consequence.':'প্রতিটি ক্লিকেরই পরিণতি আছে।'}</small></div><button className="secondary" onClick={()=>reset(true)}><RefreshCw/>{t.replay}</button></footer>
  </main>}
 </div>;
}

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App/></React.StrictMode>);
