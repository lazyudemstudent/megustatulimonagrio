'use strict';
const $ = id => document.getElementById(id);
const esc = v => String(v ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => 'C$ ' + Number(n).toLocaleString('es-NI',{minimumFractionDigits:2,maximumFractionDigits:2});
const today = () => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; };
const future = (days=1) => {const d=new Date(); d.setDate(d.getDate()+days); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;};
const field = (name,label,type='text',extra='') => `<label>${label}<input name="${name}" id="${name}" type="${type}" required ${extra}></label>`;
const choose = (name,label,items,extra='') => `<label>${label}<select name="${name}" id="${name}" required ${extra}><option value="">Seleccionar…</option>${items.map(x=>`<option value="${esc(x.id)}">${esc(x.name)}</option>`).join('')}</select></label>`;
const table = (heads,rows) => `<div class="table-wrap"><table><thead><tr>${heads.map(x=>`<th scope="col">${x}</th>`).join('')}</tr></thead><tbody>${rows.length?rows.map(r=>`<tr>${r.map(c=>`<td>${c}</td>`).join('')}</tr>`).join(''):`<tr><td colspan="${heads.length}" class="empty">Sin registros para mostrar.</td></tr>`}</tbody></table></div>`;
const panel = (title,html) => `<section class="panel"><h3>${title}</h3>${html}</section>`;
const form = (id,html,button='Guardar') => `<form id="${id}"><div class="fields">${html}</div><button type="submit">${button}</button></form>`;
const notice = (msg,bad=false) => { $('notice').textContent=msg; $('notice').className=bad?'notice error':'notice success'; };
const integer = v => Number.isInteger(Number(v)) && Number(v)>=0 && String(v).trim()!=='';
const validName = v => v && v.trim().length>=2;
const options = a => a.map(x=>({id:x.id,name:x.name}));
const addPerson = (arr, f) => {const name=f.name.trim(), email=f.email.trim(); if(!validName(name)||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw Error('Escriba un nombre de al menos dos caracteres y un correo válido.'); if(arr.some(x=>x.email.toLowerCase()===email.toLowerCase())) throw Error('Ya existe un registro con ese correo.'); arr.push({id:arr.length+1,name,email});};
const personView = (title,arr) => panel(`Registrar ${title}`,form('person-form',field('name','Nombre','text','minlength="2" maxlength="80"')+field('email','Correo','email','maxlength="100" placeholder="persona@example.test"')))+panel('Registros',table(['Código','Nombre','Correo'],arr.map(x=>[esc(x.id),esc(x.name),esc(x.email)])));
function bind(id, fn, message='Registro guardado.') { $(id).addEventListener('submit', e=>{e.preventDefault(); const f=Object.fromEntries(new FormData(e.target)); try {fn(f);render();notice(message);} catch(err){notice(err.message,true);} }); }
function searchTable(id,arr,fn,heads,cells){ $(id).addEventListener('input',e=>{const q=e.target.value.trim().toLowerCase();$('results').innerHTML=table(heads,arr.filter(x=>fn(x).toLowerCase().includes(q)).map(cells));}); }
let current='inicio';
function render(){
 document.querySelectorAll('nav a').forEach(a=>{if(a.dataset.view===current)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
 $('view-title').textContent=current==='inicio'?'Inicio':MODULES[Number(current)];
 $('content').innerHTML=current==='inicio'?home():view(Number(current));
 if(current!=='inicio') wire(Number(current));
}
function home(){return `<section class="home"><h2>${HOME_TITLE}</h2><p>${HOME_TEXT}</p><ul class="module-links">${MODULES.map((n,i)=>`<li><a href="#${i}">${n}</a><span>${DESCRIPTIONS[i]}</span></li>`).join('')}</ul></section>`;}
function navigate(){const h=location.hash.slice(1); current=['0','1','2'].includes(h)?h:'inicio';render();$('notice').textContent='';$('notice').className='notice';}
window.addEventListener('hashchange',navigate);

const BRAND = "Estudio Bienestar";
const MODULES = ["Clientes", "Servicios", "Agenda"];
const HOME_TITLE = "Gestión de citas";
const HOME_TEXT = "Consulte los servicios y organice la agenda de atención.";
const DESCRIPTIONS = ["Registro y consulta de clientes.", "Servicios y duración de atención.", "Reserva y cancelación de citas."];
const clients=[{id:1,name:'Cliente de ejemplo A',email:'cliente.a@example.test'},{id:2,name:'Cliente de ejemplo B',email:'cliente.b@example.test'}];const services=[{id:1,name:'Asesoría de bienestar',duration:30},{id:2,name:'Sesión de relajación',duration:60}];const appointments=[];
function view(i){if(i===0)return personView('cliente',clients);if(i===1)return panel('Registrar servicio',form('service-form',field('name','Servicio','text','minlength="2" maxlength="80"')+field('duration','Duración (minutos)','number','min="15" max="180" step="1"')))+panel('Servicios',table(['Código','Servicio','Duración'],services.map(x=>[x.id,esc(x.name),x.duration+' min'])));return panel('Programar cita','<p class="muted">Un profesional. Jornada de 08:00 a 18:00. La cita completa debe quedar dentro de ese horario.</p>'+form('appointment-form',choose('client','Cliente',options(clients))+choose('service','Servicio',services.map(x=>({id:x.id,name:`${x.name} · ${x.duration} min`})))+field('start','Fecha y hora','datetime-local',`min="${today()}T08:00" value="${future()}T11:00"`),'Reservar cita'))+panel('Agenda cronológica',table(['Cliente','Servicio','Inicio','Fin','Estado','Acción'],[...appointments].sort((a,b)=>a.start.localeCompare(b.start)).map(x=>[esc(x.client),esc(x.service),esc(x.start.replace('T',' ')),x.endLabel,`<span class="tag">${x.cancelled?'Cancelada':'Activa'}</span>`,x.cancelled?'—':`<button type="button" class="secondary" data-cancel="${x.id}">Cancelar</button>`])));}
function wire(i){if(i===0)bind('person-form',f=>addPerson(clients,f));else if(i===1)bind('service-form',f=>{if(!validName(f.name)||!integer(f.duration)||Number(f.duration)<15||Number(f.duration)>180)throw Error('Indique nombre y duración entera entre 15 y 180 minutos.');services.push({id:services.length+1,name:f.name.trim(),duration:Number(f.duration)});});else{bind('appointment-form',f=>{const c=clients.find(x=>x.id===Number(f.client)),s=services.find(x=>x.id===Number(f.service)),start=new Date(f.start),end=new Date(start.getTime()+(s?.duration||0)*60000);if(!c||!s||!Number.isFinite(start.getTime())||start<=new Date())throw Error('Seleccione cliente, servicio y fecha/hora futura.');const minute=start.getHours()*60+start.getMinutes();if(minute<480||minute+s.duration>1080)throw Error('La cita debe quedar dentro de 08:00 a 18:00.');if(appointments.some(x=>!x.cancelled&&start.getTime()<x.end&&end.getTime()>x.begin))throw Error('El horario se solapa con otra cita activa.');appointments.push({id:appointments.length+1,client:c.name,service:s.name,start:f.start,begin:start.getTime(),end:end.getTime(),endLabel:end.toLocaleTimeString('es-NI',{hour:'2-digit',minute:'2-digit',hour12:false}),cancelled:false});},'Cita reservada sin cruces de horario.');document.querySelectorAll('[data-cancel]').forEach(b=>b.addEventListener('click',()=>{const a=appointments.find(x=>x.id===Number(b.dataset.cancel));if(!a||a.cancelled)return;a.cancelled=true;render();notice('Cita cancelada; horario liberado.');}));}}

navigate();
