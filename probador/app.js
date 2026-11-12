/* Vélez Up · Probador
   Prototipo universitario. Las fotos del banco se generaron con IA; con una clave de Gemini
   la persona crea su avatar desde su foto y se prueba las prendas en él. */
'use strict';

const D = window.PROBADOR;
D.looks ||= [];
const KEY = 'velezup:probador';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const cop = n => '$' + Math.round(n).toLocaleString('es-CO');
const wait = ms => new Promise(r => setTimeout(r, ms));
const hash = s => [...String(s)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
const LEGAL = 'Proyecto universitario · Gestión del Diseño 2. No es una app oficial de Vélez. Imágenes generadas con IA.';
const SIZES = ['XS', 'S', 'M', 'L', 'XL'];
const STYLES = [
  {id:'urbano', label:'Urbano', hint:'Jean, cargo y capas Fly Up', prefer:['jean', 'cargo', 'bomber'], acc:['gor', 'mal']},
  {id:'mixto', label:'Mixto', hint:'Cuero Vélez con básicos urbanos', prefer:['cuero', 'jean'], acc:['bol', 'cin']},
  {id:'elegante', label:'Elegante', hint:'Sastrería y cuero', prefer:['blazer', 'sastre', 'sobrecamisa'], acc:['bol', 'gaf']},
];
/* categorías del look, en el orden en que se eligen en Arma */
const CATS = [
  {k:'jacket', label:'Chaquetas', one:'Chaqueta'}, {k:'bottom', label:'Inferiores', one:'Inferior'},
  {k:'zap', label:'Zapatos', one:'Zapatos'}, {k:'bol', label:'Bolsos', one:'Bolso'}, {k:'mal', label:'Maletas', one:'Maleta'},
  {k:'gor', label:'Gorras', one:'Gorra'}, {k:'gaf', label:'Gafas', one:'Gafas'}, {k:'cin', label:'Cinturones', one:'Cinturón'},
];
const ACC = ['zap', 'bol', 'mal', 'gor', 'gaf', 'cin'];
const catOf = k => CATS.find(c => c.k === k) || CATS[0];
const WHERE = [
  {id:'casa', label:'Casa'}, {id:'estudio', label:'Estudio'}, {id:'salida', label:'Salida'},
  {id:'evento', label:'Evento'}, {id:'cita', label:'Cita'}, {id:'viaje', label:'Viaje'},
];
const whereOf = id => WHERE.find(w => w.id === id) || WHERE[2];
const LEVELS = [{id:'Despegue', min:0}, {id:'Altura', min:300}, {id:'Crucero', min:800}, {id:'Vuelo alto', min:1500}];
const PTS = {welcome:50, save:20, publish:30, aroma:30, reto:150, scan:60, buyPer:2000};
const REWARDS = [
  {id:'r-10', label:'10 % en tu próxima compra', cost:250},
  {id:'r-cin', label:'Cinturón de cuero', item:'u-cin-cafe', cost:600},
  {id:'r-gaf', label:'Gafas de sol Fly Up', item:'u-gaf-negras', cost:750},
  {id:'r-20', label:'20 % en cuero Vélez', cost:900},
  {id:'r-mal', label:'Maleta urbana Fly Up', item:'u-mal-urbana', cost:1400},
];
const FRAGS = ['Ámbar', 'Índigo', 'Jade', 'Entropía', 'Bora', 'Garden', 'Bosco', 'Acqua', 'Vera'];
const OLFATO = [{n:1, label:'Muestra de regalo'}, {n:3, label:'15 % en tu próxima fragancia'}, {n:5, label:'Reclama un accesorio'}];
const RETO = {need:['casa', 'salida', 'evento'], title:'3 looks · 3 lugares', text:'Guarda un look para la casa, uno para salir y uno para un evento.'};
const AUTHORS = [['valen.up', 'Valentina'], ['sofi_rmz', 'Sofía'], ['juanes.fly', 'Juan Esteban'], ['mafe.cuero', 'María Fernanda'],
  ['nico.urbano', 'Nicolás'], ['laura.vlz', 'Laura'], ['andres.bta', 'Andrés'], ['cami.style', 'Camila']];
const LOOK_NAMES = ['Lunes de estudio', 'Azotea 6 p. m.', 'Café en Usaquén', 'Cena en Chapinero', 'Viernes de oficina',
  'Concierto al aire libre', 'Escapada a Villa de Leyva', 'Domingo de mercado'];
const month = () => { const m = new Date().toLocaleString('es-CO', {month:'long'}); return m[0].toUpperCase() + m.slice(1); };

const ICONS = {
  back:'<path d="M15 5l-7 7 7 7"/>', close:'<path d="M6 6l12 12M18 6L6 18"/>', arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
  home:'<path d="M4 11l8-7 8 7v8.5a.5.5 0 0 1-.5.5H15v-6H9v6H4.5a.5.5 0 0 1-.5-.5z"/>',
  hanger:'<path d="M12 7.5a2 2 0 1 1 2-2M12 7.5V9l8.6 6.2c.7.5.3 1.8-.6 1.8H4c-.9 0-1.3-1.3-.6-1.8L12 9"/>',
  bag:'<path d="M5 8h14l-1.2 12H6.2zM9 8V6.5a3 3 0 0 1 6 0V8"/>',
  users:'<circle cx="9" cy="8" r="3.4"/><path d="M2.8 20c.6-3.5 3.1-5.4 6.2-5.4s5.6 1.9 6.2 5.4M15.6 4.8a3.3 3.3 0 0 1 0 6.4M17.6 14.5c2 .7 3.3 2.5 3.6 5.5"/>',
  spark:'<path d="M12 3.5l1.7 5.2 5.3 1.7-5.3 1.7L12 17.3l-1.7-5.2L5 10.4l5.3-1.7z"/><path d="M18.5 15.5l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6z"/>',
  heart:'<path d="M12 20s-7.5-4.6-7.5-10.2A4.1 4.1 0 0 1 12 7.4a4.1 4.1 0 0 1 7.5 2.4C19.5 15.4 12 20 12 20z"/>',
  plus:'<path d="M12 5v14M5 12h14"/>', check:'<path d="M5 12.5l4.2 4.2L19 7"/>', search:'<circle cx="11" cy="11" r="6.5"/><path d="M16 16l4 4"/>',
  camera:'<path d="M4 8.5h3.2L9 6h6l1.8 2.5H20v10.5H4z"/><circle cx="12" cy="13.5" r="3.4"/>',
  qr:'<path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v2M14 18h2v2h4v-4"/>',
  tee:'<path d="M8.5 4L4 6.6l1.8 3.4L8 9.2V20h8V9.2l2.2.8L20 6.6 15.5 4c-.6 1.3-1.9 2-3.5 2s-2.9-.7-3.5-2z"/>',
  save:'<path d="M7 4h10v16l-5-3.6L7 20z"/>', share:'<path d="M12 15V4M8 8l4-4 4 4M5 13v6.5h14V13"/>',
  star:'<path d="M12 4l2.4 5 5.4.6-4 3.7 1.1 5.4L12 16l-4.9 2.7 1.1-5.4-4-3.7 5.4-.6z"/>',
  receipt:'<path d="M6 3.5h12v17l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4-2 1.4zM9 8h6M9 11.5h6M9 15h4"/>', drop:'<path d="M12 3.5s6 6.4 6 10.6a6 6 0 0 1-12 0c0-4.2 6-10.6 6-10.6z"/>',
  gift:'<path d="M4 9h16v4H4zM5.5 13H18.5v7h-13zM12 9v11M12 9c-1-3-5-4-5-1.5S12 9 12 9zm0 0c1-3 5-4 5-1.5S12 9 12 9z"/>',
  key:'<circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l2 2"/>', trash:'<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
};
const ic = (name, cls = 'icon') => `<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${ICONS[name] || ''}</svg>`;

/* ---------------- estado ---------------- */
const AI_MODELS = ['gemini-nano-banana-2.1', 'gemini-3.1-flash-image', 'gemini-3.1-flash-lite-image', 'gemini-3-pro-image', 'gemini-2.5-flash-image'];
const blank = () => ({profile:null, sel:{}, bag:[], ai:{key:'', model:AI_MODELS[0], endpoint:null}, view:'base', armaG:null, cat:'jacket',
  looks:[], liked:[], closet:[], points:0, spent:0, history:[], frags:[], redeemed:[], scanned:[], flags:{}});
let S = load();
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || '{}'), b = blank();
    return {...b, ...raw, ai:{...b.ai, ...(raw.ai || {})}, flags:{...(raw.flags || {})}};
  } catch { return blank(); }
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
const homeModel = () => D.models[S.profile?.g] ? S.profile.g : modelIds()[0];
const myModel = () => D.models[S.armaG] ? S.armaG : homeModel();
const item = id => D.items[id];
const suffix = id => id.split('-').pop();
const owned = id => S.closet.includes(id);
/* opciones de una categoría para un modelo (los accesorios unisex sirven a ambos) */
function catItems(g, k) {
  const M = D.models[g];
  if (k === 'jacket') return M.jackets;
  if (k === 'bottom') return M.bottoms;
  return Object.values(D.items).filter(i => i.kind === k && (i.model === g || i.model === 'u')).map(i => i.id);
}
const hasPlain = g => Object.keys(D.models[g].plain || {}).length > 0;
const catsFor = g => CATS.filter(c => c.k === 'jacket' || c.k === 'bottom' || catItems(g, c.k).length);
function selection(g = myModel()) {
  const M = D.models[g];
  const s = S.sel[g] ||= {};
  const jacketOk = M.jackets.includes(s.jacket) || (s.jacket === null && hasPlain(g));
  if (!jacketOk || !M.bottoms.includes(s.bottom)) {
    /* primer look: la combinación existente que más se parece al estilo elegido */
    const st = STYLES.find(x => x.id === S.profile?.style) || STYLES[1];
    const score = k => k.split('|').reduce((a, id) => a + (st.prefer.includes(suffix(id)) ? 1 : 0), 0);
    const best = Object.keys(M.combos).reduce((a, k) => (score(k) > score(a) ? k : a));
    [s.jacket, s.bottom] = best.split('|');
    for (const k of st.acc) { const opts = catItems(g, k); if (opts.length && !s[k]) s[k] = opts[hash(g + k) % opts.length]; }
  }
  for (const k of ACC) if (s[k] && !catItems(g, k).includes(s[k])) delete s[k];
  if (!s.zap) { const worn = catItems(g, 'zap').find(id => item(id).worn); if (worn) s.zap = worn; }
  return s;
}
/* prendas del look en el orden de las categorías */
const lookIds = sel => CATS.map(c => sel[c.k]).filter(id => id && item(id));
const lookTotal = sel => lookIds(sel).reduce((a, id) => a + item(id).price, 0);
/* tendencia: look completo, con accesorios y mezcla de líneas Vélez + Fly Up */
function tendencia(sel) {
  const ids = lookIds(sel);
  const lines = new Set(ids.map(id => item(id).line));
  const acc = ids.filter(id => ACC.includes(item(id).kind) && !item(id).worn).length;
  return Math.min(98, 56 + Math.min(acc, 4) * 7 + (lines.size > 1 ? 10 : 0) + (sel.jacket ? 4 : 0));
}
/* la foto exacta, o la más cercana (misma chaqueta, luego mismo inferior) */
function bankImage(g, sel) {
  const M = D.models[g];
  if (!sel.jacket) {
    const plain = M.plain?.[sel.bottom];
    return plain ? {src:plain, approx:false} : {src:M.base, approx:true};
  }
  const exact = M.combos[`${sel.jacket}|${sel.bottom}`];
  if (exact) return {src:exact, approx:false};
  const keys = Object.keys(M.combos);
  const near = keys.find(k => k.startsWith(sel.jacket + '|')) || keys.find(k => k.endsWith('|' + sel.bottom));
  return {src:near ? M.combos[near] : M.base, approx:true};
}

