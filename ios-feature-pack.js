/* BudgetOS iOS feature migration pack — adapted from the Android APK web feature set.
   Keeps the iOS screen system and local-first storage; Android-native-only APIs are guarded. */
(()=>{
'use strict';
const $=id=>document.getElementById(id);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid2=()=>('ios-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8));
const today=()=>new Date().toISOString().slice(0,10);
const money2=n=>'₹'+(Number(n)||0).toLocaleString('en-IN',{maximumFractionDigits:0});
const ensure=()=>{
 db.goals=Array.isArray(db.goals)?db.goals:[];
 db.recurringPayments=Array.isArray(db.recurringPayments)?db.recurringPayments:[];
 db.paymentCards=Array.isArray(db.paymentCards)?db.paymentCards:[];
 db.bankAccounts=Array.isArray(db.bankAccounts)?db.bankAccounts:[];
 db.chatHistory=Array.isArray(db.chatHistory)?db.chatHistory:[];
 db.jarvisMemory=Array.isArray(db.jarvisMemory)?db.jarvisMemory:[];
 db.onboarding=db.onboarding&&typeof db.onboarding==='object'?db.onboarding:{completed:!!db.profile?.onboardingCompleted};
};
ensure();
const style=document.createElement('style');
style.textContent=`
.bosx-backdrop{position:fixed;inset:0;z-index:100;background:#080514f2;display:none;align-items:flex-end;justify-content:center;padding:12px}
.bosx-backdrop.open{display:flex}.bosx-sheet{width:min(540px,100%);max-height:92dvh;overflow:auto;border:1px solid #6d3997;border-radius:25px;background:linear-gradient(145deg,#211438,#111020 80%);padding:20px;box-shadow:0 20px 80px #000b}
.bosx-progress{height:5px;border-radius:8px;background:#393047;margin:12px 0 20px;overflow:hidden}.bosx-progress i{display:block;height:100%;background:linear-gradient(90deg,#9220ff,#e047ff);transition:width .2s}
.bosx-field{display:block;width:100%;padding:13px;border:1px solid #48365f;border-radius:12px;background:#0e0c1c;color:#fff;margin:7px 0 13px}
.bosx-chiprow{display:flex;flex-wrap:wrap;gap:7px}.bosx-chip{border:1px solid #57406f;background:#201833;color:#e8d8ff;padding:9px 12px;border-radius:22px;font-size:11px}
.bosx-chip.selected{background:#7625b4;border-color:#df9aff}.bosx-row{display:flex;align-items:center;gap:9px;padding:11px 0;border-bottom:1px solid #ffffff13}.bosx-row:last-child{border:0}
.bosx-stat{display:grid;grid-template-columns:1fr 1fr;gap:8px}.bosx-stat .card{margin:0}
`;
document.head.appendChild(style);
const more=document.getElementById('more');
if(more&&!document.getElementById('bosxTools')){
 const host=document.createElement('div');host.id='bosxTools';
 host.innerHTML=`
 <div class="section"><h2>Android feature migration</h2></div>
 <button class="menurow" style="width:100%;text-align:left" onclick="bosxOpen('goals')"><span class="ico">🎯</span><span class="grow">Savings Goals</span>›</button>
 <button class="menurow" style="width:100%;text-align:left" onclick="bosxOpen('recurring')"><span class="ico">🗓</span><span class="grow">Recurring Payments & Calendar</span>›</button>
 <button class="menurow" style="width:100%;text-align:left" onclick="bosxOpen('cards')"><span class="ico">💳</span><span class="grow">Payment Cards</span>›</button>
 <button class="menurow" style="width:100%;text-align:left" onclick="bosxExportCSV()"><span class="ico">⇩</span><span class="grow">Export Transactions CSV</span>›</button>
 <button class="menurow" style="width:100%;text-align:left" onclick="bosxImportAndroid()"><span class="ico">⤒</span><span class="grow">Import Android Full Backup</span>›</button>
 <button class="menurow" style="width:100%;text-align:left" onclick="bosxOpen('coach')"><span class="ico">✧</span><span class="grow">Budget Coach & Monthly Report</span>›</button>
 <div id="bosxPanel" class="card hidden" style="margin-top:10px"></div>`;
 more.appendChild(host);
}
const overlay=document.createElement('div');overlay.className='bosx-backdrop';overlay.id='bosxOnboarding';
overlay.innerHTML='<div class="bosx-sheet" role="dialog" aria-modal="true" aria-label="BudgetOS setup"><div class="eyebrow">BUDGETOS · FIRST-TIME SETUP</div><div class="row between"><h2 id="bosxTitle">Let’s set up your budget</h2><span class="tiny" id="bosxStep">1 / 4</span></div><div class="bosx-progress"><i id="bosxProgress" style="width:25%"></i></div><div id="bosxBody"></div><div class="row" style="margin-top:15px"><button class="secondary" id="bosxBack" style="flex:1">Back</button><button class="primary" id="bosxNext" style="flex:2">Continue</button></div><button class="link" id="bosxSkip" style="width:100%;margin-top:8px">Set up later</button></div>';
document.body.appendChild(overlay);
let step=0,setup={name:'',income:'',priority:'debt',categories:['Housing','Food & Groceries','Transport','Bills & Utilities','Personal','Savings']};
const steps=[
 ()=>'<p class="sub">Create your local profile. Nothing is uploaded to a server.</p><label class="tiny">What should we call you?</label><input class="bosx-field" id="bosxName" autocomplete="name" placeholder="Your name" value="'+esc(setup.name)+'">',
 ()=>'<p class="sub">Set your regular take-home monthly income.</p><label class="tiny">Monthly income (₹)</label><input class="bosx-field" id="bosxIncome" type="number" min="0" inputmode="decimal" placeholder="Enter amount" value="'+esc(setup.income)+'">',
 ()=>'<p class="sub">Choose the areas you want BudgetOS to organize first.</p><div class="bosx-chiprow">'+['Housing','Food & Groceries','Transport','Bills & Utilities','Subscriptions','Health','Personal','Education','Savings','Debt / EMI'].map(x=>'<button type="button" class="bosx-chip '+(setup.categories.includes(x)?'selected':'')+'" data-bosx-cat="'+esc(x)+'">'+esc(x)+'</button>').join('')+'</div>',
 ()=>'<p class="sub">What should your BudgetOS coach prioritize?</p><div class="bosx-chiprow">'+[['debt','Debt first'],['balance','Balanced budget'],['savings','Build savings'],['goals','Reach a goal']].map(([v,n])=>'<button type="button" class="bosx-chip '+(setup.priority===v?'selected':'')+'" data-bosx-priority="'+v+'">'+n+'</button>').join('')+'</div><p class="tiny" style="margin-top:14px">You can change your categories and priorities anytime in the app.</p>'
];
function drawStep(){
 $('bosxTitle').textContent=['Your profile','Monthly income','Choose your categories','Set your priority'][step];
 $('bosxStep').textContent=(step+1)+' / 4';$('bosxProgress').style.width=((step+1)*25)+'%';
 $('bosxBody').innerHTML=steps[step]();
 $('bosxBack').style.visibility=step===0?'hidden':'visible';$('bosxNext').textContent=step===3?'Finish setup':'Continue';
 document.querySelectorAll('[data-bosx-cat]').forEach(b=>b.onclick=()=>{const x=b.dataset.bosxCat;setup.categories=setup.categories.includes(x)?setup.categories.filter(v=>v!==x):setup.categories.concat(x);b.classList.toggle('selected')});
 document.querySelectorAll('[data-bosx-priority]').forEach(b=>b.onclick=()=>{setup.priority=b.dataset.bosxPriority;document.querySelectorAll('[data-bosx-priority]').forEach(x=>x.classList.toggle('selected',x===b))});
}
function startOnboarding(force=false){
 ensure();if(!force&&db.onboarding.completed)return;
 step=0;setup.name=db.profile?.name||'';setup.income=String(db.income||'');drawStep();overlay.classList.add('open');
}
$('bosxBack').onclick=()=>{if(step>0){step--;drawStep()}};
$('bosxNext').onclick=()=>{
 if(step===0){setup.name=$('bosxName').value.trim();if(!setup.name){$('bosxName').focus();return toast('Please enter your name')}}
 if(step===1){setup.income=$('bosxIncome').value;if(!setup.income||Number(setup.income)<0)return toast('Enter a valid monthly income')}
 if(step<3){step++;drawStep();return}
 const old=db.categories||[];const iconMap={'Housing':'🏠','Food & Groceries':'🛒','Transport':'🚗','Bills & Utilities':'💡','Subscriptions':'🎧','Health':'🩺','Personal':'👤','Education':'📚','Savings':'💰','Debt / EMI':'💳'};
 db.profile={...(db.profile||{}),name:setup.name,onboardingCompleted:true};
 db.income=Number(setup.income)||0;
 db.categories=setup.categories.map((name,i)=>({id:uid2(),name,kind:name==='Savings'?'saving':'expense',budget:old.find(c=>c.name===name)?.budget||0,icon:iconMap[name]||'•',group:name==='Savings'?'saving':name==='Debt / EMI'?'fixed':'living'}));
 db.onboarding={completed:true,priority:setup.priority,completedAt:new Date().toISOString()};
 saveData();overlay.classList.remove('open');toast('Your BudgetOS setup is complete');
};
$('bosxSkip').onclick=()=>{db.onboarding={completed:true,skipped:true};db.profile={...(db.profile||{}),onboardingCompleted:true};saveData();overlay.classList.remove('open');toast('You can complete your profile in Settings')};
window.bosxStartSetup=()=>startOnboarding(true);
function fullAndroidBackup(raw){return !!raw&&typeof raw==='object'&&raw.months&&typeof raw.months==='object'&&!Array.isArray(raw.months)&&Object.keys(raw.months).length>0}
function convertAndroidBackup(raw){
 if(!fullAndroidBackup(raw))throw Error('This is not a full Android BudgetOS backup (months data is missing).');
 const monthKeys=Object.keys(raw.months).filter(k=>/^\d{4}-\d{2}$/.test(k)).sort();
 if(!monthKeys.length)throw Error('No valid monthly records found.');
 const latest=raw.months[monthKeys[monthKeys.length-1]]||{};
 const allCats=new Map(),entries=[];
 monthKeys.forEach(k=>{
  const m=raw.months[k]||{},cats=Array.isArray(m.categories)?m.categories:[];
  cats.forEach(c=>{const id=String(c.id||c.name||uid2());allCats.set(id,{id,name:String(c.name||'Category'),kind:c.type==='saving'?'saving':'expense',budget:Number(c.budget)||0,icon:c.icon||'•',group:c.type==='saving'?'saving':'living'})});
  (m.transactions||[]).forEach(t=>{
   const cat=cats.find(c=>String(c.id)===String(t.categoryId))||cats.find(c=>c.name===t.category);
   entries.push({id:String(t.id||uid2()),type:t.kind==='income'?'income':(cat?.type==='saving'?'saving':'expense'),amount:Number(t.amount)||0,category:cat?.name||t.category||'Uncategorised',date:/^\d{4}-\d{2}-\d{2}$/.test(t.date||'')?t.date:k+'-01',note:t.note||'',paymentMethod:t.paymentMethod||'upi',source:'android-migration'});
  });
 });
 const categories=[...allCats.values()];
 const loans=(raw.netWorthLoans||[]).map(l=>({id:String(l.id||uid2()),name:l.name||'Loan',amount:Number(l.borrowedAmount)||0,balance:Number(l.currentOutstandingPrincipal??l.borrowedAmount)||0,emi:Number(l.emiAmount)||0,paid:Number(l.paidInstallments)||0,total:Math.max(1,Number(l.paidInstallments||0)+12),start:l.loanDate||today(),end:l.lastEmiDate||'',icon:'💳',interestRate:Number(l.interestRate)||0,lender:l.lender||''}));
 const assets=(raw.bankAccounts||[]).map(a=>({id:String(a.id||uid2()),name:a.name||'Bank account',accountName:a.name||'Bank account',institution:a.bank||'',accountType:'Bank account',amount:Number(a.opening||0)+Number(a.adjustments||0)+(a.transactions||[]).reduce((n,t)=>n+(t.kind==='credit'?1:-1)*(Number(t.amount)||0),0),kind:'account'}));
 (raw.otherAssets||[]).forEach(a=>assets.push({...a,id:String(a.id||uid2()),kind:'asset'}));
 const liabilities=(raw.otherLiabilities||[]).map(x=>({id:String(x.id||uid2()),name:x.name||'Liability',amount:Number(x.amount)||0}));
 const goalMap=new Map();monthKeys.forEach(k=>(raw.months[k]?.goals||[]).forEach(g=>goalMap.set(String(g.id||g.name),{id:String(g.id||uid2()),name:g.name||'Savings goal',target:Number(g.target)||0,saved:Number(g.saved)||0})));
 const current=raw.months[monthKeys[monthKeys.length-1]]||{};
 db={...db,income:Number(current.income??raw.defaultIncome)||0,categories:categories.length?categories:db.categories,entries,loans,assets,liabilities,
  goals:[...goalMap.values()],paymentCards:Array.isArray(raw.paymentCards)?raw.paymentCards.map(c=>{const z={...c};['number','pan','fullNumber','cardNumber','primaryAccountNumber','cvv','cvc','securityCode','pin'].forEach(k=>delete z[k]);return z}):[],
  recurringPayments:Array.isArray(raw.recurringPayments)?raw.recurringPayments:[],bankAccounts:Array.isArray(raw.bankAccounts)?raw.bankAccounts:[],
  chatHistory:Array.isArray(raw.chatHistory)?raw.chatHistory:[],researchMemory:Array.isArray(raw.researchMemory)?raw.researchMemory:[],
  androidBackupArchive:raw,androidMonths:raw.months,androidDefaultIncome:Number(raw.defaultIncome)||0,
  profile:{...(db.profile||{}),name:raw.jarvisProfile?.preferredName||db.profile?.name||'',onboardingCompleted:true},
  onboarding:{completed:true,importedAndroidBackup:true,importedAt:new Date().toISOString()}};
 saveData();toast('Android backup imported · '+monthKeys.length+' months · '+entries.length+' transactions');
}
window.bosxImportAndroid=()=>{
 const input=document.createElement('input');input.type='file';input.accept='application/json,.json';
 input.onchange=()=>{const file=input.files?.[0];if(!file)return;const r=new FileReader();r.onload=()=>{try{const raw=JSON.parse(r.result);if(!confirm('Import this Android backup? Current iOS data will be replaced. Export a backup first if needed.'))return;convertAndroidBackup(raw)}catch(e){toast('Import failed: '+(e.message||'Invalid backup'))}};r.readAsText(file)};input.click();
};
window.bosxOpen=(section)=>{
 const p=$('bosxPanel');if(!p)return;p.classList.remove('hidden');
 if(section==='goals'){
  const rows=db.goals.map(g=>{const pct=g.target?Math.min(100,Number(g.saved)/Number(g.target)*100):0;return '<div class="bosx-row"><div class="grow"><b>'+esc(g.name)+'</b><div class="tiny">Saved '+money2(g.saved)+' of '+money2(g.target)+'</div><div class="progress"><i style="width:'+pct+'%"></i></div></div><button class="secondary" onclick="bosxEditGoal(\''+esc(g.id)+'\')">Edit</button></div>'}).join('');
  p.innerHTML='<div class="row between"><h2>Savings Goals</h2><button class="secondary" onclick="bosxAddGoal()">＋ Add</button></div>'+ (rows||'<p class="tiny">No goals yet. Create a savings goal to track progress.</p>');
 }else if(section==='recurring'){
  const rows=db.recurringPayments.map(x=>'<div class="bosx-row"><div class="grow"><b>'+esc(x.name)+'</b><div class="tiny">'+money2(x.amount)+' · due day '+esc(x.day||1)+' · '+(x.active===false?'Paused':'Active')+'</div></div><button class="secondary" onclick="bosxToggleRecurring(\''+esc(x.id)+'\')">'+(x.active===false?'Resume':'Pause')+'</button></div>').join('');
  p.innerHTML='<div class="row between"><h2>Recurring Payments</h2><button class="secondary" onclick="bosxAddRecurring()">＋ Add</button></div>'+ (rows||'<p class="tiny">No recurring rules yet.</p>')+'<p class="tiny">iOS web notifications depend on browser permission and may not run reliably while the app is closed.</p>';
 }else if(section==='cards'){
  const rows=db.paymentCards.map(c=>'<div class="bosx-row"><div class="grow"><b>'+esc(c.name)+'</b><div class="tiny">'+esc(c.issuer||'')+' · •••• '+esc(c.last4||'----')+' · '+money2(c.used)+' / '+money2(c.limit)+'</div></div><button class="secondary" onclick="bosxDeleteCard(\''+esc(c.id)+'\')">Remove</button></div>').join('');
  p.innerHTML='<div class="row between"><h2>Payment Cards</h2><button class="secondary" onclick="bosxAddCard()">＋ Add</button></div>'+ (rows||'<p class="tiny">No payment cards saved.</p>')+'<p class="tiny">For safety, only save the card nickname and last four digits. Never store a full number, CVV or PIN.</p>';
 }else if(section==='coach'){
  const totalSpent=spent(),largest=[...db.categories].map(c=>({name:c.name,amount:monthEntries().filter(e=>e.category===c.name&&e.type==='expense').reduce((n,e)=>n+Number(e.amount||0),0)})).sort((a,b)=>b.amount-a.amount)[0];
  const fixed=db.categories.filter(c=>c.group==='fixed').reduce((n,c)=>n+Number(c.budget||0),0);
  p.innerHTML='<h2>Budget Coach</h2><div class="bosx-stat" style="margin-top:12px"><div class="card"><small class="tiny">Monthly income</small><h2>'+money2(db.income)+'</h2></div><div class="card"><small class="tiny">Recorded spending</small><h2>'+money2(totalSpent)+'</h2></div><div class="card"><small class="tiny">Fixed category plan</small><h2>'+money2(fixed)+'</h2></div><div class="card"><small class="tiny">Top category</small><h2>'+esc(largest?.name||'—')+'</h2></div></div><p class="tiny" style="margin-top:12px">This local report uses the transactions and budgets stored on this device. It does not invent missing records.</p><button class="secondary" style="width:100%" onclick="bosxMonthlyReport()">Generate monthly report</button>';
 }
};
window.bosxAddGoal=()=>showModal('Add Savings Goal','<form onsubmit="bosxSaveGoal(event)"><label>Goal name</label><input id="bxGoalName" required><label>Target amount (₹)</label><input id="bxGoalTarget" type="number" min="1" required><label>Already saved (₹)</label><input id="bxGoalSaved" type="number" min="0" value="0"><div class="modalactions"><button class="primary">Save Goal</button></div></form>');
window.bosxSaveGoal=e=>{e.preventDefault();db.goals.push({id:uid2(),name:$('bxGoalName').value.trim(),target:Number($('bxGoalTarget').value),saved:Number($('bxGoalSaved').value)||0});saveData();closeModal();bosxOpen('goals')};
window.bosxEditGoal=id=>{const g=db.goals.find(x=>x.id===id);if(!g)return;showModal('Edit Savings Goal','<form onsubmit="bosxUpdateGoal(event,\''+esc(id)+'\')"><label>Goal name</label><input id="bxGoalName" value="'+esc(g.name)+'" required><label>Target (₹)</label><input id="bxGoalTarget" type="number" min="1" value="'+Number(g.target)+'" required><label>Saved (₹)</label><input id="bxGoalSaved" type="number" min="0" value="'+Number(g.saved)+'"><div class="modalactions"><button class="primary">Update</button><button type="button" class="secondary" onclick="bosxRemoveGoal(\''+esc(id)+'\')">Delete</button></div></form>')};
window.bosxUpdateGoal=(e,id)=>{e.preventDefault();const g=db.goals.find(x=>x.id===id);if(!g)return;Object.assign(g,{name:$('bxGoalName').value.trim(),target:Number($('bxGoalTarget').value),saved:Number($('bxGoalSaved').value)||0});saveData();closeModal();bosxOpen('goals')};
window.bosxRemoveGoal=id=>{db.goals=db.goals.filter(g=>g.id!==id);saveData();closeModal();bosxOpen('goals')};
window.bosxAddRecurring=()=>showModal('Add Recurring Payment','<form onsubmit="bosxSaveRecurring(event)"><label>Payment name</label><input id="bxRecName" required placeholder="Rent, subscription, EMI"><label>Amount (₹)</label><input id="bxRecAmount" type="number" min="1" required><label>Due day of month</label><input id="bxRecDay" type="number" min="1" max="31" value="5" required><label>Frequency</label><select id="bxRecFreq"><option>monthly</option><option>weekly</option><option>yearly</option></select><div class="modalactions"><button class="primary">Save Payment</button></div></form>');
window.bosxSaveRecurring=e=>{e.preventDefault();db.recurringPayments.push({id:uid2(),name:$('bxRecName').value.trim(),amount:Number($('bxRecAmount').value),day:Number($('bxRecDay').value),frequency:$('bxRecFreq').value,active:true,createdAt:new Date().toISOString()});saveData();closeModal();bosxOpen('recurring')};
window.bosxToggleRecurring=id=>{const x=db.recurringPayments.find(x=>x.id===id);if(x)x.active=x.active===false;saveData();bosxOpen('recurring')};
window.bosxAddCard=()=>showModal('Add Payment Card','<form onsubmit="bosxSaveCard(event)"><label>Card name</label><input id="bxCardName" required placeholder="Everyday card"><label>Issuer</label><input id="bxCardIssuer"><label>Card type</label><select id="bxCardType"><option>Debit</option><option>Credit</option><option>RuPay</option><option>Visa</option><option>Mastercard</option></select><label>Last four digits only</label><input id="bxCardLast4" inputmode="numeric" maxlength="4" pattern="[0-9]{0,4}"><label>Limit (₹)</label><input id="bxCardLimit" type="number" min="0" value="0"><label>Tracked use (₹)</label><input id="bxCardUsed" type="number" min="0" value="0"><div class="modalactions"><button class="primary">Save Card</button></div></form>');
window.bosxSaveCard=e=>{e.preventDefault();db.paymentCards.push({id:uid2(),name:$('bxCardName').value,issuer:$('bxCardIssuer').value,network:$('bxCardType').value,last4:$('bxCardLast4').value.replace(/\D/g,'').slice(-4),limit:Number($('bxCardLimit').value)||0,used:Number($('bxCardUsed').value)||0});saveData();closeModal();bosxOpen('cards')};
window.bosxDeleteCard=id=>{db.paymentCards=db.paymentCards.filter(c=>c.id!==id);saveData();bosxOpen('cards')};
window.bosxExportCSV=()=>{
 const rows=[['Date','Type','Category','Amount','Note','Payment method'],...db.entries.map(x=>[x.date,x.type,x.category,x.amount,x.note||'',x.paymentMethod||''])];
 const csv=rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\r\n');
 const blob=new Blob([csv],{type:'text/csv;charset=utf-8'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='budgetos-transactions.csv';a.click();URL.revokeObjectURL(url);
};
window.bosxMonthlyReport=()=>{
 const rows=monthEntries(),inc=income(),out=rows.filter(x=>x.type==='expense').reduce((n,x)=>n+Number(x.amount||0),0),save=rows.filter(x=>x.type==='saving').reduce((n,x)=>n+Number(x.amount||0),0);
 showModal('Monthly Financial Report','<p class="tiny">'+esc(fmtMonth())+'</p><div class="bosx-stat"><div class="card"><small class="tiny">Income</small><h2>'+money2(inc)+'</h2></div><div class="card"><small class="tiny">Expenses</small><h2>'+money2(out)+'</h2></div><div class="card"><small class="tiny">Savings recorded</small><h2>'+money2(save)+'</h2></div><div class="card"><small class="tiny">Net cash flow</small><h2>'+money2(inc-out)+'</h2></div></div><p class="tiny">Based only on records available for this month.</p><div class="modalactions"><button class="primary" onclick="closeModal()">Close</button></div>');
};
const oldImport=window.importBackup;
window.importBackup=function(e){
 const file=e.target.files?.[0];if(!file)return;const r=new FileReader();
 r.onload=()=>{try{const d=JSON.parse(r.result);if(fullAndroidBackup(d)){if(!confirm('Import the full Android BudgetOS backup? This replaces the current local iOS data. Export a backup first.'))return;convertAndroidBackup(d);return}
 if(!d||!Array.isArray(d.categories)||!Array.isArray(d.entries))throw Error('Unsupported backup format');
 db=normalizeData(d);saveData();toast('Backup restored');
 }catch(err){toast('Invalid backup: '+(err.message||''))}};r.onerror=()=>toast('Could not read backup');r.readAsText(file);e.target.value='';
};
const oldJarvis=window.jarvisReply;
window.jarvisReply=function(q){
 const text=String(q||'').trim(),low=text.toLowerCase();
 if(/^remember\s+/i.test(text)){db.jarvisMemory.push({text:text.replace(/^remember\s+/i,''),date:new Date().toISOString()});db.jarvisMemory=db.jarvisMemory.slice(-50);saveData();return 'Saved that note in local JARVIS memory on this device.'}
 if(/show.*goal|savings goal/.test(low))return 'You have '+db.goals.length+' savings goals. Open More → Savings Goals to review them.';
 if(/recurring|fixed payment|upcoming bill/.test(low))return 'You have '+db.recurringPayments.filter(x=>x.active!==false).length+' active recurring payment rules. Open More → Recurring Payments to manage them.';
 if(/card|credit card|debit card/.test(low))return 'You have '+db.paymentCards.length+' saved card references. Only last-four digits are stored.';
 if(/report|monthly summary/.test(low))return 'This month: income '+money2(income())+', expenses '+money2(spent())+', savings '+money2(saved())+'.';
 if(/export.*csv/.test(low)){bosxExportCSV();return 'I started exporting your transaction CSV.'}
 return oldJarvis?oldJarvis(q):'I can summarize your BudgetOS records and help with goals, recurring payments, cards and monthly reports.';
};
window.addEventListener('load',()=>{ensure();if(!db.onboarding.completed&&!db.profile?.onboardingCompleted)startOnboarding(false)});
})();
