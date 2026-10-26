/* =====================================================================
   VÉLEZ UP v3 · prototipo universitario (Gestión del Diseño 2)
   Avatar ilustrado + creador de looks + catálogo + comunidad + vive
   ===================================================================== */
'use strict';
const K = window.KITS;
const $ = (s, r = document) => r.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/* ---------------------------------------------------------------------
   ICONOS (trazo 2px, 24×24)
   --------------------------------------------------------------------- */
const IC = {
  home:'<path d="M4 11.5 12 5l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5h-5v5H5a1 1 0 0 1-1-1z"/>',
  hanger:'<path d="M12 7.5a2.2 2.2 0 1 1 2.2-2.2M12 7.5v1.7L3.6 15.4A1.6 1.6 0 0 0 4.6 18.3h14.8a1.6 1.6 0 0 0 1-2.9L12 9.2"/>',
  compass:'<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  users:'<circle cx="9" cy="9" r="3.2"/><path d="M3.5 19c.6-3 2.8-4.6 5.5-4.6s4.9 1.6 5.5 4.6"/><circle cx="17" cy="9.5" r="2.5"/><path d="M16.5 14.4c2.2.1 3.6 1.5 4 4"/>',
  spark:'<path d="M12 3.5c.7 4.3 2.2 5.8 6.5 6.5-4.3.7-5.8 2.2-6.5 6.5-.7-4.3-2.2-5.8-6.5-6.5 4.3-.7 5.8-2.2 6.5-6.5z"/><path d="M18.5 15.5c.3 1.7.8 2.2 2.5 2.5-1.7.3-2.2.8-2.5 2.5-.3-1.7-.8-2.2-2.5-2.5 1.7-.3 2.2-.8 2.5-2.5z"/>',
  left:'<path d="m14.5 6-6 6 6 6"/>', right:'<path d="m9.5 6 6 6-6 6"/>', arrow:'<path d="M5 12h13M13 6l6 6-6 6"/>', back:'<path d="M19 12H6M11 6l-6 6 6 6"/>',
  dice:'<rect x="4" y="4" width="16" height="16" rx="4"/><circle cx="9" cy="9" r="1.2" fill="currentColor"/><circle cx="15" cy="15" r="1.2" fill="currentColor"/><circle cx="15" cy="9" r="1.2" fill="currentColor"/><circle cx="9" cy="15" r="1.2" fill="currentColor"/>',
  eraser:'<path d="m14.5 4.8 4.7 4.7a1.6 1.6 0 0 1 0 2.3l-7.4 7.4H7.6l-2.9-2.9a1.6 1.6 0 0 1 0-2.3l7.5-7.5a1.6 1.6 0 0 1 2.3.3zM9 9.5l5.5 5.5M11.8 19.2H20"/>',
  trash:'<path d="M4.5 7h15M9.5 7V4.8h5V7M6.5 7l.9 12.2a1 1 0 0 0 1 .8h7.2a1 1 0 0 0 1-.8L17.5 7"/>',
  heart:'<path d="M12 19.5s-7.5-4.4-7.5-9.6A4.2 4.2 0 0 1 12 7.6a4.2 4.2 0 0 1 7.5 2.3c0 5.2-7.5 9.6-7.5 9.6z"/>',
  share:'<path d="M12 15V4M7.5 8.5 12 4l4.5 4.5M5 13v5.5a1.5 1.5 0 0 0 1.5 1.5h11a1.5 1.5 0 0 0 1.5-1.5V13"/>',
  down:'<path d="M12 4v11M7.5 10.5 12 15l4.5-4.5M5 19.5h14"/>',
  qr:'<rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><path d="M14 14h2.5v2.5H14zM17.5 17.5H20V20h-2.5zM14 19.5h1M19.5 14v1"/>',
  check:'<path d="M5 12.5l4.5 4.5L19 7"/>', plus:'<path d="M12 5v14M5 12h14"/>', x:'<path d="M6 6l12 12M18 6 6 18"/>',
  bag:'<path d="M5.5 8.5h13l-1 11.5h-11zM9 8.5V7a3 3 0 0 1 6 0v1.5"/>', gift:'<rect x="4" y="9" width="16" height="11" rx="1.5"/><path d="M3.5 9h17M12 9v11M12 9c-1-3-5.5-4.5-5.5-1.8C6.5 9 12 9 12 9zm0 0c1-3 5.5-4.5 5.5-1.8C17.5 9 12 9 12 9z"/>',
  drop:'<path d="M9 3.5h6M10 3.5v3.2M14 3.5v3.2M7.5 10.5a4.5 4.5 0 0 1 9 0V19a1.5 1.5 0 0 1-1.5 1.5H9A1.5 1.5 0 0 1 7.5 19z"/><path d="M7.5 13.5h9"/>',
  camera:'<path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2.2l1.4-2h5.8l1.4 2h2.2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z"/><circle cx="12" cy="12.8" r="3.4"/>',
  star:'<path d="m12 4 2.4 5 5.4.7-4 3.8 1 5.4L12 16.3 7.2 18.9l1-5.4-4-3.8 5.4-.7z"/>',
  search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>', edit:'<path d="M5 19h3.5L19 8.5 15.5 5 5 15.5zM13.5 7l3.5 3.5"/>',
  wa:'<path d="M5 19.5l1.1-3.4A7.5 7.5 0 1 1 9 18.6z"/><path d="M9.2 9.2c0 2.9 2.7 5.6 5.6 5.6l1.1-1.4-1.9-1-.9.8a4.3 4.3 0 0 1-2.3-2.3l.8-.9-1-1.9z"/>',
  fb:'<path d="M14.5 20v-6.5h2.3l.4-2.8h-2.7V9c0-.8.3-1.4 1.4-1.4h1.4V5.2a17 17 0 0 0-2.1-.1c-2 0-3.5 1.3-3.5 3.6v2H9.4v2.8h2.3V20"/>',
  xl:'<path d="M5 5l14 14M19 5 5 19"/>', link:'<path d="M10 14a3.5 3.5 0 0 0 5 0l3-3a3.5 3.5 0 0 0-5-5l-1 1M14 10a3.5 3.5 0 0 0-5 0l-3 3a3.5 3.5 0 0 0 5 5l1-1"/>',
  user:'<circle cx="12" cy="8.5" r="3.8"/><path d="M4.5 20c.8-3.8 3.7-5.8 7.5-5.8s6.7 2 7.5 5.8"/>', closet:'<rect x="4.5" y="3.5" width="15" height="17" rx="1.5"/><path d="M12 3.5v17M9.5 11v2M14.5 11v2"/>',
  coin:'<circle cx="12" cy="12" r="8"/><path d="M12 7.5v9M9.5 9.8c0-1.1 1.1-1.8 2.5-1.8s2.5.6 2.5 1.6c0 2.4-5 1.3-5 3.8 0 1 1.1 1.7 2.5 1.7s2.5-.7 2.5-1.8"/>'
};
function toHslRaw(hex){const n=parseInt(hex.slice(1),16);let r=(n>>16&255)/255,g=(n>>8&255)/255,b=(n&255)/255;const mx=Math.max(r,g,b),mn=Math.min(r,g,b);let h=0,s=0;const l=(mx+mn)/2;if(mx!==mn){const d=mx-mn;s=l>.5?d/(2-mx-mn):d/(mx+mn);h=mx===r?(g-b)/d+(g<b?6:0):mx===g?(b-r)/d+2:(r-g)/d+4;h*=60}return{h,s,l}}
function hslHex(h,s,l){h=((h%360)+360)%360;const a=s*Math.min(l,1-l);const f=n=>{const k=(n+h/30)%12;const c=l-a*Math.max(-1,Math.min(k-3,9-k,1));return Math.round(c*255).toString(16).padStart(2,'0')};return'#'+f(0)+f(8)+f(4)}
/* tonos de piel propios (claro → profundo); la sombra se deriva del tono */
const SKIN_LIGHTS = ['#FFD9C6','#F7C3A1','#E8A97F','#C98A61','#99604A','#6A3F31'];
function skinPair(c) { const h = toHslRaw(c); return [c, hslHex(h.h - 4, Math.min(1, h.s + .08), h.l - .075)]; }
['f','m'].forEach(g => { K[g].skins = SKIN_LIGHTS.map(skinPair); });
const ic = (n, cls = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="${cls}" aria-hidden="true">${IC[n] || ''}</svg>`;

/* ---------------------------------------------------------------------
   CATÁLOGO · prendas Vélez (cuero) / Vélez / Fly Up
   [id, nombre, zona, asset, línea, elegancia 0-100, género, tinte]
   zona: top · outer · bottom · dress · shoes · bag · hat · glasses · belt
   --------------------------------------------------------------------- */
const LINES = {flyup:'Fly Up', velez:'Vélez', cuero:'Vélez · cuero'};
const CAT_LIST = [
  // superior · mujer
  ['sueter-trenzado','Suéter trenzado mostaza','top','f_sueter_trenzado','flyup',42,'f'],
  ['sueter-trenzado-crema','Suéter trenzado crema','top','f_sueter_trenzado','velez',58,'f','#EFE4D2'],
  ['sueter-lazos','Suéter rosa con lazos','top','f_sueter_rosa','flyup',48,'f'],
  ['buzo-crop','Buzo crop mostaza','top','f_crop_mostaza','flyup',28,'f'],
  ['buzo-crop-lila','Buzo crop lila','top','f_crop_mostaza','flyup',26,'f','#9D8CF0'],
  ['top-negro','Top negro de tiras','top','f_top_negro','velez',58,'f'],
  ['top-capas','Top de tiras + camiseta','top','f_crop_tirantes','flyup',34,'f'],
  ['vestido-rayas','Vestido de rayas','dress','f_vestido_rayas','velez',66,'f'],
  // abrigos
  ['abrigo-hueso','Abrigo largo hueso','outer','f_abrigo_largo','velez',86,'f'],
  ['abrigo-camel-f','Abrigo largo camel','outer','f_abrigo_largo','velez',84,'f','#C99B6D'],
  ['chaqueta-cuero','Chaqueta de cuero negra','outer','f_chaqueta_cuero','cuero',72,'f','#27242A'],
  ['chaqueta-cuero-cognac','Chaqueta de cuero cognac','outer','f_chaqueta_cuero','cuero',74,'f','#8E4F2C'],
  ['chaqueta-jean','Chaqueta de jean clara','outer','f_chaqueta_denim','flyup',28,'f'],
  // inferior · mujer
  ['jean-mom','Jean mom azul','bottom','f_jean','flyup',34,'f'],
  ['jean-mom-negro','Jean mom negro','bottom','f_jean','flyup',40,'f','#34323A'],
  ['pantalon-negro','Pantalón negro de tiro alto','bottom','f_pantalon_negro','velez',66,'f'],
  ['falda-pana','Falda de pana con botones','bottom','f_falda_botones','velez',60,'f'],
  ['falda-pana-camel','Falda de pana camel','bottom','f_falda_pana','velez',62,'f','#B98552'],
  // calzado · mujer
  ['tenis-lona','Tenis de lona','shoes','f_tenis_lona','flyup',18,'f'],
  ['tenis-bota','Tenis bota clásicos','shoes','f_tenis_bota','flyup',22,'f'],
  ['bota-trekking','Bota trekking oliva','shoes','f_bota_trekking','flyup',36,'f'],
  ['bota-miel','Bota miel','shoes','f_bota_miel','flyup',40,'f'],
  ['bota-cuero-negra','Bota de cuero negra','shoes','f_bota_negra','cuero',70,'f'],
  ['oxford-cuero','Oxford de cuero','shoes','f_oxford','cuero',80,'f'],
  ['mule-cuero','Mule de cuero','shoes','f_mule','cuero',76,'f'],
  ['chelsea-cuero','Botín chelsea de cuero','shoes','f_chelsea','cuero',76,'f'],
  ['botin-cafe','Botín café de cuero','shoes','f_botin','cuero',72,'f'],
  // bolsos · mujer
  ['morral-cuero','Morral de cuero café','bag','f_morral','cuero',62,'f'],
  ['bolso-vino','Bolso de mano vino','bag','f_bolso','cuero',86,'f'],
  ['morral-mostaza','Morral mostaza','bag','f_morral_mostaza','flyup',30,'f'],
  // superior · hombre
  ['polo-azul','Suéter polo azul','top','m_polo_azul','flyup',46,'m'],
  ['sueter-vino','Suéter vino','top','m_sueter_vino','velez',52,'m'],
  ['camisa-blanca','Camisa blanca','top','m_camisa_blanca','velez',72,'m'],
  ['camisa-marfil','Camisa marfil','top','m_camisa_ivory','velez',66,'m'],
  ['camisa-azul','Camisa azul cielo','top','m_camisa_blanca','flyup',56,'m','#A9C4E8'],
  ['chaleco-oliva','Chaleco oliva con corbata','top','m_chaleco_oliva','velez',86,'m'],
  ['chaleco-rojo','Chaleco + camisa roja','top','m_chaleco_blanco','velez',74,'m'],
  ['abrigo-camel','Abrigo camel','outer','m_abrigo_camel','velez',86,'m'],
  ['abrigo-espiga','Abrigo gris','outer','m_abrigo_camel','velez',84,'m','#7E7B80'],
  ['blazer-cuero','Blazer de cuero café','outer','m_blazer_cuero','cuero',80,'m'],
  ['blazer-cuero-negro','Blazer de cuero negro','outer','m_blazer_cuero','cuero',82,'m','#2E2B30'],
  ['jean-oscuro','Jean oscuro','bottom','m_jean_oscuro','flyup',38,'m'],
  ['jean-indigo','Jean índigo','bottom','m_jean_oscuro','flyup',34,'m','#2F4F86'],
  ['pantalon-oliva','Pantalón oliva','bottom','m_pantalon_oliva','flyup',48,'m'],
  ['pantalon-cafe','Pantalón café','bottom','m_pantalon_cafe','velez',66,'m'],
  ['pantalon-gris','Pantalón gris','bottom','m_pantalon_gris','velez',70,'m'],
  ['botin-negro','Botín negro de cuero','shoes','m_botin_negro','cuero',74,'m'],
  ['derby-cuero','Derby de cuero','shoes','m_derby','cuero',80,'m'],
  ['bota-cordones','Bota de cordones','shoes','m_bota_cordones','cuero',56,'m'],
  ['bota-brogue','Bota brogue','shoes','m_bota_brogue','cuero',70,'m'],
  ['maletin-cognac','Maletín de cuero cognac','bag','m_maletin','cuero',80,'m'],
  ['tote-navy','Tote navy','bag','m_tote','flyup',44,'m'],
  ['portafolio-vino','Portafolio de cuero vino','bag','m_portafolio','cuero',86,'m'],
  // accesorios · unisex
  ['gafas-marco','Gafas de marco negro','glasses',{f:'f_gafas_negras',m:'m_gafas_azules'},'flyup',50,'u'],
  ['gafas-color','Gafas de color','glasses',{f:'f_gafas_rojas',m:'m_gafas_redondas'},'flyup',44,'u'],
  ['gafas-sol','Gafas de sol','glasses',{f:'f_gafas_sol',m:'m_gafas_sol'},'flyup',40,'u'],
  ['gorro-lana','Gorro de lana','hat',{f:'f_gorro_lana',m:'xf_gorro_lana'},'flyup',26,'u'],
  ['sombrero-ala','Sombrero de ala','hat',{f:'f_sombrero',m:'xf_sombrero'},'velez',74,'u'],
  ['fedora','Fedora','hat',{f:'xm_fedora',m:'m_fedora'},'velez',78,'u'],
  ['boina','Boina','hat',{f:'xm_boina',m:'m_boina'},'velez',62,'u'],
  ['cinturon-negro','Cinturón de cuero negro','belt','belt','cuero',80,'u','#25222A'],
  ['cinturon-cognac','Cinturón de cuero cognac','belt','belt','cuero',84,'u','#9C5A2E'],
  ['cinturon-camel','Cinturón de cuero camel','belt','belt','cuero',78,'u','#C08A55']
];
const CAT = Object.fromEntries(CAT_LIST.map(([id,name,z,a,line,e,g,tint]) => [id,{id,name,z,a,line,e,g,tint:tint||null}]));
const CATS = [
  {id:'all',label:'Todo'},{id:'top',label:'Superior',z:['top']},{id:'outer',label:'Abrigos',z:['outer']},{id:'bottom',label:'Inferior',z:['bottom']},
  {id:'dress',label:'Vestidos',z:['dress']},{id:'shoes',label:'Calzado',z:['shoes']},{id:'bag',label:'Bolsos',z:['bag']},{id:'acc',label:'Accesorios',z:['hat','glasses','belt']}
];
/* look básico según estilo (se entrega al registrarse) */
const BASIC = {
  f:{urbano:['sueter-lazos','jean-mom','tenis-lona','morral-mostaza'], mixto:['sueter-trenzado','jean-mom','bota-miel'], elegante:['top-negro','pantalon-negro','mule-cuero','abrigo-hueso']},
  m:{urbano:['polo-azul','jean-oscuro','bota-cordones','tote-navy'], mixto:['camisa-marfil','pantalon-oliva','derby-cuero'], elegante:['camisa-blanca','pantalon-gris','botin-negro','abrigo-camel']}
};
const STYLES = [
  {id:'urbano',label:'Urbano',line:'Cómodo, con flow de ciudad.',c:'c-ink'},
  {id:'mixto',label:'Mixto',line:'Mitad calle, mitad clásico.',c:'c-peri'},
  {id:'elegante',label:'Elegante',line:'Piezas de cuero y siluetas limpias.',c:'c-paper'}
];
const WHERE = [
  {id:'casa',label:'Casa',c:'#E7E4DC'},{id:'estudio',label:'Estudio / trabajo',c:'#E3E5F1'},{id:'salida',label:'Salida',c:'#F3DCDF'},
  {id:'evento',label:'Evento',c:'#D3D6EA'},{id:'cita',label:'Cita',c:'#EBC9CE'},{id:'viaje',label:'Viaje',c:'#DCD9D0'},{id:'deporte',label:'Plan activo',c:'#FFFFFF'}
];
const whereOf = id => WHERE.find(w => w.id === id) || WHERE[2];
const FRAGS = ['Ámbar','Índigo','Jade','Beauty','Entropía','Bora','Garden','Ambrosia','Bosco','Acqua','Vera'];
const OLFATO = [{n:1,label:'Muestra de regalo',pts:50},{n:3,label:'15% en tu próxima fragancia',pts:100},{n:5,label:'Reclama una prenda',pts:200}];
const REWARDS = [
  {id:'r-cinturon',item:'cinturon-cognac',cost:300,label:'Cinturón de cuero cognac'},
  {id:'r-gorro',item:'gorro-lana',cost:200,label:'Gorro de lana Fly Up'},
  {id:'r-morral',item:'morral-mostaza',cost:450,label:'Morral mostaza Fly Up',g:'f'},
  {id:'r-tote',item:'tote-navy',cost:450,label:'Tote navy Fly Up',g:'m'},
  {id:'r-sueter',item:'sueter-trenzado-crema',cost:650,label:'Suéter trenzado crema',g:'f'},
  {id:'r-camisa',item:'camisa-azul',cost:650,label:'Camisa azul cielo',g:'m'}
];
const LEVELS = [{id:'Despegue',min:0},{id:'Altura',min:300},{id:'Vuelo',min:800},{id:'Órbita',min:1500}];
const BADGES = {
  'primer-look':'Primer look', 'tendencia':'En tendencia', 'reto':'Reto del mes', 'olfato':'Explorador olfativo', 'comunidad':'En comunidad', 'coleccion':'Coleccionista', 'qr':'Look escaneado'
};
const PTS = {welcome:50, save:20, trend:30, own:10, share:40, publish:20, aroma:30, reto:150, qr:60};
const RETO = {title:'3 looks · 3 lugares', month:'Octubre', need:['casa','salida','evento'], text:'Guarda un look para la casa, uno para salir y uno para un evento.'};
const PALETTE = ['#E3E5F1','#F3DCDF','#E7E4DC','#FFFFFF','#D3D6EA','#EBC9CE','#DCD9D0','#EFEDE7'];
const HAIR = [null,'#2B2323','#5A3A2A','#B8833E','#E3BE6A','#A6452E','#9A9A9A','#8E9AFE','#E98AB0'];
const ZONES = [
  {z:'hat',label:'Cabeza'},{z:'glasses',label:'Gafas'},{z:'top',label:'Superior'},{z:'outer',label:'Abrigo'},
  {z:'belt',label:'Cinturón'},{z:'bag',label:'Bolso'},{z:'bottom',label:'Inferior'},{z:'shoes',label:'Calzado'}
];

/* ---------------------------------------------------------------------
   ESTADO
   --------------------------------------------------------------------- */
const KEY = 'velezup:v3';
const fresh = () => ({v:3, profile:null, closet:[], look:{}, looks:[], points:0, badges:[], liked:[], frag:[], claimed:[], flags:{}, src:'mine', zone:'top'});
let S;
try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || 'null') || {}); } catch (e) { S = fresh(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };
let REG = null; // borrador del registro

/* ---------------------------------------------------------------------
   COLOR
   --------------------------------------------------------------------- */
function toHsl(hex) {
  const n = parseInt(hex.slice(1), 16); let r = (n >> 16 & 255) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2;
  if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
    h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; }
  return {h, s, l};
}
function toHex(h, s, l) {
  h = ((h % 360) + 360) % 360; const a = s * Math.min(l, 1 - l);
  const f = n => { const k = (n + h / 30) % 12; const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(c * 255).toString(16).padStart(2, '0'); };
  return '#' + f(0) + f(8) + f(4);
}
const TC = new Map();
function tintColor(c, main, tint) {
  const k = c + main + tint; if (TC.has(k)) return TC.get(k);
  const C = toHsl(c), M = toHsl(main), T = toHsl(tint);
  const dh = Math.abs(((C.h - M.h) + 540) % 360 - 180);
  const fam = M.s < .16 ? (C.s < .22 && Math.abs(C.l - M.l) < .32) : (dh < 32 && C.s > .1 && Math.abs(C.l - M.l) < .38);
  const out = fam ? toHex(T.h, clamp(T.s + (C.s - M.s) * .6, 0, 1), clamp(T.l + (C.l - M.l), .05, .97)) : c;
  TC.set(k, out); return out;
}
function hairColor(c, main, target) {
  if (!target || !main) return c;
  const k = 'h' + c + main + target; if (TC.has(k)) return TC.get(k);
  const C = toHsl(c), M = toHsl(main), T = toHsl(target);
  const out = toHex(T.h, clamp(T.s + (C.s - M.s) * .5, 0, 1), clamp(T.l + (C.l - M.l), .06, .92));
  TC.set(k, out); return out;
}

/* ---------------------------------------------------------------------
   AVATAR · compone el SVG desde los kits (ropa ya calzada en Python)
   --------------------------------------------------------------------- */
/* trazos de trayectoria y vuelo (azul movimiento #1A2055, rojo elegante #9C0720) */
const FLIGHT = `<svg class="flight" viewBox="0 0 400 520" preserveAspectRatio="none" aria-hidden="true"><path d="M-10 430 C 70 380, 40 250, 120 190 S 300 120, 330 40" fill="none" stroke="#1A2055" stroke-width="2.4" stroke-dasharray="2 9" stroke-linecap="round"/><path d="M410 470 C 330 440, 360 330, 290 280 S 150 220, 170 120" fill="none" stroke="#9C0720" stroke-width="2.4" stroke-linecap="round"/><path d="M161 131 L170 118 L178 133" fill="none" stroke="#9C0720" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="330" cy="40" r="5" fill="#1A2055"/></svg>`;
const ORDER = ['shoes','bottom','dress','top','belt','outer','bag','head','glasses','hat'];
const ORDER_TUCK = ['shoes','top','bottom','dress','belt','outer','bag','head','glasses','hat']; // con cinturón la prenda superior va por dentro
let UID = 0;
function assetKey(item, g) {
  if (!item || item.a === 'belt') return item && item.a === 'belt' ? 'belt' : null;
  const tryKey = a => { if (!a) return null; const k = a.startsWith('x') ? a : (a.startsWith(g + '_') ? a : 'x' + a); return K[g].items[k] ? k : null; };
  if (typeof item.a === 'object') return tryKey(item.a[g]) || tryKey(item.a[g === 'f' ? 'm' : 'f']);
  return tryKey(item.a);
}
function lookItems(look) {
  const out = [];
  for (const id of Object.values(look.items || {})) {
    const it = CAT[id]; if (!it) continue;
    const key = assetKey(it, look.g); if (!key) continue;
    out.push({it, key, z: key === 'belt' ? 'belt' : K[look.g].items[key].z});
  }
  return out;
}
function pathsOf(list, fill, pre, clips) {
  let s = '';
  if (clips) clips.forEach((d, i) => { s += `<clipPath id="${pre}${i}"><path d="${d}"/></clipPath>`; });
  for (const e of list) {
    const cp = e.length > 2 && e[2] !== -1 ? ` clip-path="url(#${pre}${e[2]})"` : '';
    s += `<path d="${e[1]}" fill="${fill(e[0])}"${cp}/>`;
  }
  return s;
}
function beltSVG(k, it) {
  let [x0, x1, y] = k.belt; x0 -= 1.3; x1 += 1.3; const h = 4.6, cx = (x0 + x1) / 2, c = it.tint || '#2a2525';
  const dark = toHex(toHsl(c).h, toHsl(c).s, clamp(toHsl(c).l - .12, 0, 1));
  return `<rect x="${x0}" y="${y - h / 2}" width="${x1 - x0}" height="${h}" rx="1.2" fill="${c}"/><rect x="${x0}" y="${y + h / 2 - 1}" width="${x1 - x0}" height="1" fill="${dark}"/>` +
    `<rect x="${cx - 3.4}" y="${y - h / 2 - .9}" width="6.8" height="${h + 1.8}" rx="1.3" fill="none" stroke="#D9B45A" stroke-width="1.2"/><rect x="${cx - .5}" y="${y - 1}" width="1" height="2" fill="#D9B45A"/>`;
}
/* proporciones del cuerpo: la ropa vive en el mismo grupo que el cuerpo, así que se adapta sola */
const FIT_W = [.86, 1.16], FIT_H = [.93, 1.06];
const LIPS = [null, '#C2566B', '#9C0720', '#E58BA0', '#B5654A', '#7A2E3B'];
function fitOf(look) { const f = look.fit || {}; return {sx:clamp(+f.w || 1, FIT_W[0], FIT_W[1]), sy:clamp(+f.h || 1, FIT_H[0], FIT_H[1])}; }
function headDy(k, sy) { return (k.neck - k.base) * (sy - 1); }
/* marco común para todos los avatares completos (deja espacio a contextura y estatura) */
function fullView(g) { const k = K[g]; const ex = k.vb[2] * .1, top = k.base * .07; return [-ex, -top, k.vb[2] + 2 * ex, k.vb[3] + top]; }
/* ---------------------------------------------------------------------
   AJUSTE DE CAPAS · la prenda de encima siempre cubre a la de abajo
   Se mide la silueta de cada prenda fila por fila (canvas + Path2D) y, si el
   abrigo es más angosto que la prenda interior, se ensancha lo justo.
   Funciona con cualquier combinación, contextura o prenda cruzada.
   --------------------------------------------------------------------- */
const PROF = new Map();
function profileOf(g, key) {
  const id = g + ':' + key; if (PROF.has(id)) return PROF.get(id);
  const it = key === '@body' ? {p:K[g].body.filter(e => !e[3] || e[3] === 'r' || e[3] === 'l'), bb:[0, 0, K[g].vb[2], K[g].vb[3]]}
    : key.startsWith('@head') ? {p:K[g].heads[+key.slice(5)].p, bb:[0, 0, K[g].vb[2], K[g].face[1] + K[g].face[3] * 1.4]} : K[g].items[key]; let rows = [];
  try {
    const [bx, by, bw, bh] = it.bb; const R = 2;
    const c = document.createElement('canvas'); c.width = Math.ceil(bw * R) + 4; c.height = Math.ceil(bh * R) + 4;
    const x = c.getContext('2d'); x.setTransform(R, 0, 0, R, -bx * R + 2, -by * R + 2);
    for (const e of it.p) { if (e.length > 2 && e[2] !== -1) continue; x.fill(new Path2D(e[1]), 'evenodd'); }
    const d = x.getImageData(0, 0, c.width, c.height).data;
    for (let r = 0; r < c.height; r += 2) {
      let l = -1, rr = -1; const o = r * c.width * 4;
      for (let q = 0; q < c.width; q++) if (d[o + q * 4 + 3] > 60) { if (l < 0) l = q; rr = q; }
      if (l >= 0) rows.push([by + (r - 2) / R, bx + (l - 2) / R, bx + (rr - 2) / R]);
    }
  } catch (e) { rows = []; }
  PROF.set(id, rows); return rows;
}
/* cuánto hay que ensanchar la capa de encima (alrededor del centro del cuerpo) para cubrir la de abajo */
function coverScale(g, overKey, underKey) {
  const id = g + ':' + overKey + '>' + underKey; if (PROF.has(id)) return PROF.get(id);
  const A = profileOf(g, overKey), B = profileOf(g, underKey), cx = K[g].tcx;
  let sx = 1;
  if (A.length && B.length) {
    const top = A[0][0] + 7, ratios = [];
    let j = 0;
    for (const [y, al, ar] of A) {
      if (y < top) continue;
      while (j < B.length - 1 && B[j + 1][0] <= y) j++;
      const b = B[j]; if (!b || Math.abs(b[0] - y) > 1.6) continue;
      const dl = cx - al, dr = ar - cx; if (dl < 5 || dr < 5) continue;
      ratios.push(Math.max((cx - b[1] + 1.3) / dl, (b[2] - cx + 1.3) / dr));
    }
    if (ratios.length) { ratios.sort((p, q) => p - q); sx = clamp(ratios[Math.floor(ratios.length * .85)], 1, 1.06); }
  }
  PROF.set(id, sx); return sx;
}
/* franjas de la prenda interior que se asoman por el borde del abrigo: si sobresalen menos de 8 u son
   un «asomo» (mangas o costados más anchos) y se ocultan; si sobresalen más, es la prenda que sigue
   por debajo (antebrazo bajo una manga corta, bajo de la camisa) y se deja ver */
function peekBands(g, overKey, underKey, sx, maxY = 1e9) {
  const id = 'pk:' + g + ':' + overKey + '>' + underKey + ':' + sx.toFixed(3) + ':' + maxY; if (PROF.has(id)) return PROF.get(id);
  const A = profileOf(g, overKey), B = profileOf(g, underKey), cx = K[g].tcx;
  const X = x => cx + (x - cx) * sx; const rows = []; let j = 0;
  /* filas justo encima del hombro del abrigo: lo que sobresalga ahí se oculta siempre */
  /* y desde el cuello hasta la línea de hombros del abrigo (donde ya alcanza su ancho), también */
  let shY = -1e9;
  if (A.length) { const top = A.slice(0, Math.max(3, Math.floor(A.length * .35))); const maxW = Math.max(...top.map(r => r[2] - r[1])); const sh = A.find(r => r[2] - r[1] >= maxW * .85); if (sh) shY = sh[0]; }
  const A2 = A.length ? [...[8, 7, 6, 5, 4, 3, 2, 1].map(t => [A[0][0] - t, A[0][1], A[0][2], 1]), ...A.map(r => [r[0], r[1], r[2], r[0] < shY ? 1 : 0])] : A;
  for (const [y, al, ar, pre] of A2) {
    if (y > maxY) break;
    while (j < B.length - 1 && B[j + 1][0] <= y) j++;
    const b = B[j]; if (!b || Math.abs(b[0] - y) > 1.2) continue;
    rows.push({y, L:X(al), R:X(ar), bl:b[1], br:b[2], pre:!!pre});
  }
  /* se decide por tramos continuos (no fila por fila) para no dejar rayas */
  let d = '';
  for (const side of ['L', 'R']) {
    const ex = r => side === 'L' ? r.L - r.bl : r.br - r.R;
    let run = [];
    const flush = () => {
      if (!run.length) return;
      const m = run.map(ex).sort((p, q) => p - q)[Math.floor(run.length / 2)];
      if (m < 8 || run.every(r => r.pre)) for (const r of run) d += side === 'L'
        ? `M${(r.bl - .8).toFixed(1)} ${(r.y - .7).toFixed(1)}H${(r.L + .4).toFixed(1)}v1.5H${(r.bl - .8).toFixed(1)}Z`
        : `M${(r.R - .4).toFixed(1)} ${(r.y - .7).toFixed(1)}H${(r.br + .8).toFixed(1)}v1.5H${(r.R - .4).toFixed(1)}Z`;
      run = [];
    };
    let prev = null;
    for (const r of rows) { const e = ex(r); if (e > .2) { if (prev != null && Math.abs(e - prev) > 3) flush(); run.push(r); prev = e; } else { flush(); prev = null; } }
    flush();
  }
  PROF.set(id, d); return d;
}
function hatScale(g, head, key) {
  const id = 'hat:' + g + ':' + head + ':' + key; if (PROF.has(id)) return PROF.get(id);
  const H = profileOf(g, '@head' + head), T = profileOf(g, key), b = K[g].items[key].bb; let s = 1;
  if (H.length && T.length) {
    const yb = b[1] + b[3] - 2; const hr = H.filter(r => Math.abs(r[0] - yb) < 4);
    if (hr.length) {
      const hw = Math.max(...hr.map(r => r[2] - r[1])), tw = Math.max(...T.map(r => r[2] - r[1]));
      s = clamp((hw + 3) / tw, 1, 1.35);
    }
  }
  PROF.set(id, s); return s;
}
/* el abrigo corto pide la prenda superior por dentro del pantalón */
function shortOuter(g, overKey, underKey) {
  const A = profileOf(g, overKey), B = profileOf(g, underKey); if (!A.length || !B.length) return false;
  return A[A.length - 1][0] < B[B.length - 1][0] - 6;
}
/* look = {g, head, skin, hair, fit, expr, lips, items:{zone:id}} ; opt: {view:[x,y,w,h], cls, w, h, only:item} */
function avatarSVG(look, opt = {}) {
  const g = look.g || 'f', k = K[g]; const u = 'a' + (++UID) + '_';
  const sk = k.skins[look.skin || 0] || k.skins[0]; const head = k.heads[look.head || 0] || k.heads[0];
  const items = lookItems(look); const zs = new Set(items.map(x => x.z));
  const hide = new Set();
  if (zs.has('top') || zs.has('dress') || zs.has('outer')) hide.add('b');
  if (zs.has('bottom') || zs.has('dress')) hide.add('u');
  if (zs.has('shoes')) hide.add('f');
  const hairTgt = look.hair || head.hair;
  const brow = hairTgt ? (() => { const h = toHsl(hairTgt); return toHex(h.h, h.s, clamp(h.l - .06, .05, .6)); })() : null;
  const base = f => f === 'S' ? sk[0] : f === 's' ? sk[1] : f[0] === 'H' ? hairColor(f.slice(1), head.hair, look.hair)
    : f[0] === 'W' ? (brow || f.slice(1)) : f[0] === 'L' ? (look.lips || f.slice(1)) : f;
  const {sx, sy} = opt.only ? {sx:1, sy:1} : fitOf(look);
  const ex = look.expr != null && look.expr >= 0 ? k.exprs[look.expr] : null;
  let bodyG = '', headG = '';
  if (!opt.only) {
    for (const e of k.body) { if (e.length > 3 && hide.has(e[3])) continue; bodyG += `<path d="${e[1]}" fill="${base(e[0])}"/>`; }
  }
  const bodyLen = bodyG.length;
  const tOuter = items.find(x => x.z === 'outer'), tTop = items.find(x => x.z === 'top');
  const tBot = items.find(x => x.z === 'bottom');
  /* con falda, un top que baja más allá de la cintura va por dentro (si no, la tapa) */
  const longOverSkirt = tTop && tBot && !opt.only && /falda/.test(tBot.it.id) && (() => { const T = profileOf(g, tTop.key), B = profileOf(g, tBot.key); return T.length && B.length && T[T.length - 1][0] > B[0][0] + 14; })();
  const tuck = zs.has('bottom') && (zs.has('belt') || longOverSkirt || (tOuter && tTop && !opt.only && shortOuter(g, tOuter.key, tTop.key)));
  const order = tuck ? ORDER_TUCK : ORDER;
  let inHead = false;
  for (const z of order) {
    if (z === 'head') {
      inHead = true; if (opt.only) continue;
      head.p.forEach((e, i) => {
        if (ex && i === head.fi) headG += pathsOf(ex.p, base, u + 'x', null);
        const fl = e[3] || '';
        if (ex && fl.includes('e')) return;
        if (zs.has('hat') && fl.includes('t')) return;
        headG += `<path d="${e[1]}" fill="${base(e[0])}"/>`;
      });
      if (ex && head.fi >= head.p.length) headG += pathsOf(ex.p, base, u + 'x', null);
      continue;
    }
    let part = '';
    for (const x of items) {
      if (x.z !== z) continue;
      if (opt.only && x.it.id !== opt.only) continue;
      if (x.key === 'belt') { part += beltSVG(k, x.it); continue; }
      const d = k.items[x.key]; const main = d.main; const tint = x.it.tint;
      const fill = f => { const c = base(f); return tint && c[0] === '#' ? tintColor(c, main, tint) : c; };
      const under = z === 'outer' && !opt.only ? items.find(y => y.z === 'top' || y.z === 'dress') : null;
      const cs = under ? coverScale(g, x.key, under.key) : 1;
      let svgp = pathsOf(d.p, fill, u + x.key + '_', d.k);
      /* sombreros: se ensanchan hasta cubrir el pelo de esa cabeza a la altura del ala */
      if (z === 'hat' && !opt.only) {
        const hs = hatScale(g, look.head || 0, x.key);
        if (hs > 1.001) { const b = d.bb, hx = b[0] + b[2] / 2, hy = b[1] + b[3]; svgp = `<g transform="translate(${hx} ${hy}) scale(${hs.toFixed(3)} ${(1 + (hs - 1) * .45).toFixed(3)}) translate(${-hx} ${-hy})">${svgp}</g>`; }
      }
      /* prenda interior bajo un abrigo: se ocultan solo las franjas que se asoman por sus bordes */
      const over = (z === 'top' || z === 'dress') && !opt.only ? items.find(y => y.z === 'outer') : null;
      if (over) {
        const ocs = coverScale(g, over.key, x.key); const bands = peekBands(g, over.key, x.key, ocs);
        part += bands ? `<mask id="${u}pk" maskUnits="userSpaceOnUse" x="-400" y="-400" width="1200" height="1200"><rect x="-400" y="-400" width="1200" height="1200" fill="#fff"/><path d="${bands}" fill="#000"/></mask><g mask="url(#${u}pk)">${svgp}</g>` : svgp;
      } else part += cs > 1.001 ? `<g transform="translate(${k.tcx} 0) scale(${cs.toFixed(3)} 1) translate(${-k.tcx} 0)">${svgp}</g>` : svgp;
    }
    /* la mano vuelve a dibujarse sobre el asa del bolso: lo sostiene */
    if (z === 'bag' && zs.has('bag') && !opt.only) for (const e of k.body) if (e[3] === 'r') part += `<path d="${e[1]}" fill="${base(e[0])}"/>`;
    /* las manos salen siempre por el puño del abrigo, aunque la manga sea larga */
    if (z === 'outer' && zs.has('outer') && !opt.only) for (const e of k.body) if (e[3] === 'r' || e[3] === 'l') part += `<path d="${e[1]}" fill="${base(e[0])}"/>`;
    if (inHead) headG += part; else bodyG += part;
  }
  /* la piel que se asoma apenas por el borde de mangas y abrigos se oculta (mismo criterio por tramos) */
  if (!opt.only) {
    const cover = items.filter(x => ['top','dress','outer'].includes(x.z) && x.key !== 'belt');
    let bands = '';
    for (const c of cover) { const inner = items.find(y => y.z === 'top' || y.z === 'dress'); const ocs = c.z === 'outer' && inner ? coverScale(g, c.key, inner.key) : 1; bands += peekBands(g, c.key, '@body', ocs, k.belt[2] - 12); }
    if (bands) bodyG = `<mask id="${u}sk" maskUnits="userSpaceOnUse" x="-400" y="-400" width="1200" height="1200"><rect x="-400" y="-400" width="1200" height="1200" fill="#fff"/><path d="${bands}" fill="#000"/></mask><g mask="url(#${u}sk)">${bodyG.slice(0, bodyLen)}</g>` + bodyG.slice(bodyLen);
  }
  const bt = sx !== 1 || sy !== 1 ? ` transform="translate(${k.tcx} ${k.base}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(${-k.tcx} ${-k.base})"` : '';
  const ht = sy !== 1 ? ` transform="translate(0 ${headDy(k, sy).toFixed(2)})"` : '';
  const vb = opt.view || fullView(g);
  const size = opt.w ? ` width="${opt.w}" height="${opt.h}"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb.map(v => +(+v).toFixed(1)).join(' ')}"${size} class="${opt.cls || ''}" preserveAspectRatio="xMidYMax meet" aria-hidden="true"><g${bt}>${bodyG}</g><g${ht}>${headG}</g></svg>`;
}
/* recorte de la cabeza para la burbuja de perfil (el avatar es el logo) */
function faceView(g, look) { const k = K[g], f = k.face; const s = f[3] * 2.05; const dy = look ? headDy(k, fitOf(look).sy) : 0; return [f[0] + f[2] / 2 - s / 2, f[1] - s * .3 + dy, s, s]; }
function bubbleSVG(look) { return avatarSVG(look, {view: faceView(look.g, look)}).replace('xMidYMax', 'xMidYMid'); }
/* miniatura de una prenda */
function thumbSVG(id, g) {
  const it = CAT[id]; g = g || myG(); const key = assetKey(it, g);
  if (key === 'belt') {
    const k = K[g]; const [x0, x1, y] = k.belt; const w = x1 - x0, s = w * 1.15;
    return avatarSVG({g, items:{belt:id}}, {view:[x0 + w / 2 - s / 2, y - s / 2, s, s], only:id}).replace('xMidYMax', 'xMidYMid');
  }
  if (!key) return '';
  const b = K[g].items[key].bb; const s = Math.max(b[2], b[3]) * 1.08;
  return avatarSVG({g, items:{x:id}}, {view:[b[0] + b[2] / 2 - s / 2, b[1] + b[3] / 2 - s / 2, s, s], only:id}).replace('xMidYMax', 'xMidYMid');
}

