/* Vélez Up · Probador
   Prototipo universitario. Las fotos del banco se generaron con IA; con una clave de Gemini
   la persona crea su avatar desde su foto y se prueba las prendas en él. */
'use strict';

const D = window.PROBADOR;
const KEY = 'velezup:probador';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cop = n => '$' + Math.round(n).toLocaleString('es-CO');
const wait = ms => new Promise(r => setTimeout(r, ms));
const LEGAL = 'Proyecto universitario · Gestión del Diseño 2. No es una app oficial de Vélez. Imágenes generadas con IA.';
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const STYLES = [
  {id:'urbano', label:'Urbano', hint:'Jean, cargo y capas Fly Up', prefer:['jean', 'cargo']},
  {id:'mixto', label:'Mixto', hint:'Cuero Vélez con básicos urbanos', prefer:['cuero', 'jean']},
  {id:'elegante', label:'Elegante', hint:'Sastrería y cuero', prefer:['blazer', 'sastre']},
];
const KIND = {jacket:'Chaqueta', bottom:'Inferior'};
const ic = name => ({
  back:'<svg class="icon" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg>',
  close:'<svg class="icon" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg>',
  arrow:'<svg class="icon" viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
})[name];

/* ---------------- estado ---------------- */
const blank = () => ({profile:null, sel:{}, bag:[], ai:{key:'', model:AI_MODELS[0]}, view:'base'});
const AI_MODELS = ['gemini-3.1-flash-image', 'gemini-3-pro-image', 'gemini-nano-banana-2.1', 'gemini-2.5-flash-image'];
let S = load();
function load() {
  try { return {...blank(), ...JSON.parse(localStorage.getItem(KEY) || '{}')}; } catch { return blank(); }
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { toast('No se pudo guardar en este navegador'); } }