/* looks de la comunidad: los del banco (looks.json) o armados con las fotos existentes */
function seedLooks() {
  if (D.looks.length) return D.looks.map(l => {
    const sel = {jacket:null};
    for (const id of l.items) { const it = item(id); if (it) sel[it.kind] = id; }
    return {...l, sel};
  });
  const out = [];
  modelIds().forEach((g, gi) => {
    const keys = Object.keys(D.models[g].combos).sort((a, b) => hash(a) - hash(b)).slice(0, 4);
    keys.forEach((k, i) => {
      const n = gi * 4 + i;
      const [jacket, bottom] = k.split('|');
      const sel = {jacket, bottom};
      ACC.forEach((c, j) => { const o = catItems(g, c); if (o.length && (hash(k + c) % 3 === 0 || (c === 'zap' && o.length))) sel[c] = o[(n + j) % o.length]; });
      const [author] = AUTHORS[n % AUTHORS.length];
      out.push({id:`s${n + 1}`, g, sel, name:LOOK_NAMES[n % LOOK_NAMES.length], author, where:WHERE[n % WHERE.length].id, img:D.models[g].combos[k]});
    });
  });
  return out;
}
const SEED = seedLooks();
const lookImg = l => l.img || bankImage(l.g, l.sel).src;
const likesOf = l => (l.mine ? (l.likes || 0) : 12 + hash(l.id) % 140) + (S.liked.includes(l.id) ? 1 : 0);
function communityLooks() {
  const mine = S.looks.filter(l => l.published).map(l => ({...l, author:S.profile?.name || 'tú', mine:true}));
  return [...mine, ...SEED];
}
const findLook = id => S.looks.find(l => l.id === id) || SEED.find(l => l.id === id);

/* ---------------- puntos ---------------- */
function level(p = S.points) { let L = LEVELS[0], N = null; LEVELS.forEach((x, i) => { if (p >= x.min) { L = x; N = LEVELS[i + 1] || null; } }); return {L, N}; }
const available = () => S.points - S.spent;
function addPts(n, label) {
  S.points += n; S.history.unshift({n, label, at:Date.now()}); S.history = S.history.slice(0, 40); save();
  toast(`+${n} puntos · ${label}`);
}
const retoKey = () => 'reto-' + new Date().toISOString().slice(0, 7);
const retoDone = () => new Set(S.looks.map(l => l.where).filter(w => RETO.need.includes(w))).size;
function checkReto() {
  if (S.flags[retoKey()] || retoDone() < RETO.need.length) return;
  S.flags[retoKey()] = true; save(); setTimeout(() => addPts(PTS.reto, `Reto de ${month()} completo`), 1600);
}

/* ---------------- IA (Gemini API, directo desde el navegador) ----------------
   Google recomienda el endpoint Interactions; generateContent sigue soportado.
   Se prueba uno y, si el problema es del endpoint (no de la clave), el otro. */