/* ---------------------------------------------------------------------
   LÓGICA DE LOOKS
   --------------------------------------------------------------------- */
const myG = () => (S.profile && S.profile.g) || 'f';
const meLook = items => { const it = items || S.look; const ex = S.profile?.expr; return {g:myG(), head:S.profile?.head || 0, skin:S.profile?.skin || 0, hair:S.profile?.hair || null, fit:S.profile?.fit || null, expr:ex == null ? moodExpr(score(it)) : ex, lips:S.profile?.lips || null, items:it}; };
const owned = id => S.closet.includes(id);
function zoneOf(id) { const it = CAT[id]; return it ? (it.z === 'dress' ? 'top' : it.z) : null; }
function setPiece(items, id) {
  const it = CAT[id]; if (!it) return items;
  const z = zoneOf(id); items[z] = id;
  if (it.z === 'dress') delete items.bottom;
  if (z === 'bottom' && items.top && CAT[items.top]?.z === 'dress') delete items.top;
  return items;
}
/* porcentaje de tendencia: completo + balance elegancia/urbano + mezcla de líneas */
/* tendencia = look completo + detalles + balance elegancia/urbano + cuero Vélez + Fly Up (cada parte se explica) */
function scoreParts(items) {
  const ps = Object.values(items || {}).map(id => CAT[id]).filter(Boolean);
  const has = z => ps.some(p => p.z === z); const dress = has('dress');
  const core = {superior:has('top') || dress, inferior:has('bottom') || dress, calzado:has('shoes')};
  const miss = Object.keys(core).filter(k => !core[k]);
  const det = ps.filter(p => ['outer','bag','belt','hat','glasses'].includes(p.z)).length;
  const avg = ps.length ? ps.reduce((a, p) => a + p.e, 0) / ps.length : 0;
  const near = Math.abs(avg - 52);
  const cuero = ps.some(p => p.line === 'cuero'), fly = ps.some(p => p.line === 'flyup');
  return [
    {label:'Look completo', got:(3 - miss.length) * 15, max:45, ok:!miss.length,
      tip:miss.length ? `Te falta ${miss.join(', ')}.` : 'Tienes superior, inferior y calzado.', zone:miss.length ? {superior:'top', inferior:'bottom', calzado:'shoes'}[miss[0]] : null},
    {label:'Detalles', got:Math.min(15, det * 6), max:15, ok:det >= 3,
      tip:det >= 3 ? 'Tus detalles completan el total look.' : 'Un bolso, un cinturón, unas gafas o un abrigo suman puntos.', zone:det >= 3 ? null : 'bag'},
    {label:'Elegancia + urbano', got:ps.length ? 25 * (1 - Math.min(1, near / 42)) : 0, max:25, ok:ps.length > 0 && near < 10,
      tip:!ps.length ? 'Empieza con una prenda.' : near < 10 ? 'Tu look está balanceado.' : avg < 52 ? 'Está muy urbano: suma una pieza elegante, como cuero o un abrigo.' : 'Está muy formal: suma una pieza urbana Fly Up.',
      zone:!ps.length || near < 10 ? null : avg < 52 ? 'outer' : 'shoes'},
    {label:'Una pieza de cuero Vélez', got:cuero ? 8 : 0, max:8, ok:cuero, tip:cuero ? 'Ya llevas cuero Vélez.' : 'Un cinturón, unos botines o un bolso de cuero.', zone:cuero ? null : 'belt'},
    {label:'Una pieza Fly Up', got:fly ? 7 : 0, max:7, ok:fly, tip:fly ? 'Ya llevas Fly Up.' : 'Unos tenis, un buzo o un morral Fly Up.', zone:fly ? null : 'shoes'}
  ];
}
function score(items) {
  if (!Object.values(items || {}).some(id => CAT[id])) return 0;
  return Math.round(clamp(scoreParts(items).reduce((a, p) => a + p.got, 0), 0, 100));
}
/* el avatar reacciona: seria, sonrisa, alegre, risa (índices de las expresiones del kit) */
const moodExpr = p => p >= 85 ? 2 : p >= 65 ? 1 : p >= 40 ? 0 : 5;
const scoreLabel = p => p >= 85 ? '¡En tendencia!' : p >= 65 ? 'Casi en tendencia' : p >= 40 ? 'Vas muy bien' : p > 0 ? 'Suma piezas' : 'Empieza a vestirte';
function rng(seed) { let s = seed % 2147483647; if (s <= 0) s += 2147483646; return () => (s = s * 16807 % 2147483647) / 2147483647; }
function poolFor(g, src) {
  const all = CAT_LIST.map(r => r[0]).filter(id => assetKey(CAT[id], g));
  if (src === 'mine') return all.filter(owned);
  return all;
}
function randomLook(g, pool, r = Math.random, native = false) {
  const P = native ? pool.filter(id => CAT[id].g === g || CAT[id].g === 'u') : pool;
  const pick = zs => { const l = P.filter(id => zs.includes(CAT[id].z)); return l.length ? l[Math.floor(r() * l.length)] : null; };
  const items = {};
  const dress = pick(['dress']);
  if (dress && r() < .18) items.top = dress; else { const t = pick(['top']); if (t) items.top = t; const b = pick(['bottom']); if (b) items.bottom = b; }
  const s = pick(['shoes']); if (s) items.shoes = s;
  const add = (z, p) => { if (r() < p) { const v = pick([z]); if (v) items[z] = v; } };
  add('outer', .35); add('bag', .5); add('hat', .2); add('glasses', .25); if (items.bottom) add('belt', .3);
  return items;
}
function level(p) { let L = LEVELS[0], N = null; for (let i = 0; i < LEVELS.length; i++) if (p >= LEVELS[i].min) { L = LEVELS[i]; N = LEVELS[i + 1] || null; } return {L, N}; }
function retoProgress() { const done = new Set(S.looks.map(l => l.where)); return RETO.need.filter(w => done.has(w)).length; }
function aromaCount() { return S.frag.length; }