/* IndexedDB: fotos grandes (foto, avatar y pruebas con IA) */
const store = (() => {
  let dbp = null;
  const open = () => dbp ||= new Promise((res, rej) => {
    const r = indexedDB.open('velezup-probador', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
  });
  const tx = async (mode, fn) => { const db = await open(); return new Promise((res, rej) => { const t = db.transaction('kv', mode); const q = fn(t.objectStore('kv')); t.oncomplete = () => res(q?.result); t.onerror = () => rej(t.error); }); };
  return {
    get: k => tx('readonly', s => s.get(k)).catch(() => null),
    set: (k, v) => tx('readwrite', s => s.put(v, k)).catch(() => toast('No se pudo guardar la imagen')),
    clear: () => tx('readwrite', s => s.clear()).catch(() => null),
  };
})();

/* ---------------- catálogo ---------------- */
const modelIds = () => Object.keys(D.models);
const myModel = () => D.models[S.profile?.g] ? S.profile.g : modelIds()[0];
const item = id => D.items[id];
const suffix = id => id.split('-').pop();
function selection(g = myModel()) {
  const M = D.models[g];
  const s = S.sel[g] || {};
  if (M.jackets.includes(s.jacket) && M.bottoms.includes(s.bottom)) return s;
  /* primer look: la combinación existente que más se parece al estilo elegido */
  const [pj, pb] = (STYLES.find(x => x.id === S.profile?.style) || STYLES[1]).prefer;
  const score = k => { const [j, b] = k.split('|'); return (suffix(j) === pj ? 2 : 0) + (suffix(b) === pb ? 1 : 0); };
  const best = Object.keys(M.combos).reduce((a, k) => (score(k) > score(a) ? k : a));
  const [jacket, bottom] = best.split('|');
  return (S.sel[g] = {jacket, bottom});
}
/* la foto exacta, o la más cercana (misma chaqueta, luego mismo inferior) */
function bankImage(g, jacket, bottom) {
  const M = D.models[g];
  const exact = M.combos[`${jacket}|${bottom}`];
  if (exact) return {src:exact, approx:false};
  const keys = Object.keys(M.combos);
  const near = keys.find(k => k.startsWith(jacket + '|')) || keys.find(k => k.endsWith('|' + bottom));
  return {src:near ? M.combos[near] : M.base, approx:true};
}

/* ---------------- IA (Gemini API, directo desde el navegador) ---------------- */
const PROMPTS = {
  avatar: p => `Create a photorealistic full-body e-commerce fashion photo of the exact same person shown in the attached photo. Keep their face, identity, skin tone, hairstyle and body proportions${p.height ? `; they are about ${p.height} cm tall and wear size ${p.size}` : ''}. They stand straight facing the camera, feet slightly apart, arms relaxed along the sides, shoulders level, wearing a fitted plain white crew-neck t-shirt, straight light-wash blue jeans and clean minimal white leather sneakers. Pure seamless white studio background, soft even diffused light, a very soft contact shadow under the feet. The whole body is visible from the top of the head to the shoes with generous white margin, centered, vertical 3:4 portrait, 85mm lens at chest height. No text, no logos, no props.`,
  tryon: (jacket, bottom) => `Virtual try-on. Image 1 is the base photo of a person. Image 2 is a jacket. Image 3 is ${bottom.id.endsWith('falda') ? 'a skirt' : 'a pair of trousers'}. Create a new photo of the exact same person from image 1 wearing the jacket from image 2 (worn open over their plain white crew-neck t-shirt) and the ${bottom.id.endsWith('falda') ? 'skirt from image 3 (it replaces the trousers, bare legs below the hem)' : 'trousers from image 3'}, with the same white leather sneakers. Keep the face, identity, hairstyle, skin tone, body proportions, pose, hands, camera angle, framing, size and position in the frame, the white studio background and the lighting exactly the same as image 1. Reproduce both garments faithfully: same color, material, cut, length, fit, stitching and hardware, with realistic drape and natural folds. Full body visible from head to shoes, vertical 3:4 portrait, photorealistic e-commerce photo. No text, no logos.`,
};
const aiOn = () => !!S.ai.key;
const toInline = dataUrl => { const [head, data] = dataUrl.split(','); return {inlineData:{mimeType:head.slice(5, head.indexOf(';')), data}}; };
/* las prendas son PNG/WebP transparentes: para la IA van sobre blanco, como fotos de catálogo */
async function productPhoto(url) {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const c = document.createElement('canvas'); c.width = img.naturalWidth; c.height = img.naturalHeight;
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0);
  return c.toDataURL('image/jpeg', .92);
}
async function gemini(text, images) {
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(S.ai.model)}:generateContent`, {
    method:'POST',
    headers:{'Content-Type':'application/json', 'x-goog-api-key':S.ai.key},
    body:JSON.stringify({
      contents:[{role:'user', parts:[{text}, ...images.map(toInline)]}],
      generationConfig:{responseModalities:['TEXT', 'IMAGE'], imageConfig:{aspectRatio:'3:4'}},
    }),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error?.message || `Error ${res.status}`);
  const part = json.candidates?.[0]?.content?.parts?.find(p => p.inlineData || p.inline_data);
  const img = part && (part.inlineData || part.inline_data);
  if (!img) throw new Error('La IA no devolvió una imagen. Intenta de nuevo.');
  return `data:${img.mimeType || img.mime_type || 'image/png'};base64,${img.data}`;
}
async function createAvatar() {
  const photo = await store.get('photo');
  if (!photo) throw new Error('Primero toma tu foto');
  const avatar = await gemini(PROMPTS.avatar(S.profile), [photo]);
  await store.set('avatar', avatar);
  FIT.hasAvatar = true; S.avatarAt = Date.now(); S.view = 'mine'; save();
  return avatar;
}
const tryonKey = (jacket, bottom) => `tryon:${S.avatarAt}:${S.ai.model}:${jacket}|${bottom}`;
async function tryOn(jacket, bottom) {
  const cached = await store.get(tryonKey(jacket, bottom));
  if (cached) return cached;
  const avatar = await store.get('avatar');
  const [j, b] = await Promise.all([productPhoto(item(jacket).img), productPhoto(item(bottom).img)]);
  const out = await gemini(PROMPTS.tryon(item(jacket), item(bottom)), [avatar, j, b]);
  await store.set(tryonKey(jacket, bottom), out);
  return out;
}

/* ---------------- interfaz común ---------------- */
let toastTimer;
function toast(msg, ms = 2600) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}
function header() {
  const top = $('#top');
  const n = S.bag.length;
  top.hidden = false;
  top.innerHTML = `<a class="brand" href="#/probador" aria-label="Probador"><img src="icons/icon-192.png" alt=""><b>Vélez Up</b><span>Probador</span></a>
    <div class="top-r"><a class="bagbtn" href="#/bolsa">Bolsa <i>${n}</i></a>
    <a class="me" href="#/perfil" aria-label="Mi perfil">${S.profile ? esc(S.profile.name[0].toUpperCase()) : '·'}</a></div>`;
  store.get('photo').then(p => { const me = $('.me', top); if (p && me) me.innerHTML = `<img src="${p}" alt="">`; });
}
function sheet(html) {
  const p = $('#panel'), v = $('#veil');
  p.innerHTML = html; p.hidden = false; v.hidden = false;
  requestAnimationFrame(() => { p.classList.add('show'); v.classList.add('show'); });
  $('.p-close', p)?.focus();
}
function closeSheet() {
  const p = $('#panel'), v = $('#veil');
  if (p.hidden) return;
  p.classList.remove('show'); v.classList.remove('show');
  setTimeout(() => { p.hidden = true; v.hidden = true; p.innerHTML = ''; }, 320);
}

/* ---------------- pantallas ---------------- */
const V = {};
let cleanup = null;

V.bienvenida = () => {
  $('#top').hidden = true;
  const g = modelIds()[0], M = D.models[g];
  const shots = [M.base, ...Object.values(M.combos)];
  const html = `<section class="welcome">
    <div class="copy">
      <a class="brand" href="#/"><img src="icons/icon-192.png" alt=""><b>Vélez Up</b></a>
      <h1 class="h1">Tu probador,<br><em>con tu foto.</em></h1>
      <p class="lead">Crea tu avatar con una foto, elige tu talla y pruébate las prendas Vélez y Fly Up antes de ir a la tienda.</p>
      <div class="actions"><a class="btn" href="#/registro/1">Crear mi avatar ${ic('arrow')}</a><a class="link" href="#/probador" data-act="guest">Probar sin registrarme</a></div>
      <p class="legal">${LEGAL}</p>
    </div>
    <div class="show" aria-hidden="true">${shots.map((s, i) => `<img src="${s}" alt="" style="opacity:${i ? 0 : 1}">`).join('')}</div>
  </section>`;
  let i = 0;
  const timer = setInterval(() => {
    const imgs = $$('.show img'); if (!imgs.length) return;
    imgs[i].style.opacity = 0; i = (i + 1) % imgs.length; imgs[i].style.opacity = 1;
  }, 2200);
  cleanup = () => clearInterval(timer);
  return html;
};

/* registro en 5 pasos */
let REG = null;
const regDraft = () => REG ||= {name:'', g:modelIds()[0], photo:null, size:'S', height:165, style:null};
const REG_STEPS = 5;
V.registro = step => {
  $('#top').hidden = true;
  const r = regDraft();
  step = Math.min(Math.max(+step || 1, 1), REG_STEPS);
  const bar = Array.from({length:REG_STEPS}, (_, i) => `<i class="${i < step ? 'on' : ''}"></i>`).join('');
  const back = step > 1 ? `#/registro/${step - 1}` : '#/';
  let body = '', foot = '';
  if (step === 1) {
    body = `<h1 class="h2">¿Cómo te llamas?</h1>
      <div class="field"><label for="regName">Tu nombre o apodo</label><input class="input" id="regName" maxlength="24" autocomplete="given-name" value="${esc(r.name)}" placeholder="Valentina"></div>
      <p class="err" id="regErr"></p>`;
    foot = `<button class="btn block" data-act="regName">Seguir</button>`;
  } else if (step === 2) {
    body = `<h1 class="h2">Elige tu modelo base</h1><p class="small">Es el cuerpo de referencia mientras se crea tu avatar.</p>
      <div class="choices">${[['w', 'Mujer'], ['m', 'Hombre']].map(([g, label]) => {
        const M = D.models[g];
        return M ? `<button class="choice ${r.g === g ? 'on' : ''}" data-act="regModel" data-arg="${g}" aria-pressed="${r.g === g}"><div class="ph"><img src="${M.base}" alt=""></div><b>${label}</b><span>${esc(M.info)}</span></button>`
          : `<button class="choice" disabled><div class="ph"><span class="small">Próximamente</span></div><b>${label}</b><span>En preparación</span></button>`;
      }).join('')}</div>`;
    foot = `<a class="btn block" href="#/registro/3">Seguir</a>`;
  } else if (step === 3) {
    body = `<h1 class="h2">Tómate una foto</h1><p class="small">De frente, cuerpo entero si puedes y con buena luz. Con ella se crea tu avatar.</p>
      <div class="cam" id="cam">${r.photo ? `<img src="${r.photo}" alt="Tu foto">` : `<video id="camVideo" playsinline muted></video>${SILHOUETTE}<p class="hint">Ubícate dentro de la silueta</p>`}</div>
      <div class="cam-actions">${r.photo
        ? `<button class="btn ghost" data-act="retake">Repetir</button>`
        : `<button class="btn" data-act="shoot" id="shootBtn">Tomar foto</button>`}
        <label class="btn ghost filebtn">Subir una foto<input type="file" accept="image/*" capture="user" id="photoFile"></label></div>`;
    foot = `<a class="btn block" href="#/registro/4" ${r.photo ? '' : 'data-act="noPhoto"'}>${r.photo ? 'Usar esta foto' : 'Seguir sin foto'}</a>`;
  } else if (step === 4) {
    body = `<h1 class="h2">Tu talla</h1>
      <div class="field"><label>Talla habitual</label><div class="chips">${SIZES.map(s => `<button class="chip ${r.size === s ? 'on' : ''}" data-act="regSize" data-arg="${s}" aria-pressed="${r.size === s}">${s}</button>`).join('')}</div></div>
      <div class="field"><label for="regHeight">Estatura · <b id="hOut">${r.height} cm</b></label><input class="range" type="range" id="regHeight" min="145" max="200" value="${r.height}"></div>`;
    foot = `<a class="btn block" href="#/registro/5">Seguir</a>`;
  } else {
    body = `<h1 class="h2">¿Cuál es tu estilo?</h1><p class="small">Con él elegimos tu primer look.</p>
      <div class="styles">${STYLES.map(s => `<button class="style ${r.style === s.id ? 'on' : ''}" data-act="regStyle" data-arg="${s.id}" aria-pressed="${r.style === s.id}"><b>${s.label}</b><span>${s.hint}</span></button>`).join('')}</div>`;
    foot = `<button class="btn block" data-act="regDone" ${r.style ? '' : 'disabled'}>Crear mi avatar</button>`;
  }
  if (step === 3 && !r.photo) setTimeout(startCamera, 0);
  else stopCamera();
  return `<section class="reg"><div class="reg-top"><a class="back" href="${back}" aria-label="Atrás">${ic('back')}</a><span class="eyebrow">Paso ${step} de ${REG_STEPS}</span><span style="width:40px"></span></div>
    <div class="steps">${bar}</div><div class="reg-body">${body}</div><div class="reg-foot">${foot}</div></section>`;
};
const SILHOUETTE = `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2" stroke-dasharray="6 7"><ellipse cx="150" cy="70" rx="30" ry="37"/><path d="M98 130c10-14 32-20 52-20s42 6 52 20l14 120M98 130l-14 120M118 250l-4 135M182 250l4 135M118 250h64"/></g></svg>`;

