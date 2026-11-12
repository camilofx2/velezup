/* Vélez Up · Probador — avatar con la cara y accesorios puestos, sin IA de pago.
   - Detecta la cara de la selfie en el navegador (MediaPipe FaceLandmarker, se carga solo al usarla).
   - Pega esa cara sobre cada foto del modelo, alineada por ojos y boca (window.CUERPOS).
   - Pone las capas de accesorios (window.CAPAS) medidas sobre la foto base del modelo.
   Todo ocurre en el dispositivo: la foto no sale del celular. */
'use strict';

const Compose = (() => {
  const MP = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.14';
  const MODEL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task';
  const OVAL = [10, 338, 297, 332, 284, 251, 389, 356, 454, 323, 361, 288, 397, 365, 379, 378, 400, 377,
    152, 148, 176, 149, 150, 136, 172, 58, 132, 93, 234, 127, 162, 21, 54, 103, 67, 109];
  const ORDER = ['feet', 'hand', 'face', 'eyes', 'head'];   // zapatos, bolso/maleta, cara, gafas, gorra
  const COLOR_MIX = .6;                                      // cuánto se acerca la piel de la cara a la del modelo

  /* ---------- imágenes ---------- */
  const imgs = new Map();
  const loadImage = src => {
    if (!imgs.has(src)) imgs.set(src, new Promise((res, rej) => {
      const im = new Image(); im.decoding = 'async';
      im.onload = () => res(im); im.onerror = () => { imgs.delete(src); rej(new Error('No se pudo cargar ' + src)); };
      im.src = src;
    }));
    return imgs.get(src);
  };
  const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };

  /* ---------- geometría ---------- */
  /* similitud (escala, giro, traslación) por mínimos cuadrados que lleva src → dst: x' = a·x − b·y + tx */
  function similarity(src, dst) {
    const n = src.length;
    const ms = src.reduce((m, p) => [m[0] + p[0] / n, m[1] + p[1] / n], [0, 0]);
    const md = dst.reduce((m, p) => [m[0] + p[0] / n, m[1] + p[1] / n], [0, 0]);
    let sxx = 0, sxy = 0, ss = 0;
    src.forEach((p, i) => {
      const x = p[0] - ms[0], y = p[1] - ms[1], u = dst[i][0] - md[0], v = dst[i][1] - md[1];
      sxx += x * u + y * v; sxy += x * v - y * u; ss += x * x + y * y;
    });
    const a = sxx / ss, b = sxy / ss;
    return {a, b, tx:md[0] - (a * ms[0] - b * ms[1]), ty:md[1] - (b * ms[0] + a * ms[1])};
  }
  const apply = (t, p) => [t.a * p[0] - t.b * p[1] + t.tx, t.b * p[0] + t.a * p[1] + t.ty];
  const px = (p, W, H) => [p[0] * W, p[1] * H];
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1]);

  /* ---------- detección de la cara (selfie) ---------- */
  let landmarker = null;
  async function detector() {
    if (!landmarker) landmarker = (async () => {
      const {FilesetResolver, FaceLandmarker} = await import(`${MP}/vision_bundle.mjs`);
      const files = await FilesetResolver.forVisionTasks(`${MP}/wasm`);
      const opts = gpu => ({baseOptions:{modelAssetPath:MODEL, delegate:gpu ? 'GPU' : 'CPU'}, runningMode:'IMAGE', numFaces:2});
      try { return await FaceLandmarker.createFromOptions(files, opts(true)); }
      catch { return FaceLandmarker.createFromOptions(files, opts(false)); }
    })().catch(e => { landmarker = null; throw e; });
    return landmarker;
  }
  /* devuelve la cara recortada (dataURL) con sus puntos en píxeles del recorte */
  async function readFace(source) {
    let fl;
    try { fl = await detector(); }
    catch { throw new Error('No pudimos cargar el detector de caras. Revisa tu conexión e intenta de nuevo.'); }
    const W = source.naturalWidth || source.videoWidth || source.width, H = source.naturalHeight || source.videoHeight || source.height;
    const res = fl.detect(source);
    const faces = res.faceLandmarks || [];
    if (!faces.length) throw new Error('No encontramos tu cara. Mira de frente a la cámara, con buena luz y sin gafas de sol.');
    if (faces.length > 1) throw new Error('Hay más de una cara en la foto. Tómala solo tú.');
    const L = faces[0], P = i => [L[i].x * W, L[i].y * H];
    const le = P(468), re = P(473), mo = [(P(13)[0] + P(14)[0]) / 2, (P(13)[1] + P(14)[1]) / 2], nose = P(1);
    const eyes = dist(le, re);
    if (eyes < 28) throw new Error('Tu cara se ve muy pequeña. Acércate un poco a la cámara.');
    const mid = [(le[0] + re[0]) / 2, (le[1] + re[1]) / 2];
    if (Math.abs(nose[0] - mid[0]) / eyes > .22) throw new Error('Gira un poco la cara: mira de frente a la cámara.');
    if (Math.abs(Math.atan2(re[1] - le[1], re[0] - le[0])) > .35) throw new Error('Endereza la cabeza: los ojos deben quedar a la misma altura.');
    const oval = OVAL.map(P);
    const xs = oval.map(p => p[0]), ys = oval.map(p => p[1]);
    const w = Math.max(...xs) - Math.min(...xs), h = Math.max(...ys) - Math.min(...ys);
    const x0 = Math.max(0, Math.min(...xs) - w * .35), y0 = Math.max(0, Math.min(...ys) - h * .35);
    const x1 = Math.min(W, Math.max(...xs) + w * .35), y1 = Math.min(H, Math.max(...ys) + h * .3);
    const k = Math.min(1, 640 / Math.max(x1 - x0, y1 - y0));
    const c = canvas(Math.round((x1 - x0) * k), Math.round((y1 - y0) * k));
    c.getContext('2d').drawImage(source, x0, y0, x1 - x0, y1 - y0, 0, 0, c.width, c.height);
    const to = p => [(p[0] - x0) * k, (p[1] - y0) * k];
    return {img:c.toDataURL('image/jpeg', .92), le:to(le), re:to(re), mo:to(mo), oval:oval.map(to), at:Date.now()};
  }

  /* ---------- color: la cara se acerca a la piel del modelo ---------- */
  function stats(data, mask) {
    const m = [0, 0, 0], s = [0, 0, 0]; let n = 0;
    for (let i = 0; i < data.length; i += 4) {
      if (mask[i + 3] < 200) continue;
      n++; for (let c = 0; c < 3; c++) { m[c] += data[i + c]; s[c] += data[i + c] * data[i + c]; }
    }
    if (!n) return null;
    return m.map((v, c) => { const mean = v / n; return {mean, sd:Math.sqrt(Math.max(1, s[c] / n - mean * mean))}; });
  }

  /* ---------- pegar la cara ---------- */
  async function pasteFace(ctx, W, H, body, face) {
    const faceImg = await loadImage(face.img);
    const dst = ['le', 're', 'mo'].map(k => px(body.face[k], W, H));
    const t = similarity([face.le, face.re, face.mo], dst);
    const oval = body.face.oval.map(p => px(p, W, H));
    const cx = oval.reduce((a, p) => a + p[0], 0) / oval.length, cy = oval.reduce((a, p) => a + p[1], 0) / oval.length;
    const xs = oval.map(p => p[0]), ys = oval.map(p => p[1]);
    const fw = Math.max(...xs) - Math.min(...xs);
    /* zona de trabajo: el óvalo con margen */
    const pad = fw * .25, bx = Math.max(0, Math.floor(Math.min(...xs) - pad)), by = Math.max(0, Math.floor(Math.min(...ys) - pad));
    const bw = Math.min(W - bx, Math.ceil(Math.max(...xs) - Math.min(...xs) + 2 * pad)), bh = Math.min(H - by, Math.ceil(Math.max(...ys) - Math.min(...ys) + 2 * pad));
    /* la cara transformada */
    const fc = canvas(bw, bh), f = fc.getContext('2d');
    f.setTransform(t.a, t.b, -t.b, t.a, t.tx - bx, t.ty - by);
    f.drawImage(faceImg, 0, 0);
    f.setTransform(1, 0, 0, 1, 0, 0);
    /* máscara: óvalo del modelo, un poco reducido (conserva su mandíbula y su pelo) y difuminado */
    const mc = canvas(bw, bh), m = mc.getContext('2d');
    const shrinkX = .86, shrinkY = .95, lift = fw * .01;
    m.filter = `blur(${Math.max(2, fw * .06).toFixed(1)}px)`;
    m.beginPath();
    oval.forEach((p, i) => {
      const x = cx + (p[0] - cx) * shrinkX - bx, y = cy + (p[1] - cy) * shrinkY + lift - by;
      i ? m.lineTo(x, y) : m.moveTo(x, y);
    });
    m.closePath(); m.fillStyle = '#fff'; m.fill();
    /* corrección de color hacia la piel del modelo, medida en el mismo óvalo */
    const hard = canvas(bw, bh), hm = hard.getContext('2d');
    hm.beginPath(); oval.forEach((p, i) => { const x = cx + (p[0] - cx) * .7 - bx, y = cy + (p[1] - cy) * .75 - by; i ? hm.lineTo(x, y) : hm.moveTo(x, y); });
    hm.closePath(); hm.fillStyle = '#fff'; hm.fill();
    const maskData = hm.getImageData(0, 0, bw, bh).data;
    const target = stats(ctx.getImageData(bx, by, bw, bh).data, maskData);
    const fd = f.getImageData(0, 0, bw, bh), source = stats(fd.data, maskData);
    if (target && source) {
      const d = fd.data;
      for (let i = 0; i < d.length; i += 4) {
        if (!d[i + 3]) continue;
        for (let c = 0; c < 3; c++) {
          const v = d[i + c], moved = (v - source[c].mean) / source[c].sd * target[c].sd + target[c].mean;
          d[i + c] = Math.max(0, Math.min(255, v + COLOR_MIX * (moved - v)));
        }
      }
      f.putImageData(fd, 0, 0);
    }
    f.globalCompositeOperation = 'destination-in';
    f.drawImage(mc, 0, 0);
    ctx.drawImage(fc, bx, by);
  }

  /* ---------- capas de accesorios ---------- */
  function layerTransform(layer, base, body, Wb, Hb, W, H) {
    if (layer.kind === 'feet') {
      const ks = ['lheel', 'rheel', 'lt', 'rt'];
      return similarity(ks.map(k => px(base.pose[k], Wb, Hb)), ks.map(k => px(body.pose[k], W, H)));
    }
    if (layer.kind === 'hand') {
      /* una capa reflejada (segundo bolso) se dibuja en la otra mano */
      const w0 = px(base.pose[layer.side || 'rw'], Wb, Hb), w1 = px(body.pose[layer.mirror ? 'lw' : (layer.side || 'rw')], W, H);
      const s = dist(px(body.pose.ls, W, H), px(body.pose.rs, W, H)) / dist(px(base.pose.ls, Wb, Hb), px(base.pose.rs, Wb, Hb));
      return {a:s, b:0, tx:w1[0] - s * w0[0], ty:w1[1] - s * w0[1]};
    }
    const ks = ['le', 're', 'mo'];   // head y eyes: siguen la cara
    return similarity(ks.map(k => px(base.face[k], Wb, Hb)), ks.map(k => px(body.face[k], W, H)));
  }
  async function drawLayer(ctx, W, H, layer, base, body) {
    const im = await loadImage(layer.src);
    const [x, y, w, h] = layer.box;
    const Wb = W, Hb = H;
    const t = layerTransform(layer, base, body, Wb, Hb, W, H);
    ctx.save();
    ctx.setTransform(t.a, t.b, -t.b, t.a, t.tx, t.ty);
    if (layer.mirror) {   /* espejo alrededor de la muñeca de la foto base */
      const wx = px(base.pose[layer.side || 'rw'], Wb, Hb)[0];
      ctx.translate(wx, 0); ctx.scale(-1, 1); ctx.translate(-wx, 0);
    }
    ctx.drawImage(im, x * Wb, y * Hb, w * Wb, h * Hb);
    ctx.restore();
  }

  /* ---------- composición completa ---------- */
  /* src: foto del modelo; face: cara guardada o null; layers: [{id, src, kind, side, box}]; baseSrc: foto base del modelo
     (la base y las combinaciones de un modelo tienen el mismo tamaño, así que la caja de la capa se mide con W y H) */
  async function render({src, face, layers = [], baseSrc}) {
    const all = window.CUERPOS || {};
    const body = all[src], base = all[baseSrc];
    const im = await loadImage(src);
    const W = im.naturalWidth, H = im.naturalHeight;
    const c = canvas(W, H), ctx = c.getContext('2d', {willReadFrequently:true});
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, W, H); ctx.drawImage(im, 0, 0);
    if (!body?.face || !body?.pose) return src;          // sin medidas: la foto tal cual
    const baseBody = base?.face && base?.pose ? base : body;
    /* las gafas van debajo de la gorra */
    const kinds = layers.map(l => ({...l, kind:l.kind === 'head' && /-gaf-/.test(l.id || '') ? 'eyes' : l.kind}));
    /* bolso y maleta a la vez: la maleta pasa a la otra mano */
    const hands = kinds.filter(l => l.kind === 'hand');
    if (hands.length > 1) (hands.find(l => /-mal-/.test(l.id || '')) || hands[1]).mirror = true;
    for (const k of ORDER) {
      if (k === 'face') { if (face) await pasteFace(ctx, W, H, body, face); continue; }
      for (const l of kinds.filter(x => x.kind === k)) await drawLayer(ctx, W, H, l, baseBody, body);
    }
    return c.toDataURL('image/jpeg', .9);
  }

  return {readFace, render, loadImage, warm:detector};
})();