/* puntos e insignias */
function addPts(n, label) { S.points += n; save(); toast(label || '¡Bien!', '+' + n); updateTop(); }
function badge(id) { if (S.badges.includes(id)) return; S.badges.push(id); save(); setTimeout(() => toast('Insignia: ' + BADGES[id], '★'), 1200); }
function checkReto() { if (!S.flags.reto && retoProgress() >= RETO.need.length) { S.flags.reto = true; save(); setTimeout(() => { addPts(PTS.reto, 'Reto del mes completo'); badge('reto'); }, 1500); } }

/* código compacto de un look (para compartir y QR) */
/* formato corto: g~cabeza~piel~pelo~prendas(base36)~lugar~nombre~autor (QR más limpio) */
const CAT_IDX = Object.fromEntries(CAT_LIST.map((r, i) => [r[0], i]));
function encodeLook(l) {
  const it = Object.values(l.items || {}).map(id => CAT_IDX[id]).filter(i => i >= 0).map(i => i.toString(36)).join('.');
  return [l.g, l.head || 0, l.skin || 0, Math.max(0, HAIR.indexOf(l.hair || null)), it, Math.max(0, WHERE.findIndex(w => w.id === l.where)), encodeURIComponent(l.name || ''), encodeURIComponent(l.author || ''),
    Math.round(fitOf(l).sx * 100), Math.round(fitOf(l).sy * 100), l.expr ?? -1, Math.max(0, LIPS.indexOf(l.lips || null))].join('~');
}
function decodeLook(code) {
  try {
    const p = code.split('~').map((x, i) => i === 6 || i === 7 ? decodeURIComponent(x) : x); if (p.length < 5) return null;
    const items = {}; p[4].split('.').filter(Boolean).map(x => CAT_LIST[parseInt(x, 36)]).filter(Boolean).forEach(r => setPiece(items, r[0]));
    return {g:p[0] === 'm' ? 'm' : 'f', head:clamp(+p[1] || 0, 0, 4), skin:clamp(+p[2] || 0, 0, 5), hair:HAIR[+p[3]] || null, items, where:(WHERE[+p[5]] || WHERE[2]).id, name:p[6] || 'Look', author:p[7] || '',
      fit:{w:(+p[8] || 100) / 100, h:(+p[9] || 100) / 100}, expr:p[10] != null && +p[10] >= 0 ? +p[10] : null, lips:LIPS[+p[11]] || null};
  } catch (e) { return null; }
}
const lookURL = l => location.href.split('#')[0] + '#/look/' + encodeLook(l);