/* cámara frontal */
let camStream = null;
async function startCamera() {
  const video = $('#camVideo'); if (!video) return;
  if (!navigator.mediaDevices?.getUserMedia) return cameraUnavailable();
  try {
    camStream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'user', width:{ideal:1080}, height:{ideal:1440}}, audio:false});
    if (!$('#camVideo')) return stopCamera();
    video.srcObject = camStream; await video.play();
  } catch { cameraUnavailable(); }
}
function stopCamera() { camStream?.getTracks().forEach(t => t.stop()); camStream = null; }
function cameraUnavailable() {
  const cam = $('#cam'); if (!cam) return;
  cam.innerHTML = `<div class="none">No pudimos abrir la cámara.<br>Puedes subir una foto desde tu galería.</div>`;
  $('#shootBtn')?.remove();
}
async function shrinkPhoto(source, w, h, mirror) {
  const k = Math.min(1, 1024 / Math.max(w, h));
  const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k);
  const x = c.getContext('2d');
  if (mirror) { x.translate(c.width, 0); x.scale(-1, 1); }
  x.drawImage(source, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', .9);
}

/* creando el avatar */
V.creando = () => {
  $('#top').hidden = true;
  const steps = aiOn() ? ['Leyendo tu foto', 'Creando tu avatar con IA', 'Preparando el probador'] : ['Leyendo tu foto', 'Ajustando talla y estatura', 'Preparando el probador'];
  setTimeout(runMaking, 50);
  return `<section class="making" id="making"><div class="ring" id="ring"></div>
    <h1 class="h2">Creando tu avatar</h1>
    <ol>${steps.map(s => `<li>${s}</li>`).join('')}</ol>
    <p class="small" id="makingNote" style="max-width:34ch">${aiOn() ? 'Esto puede tardar unos segundos.' : 'Modo demostración: usaremos el modelo base. Con la IA conectada, tu avatar se crea desde tu foto.'}</p>
    <div id="makingActions"></div></section>`;
};
async function runMaking() {
  const lis = $$('#making li');
  const mark = i => lis.forEach((li, k) => { li.className = k < i ? 'ok' : k === i ? 'on' : ''; });
  const photo = await store.get('photo');
  if (photo) $('#ring').innerHTML = `<img src="${photo}" alt="">`;
  mark(0); await wait(900);
  mark(1);
  if (aiOn() && photo) {
    try { const av = await createAvatar(); $('#ring').innerHTML = `<img src="${av}" alt="">`; }
    catch (e) {
      $('#makingNote').textContent = 'No se pudo crear el avatar con IA: ' + e.message + '. Seguimos con el modelo base.';
      S.view = 'base'; save(); await wait(2200);
    }
  } else await wait(1300);
  mark(2); await wait(700); mark(3);
  $('#making').classList.add('done');
  go('/probador');
}