const API = 'https://generativelanguage.googleapis.com/v1beta';
class AIError extends Error { constructor(msg, status = 0, raw = '') { super(msg); this.status = status; this.raw = raw; } }
const aiOn = () => !!S.ai.key;
function aiMessage(status, raw = '', model = S.ai.model) {
  if (/API key not valid|API_KEY_INVALID|invalid api key/i.test(raw)) return 'La clave no es válida. Cópiala de nuevo desde Google AI Studio.';
  if (status === 429 || /quota|RESOURCE_EXHAUSTED|limit: ?0|billing/i.test(raw)) return 'Tu clave no tiene cuota para generar imágenes. En Google AI Studio activa la facturación del proyecto (cuesta centavos por imagen) o espera a que la cuota se renueve.';
  if (status === 401 || status === 403 || /PERMISSION_DENIED/i.test(raw)) return 'La clave no tiene permiso para este modelo. Revisa en Google AI Studio que la API de Gemini esté activa en tu proyecto.';
  if (status === 404 || /not found|is not supported|unknown model|NOT_FOUND/i.test(raw)) return `El modelo «${model}» no está disponible para tu clave. Elige otro en Perfil → Conectar IA.`;
  if (/location|region|country|FAILED_PRECONDITION/i.test(raw)) return 'La API de Gemini no está disponible para esta cuenta o región.';
  if (status >= 500) return 'Google tuvo un error temporal. Intenta de nuevo en un momento.';
  return `La IA respondió con un error (${status}${raw ? ': ' + raw.slice(0, 140) : ''}).`;
}
const netError = () => new AIError(navigator.onLine === false ? 'Sin conexión a internet.' : 'No pudimos conectar con Google desde este navegador. Revisa tu conexión e intenta de nuevo.');
async function post(url, body, extra = {}) {
  let res;
  try { res = await fetch(url, {method:'POST', headers:{'Content-Type':'application/json', 'x-goog-api-key':S.ai.key, ...extra}, body:JSON.stringify(body)}); }
  catch { throw netError(); }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) { const raw = json.error?.message || json.error?.status || ''; throw new AIError(aiMessage(res.status, raw), res.status, raw); }
  return json;
}
const b64 = dataUrl => { const [head, data] = dataUrl.split(','); return {mime:head.slice(5, head.indexOf(';')), data}; };
/* la imagen viene en steps[].content[] (Interactions) o en candidates[].content.parts[] (generateContent) */
function findImage(node) {
  let found = null;
  (function walk(n) {
    if (!n || typeof n !== 'object') return;
    if (Array.isArray(n)) { n.forEach(walk); return; }
    const inl = n.inlineData || n.inline_data;
    if (inl?.data) found = {mime:inl.mimeType || inl.mime_type || 'image/png', data:inl.data};
    else if (n.type === 'image' && typeof n.data === 'string' && n.data.length > 64) found = {mime:n.mime_type || n.mimeType || 'image/png', data:n.data};
    for (const k in n) if (k !== 'data') walk(n[k]);
  })(node);
  return found;
}
function noImage(json) {
  const reason = json.promptFeedback?.blockReason || json.candidates?.[0]?.finishReason || json.status || '';
  return /SAFETY|PROHIBITED|BLOCK|RECITATION/i.test(reason)
    ? 'La IA no devolvió la imagen porque la bloqueó por seguridad. Prueba con otra foto: de frente, con buena luz y sin otras personas.'
    : 'La IA respondió, pero sin imagen. Intenta de nuevo.';
}
async function generateImage(text, images) {
  const parts = images.map(b64);
  const endpoints = {
    interactions: () => post(`${API}/interactions`, {model:S.ai.model, input:[{type:'text', text}, ...parts.map(p => ({type:'image', mime_type:p.mime, data:p.data}))], response_format:{type:'image', aspect_ratio:'3:4'}}, {'Api-Revision':'2026-05-20'}),
    generate: () => post(`${API}/models/${encodeURIComponent(S.ai.model)}:generateContent`, {contents:[{role:'user', parts:[{text}, ...parts.map(p => ({inline_data:{mime_type:p.mime, data:p.data}}))]}], generationConfig:{responseModalities:['TEXT', 'IMAGE'], imageConfig:{aspectRatio:'3:4'}}}),
  };
  const order = S.ai.endpoint === 'generate' ? ['generate', 'interactions'] : ['interactions', 'generate'];
  let last;
  for (const ep of order) {
    try {
      const json = await endpoints[ep]();
      const img = findImage(json);
      if (!img) throw new AIError(noImage(json), 200);
      if (S.ai.endpoint !== ep) { S.ai.endpoint = ep; save(); }
      return `data:${img.mime};base64,${img.data}`;
    } catch (e) {
      last = e;
      const endpointIssue = e.status === 0 || e.status === 404 || (e.status === 400 && /unknown name|invalid json|cannot find field|unrecognized|interactions|revision/i.test(e.raw));
      if (!endpointIssue) throw e;
    }
  }
  throw last;
}
/* valida la clave sin gastar cuota: la lista de modelos es gratuita */
async function testConnection(key, model) {
  let res;
  try { res = await fetch(`${API}/models?pageSize=200`, {headers:{'x-goog-api-key':key}}); }
  catch { return {ok:false, msg:netError().message}; }
  const json = await res.json().catch(() => ({}));
  if (!res.ok) return {ok:false, msg:aiMessage(res.status, json.error?.message || '', model)};
  const names = (json.models || []).map(m => String(m.name || '').replace(/^models\//, ''));
  const images = names.filter(n => /image|banana/.test(n));
  if (names.length && !names.includes(model)) return {ok:true, warn:true, msg:`La clave funciona, pero «${model}» no aparece en tu cuenta.${images.length ? ' Modelos de imagen disponibles: ' + images.slice(0, 5).join(', ') + '.' : ''}`};
  return {ok:true, msg:`La clave funciona y «${model}» está disponible. Generar imágenes puede requerir facturación activa en Google AI Studio.`};
}

const PERSON = 'Keep their face, identity, skin tone, hairstyle, body proportions, pose, hands, camera angle, framing, size and position in the frame, the pure white studio background and the lighting exactly the same as image 1.';
const WEAR = {
  jacket:'the jacket, worn open over the plain white crew-neck t-shirt', bottom:'the trousers',
  zap:'the shoes, replacing the white sneakers', bol:'the bag, carried naturally on the shoulder or in the hand',
  mal:'the backpack, worn on one shoulder', gor:'the cap, worn on the head', gaf:'the sunglasses, worn on the face',
  cin:'the belt, worn at the waist through the belt loops (tuck the t-shirt in if needed)',
};
const PROMPTS = {
  avatar: p => `Create a photorealistic full-body e-commerce fashion photo of the exact same person shown in the attached photo. Keep their face, identity, skin tone, hairstyle and body proportions${p.height ? `; they are about ${p.height} cm tall and wear size ${p.size}` : ''}. They stand straight facing the camera, feet slightly apart, arms relaxed along the sides, shoulders level, wearing a fitted plain white crew-neck t-shirt, straight light-wash blue jeans and clean minimal white leather sneakers. Pure seamless white studio background, soft even diffused light, a very soft contact shadow under the feet. The whole body is visible from the top of the head to the shoes with generous white margin, centered, vertical 3:4 portrait, 85mm lens at chest height. No text, no logos, no props.`,
  /* pieces: [{kind, id}] en el orden de las imágenes 2..n */
  dress: (pieces, base) => {
    const wear = pieces.map((p, i) => {
      let what = WEAR[p.kind];
      if (p.kind === 'bottom' && suffix(p.id) === 'falda') what = 'the skirt (it replaces the trousers, bare legs below the hem)';
      return `image ${i + 2} is ${what.split(',')[0]}`;
    }).join('; ');
    const how = pieces.map((p, i) => `${(p.kind === 'bottom' && suffix(p.id) === 'falda') ? 'the skirt' : WEAR[p.kind]} from image ${i + 2}`).join(', ');
    return `Virtual try-on. Image 1 is the photo of a person${base ? ' already dressed' : ''}. Then ${wear}. Create a new photo of the exact same person from image 1 wearing ${how}${base ? ', keeping every other garment exactly as in image 1' : ', over a plain white crew-neck t-shirt'}. ${PERSON} Reproduce every item faithfully: same color, material, cut, size, details and hardware, with realistic drape and natural folds. Full body visible from head to shoes, vertical 3:4 portrait, photorealistic e-commerce photo. No text, no logos.`;
  },
};
/* fotos de producto sobre blanco (como catálogo) y fotos del banco en JPEG para la IA */
async function asJpeg(url) {
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  const k = Math.min(1, 1280 / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL('image/jpeg', .9);
}
async function createAvatar() {
  const photo = await store.get('photo');
  if (!photo) throw new AIError('Primero toma tu foto.');
  const avatar = await generateImage(PROMPTS.avatar(S.profile), [photo]);
  await store.set('avatar', avatar);
  FIT.hasAvatar = true; S.avatarAt = Date.now(); S.view = 'mine'; save();
  return avatar;
}
const selKey = sel => CATS.map(c => sel[c.k] || '-').join('|');
/* prueba con IA: sobre el avatar (chaqueta + inferior) o el look completo con accesorios */
async function aiLook(g, sel, full) {
  const mine = S.view === 'mine' && FIT.hasAvatar;
  const cacheKey = `ai:${full ? 'full' : 'fit'}:${mine ? S.avatarAt : g}:${S.ai.model}:${full ? selKey(sel) : sel.jacket + '|' + sel.bottom}`;
  const cached = await store.get(cacheKey);
  if (cached) return cached;
  let person, pieces;
  if (mine) {
    person = await store.get('avatar');
    pieces = [sel.jacket && {kind:'jacket', id:sel.jacket}, {kind:'bottom', id:sel.bottom}];
    if (full) pieces.push(...ACC.filter(k => sel[k] && !item(sel[k]).worn).map(k => ({kind:k, id:sel[k]})));
  } else {
    person = await asJpeg(bankImage(g, sel).src);
    pieces = ACC.filter(k => sel[k] && !item(sel[k]).worn).map(k => ({kind:k, id:sel[k]}));
  }
  pieces = pieces.filter(Boolean);
  if (!pieces.length) throw new AIError('Agrega accesorios al look para verlos puestos.');
  const refs = await Promise.all(pieces.map(p => asJpeg(item(p.id).img)));
  const out = await generateImage(PROMPTS.dress(pieces, !mine), [person, ...refs]);
  await store.set(cacheKey, out);
  return out;
}

/* ---------------- interfaz común ---------------- */
let toastTimer;
function toast(msg, ms = 2800) {
  const t = $('#toast'); t.textContent = msg; t.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { t.hidden = true; }, ms);
}
const TABS = [['inicio', 'home', 'Inicio'], ['arma', 'hanger', 'Arma'], ['descubre', 'bag', 'Descubre'], ['comunidad', 'users', 'Comunidad'], ['vive', 'spark', 'Vive']];
function shell(tab) {
  document.body.classList.add('has-tabs');
  const top = $('#top'), bar = $('#tabbar');
  top.hidden = false; bar.hidden = false;
  const links = TABS.map(([r, i, l]) => `<a href="#/${r}" class="${r === tab ? 'on' : ''}"${r === tab ? ' aria-current="page"' : ''}>${ic(i)}<span>${l}</span></a>`).join('');
  top.innerHTML = `<a class="brand" href="#/inicio" aria-label="Vélez Up, inicio"><img src="icons/icon-192.png" alt=""><b>Vélez Up</b></a>
    <nav class="nav" aria-label="Secciones">${links}</nav>
    <div class="top-r"><a class="bagbtn" href="#/bolsa" aria-label="Bolsa, ${S.bag.length} prendas">${ic('bag')}<i>${S.bag.length}</i></a>
    <a class="me" href="#/perfil" aria-label="Mi perfil">${S.profile ? esc(S.profile.name[0].toUpperCase()) : '·'}</a></div>`;
  bar.innerHTML = links;
  store.get('photo').then(p => { const me = $('.me', top); if (p && me) me.innerHTML = `<img src="${p}" alt="">`; });
}
function bare() { document.body.classList.remove('has-tabs'); $('#top').hidden = true; $('#tabbar').hidden = true; }
function sheet(html, cls = '') {
  const p = $('#panel'), v = $('#veil');
  p.className = cls; p.innerHTML = html; p.hidden = false; v.hidden = false;
  requestAnimationFrame(() => { p.classList.add('show'); v.classList.add('show'); });
  $('.p-close', p)?.focus();
}
function closeSheet() {
  const p = $('#panel'), v = $('#veil');
  if (p.hidden) return;
  p.classList.remove('show'); v.classList.remove('show');
  setTimeout(() => { if (!p.classList.contains('show')) { p.hidden = true; v.hidden = true; p.innerHTML = ''; } }, 320);
}
const sheetHead = title => `<div class="p-head"><span>${title}</span><button class="p-close" data-act="close" aria-label="Cerrar">${ic('close')}</button></div>`;
const thumb = (id, cls = 'th') => { const it = item(id); return it ? `<span class="${cls}"><img src="${it.img}" alt="" loading="lazy"></span>` : ''; };
const initials = name => esc(String(name || '?').replace(/[^\p{L}]/gu, '')[0]?.toUpperCase() || '·');
function qrSvg(text) {
  if (typeof window.qrcode !== 'function') return `<p class="small">Código: ${esc(text)}</p>`;
  const q = window.qrcode(0, 'M'); q.addData(text); q.make();
  return q.createSvgTag({cellSize:4, margin:2, scalable:true});
}

/* tarjeta de producto y de look (se reutilizan en varias secciones) */
const pcard = id => { const it = item(id); return `<a class="pcard" href="#/producto/${id}"><span class="ph"><img src="${it.img}" alt="" loading="lazy"></span><b>${esc(it.name)}</b><span class="meta">${esc(it.line)} · ${cop(it.price)}</span></a>`; };
function lcard(l) {
  const acc = ACC.map(k => l.sel[k]).filter(id => id && item(id) && !item(id).worn);
  return `<article class="lcard"><a href="#/look/${l.id}" class="ph"><img src="${lookImg(l)}" alt="${esc(l.name)}" loading="lazy">${acc.length ? `<span class="accs">${acc.slice(0, 3).map(id => thumb(id, 'mini')).join('')}</span>` : ''}</a>
    <div class="lc-b"><span class="who"><i>${initials(l.author)}</i>@${esc(l.author)}</span><button class="like ${S.liked.includes(l.id) ? 'on' : ''}" data-act="like" data-arg="${l.id}" aria-label="Me gusta">${ic('heart')}<span>${likesOf(l)}</span></button></div>
    <a href="#/look/${l.id}" class="lc-n"><b>${esc(l.name)}</b><span>${whereOf(l.where).label} · ${tendencia(l.sel)} %</span></a></article>`;
}

/* ---------------- pantallas ---------------- */
const V = {};
let cleanup = null;

V.bienvenida = () => {
  if (S.profile) { go('/inicio'); return ''; }
  bare();
  const shots = modelIds().flatMap(g => [D.models[g].base, ...Object.values(D.models[g].combos).slice(0, 5)]);
  let i = 0;
  const timer = setInterval(() => {
    const imgs = $$('.show img'); if (!imgs.length) return;
    imgs[i].style.opacity = 0; i = (i + 1) % imgs.length; imgs[i].style.opacity = 1;
  }, 2200);
  cleanup = () => clearInterval(timer);
  return `<section class="welcome">
    <div class="copy">
      <a class="brand" href="#/"><img src="icons/icon-192.png" alt=""><b>Vélez Up</b></a>
      <h1 class="h1">Tu probador,<br><em>con tu foto.</em></h1>
      <p class="lead">Crea tu avatar con una foto, arma tu look con prendas y accesorios Vélez y Fly Up, compártelo con la comunidad y suma puntos en la tienda.</p>
      <div class="actions"><a class="btn" href="#/registro/1">Crear mi avatar ${ic('arrow')}</a><button class="link" data-act="guest">Probar sin registrarme</button></div>
      <p class="legal">${LEGAL}</p>
    </div>
    <div class="show" aria-hidden="true">${shots.map((s, k) => `<img src="${s}" alt="" style="opacity:${k ? 0 : 1}">`).join('')}</div>
  </section>`;
};

/* ---- registro en 6 pasos ---- */
let REG = null;
const regDraft = () => REG ||= {name:'', g:modelIds()[0], photo:null, size:'S', height:165, style:null};
const REG_STEPS = 6;
V.registro = step => {
  bare();
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
    body = `<h1 class="h2">Elige tu modelo base</h1><p class="small">Es el cuerpo de referencia de tus looks. Con la IA conectada, se reemplaza por tu avatar.</p>
      <div class="choices">${[['w', 'Mujer'], ['m', 'Hombre']].map(([g, label]) => {
        const M = D.models[g];
        return M ? `<button class="choice ${r.g === g ? 'on' : ''}" data-act="regModel" data-arg="${g}" aria-pressed="${r.g === g}"><div class="ph"><img src="${M.base}" alt=""></div><b>${label}</b><span>${esc(M.info)}</span></button>`
          : `<button class="choice" disabled><div class="ph"><span class="small">Próximamente</span></div><b>${label}</b><span>En preparación</span></button>`;
      }).join('')}</div>`;
    foot = `<a class="btn block" href="#/registro/3">Seguir</a>`;
  } else if (step === 3) {
    body = `<h1 class="h2">Tómate una foto</h1><p class="small">De frente, cuerpo entero si puedes y con buena luz. Con ella la IA crea tu avatar.</p>
      <div class="cam" id="cam">${r.photo ? `<img src="${r.photo}" alt="Tu foto">` : `<video id="camVideo" playsinline muted autoplay></video>${SILHOUETTE}<p class="hint" id="camHint">Abriendo la cámara…</p>`}</div>
      <div class="cam-actions">${r.photo
        ? `<button class="btn ghost" data-act="retake">Repetir</button>`
        : `<button class="btn" data-act="shoot" id="shootBtn" disabled>${ic('camera')}Tomar foto</button>`}
        <label class="btn ghost filebtn">Subir una foto<input type="file" accept="image/*" id="photoFile"></label></div>`;
    foot = r.photo ? `<a class="btn block" href="#/registro/4">Usar esta foto</a>` : `<a class="link" href="#/registro/5" data-act="noPhoto">Seguir sin foto</a>`;
  } else if (step === 4) {
    body = `<h1 class="h2">Conecta la IA</h1>
      <p class="lead" style="font-size:15px">Tu avatar se crea con la IA de imágenes de Google (Gemini). Pega aquí tu clave de API para que la app lo genere desde tu foto.</p>
      ${aiForm('reg')}
      <p class="small">La generación de imágenes con la API de Google puede requerir facturación activa; cuesta centavos por imagen. La clave se guarda solo en este navegador y se envía únicamente a Google.</p>`;
    foot = `<button class="btn block" data-act="regAi">${aiOn() ? 'Seguir con la IA conectada' : 'Guardar y seguir'}</button><a class="link" href="#/registro/5">Continuar con el modelo base</a>`;
  } else if (step === 5) {
    body = `<h1 class="h2">Tu talla</h1>
      <div class="field"><label>Talla habitual</label><div class="chips">${SIZES.map(s => `<button class="chip ${r.size === s ? 'on' : ''}" data-act="regSize" data-arg="${s}" aria-pressed="${r.size === s}">${s}</button>`).join('')}</div></div>
      <div class="field"><label for="regHeight">Estatura · <b id="hOut">${r.height} cm</b></label><input class="range" type="range" id="regHeight" min="145" max="200" value="${r.height}"></div>`;
    foot = `<a class="btn block" href="#/registro/6">Seguir</a>`;
  } else {
    body = `<h1 class="h2">¿Cuál es tu estilo?</h1><p class="small">Con él elegimos tu primer look y sus accesorios.</p>
      <div class="styles">${STYLES.map(s => `<button class="style ${r.style === s.id ? 'on' : ''}" data-act="regStyle" data-arg="${s.id}" aria-pressed="${r.style === s.id}"><b>${s.label}</b><span>${s.hint}</span></button>`).join('')}</div>`;
    foot = `<button class="btn block" data-act="regDone" ${r.style ? '' : 'disabled'}>Crear mi avatar</button>`;
  }
  if (step === 3 && !r.photo) setTimeout(() => startCamera('user'), 0);
  else stopCamera();
  return `<section class="reg"><div class="reg-top"><a class="back" href="${back}" aria-label="Atrás">${ic('back')}</a><span class="eyebrow">Paso ${step} de ${REG_STEPS}</span><span style="width:40px"></span></div>
    <div class="steps">${bar}</div><div class="reg-body">${body}</div><div class="reg-foot">${foot}</div></section>`;
};
const SILHOUETTE = `<svg viewBox="0 0 300 400" preserveAspectRatio="xMidYMid meet" aria-hidden="true"><g fill="none" stroke="rgba(255,255,255,.85)" stroke-width="2" stroke-dasharray="6 7"><ellipse cx="150" cy="70" rx="30" ry="37"/><path d="M98 130c10-14 32-20 52-20s42 6 52 20l14 120M98 130l-14 120M118 250l-4 135M182 250l4 135M118 250h64"/></g></svg>`;
/* formulario de la IA: lo usan el registro y el perfil */
const aiForm = where => `<div class="aiform">
  <div class="field"><label for="aiKey">Clave de API de Gemini</label><input class="input" id="aiKey" type="password" autocomplete="off" spellcheck="false" placeholder="${aiOn() ? 'Clave guardada · pega otra para cambiarla' : 'Pega tu clave'}"></div>
  <a class="link" href="https://aistudio.google.com/apikey" target="_blank" rel="noopener">Consigue tu clave en Google AI Studio</a>
  <div class="field"><label for="aiModel">Modelo de imagen</label><input class="input" id="aiModel" list="aiModels" value="${esc(S.ai.model)}"><datalist id="aiModels">${AI_MODELS.map(m => `<option value="${m}">`).join('')}</datalist></div>
  <div class="chips"><button class="btn ghost" data-act="testAi" data-arg="${where}">${ic('key')}Probar conexión</button>${where === 'perfil' ? `<button class="btn" data-act="saveAi">Guardar</button>${aiOn() ? '<button class="link danger" data-act="forgetAi">Olvidar clave</button>' : ''}` : ''}</div>
  <p class="ai-status" id="aiStatus" role="status"></p></div>`;

/* cámara (frontal para la foto, trasera para escanear en tienda) */
let camStream = null;
async function startCamera(facing, videoId = 'camVideo') {
  const video = $('#' + videoId); if (!video) return;
  const fail = msg => cameraUnavailable(msg, videoId);
  if (!window.isSecureContext) return fail('La cámara solo funciona en una página segura (https).');
  if (!navigator.mediaDevices?.getUserMedia) return fail('Este navegador no permite usar la cámara.');
  video.muted = true; video.setAttribute('playsinline', ''); video.setAttribute('muted', '');
  const tries = [{video:{facingMode:facing, width:{ideal:1080}, height:{ideal:1440}}, audio:false}, {video:{facingMode:facing}, audio:false}, {video:true, audio:false}];
  for (const c of tries) {
    try { camStream = await navigator.mediaDevices.getUserMedia(c); break; }
    catch (e) {
      if (e.name === 'NotAllowedError' || e.name === 'SecurityError') return fail('El permiso de la cámara está desactivado. Actívalo en la configuración del navegador o sube una foto.');
      if (e.name === 'NotFoundError') return fail('No encontramos una cámara en este dispositivo.');
    }
  }
  if (!camStream) return fail('No pudimos abrir la cámara.');
  if (!$('#' + videoId)) return stopCamera();
  video.srcObject = camStream;
  try { await video.play(); } catch { /* algunos navegadores ya reproducen con autoplay */ }
  $('#shootBtn')?.removeAttribute('disabled');
  const hint = $('#camHint'); if (hint) hint.textContent = facing === 'user' ? 'Ubícate dentro de la silueta' : 'Apunta al código QR del look';
}
function stopCamera() { camStream?.getTracks().forEach(t => t.stop()); camStream = null; clearInterval(SCAN.timer); }
function cameraUnavailable(msg, videoId) {
  const box = $('#' + videoId)?.parentElement; if (!box) return;
  box.innerHTML = `<div class="none">${esc(msg)}<br>${videoId === 'camVideo' ? 'Puedes subir una foto desde tu galería.' : 'Escribe el código del look abajo.'}</div>`;
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
async function keepPhoto(dataUrl) { regDraft().photo = dataUrl; await store.set('photo', dataUrl); await store.set('avatar', null); FIT.hasAvatar = false; }

/* ---- creando el avatar ---- */
V.creando = () => {
  bare();
  setTimeout(runMaking, 50);
  return `<section class="making" id="making"><div class="ring" id="ring"></div>
    <h1 class="h2" id="makingTitle">Creando tu avatar</h1>
    <ol id="makingSteps"></ol>
    <p class="small" id="makingNote" style="max-width:36ch"></p>
    <div class="making-actions" id="makingActions"></div></section>`;
};
async function runMaking() {
  const photo = await store.get('photo');
  const useAi = aiOn() && !!photo;
  const steps = useAi ? ['Preparando tu foto', 'Conectando con Gemini', 'Generando tu avatar', 'Preparando el probador'] : ['Preparando tu perfil', 'Ajustando talla y estatura', 'Preparando el probador'];
  $('#makingSteps').innerHTML = steps.map(s => `<li>${s}</li>`).join('');
  const lis = $$('#making li');
  const mark = i => lis.forEach((li, k) => { li.className = k < i ? 'ok' : k === i ? 'on' : ''; });
  if (photo) $('#ring').innerHTML = `<img src="${photo}" alt="">`;
  const note = $('#makingNote');
  note.textContent = useAi ? 'La IA tarda entre 10 y 40 segundos.' : (photo ? 'Sin la IA conectada usamos el modelo base. Puedes conectarla luego en Perfil.' : 'Modo demostración: usaremos el modelo base. Con tu foto y la IA conectada, tu avatar se crea desde tu foto.');
  mark(0); await wait(700);
  if (!useAi) { mark(1); await wait(900); mark(2); await wait(600); mark(3); finishMaking(); return; }
  mark(1); await wait(400); mark(2);
  try {
    const av = await createAvatar();
    mark(4); $('#making').classList.add('done');
    $('#makingTitle').textContent = 'Tu avatar está listo';
    $('#ring').classList.add('big'); $('#ring').innerHTML = `<img src="${av}" alt="Tu avatar">`;
    note.textContent = 'Así te verás en el probador. Puedes crearlo de nuevo desde Perfil.';
    $('#makingActions').innerHTML = `<button class="btn" data-act="afterMaking">Continuar ${ic('arrow')}</button>`;
  } catch (e) {
    $('#making').classList.add('done', 'failed');
    $('#makingTitle').textContent = 'No se pudo crear tu avatar';
    note.textContent = e.message;
    S.view = 'base'; save();
    $('#makingActions').innerHTML = `<button class="btn" data-act="retryAvatar">Reintentar</button><button class="btn ghost" data-act="afterMaking">Seguir con el modelo base</button><a class="link" href="#/registro/4">Revisar la clave</a>`;
  }
}
function finishMaking() { $('#making')?.classList.add('done'); setTimeout(() => A.afterMaking(), 500); }

/* ---- guía de bienvenida ---- */
let GUIDE = 0;
function guideSlides() {
  const g = homeModel(), M = D.models[g], sel = selection(g);
  const accs = ACC.flatMap(k => catItems(g, k)).filter(id => !item(id).worn);
  const prods = Object.values(D.items).filter(i => i.model === g || i.model === 'u').slice(0, 6).map(i => i.id);
  const look = communityLooks()[0];
  const pic = src => `<img class="g-model" src="${src}" alt="">`;
  const grid = ids => `<div class="g-grid">${ids.slice(0, 4).map(id => thumb(id, 'g-th')).join('')}</div>`;
  return [
    {t:'Tu avatar', p:'Con tu foto la IA crea un avatar idéntico a ti. Mientras tanto usas un modelo base de tu talla.', v:pic(M.base)},
    {t:'Arma tu look', p:'En Arma eliges chaqueta e inferior y la foto cambia al instante. Desliza sobre el modelo o usa las flechas.', v:pic(bankImage(g, sel).src)},
    {t:'Accesorios con su espacio', p:'Zapatos, bolsos, maletas, gorras, gafas y cinturones aparecen junto al modelo, cada uno en su lugar. Con la IA los ves puestos.', v:accs.length ? grid(accs) : grid(prods)},
    {t:'Descubre', p:'La tienda: nuevos, tendencia, básicos, cuero Vélez y Fly Up. Cada prenda se prueba en Arma con un toque.', v:grid(prods)},
    {t:'Comunidad', p:'Mira looks de otros perfiles, dales me gusta, pruébatelos y publica los tuyos.', v:look ? pic(lookImg(look)) : grid(prods)},
    {t:'Vive y puntos', p:'Sumas puntos al guardar y publicar looks, registrar compras en tienda y aromas. Sube de nivel y canjea recompensas.', v:`<div class="g-pts"><b>${S.points || PTS.welcome}</b><span>puntos</span></div>`},
    {t:'Conecta la IA', p:aiOn() ? 'Tu IA ya está conectada. Puedes cambiar la clave o el modelo en Perfil.' : 'Pega tu clave de Gemini en Perfil para crear tu avatar desde tu foto y ver looks completos puestos.', v:`<div class="g-pts">${ic('spark', 'icon big')}</div>`},
  ];
}
V.guia = () => {
  bare();
  const slides = guideSlides();
  GUIDE = Math.min(GUIDE, slides.length - 1);
  const s = slides[GUIDE], last = GUIDE === slides.length - 1;
  setTimeout(bindGuideSwipe, 0);
  if (GUIDE === 0) store.get('avatar').then(av => { const im = $('.g-model'); if (av && im && GUIDE === 0) im.src = av; });
  return `<section class="guide" id="guide">
    <div class="g-top"><div class="g-bars">${slides.map((_, i) => `<i class="${i <= GUIDE ? 'on' : ''}"></i>`).join('')}</div><button class="link" data-act="guideEnd">Saltar</button></div>
    <div class="g-visual fadein" key="${GUIDE}">${s.v}</div>
    <div class="g-copy fadein"><span class="eyebrow">Paso ${GUIDE + 1} de ${slides.length}</span><h1 class="h2">${s.t}</h1><p class="lead">${s.p}</p></div>
    <div class="g-foot">${GUIDE ? `<button class="btn ghost" data-act="guidePrev">${ic('back')}</button>` : '<span></span>'}<button class="btn" data-act="${last ? 'guideEnd' : 'guideNext'}">${last ? 'Empezar' : 'Siguiente'} ${ic('arrow')}</button></div>
  </section>`;
};
function bindGuideSwipe() {
  const el = $('#guide'); if (!el) return;
  let x0 = 0;
  el.addEventListener('pointerdown', e => { x0 = e.clientX; });
  el.addEventListener('pointerup', e => { const dx = e.clientX - x0; if (Math.abs(dx) > 50) A[dx < 0 ? 'guideNext' : 'guidePrev'](); });
}

/* ---- inicio ---- */
V.inicio = () => {
  shell('inicio');
  const g = homeModel(), sel = selection(g), {L, N} = level();
  const reto = retoDone();
  const news = Object.values(D.items).filter(i => i.tags?.includes('nuevo') && (i.model === g || i.model === 'u')).slice(0, 8).map(i => i.id);
  const feed = communityLooks().slice(0, 4);
  return `<section class="page wide">
    <div class="hello"><div><span class="eyebrow">Nivel ${L.id} · ${S.points} puntos</span><h1 class="h1">Hola, <em>${esc(S.profile.name)}</em></h1></div>
      <a class="pts-pill" href="#/vive">${ic('star')}${available()} pts</a></div>
    <div class="today">
      <a class="today-ph" href="#/arma"><img src="${bankImage(g, sel).src}" alt="Tu look de hoy"></a>
      <div class="today-c"><span class="eyebrow">Tu look de hoy</span><h2 class="h2">Tendencia ${tendencia(sel)} %</h2>
        <ul class="today-list">${lookIds(sel).map(id => `<li>${thumb(id)}<span><b>${esc(item(id).name)}</b><i>${catOf(item(id).kind).one}</i></span></li>`).join('')}</ul>
        <div class="chips"><a class="btn" href="#/arma">${ic('hanger')}Editar en Arma</a><a class="btn ghost" href="#/mislooks">Mis looks · ${S.looks.length}</a></div></div>
    </div>
    <div class="quick">
      <a href="#/arma">${ic('hanger')}<b>Arma</b><span>Prendas y accesorios en tu modelo</span></a>
      <a href="#/descubre/nuevo">${ic('bag')}<b>Descubre</b><span>Lo nuevo de Vélez y Fly Up</span></a>
      <a href="#/comunidad">${ic('users')}<b>Comunidad</b><span>Looks de otros perfiles</span></a>
      <a href="#/vive">${ic('spark')}<b>Vive</b><span>${N ? `${N.min - S.points} pts para ${N.id}` : 'Nivel máximo'}</span></a>
    </div>
    <div class="reto card"><div><span class="eyebrow">Reto de ${month()}</span><h2 class="h2">${RETO.title}</h2><p class="small">${RETO.text} Premio: ${PTS.reto} puntos.</p></div>
      <div class="dots">${RETO.need.map(w => `<span class="${S.looks.some(l => l.where === w) ? 'on' : ''}">${ic('check')}${whereOf(w).label}</span>`).join('')}</div>
      <span class="small">${reto} de ${RETO.need.length}${S.flags[retoKey()] ? ' · completado' : ''}</span></div>
    ${news.length ? `<div class="sec"><div class="sec-h"><h2 class="h3">Novedades</h2><a class="link" href="#/descubre/nuevo">Ver todo</a></div><div class="hscroll">${news.map(pcard).join('')}</div></div>` : ''}
    <div class="sec"><div class="sec-h"><h2 class="h3">Lo último en Comunidad</h2><a class="link" href="#/comunidad">Ver todo</a></div><div class="feed">${feed.map(lcard).join('')}</div></div>
    <p class="legal">${LEGAL}</p>
  </section>`;
};

/* ---- arma (probador) ---- */
const FIT = {busy:0, hasAvatar:false, full:null};
const SAT = {gor:{side:'R', top:3}, gaf:{side:'L', top:7}, mal:{side:'L', top:33}, bol:{side:'R', top:38}, cin:{side:'L', top:59}, zap:{side:'R', top:73}};
function optionsFor(g, k) {
  const ids = catItems(g, k).map(id => ({id, img:item(id).img, label:item(id).name}));
  if (k === 'jacket' && hasPlain(g)) ids.unshift({id:'', icon:'tee', label:'Sin chaqueta'});
  if (ACC.includes(k) && k !== 'zap') ids.unshift({id:'', icon:'close', label:'Nada'});
  return ids;
}
V.arma = () => {
  shell('arma');
  const g = myModel(), M = D.models[g], sel = selection(g);
  const cats = catsFor(g);
  if (!cats.some(c => c.k === S.cat)) S.cat = 'jacket';
  const opts = optionsFor(g, S.cat);
  const perL = Math.ceil(opts.length / 2), perR = opts.length - perL;
  const optsHtml = opts.map((o, i) => {
    const left = i < perL, k = left ? i : i - perL, per = left ? perL : perR;
    const col = left ? [2, 1][k % 2] : [4, 5][k % 2];
    const row = 2 + Math.floor((4 - Math.min(per, 4)) / 2) + Math.min(k, 3);
    const on = (sel[S.cat] || '') === o.id;
    return `<button class="item ${on ? 'on' : ''} ${o.icon ? 'none' : ''}" data-act="pick" data-arg="${S.cat}:${o.id}" style="--col:${col};--row:${row}" aria-pressed="${on}" aria-label="${esc(o.label)}${on ? ', puesto' : ''}">${o.img ? `<img src="${o.img}" alt="" loading="lazy">` : `${ic(o.icon)}<em>${o.label}</em>`}<span class="tip">${esc(o.label)}</span></button>`;
  }).join('');
  const models = modelIds().length > 1 ? `<div class="seg sm">${modelIds().map(x => `<button class="${x === g ? 'on' : ''}" data-act="armaModel" data-arg="${x}">${D.models[x].label}</button>`).join('')}</div>` : '';
  const views = aiOn() && FIT.hasAvatar ? `<div class="seg sm">${[['base', 'Modelo'], ['mine', 'Mi avatar']].map(([v, l]) => `<button class="${(S.view === 'mine') === (v === 'mine') ? 'on' : ''}" data-act="view" data-arg="${v}">${l}</button>`).join('')}</div>` : '';
  setTimeout(() => { paintModel(true); bindSwipe(); $('.cats .on')?.scrollIntoView({block:'nearest', inline:'center'}); }, 0);
  return `<section class="arma" style="--r:${M.ratio}">
    <div class="cats" role="tablist" aria-label="Categorías">${cats.map(c => `<button class="${c.k === S.cat ? 'on' : ''} ${ACC.includes(c.k) && sel[c.k] && !item(sel[c.k])?.worn ? 'has' : ''}" role="tab" aria-selected="${c.k === S.cat}" data-act="cat" data-arg="${c.k}">${c.label}</button>`).join('')}</div>
    <div class="opts" id="opts" aria-label="${catOf(S.cat).label}">${optsHtml}</div>
    <div class="stage" id="stage">
      <div class="stage-tools">${models}${views}</div>
      <figure class="model" id="model" style="aspect-ratio:${M.ratio}"><img class="front" alt=""><img class="back" alt=""><i class="floor"></i><div class="sats" id="sats"></div><div class="busy"><span id="busyText">Probando en tu avatar…</span></div></figure>
      <p class="note" id="note" hidden></p>
    </div>
    <div class="lookbar" id="lookbar"></div>
  </section>`;
};
/* pinta la foto del look: banco, prueba con IA sobre el avatar o look completo con IA */
async function paintModel(instant = false) {
  const g = myModel(), sel = selection(g), fig = $('#model'); if (!fig) return;
  const token = ++FIT.busy;
  paintSats(sel); paintLookbar(sel);
  const bank = bankImage(g, sel);
  let src = bank.src, note = bank.approx ? 'Vista aproximada' : '';
  const full = FIT.full === selKey(sel);
  const wantAi = aiOn() && (full || (S.view === 'mine' && FIT.hasAvatar));
  if (wantAi) {
    fig.classList.add('loading');
    $('#busyText').textContent = full ? 'Poniéndote el look completo…' : 'Probando en tu avatar…';
    try { src = await aiLook(g, sel, full); note = full ? 'Look completo · generado con IA' : 'Tu avatar · generado con IA'; }
    catch (e) {
      if (token === FIT.busy) toast(e.message, 5200);
      if (full) FIT.full = null;
      note = bank.approx ? 'Vista aproximada' : '';
    }
    if (token !== FIT.busy) return;
    fig.classList.remove('loading');
  }
  fig.classList.toggle('full', FIT.full === selKey(sel));
  crossfade(fig, src, instant);
  const n = $('#note'); n.hidden = !note; n.textContent = note;
}
function paintSats(sel) {
  const box = $('#sats'); if (!box) return;
  box.innerHTML = ACC.filter(k => sel[k] && item(sel[k]) && !item(sel[k]).worn).map(k => {
    const it = item(sel[k]), p = SAT[k];
    return `<button class="sat ${p.side}" style="--y:${p.top}%" data-act="info" data-arg="${it.id}" aria-label="${esc(it.name)}"><img src="${it.img}" alt=""><span>${catOf(k).one}</span></button>`;
  }).join('');
}
function paintLookbar(sel) {
  const bar = $('#lookbar'); if (!bar) return;
  const ids = lookIds(sel);
  bar.innerHTML = `<button class="lb-sum" data-act="lookSheet"><span class="eyebrow">Tu look · ${ids.length} prendas</span><b>${cop(lookTotal(sel))}</b><i>Tendencia ${tendencia(sel)} %</i></button>
    <div class="lb-act">${aiOn() ? `<button class="btn ghost sm" data-act="aiFull" title="Ver el look completo puesto">${ic('spark')}<span>Completo con IA</span></button>` : ''}<button class="btn sm" data-act="saveLook">${ic('save')}<span>Guardar</span></button></div>`;
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
function pick(k, id) {
  const g = myModel(), sel = selection(g);
  id = id || null;
  if (k === 'bottom' && !id) return;
  if ((sel[k] || null) === id) { if (id) openItem(id); return; }
  if (id) sel[k] = id; else if (k === 'jacket') sel.jacket = null; else delete sel[k];
  FIT.full = null; save();
  $$('#opts .item').forEach(b => { const [bk, bid] = b.dataset.arg.split(':'); const on = (sel[bk] || '') === bid; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
  $$('.cats button').forEach(b => b.classList.toggle('has', ACC.includes(b.dataset.arg) && !!sel[b.dataset.arg] && !item(sel[b.dataset.arg])?.worn));
  paintModel();
}
function cycle(dir) {
  const g = myModel(), opts = optionsFor(g, S.cat).map(o => o.id), cur = selection(g)[S.cat] || '';
  pick(S.cat, opts[(opts.indexOf(cur) + dir + opts.length) % opts.length]);
}
function bindSwipe() {
  const stage = $('#stage'); if (!stage) return;
  let x0 = 0, y0 = 0;
  stage.addEventListener('pointerdown', e => { x0 = e.clientX; y0 = e.clientY; });
  stage.addEventListener('pointerup', e => {
    const dx = e.clientX - x0, dy = e.clientY - y0;
    if (Math.abs(dx) > 44 && Math.abs(dx) > Math.abs(dy) * 1.4) cycle(dx < 0 ? 1 : -1);
  });
}
function lookSheet() {
  const g = myModel(), sel = selection(g), ids = lookIds(sel);
  sheet(`${sheetHead('Tu look')}<div class="p-body">
    <div class="look-list">${ids.map(id => { const it = item(id); return `<button class="ll-it" data-act="info" data-arg="${id}">${thumb(id)}<span><i>${catOf(it.kind).one}${it.worn ? ' · los lleva el modelo' : ''}</i><b>${esc(it.name)}</b></span><em>${cop(it.price)}</em></button>`; }).join('')}</div>
    <div class="total"><span>Total</span><b>${cop(lookTotal(sel))}</b></div>
    <p class="small">Tendencia ${tendencia(sel)} %: suma por accesorios y por mezclar cuero Vélez con lo urbano de Fly Up.</p></div>
    <div class="p-foot"><button class="btn ghost" data-act="saveLook">Guardar look</button><button class="btn" data-act="lookToBag">Todo a la bolsa</button></div>`);
}

/* ficha de la prenda (panel) */
let PANEL = {id:null, size:null, tab:'det'};
const defaultSize = it => (it.sizes.includes(S.profile?.size) ? S.profile.size : it.sizes.length === 1 ? it.sizes[0] : null);
function specsOf(it, tab) {
  return tab === 'det'
    ? [['Color', it.color], ['Ajuste', it.fit], ['Material', it.material], ['Forro', it.lining], ['Cuidado', it.care]]
    : [['Línea', it.line], ['Tallas', it.sizes.join(' · ')], ['Modelo', it.model === 'u' ? 'Unisex' : D.models[it.model]?.info || ''], ['Imagen', 'Generada con IA']];
}
function openItem(id) {
  const it = item(id); if (!it) return;
  if (PANEL.id !== id) PANEL = {id, size:defaultSize(it), tab:'det'};
  const g = myModel(), list = catItems(g, it.kind), sel = selection(g);
  const worn = sel[it.kind] === id, fits = it.model === g || it.model === 'u';
  sheet(`${sheetHead(`${catOf(it.kind).one} · ${String(Math.max(1, list.indexOf(id) + 1)).padStart(2, '0')} / ${String(list.length).padStart(2, '0')}`)}
    <div class="p-body">
      <div class="p-photo"><img src="${it.img}" alt="${esc(it.name)}"></div>
      <h2 class="p-name" id="panelTitle">${esc(it.name)}</h2>
      <div class="p-line"><span class="small">${esc(it.line)}${it.worn ? ' · los lleva el modelo' : ''}</span><span class="price">${cop(it.price)}</span></div>
      <p class="lead" style="font-size:14.5px">${esc(it.desc)}</p>
      ${sizePicker(it)}
      <div class="tabs" role="tablist"><button class="${PANEL.tab === 'det' ? 'on' : ''}" data-act="tab" data-arg="det" role="tab">Detalles</button><button class="${PANEL.tab === 'car' ? 'on' : ''}" data-act="tab" data-arg="car" role="tab">Características</button></div>
      <dl class="specs">${specsOf(it, PANEL.tab).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
      <a class="link" href="#/producto/${id}">Ver en Descubre</a>
    </div>
    <div class="p-foot"><button class="btn ghost" data-act="onModel" ${worn || !fits ? 'disabled' : ''}>${worn ? 'Puesto' : 'Ponértelo'}</button><button class="btn" data-act="addBag">Agregar a la bolsa</button></div>`);
}
const sizePicker = it => it.sizes.length > 1
  ? `<div class="field"><label>Talla${PANEL.size ? ` · <b>${PANEL.size}</b>` : ''}</label><div class="chips">${it.sizes.map(s => `<button class="chip ${PANEL.size === s ? 'on' : ''}" data-act="size" data-arg="${s}" aria-pressed="${PANEL.size === s}">${s}</button>`).join('')}</div></div>`
  : '<p class="small">Talla única</p>';

/* guardar look */
function saveLookSheet() {
  const g = myModel(), sel = selection(g);
  const name = `Look ${['urbano', 'de ' + month().toLowerCase(), 'para salir', 'del día'][S.looks.length % 4]}`;
  sheet(`${sheetHead('Guardar look')}<div class="sheet-body">
    <div class="save-prev"><img src="${bankImage(g, sel).src}" alt=""><div><b>${lookIds(sel).length} prendas</b><span class="small">Tendencia ${tendencia(sel)} % · ${cop(lookTotal(sel))}</span></div></div>
    <div class="field"><label for="lookName">Nombre</label><input class="input" id="lookName" maxlength="32" value="${esc(name)}"></div>
    <div class="field"><label>¿Para dónde es?</label><div class="chips" id="whereChips">${WHERE.map((w, i) => `<button class="chip ${i === 2 ? 'on' : ''}" data-act="pickWhere" data-arg="${w.id}">${w.label}</button>`).join('')}</div></div>
    <label class="check"><input type="checkbox" id="lookPub" checked><span>Publicarlo en Comunidad (+${PTS.publish} puntos)</span></label>
    <button class="btn block" data-act="doSaveLook">Guardar (+${PTS.save} puntos)</button></div>`);
}

/* ---- descubre ---- */
const SECS = [['todo', 'Todo'], ['nuevo', 'Nuevos'], ['tendencia', 'Tendencia'], ['basico', 'Básicos'], ['velez', 'Vélez cuero'], ['flyup', 'Fly Up'], ['accesorios', 'Accesorios']];
let DS = {q:'', g:null};
function shopItems(g, sec, q) {
  q = q.trim().toLowerCase();
  return Object.values(D.items).filter(i => i.model === g || i.model === 'u').filter(i =>
    sec === 'todo' ? true : sec === 'velez' ? i.line === 'Vélez' : sec === 'flyup' ? i.line === 'Fly Up' : sec === 'accesorios' ? ACC.includes(i.kind) : i.tags?.includes(sec))
    .filter(i => !q || `${i.name} ${i.line} ${i.color} ${i.material} ${catOf(i.kind).label}`.toLowerCase().includes(q));
}
V.descubre = sec => {
  shell('descubre');
  sec = SECS.some(s => s[0] === sec) ? sec : 'todo';
  const g = D.models[DS.g] ? DS.g : homeModel();
  const list = shopItems(g, sec, DS.q);
  return `<section class="page wide">
    <div class="sec-h"><div><h1 class="h1">Descubre</h1><p class="small">Prendas y accesorios de Vélez y Fly Up. Pruébalos en Arma.</p></div>
      ${modelIds().length > 1 ? `<div class="seg sm">${modelIds().map(x => `<button class="${x === g ? 'on' : ''}" data-act="shopModel" data-arg="${x}">${D.models[x].label}</button>`).join('')}</div>` : ''}</div>
    <label class="search">${ic('search')}<input id="shopQ" type="search" placeholder="Busca cuero, jean, bolso…" value="${esc(DS.q)}" autocomplete="off"></label>
    <div class="chips scroll">${SECS.map(([id, l]) => `<a class="chip ${sec === id ? 'on' : ''}" href="#/descubre/${id}">${l}</a>`).join('')}</div>
    <p class="small">${list.length} ${list.length === 1 ? 'producto' : 'productos'}</p>
    <div class="grid" id="shopGrid">${list.map(i => pcard(i.id)).join('') || '<p class="empty">No encontramos nada con esa búsqueda.</p>'}</div>
    <p class="legal">${LEGAL}</p>
  </section>`;
};
V.producto = id => {
  shell('descubre');
  const it = item(id);
  if (!it) return `<section class="page"><p class="empty">Ese producto no existe.</p><a class="btn" href="#/descubre">Volver a Descubre</a></section>`;
  if (PANEL.id !== id) PANEL = {id, size:defaultSize(it), tab:'det'};
  const g = it.model === 'u' ? homeModel() : it.model;
  const others = it.kind === 'jacket' ? [...D.models[g].bottoms, ...ACC.flatMap(k => catItems(g, k).slice(0, 1))]
    : it.kind === 'bottom' ? [...D.models[g].jackets, ...ACC.flatMap(k => catItems(g, k).slice(0, 1))]
    : [...D.models[g].jackets.slice(0, 2), ...D.models[g].bottoms.slice(0, 2)];
  const looks = communityLooks().filter(l => Object.values(l.sel).includes(id)).slice(0, 4);
  return `<section class="page wide product">
    <a class="back-link" href="#/descubre">${ic('back')}Descubre</a>
    <div class="prod">
      <div class="prod-ph"><img src="${it.img}" alt="${esc(it.name)}"></div>
      <div class="prod-c"><span class="eyebrow">${esc(it.line)} · ${catOf(it.kind).one}</span><h1 class="h1">${esc(it.name)}</h1><p class="price big">${cop(it.price)}</p>
        <p class="lead">${esc(it.desc)}${it.worn ? ' Son los que lleva el modelo en el probador.' : ''}</p>
        ${sizePicker(it)}
        <dl class="specs">${specsOf(it, 'det').map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
        <div class="chips"><button class="btn" data-act="tryIt" data-arg="${id}">${ic('hanger')}Pruébalo en Arma</button><button class="btn ghost" data-act="addBag" data-arg="${id}">Agregar a la bolsa</button></div>
        <button class="own ${owned(id) ? 'on' : ''}" data-act="own" data-arg="${id}">${ic('check')}${owned(id) ? 'Ya la tengo' : 'La tengo'}</button>
      </div>
    </div>
    <div class="sec"><div class="sec-h"><h2 class="h3">Combínalo con</h2></div><div class="hscroll">${others.filter(x => x !== id && item(x)).slice(0, 8).map(pcard).join('')}</div></div>
    ${looks.length ? `<div class="sec"><div class="sec-h"><h2 class="h3">Looks de la comunidad con esta prenda</h2></div><div class="feed">${looks.map(lcard).join('')}</div></div>` : ''}
  </section>`;
};

/* ---- comunidad ---- */
let CM = 'todos';
V.comunidad = () => {
  shell('comunidad');
  const list = communityLooks().filter(l => CM === 'todos' || l.where === CM);
  const unpublished = S.looks.filter(l => !l.published).length;
  return `<section class="page wide">
    <div class="sec-h"><div><h1 class="h1">Comunidad</h1><p class="small">Looks de otros perfiles. Dales me gusta, pruébatelos y publica los tuyos.</p></div></div>
    <div class="publish card"><div><b>¿Y tu look?</b><span class="small">${unpublished ? `Tienes ${unpublished} ${unpublished === 1 ? 'look guardado' : 'looks guardados'} sin publicar.` : 'Arma un look y publícalo para sumar puntos.'}</span></div>
      <a class="btn sm" href="${unpublished ? '#/mislooks' : '#/arma'}">${unpublished ? 'Publicar' : 'Armar look'}</a></div>
    <div class="chips scroll">${[['todos', 'Todos'], ...WHERE.map(w => [w.id, w.label])].map(([id, l]) => `<button class="chip ${CM === id ? 'on' : ''}" data-act="cm" data-arg="${id}">${l}</button>`).join('')}</div>
    <div class="feed big">${list.map(lcard).join('') || '<p class="empty">Aún no hay looks para este momento.</p>'}</div>
    <p class="legal">${LEGAL}</p>
  </section>`;
};
V.look = id => {
  shell('comunidad');
  const l = findLook(id);
  if (!l) return `<section class="page"><p class="empty">Ese look ya no está disponible.</p><a class="btn" href="#/comunidad">Ir a Comunidad</a></section>`;
  const mine = S.looks.some(x => x.id === id);
  const ids = lookIds(l.sel);
  const missing = ids.filter(x => !owned(x) && !item(x).worn).length;
  return `<section class="page wide look-d">
    <a class="back-link" href="${mine ? '#/mislooks' : '#/comunidad'}">${ic('back')}${mine ? 'Mis looks' : 'Comunidad'}</a>
    <div class="prod">
      <div class="prod-ph look"><img src="${lookImg(l)}" alt="${esc(l.name)}"></div>
      <div class="prod-c"><span class="who big"><i>${initials(mine ? S.profile.name : l.author)}</i>@${esc(mine ? S.profile.name : l.author)}</span>
        <h1 class="h1">${esc(l.name)}</h1><p class="small">${whereOf(l.where).label} · Tendencia ${tendencia(l.sel)} % · ${cop(lookTotal(l.sel))}</p>
        <ul class="today-list">${ids.map(x => `<li>${thumb(x)}<span><b>${esc(item(x).name)}</b><i>${catOf(item(x).kind).one} · ${owned(x) || item(x).worn ? 'la tienes' : 'te falta'}</i></span></li>`).join('')}</ul>
        <p class="small">${missing ? `Te faltan ${missing} ${missing === 1 ? 'prenda' : 'prendas'} para armarlo.` : 'Tienes todo para armarlo.'}</p>
        <div class="chips"><button class="btn" data-act="tryLook" data-arg="${l.id}">${ic('hanger')}Pruébatelo</button><button class="btn ghost" data-act="lookBag" data-arg="${l.id}">Look a la bolsa</button>
          <button class="btn ghost" data-act="qr" data-arg="${l.id}">${ic('qr')}Código</button>${mine ? '' : `<button class="like big ${S.liked.includes(l.id) ? 'on' : ''}" data-act="like" data-arg="${l.id}">${ic('heart')}<span>${likesOf(l)}</span></button>`}</div>
        ${mine ? `<div class="chips"><button class="btn ghost sm" data-act="togglePub" data-arg="${l.id}">${l.published ? 'Quitar de Comunidad' : 'Publicar en Comunidad'}</button><button class="link danger" data-act="delLook" data-arg="${l.id}">Eliminar</button></div>` : ''}
      </div>
    </div>
  </section>`;
};
V.mislooks = () => {
  shell('inicio');
  return `<section class="page wide">
    <div class="sec-h"><div><h1 class="h1">Mis looks</h1><p class="small">Tus looks guardados. Publícalos, pruébatelos de nuevo o muestra su código en la tienda.</p></div><a class="btn sm" href="#/arma">${ic('plus')}Nuevo</a></div>
    ${S.looks.length ? `<div class="feed big">${S.looks.map(l => lcard({...l, author:S.profile.name, mine:true})).join('')}</div>` : `<div class="empty"><p>Aún no guardas looks.</p><a class="btn" href="#/arma">Armar mi primer look</a></div>`}
  </section>`;
};

/* ---- vive ---- */
V.vive = () => {
  shell('vive');
  const {L, N} = level(), pct = N ? (S.points - L.min) / (N.min - L.min) : 1, R = 36, C = 2 * Math.PI * R;
  const n = S.frags.length;
  const ways = [['save', `Guardar un look`, `+${PTS.save}`], ['share', 'Publicarlo en Comunidad', `+${PTS.publish}`], ['receipt', 'Compra en tienda', `+1 por cada ${cop(PTS.buyPer)}`],
    ['drop', 'Registrar un aroma', `+${PTS.aroma}`], ['qr', 'Escanear un look en tienda', `+${PTS.scan}`], ['star', `Reto de ${month()}`, `+${PTS.reto}`]];
  return `<section class="page wide">
    <div class="sec-h"><div><h1 class="h1">Vive</h1><p class="small">Tus puntos, tus compras, tus aromas y tu look en la tienda.</p></div></div>
    <div class="level card"><div class="ring-pts"><svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="${R}" fill="none" stroke="var(--line)" stroke-width="2.5"/><circle cx="42" cy="42" r="${R}" fill="none" stroke="var(--ink)" stroke-width="2.5" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}" transform="rotate(-90 42 42)"/></svg><b>${S.points}</b><span>puntos</span></div>
      <div><span class="eyebrow">Nivel ${L.id}</span><h2 class="h2">${N ? `${N.min - S.points} puntos para ${N.id}` : 'Nivel máximo'}</h2>
        <div class="lv">${LEVELS.map(x => `<span class="${S.points >= x.min ? 'on' : ''}">${x.id}</span>`).join('')}</div><p class="small">Disponibles para canjear: <b>${available()}</b></p></div></div>
    <div class="vgrid">
      <div class="card"><h3 class="h3">Cómo ganar puntos</h3><ul class="ways">${ways.map(([i, t, p]) => `<li>${ic(i)}<span>${t}</span><b>${p}</b></li>`).join('')}</ul></div>
      <div class="card"><h3 class="h3">Registra tu compra</h3><p class="small">Compraste en una tienda Vélez? Registra el código de tu factura y suma 1 punto por cada ${cop(PTS.buyPer)}. Las prendas quedan en «la tienes».</p><button class="btn" data-act="buySheet">${ic('receipt')}Registrar compra</button></div>
      <div class="card"><h3 class="h3">Tus aromas suman</h3><p class="small">Registra cada fragancia Vélez que compres. ${n} ${n === 1 ? 'aroma registrado' : 'aromas registrados'}.</p>
        <div class="mile">${OLFATO.map(m => `<div class="${n >= m.n ? 'on' : ''}"><b>${m.n}</b><span>${m.label}</span></div>`).join('')}</div><button class="btn ghost" data-act="aromaSheet">${ic('drop')}Registrar aroma</button></div>
      <div class="card"><h3 class="h3">Escanea en la tienda</h3><p class="small">Cada look tiene un código QR. Escanéalo en la tienda para ver qué prendas tienes y cuáles te faltan.</p><button class="btn ghost" data-act="scanSheet">${ic('qr')}Escanear look</button></div>
    </div>
    <div class="sec"><div class="sec-h"><h2 class="h3">Recompensas</h2></div>
      <div class="rewards">${REWARDS.map(r => { const got = S.redeemed.find(x => x.id === r.id), can = available() >= r.cost; return `<div class="reward ${got ? 'got' : can ? 'can' : ''}">${r.item && item(r.item) ? thumb(r.item) : `<span class="th">${ic('gift')}</span>`}<div><b>${esc(r.label)}</b><span class="small">${r.cost} puntos</span></div>${got ? `<span class="tag">${got.code}</span>` : `<button class="btn sm ${can ? '' : 'ghost'}" data-act="redeem" data-arg="${r.id}" ${can ? '' : 'disabled'}>${can ? 'Canjear' : `Faltan ${r.cost - available()}`}</button>`}</div>`; }).join('')}</div></div>
    <div class="sec"><div class="sec-h"><h2 class="h3">Historial</h2></div>
      ${S.history.length ? `<ul class="hist">${S.history.slice(0, 12).map(h => `<li><span>${esc(h.label)}</span><b>${h.n > 0 ? '+' : ''}${h.n}</b></li>`).join('')}</ul>` : '<p class="small">Aún no tienes movimientos.</p>'}</div>
    <p class="legal">${LEGAL}</p>
  </section>`;
};
const SCAN = {timer:null};
function scanSheet() {
  sheet(`${sheetHead('Escanear look en tienda')}<div class="sheet-body">
    <div class="cam scan"><video id="scanVideo" playsinline muted autoplay></video><p class="hint" id="camHint">Abriendo la cámara…</p></div>
    <div class="field"><label for="scanCode">O escribe el código del look</label><input class="input" id="scanCode" placeholder="Ej. S3 o VU-ABC12" autocomplete="off"></div>
    <button class="btn block" data-act="scanCode">Abrir look</button></div>`);
  setTimeout(async () => {
    await startCamera('environment', 'scanVideo');
    const video = $('#scanVideo');
    if (!camStream || !video) return;
    if (!('BarcodeDetector' in window)) { const h = $('#camHint'); if (h) h.textContent = 'Este navegador no lee QR: escribe el código abajo.'; return; }
    const det = new window.BarcodeDetector({formats:['qr_code']});
    SCAN.timer = setInterval(async () => {
      try { const [c] = await det.detect(video); if (c) { clearInterval(SCAN.timer); openScanned(c.rawValue); } } catch { /* sigue intentando */ }
    }, 450);
  }, 350);
}
function openScanned(text) {
  const m = String(text).match(/look\/([\w-]+)/i);
  const code = (m ? m[1] : String(text)).trim();
  const l = findLook(code) || S.looks.find(x => x.id.toLowerCase() === code.toLowerCase()) || SEED.find(x => x.id.toLowerCase() === code.toLowerCase());
  if (!l) { toast('No encontramos ese código'); return; }
  stopCamera(); closeSheet();
  if (!S.scanned.includes(l.id)) { S.scanned.push(l.id); addPts(PTS.scan, 'Look escaneado en tienda'); }
  go('/look/' + l.id);
}

/* ---- bolsa ---- */
V.bolsa = () => {
  shell('');
  const lines = S.bag.map((b, i) => ({...b, i, it:item(b.id)})).filter(b => b.it);
  const total = lines.reduce((a, b) => a + b.it.price, 0);
  return `<section class="page"><h1 class="h1">Tu bolsa</h1>
    ${lines.length ? `<div class="bag-list">${lines.map(b => `<div class="bag-it">${thumb(b.id)}<div><b>${esc(b.it.name)}</b><span>${esc(b.it.line)} · ${cop(b.it.price)}</span>
        ${b.it.sizes.length > 1 ? `<label class="size-sel">Talla <select data-bag="${b.i}">${b.it.sizes.map(s => `<option ${s === b.size ? 'selected' : ''}>${s}</option>`).join('')}</select></label>` : '<span>Talla única</span>'}</div>
        <button class="link" data-act="rmBag" data-arg="${b.i}">Quitar</button></div>`).join('')}</div>
      <div class="total"><span>Total</span><b>${cop(total)}</b></div>
      <button class="btn block" data-act="reserve">Reservar en tienda</button>
      <p class="small">Es una reserva de prueba: no hay pagos. Muestras el código en la tienda, pagas allá y luego registras tu factura en Vive para sumar puntos.</p>`
    : `<div class="empty"><p>Tu bolsa está vacía.</p><a class="btn ghost" href="#/arma">Ir a Arma</a></div>`}
  </section>`;
};

/* ---- perfil ---- */
V.perfil = () => {
  shell('');
  const p = S.profile;
  setTimeout(fillProfileImages, 0);
  const style = STYLES.find(s => s.id === p.style);
  return `<section class="page">
    <div class="prof"><div class="ph" id="profPhoto">${initials(p.name)}</div><div><h1 class="h2">${esc(p.name)}</h1><p class="small">Talla ${p.size} · ${p.height} cm · ${style ? style.label : 'Sin estilo'} · ${level().L.id}</p></div></div>
    <div class="card"><h3 class="h3">Tu avatar</h3>
      <div class="avatars"><div><figure id="avMine"></figure><p class="small">Tu avatar con IA</p></div><div><figure><img src="${D.models[homeModel()].base}" alt=""></figure><p class="small">Modelo base</p></div></div>
      <div class="chips">${modelIds().map(g => `<button class="chip ${homeModel() === g ? 'on' : ''}" data-act="setModel" data-arg="${g}">${D.models[g].label}</button>`).join('')}</div>
      <div class="chips"><a class="btn ghost" href="#/registro/3" data-act="redoPhoto">${ic('camera')}Cambiar mi foto</a>${aiOn() ? '<button class="btn" data-act="makeAvatar">Crear avatar con IA</button>' : ''}</div>
    </div>
    <div class="card"><h3 class="h3">Conectar IA (Gemini)</h3>
      <p class="small">Con tu clave de Google AI Studio la app crea tu avatar desde tu foto, te prueba las prendas y te muestra el look completo con accesorios. La clave se guarda solo en este navegador y se envía únicamente a Google. Generar imágenes puede requerir facturación activa (centavos por imagen).</p>
      ${aiForm('perfil')}
    </div>
    <div class="card"><h3 class="h3">Más</h3><div class="chips"><a class="btn ghost" href="#/mislooks">Mis looks · ${S.looks.length}</a><button class="btn ghost" data-act="showGuide">Ver guía</button></div></div>
    <div class="card"><h3 class="h3">Datos</h3><p class="small">Tu foto, tu avatar, tus looks y tus puntos se guardan solo en este navegador.</p><button class="link danger" data-act="wipe" style="align-self:flex-start">Borrar todos mis datos</button></div>
    <p class="legal">${LEGAL}</p>
  </section>`;
};
async function fillProfileImages() {
  const [photo, avatar] = await Promise.all([store.get('photo'), store.get('avatar')]);
  if (photo && $('#profPhoto')) $('#profPhoto').innerHTML = `<img src="${photo}" alt="Tu foto">`;
  const box = $('#avMine'); if (!box) return;
  box.innerHTML = avatar ? `<img src="${avatar}" alt="Tu avatar">` : `<div class="empty small" style="padding:18px">${aiOn() ? (photo ? 'Toca «Crear avatar con IA».' : 'Primero toma tu foto.') : 'Conecta la IA para crearlo desde tu foto.'}</div>`;
}

/* ---------------- acciones ---------------- */
function addToBag(id, size) { S.bag.push({id, size}); save(); }
function lookToBag(sel) {
  lookIds(sel).forEach(id => { const it = item(id); addToBag(id, defaultSize(it) || it.sizes[Math.floor(it.sizes.length / 2)]); });
  shell(parse().r === 'look' ? 'comunidad' : 'arma'); toast('Look en tu bolsa. Revisa las tallas antes de reservar.');
}
async function readAiForm() {
  const key = $('#aiKey')?.value.trim(), model = $('#aiModel')?.value.trim() || AI_MODELS[0];
  return {key:key || S.ai.key, model, changed:!!key};
}
const A = {
  close: () => { stopCamera(); closeSheet(); },
  guest: () => {
    if (!S.profile) { S.profile = {name:'Invitado', g:modelIds()[0], size:'S', height:165, style:'mixto'}; addPts(PTS.welcome, 'Bienvenida'); }
    GUIDE = 0; go('/guia');
  },
  regName: () => {
    const v = $('#regName').value.trim();
    if (v.length < 2) { $('#regErr').textContent = 'Escribe al menos 2 letras'; return; }
    regDraft().name = v; go('/registro/2');
  },
  regModel: g => { regDraft().g = g; render(); },
  shoot: async () => {
    const v = $('#camVideo'); if (!v?.videoWidth) return toast('La cámara aún no está lista');
    await keepPhoto(await shrinkPhoto(v, v.videoWidth, v.videoHeight, true));
    stopCamera(); render(); toast('Foto guardada');
  },
  retake: () => { regDraft().photo = null; render(); },
  noPhoto: () => toast('Sin foto usamos el modelo base'),
  testAi: async () => {
    const out = $('#aiStatus'), {key, model} = await readAiForm();
    if (!key) { out.className = 'ai-status err'; out.textContent = 'Pega primero tu clave.'; return; }
    out.className = 'ai-status'; out.textContent = 'Probando conexión…';
    const r = await testConnection(key, model);
    out.className = 'ai-status ' + (r.ok ? (r.warn ? 'warn' : 'ok') : 'err'); out.textContent = r.msg;
  },
  regAi: async () => {
    const {key, model, changed} = await readAiForm();
    if (!key) { const out = $('#aiStatus'); out.className = 'ai-status err'; out.textContent = 'Pega tu clave o elige «Continuar con el modelo base».'; return; }
    S.ai.key = key; S.ai.model = model; if (changed) S.ai.endpoint = null; save(); go('/registro/5');
  },
  regSize: s => { regDraft().size = s; render(); },
  regStyle: s => { regDraft().style = s; render(); },
  regDone: async () => {
    const r = regDraft(), first = !S.profile;
    S.profile = {name:r.name || 'Invitado', g:D.models[r.g] ? r.g : modelIds()[0], size:r.size, height:r.height, style:r.style};
    S.sel = {}; S.armaG = null; S.view = 'base'; save();
    if (r.photo) await store.set('photo', r.photo);
    if (first) addPts(PTS.welcome, 'Bienvenida a Vélez Up');
    REG = null; go('/creando');
  },
  retryAvatar: () => render(),
  afterMaking: () => { if (S.flags.guide) go('/inicio'); else { GUIDE = 0; go('/guia'); } },
  guideNext: () => { GUIDE++; if (GUIDE >= guideSlides().length) return A.guideEnd(); render(); },
  guidePrev: () => { if (GUIDE > 0) { GUIDE--; render(); } },
  guideEnd: () => { S.flags.guide = true; save(); go('/inicio'); },
  showGuide: () => { GUIDE = 0; go('/guia'); },
  // arma
  cat: k => { S.cat = k; save(); render(); },
  pick: a => { const [k, id] = a.split(':'); pick(k, id); },
  armaModel: g => { S.armaG = g; FIT.full = null; save(); render(); },
  view: v => { S.view = v; FIT.full = null; save(); render(); },
  info: id => openItem(id),
  lookSheet: () => lookSheet(),
  aiFull: () => {
    if (!aiOn()) return toast('Conecta la IA en Perfil para ver el look completo puesto');
    const sel = selection(myModel());
    if (!(S.view === 'mine' && FIT.hasAvatar) && !ACC.some(k => sel[k] && !item(sel[k]).worn)) return toast('Agrega accesorios al look para verlos puestos');
    FIT.full = selKey(sel); paintModel();
  },
  size: s => { PANEL.size = s; parse().r === 'producto' ? render() : openItem(PANEL.id); },
  tab: t => { PANEL.tab = t; openItem(PANEL.id); },
  onModel: () => { const it = item(PANEL.id); closeSheet(); if (parse().r !== 'arma') { A.tryIt(it.id); return; } if (S.cat !== it.kind) { S.cat = it.kind; render(); } pick(it.kind, it.id); },
  addBag: id => {
    const it = item(id || PANEL.id); if (PANEL.id !== it.id) PANEL = {id:it.id, size:defaultSize(it), tab:'det'};
    if (!PANEL.size) return toast('Elige tu talla');
    addToBag(it.id, PANEL.size); closeSheet(); shell(parse().r === 'producto' ? 'descubre' : 'arma');
    toast(`${it.name} · talla ${PANEL.size} en tu bolsa`);
  },
  lookToBag: () => { closeSheet(); lookToBag(selection(myModel())); },
  saveLook: () => saveLookSheet(),
  pickWhere: w => { $$('#whereChips .chip').forEach(c => c.classList.toggle('on', c.dataset.arg === w)); },
  doSaveLook: () => {
    const g = myModel(), sel = {...selection(g)};
    const where = $('#whereChips .chip.on')?.dataset.arg || 'salida', pub = $('#lookPub').checked;
    const l = {id:'vu-' + Date.now().toString(36).slice(-5), g, sel, name:$('#lookName').value.trim() || 'Mi look', where, published:pub, likes:0, at:Date.now(), img:bankImage(g, sel).src};
    S.looks.unshift(l); save(); closeSheet();
    addPts(PTS.save + (pub ? PTS.publish : 0), pub ? 'Look guardado y publicado' : 'Look guardado');
    checkReto();
  },
  // descubre
  shopModel: g => { DS.g = g; render(); },
  tryIt: id => {
    const it = item(id); const g = it.model === 'u' ? myModel() : it.model;
    S.armaG = g; selection(g)[it.kind] = id; S.cat = it.kind; FIT.full = null; save(); closeSheet(); go('/arma');
  },
  own: id => { S.closet = owned(id) ? S.closet.filter(x => x !== id) : [...S.closet, id]; save(); render(); },
  // comunidad
  cm: w => { CM = w; render(); },
  like: id => { S.liked = S.liked.includes(id) ? S.liked.filter(x => x !== id) : [...S.liked, id]; save(); $$(`[data-act="like"][data-arg="${id}"]`).forEach(b => { b.classList.toggle('on', S.liked.includes(id)); const l = findLook(id) || communityLooks().find(x => x.id === id); if (l) $('span', b).textContent = likesOf(l); }); },
  tryLook: id => { const l = findLook(id); if (!l) return; S.armaG = l.g; S.sel[l.g] = {...l.sel}; FIT.full = null; save(); go('/arma'); },
  lookBag: id => { const l = findLook(id); if (l) lookToBag(l.sel); },
  qr: id => {
    const l = findLook(id); if (!l) return;
    const url = `${location.origin}${location.pathname}#/look/${l.id}`;
    sheet(`${sheetHead('Código del look')}<div class="sheet-body center"><div class="qr">${qrSvg(url)}</div><h2 class="h2">${esc(l.id.toUpperCase())}</h2><p class="small">Muéstralo en la tienda: allí ven las prendas del look en tu talla. También puedes escanearlo desde Vive.</p><button class="btn block" data-act="close">Listo</button></div>`);
  },
  togglePub: id => { const l = S.looks.find(x => x.id === id); if (!l) return; l.published = !l.published; save(); if (l.published && !l.pubPts) { l.pubPts = true; addPts(PTS.publish, 'Look publicado'); } render(); },
  delLook: id => { if (!confirm('¿Eliminar este look?')) return; S.looks = S.looks.filter(x => x.id !== id); save(); go('/mislooks'); },
  // vive
  buySheet: () => {
    const g = homeModel(), opts = Object.values(D.items).filter(i => i.model === g || i.model === 'u');
    sheet(`${sheetHead('Registrar compra')}<div class="sheet-body">
      <div class="field"><label for="buyCode">Código de la factura</label><input class="input" id="buyCode" placeholder="Ej. VLZ-204588" autocomplete="off"></div>
      <div class="field"><label for="buyAmount">Valor de la compra (COP)</label><input class="input" id="buyAmount" type="number" inputmode="numeric" min="0" step="1000" placeholder="350000"></div>
      <div class="field"><label>¿Qué compraste? (opcional)</label><div class="chips" id="buyItems">${opts.map(i => `<button class="chip" data-act="toggleChip" data-arg="${i.id}">${esc(i.name)}</button>`).join('')}</div></div>
      <p class="err" id="buyErr"></p><button class="btn block" data-act="doBuy">Registrar</button><p class="small">Prototipo: la factura no se valida contra un sistema real.</p></div>`);
  },
  toggleChip: (_, e) => e.target.closest('.chip').classList.toggle('on'),
  doBuy: () => {
    const code = $('#buyCode').value.trim(), amount = +$('#buyAmount').value;
    if (code.length < 5) return ($('#buyErr').textContent = 'Escribe el código de tu factura (mínimo 5 caracteres).');
    if (!(amount >= 1000)) return ($('#buyErr').textContent = 'Escribe el valor de la compra.');
    if (S.history.some(h => h.code === code)) return ($('#buyErr').textContent = 'Esa factura ya está registrada.');
    const ids = $$('#buyItems .chip.on').map(c => c.dataset.arg);
    S.closet = [...new Set([...S.closet, ...ids])];
    closeSheet(); addPts(Math.floor(amount / PTS.buyPer), `Compra ${code}`); S.history[0].code = code; save(); render();
  },
  aromaSheet: () => sheet(`${sheetHead('Registrar aroma')}<div class="sheet-body"><div class="field"><label>¿Qué fragancia compraste?</label><div class="chips" id="frags">${FRAGS.map(f => `<button class="chip" data-act="pickFrag" data-arg="${f}">${f}</button>`).join('')}</div></div>
    <div class="field"><label for="fragCode">Código de la factura (opcional)</label><input class="input" id="fragCode" autocomplete="off"></div><p class="err" id="fragErr"></p><button class="btn block" data-act="doAroma">Registrar (+${PTS.aroma})</button></div>`),
  pickFrag: f => $$('#frags .chip').forEach(c => c.classList.toggle('on', c.dataset.arg === f)),
  doAroma: () => {
    const f = $('#frags .chip.on')?.dataset.arg;
    if (!f) return ($('#fragErr').textContent = 'Elige el aroma que compraste.');
    S.frags.push({name:f, at:Date.now()}); closeSheet();
    const hit = OLFATO.find(m => m.n === S.frags.length);
    addPts(PTS.aroma, hit ? `Aroma registrado · desbloqueaste: ${hit.label}` : `Aroma ${f} registrado`); render();
  },
  scanSheet: () => scanSheet(),
  scanCode: () => openScanned($('#scanCode').value),
  redeem: id => {
    const r = REWARDS.find(x => x.id === id); if (!r || available() < r.cost) return;
    const code = 'VU-' + Math.random().toString(36).slice(2, 7).toUpperCase();
    S.spent += r.cost; S.redeemed.push({id, code, at:Date.now()}); S.history.unshift({n:-r.cost, label:`Canjeaste ${r.label}`, at:Date.now()}); save(); render();
    sheet(`${sheetHead('Recompensa canjeada')}<div class="sheet-body center"><h2 class="h2">${esc(r.label)}</h2><div class="qr">${qrSvg(code)}</div><b>${code}</b><p class="small">Muestra este código en la tienda. Prototipo: no es un bono real.</p><button class="btn block" data-act="close">Listo</button></div>`);
  },
  // bolsa
  rmBag: i => { S.bag.splice(+i, 1); save(); render(); },
  reserve: () => {
    const code = 'VU-' + Math.random().toString(36).slice(2, 6).toUpperCase();
    sheet(`${sheetHead('Reserva de prueba')}<div class="sheet-body"><h2 class="h2">Tu código: ${code}</h2><p class="lead">Muéstralo en la tienda Vélez más cercana. Te tendremos las prendas listas en tu talla durante 48 horas.</p><p class="small">Prototipo: no se envió ninguna reserva real. Cuando pagues, registra tu factura en Vive para sumar puntos.</p><button class="btn block" data-act="close">Listo</button></div>`);
  },
  // perfil
  setModel: g => { S.profile.g = g; S.armaG = null; save(); render(); },
  redoPhoto: () => { REG = {...regDraft(), name:S.profile.name, g:S.profile.g, size:S.profile.size, height:S.profile.height, style:S.profile.style, photo:null}; },
  makeAvatar: async (_, e) => {
    const btn = e.target.closest('button'); btn.disabled = true; btn.textContent = 'Creando… (10 a 40 s)';
    try { await createAvatar(); toast('Tu avatar está listo'); }
    catch (err) { toast(err.message, 6000); }
    render();
  },
  saveAi: async () => {
    const {key, model, changed} = await readAiForm();
    if (!key) { const out = $('#aiStatus'); out.className = 'ai-status err'; out.textContent = 'Pega tu clave para conectar la IA.'; return; }
    S.ai.key = key; S.ai.model = model; if (changed) S.ai.endpoint = null; save();
    toast('IA conectada'); render();
  },
  forgetAi: () => { S.ai.key = ''; S.view = 'base'; FIT.full = null; save(); toast('Clave eliminada de este navegador'); render(); },
  wipe: async () => {
    if (!confirm('¿Borrar tu perfil, tu foto, tu avatar, tus looks y tus puntos de este navegador?')) return;
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
  if (e.target.id === 'shopQ') {
    DS.q = e.target.value;
    const sec = parse().a || 'todo', g = D.models[DS.g] ? DS.g : homeModel(), list = shopItems(g, sec, DS.q);
    $('#shopGrid').innerHTML = list.map(i => pcard(i.id)).join('') || '<p class="empty">No encontramos nada con esa búsqueda.</p>';
  }
});
document.addEventListener('change', async e => {
  if (e.target.dataset.bag !== undefined) { S.bag[+e.target.dataset.bag].size = e.target.value; save(); return; }
  if (e.target.id !== 'photoFile' || !e.target.files[0]) return;
  const url = URL.createObjectURL(e.target.files[0]);
  const img = new Image();
  try { await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; }); await keepPhoto(await shrinkPhoto(img, img.naturalWidth, img.naturalHeight, false)); stopCamera(); render(); toast('Foto guardada'); }
  catch { toast('No pudimos leer esa imagen'); }
  URL.revokeObjectURL(url);
});
$('#veil').addEventListener('click', () => A.close());
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') return A.close();
  if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement?.tagName) || !$('#panel').hidden) return;
  const r = parse().r;
  if (r === 'guia' && /Arrow(Left|Right)/.test(e.key)) return A[e.key === 'ArrowRight' ? 'guideNext' : 'guidePrev']();
  if (r !== 'arma') return;
  if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); cycle(e.key === 'ArrowRight' ? 1 : -1); }
  if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
    e.preventDefault();
    const cats = catsFor(myModel()), i = cats.findIndex(c => c.k === S.cat);
    A.cat(cats[(i + (e.key === 'ArrowDown' ? 1 : -1) + cats.length) % cats.length].k);
  }
});

/* ---------------- rutas ---------------- */
const parse = () => { const [r = '', a] = location.hash.replace(/^#\/?/, '').split('/'); return {r: r === 'probador' ? 'arma' : r, a}; };
const go = path => { if (location.hash === '#' + path) render(); else location.hash = '#' + path; };
const ROUTES = {'':V.bienvenida, registro:V.registro, creando:V.creando, guia:V.guia, inicio:V.inicio, arma:V.arma, descubre:V.descubre,
  producto:V.producto, comunidad:V.comunidad, look:V.look, mislooks:V.mislooks, vive:V.vive, bolsa:V.bolsa, perfil:V.perfil};
function render() {
  cleanup?.(); cleanup = null;
  let {r, a} = parse();
  if (!S.profile && !['', 'registro', 'look'].includes(r)) r = '';
  if (r !== 'registro') stopCamera();
  const view = ROUTES[r] || (S.profile ? V.inicio : V.bienvenida);
  const html = view(a);
  if (html) $('#app').innerHTML = html;
  closeSheet();
  window.scrollTo(0, 0);
}
window.addEventListener('hashchange', render);
store.get('avatar').then(av => { FIT.hasAvatar = !!av; render(); });