/* ---------------------------------------------------------------------
   COMUNIDAD (looks de ejemplo + publicados)
   --------------------------------------------------------------------- */
const DEMO_USERS = ['valen.up','sofi_rmz','juanes.co','mafe.style','cami.vlz','santi.fly','lu_ortiz','dani.mx','isa.cuero','tomas.urb','pau.lookbook','nico_up','meli.vlz','andres.fly'];
const DEMO_NAMES = ['Lunes de estudio','Azotea 6 p. m.','Domingo de brunch','Cena con historia','Viernes de oficina','Noche de galería','Aeropuerto sin afán','Primer día','Ciudad en movimiento','Café con lluvia','Concierto en la 93','Plan de museo','Feria del libro','Tarde de parque'];
const COMMUNITY = (() => {
  const out = []; const r = rng(2026);
  for (let i = 0; i < 14; i++) {
    const g = i % 2 ? 'm' : 'f'; const pool = poolFor(g, 'all');
    const items = {}; const raw = randomLook(g, pool, r, true); Object.values(raw).forEach(id => setPiece(items, id));
    out.push({id:'demo' + i, g, head:Math.floor(r() * 5), skin:Math.floor(r() * 6), hair:r() < .3 ? HAIR[1 + Math.floor(r() * 8)] : null, items,
      fit:{w:.9 + r() * .2, h:.95 + r() * .1}, expr:r() < .7 ? Math.floor(r() * 4) : null, lips:g === 'f' && r() < .4 ? LIPS[1 + Math.floor(r() * 5)] : null,
      name:DEMO_NAMES[i], where:WHERE[Math.floor(r() * WHERE.length)].id, author:DEMO_USERS[i], likes:12 + Math.floor(r() * 60), bg:PALETTE[i % PALETTE.length]});
  }
  return out;
})();
const communityLooks = () => [...S.looks.filter(l => l.published).map(l => ({...l, author:S.profile?.name || 'yo', mine:true, likes:l.likes || 0})), ...COMMUNITY];

/* ---------------------------------------------------------------------
   UI BÁSICA
   --------------------------------------------------------------------- */
let toastT;
function toast(msg, pts) {
  const t = $('#toast'); t.innerHTML = (pts ? `<span class="p">${esc(pts)}</span>` : '') + `<span>${esc(msg)}</span>`;
  t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2300);
}
function openSheet(html) { const s = $('#sheet'); s.innerHTML = '<div class="grab"></div>' + html; s.scrollTop = 0; s.classList.add('on'); $('#veil').classList.add('on'); }
function closeSheet() { $('#sheet').classList.remove('on'); $('#veil').classList.remove('on'); stopScan(); }
const shHead = (t, sub) => `<div class="sh-h"><div><h2 class="h2">${t}</h2>${sub ? `<p class="sub" style="margin:4px 0 0">${sub}</p>` : ''}</div><button class="icon-btn" data-act="close" aria-label="Cerrar">${ic('x')}</button></div>`;
const meter = (p, big) => `<div class="meter"><div class="track" role="progressbar" aria-valuenow="${p}" aria-valuemin="0" aria-valuemax="100" aria-label="Tendencia"><div class="fill" style="width:${Math.max(4, p)}%"></div></div><div class="num"${big ? '' : ' style="font-size:24px;min-width:58px"'}>${p}<small>%</small></div></div>`;
const lineTag = it => `<span class="tag${it.line === 'cuero' ? ' ink' : ''}">${LINES[it.line]}</span>`;

function updateTop() {
  const top = $('#top'); if (!S.profile) { top.classList.add('hide'); return; }
  top.classList.remove('hide');
  const lv = level(S.points).L;
  top.innerHTML = `<a class="me" href="#/perfil" aria-label="Mi perfil"><span class="bubble">${bubbleSVG(meLook())}</span><span class="hi"><b>Hola, ${esc(S.profile.name)}</b><span>Vélez Up · ${lv.id}</span></span></a>
    <a class="pts" href="#/vive" aria-label="${S.points} puntos"><i>${ic('star').replace('stroke="currentColor"', 'stroke="#fff"')}</i>${S.points}</a>`;
}
const TABS = [['inicio','home','Inicio'],['crear','hanger','Arma'],['descubre','compass','Descubre'],['comunidad','users','Comparte'],['vive','spark','Vive']];
function updateTabs(route) {
  const tb = $('#tabbar'); const show = !!S.profile && !['bienvenida','registro'].includes(route);
  tb.classList.toggle('hide', !show); if (!show) return;
  const map = {armario:'inicio', perfil:'inicio', look:'vive'};
  const cur = map[route] || route;
  tb.innerHTML = TABS.map(([r, i, l]) => `<a href="#/${r}" class="${r === cur ? 'on' : ''}" aria-label="${l}"${r === cur ? ' aria-current="page"' : ''}>${ic(i)}<span>${l}</span></a>`).join('');
}

/* ---------------------------------------------------------------------
   PANTALLAS
   --------------------------------------------------------------------- */
const V = {};

/* ---- bienvenida ---- */
V.bienvenida = () => {
  const a = {g:'f', head:3, skin:0, items:{top:'buzo-crop-lila', bottom:'jean-mom', shoes:'tenis-bota', bag:'morral-mostaza'}};
  const b = {g:'m', head:4, skin:4, items:{top:'camisa-blanca', outer:'blazer-cuero', bottom:'pantalon-gris', shoes:'derby-cuero', glasses:'gafas-sol'}};
  const c = {g:'f', head:4, skin:4, items:{top:'top-capas', bottom:'falda-pana', shoes:'mule-cuero', bag:'bolso-vino', hat:'sombrero-ala'}};
  return {full:true, html:`<section class="welcome">
    <div class="row between"><span class="brand">Vélez Up</span><span class="tag lime">v3</span></div>
    <div class="collage">
      <div class="tile c-peri" style="left:0;top:20px;width:52%;height:330px;transform:rotate(-4deg)">${avatarSVG(a)}</div>
      <div class="tile c-ink" style="right:0;top:0;width:50%;height:300px;transform:rotate(5deg)">${avatarSVG(b)}</div>
      <div class="tile c-paper" style="left:26%;top:150px;width:48%;height:280px;transform:rotate(1deg)">${avatarSVG(c)}</div>
      <span class="sticker" style="left:6px;top:4px">¡Hola!</span>
      <span class="sticker" style="right:10px;bottom:30px;background:var(--red);color:#fff;border-color:var(--red);transform:rotate(7deg)">92% tendencia</span>
    </div>
    <h1>Tu estilo <em>toma vuelo</em></h1>
    <p class="sub" style="margin:12px 0 22px"><b>Arma tu look. Llévalo más lejos.</b> Crea tu avatar, vístelo con las prendas Vélez y Fly Up que ya tienes y descubre qué tan lejos puede llegar tu estilo.</p>
    <a class="btn go block" href="#/registro/1">Crear mi perfil<span class="ar">${ic('arrow')}</span></a>
    <p class="disclaimer">Proyecto universitario · Gestión del Diseño 2. No es una app oficial de Vélez.</p>
  </section>`};
};

/* ---- registro: 1 nombre+género · 2 avatar · 3 estilo ---- */
function regLook() { const items = REG.style ? Object.fromEntries((BASIC[REG.g || 'f'][REG.style]).map(id => [zoneOf(id), id])) : {top:REG.g === 'm' ? 'camisa-marfil' : 'sueter-trenzado', bottom:REG.g === 'm' ? 'pantalon-oliva' : 'jean-mom', shoes:REG.g === 'm' ? 'derby-cuero' : 'tenis-lona'};
  return {g:REG.g || 'f', head:REG.head, skin:REG.skin, hair:REG.hair, fit:REG.fit || null, expr:REG.expr ?? moodExpr(score(items)), lips:REG.lips || null, items}; }
V.registro = step => {
  if (!REG) REG = S.profile ? {...S.profile} : {name:'', g:null, head:0, skin:0, hair:null, style:null, fit:{w:1, h:1}, expr:null, lips:null};
  step = +step || 1; if (step > 1 && (!REG.name.trim() || !REG.g)) step = 1;
  const steps = `<div class="steps">${[1,2,3].map(i => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div>`;
  const back = step > 1 ? `<a class="icon-btn" href="#/registro/${step - 1}" aria-label="Atrás">${ic('back')}</a>` : `<a class="icon-btn" href="#/bienvenida" aria-label="Atrás">${ic('back')}</a>`;
  let body = '', foot = '';
  if (step === 1) {
    const fl = {g:'f', head:0, skin:REG.skin, items:{top:'sueter-trenzado', bottom:'jean-mom', shoes:'tenis-lona'}};
    const ml = {g:'m', head:1, skin:REG.skin, items:{top:'camisa-marfil', bottom:'pantalon-oliva', shoes:'derby-cuero'}};
    body = `<h1 class="h1">¿Cómo te llamamos?</h1><p class="sub" style="margin:8px 0 0">Tu apodo o tu nombre. Así te verá la comunidad.</p>
      <label class="field"><span>Apodo o nombre *</span><input class="input" id="regName" maxlength="20" autocomplete="nickname" placeholder="Ej. Cami" value="${esc(REG.name)}"></label>
      <div class="err" id="errName"></div>
      <div class="field"><span>Tu avatar es *</span>
        <div class="gpick"><button class="c-peri ${REG.g === 'f' ? 'on' : ''}" data-act="regG" data-arg="f" aria-pressed="${REG.g === 'f'}"><b>Mujer</b>${avatarSVG(fl)}</button>
        <button class="c-ink ${REG.g === 'm' ? 'on' : ''}" data-act="regG" data-arg="m" aria-pressed="${REG.g === 'm'}"><b style="color:#fff">Hombre</b>${avatarSVG(ml)}</button></div>
        <p class="tiny mute" style="margin:8px 2px 0">Luego puedes ponerle cualquier prenda del catálogo, sea de la línea que sea.</p></div>
      <div class="err" id="errG"></div>`;
    foot = `<button class="btn go block" data-act="regNext" data-arg="1">Seguir<span class="ar">${ic('arrow')}</span></button>`;
  } else if (step === 2) {
    const k = K[REG.g];
    body = `<h1 class="h1">Crea tu avatar</h1><p class="sub" style="margin:8px 0 14px">Simple y rápido: piel, peinado y color de pelo.</p>
      <div class="avedit">${avEditor(regLook(), 'reg')}</div>`;
    foot = `<button class="btn go block" data-act="regNext" data-arg="2">Me encanta<span class="ar">${ic('arrow')}</span></button>`;
  } else {
    body = `<h1 class="h1">¿Cuál es tu estilo?</h1><p class="sub" style="margin:8px 0 14px">Te damos un look básico para empezar. Después agregas las prendas Vélez que ya tienes.</p>
      <div class="styles">${STYLES.map(s => { const l = {...regLook(), items:Object.fromEntries(BASIC[REG.g][s.id].map(id => [zoneOf(id), id]))};
        return `<button class="style-card ${s.c} ${REG.style === s.id ? 'on' : ''}" data-act="regStyle" data-arg="${s.id}" aria-pressed="${REG.style === s.id}"><span class="av">${avatarSVG(l)}</span><span><b>${s.label}</b><span style="font-size:14px">${s.line}</span><br><span class="tag" style="margin-top:8px">${score(l.items)}% tendencia</span></span></button>`; }).join('')}</div>`;
    foot = `<button class="btn go block" data-act="regDone" ${REG.style ? '' : 'disabled'}>Empezar<span class="ar">${ic('arrow')}</span></button>`;
  }
  return {full:true, html:`<section class="reg fadein"><div class="row between">${back}<span class="brand">Paso ${step} de 3</span><span style="width:40px"></span></div>${steps}${body}<div class="foot">${foot}</div></section>`};
};
function avEditor(look, ctx) {
  const k = K[look.g]; const fit = look.fit || {w:1, h:1};
  const heads = k.heads.map((h, i) => `<button class="${look.head === i ? 'on' : ''}" data-act="avHead" data-arg="${ctx}:${i}" aria-label="Peinado ${i + 1}">${bubbleSVG({...look, fit:null, head:i, items:{}})}</button>`).join('');
  const skins = k.skins.map((s, i) => `<button class="sw ${look.skin === i ? 'on' : ''}" style="background:${s[0]}" data-act="avSkin" data-arg="${ctx}:${i}" aria-label="Tono de piel ${i + 1}"></button>`).join('');
  const hair = HAIR.map((c, i) => `<button class="sw ${c ? '' : 'nat'} ${(look.hair || null) === c ? 'on' : ''}" style="${c ? 'background:' + c : ''}" data-act="avHair" data-arg="${ctx}:${i}" aria-label="${c ? 'Color de pelo ' + i : 'Color natural'}"></button>`).join('');
  const raw = (ctx === 'reg' ? REG.expr : S.profile?.expr) ?? -1;
  const exprs = [{n:'Según tu look'}, ...k.exprs].map((e, i) => { const v = i - 1; const on = raw === v;
    return `<button class="${on ? 'on' : ''}" data-act="avExpr" data-arg="${ctx}:${v}" aria-label="Expresión ${esc(e.n)}">${bubbleSVG({...look, fit:null, expr:v < 0 ? moodExpr(score(look.items)) : v, items:{}})}<span>${esc(e.n)}</span></button>`; }).join('');
  const lips = LIPS.map((c, i) => `<button class="sw ${c ? '' : 'nat lipnat'} ${(look.lips || null) === c ? 'on' : ''}" style="${c ? 'background:' + c : ''}" data-act="avLips" data-arg="${ctx}:${i}" aria-label="${c ? 'Labios ' + i : 'Labios naturales'}"></button>`).join('');
  const lblW = fit.w < .93 ? 'Delgada' : fit.w < 1.04 ? 'Media' : fit.w < 1.11 ? 'Atlética' : 'Robusta';
  const lblH = fit.h < .97 ? 'Baja' : fit.h < 1.02 ? 'Media' : 'Alta';
  return `<div class="preview c-peri" id="avPrev">${avatarSVG(look)}<span class="sticker" style="left:12px;top:12px">${esc((ctx === 'reg' ? REG.name : S.profile?.name) || 'Tú')}</span></div>
    <div><p class="opt-h">Tono de piel</p><div class="swatches">${skins}</div></div>
    <div><p class="opt-h">Peinado</p><div class="heads">${heads}</div></div>
    <div><p class="opt-h">Color de pelo</p><div class="swatches">${hair}</div></div>
    <div><p class="opt-h">Expresión</p><div class="heads exprs">${exprs}</div></div>
    <div class="slider"><p class="opt-h">Contextura <span id="lblW">${lblW}</span></p><input type="range" min="86" max="116" step="1" value="${Math.round(fit.w * 100)}" data-range="${ctx}:w" aria-label="Contextura"><div class="ends"><span>Delgada</span><span>Robusta</span></div></div>
    <div class="slider"><p class="opt-h">Estatura <span id="lblH">${lblH}</span></p><input type="range" min="93" max="106" step="1" value="${Math.round(fit.h * 100)}" data-range="${ctx}:h" aria-label="Estatura"><div class="ends"><span>Baja</span><span>Alta</span></div></div>
    <div><p class="opt-h">Labios</p><div class="swatches">${lips}</div></div>`;
}