/* probador */
const FIT = {busy:0, hasAvatar:false};
V.probador = () => {
  header();
  const g = myModel(), M = D.models[g], sel = selection(g);
  const rail = (ids, kind, row) => ids.map((id, i) => {
    const it = item(id), on = sel[kind] === id;
    const side = i < Math.ceil(ids.length / 2) ? 'L' : 'R';
    const k = side === 'L' ? i : i - Math.ceil(ids.length / 2);
    const col = side === 'L' ? [2, 1][k % 2] : [4, 5][k % 2];
    return `<button class="item ${on ? 'on' : ''}" data-act="wear" data-arg="${id}" style="--col:${col};--row:${row + Math.floor(k / 2)}" aria-pressed="${on}" aria-label="${esc(it.name)}${on ? ', puesta' : ''}"><img src="${it.img}" alt="" loading="lazy"><span class="tip">${esc(it.name)}</span></button>`;
  }).join('');
  const views = aiOn() && FIT.hasAvatar ? `<div class="views" role="tablist"><button class="${S.view !== 'mine' ? 'on' : ''}" data-act="view" data-arg="base" role="tab">Modelo base</button><button class="${S.view === 'mine' ? 'on' : ''}" data-act="view" data-arg="mine" role="tab">Mi avatar</button></div>` : '';
  setTimeout(() => { paintModel(true); bindSwipe(); }, 0);
  return `<section class="fit" style="--r:${M.ratio}">
    <div class="rail rail-j" aria-label="Chaquetas">${rail(M.jackets, 'jacket', 1)}</div>
    <div class="stage" id="stage">${views}<figure class="model" id="model" style="aspect-ratio:${M.ratio}"><img class="front" alt=""><img class="back" alt=""><i class="floor"></i><div class="busy"><span>Probando en tu avatar…</span></div></figure><p class="note" id="note" hidden></p></div>
    <div class="worn" id="worn"></div>
    <div class="rail rail-b" aria-label="Inferiores">${rail(M.bottoms, 'bottom', 3)}</div>
    <p class="legal fit-legal">${LEGAL}</p>
  </section>`;
};
/* pinta la foto del look actual: banco, o prueba con IA sobre el avatar */
async function paintModel(instant = false) {
  const g = myModel(), sel = selection(g), fig = $('#model'); if (!fig) return;
  const token = ++FIT.busy;
  $('#worn').innerHTML = ['jacket', 'bottom'].map(k => `<button data-act="info" data-arg="${sel[k]}"><span>${k === 'jacket' ? 'Chaqueta' : (sel.bottom.endsWith('falda') ? 'Falda' : 'Pantalón')}</span><b>${esc(item(sel[k]).name)}</b></button>`).join('');
  const bank = bankImage(g, sel.jacket, sel.bottom);
  let src = bank.src, note = bank.approx ? 'Vista aproximada' : '';
  if (S.view === 'mine' && aiOn() && FIT.hasAvatar) {
    fig.classList.add('loading');
    try { src = await tryOn(sel.jacket, sel.bottom); note = 'Tu avatar · generado con IA'; }
    catch (e) { if (token === FIT.busy) toast(`La IA no respondió (${e.message}). Mostramos el modelo base.`, 4200); note = bank.approx ? 'Vista aproximada' : ''; }
    if (token !== FIT.busy) return;
    fig.classList.remove('loading');
  }
  crossfade(fig, src, instant);
  const n = $('#note'); n.hidden = !note; n.textContent = note;
}
function crossfade(fig, src, instant) {
  const front = $('img.front', fig), back = $('img.back', fig);
  if (front.getAttribute('src') === src) return;
  if (instant || !front.getAttribute('src')) { front.src = src; return; }
  back.onload = () => {
    back.style.opacity = 1; front.style.opacity = 0;
    setTimeout(() => {
      front.src = src; front.style.transition = 'none'; front.style.opacity = 1; back.style.opacity = 0;
      requestAnimationFrame(() => { front.style.transition = ''; });
    }, 460);
  };
  back.src = src;
}
function wear(id) {
  const it = item(id); if (!it) return;
  const sel = selection(it.model);
  if (sel[it.kind] === id) return openItem(id);
  sel[it.kind] = id; save();
  $$('.item').forEach(b => { const on = b.dataset.arg === sel[item(b.dataset.arg).kind]; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  paintModel();
}
function cycle(kind, dir) {
  const g = myModel(), list = D.models[g][kind === 'jacket' ? 'jackets' : 'bottoms'], sel = selection(g);
  wear(list[(list.indexOf(sel[kind]) + dir + list.length) % list.length]);
}
function bindSwipe() {
  const stage = $('#stage'); if (!stage) return;
  let x0 = 0, y0 = 0, upper = true;
  stage.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; const r = stage.getBoundingClientRect(); upper = e.clientY - r.top < r.height * .48; });
  stage.addEventListener('pointerup', e => {
    const dx = e.clientX - x0, dy = e.clientY - y0;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) cycle(upper ? 'jacket' : 'bottom', dx < 0 ? 1 : -1);
  });
}

