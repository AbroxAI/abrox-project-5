// identity-personas-v7-fixed.js — ULTRA-REALISTIC UNIQUE AVATARS + HEADER-READY
(function(){
"use strict";

// ================= CONFIG =================
const TOTAL_PERSONAS = Math.max(
  300,
  Math.min((window.REALISM_CONFIG?.TOTAL_PERSONAS || 3000), 100000)
);

// ================= ADMIN =================
const Admin = { 
  name: "Profit Hunter 🌐", 
  avatar: "assets/admin.jpg", 
  isAdmin: true, 
  gender: "male", 
  country: "GLOBAL", 
  personality: "authority", 
  tone: "direct", 
  timezoneOffset: 0, 
  memory: [] 
};

// ================= COUNTRY GROUPS =================
const COUNTRY_GROUPS = { 
  US:"western", UK:"western", CA:"western", AU:"western", DE:"western", FR:"western", IT:"western",
  NG:"african", ZA:"african", GH:"african", IN:"asian", JP:"asian", KR:"asian", CN:"asian",
  BR:"latin", MX:"latin", AR:"latin", RU:"eastern", TR:"eastern" 
};
const COUNTRIES = Object.keys(COUNTRY_GROUPS);

// ================= NAME DATA =================
const MALE_FIRST = ["Alex","John","Max","Leo","Sam","David","Liam","Noah","Ethan","James","Ryan","Michael","Daniel","Kevin","Oliver","William","Henry","Jack","Mason","Lucas","Elijah","Benjamin","Sebastian","Logan","Jacob","Wyatt","Carter","Julian","Luke","Isaac","Nathan","Aaron","Adrian","Victor","Caleb","Dominic","Xavier","Evan","Connor","Jason","Owen","Thomas","Charles","Jeremiah","Dylan","Zachary","Gabriel","Nicholas","Christian","Austin","Brandon","Ian","Colin","Rafael","Marcus","Simon","Tobias","Victoriano"];
const FEMALE_FIRST = ["Maria","Lily","Emma","Zoe","Ivy","Sophia","Mia","Olivia","Ava","Charlotte","Amelia","Ella","Grace","Chloe","Hannah","Aria","Scarlett","Luna","Ruby","Sofia","Emily","Layla","Nora","Victoria","Aurora","Isabella","Madison","Penelope","Camila","Stella","Hazel","Violet","Savannah","Bella","Claire","Sienna","Juliet","Evelyn","Maya","Naomi","Alice","Serena","Daphne","Leah","Miriam"];
const LAST_NAMES = ["Smith","Johnson","Brown","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Garcia","Martinez","Robinson","Clark","Rodriguez","Lewis","Walker","Hall","Allen","Young","King","Wright","Scott","Green","Baker","Adams","Nelson","Hill","Campbell","Mitchell","Carter","Roberts","Gonzalez","Perez","Edwards","Collins","Stewart","Sanchez","Morris","Rogers","Reed","Cook","Morgan","Bell","Murphy","Bailey","Rivera","Cooper","Richardson","Cox","Howard","Ward","Flores"];
const CRYPTO_ALIASES = ["BlockKing","PumpMaster","CryptoWolf","FomoKing","Hodler","TraderJoe","BitHunter","AltcoinAce","ChainGuru","DeFiLord","MetaWhale","CoinSniper","YieldFarmer","NFTDegen","ChartWizard","TokenShark","AirdropKing","WhaleHunter","BullRider","BearBuster","SatoshiFan","GasSaver","MoonChaser","RektRecover","Nodesman","LiquidityLord","OnChainOwl"];
const TITLES = ["Trader","Investor","HODLer","Analyst","Whale","Shark","Mooner","Scalper","SwingTrader","DeFi","Miner","Blockchain","NFT","Quant","Signals","Mentor","Founder","CTO","RiskMgr","Ops"];

// ================= EMOJIS =================
const EMOJIS = ["💸","🔥","💯","✨","😎","👀","📈","🚀","💰","🤑","🎯","🏆","🤖","🎉","🍀","📊","⚡","💎","👑","🦄","🧠","🔮","🪙","🥂","💡","🛸","📉","📱","💬","🙌","👏","👍","❤️","😂","😅","🤞","✌️","😴","🤩","😬","🤝","🧾","📌","🔔","⚠️","✅","❌","📎","🧩","🪙","🔗","🔒","🌕","🌑","🌟","🏁","💹","🏦","🧭","🧯"];

// ================= SLANG =================
const SLANG = {
  western:["bro","ngl","lowkey","fr","tbh","wild","solid move","bet","dope","lit","clutch","savage","meme","cheers","respect","hype","flex","mad","cap","no cap","real talk","yo","fam","legit","sick"],
  african:["my guy","omo","chai","no wahala","sharp move","gbam","yawa","sweet","jollof","palava","chop","fine boy","hustle","ehen","kolo","sisi","big man","on point","correct","naija","bros","guyz"],
  asian:["lah","brother","steady","respect","solid one","ok lah","si","good move","ganbatte","wa","neat","ke","nice one","yah","cool","aiyo","steady bro"],
  latin:["amigo","vamos","muy bueno","fuerte move","dale","epa","buenisimo","chevere","que pasa","vamo","oye","pura vida","mano","buena","vamos ya","olé"],
  eastern:["comrade","strong move","not bad","serious play","da","top","nu","excellent","good work","correct","bravo","fine","nice move","pro","cheers"]
};

// ================= AVATAR SOURCES =================
const AVATAR_SOURCES = [
  {type:"randomuser"}, {type:"pravatar"}, {type:"robohash"}, {type:"multiavatar"},
  {type:"dicebear",style:"avataaars"}, {type:"dicebear",style:"bottts"},
  {type:"dicebear",style:"identicon"}, {type:"dicebear",style:"open-peeps"},
  {type:"dicebear",style:"micah"}, {type:"dicebear",style:"pixel-art"},
  {type:"dicebear",style:"thumbs"}, {type:"dicebear",style:"lorelei"},
  {type:"dicebear",style:"notionists"}, {type:"dicebear",style:"rings"},
  {type:"dicebear",style:"initials"}, {type:"dicebear",style:"shapes"},
  {type:"dicebear",style:"fun-emoji"}, {type:"dicebear",style:"adventurer"},
  {type:"dicebear",style:"adventurer-neutral"}, {type:"ui-avatars"}
];

// ================= AVATAR POOL =================
let MIXED_AVATAR_POOL = [];
function initializeAvatarPool(){
  MIXED_AVATAR_POOL = [];
  for(let i=1;i<=200;i++) MIXED_AVATAR_POOL.push(`https://i.pravatar.cc/300?img=${i}`);
  for(let i=1;i<=200;i++){ 
    MIXED_AVATAR_POOL.push(`https://randomuser.me/api/portraits/men/${i}.jpg`);
    MIXED_AVATAR_POOL.push(`https://randomuser.me/api/portraits/women/${i}.jpg`);
  }
  ["alpha","bravo","charlie","delta","echo","foxtrot","golf","hotel","india","juliet","kilo","lima","mike","november","oscar","papa","quebec","romeo","sierra","tango","uniform","victor","whiskey","xray","yankee","zulu","nova","luna","astra","cosmo","orion","phoenix","vortex","nebula","galaxy","comet","meteor","eclipse","sol","terra","aether","zephyr","aurora","celeste"].forEach(seed=>{
    MIXED_AVATAR_POOL.push(`https://picsum.photos/seed/${seed}/300/300`);
  });
  for(let i=0;i<50;i++) MIXED_AVATAR_POOL.push(`https://robohash.org/seed_${i}.png`);
  for(let i=0;i<50;i++) MIXED_AVATAR_POOL.push(`https://api.multiavatar.com/seed${i}.png`);
  for(let i=0;i<200;i++) MIXED_AVATAR_POOL.push(`https://ui-avatars.com/api/?name=U${i}&background=random&size=256`);
  // shuffle
  for(let i=MIXED_AVATAR_POOL.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [MIXED_AVATAR_POOL[i],MIXED_AVATAR_POOL[j]]=[MIXED_AVATAR_POOL[j],MIXED_AVATAR_POOL[i]];
  }
}
initializeAvatarPool();