/* ---- inicio ---- */
V.inicio = () => {
  const p = score(S.look); const reto = retoProgress();
  const com = communityLooks().slice(0, 8);
  return {html:`<section class="fadein">
    <div class="hero c-ink">
      <div class="txt"><span class="eyebrow">Mi look de hoy</span><h2 class="h2">${p >= 85 ? 'Estás en tendencia' : 'Dale tu toque'}</h2>
        <div><span class="meter-lbl">Tendencia</span>${meter(p, true)}</div></div>
      <div class="av">${avatarSVG(meLook())}</div>
      <div class="bot stack"><a class="btn sm" href="#/crear">${ic('edit')}Editar look</a><button class="btn sm ghost" data-act="randomHome">${ic('dice')}Al azar</button></div>
    </div>
    <div class="minis sec" style="margin-top:14px">
      <a class="mini c-paper line" href="#/descubre"><span class="ic" style="color:var(--ink)">${ic('plus')}</span><span><b>Agrega tus prendas Vélez</b><span style="font-size:13px">${S.closet.length} en tu armario</span></span></a>
      <a class="mini c-peri" href="#/descubre?reto"><span class="ic">${ic('star')}</span><span><b>Reto del mes</b><span style="font-size:13px">${RETO.title}</span><span class="dots">${RETO.need.map((_, i) => `<i class="${i < reto ? 'on' : ''}"></i>`).join('')}</span></span></a>
      <a class="mini wide c-sand" href="#/armario"><span class="ic">${ic('closet')}</span><span style="flex:1"><b>Mi armario</b><span style="font-size:13px">${S.looks.length} looks guardados · ${S.closet.length} prendas</span></span>${ic('right')}</a>
    </div>
    <div class="sec"><div class="sec-h"><h2 class="h2">De la comunidad</h2><a href="#/comunidad">Ver todo</a></div>
      <div class="hscroll">${com.map(l => lookCard(l)).join('')}</div></div>
  </section>`};
};
function lookCard(l, opts = {}) {
  const p = score(l.items); const liked = S.liked.includes(l.id);
  return `<button class="lookcard" data-act="openLook" data-arg="${esc(l.id)}" style="background:${l.bg || whereOf(l.where).c}">
    <span class="pct">${p}%</span>
    ${opts.like !== false ? `<span class="like ${liked ? 'on' : ''}" data-act="like" data-arg="${esc(l.id)}" role="button" aria-label="Me gusta">${ic('heart')}</span>` : ''}
    <div class="av">${avatarSVG(l)}</div>
    <div class="meta"><b>${esc(l.name)}</b><span>@${esc(l.author || S.profile?.name || '')} · ${whereOf(l.where).label}</span></div></button>`;
}

/* ---- creador ---- */
let CR = {last:null};
function zoneRows(g, look) {
  const k = K[g], f = k.face, b = k.belt, H = k.vb[3]; const {sy} = fitOf(look || {}); const hd = headDy(k, sy);
  const by = y => k.base + (y - k.base) * sy;
  return {hat:f[1] - 12 + hd, glasses:f[1] + f[3] * .42 + hd, top:by(b[2] - (g === 'm' ? 62 : 52)), outer:by(b[2] - (g === 'm' ? 30 : 26)), belt:by(b[2]), bag:by(b[2] + (g === 'm' ? 42 : 34)), bottom:by(b[2] + H * .22), shoes:by(H - 12)};
}
function zoneList(z) { return poolFor(myG(), S.src).filter(id => zoneOf(id) === z); }
V.crear = () => {
  const g = myG(), p = score(S.look); const z = S.zone || 'top'; const Z = ZONES.find(x => x.z === z) || ZONES[2];
  const stageH = Math.round(clamp(innerHeight - 470, 320, 520));
  const fv = fullView(g); const sc = (stageH - 26) / fv[3]; const figW = fv[2] * sc;
  const rows = zoneRows(g, meLook()); const ay = clamp(18 + (rows[z] - fv[1]) * sc, 40, stageH - 30);
  const cur = S.look[z] || null; const curIt = cur && CAT[cur];
  const list = zoneList(z);
  const chips = ZONES.map(x => `<button class="zchip ${x.z === z ? 'on' : ''} ${S.look[x.z] ? 'has' : ''}" data-act="zone" data-arg="${x.z}" aria-pressed="${x.z === z}">${x.label}</button>`).join('');
  const opts = list.length ? [`<button class="opt none ${cur ? '' : 'on'}" data-act="pick" data-arg="${z}:" aria-label="Sin ${Z.label.toLowerCase()}">${ic('x')}<span>Nada</span></button>`,
    ...list.map(id => `<button class="opt ${id === cur ? 'on' : ''}" data-act="pick" data-arg="${z}:${id}" aria-label="${esc(CAT[id].name)}">${thumbSVG(id)}${owned(id) ? '' : '<i class="dot" title="No la tienes"></i>'}</button>`)].join('')
    : `<div class="opt-empty">No tienes prendas de ${Z.label.toLowerCase()}. <button class="link" data-act="src" data-arg="all">Ver todo el catálogo</button></div>`;
  return {html:`<section class="creator fadein">
    <button class="cr-top" data-act="scoreInfo" aria-label="Ver qué sube tu tendencia"><div style="flex:1;min-width:0;text-align:left"><span class="meter-lbl">Tendencia · ${scoreLabel(p)} <u>¿Qué la sube?</u></span>${meter(p, true)}</div></button>
    <div class="stage" style="height:${stageH}px">
      ${FLIGHT}
      <div class="floor"></div>
      <div class="fig ${CR.pop ? 'pop' : ''}" id="fig" data-act="pickZoneAt" style="width:${figW.toFixed(0)}px;height:${(stageH - 26).toFixed(0)}px;margin-top:18px" title="Toca una zona del avatar">${avatarSVG(meLook())}</div>
      <div class="bigarrows" style="top:${ay.toFixed(0)}px">
        <button class="barrow" data-act="cycle" data-arg="${z}:-1" aria-label="${Z.label}: anterior">${ic('left')}</button>
        <span class="zname">${Z.label}</span>
        <span style="flex:1"></span>
        <button class="barrow" data-act="cycle" data-arg="${z}:1" aria-label="${Z.label}: siguiente">${ic('right')}</button>
      </div>
    </div>
    <div class="zchips" role="tablist" aria-label="Zonas del look">${chips}</div>
    <div class="car">
      <div class="car-h"><button class="car-name" ${curIt ? `data-act="product" data-arg="${curIt.id}"` : ''}><b>${curIt ? esc(curIt.name) : 'Sin ' + Z.label.toLowerCase()}</b>${curIt ? (owned(curIt.id) ? '<span class="tag lime">La tienes</span>' : '<span class="tag">No la tienes</span>') : ''}</button>
        <div class="src-toggle" role="tablist" aria-label="Prendas"><button class="${S.src === 'mine' ? 'on' : ''}" data-act="src" data-arg="mine" role="tab" aria-selected="${S.src === 'mine'}">Mi armario</button><button class="${S.src === 'all' ? 'on' : ''}" data-act="src" data-arg="all" role="tab" aria-selected="${S.src === 'all'}">Todo</button></div></div>
      <div class="opts" id="opts">${opts}</div>
    </div>
    <div class="cr-actions">
      <button class="act" data-act="roulette" id="rouBtn">${ic('dice')}Ruleta</button>
      <button class="act" data-act="clean">${ic('eraser')}Limpiar</button>
      <button class="act" data-act="empty">${ic('trash')}Vaciar todo</button>
      <button class="act save" data-act="saveLook">${ic('check')}Guardar</button>
    </div>
  </section>`};
};
/* cambia una zona y celebra cuando el look entra en tendencia */
function applyChange(fn) {
  const p0 = score(S.look); fn(); const p1 = score(S.look);
  CR.pop = true; save(); render(true); CR.pop = false;
  const o = $('#opts .opt.on'); if (o) o.scrollIntoView({block:'nearest', inline:'center'});
  if (p0 < 85 && p1 >= 85) toast('¡En tendencia! Un elemento cambia todo el look', p1 + '%');
}
function cycle(zone, dir) {
  const list = zoneList(zone);
  if (!list.length) { S.zone = zone; toast(S.src === 'mine' ? 'No tienes prendas de esta zona: mira todo el catálogo' : 'No hay prendas para esta zona'); return render(true); }
  applyChange(() => {
    const opts = [null, ...list]; const cur = S.look[zone] || null; let i = opts.indexOf(cur); if (i < 0) i = 0;
    const nx = opts[(i + dir + opts.length) % opts.length];
    if (nx) setPiece(S.look, nx); else delete S.look[zone];
    S.zone = zone; CR.last = zone;
  });
}
function scoreSheet() {
  const parts = scoreParts(S.look); const p = score(S.look);
  openSheet(`${shHead('Tu tendencia', scoreLabel(p))}
    <div class="score-big"><span class="fun">${p}<small>%</small></span><p>Un elemento cambia todo el look. Así se suma tu porcentaje:</p></div>
    <div class="parts">${parts.map(x => `<div class="part ${x.ok ? 'ok' : ''}"><div class="row between"><b>${x.label}</b><span class="fun">${Math.round(x.got)}/${x.max}</span></div>
      <div class="pbar"><i style="width:${Math.round(x.got / x.max * 100)}%"></i></div><p>${x.tip}</p>
      ${x.zone ? `<button class="btn sm ghost" data-act="goZone" data-arg="${x.zone}">${ic('hanger')}Ir a ${ZONES.find(Z => Z.z === x.zone).label.toLowerCase()}</button>` : ''}</div>`).join('')}</div>`);
}

/* ---- descubre (catálogo) ---- */
let DS = {cat:'all', who:'me', q:''};
V.descubre = arg => {
  const g = myG(); const reto = retoProgress();
  const cat = CATS.find(c => c.id === DS.cat) || CATS[0];
  let list = CAT_LIST.map(r => CAT[r[0]]).filter(it => assetKey(it, g));
  if (DS.who === 'me') list = list.filter(it => it.g === g || it.g === 'u');
  if (cat.z) list = list.filter(it => cat.z.includes(it.z));
  if (DS.q) { const q = DS.q.toLowerCase(); list = list.filter(it => (it.name + ' ' + LINES[it.line]).toLowerCase().includes(q)); }
  const art = [{g:'f', head:2, skin:1, items:{top:'top-negro', outer:'chaqueta-cuero-cognac', bottom:'jean-mom', shoes:'chelsea-cuero'}}, {g:'m', head:2, skin:2, items:{top:'chaleco-oliva', bottom:'pantalon-cafe', shoes:'derby-cuero', hat:'fedora'}}];
  const rw = REWARDS.filter(r => !r.g || r.g === g);
  return {html:`<section class="fadein">
    <div class="sec-h" style="margin:4px 0 12px"><div><h1 class="h1">Descubre</h1><p class="sub" style="margin:4px 0 0">El catálogo de la tienda. Marca lo que ya tienes.</p></div></div>
    <a class="banner c-ink" id="reto" href="#/descubre" data-act="retoInfo" style="min-height:178px">
      <span class="eyebrow">Reto de ${RETO.month}</span><h2 class="h2" style="margin:6px 0;max-width:58%">${RETO.title}</h2>
      <p style="margin:0;max-width:56%;font-size:13.5px">${RETO.text}</p>
      <span class="dots" style="margin-top:10px">${RETO.need.map((w, i) => `<i class="${i < reto ? 'on' : ''}"></i>`).join('')}<span class="tag" style="margin-left:6px;color:var(--ink)">+${PTS.reto} pts</span></span>
      <span class="art">${avatarSVG(art[0])}${avatarSVG(art[1])}</span></a>
    <div class="sec" style="margin-top:18px"><label class="search">${ic('search')}<input id="q" type="search" placeholder="Busca jean, cuero, botín…" value="${esc(DS.q)}" aria-label="Buscar en el catálogo"></label></div>
    <div class="chips" style="margin-top:12px">${CATS.map(c => `<button class="chip ${DS.cat === c.id ? 'on' : ''}" data-act="cat" data-arg="${c.id}">${c.label}</button>`).join('')}</div>
    <div class="row between" style="margin:12px 0"><span class="tiny mute" style="font-weight:700">${list.length} prendas</span>
      <div class="seg" style="width:200px;padding:3px"><button class="${DS.who === 'me' ? 'on' : ''}" style="height:30px;font-size:12.5px" data-act="who" data-arg="me">Para mí</button><button class="${DS.who === 'all' ? 'on' : ''}" style="height:30px;font-size:12.5px" data-act="who" data-arg="all">Todo</button></div></div>
    <div class="grid2">${list.map((it, i) => prodCard(it, i)).join('') || `<div class="empty" style="grid-column:1/-1">No encontramos prendas con esa búsqueda.</div>`}</div>
    <div class="sec" id="recompensas"><div class="sec-h"><h2 class="h2">Recompensas</h2><span class="pts" style="height:32px;font-size:14px"><i>${ic('star').replace('stroke="currentColor"', 'stroke="#fff"')}</i>${S.points}</span></div>
      <div class="rewards">${rw.map((r, i) => rewardRow(r, i)).join('')}</div>
      <p class="tiny mute" style="margin-top:10px">Ganas puntos guardando looks, sumando prendas a tu armario, compartiendo y registrando tus aromas en Vive.</p></div>
  </section>`};
};
function prodCard(it, i) {
  const on = owned(it.id);
  return `<div class="prod"><button class="th" style="background:${PALETTE[i % PALETTE.length]}" data-act="product" data-arg="${it.id}" aria-label="${esc(it.name)}">${lineTag(it)}${tryThumb(it.id)}</button>
    <div class="inf"><b>${esc(it.name)}</b><button class="own ${on ? 'on' : ''}" data-act="own" data-arg="${it.id}" aria-pressed="${on}">${on ? ic('check') + 'La tengo' : ic('plus') + 'La tengo'}</button></div></div>`;
}
function rewardRow(r, i) {
  const got = S.claimed.includes(r.id); const can = S.points >= r.cost;
  return `<div class="reward"><span class="th" style="background:${PALETTE[(i + 2) % PALETTE.length]}">${thumbSVG(r.item)}</span>
    <span class="c"><b>${esc(r.label)}</b><span>${r.cost} puntos</span></span>
    ${got ? `<span class="tag lime">Reclamada</span>` : `<button class="btn sm ${can ? '' : 'ghost'}" data-act="claim" data-arg="${r.id}" ${can ? '' : 'aria-disabled="true"'}>${can ? 'Reclamar' : `Faltan ${r.cost - S.points}`}</button>`}</div>`;
}