/* ficha de la prenda */
let PANEL = {id:null, size:null, tab:'det'};
function openItem(id) {
  const it = item(id); if (!it) return;
  if (PANEL.id !== id) PANEL = {id, size:S.profile?.size && it.sizes.includes(S.profile.size) ? S.profile.size : null, tab:'det'};
  const M = D.models[it.model], list = M[it.kind === 'jacket' ? 'jackets' : 'bottoms'];
  const specs = PANEL.tab === 'det'
    ? [['Color', it.color], ['Fit', it.fit], ['Material', it.material], ['Forro', it.lining], ['Cuidado', it.care]]
    : [['Línea', it.line], ['Tallas', it.sizes.join(' · ')], ['Modelo', M.info], ['Imagen', 'Generada con IA']];
  const worn = selection(it.model)[it.kind] === id;
  sheet(`<div class="p-head"><span>${KIND[it.kind]} · ${String(list.indexOf(id) + 1).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}</span><button class="p-close" data-act="close" aria-label="Cerrar">${ic('close')}</button></div>
    <div class="p-body">
      <div class="p-photo"><img src="${it.img}" alt="${esc(it.name)}"></div>
      <h2 class="p-name" id="panelTitle">${esc(it.name)}</h2>
      <div class="p-line"><span class="small">${esc(it.line)}</span><span class="price">${cop(it.price)}</span></div>
      <p class="lead" style="font-size:14.5px">${esc(it.desc)}</p>
      <div class="field"><label>Talla${PANEL.size ? ` · <b>${PANEL.size}</b>` : ''}</label><div class="chips">${it.sizes.map(s => `<button class="chip ${PANEL.size === s ? 'on' : ''}" data-act="size" data-arg="${s}" aria-pressed="${PANEL.size === s}">${s}</button>`).join('')}</div></div>
      <div class="tabs" role="tablist"><button class="${PANEL.tab === 'det' ? 'on' : ''}" data-act="tab" data-arg="det" role="tab">Detalles</button><button class="${PANEL.tab === 'car' ? 'on' : ''}" data-act="tab" data-arg="car" role="tab">Características</button></div>
      <dl class="specs">${specs.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    </div>
    <div class="p-foot"><button class="btn ghost" data-act="onModel" ${worn ? 'disabled' : ''}>${worn ? 'Puesta' : 'En el modelo'}</button><button class="btn" data-act="addBag">Agregar a la bolsa</button></div>`);
}

