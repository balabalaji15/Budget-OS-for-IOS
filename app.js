const KEY='budgetos-pwa-v1';
const today=()=>new Date().toISOString().slice(0,10);
let state=JSON.parse(localStorage.getItem(KEY)||'{"transactions":[],"emis":[],"assets":[]}');
const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR',maximumFractionDigits:0}).format(Number(n)||0);
const el=id=>document.getElementById(id);
function save(){localStorage.setItem(KEY,JSON.stringify(state));render()}
function render(){
 const now=new Date(), ym=now.toISOString().slice(0,7);
 el('monthLabel').textContent=now.toLocaleDateString('en-IN',{month:'long',year:'numeric'});
 const monthTx=state.transactions.filter(t=>t.date.slice(0,7)===ym);
 const income=monthTx.filter(t=>t.type==='income').reduce((a,t)=>a+ +t.amount,0);
 const expense=monthTx.filter(t=>t.type==='expense').reduce((a,t)=>a+ +t.amount,0);
 const emi=state.emis.reduce((a,x)=>a+ +x.amount,0);
 const assets=state.assets.reduce((a,x)=>a+ +x.value,0);
 const liabilities=state.emis.reduce((a,x)=>a+Math.max(0,+x.principal),0);
 el('incomeTotal').textContent=money(income);el('expenseTotal').textContent=money(expense);
 el('monthBalance').textContent=money(income-expense);el('emiTotal').textContent=money(emi);
 el('assets').textContent=money(assets);el('liabilities').textContent=money(liabilities);
 el('netWorth').textContent=money(assets-liabilities);
 el('emiCount').textContent=state.emis.length+' active';
 el('emiList').innerHTML=state.emis.length?state.emis.map((x,i)=>`<div class="list-row"><div><strong>${esc(x.name)}</strong><small>${x.start} → ${x.end} · EMI ${money(x.amount)}</small></div><span class="amount">${money(x.principal)}</span><button aria-label="Delete EMI" onclick="del('emis',${i})">×</button></div>`).join(''):'<div class="empty">No EMIs added yet.</div>';
 const recent=[...state.transactions].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,8);
 el('transactionList').innerHTML=recent.length?recent.map((x,i)=>`<div class="list-row"><div><strong>${esc(x.title)}</strong><small>${x.date} · ${x.type}</small></div><span class="amount ${x.type==='income'?'green':''}">${x.type==='income'?'+':'−'}${money(x.amount)}</span></div>`).join(''):'<div class="empty">Your transactions will appear here.</div>';
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
window.del=(kind,i)=>{if(confirm('Delete this item?')){state[kind].splice(i,1);save()}};
document.querySelectorAll('[data-open]').forEach(b=>b.addEventListener('click',()=>el(b.dataset.open).showModal()));
document.querySelectorAll('.close').forEach(b=>b.addEventListener('click',()=>b.closest('dialog').close()));
el('txDate').value=today();
el('transactionForm').addEventListener('submit',e=>{if(!el('txTitle').value||!el('txAmount').value)return;e.preventDefault();state.transactions.push({type:el('txType').value,title:el('txTitle').value,amount:+el('txAmount').value,date:el('txDate').value});save();el('transactionModal').close();e.target.reset();el('txDate').value=today()});
el('emiForm').addEventListener('submit',e=>{e.preventDefault();state.emis.push({name:el('emiName').value,amount:+el('emiAmount').value,start:el('emiStart').value,end:el('emiEnd').value,principal:+el('emiPrincipal').value});save();el('emiModal').close();e.target.reset()});
el('assetForm').addEventListener('submit',e=>{e.preventDefault();state.assets.push({name:el('assetName').value,value:+el('assetValue').value});save();el('assetModal').close();e.target.reset()});
el('jarvisInfo').onclick=()=>alert('Jarvis AI is not connected in this starter build. We can connect your existing BudgetOS AI endpoint after the current project code is available.');
el('settingsBtn').onclick=()=>{if(confirm('Export your BudgetOS data as a backup?')){const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='budgetos-backup.json';a.click();URL.revokeObjectURL(a.href)}};
if('serviceWorker'in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./service-worker.js').catch(console.error));
render();