/* ---- comunidad ---- */
let CM = {f:'all'};
V.comunidad = () => {
  const list = communityLooks().filter(l => CM.f === 'all' || l.where === CM.f);
  return {html:`<section class="fadein">
    <div class="sec-h" style="margin:4px 0 12px"><div><h1 class="h1">Comparte</h1><p class="sub" style="margin:4px 0 0">Los looks de la comunidad: así la tendencia se difunde. Inspírate y pruébatelos.</p></div></div>
    <div class="chips"><button class="chip ${CM.f === 'all' ? 'on' : ''}" data-act="cmf" data-arg="all">Todos</button>${WHERE.map(w => `<button class="chip ${CM.f === w.id ? 'on' : ''}" data-act="cmf" data-arg="${w.id}"><span class="dot" style="background:${w.c}"></span>${w.label}</button>`).join('')}</div>
    <div class="banner c-sand row" style="margin:14px 0;gap:12px;padding:14px 16px"><span style="flex:1"><b class="h3">¿Y tu look?</b><br><span style="font-size:13px">Publica uno de tus looks desde tu armario.</span></span><a class="btn sm" href="#/armario">Publicar</a></div>
    <div class="feed">${list.map(l => lookCard(l)).join('') || `<div class="empty" style="grid-column:1/-1">Aún no hay looks para este momento.</div>`}</div>
  </section>`};
};

/* ---- vive ---- */
V.vive = () => {
  const {L, N} = level(S.points); const n = aromaCount();
  const pct = N ? (S.points - L.min) / (N.min - L.min) : 1; const R = 36, C = 2 * Math.PI * R;
  const looks = S.looks.slice(0, 4);
  return {html:`<section class="fadein">
    <div class="sec-h" style="margin:4px 0 12px"><div><h1 class="h1">Vive</h1><p class="sub" style="margin:4px 0 0">Tus puntos, tus aromas y tu look en la tienda.</p></div></div>
    <div class="card c-ink level"><div class="ring"><svg viewBox="0 0 84 84"><circle cx="42" cy="42" r="${R}" fill="none" stroke="rgba(255,255,255,.18)" stroke-width="9"/><circle cx="42" cy="42" r="${R}" fill="none" stroke="#9C0720" stroke-width="9" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct)}"/></svg><b>${S.points}</b></div>
      <div><span class="eyebrow" style="color:#F3DCDF">Nivel ${L.id}</span><h2 class="h2" style="margin:4px 0">${N ? `${N.min - S.points} pts para ${N.id}` : 'Nivel máximo'}</h2><a class="link" style="color:#fff;font-size:14px" href="#/descubre" data-act="toRewards">Canjear recompensas</a></div></div>
    <div class="card c-peri sec" style="margin-top:14px"><div class="row between"><span class="eyebrow">Olfato</span><span class="tag">${ic('drop').replace('<svg', '<svg width="14" height="14"')}${n} ${n === 1 ? 'aroma' : 'aromas'}</span></div>
      <h2 class="h2" style="margin:8px 0 4px">Tus aromas suman premios</h2><p style="margin:0;font-size:14px">Registra cada fragancia Vélez que compres en la tienda. Con 5 aromas reclamas una prenda.</p>
      <div class="mile">${OLFATO.map(m => `<div class="${n >= m.n ? 'on' : ''}"><b>${m.n}</b>${m.label}</div>`).join('')}</div>
      <div class="row" style="margin-top:14px;gap:8px"><button class="btn sm" data-act="aroma">${ic('plus')}Registrar aroma</button>${n >= 5 && !S.flags.olfatoPrenda ? `<button class="btn sm lime" data-act="olfatoPrenda">${ic('gift')}Reclamar prenda</button>` : ''}</div>
      ${S.frag.length ? `<p class="tiny" style="margin:10px 0 0">Últimos: ${S.frag.slice(-4).reverse().map(f => esc(f.name)).join(' · ')}</p>` : ''}</div>
    <div class="card c-paper line sec" style="margin-top:14px"><span class="eyebrow">En la tienda</span><h2 class="h2" style="margin:8px 0 4px">Escanea el código de tu look</h2>
      <p style="margin:0;font-size:14px">Cada look guardado tiene un código QR. Al escanearlo ves qué prendas necesitas para armarlo, cuáles ya tienes y cuáles te faltan.</p>
      <div class="row" style="margin-top:14px;gap:8px"><button class="btn sm" data-act="scan">${ic('camera')}Escanear QR</button><a class="btn sm ghost" href="#/armario">Mis looks</a></div></div>
    ${looks.length ? `<div class="sec"><div class="sec-h"><h2 class="h2">Códigos de tus looks</h2></div><div class="list">${looks.map(l => `<button class="it" style="width:100%;text-align:left" data-act="qr" data-arg="${l.id}"><span class="ic" style="background:${whereOf(l.where).c}">${bubbleSVG(l)}</span><span class="c"><b>${esc(l.name)}</b><span>${whereOf(l.where).label} · ${Object.keys(l.items).length} prendas</span></span>${ic('qr').replace('<svg', '<svg width="22" height="22"')}</button>`).join('')}</div></div>` : ''}
    <div class="sec"><div class="sec-h"><h2 class="h2">Insignias</h2></div><div class="chips wrap">${Object.entries(BADGES).map(([id, n]) => `<span class="chip ${S.badges.includes(id) ? 'on' : ''}" style="${S.badges.includes(id) ? '' : 'opacity:.45'}">${ic('star').replace('<svg', '<svg width="15" height="15"')}${n}</span>`).join('')}</div></div>
  </section>`};
};

/* ---- armario ---- */
let AR = {tab:'looks'};
V.armario = () => {
  const items = S.closet.map(id => CAT[id]).filter(Boolean);
  const looks = S.looks;
  return {html:`<section class="fadein">
    <div class="row" style="margin:4px 0 14px;gap:12px"><a class="icon-btn" href="#/inicio" aria-label="Volver">${ic('back')}</a><h1 class="h1">Mi armario</h1></div>
    <div class="seg"><button class="${AR.tab === 'looks' ? 'on' : ''}" data-act="artab" data-arg="looks">Mis looks · ${looks.length}</button><button class="${AR.tab === 'prendas' ? 'on' : ''}" data-act="artab" data-arg="prendas">Mis prendas · ${items.length}</button></div>
    <div class="sec" style="margin-top:16px">${AR.tab === 'looks' ?
      (looks.length ? `<div class="feed">${looks.map(l => lookCard({...l, author:S.profile.name}, {like:false})).join('')}</div>` : `<div class="empty"><b class="h3">Aún no guardas looks</b><p class="sub">Ve al creador, arma tu look y guárdalo.</p><a class="btn sm" href="#/crear">Crear look</a></div>`) :
      (items.length ? `<div class="grid2">${items.map((it, i) => prodCard(it, i)).join('')}</div>` : `<div class="empty"><b class="h3">Tu armario está vacío</b><p class="sub">Marca en Descubre las prendas que tienes.</p><a class="btn sm" href="#/descubre">Ir a Descubre</a></div>`)}</div>
  </section>`};
};

/* ---- perfil ---- */
V.perfil = () => {
  const p = S.profile; const st = STYLES.find(s => s.id === p.style);
  return {html:`<section class="fadein">
    <div class="row" style="margin:4px 0 14px;gap:12px"><a class="icon-btn" href="#/inicio" aria-label="Volver">${ic('back')}</a><h1 class="h1">Mi perfil</h1></div>
    <div class="card c-peri row" style="gap:16px"><span class="bubble lg">${bubbleSVG(meLook())}</span><div style="min-width:0"><h2 class="h2">${esc(p.name)}</h2><p style="margin:4px 0 8px">${p.g === 'f' ? 'Avatar mujer' : 'Avatar hombre'} · Estilo ${st ? st.label.toLowerCase() : ''}</p><span class="tag">Nivel ${level(S.points).L.id} · ${S.points} pts</span></div></div>
    <p class="tiny mute" style="margin:8px 4px 0">Tu avatar es tu logo: aparece en tu perfil, tus looks y la comunidad.</p>
    <div class="sec"><div class="sec-h"><h2 class="h2">Mi avatar</h2></div><div class="avedit">${avEditor(meLook(), 'me')}</div></div>
    <div class="sec"><div class="sec-h"><h2 class="h2">Mis datos</h2></div>
      <label class="field"><span>Apodo o nombre</span><input class="input" id="meName" maxlength="20" value="${esc(p.name)}"></label>
      <div class="field"><span>Estilo</span><div class="chips wrap">${STYLES.map(s => `<button class="chip ${p.style === s.id ? 'on' : ''}" data-act="meStyle" data-arg="${s.id}">${s.label}</button>`).join('')}</div></div>
      <div class="field"><span>Avatar</span><div class="chips wrap"><button class="chip ${p.g === 'f' ? 'on' : ''}" data-act="meG" data-arg="f">Mujer</button><button class="chip ${p.g === 'm' ? 'on' : ''}" data-act="meG" data-arg="m">Hombre</button></div></div></div>
    <div class="sec list"><a class="it" href="#/armario"><span class="ic c-sand" style="padding:10px">${ic('closet')}</span><span class="c"><b>Mi armario</b><span>Looks y prendas</span></span>${ic('right').replace('<svg', '<svg width="20" height="20"')}</a>
      <button class="it" style="width:100%;text-align:left" data-act="about"><span class="ic c-peri" style="padding:10px">${ic('spark')}</span><span class="c"><b>Acerca de Vélez Up</b><span>Proyecto universitario</span></span>${ic('right').replace('<svg', '<svg width="20" height="20"')}</button>
      <button class="it" style="width:100%;text-align:left" data-act="reset"><span class="ic c-orange" style="padding:10px;color:#fff">${ic('trash')}</span><span class="c"><b>Empezar de cero</b><span>Borra perfil, looks y puntos de este dispositivo</span></span></button></div>
  </section>`};
};

/* ---- look compartido / escaneado ---- */
V.look = code => {
  const l = decodeLook(code || ''); if (!l) return {html:`<section class="empty sec">Este código no es válido.</section>`};
  const ids = Object.values(l.items); const have = ids.filter(owned); const p = score(l.items);
  if (S.profile && !S.flags['qr_' + code.slice(0, 24)]) { S.flags['qr_' + code.slice(0, 24)] = 1; save(); setTimeout(() => { addPts(PTS.qr, 'Look escaneado'); badge('qr'); }, 600); }
  return {html:`<section class="fadein">
    <div class="row" style="margin:4px 0 14px;gap:12px"><a class="icon-btn" href="#/${S.profile ? 'vive' : 'bienvenida'}" aria-label="Volver">${ic('back')}</a><div><span class="eyebrow">Look escaneado</span><h1 class="h2">${esc(l.name)}</h1></div></div>
    <div class="okcard c-peri" style="grid-template-columns:130px 1fr"><div class="av">${avatarSVG(l)}</div><div><span class="tag">${whereOf(l.where).label}</span>${l.author ? `<p style="margin:8px 0 0;font-size:13px">por @${esc(l.author)}</p>` : ''}<div style="margin-top:10px">${meter(p)}</div>
      ${S.profile ? `<p style="margin:10px 0 0;font-weight:700">Tienes ${have.length} de ${ids.length} prendas</p>` : ''}</div></div>
    <div class="sec"><div class="sec-h"><h2 class="h2">Prendas que necesitas</h2></div>
      <div class="list">${ids.map((id, i) => { const it = CAT[id]; const o = owned(id);
        return `<div class="it"><span class="ic" style="background:${PALETTE[i % PALETTE.length]}">${thumbSVG(id, S.profile ? myG() : l.g)}</span><span class="c"><b>${esc(it.name)}</b><span>${LINES[it.line]} · ${o ? 'Ya la tienes' : 'Te falta'}</span></span>${S.profile ? (o ? `<span class="tag lime">${ic('check').replace('<svg', '<svg width="12" height="12"')}Tienes</span>` : `<button class="btn sm ghost" data-act="own" data-arg="${id}">La compré</button>`) : ''}</div>`; }).join('')}</div></div>
    ${S.profile ? `<button class="btn go block sec" data-act="tryLook" data-arg="${esc(code)}">Probármelo en mi avatar<span class="ar">${ic('arrow')}</span></button>` : `<a class="btn go block sec" href="#/registro/1">Crear mi avatar<span class="ar">${ic('arrow')}</span></a>`}
  </section>`};
};

/* ---------------------------------------------------------------------
   HOJAS
   --------------------------------------------------------------------- */