/* bolsa */
V.bolsa = () => {
  header();
  const lines = S.bag.map((b, i) => ({...b, i, it:item(b.id)})).filter(b => b.it);
  const total = lines.reduce((a, b) => a + b.it.price, 0);
  return `<section class="page"><h1 class="h2">Tu bolsa</h1>
    ${lines.length ? `<div class="bag-list">${lines.map(b => `<div class="bag-it"><div class="th"><img src="${b.it.img}" alt=""></div><div><b>${esc(b.it.name)}</b><span>${esc(b.it.line)} · Talla ${b.size}</span><br><span>${cop(b.it.price)}</span></div><button class="link" data-act="rmBag" data-arg="${b.i}">Quitar</button></div>`).join('')}</div>
      <div class="total"><span>Total</span><b>${cop(total)}</b></div>
      <button class="btn block" data-act="reserve">Reservar en tienda</button>
      <p class="small">Es una reserva de prueba: no hay pagos. Muestras el código en la tienda y te tienen las prendas en tu talla.</p>`
    : `<div class="empty"><p>Tu bolsa está vacía.</p><a class="btn ghost" href="#/probador">Ir al probador</a></div>`}
  </section>`;
};

/* perfil */
V.perfil = () => {
  header();
  const p = S.profile;
  if (!p) return `<section class="page"><h1 class="h2">Tu perfil</h1><p class="lead">Aún no tienes perfil.</p><a class="btn" href="#/registro/1">Crear mi avatar</a><p class="legal">${LEGAL}</p></section>`;
  setTimeout(fillProfileImages, 0);
  const style = STYLES.find(s => s.id === p.style);
  return `<section class="page">
    <div class="prof"><div class="ph" id="profPhoto">${esc(p.name[0].toUpperCase())}</div><div><h1 class="h2">${esc(p.name)}</h1><p class="small">Talla ${p.size} · ${p.height} cm · ${style ? style.label : 'Sin estilo'}</p></div></div>
    <div class="card"><h3>Tu avatar</h3>
      <div class="avatars"><div><figure id="avMine"></figure><p class="small">Tu avatar con IA</p></div><div><figure><img src="${D.models[myModel()].base}" alt=""></figure><p class="small">Modelo base</p></div></div>
      <div class="chips">${modelIds().map(g => `<button class="chip ${myModel() === g ? 'on' : ''}" data-act="setModel" data-arg="${g}">${D.models[g].label}</button>`).join('')}${D.models.m ? '' : '<span class="small" style="align-self:center">Hombre · próximamente</span>'}</div>
      <div class="chips"><a class="btn ghost" href="#/registro/3" data-act="redoPhoto">Cambiar mi foto</a>${aiOn() ? '<button class="btn" data-act="makeAvatar">Crear avatar con IA</button>' : ''}</div>
    </div>
    <div class="card"><h3>Conectar IA (Gemini)</h3>
      <p class="small">Pega una clave de API de Google AI Studio para crear tu avatar desde tu foto y probarte las prendas en él. La clave se guarda solo en este navegador y se envía únicamente a Google. Cada imagen generada consume la cuota de tu clave.</p>
      <div class="field"><label for="aiKey">Clave de API</label><input class="input" id="aiKey" type="password" autocomplete="off" spellcheck="false" placeholder="${aiOn() ? 'Clave guardada' : 'Pega tu clave'}"></div>
      <div class="field"><label for="aiModel">Modelo de imagen</label><input class="input" id="aiModel" list="aiModels" value="${esc(S.ai.model)}"><datalist id="aiModels">${AI_MODELS.map(m => `<option value="${m}">`).join('')}</datalist></div>
      <div class="chips"><button class="btn" data-act="saveAi">Guardar</button>${aiOn() ? '<button class="btn ghost" data-act="forgetAi">Olvidar clave</button>' : ''}</div>
    </div>
    <div class="card"><h3>Datos</h3><p class="small">Tu foto, tu avatar y tus pruebas se guardan solo en este navegador.</p><button class="link danger" data-act="wipe" style="align-self:flex-start">Borrar todos mis datos</button></div>
    <p class="legal">${LEGAL}</p>
  </section>`;
};
async function fillProfileImages() {
  const [photo, avatar] = await Promise.all([store.get('photo'), store.get('avatar')]);
  if (photo && $('#profPhoto')) $('#profPhoto').innerHTML = `<img src="${photo}" alt="Tu foto">`;
  const box = $('#avMine'); if (!box) return;
  box.innerHTML = avatar ? `<img src="${avatar}" alt="Tu avatar">` : `<div class="empty small" style="padding:20px">${aiOn() ? 'Toca «Crear avatar con IA».' : 'Conecta la IA para crearlo desde tu foto.'}</div>`;
}

