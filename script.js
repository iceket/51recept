/* Логика сайта. Данные рецептов лежат в recipes.js (массив RAW) */
const D=RAW.map(r=>({e:r[0],n:r[1],c:r[2],t:r[3],d:r[4],k:r[5],h:r[6],s:r[7],i:r[8],st:r[9],tp:r[10]}));
const $=id=>document.getElementById(id);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Звёздное небо: один div 1×1 px, всё поле — список box-shadow */
function stars(el,n,blur,a0,a1){const s=[];for(let i=0;i<n;i++)s.push(`${(Math.random()*100).toFixed(1)}vw ${(Math.random()*100).toFixed(1)}vh ${blur}px 0 rgba(255,255,255,${(a0+Math.random()*(a1-a0)).toFixed(2)})`);el.style.boxShadow=s.join(',')}
stars($('stA'),150,0,.05,.3);stars($('stB'),18,1.2,.35,.7);

/* 3D-кольцо: карточки на цилиндре, камера в его центре (R=891, шаг 360/37, отсечение 42°) */
const N=37,STEP=360/N,R=891,ring=$('ring'),cards=[];
for(let i=0;i<N;i++){
  const d=D[Math.floor(i*D.length/N)],c=document.createElement('div');
  c.className='card3';
  c.style.background=`linear-gradient(165deg,hsl(${d.h} 70% 50%),hsl(${d.h} 75% 20%) 70%,#06080d)`;
  c.innerHTML=`<div class="em">${d.e}</div><div class="tt">${d.n}</div><div class="mm">⏱ ${d.t} МИН</div><div class="pl">Рецепт</div><div class="edge"></div>`;
  ring.appendChild(c);cards.push(c);
}
let phase=-2,last=0;
function place(){cards.forEach((el,i)=>{const a=((i*STEP+phase)%360+540)%360-180;if(Math.abs(a)>42){el.style.visibility='hidden';return}el.style.visibility='visible';const r=a*Math.PI/180,c=Math.cos(r);el.style.transform=`translate3d(${R*Math.sin(r)}px,0,${R*(1-c)}px) rotateY(${-a}deg)`;el.style.filter=`brightness(${.84+.5*(1/c-1)})`})}
function tick(t){const dt=Math.min((t-last)/1000,.1);last=t;if(!reduce)phase-=1.9*dt;place();requestAnimationFrame(tick)}
document.addEventListener('visibilitychange',()=>{last=performance.now()});
requestAnimationFrame(t=>{last=t;tick(t)});

/* Каталог: поиск + категория + сложность */
const grid=$('grid'),q=$('q'),dlg=$('dlg'),det=$('det');
let cat='Все',diff='Все';
function chipRow(el,items,onPick){items.forEach(x=>{const b=document.createElement('button');b.className='chip'+(x==='Все'?' on':'');b.textContent=x;b.onclick=()=>{[...el.children].forEach(c=>c.classList.toggle('on',c===b));onPick(x);render()};el.appendChild(b)})}
chipRow($('cats'),['Все',...new Set(D.map(x=>x.k))],v=>cat=v);
chipRow($('diffs'),['Все','Легко','Средне','Сложно'],v=>diff=v);
function render(){
  const s=q.value.trim().toLowerCase();grid.innerHTML='';
  const r=D.map((x,i)=>({x,i})).filter(({x})=>(cat==='Все'||x.k===cat)&&(diff==='Все'||x.d===diff)&&(!s||(x.n+x.s+x.c+x.k+x.i.join(' ')).toLowerCase().includes(s)));
  $('count').textContent=`Найдено рецептов: ${r.length} из ${D.length}`;
  if(!r.length){grid.innerHTML='<div class="empty">Ничего не найдено 🍳</div>';return}
  r.forEach(({x,i})=>{const b=document.createElement('button');b.className='rc';b.innerHTML=`<div class="tile">${x.e}</div><h3>${i+1}. ${x.n}</h3><p>${x.s}</p><div class="meta"><b>⏱ ${x.t} мин</b><b>${x.d}</b><b>${x.k}</b></div>`;b.onclick=()=>openRecipe(x);grid.appendChild(b)});
}
function openRecipe(x){
  det.innerHTML=`<button class="x" aria-label="Закрыть">✕</button><div class="tile">${x.e}</div><h2>${x.n}</h2><div class="meta"><b>⏱ ${x.t} мин</b><b>${x.d}</b><b>${x.c}</b></div><h4>Ингредиенты</h4><ul>${x.i.map(a=>`<li>${a}</li>`).join('')}</ul><h4>Приготовление</h4><ol>${x.st.map(a=>`<li>${a}</li>`).join('')}</ol><div class="tip">💡 ${x.tp}</div>`;
  det.querySelector('.x').onclick=()=>dlg.close();dlg.showModal();
}
dlg.addEventListener('click',e=>{if(e.target===dlg)dlg.close()});
q.oninput=render;render();