function productSheet(id) {
  const it = CAT[id]; const g = myG(); const on = owned(id); const z0 = zoneOf(id);
  const base = {...S.look}; if (['top','dress'].includes(it.z)) delete base.outer;
  const tryL = setPiece(base, id); const p = score(tryL), p0 = score(S.look);
  const worn = new Set(Object.values(tryL));
  let pool = poolFor(g, 'mine').filter(x => zoneOf(x) !== z0 && !worn.has(x));
  if (pool.length < 3) pool = pool.concat(poolFor(g, 'all').filter(x => zoneOf(x) !== z0 && !worn.has(x) && (CAT[x].g === g || CAT[x].g === 'u') && !pool.includes(x)));
  const seen = new Set(); const combo = pool.map(x => ({x, s:score(setPiece({...tryL}, x))})).sort((a, b) => b.s - a.s || owned(b.x) - owned(a.x))
    .filter(c => { const zz = zoneOf(c.x); if (seen.has(zz)) return false; seen.add(zz); return true; }).slice(0, 3);
  const withIt = communityLooks().filter(l => Object.values(l.items).includes(id)).slice(0, 6);
  const d = p - p0;
  openSheet(`${shHead(esc(it.name), LINES[it.line] + (it.g !== 'u' && it.g !== g ? ' · línea ' + (it.g === 'f' ? 'mujer' : 'hombre') : ''))}
    <div class="okcard c-sand"><div class="av">${avatarSVG(meLook(tryL))}</div><div class="stack">
      <span class="eyebrow">Pruébala con lo que tienes</span>
      <span class="fun" style="font-size:34px;line-height:1">${p}<small style="font-size:18px">%</small></span>
      <span class="tiny">${d > 0 ? `Sube tu tendencia ${d} puntos` : d < 0 ? `Baja tu tendencia ${-d} puntos` : 'Mantiene tu tendencia'} con tu look de hoy.</span>
      <div class="mini-th">${thumbSVG(id)}</div></div></div>
    <div class="row" style="margin-top:12px;gap:8px"><button class="btn block ${on ? 'ghost' : 'lime'}" data-act="own" data-arg="${id}">${on ? ic('check') + 'La tengo' : ic('plus') + 'La tengo'}</button><button class="btn block" data-act="tryOn" data-arg="${id}">${ic('hanger')}Pruébatela</button></div>
    ${combo.length ? `<div class="sec" style="margin-top:20px"><p class="opt-h">Combínala con</p><div class="combo">${combo.map(c => `<button class="combo-it" data-act="tryCombo" data-arg="${id}|${c.x}"><span class="th">${thumbSVG(c.x)}</span><b>${esc(CAT[c.x].name)}</b><span class="tiny">${owned(c.x) ? 'La tienes' : LINES[CAT[c.x].line]} · ${c.s}%</span></button>`).join('')}</div></div>` : ''}
    <div class="sec" style="margin-top:20px"><p class="opt-h">Looks con esta prenda</p>${withIt.length ? `<div class="hscroll">${withIt.map(l => lookCard(l, {like:false})).join('')}</div>` : `<p class="tiny mute">Aún nadie la ha usado en la comunidad. Arma un look con ella y publícalo.</p>`}</div>`);
}
/* miniatura de catálogo: la prenda puesta en tu avatar (nunca aislada) */
function tryThumb(id) {
  const it = CAT[id], g = myG(), key = assetKey(it, g); if (!key) return '';
  const k = K[g]; let b;
  if (key === 'belt') { const [x0, x1, y] = k.belt; b = [x0, y - 3, x1 - x0, 6]; } else b = k.items[key].bb;
  let s = Math.max(b[2], b[3]) * 1.22; s = Math.max(s, ['glasses','hat'].includes(it.z) ? 62 : ['belt'].includes(it.z) ? 70 : 40);
  let cy = b[1] + b[3] / 2; if (it.z === 'hat') cy += s * .2; if (it.z === 'glasses') cy += s * .1;
  const base = {...S.look}; if (it.z !== 'outer') delete base.outer; if (it.z !== 'bag') delete base.bag;
  const look = {...meLook(setPiece(base, id)), fit:null};
  return avatarSVG(look, {view:[b[0] + b[2] / 2 - s / 2, cy - s / 2, s, s]}).replace('xMidYMax', 'xMidYMid');
}
function saveSheet() {
  const n = S.looks.length + 1; const p = score(S.look);
  openSheet(`${shHead('Guardar mi look', 'Ponle nombre y dinos para dónde es.')}
    <label class="field"><span>Nombre del look</span><input class="input" id="lkName" maxlength="28" value="Mi look ${n}"></label>
    <div class="field"><span>¿Para dónde es? *</span><div class="chips wrap" id="lkWhere">${WHERE.map(w => `<button class="chip" data-act="pickWhere" data-arg="${w.id}"><span class="dot" style="background:${w.c}"></span>${w.label}</button>`).join('')}</div><div class="err" id="errWhere"></div></div>
    <div class="row between" style="margin-top:12px"><span class="meter-lbl">${scoreLabel(p)}</span><span class="fun" style="font-weight:700;font-size:22px">${p}%</span></div>
    <button class="btn go block" style="margin-top:14px" data-act="doSave">Guardar<span class="ar">${ic('check')}</span></button>`);
}
function savedSheet(l) {
  openSheet(`${shHead('¡Look guardado!', 'Ya está en tu armario.')}
    <div class="okcard" style="background:${whereOf(l.where).c}"><div class="av">${avatarSVG({...l, expr:2})}</div><div><span class="tag">${whereOf(l.where).label}</span><h3 class="h3" style="margin:8px 0">${esc(l.name)}</h3>${meter(score(l.items))}</div></div>
    <div class="sec" style="margin-top:18px"><p class="opt-h">Compartir</p>${shareGrid(l)}</div>
    <div class="row" style="margin-top:18px;gap:8px"><a class="btn block ghost" href="#/armario" data-act="close">${ic('closet')}Ver en mi armario</a><button class="btn block" data-act="another">${ic('plus')}Crear otro</button></div>`);
}
function shareGrid(l) {
  const url = lookURL(l); const txt = `Mira mi look "${l.name}" en Vélez Up (${score(l.items)}% tendencia)`;
  const e = encodeURIComponent;
  return `<div class="share-grid">
    <button data-act="shareNative" data-arg="${l.id}"><i class="c-lime" style="border-color:var(--red)">${ic('share')}</i>Compartir</button>
    <a href="https://wa.me/?text=${e(txt + ' ' + url)}" target="_blank" rel="noopener" data-act="shared"><i style="background:#C9F2D5">${ic('wa')}</i>WhatsApp</a>
    <a href="https://www.facebook.com/sharer/sharer.php?u=${e(url)}" target="_blank" rel="noopener" data-act="shared"><i style="background:#DCE0FF">${ic('fb')}</i>Facebook</a>
    <a href="https://twitter.com/intent/tweet?text=${e(txt)}&url=${e(url)}" target="_blank" rel="noopener" data-act="shared"><i style="background:var(--sand)">${ic('xl')}</i>X</a>
    <button data-act="download" data-arg="${l.id}"><i style="background:var(--pink)">${ic('down')}</i>Imagen</button>
    <button data-act="copyLink" data-arg="${l.id}"><i style="background:var(--sand)">${ic('link')}</i>Enlace</button>
    <button data-act="qr" data-arg="${l.id}"><i style="background:var(--orange2)">${ic('qr')}</i>Código QR</button>
    <button data-act="download" data-arg="${l.id}" aria-label="Descargar para Instagram"><i style="background:linear-gradient(135deg,#F5F4F0,#9C0720,#1A2055);color:#fff">${ic('camera')}</i>Instagram</button></div>`;
}
function lookSheet(id) {
  const mine = S.looks.find(l => l.id === id); const l = mine || communityLooks().find(x => x.id === id); if (!l) return;
  const ids = Object.values(l.items);
  openSheet(`${shHead(esc(l.name), `@${esc(mine ? S.profile.name : l.author)} · ${whereOf(l.where).label}`)}
    <div class="okcard" style="background:${l.bg || whereOf(l.where).c}"><div class="av">${avatarSVG(l)}</div><div>${meter(score(l.items))}<p class="tiny" style="margin:10px 0 0">${ids.length} prendas · tienes ${ids.filter(owned).length}</p></div></div>
    <div class="list sec" style="margin-top:14px">${ids.map((pid, i) => `<button class="it" style="width:100%;text-align:left" data-act="product" data-arg="${pid}"><span class="ic" style="background:${PALETTE[i % PALETTE.length]}">${thumbSVG(pid)}</span><span class="c"><b>${esc(CAT[pid].name)}</b><span>${LINES[CAT[pid].line]}${owned(pid) ? ' · La tienes' : ''}</span></span>${ic('right').replace('<svg', '<svg width="18" height="18"')}</button>`).join('')}</div>
    ${mine ? `<div class="sec" style="margin-top:16px"><p class="opt-h">Compartir</p>${shareGrid(l)}</div>
      <div class="row" style="margin-top:16px;gap:8px"><button class="btn block" data-act="editLook" data-arg="${l.id}">${ic('edit')}Editar</button><button class="btn block ${l.published ? 'ghost' : 'lime'}" data-act="publish" data-arg="${l.id}">${ic('users')}${l.published ? 'Quitar de comunidad' : 'Publicar'}</button></div>
      <button class="btn block ghost" style="margin-top:8px;color:var(--red);border-color:var(--red)" data-act="delLook" data-arg="${l.id}">${ic('trash')}Eliminar look</button>` :
    `<button class="btn go block" style="margin-top:16px" data-act="tryCommunity" data-arg="${l.id}">Probármelo<span class="ar">${ic('hanger')}</span></button>`}`);
}
function qrSheet(id) {
  const l = S.looks.find(x => x.id === id); if (!l) return;
  const url = lookURL(l); let svg = '';
  try { const q = qrcode(0, 'M'); q.addData(url); q.make(); svg = q.createSvgTag({cellSize:4, margin:2, scalable:true}); } catch (e) { svg = `<p class="tiny" style="word-break:break-all">${esc(url)}</p>`; }
  openSheet(`${shHead('Código de tu look', esc(l.name))}<div class="qrbox">${svg}</div>
    <p class="sub" style="text-align:center;margin:12px 0">Muéstralo en la tienda: al escanearlo aparecen las prendas que necesitas para este look.</p>
    <div class="row" style="gap:8px"><button class="btn block ghost" data-act="copyLink" data-arg="${l.id}">${ic('link')}Copiar enlace</button><a class="btn block" href="#/look/${encodeLook(l)}" data-act="close">${ic('bag')}Ver prendas</a></div>`);
}
function aromaSheet() {
  openSheet(`${shHead('Registrar aroma', 'Elige la fragancia que compraste en la tienda.')}
    <div class="chips wrap" id="frags">${FRAGS.map(f => `<button class="chip" data-act="pickFrag" data-arg="${esc(f)}">${ic('drop').replace('<svg', '<svg width="15" height="15"')}${esc(f)}</button>`).join('')}</div>
    <label class="field"><span>Código de la factura (opcional)</span><input class="input" id="fragCode" maxlength="16" placeholder="Ej. VLZ-0425"></label>
    <div class="err" id="errFrag"></div>
    <button class="btn go block" style="margin-top:8px" data-act="doAroma">Registrar<span class="ar">${ic('check')}</span></button>`);
}
let SCAN = null;
function stopScan() { if (SCAN) { SCAN.stop = true; SCAN.stream?.getTracks().forEach(t => t.stop()); SCAN = null; } }
async function scanSheet() {
  if (!('BarcodeDetector' in window) || !navigator.mediaDevices?.getUserMedia) {
    openSheet(`${shHead('Escanear QR')}<div class="empty"><b class="h3">Usa la cámara de tu celular</b><p class="sub">Apunta la cámara al código del look: se abrirá aquí mismo con la lista de prendas que necesitas.</p></div>
      ${S.looks.length ? `<button class="btn block" style="margin-top:12px" data-act="qr" data-arg="${S.looks[0].id}">${ic('qr')}Ver el código de mi último look</button>` : ''}`);
    return;
  }
  openSheet(`${shHead('Escanear QR', 'Apunta al código de un look.')}<div class="scanner"><video id="scanVid" playsinline muted></video></div>`);
  try {
    const stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:'environment'}}); const v = $('#scanVid'); v.srcObject = stream; await v.play();
    const det = new BarcodeDetector({formats:['qr_code']}); SCAN = {stream};
    const loop = async () => { if (!SCAN || SCAN.stop) return; try { const r = await det.detect(v); const hit = r.find(x => (x.rawValue || '').includes('#/look/'));
      if (hit) { const code = hit.rawValue.split('#/look/')[1]; closeSheet(); location.hash = '#/look/' + code; return; } } catch (e) {} requestAnimationFrame(loop); };
    loop();
  } catch (e) { closeSheet(); toast('No pudimos abrir la cámara'); }
}

/* imagen para compartir */
async function lookPNG(l) {
  try { await document.fonts.ready; } catch (e) {}
  const W = 1080, H = 1350, k = K[l.g]; const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  x.fillStyle = '#F5F4F0'; x.fillRect(0, 0, W, H);
  x.strokeStyle = 'rgba(29,27,34,.06)'; x.lineWidth = 2; for (let i = 0; i < W; i += 54) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, H); x.stroke(); } for (let i = 0; i < H; i += 54) { x.beginPath(); x.moveTo(0, i); x.lineTo(W, i); x.stroke(); }
  const rr = (X, Y, w, h, r) => { x.beginPath(); x.roundRect ? x.roundRect(X, Y, w, h, r) : x.rect(X, Y, w, h); };
  x.fillStyle = whereOf(l.where).c; rr(60, 150, 960, 1000, 60); x.fill(); x.lineWidth = 5; x.strokeStyle = '#252525'; x.stroke();
  const fv = fullView(l.g); const fh = 980, fw = fh * fv[2] / fv[3];
  const svg = avatarSVG(l, {w:Math.round(fw), h:fh});
  const img = new Image(); const url = URL.createObjectURL(new Blob([svg], {type:'image/svg+xml'}));
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = url; });
  x.save(); x.lineWidth = 6; x.lineCap = 'round'; x.strokeStyle = '#1A2055'; x.setLineDash([3, 22]); x.beginPath(); x.moveTo(500, 1120); x.bezierCurveTo(640, 980, 520, 520, 880, 300); x.stroke();
  x.setLineDash([]); x.strokeStyle = '#9C0720'; x.beginPath(); x.moveTo(1010, 1080); x.bezierCurveTo(930, 900, 1000, 560, 900, 420); x.stroke(); x.restore();
  x.drawImage(img, 1020 - fw - 30, 165, fw, fh); URL.revokeObjectURL(url);
  x.fillStyle = '#252525'; x.font = '48px "Bebas Neue", sans-serif'; x.fillText('VÉLEZ UP', 60, 104); x.fillStyle = '#9C0720'; x.fillRect(60, 116, 70, 6); x.fillStyle = '#252525';
  x.font = '92px "Bebas Neue", sans-serif';
  const words = (l.name || 'Mi look').split(' '); let line = '', yy = 270; const maxW = 1020 - fw - 140;
  for (const w of words) { const t = line ? line + ' ' + w : w; if (x.measureText(t).width > maxW && line) { x.fillText(line, 110, yy); yy += 84; line = w; } else line = t; }
  x.fillText(line, 110, yy);
  x.font = '700 30px "Glacial Indifference", sans-serif'; const wl = whereOf(l.where).label;
  x.fillStyle = '#FFFFFF'; rr(110, yy + 34, x.measureText(wl).width + 56, 56, 28); x.fill(); x.stroke();
  x.fillStyle = '#252525'; x.fillText(wl, 138, yy + 72);
  x.fillStyle = '#9C0720'; rr(110, 930, 300, 120, 60); x.fill(); x.fillStyle = '#FFFFFF';
  x.font = '700 76px Fredoka, sans-serif'; x.fillText(score(l.items) + '%', 150, 1017);
  x.fillStyle = '#252525'; x.font = '700 32px "Glacial Indifference", sans-serif'; x.fillText('de tendencia', 120, 1100);
  x.font = '700 26px "Glacial Indifference", sans-serif'; x.fillStyle = '#4B4A48'; x.fillText('@' + (S.profile?.name || 'velezup') + ' · Tu estilo toma vuelo', 60, 1240);
  x.font = '400 22px "Glacial Indifference", sans-serif'; x.fillStyle = '#8A8884'; x.fillText('Proyecto universitario · no es app oficial de Vélez', 60, 1290);
  return new Promise(res => c.toBlob(res, 'image/png'));
}
async function downloadLook(l) {
  const blob = await lookPNG(l); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = (l.name || 'look').replace(/[^\w\-]+/g, '_') + '.png';
  document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); sharedPts();
}
function sharedPts() { if (!S.flags.shared) { S.flags.shared = true; save(); addPts(PTS.share, 'Compartiste tu look'); } }

/* ---------------------------------------------------------------------
   ACCIONES
   --------------------------------------------------------------------- */