/* ---------------- acciones ---------------- */
const A = {
  close: () => closeSheet(),
  guest: () => {
    if (!S.profile) { S.profile = {name:'Invitado', g:modelIds()[0], size:'S', height:165, style:'mixto'}; save(); }
  },
  regName: () => {
    const v = $('#regName').value.trim();
    if (v.length < 2) { $('#regErr').textContent = 'Escribe al menos 2 letras'; return; }
    regDraft().name = v; go('/registro/2');
  },
  regModel: g => { regDraft().g = g; render(); },
  shoot: async () => {
    const v = $('#camVideo'); if (!v?.videoWidth) return toast('La cámara aún no está lista');
    regDraft().photo = await shrinkPhoto(v, v.videoWidth, v.videoHeight, true);
    stopCamera(); render();
  },
  retake: () => { regDraft().photo = null; render(); },
  noPhoto: () => toast('Sin foto usamos el modelo base'),
  regSize: s => { regDraft().size = s; render(); },
  regStyle: s => { regDraft().style = s; render(); },
  regDone: async () => {
    const r = regDraft();
    S.profile = {name:r.name || 'Invitado', g:D.models[r.g] ? r.g : modelIds()[0], size:r.size, height:r.height, style:r.style};
    S.sel = {}; S.view = 'base'; save();
    if (r.photo) { await store.set('photo', r.photo); await store.set('avatar', null); FIT.hasAvatar = false; }
    REG = null; go('/creando');
  },
  wear: id => wear(id),
  info: id => openItem(id),
  size: s => { PANEL.size = s; openItem(PANEL.id); },
  tab: t => { PANEL.tab = t; openItem(PANEL.id); },
  onModel: () => { const id = PANEL.id; closeSheet(); wear(id); },
  addBag: () => {
    if (!PANEL.size) return toast('Elige tu talla');
    S.bag.push({id:PANEL.id, size:PANEL.size}); save(); closeSheet(); header();
    toast(`${item(PANEL.id).name} · talla ${PANEL.size} en tu bolsa`);
  },
  rmBag: i => { S.bag.splice(+i, 1); save(); render(); },
  reserve: () => {
    const code = 'VU-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    sheet(`<div class="p-head"><span>Reserva de prueba</span><button class="p-close" data-act="close" aria-label="Cerrar">${ic('close')}</button></div>
      <div class="sheet-body"><h2 class="h2">Tu código: ${code}</h2><p class="lead">Muéstralo en la tienda Vélez más cercana. Te tendremos las prendas listas en tu talla durante 48 horas.</p><p class="small">Prototipo: no se envió ninguna reserva real.</p><button class="btn block" data-act="close">Listo</button></div>`);
  },
  view: v => { S.view = v; save(); render(); },
  setModel: g => { S.profile.g = g; save(); render(); },
  redoPhoto: () => { REG = {...regDraft(), name:S.profile.name, g:S.profile.g, size:S.profile.size, height:S.profile.height, style:S.profile.style, photo:null}; },
  makeAvatar: async (_, e) => {
    const btn = e.target.closest('button'); btn.disabled = true; btn.textContent = 'Creando…';
    try { await createAvatar(); toast('Tu avatar está listo'); }
    catch (err) { toast(err.message, 4200); }
    render();
  },
  saveAi: () => {
    const key = $('#aiKey').value.trim(), model = $('#aiModel').value.trim() || AI_MODELS[0];
    if (key) S.ai.key = key;
    S.ai.model = model; save();
    toast(aiOn() ? 'IA conectada' : 'Pega una clave para conectar la IA'); render();
  },
  forgetAi: () => { S.ai.key = ''; S.view = 'base'; save(); toast('Clave eliminada de este navegador'); render(); },
  wipe: async () => {
    if (!confirm('¿Borrar tu perfil, tu foto, tu avatar y tu bolsa de este navegador?')) return;
    await store.clear(); S = blank(); save(); FIT.hasAvatar = false; go('/');
  },
};
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el || el.disabled) return;
  const fn = A[el.dataset.act]; if (!fn) return;
  if (el.tagName === 'BUTTON') e.preventDefault();
  fn(el.dataset.arg, e);
});
document.addEventListener('input', e => {
  if (e.target.id === 'regHeight') { regDraft().height = +e.target.value; $('#hOut').textContent = e.target.value + ' cm'; }
});
document.addEventListener('change', async e => {
  if (e.target.id !== 'photoFile' || !e.target.files[0]) return;
  const url = URL.createObjectURL(e.target.files[0]);
  const img = new Image();
  try { await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; }); regDraft().photo = await shrinkPhoto(img, img.naturalWidth, img.naturalHeight, false); stopCamera(); render(); }
  catch { toast('No pudimos leer esa imagen'); }
  URL.revokeObjectURL(url);
});
$('#veil').addEventListener('click', closeSheet);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') return closeSheet();
  if (parse().r !== 'probador' || !$('#panel').hidden || /INPUT|TEXTAREA/.test(document.activeElement?.tagName)) return;
  const map = {ArrowLeft:['jacket', -1], ArrowRight:['jacket', 1], ArrowUp:['bottom', -1], ArrowDown:['bottom', 1]};
  if (map[e.key]) { e.preventDefault(); cycle(...map[e.key]); }
});

/* ---------------- rutas ---------------- */
const parse = () => { const [r = '', a] = location.hash.replace(/^#\/?/, '').split('/'); return {r, a}; };
const go = path => { location.hash = '#' + path; };
function render() {
  cleanup?.(); cleanup = null;
  let {r, a} = parse();
  if (!S.profile && ['probador', 'bolsa', 'creando'].includes(r)) r = '';
  if (r !== 'registro') stopCamera();
  const view = {'':V.bienvenida, registro:V.registro, creando:V.creando, probador:V.probador, bolsa:V.bolsa, perfil:V.perfil}[r] || V.bienvenida;
  $('#app').innerHTML = view(a);
  closeSheet();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);
store.get('avatar').then(av => { FIT.hasAvatar = !!av; render(); });