const A = {
  close: () => closeSheet(),
  regG: g => { REG.name = $('#regName')?.value || REG.name; if (REG.g !== g) { REG.g = g; REG.head = 0; REG.hair = null; REG.style = null; } render(); },
  regNext: step => {
    if (step === '1') {
      REG.name = ($('#regName')?.value || '').trim();
      let ok = true;
      if (!REG.name) { $('#errName').textContent = 'Escribe tu apodo o nombre para seguir.'; ok = false; }
      if (!REG.g) { $('#errG').textContent = 'Elige si tu avatar es mujer u hombre.'; ok = false; }
      if (ok) go('/registro/2');
    } else go('/registro/3');
  },
  regStyle: s => { REG.style = s; render(); },
  regDone: () => {
    const isNew = !S.profile;
    S.profile = {name:REG.name.trim(), g:REG.g, head:REG.head || 0, skin:REG.skin || 0, hair:REG.hair || null, fit:REG.fit || {w:1, h:1}, expr:REG.expr ?? null, lips:REG.lips || null, style:REG.style, since:Date.now()};
    const basic = BASIC[REG.g][REG.style]; basic.forEach(id => { if (!S.closet.includes(id)) S.closet.push(id); });
    S.look = {}; basic.forEach(id => setPiece(S.look, id)); REG = null; save();
    go('/inicio'); if (isNew) setTimeout(() => addPts(PTS.welcome, (S.profile.g === 'm' ? '¡Bienvenido' : '¡Bienvenida') + ' a Vélez Up!'), 400);
  },
  avHead: a => { const [ctx, i] = a.split(':'); avSet(ctx, 'head', +i); },
  avSkin: a => { const [ctx, i] = a.split(':'); avSet(ctx, 'skin', +i); },
  avHair: a => { const [ctx, i] = a.split(':'); avSet(ctx, 'hair', HAIR[+i]); },
  avExpr: a => { const [ctx, i] = a.split(':'); avSet(ctx, 'expr', +i < 0 ? null : +i); },
  avLips: a => { const [ctx, i] = a.split(':'); avSet(ctx, 'lips', LIPS[+i]); },
  meStyle: s => { S.profile.style = s; save(); render(); },
  meG: g => { if (S.profile.g === g) return; S.profile.g = g; S.profile.head = 0; const items = {}; Object.values(S.look).forEach(id => { if (assetKey(CAT[id], g)) setPiece(items, id); }); S.look = items; save(); render(); toast('Avatar actualizado'); },
  // creador
  cycle: a => { const [z, d] = a.split(':'); cycle(z, +d); },
  zone: z => { S.zone = z; save(); render(true); const o = $('#opts .opt.on'); if (o) o.scrollIntoView({block:'nearest', inline:'center'}); },
  pick: a => { const [z, id] = a.split(':'); applyChange(() => { if (id) setPiece(S.look, id); else delete S.look[z]; S.zone = z; CR.last = z; }); },
  pickZoneAt: (a, el, ev) => {
    const g = myG(), fv = fullView(g), r = el.getBoundingClientRect(); const y = fv[1] + (ev.clientY - r.top) / (r.height / fv[3]);
    const rows = zoneRows(g, meLook()); let best = 'top', d = 1e9;
    for (const Z of ZONES) { const dd = Math.abs(rows[Z.z] - y); if (dd < d) { d = dd; best = Z.z; } }
    A.zone(best);
  },
  scoreInfo: () => scoreSheet(),
  goZone: z => { closeSheet(); S.zone = z; if (!zoneList(z).length) S.src = 'all'; save(); if (parse().r === 'crear') render(true); else go('/crear'); },
  tryCombo: a => { const [id, x] = a.split('|'); setPiece(S.look, id); if (x) setPiece(S.look, x); S.zone = zoneOf(id); if (!owned(id) || (x && !owned(x))) S.src = 'all'; save(); closeSheet(); go('/crear'); },
  src: s => { S.src = s; save(); render(); },
  roulette: () => {
    const g = myG(); let pool = poolFor(g, S.src); if (pool.length < 3) { pool = poolFor(g, 'all'); if (S.src === 'mine') toast('Tu armario es pequeño: usamos todo el catálogo'); }
    const btn = $('#rouBtn'); btn?.classList.add('spin');
    let t = 0; const fig = $('#fig');
    const tick = () => { const items = {}; Object.values(randomLook(g, pool, Math.random, S.src === 'all')).forEach(id => setPiece(items, id));
      if (fig) fig.innerHTML = avatarSVG(meLook(items));
      if (++t < 9) setTimeout(tick, 70 + t * 14); else { applyChange(() => { S.look = items; CR.last = null; }); } };
    tick();
  },
  clean: () => { const b = BASIC[myG()][S.profile.style] || []; S.look = {}; b.forEach(id => setPiece(S.look, id)); CR.last = null; save(); render(); toast('Volviste a tu look básico'); },
  empty: () => { S.look = {}; CR.last = null; save(); render(); toast('Avatar sin prendas'); },
  saveLook: () => { if (!Object.keys(S.look).length) return toast('Ponle al menos una prenda'); saveSheet(); },
  pickWhere: w => { document.querySelectorAll('#lkWhere .chip').forEach(c => c.classList.toggle('on', c.dataset.arg === w)); A._where = w; },
  doSave: () => {
    if (!A._where) { $('#errWhere').textContent = 'Elige para dónde es el look.'; return; }
    const name = ($('#lkName').value || '').trim() || 'Mi look';
    const l = {id:'lk' + Date.now().toString(36), name, where:A._where, items:{...S.look}, g:myG(), head:S.profile.head, skin:S.profile.skin, hair:S.profile.hair, fit:S.profile.fit || null, expr:S.profile.expr ?? null, lips:S.profile.lips || null, date:Date.now(), published:false, likes:0};
    S.looks.unshift(l); A._where = null; save();
    addPts(PTS.save + (score(l.items) >= 85 ? PTS.trend : 0), score(l.items) >= 85 ? 'Look en tendencia guardado' : 'Look guardado');
    badge('primer-look'); if (score(l.items) >= 85) badge('tendencia'); checkReto();
    savedSheet(l);
  },
  another: () => { closeSheet(); S.look = {}; CR.last = null; save(); go('/crear'); render(); toast('Lienzo listo para tu próximo look'); },
  randomHome: () => { const g = myG(); const pool = poolFor(g, S.closet.length >= 3 ? 'mine' : 'all'); S.look = {}; Object.values(randomLook(g, pool)).forEach(id => setPiece(S.look, id)); save(); render(); },
  // descubre
  cat: c => { DS.cat = c; render(); },
  who: w => { DS.who = w; render(); },
  own: id => {
    const i = S.closet.indexOf(id);
    if (i >= 0) { S.closet.splice(i, 1); toast('Quitada de tu armario'); }
    else { S.closet.push(id); const k = 'own_' + id; if (!S.flags[k]) { S.flags[k] = 1; S.points += PTS.own; } toast(CAT[id].name + ' en tu armario', '+' + PTS.own);
      if (S.closet.filter(x => CAT[x]?.line !== 'flyup').length >= 5) badge('coleccion'); }
    save(); updateTop();
    if ($('#sheet').classList.contains('on') && !location.hash.startsWith('#/look')) { const open = $('#sheet [data-act="tryOn"]'); if (open) productSheet(id); }
    render(true);
  },
  product: id => productSheet(id),
  tryOn: id => { setPiece(S.look, id); CR.last = zoneOf(id); S.zone = CR.last; if (!owned(id)) S.src = 'all'; save(); closeSheet(); go('/crear'); },
  claim: id => {
    const r = REWARDS.find(x => x.id === id); if (!r || S.claimed.includes(id)) return;
    if (S.points < r.cost) return toast(`Te faltan ${r.cost - S.points} puntos`);
    S.points -= r.cost; S.claimed.push(id); if (!owned(r.item)) S.closet.push(r.item); save(); updateTop(); render(true);
    openSheet(`${shHead('¡Recompensa reclamada!')}<div class="okcard c-sand"><div class="av" style="height:140px;align-items:center">${thumbSVG(r.item)}</div><div><b class="h3">${esc(r.label)}</b><p class="tiny" style="margin:8px 0">Muestra este código en la tienda para recogerla:</p><span class="tag ink fun" style="font-size:16px;height:32px">VUP-${id.slice(2, 6).toUpperCase()}-${(S.points % 997).toString().padStart(3, '0')}</span></div></div>
      <p class="tiny mute" style="margin-top:10px">Ya está en tu armario para usarla en tus looks.</p>`);
  },
  retoInfo: (a, el, ev) => { ev.preventDefault(); openSheet(`${shHead('Reto de ' + RETO.month, RETO.title)}<p class="sub">${RETO.text}</p>
    <div class="list">${RETO.need.map(w => { const done = S.looks.some(l => l.where === w); return `<div class="it"><span class="ic" style="background:${whereOf(w).c};padding:10px">${done ? ic('check') : ic('hanger')}</span><span class="c"><b>Look para ${whereOf(w).label.toLowerCase()}</b><span>${done ? 'Listo' : 'Pendiente'}</span></span></div>`; }).join('')}</div>
    <p class="tiny mute" style="margin-top:10px">Premio: ${PTS.reto} puntos e insignia «Reto del mes».</p><a class="btn go block" style="margin-top:12px" href="#/crear" data-act="close">Crear un look<span class="ar">${ic('arrow')}</span></a>`); },
  toRewards: (a, el, ev) => { ev.preventDefault(); go('/descubre'); setTimeout(() => $('#recompensas')?.scrollIntoView({behavior:'smooth'}), 80); },
  // comunidad
  cmf: f => { CM.f = f; render(); },
  openLook: id => lookSheet(id),
  like: (id, el, ev) => { ev.stopPropagation(); const i = S.liked.indexOf(id); if (i >= 0) S.liked.splice(i, 1); else S.liked.push(id); save(); el.classList.toggle('on', i < 0); },
  tryCommunity: id => { const l = communityLooks().find(x => x.id === id); if (!l) return; const g = myG(); S.look = {}; Object.values(l.items).forEach(pid => { if (assetKey(CAT[pid], g)) setPiece(S.look, pid); }); S.src = 'all'; CR.last = null; save(); closeSheet(); go('/crear'); toast('Así se te ve este look'); },
  tryLook: code => { const l = decodeLook(code); if (!l) return; S.look = {}; Object.values(l.items).forEach(pid => { if (assetKey(CAT[pid], myG())) setPiece(S.look, pid); }); S.src = 'all'; save(); go('/crear'); },
  // armario
  artab: t => { AR.tab = t; render(); },
  editLook: id => { const l = S.looks.find(x => x.id === id); if (!l) return; S.look = {...l.items}; save(); closeSheet(); go('/crear'); },
  publish: id => { const l = S.looks.find(x => x.id === id); if (!l) return; l.published = !l.published; save();
    if (l.published) { if (!S.flags['pub_' + id]) { S.flags['pub_' + id] = 1; addPts(PTS.publish, 'Publicado en Comunidad'); } badge('comunidad'); } else toast('Look retirado de Comunidad');
    lookSheet(id); render(true); },
  delLook: id => { S.looks = S.looks.filter(x => x.id !== id); save(); closeSheet(); render(); toast('Look eliminado'); },
  // compartir
  shareNative: async id => {
    const l = S.looks.find(x => x.id === id) || communityLooks().find(x => x.id === id); if (!l) return;
    const url = lookURL(l);
    try { const blob = await lookPNG(l); const file = new File([blob], 'look-velez-up.png', {type:'image/png'});
      if (navigator.canShare && navigator.canShare({files:[file]})) { await navigator.share({files:[file], title:l.name, text:`Mi look "${l.name}" en Vélez Up · ${url}`}); sharedPts(); return; }
      if (navigator.share) { await navigator.share({title:l.name, text:`Mi look "${l.name}" en Vélez Up`, url}); sharedPts(); return; }
      downloadLook(l);
    } catch (e) { if (e && e.name !== 'AbortError') downloadLook(l); }
  },
  shared: () => sharedPts(),
  download: id => { const l = S.looks.find(x => x.id === id); if (l) downloadLook(l); },
  copyLink: async id => { const l = S.looks.find(x => x.id === id); if (!l) return; try { await navigator.clipboard.writeText(lookURL(l)); toast('Enlace copiado'); } catch (e) { prompt('Copia el enlace', lookURL(l)); } sharedPts(); },
  qr: id => qrSheet(id),
  // vive
  aroma: () => aromaSheet(),
  pickFrag: f => { document.querySelectorAll('#frags .chip').forEach(c => c.classList.toggle('on', c.dataset.arg === f)); A._frag = f; },
  doAroma: () => {
    if (!A._frag) { $('#errFrag').textContent = 'Elige el aroma que compraste.'; return; }
    const before = aromaCount(); S.frag.push({name:A._frag, code:($('#fragCode').value || '').trim(), date:Date.now()}); A._frag = null; save(); closeSheet();
    let bonus = 0; OLFATO.forEach(m => { if (before < m.n && aromaCount() >= m.n) bonus += m.pts; });
    addPts(PTS.aroma + bonus, bonus ? '¡Desbloqueaste un premio de Olfato!' : 'Aroma registrado');
    if (aromaCount() >= 3) badge('olfato'); render(true);
  },
  olfatoPrenda: () => {
    const g = myG(); const opts = CAT_LIST.map(r => CAT[r[0]]).filter(it => (it.g === g || it.g === 'u') && ['top','bottom','outer','bag','belt'].includes(it.z) && !owned(it.id)).slice(0, 8);
    openSheet(`${shHead('Elige tu prenda', 'Premio por 5 aromas registrados')}<div class="grid2">${opts.map((it, i) => `<button class="prod" data-act="olfatoPick" data-arg="${it.id}"><span class="th" style="background:${PALETTE[i % PALETTE.length]}">${thumbSVG(it.id)}</span><span class="inf"><b>${esc(it.name)}</b></span></button>`).join('')}</div>`);
  },
  olfatoPick: id => { S.flags.olfatoPrenda = id; if (!owned(id)) S.closet.push(id); save(); closeSheet(); render(true); toast(CAT[id].name + ' es tuya. Recógela en tienda'); },
  scan: () => scanSheet(),
  // perfil
  about: () => openSheet(`${shHead('Acerca de Vélez Up')}<p class="sub">Prototipo académico de Gestión del Diseño 2 (Taller 5): una app de estilismo digital donde tu avatar se viste con las prendas Vélez y Fly Up que ya tienes.</p>
    <p class="sub">Concepto: <b>Elegancia + Urbano = Tendencia</b>. El porcentaje de tendencia mide qué tan completo y balanceado está tu look.</p>
    <p class="tiny mute">Proyecto universitario sin fines comerciales; no es una app oficial de Vélez. Las marcas se usan como inspiración. Ilustraciones vectoriales con licencia de Envato Elements.</p>`),
  reset: () => { if (!confirm('¿Borrar tu perfil, looks y puntos de este dispositivo?')) return; localStorage.removeItem(KEY); S = fresh(); REG = null; go('/bienvenida'); render(); }
};
function avSet(ctx, key, val) {
  if (ctx === 'reg') { REG[key] = val; }
  else { S.profile[key] = val; save(); updateTop(); }
  render(true);
}

/* ---------------------------------------------------------------------
   ROUTER
   --------------------------------------------------------------------- */
function go(path) { if (location.hash !== '#' + path) location.hash = '#' + path; else render(); }
function parse() { const h = location.hash.replace(/^#\/?/, ''); const [path] = h.split('?'); const [r, ...rest] = path.split('/'); return {r:r || '', arg:rest.join('/')}; }
let lastRoute = '';
function render(keepScroll) {
  let {r, arg} = parse();
  if (!S.profile && !['bienvenida','registro','look'].includes(r)) r = 'bienvenida';
  if (S.profile && (r === '' || r === 'bienvenida')) r = 'inicio';
  if (S.profile && r === 'registro' && !REG) r = 'inicio';
  const fn = V[r] || V.inicio;
  const y = scrollY; const out = fn(arg);
  const view = $('#view'); view.className = out.full ? 'full' : ''; view.innerHTML = out.html;
  updateTop(); updateTabs(r);
  if (keepScroll && lastRoute === r) scrollTo(0, y); else if (lastRoute !== r) scrollTo(0, 0);
  lastRoute = r;
  const q = $('#q'); if (q) q.oninput = e => { DS.q = e.target.value; const pos = e.target.selectionStart; render(true); const nq = $('#q'); nq.focus(); nq.setSelectionRange(pos, pos); };
  const mn = $('#meName'); if (mn) mn.onchange = e => { const v = e.target.value.trim(); if (!v) { e.target.value = S.profile.name; return toast('El apodo no puede quedar vacío'); } S.profile.name = v; save(); updateTop(); toast('Nombre actualizado'); };
  const rn = $('#regName'); if (rn) rn.oninput = e => { REG.name = e.target.value; const er = $('#errName'); if (er) er.textContent = ''; };
}
document.addEventListener('click', e => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const fn = A[el.dataset.act]; if (!fn) return;
  if (el.tagName === 'BUTTON' || el.getAttribute('role') === 'button') e.preventDefault();
  fn(el.dataset.arg, el, e);
});
document.addEventListener('input', e => {
  const r = e.target.closest('[data-range]'); if (!r) return;
  const [ctx, key] = r.dataset.range.split(':'); const obj = ctx === 'reg' ? REG : S.profile;
  obj.fit = {...(obj.fit || {w:1, h:1}), [key]:+r.value / 100};
  const look = ctx === 'reg' ? regLook() : meLook(); const pv = $('#avPrev'); if (pv) pv.querySelector('svg').outerHTML = avatarSVG(look);
  const f = obj.fit; const lw = $('#lblW'), lh = $('#lblH');
  if (lw) lw.textContent = f.w < .93 ? 'Delgada' : f.w < 1.04 ? 'Media' : f.w < 1.11 ? 'Atlética' : 'Robusta';
  if (lh) lh.textContent = f.h < .97 ? 'Baja' : f.h < 1.02 ? 'Media' : 'Alta';
});
document.addEventListener('change', e => { const r = e.target.closest('[data-range]'); if (!r) return; if (r.dataset.range.startsWith('me')) { save(); updateTop(); } });
$('#veil').addEventListener('click', closeSheet);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeSheet(); });
addEventListener('hashchange', () => { closeSheet(); render(); });
let rT; addEventListener('resize', () => { clearTimeout(rT); rT = setTimeout(() => { if (parse().r === 'crear') render(true); }, 200); });
render();
