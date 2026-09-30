import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, get, push, remove, update, set } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBa8QCypolo7ZpVkZYeaMcBtHvmsOjOVzk",
  authDomain: "despacho-retail.firebaseapp.com",
  databaseURL: "https://despacho-retail-default-rtdb.firebaseio.com",
  projectId: "despacho-retail",
  storageBucket: "despacho-retail.firebasestorage.app",
  messagingSenderId: "1011000908999",
  appId: "1:1011000908999:web:08c8630fab0c9537e0b2e2"
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const auth = getAuth(app);

const RUTA_BASE = 'despachos';
const RUTA_BITACORAS = 'bitacoras';
const CLAVE_ACCIONES = '1234';
const ADMIN_EMAILS = ['eduardo.donoso@ext.quintec.cl'];

const MESES_NOM = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
const DIAS_SEMANA = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const DIAS_SEMANA_CORTO = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const REGISTROS_POR_PAGINA_MODAL = 100;
const REGISTROS_POR_PAGINA_BD = 50;
const REGISTROS_POR_PAGINA_DESC = 30;
const OPCIONES_TRANSPORTE = ['MOVIL 1','MOVIL 2','MOVIL 3','MOVIL 4','MOVIL 5','MOVIL 6','DON RAUL','DON JOSE','SERVICIO AM/PM','SERVICIO B2C','SERVICIO ADM','SERVICIO QDM','SPOT','SPOT 1','SPOT 2','RETIRA CLIENTE','SERVICIO 3PL','TRANSGAMBOA'];
const OPCIONES_OBS = ['CASA CENTRAL','RETIRO','RETIRO CLIENTE','RETIRO CASA CENTRAL'];

const MOVILES_POR_TIPO = {
  ampm: [1,2,3,4,5,6,'spot','spot1','spot2'],
  b2c: [1,2,3,4,5,6,'spot','spot1','spot2'],
  adm: [1,2,3,4,5,6,'spot','spot1','spot2'],
  qdm: [1,2,3,4,5,6,'spot','spot1','spot2']
};

// =====================================================================
//  REGLA PM - Autocompletado por comuna (antes de 14:00)
// =====================================================================
const REGLA_PM = {
  'MOVIL 1': ['maipu','cerrillos','lo espejo','la cisterna','pedro aguirre cerda','el bosque','san bernardo','la florida','puente alto','san ramon'],
  'MOVIL 2': ['huechuraba','recoleta','quilicura','conchali','quinta normal','pudahuel','cerro navia','independencia','renca','lo prado','colina','lampa'],
  'MOVIL 3': ['providencia','nunoa','la reina','penalolen'],
  'MOVIL 4': ['las condes','vitacura','lo barnechea'],
  'MOVIL 5': ['santiago','estacion central','san joaquin','macul','san miguel']
};

// =====================================================================
//  REGLA AM - Autocompletado por comuna (después de 14:01, para el día siguiente)
// =====================================================================
const REGLA_AM = {
  1: { // Lunes AM
    'MOVIL 1': ['la reina','casa'],
    'MOVIL 2': ['norte','pudahuel','quinta normal','independencia','quilicura','renca','huechuraba','cerro navia','conchali','recoleta','lo prado'],
    'MOVIL 3': ['nunoa','egana','ñuñoa','providencia'],
    'MOVIL 4': ['alc','alto las condes','pa','parque arauco','las condes','vitacura','lo barnechea'],
    'MOVIL 5': ['maipu','alameda','santiago','san miguel'],
    'MOVIL 6': ['costanera','mut','las condes']
  },
  2: { // Martes AM
    'MOVIL 1': ['apmq','dom','dominicos','los dominicos','las condes','la reina','penalolen'],
    'MOVIL 2': ['dom','dehesa','la dehesa','trapenses','vitacura','lo barnechea'],
    'MOVIL 3': ['alc','alto las condes','pa','parque arauco','santiago','providencia'],
    'MOVIL 4': ['costanera','tobalaba','san bernardo','el bosque','puente alto'],
    'MOVIL 5': ['la florida','vespucio','la cisterna','lo espejo','san ramon','pedro aguirre cerda']
  },
  3: { // Miércoles AM
    'MOVIL 1': ['pa','parque arauco','casa','las condes'],
    'MOVIL 2': ['norte','pudahuel','quinta normal','independencia','quilicura','renca','huechuraba','cerro navia','conchali','recoleta','lo prado'],
    'MOVIL 3': ['mut','las condes','mut back','nunoa','providencia','santiago'],
    'MOVIL 4': ['alc','alto las condes','dom','dehesa','la dehesa','vitacura','lo barnechea'],
    'MOVIL 5': ['maipu','oeste','la cisterna','lo espejo','san ramon','pedro aguirre cerda','cerrillos'],
    'MOVIL 6': ['costanera','egana']
  },
  4: { // Jueves AM
    'MOVIL 1': ['nunoa','mut','las condes','providencia'],
    'MOVIL 2': ['huerfanos','santiago','nunoa'],
    'MOVIL 3': ['costanera','cc back','providencia','la reina','penalolen'],
    'MOVIL 4': ['alc','alto las condes','pa','parque arauco','las condes','vitacura','lo barnechea'],
    'MOVIL 5': ['tobalaba','san bernardo','el bosque','la florida','puente alto','la cisterna','lo espejo','san ramon','pedro aguirre cerda'],
    'MOVIL 6': ['vespucio','oeste']
  },
  5: { // Viernes AM
    'MOVIL 1': ['casa','pa','parque arauco','las condes'],
    'MOVIL 2': ['maipu','norte','pudahuel','quinta normal','independencia','quilicura','renca','huechuraba','cerro navia','conchali','recoleta','lo prado'],
    'MOVIL 3': ['costanera','mut','las condes','providencia','nunoa','santiago','san miguel'],
    'MOVIL 4': ['dom','dehesa','la dehesa','pie andino','las condes','vitacura','lo barnechea'],
    'MOVIL 5': ['egana','tobalaba','san bernardo','el bosque','la florida','puente alto','la cisterna','lo espejo','san ramon','pedro aguirre cerda'],
    'MOVIL 6': ['dom','dehesa','la dehesa','alc','alto las condes']
  }
};

function autocompletarTransportePM(reg) {
  if (!reg || !reg.comuna) return reg;
  const comunaNorm = normSinTildes(reg.comuna);
  for (const movil in REGLA_PM) {
    const comunas = REGLA_PM[movil];
    for (let i = 0; i < comunas.length; i++) {
      if (comunaNorm.includes(comunas[i]) || comunas[i].includes(comunaNorm)) {
        reg.transporte = movil;
        return reg;
      }
    }
  }
  return reg;
}

function autocompletarTransporteAM(reg, diaSemana) {
  if (!reg || !reg.comuna) return reg;
  const reglas = REGLA_AM[diaSemana];
  if (!reglas) return reg;
  const comunaNorm = normSinTildes(reg.comuna);
  for (const movil in reglas) {
    const comunas = reglas[movil];
    for (let i = 0; i < comunas.length; i++) {
      if (comunaNorm.includes(comunas[i]) || comunas[i].includes(comunaNorm)) {
        reg.transporte = movil;
        return reg;
      }
    }
  }
  return reg;
}

function esAntesDe1400() {
  const ahora = new Date();
  const horas = ahora.getHours();
  const minutos = ahora.getMinutes();
  const totalMinutos = horas * 60 + minutos;
  return totalMinutos < (14 * 60); // antes de 14:00
}

function esDespuesDe1401() {
  const ahora = new Date();
  const horas = ahora.getHours();
  const minutos = ahora.getMinutes();
  const totalMinutos = horas * 60 + minutos;
  return totalMinutos >= (14 * 60 + 1); // después de 14:01
}

function obtenerDiaSemanaManana() {
  const hoy = new Date();
  const manana = new Date(hoy);
  manana.setDate(hoy.getDate() + 1);
  return manana.getDay(); // 0=Domingo, 1=Lunes, ..., 6=Sábado
}

function esAdmin(email) { return ADMIN_EMAILS.includes((email || '').toLowerCase().trim()); }
let rolActual = 'operador';
const mSec = (location.hash || '').match(/sec=([a-z]+)/);
let seccionInicial = mSec ? mSec[1] : '';

let cache = {};
let pendientes = [];
let pendientesAMPM = [];
let pendientesADM = [];
let pendientesQDM = [];
let pendientesB2C = [];
let modoImportActual = '';
let seccionActiva = 'ampm';
let tabBdActiva = 'ampm';
let bitTabActiva = 'ampm';
let tipoBusquedaActual = 'AMPM';
let tipoImportacionActual = 'AMPM';
let tipoVerFechaActual = 'AMPM';
let datosModal = [];
let datosModalTotales = 0;
let paginaModalActual = 1;
let paginaBDAmpm = 1;
let paginaBDB2c = 1;
let paginaBDAdm = 1;
let paginaBDQdm = 1;
let paginaDesc = 1;
let tipoBorrarMes = 'AMPM';
let filtroDiaBD = { AMPM: '', B2C: '', ADM: '', QDM: '' };
let filtroMesBD = { AMPM: '', B2C: '', ADM: '', QDM: '' };
let filtroAnioBD = { AMPM: '', B2C: '', ADM: '', QDM: '' };
let filtroDescBD = {
  AMPM:  { unidad:'', comuna:'', transporte:'', rango:'' },
  B2C:   { unidad:'', comuna:'', transporte:'', rango:'' },
  ADM:   { unidad:'', comuna:'', transporte:'', rango:'' },
  QDM:   { unidad:'', comuna:'', transporte:'', rango:'' }
};
let seleccionadosDesc = new Set();
let keysVisiblesDesc = [];
let theadSeccion = '';
let theadBDConstruidos = {};
let comboAbierto = null;
let comboModalAbierto = null;
let comboBDAbierto = null;
let comboTransAbierto = null;
let comboObsAbierto = null;
let editandoKey = null;
let pwCallback = null;
let calendarioAbierto = false;
let calendarioMes = new Date().getMonth();
let calendarioAnio = new Date().getFullYear();
let calFilaAbierto = null;
let calFilaMes = null;
let calFilaAnio = null;
let cambiosFechaLocales = {};
let bitacorasData = {};
let bitacoraExportTipoActual = 'ampm';
let bitacoraJPEGTipoActual = 'ampm';
let bitacoraPrintTipoActual = 'ampm';

function toast(msg, tipo) { const t = document.getElementById('toast'); t.textContent = msg; t.className = 'toast show ' + tipo; setTimeout(function() { t.className = 'toast'; }, 3000); }
function fmtFecha(f) { if (!f) return ''; const p = f.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
function nombreDiaSemana(f) { if (!f) return ''; const p = f.split('-'); if (p.length !== 3) return ''; return DIAS_SEMANA[new Date(+p[0], +p[1]-1, +p[2]).getDay()] || ''; }
function fmtFechaConDia(f) { if (!f) return ''; const p = f.split('-'); const dS = nombreDiaSemana(f); return dS ? dS + ', ' + p[2] + '-' + p[1] + '-' + p[0] : p[2] + '-' + p[1] + '-' + p[0]; }
function formatoMoneda(v) { return '$' + (Number(v)||0).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function formatoMonedaAlineado(v) {
  const num = Number(v) || 0;
  const formateado = num.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return '<span class="valor-alineado">$' + formateado + '</span>';
}
function formatoEntero(v) { return Math.round(Number(v)||0).toLocaleString('es-CL'); }
function formatoPorcentaje(v) { return (Number(v)||0).toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %'; }
function getTipoRegistro(reg) { 
  if (reg.rango === 'B2C') return 'B2C';
  if (reg.rango === 'ADM') return 'ADM';
  if (reg.rango === 'QDM') return 'QDM';
  return 'AMPM'; 
}
function sumaValores(regs) { return regs.reduce(function(s,r) { return s + (((r.valor||0) === 1) ? 0 : (r.valor||0)); }, 0); }
function conteoUnPeso(regs) { return regs.filter(function(r) { return (r.valor||0) === 1; }).length; }
function sinTildes(s) { return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function normSinTildes(s) { return sinTildes(String(s||'').toLowerCase()); }
function normEnc(h) { return sinTildes(h).toUpperCase(); }
function normDir(d) { return sinTildes((d||'').toString().trim().toUpperCase()); }

const CANON_COMUNAS = ['Arica','Camarones','Putre','General Lagos','Iquique','Alto Hospicio','Pozo Almonte','Camiña','Colchane','Huara','Pica','Antofagasta','Mejillones','Sierra Gorda','Taltal','Calama','Ollagüe','San Pedro de Atacama','María Elena','Tocopilla','Copiapó','Caldera','Tierra Amarilla','Chañaral','Diego de Almagro','Vallenar','Alto del Carmen','Freirina','Huasco','La Serena','Coquimbo','Andacollo','La Higuera','Paiguano','Vicuña','Illapel','Canela','Los Vilos','Salamanca','Ovalle','Combarbalá','Monte Patria','Punitaqui','Río Hurtado','Valparaíso','Casablanca','Concón','Juan Fernández','Puchuncaví','Quintero','Viña del Mar','Isla de Pascua','Los Andes','Calle Larga','Rinconada','San Esteban','La Ligua','Cabildo','Papudo','Petorca','Zapallar','Quillota','La Calera','Hijuelas','La Cruz','Nogales','San Antonio','Algarrobo','Cartagena','El Quisco','El Tabo','Santo Domingo','San Felipe','Catemu','Llaillay','Panquehue','Putaendo','Santa María','Limache','Olmué','Quilpué','Villa Alemana','Santiago','Cerrillos','Cerro Navia','Conchalí','El Bosque','Estación Central','Huechuraba','Independencia','La Cisterna','La Florida','La Granja','La Pintana','La Reina','Las Condes','Lo Barnechea','Lo Espejo','Lo Prado','Macul','Maipú','Ñuñoa','Pedro Aguirre Cerda','Pudahuel','Quilicura','Quinta Normal','Recoleta','Renca','San Joaquín','San Miguel','San Ramón','Vitacura','Puente Alto','Pirque','San José de Maipo','Colina','Lampa','Tiltil','Buin','Calera de Tango','Paine','San Bernardo','Alhué','Curacaví','María Pinto','Melipilla','Padre Hurtado','Peñaflor','Talagante','El Monte','Isla de Maipo','Rancagua','Codegua','Coinco','Coltauco','Doñihue','Graneros','Las Cabras','Machalí','Malloa','Mostazal','Olivar','Peumo','Pichidegua','Quinta de Tilcoco','Rengo','Requínoa','San Vicente','Pichilemu','La Estrella','Litueche','Marchihue','Navidad','Paredones','San Fernando','Chépica','Chimbarongo','Lolol','Nancagua','Palmilla','Peralillo','Placilla','Pumanque','Santa Cruz','Talca','Constitución','Curepto','Empedrado','Maule','Pelarco','Pencahue','Río Claro','San Clemente','San Rafael','Cauquenes','Chanco','Pelluhue','Curicó','Hualañé','Licantén','Molina','Rauco','Romeral','Sagrada Familia','Teno','Vichuquén','Linares','Colbún','Longaví','Parral','Retiro','San Javier','Villa Alegre','Yerbas Buenas','Chillán','Chillán Viejo','Bulnes','Cobquecura','Coelemu','Coihueco','El Carmen','Ninhue','Ñiquén','Pemuco','Pinto','Portezuelo','Quillón','Quirihue','Ránquil','San Carlos','San Fabián','San Ignacio','San Nicolás','Treguaco','Yungay','Concepción','Coronel','Chiguayante','Florida','Hualpén','Hualqui','Lota','Penco','San Pedro de la Paz','Santa Juana','Talcahuano','Tomé','Arauco','Cañete','Contulmo','Curanilahue','Lebu','Los Álamos','Tirúa','Los Ángeles','Antuco','Cabrero','Laja','Mulchén','Nacimiento','Negrete','Quilaco','Quilleco','San Rosendo','Santa Bárbara','Tucapel','Yumbel','Alto Biobío','Temuco','Carahue','Cholchol','Cunco','Curarrehue','Freire','Gorbea','Lautaro','Loncoche','Melipeuco','Nueva Imperial','Padre Las Casas','Perquenco','Pitrufquén','Pucón','Saavedra','Teodoro Schmidt','Toltén','Vilcún','Villarrica','Angol','Collipulli','Curacautín','Ercilla','Lonquimay','Los Sauces','Lumaco','Purén','Renaico','Traiguén','Victoria','Valdivia','Corral','Lanco','Los Lagos','Máfil','Mariquina','Paillaco','Panguipulli','La Unión','Futrono','Lago Ranco','Río Bueno','Puerto Montt','Calbuco','Cochamó','Fresia','Frutillar','Llanquihue','Los Muermos','Maullín','Puerto Varas','Ancud','Castro','Chonchi','Curaco de Vélez','Dalcahue','Puqueldón','Queilén','Quellón','Quemchi','Quinchao','Osorno','Puerto Octay','Purranque','Puyehue','Río Negro','San Juan de la Costa','San Pablo','Chaitén','Futaleufú','Hualaihué','Palena','Coyhaique','Lago Verde','Aysén','Cisnes','Guaitecas','Cochrane','O\'Higgins','Tortel','Chile Chico','Río Ibáñez','Punta Arenas','Laguna Blanca','Río Verde','San Gregorio','Cabo de Hornos','Antártica','Porvenir','Primavera','Timaukel','Natales','Torres del Paine'];

const MAPA_COMUNAS = {};
CANON_COMUNAS.forEach(function(c) { MAPA_COMUNAS[sinTildes(c).toLowerCase()] = c; });

function canonComuna(t) { const t2 = String(t||'').trim(); if (!t2) return ''; const k = sinTildes(t2).toLowerCase(); return MAPA_COMUNAS[k] || t2.toLowerCase().replace(/(^|\s)\S/g, function(s) { return s.toUpperCase(); }); }

const COMUNAS_RM = ['SANTIAGO','PROVIDENCIA','NUNOA','LAS CONDES','VITACURA','LO BARNECHEA','MACUL','PENALOLEN','LA FLORIDA','PUENTE ALTO','SAN MIGUEL','SAN JOAQUIN','LA CISTERNA','SAN BERNARDO','EL BOSQUE','LA PINTANA','SAN RAMON','PEDRO AGUIRRE CERDA','LO ESPEJO','CERRILLOS','MAIPU','PUDAHUEL','RENCA','QUILICURA','CONCHALI','HUECHURABA','INDEPENDENCIA','RECOLETA','LA REINA','LO PRADO','QUINTA NORMAL','CERRO NAVIA','SAN PABLO','COLINA','LAMPA','PADRE HURTADO','TALAGANTE','PENAFLOR','BUIN','PAINE','CALERA DE TANGO','ISLA DE MAIPO','MELIPILLA','SAN JOSE DE MAIPO','PIRQUE','EL MONTE','CURACAVI','MARIA PINTA','ALHUE','TILTIL'];

function levenshtein(a, b) { if (a === b) return 0; if (!a.length) return b.length; if (!b.length) return a.length; let prev = Array.from({ length: b.length + 1 }, function(_, i) { return i; }); for (let i = 1; i <= a.length; i++) { const cur = [i]; for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j-1] + 1, prev[j-1] + (a[i-1] === b[j-1] ? 0 : 1)); } prev = cur; } return prev[b.length]; }
function similar(a, b) { if (a === b) return true; if (Math.abs(a.length - b.length) > 1) return false; return levenshtein(a, b) <= 1; }
function limpiarDireccion(dir, comuna) {
  const partes = String(dir || '').split(',').map(function(s) { return s.trim(); }).filter(function(s) { return s !== ''; });
  const nc = comuna ? sinTildes(String(comuna).trim().toUpperCase()) : '';
  return partes.filter(function(p) { const np = sinTildes(String(p).trim().toUpperCase()); return np !== 'CHILE' && !(nc && np === nc) && !COMUNAS_RM.some(function(c) { return similar(np, c); }); }).join(', ');
}
function dirDe(r) { return limpiarDireccion(r.direccion, r.comuna); }
function esExcel(n) { return /\.(xlsx|xls|xlsm|xlsb|ods)$/.test(n); }
function esCSV(n) { return /\.csv$/.test(n); }
function esJSON(n) { return /\.json$/.test(n); }

function parseCSVText(text) {
  const firstLine = text.split(/\r?\n/)[0] || '';
  const cTab = (firstLine.match(/\t/g) || []).length;
  const cPun = (firstLine.match(/;/g) || []).length;
  const cCom = (firstLine.match(/,/g) || []).length;
  let delim = ',';
  if (cTab >= cPun && cTab >= cCom) delim = '\t';
  else if (cPun > cCom) delim = ';';
  const rows = []; let row = [], cur = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQ) { if (ch === '"') { if (text[i+1] === '"') { cur += '"'; i++; } else inQ = false; } else cur += ch; }
    else { if (ch === '"') inQ = true; else if (ch === delim) { row.push(cur); cur = ''; } else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; } else if (ch !== '\r') cur += ch; }
  }
  if (cur !== '' || row.length) { row.push(cur); rows.push(row); }
  return rows.filter(function(r) { return r.some(function(c) { return String(c).trim() !== ''; }); });
}

function leerFilas(file, cb) {
  const n = file.name.toLowerCase();
  const reader = new FileReader();
  if (esCSV(n)) { reader.onload = function(e) { try { cb(parseCSVText(e.target.result)); } catch (e2) { toast('CSV inválido: ' + e2.message, 'err'); } }; reader.readAsText(file); }
  else { reader.onload = function(e) { try { const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true }); cb(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '', raw: true })); } catch (e2) { toast('Archivo inválido: ' + e2.message, 'err'); } }; reader.readAsArrayBuffer(file); }
}

function ordenarPorFechaDireccionId(regs) { regs.sort(function(a,b) { return (a.fecha||'').localeCompare(b.fecha||'') || normDir(dirDe(a)).localeCompare(normDir(dirDe(b))) || (a.idPedido||'').toString().localeCompare((b.idPedido||'').toString()); }); return regs; }
function ordenarPorFechaYId(regs) { regs.sort(function(a,b) { return (a.fecha||'').localeCompare(b.fecha||'') || (a.idPedido||'').toString().localeCompare((b.idPedido||'').toString()); }); return regs; }
function detectarDireccionesRepetidas(regs) { const c = {}; regs.forEach(function(r) { const d = normDir(dirDe(r)); if (d && r.fecha) { const k = r.fecha + '|' + d; c[k] = (c[k]||0)+1; } }); return c; }
function detectarIdsRepetidosPorFecha(regs) { const c = {}; regs.forEach(function(r) { const id = (r.idPedido||'').toString().trim().toUpperCase(); if (id && r.fecha) { const k = r.fecha + '|' + id; c[k] = (c[k]||0)+1; } }); return c; }
function detectarIdsRepetidosGlobal(regs) { const c = {}; regs.forEach(function(r) { const id = (r.idPedido||'').toString().trim().toUpperCase(); if (id) c[id] = (c[id]||0)+1; }); return c; }
function detectarMesAnioDesdeNombre(nombre) { const up = sinTildes(nombre).toUpperCase(); let mes = null, anio = null; for (let i = 0; i < MESES_NOM.length; i++) if (up.includes(MESES_NOM[i])) { mes = String(i+1).padStart(2,'0'); break; } if (!mes) { const c = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']; for (let i = 0; i < c.length; i++) if (up.includes(c[i])) { mes = String(i+1).padStart(2,'0'); break; } } const m = nombre.match(/(20\d{2})/); if (m) anio = m[1]; return { mes: mes, anio: anio }; }
function diaSemanaNumero(f) { if (!f) return 0; const p = f.split('-'); if (p.length !== 3) return 0; return new Date(+p[0], +p[1]-1, +p[2]).getDay(); }
function coincideClave(t, c) { const esc = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); return new RegExp('(^|[^a-z0-9])' + esc + '($|[^a-z0-9])').test(t); }
function parsearValor(v) { if (v === null || v === undefined || v === '') return 0; if (typeof v === 'number') return v; let s = String(v).trim().replace(/\s/g,'').replace(/[$€]/g,''); if (!s) return 0; if (s.includes(',') && s.includes('.')) { if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g,'').replace(',', '.'); else s = s.replace(/,/g,''); } else if (s.includes(',')) s = s.replace(',', '.'); else if (s.includes('.')) { const p = s.split('.'); if (p.length > 2) s = s.replace(/\./g,''); else if (p[1].length === 3) s = s.replace(/\./g,''); } s = s.replace(/[^\d.\-]/g,''); const n = parseFloat(s); return isNaN(n) ? 0 : n; }
function parsearFecha(raw) {
  if (raw instanceof Date) { if (isNaN(raw.getTime())) return null; return raw.getFullYear() + '-' + String(raw.getMonth()+1).padStart(2,'0') + '-' + String(raw.getDate()).padStart(2,'0'); }
  if (typeof raw === 'number') { const d = new Date(Math.round((raw - 25569) * 86400 * 1000)); if (isNaN(d.getTime())) return null; return d.getUTCFullYear() + '-' + String(d.getUTCMonth()+1).padStart(2,'0') + '-' + String(d.getUTCDate()).padStart(2,'0'); }
  if (typeof raw === 'string') { let s = raw.trim().replace(/[T\s]+\d{1,2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/i, '').trim(); let m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/); if (m) return m[1] + '-' + m[2].padStart(2,'0') + '-' + m[3].padStart(2,'0'); m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/); if (m) return m[3] + '-' + m[2].padStart(2,'0') + '-' + m[1].padStart(2,'0'); m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2})$/); if (m) { const a = parseInt(m[3]) > 50 ? '19' + m[3] : '20' + m[3]; return a + '-' + m[2].padStart(2,'0') + '-' + m[1].padStart(2,'0'); } const d = new Date(s); if (!isNaN(d.getTime())) return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
  return null;
}

function pedirClave(onOk) {
  pwCallback = onOk;
  const inp = document.getElementById('pwInput');
  if (inp) inp.value = '';
  document.getElementById('passwordOverlay').classList.add('show');
  setTimeout(function() { if (inp) inp.focus(); }, 60);
}

window.cerrarPassword = function() { pwCallback = null; document.getElementById('passwordOverlay').classList.remove('show'); };

window.confirmarPassword = function() {
  const inp = document.getElementById('pwInput');
  const v = inp ? inp.value : '';
  if (v !== CLAVE_ACCIONES) { toast('Contraseña incorrecta','err'); if (inp){ inp.value=''; inp.focus(); } return; }
  const cb = pwCallback;
  cerrarPassword();
  if (cb) cb();
};

function actualizarReloj() {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, '0');
  const minutos = String(ahora.getMinutes()).padStart(2, '0');
  const segundos = String(ahora.getSeconds()).padStart(2, '0');
  const dias = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const meses = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const diaSemana = dias[ahora.getDay()];
  const dia = String(ahora.getDate()).padStart(2, '0');
  const mes = meses[ahora.getMonth()];
  const anio = ahora.getFullYear();
  const elFecha = document.getElementById('relojFecha');
  const elHora = document.getElementById('relojHora');
  const elSeg = document.getElementById('relojSeg');
  if (elFecha) elFecha.textContent = diaSemana + ' ' + dia + ' ' + mes + ' ' + anio;
  if (elHora) elHora.textContent = horas + ':' + minutos;
  if (elSeg) elSeg.textContent = segundos;
}
setInterval(actualizarReloj, 1000);
actualizarReloj();

window.login = function() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  
  if (!email || !pass) { 
    toast('Ingresa email y contraseña', 'err'); 
    return; 
  }
  
  toast('Conectando...', 'info');
  
  setPersistence(auth, browserLocalPersistence).then(function() {
    return signInWithEmailAndPassword(auth, email, pass);
  }).then(function(userCredential) {
    toast('Bienvenido ' + email, 'ok');
  }).catch(function(error) {
    console.error('Error de login:', error);
    
    if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') {
      toast('Usuario no encontrado. Creando...', 'info');
      createUserWithEmailAndPassword(auth, email, pass).then(function(newUser) {
        toast('Usuario creado: ' + email, 'ok');
      }).catch(function(createError) {
        toast('No se pudo crear: ' + createError.message, 'err');
      });
      return;
    }
    
    if (error.code === 'auth/wrong-password') {
      toast('Contraseña incorrecta para ' + email, 'err');
      return;
    }
    
    if (error.code === 'auth/user-disabled') {
      toast('Usuario deshabilitado en Firebase', 'err');
      return;
    }
    
    if (error.code === 'auth/too-many-requests') {
      toast('Demasiados intentos. Espera un momento.', 'err');
      return;
    }
    
    toast('Error: ' + error.message, 'err');
  });
};

window.logout = function() { signOut(auth); };

onAuthStateChanged(auth, function(user) {
  if (user) {
    rolActual = esAdmin(user.email) ? 'admin' : 'operador';
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('appSection').style.display = 'flex';
    document.getElementById('userEmail').textContent = user.email + (rolActual === 'admin' ? '  (ADMIN)' : '');
    aplicarRol();
    cargarDatos().then(function() {
      if (seccionInicial === 'basedatos' || seccionInicial === 'informes' || seccionInicial === 'bitacoras') {
        cambiarSeccion(seccionInicial);
        seccionInicial = '';
      }
    });
  } else {
    rolActual = 'operador';
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('appSection').style.display = 'none';
  }
});

function aplicarRol() { 
  const t = document.querySelector('.seccion-tab[data-seccion="basedatos"]'); 
  const t2 = document.querySelector('.seccion-tab[data-seccion="informes"]');
  if (!t) return; 
  if (rolActual === 'admin') {
    t.style.display = '';
    if (t2) t2.style.display = '';
  } else { 
    t.style.display = 'none'; 
    if (t2) t2.style.display = 'none';
    if (seccionActiva === 'basedatos' || seccionActiva === 'informes') cambiarSeccion('ampm'); 
  } 
}

function tipoDeSeccion() {
  if (seccionActiva === 'ampm') return 'AMPM';
  if (seccionActiva === 'b2c') return 'B2C';
  if (seccionActiva === 'adm') return 'ADM';
  if (seccionActiva === 'qdm') return 'QDM';
  return 'AMPM';
}

function getBitacoraTipo() {
  if (seccionActiva === 'ampm') return 'ampm';
  if (seccionActiva === 'b2c') return 'b2c';
  if (seccionActiva === 'adm') return 'adm';
  if (seccionActiva === 'qdm') return 'qdm';
  return 'ampm';
}

function pendientesDeSeccion() {
  if (seccionActiva === 'ampm') return pendientesAMPM;
  if (seccionActiva === 'adm') return pendientesADM;
  if (seccionActiva === 'qdm') return pendientesQDM;
  if (seccionActiva === 'b2c') return pendientesB2C;
  return [];
}

window.cambiarSeccion = function(sec) {
  if (sec === 'basedatos' && rolActual !== 'admin') { toast('Sin permiso para BASE DE DATOS', 'err'); return; }
  if (sec === 'informes' && rolActual !== 'admin') { toast('Sin permiso para INFORMES', 'err'); return; }
  seccionActiva = sec;
  editandoKey = null;
  seleccionadosDesc.clear();
  document.querySelectorAll('.seccion-tab').forEach(function(t) { t.classList.remove('active'); });
  const tabBtn = document.querySelector('.seccion-tab[data-seccion="' + sec + '"]'); 
  if (tabBtn) tabBtn.classList.add('active');
  document.querySelectorAll('.secciones-bar > .seccion-contenido').forEach(function(c) { c.classList.remove('show'); });
  const cont = document.getElementById('seccion' + sec.charAt(0).toUpperCase() + sec.slice(1)); 
  if (cont) cont.classList.add('show');
  document.body.classList.toggle('oculta-principal', (sec === 'basedatos' || sec === 'bitacoras' || sec === 'informes'));
  paginaDesc = 1; 
  render();
  if (sec === 'basedatos') renderizarBaseDatos();
  if (sec === 'informes') renderInformes();
  if (sec === 'bitacoras') renderizarTodasBitacoras();
  actualizarBotonGuardar();
};

window.toggleSeccion = function(s) { 
  document.getElementById('contenido' + s.charAt(0).toUpperCase() + s.slice(1)).classList.toggle('show'); 
  document.getElementById('flecha' + s.charAt(0).toUpperCase() + s.slice(1)).classList.toggle('rotada'); 
};

window.toggleSubmenu = function(s) { 
  document.getElementById('submenu' + s.charAt(0).toUpperCase() + s.slice(1)).classList.toggle('show'); 
  document.getElementById('flecha' + s.charAt(0).toUpperCase() + s.slice(1)).classList.toggle('rotada'); 
};

window.cambiarTabBD = function(tab) { 
  if (rolActual !== 'admin') return; 
  tabBdActiva = tab;
  document.querySelectorAll('.basedatos-tab[data-tab]').forEach(function(t) { t.classList.remove('active'); });
  document.querySelector('.basedatos-tab[data-tab="' + tab + '"]').classList.add('active');
  document.querySelectorAll('#seccionBasedatos .basedatos-tab-content').forEach(function(c) { c.classList.remove('show'); });
  const map = { ampm: 'tabContentAmpm', b2c: 'tabContentB2c', adm: 'tabContentAdm', qdm: 'tabContentQdm' };
  document.getElementById(map[tab] || 'tabContentAmpm').classList.add('show'); 
  renderizarBaseDatos();
};

window.cambiarTabBit = function(tab) {
  bitTabActiva = tab;
  document.querySelectorAll('.basedatos-tab[data-btab]').forEach(function(t) { t.classList.remove('active'); });
  const b = document.querySelector('.basedatos-tab[data-btab="' + tab + '"]'); 
  if (b) b.classList.add('active');
  document.querySelectorAll('#seccionBitacoras .basedatos-tab-content').forEach(function(c) { c.classList.remove('show'); });
  const map = { ampm: 'bitContentAmpm', b2c: 'bitContentB2c', adm: 'bitContentAdm', qdm: 'bitContentQdm' };
  const cont = document.getElementById(map[tab] || 'bitContentAmpm');
  if (cont) cont.classList.add('show');
  renderizarBitacorasTipo(tab);
};

window.cambiarTema = function(t) { 
  document.documentElement.setAttribute('data-theme', t); 
  document.querySelectorAll('.theme-btn').forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-theme') === t); }); 
  localStorage.setItem('temaDespachoRetail', t); 
};

window.toggleSeleccionDesc = function(key, checked) { 
  checked ? seleccionadosDesc.add(key) : seleccionadosDesc.delete(key); 
  sincronizarSelTodos(); 
  actualizarContadorEnviar(); 
};

window.toggleSeleccionarTodo = function(checked) { 
  checked ? keysVisiblesDesc.forEach(function(k) { seleccionadosDesc.add(k); }) : keysVisiblesDesc.forEach(function(k) { seleccionadosDesc.delete(k); }); 
  render(); 
};

function sincronizarSelTodos() { 
  const el = document.getElementById('selTodosDesc'); 
  if (el) el.checked = keysVisiblesDesc.length > 0 && keysVisiblesDesc.every(function(k) { return seleccionadosDesc.has(k); }); 
}

function actualizarContadorEnviar() { 
  const b = document.getElementById('btnEnviar'); 
  if (b) b.textContent = seleccionadosDesc.size > 0 ? 'ENVIAR A BITACORA (' + seleccionadosDesc.size + ')' : 'ENVIAR A BITACORA'; 
}

function leerFiltrosDesc() {
  const g = function(id) { const el = document.getElementById(id); return el ? normSinTildes(el.value.trim()) : ''; };
  return { unidad: g('fDescUnidad'), comuna: g('fDescComuna'), transporte: g('fDescTransporte'), rango: g('fDescRango') };
}

function getDescBaseRows() {
  const f = document.getElementById('fFecha');
  const fechaTrabajo = (f && f.value) ? f.value : new Date().toISOString().split('T')[0];
  const tipoSec = tipoDeSeccion();
  let regs = [];
  Object.keys(cache).forEach(function(a) { 
    Object.keys(cache[a]||{}).forEach(function(m) { 
      Object.keys(cache[a][m]).forEach(function(k) { 
        const r = { key:k, anio:a, mes:m };
        Object.keys(cache[a][m][k]).forEach(function(key) { r[key] = cache[a][m][k][key]; });
        if (getTipoRegistro(r) !== tipoSec) return; 
        regs.push(r); 
      }); 
    }); 
  });
  const keysConCambios = Object.keys(cambiosFechaLocales);
  regs = regs.filter(function(r) {
    if (keysConCambios.includes(r.key)) return true;
    return r.fecha === fechaTrabajo;
  });
  pendientesDeSeccion().forEach(function(p) { 
    const reg = Object.assign({}, p.reg, { key: p.key, anio: p.anio, mes: p.mes, pendiente: true });
    regs.push(reg); 
  });
  return regs;
}

function getDistinctValues(col) {
  const rows = getDescBaseRows();
  const set = new Set();
  rows.forEach(function(r) {
    let v = '';
    if (col === 'unidad') v = r.unidad || '';
    else if (col === 'comuna') v = canonComuna(r.comuna) || '';
    else if (col === 'transporte') v = r.transporte || '';
    else if (col === 'rango') v = r.rango || '';
    if (v) set.add(v);
  });
  return Array.from(set).sort();
}

function poblarCombo(col, filtro) {
  const list = document.getElementById('combo_' + col);
  if (!list) return;
  let vals = getDistinctValues(col);
  if (filtro) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(filtro)); });
  list.innerHTML = vals.length
    ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionCombo(\'' + col + '\', \'' + v.replace(/'/g,"\\'") + '\')">' + v + '</div>'; }).join('')
    : '<div class="combo-item">Sin coincidencias</div>';
}

function poblarCombos() { 
  ['unidad','comuna','transporte','rango'].forEach(function(col) { 
    const inp = document.getElementById('fDesc' + col.charAt(0).toUpperCase() + col.slice(1)); 
    poblarCombo(col, inp ? inp.value : ''); 
  }); 
}

function cerrarTodosCombos() { 
  document.querySelectorAll('.combo-list').forEach(function(l) { 
    if (!l.id.startsWith('comboModal_') && !l.id.startsWith('comboBD_') && !l.id.startsWith('combo_trans_') && !l.id.startsWith('combo_obs_')) 
      l.style.display = 'none'; 
  }); 
  comboAbierto = null; 
  comboTransAbierto = null;
  comboObsAbierto = null;
  if (calendarioAbierto) { calendarioAbierto = false; const p = document.getElementById('calendarioPopup'); if (p) p.classList.remove('show'); }
  if (calFilaAbierto) { const p = document.getElementById('cal_popup_' + calFilaAbierto); if (p) p.classList.remove('show'); calFilaAbierto = null; }
}

window.toggleCombo = function(col) {
  const list = document.getElementById('combo_' + col);
  if (!list) return;
  if (comboAbierto === col) { list.style.display = 'none'; comboAbierto = null; }
  else { cerrarTodosCombos(); poblarCombo(col, ''); list.style.display = 'block'; comboAbierto = col; }
};

function abrirCombo(col) { 
  cerrarTodosCombos(); 
  poblarCombo(col, ''); 
  const list = document.getElementById('combo_' + col); 
  if (list) { list.style.display = 'block'; comboAbierto = col; } 
}

window.elegirOpcionCombo = function(col, val) {
  const input = document.getElementById('fDesc' + col.charAt(0).toUpperCase() + col.slice(1));
  if (input) input.value = val;
  cerrarTodosCombos();
  render();
};

window.filtrarComboDesc = function(col, val) {
  poblarCombo(col, val);
  const list = document.getElementById('combo_' + col);
  if (list) { list.style.display = 'block'; comboAbierto = col; }
  render();
};

window.abrirComboTransporte = function(key) {
  const list = document.getElementById('combo_trans_' + key);
  if (!list) return;
  const input = document.getElementById('trans_input_' + key);
  const val = input ? input.value : '';
  let vals = OPCIONES_TRANSPORTE;
  if (val) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(val)); });
  list.innerHTML = vals.length
    ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionTransporte(\'' + key + '\', \'' + v + '\')">' + v + '</div>'; }).join('')
    : '<div class="combo-item">Sin coincidencias</div>';
  list.style.display = 'block';
  comboTransAbierto = key;
};

window.toggleComboTransporte = function(key) {
  const list = document.getElementById('combo_trans_' + key);
  if (!list) return;
  if (comboTransAbierto === key) { list.style.display = 'none'; comboTransAbierto = null; }
  else { cerrarTodosCombos(); abrirComboTransporte(key); }
};

window.filtrarComboTransporte = function(key, val) {
  const list = document.getElementById('combo_trans_' + key);
  if (!list) return;
  let vals = OPCIONES_TRANSPORTE;
  if (val) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(val)); });
  list.innerHTML = vals.length
    ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionTransporte(\'' + key + '\', \'' + v + '\')">' + v + '</div>'; }).join('')
    : '<div class="combo-item">Sin coincidencias</div>';
  list.style.display = 'block';
  comboTransAbierto = key;
};

window.elegirOpcionTransporte = function(key, val) {
  const input = document.getElementById('trans_input_' + key);
  if (input) input.value = val;
  const list = document.getElementById('combo_trans_' + key);
  if (list) list.style.display = 'none';
  comboTransAbierto = null;
  actualizarTransporteRegistro(key, val);
};

function actualizarTransporteRegistro(key, nuevoTransporte) {
  let p = pendientesAMPM.find(function(p) { return p.key===key; }) || pendientesADM.find(function(p) { return p.key===key; }) || pendientesQDM.find(function(p) { return p.key===key; }) || pendientesB2C.find(function(p) { return p.key===key; });
  if (p) {
    if (p.reg.transporte !== nuevoTransporte) {
      p.reg.transporte = nuevoTransporte;
      delete p.reg._candidatos;
      if (cache[p.anio] && cache[p.anio][p.mes] && cache[p.anio][p.mes][key]) {
        update(ref(db, RUTA_BASE + '/' + p.anio + '/' + p.mes + '/' + key), { transporte: nuevoTransporte })
          .then(function() { toast('Transporte actualizado', 'ok'); })
          .catch(function(e) { toast('Error: ' + e.message, 'err'); });
      }
      render();
    }
    return;
  }
  outer: for (const a of Object.keys(cache)) {
    for (const m of Object.keys(cache[a]||{})) {
      if (cache[a][m] && cache[a][m][key]) {
        if (cache[a][m][key].transporte !== nuevoTransporte) {
          cache[a][m][key].transporte = nuevoTransporte;
          delete cache[a][m][key]._candidatos;
          update(ref(db, RUTA_BASE + '/' + a + '/' + m + '/' + key), { transporte: nuevoTransporte })
            .then(function() { toast('Transporte actualizado', 'ok'); })
            .catch(function(e) { toast('Error: ' + e.message, 'err'); });
        }
        break outer;
      }
    }
  }
  render();
}

window.abrirComboObs = function(key) {
  const list = document.getElementById('combo_obs_' + key);
  if (!list) return;
  const input = document.getElementById('obs_input_' + key);
  const val = input ? input.value : '';
  let vals = OPCIONES_OBS;
  if (val) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(val)); });
  list.innerHTML = vals.length
    ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionObs(\'' + key + '\', \'' + v + '\')">' + v + '</div>'; }).join('')
    : '<div class="combo-item">Sin coincidencias</div>';
  list.style.display = 'block';
  comboObsAbierto = key;
};

window.toggleComboObs = function(key) {
  const list = document.getElementById('combo_obs_' + key);
  if (!list) return;
  if (comboObsAbierto === key) { list.style.display = 'none'; comboObsAbierto = null; }
  else { cerrarTodosCombos(); abrirComboObs(key); }
};

window.filtrarComboObs = function(key, val) {
  const list = document.getElementById('combo_obs_' + key);
  if (!list) return;
  let vals = OPCIONES_OBS;
  if (val) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(val)); });
  list.innerHTML = vals.length
    ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionObs(\'' + key + '\', \'' + v + '\')">' + v + '</div>'; }).join('')
    : '<div class="combo-item">Sin coincidencias</div>';
  list.style.display = 'block';
  comboObsAbierto = key;
};

window.elegirOpcionObs = function(key, val) {
  const input = document.getElementById('obs_input_' + key);
  if (input) input.value = val;
  const list = document.getElementById('combo_obs_' + key);
  if (list) list.style.display = 'none';
  comboObsAbierto = null;
  actualizarObservacionRegistro(key, val);
};

function actualizarObservacionRegistro(key, nuevaObs) {
  let p = pendientesAMPM.find(function(p) { return p.key===key; }) || pendientesADM.find(function(p) { return p.key===key; }) || pendientesQDM.find(function(p) { return p.key===key; }) || pendientesB2C.find(function(p) { return p.key===key; });
  if (p) {
    p.reg.observacion = nuevaObs.toUpperCase();
    if (cache[p.anio] && cache[p.anio][p.mes] && cache[p.anio][p.mes][key]) {
      update(ref(db, RUTA_BASE + '/' + p.anio + '/' + p.mes + '/' + key), { observacion: nuevaObs.toUpperCase() });
    }
    render();
    return;
  }
  outer: for (const a of Object.keys(cache)) {
    for (const m of Object.keys(cache[a]||{})) {
      if (cache[a][m] && cache[a][m][key]) {
        cache[a][m][key].observacion = nuevaObs.toUpperCase();
        update(ref(db, RUTA_BASE + '/' + a + '/' + m + '/' + key), { observacion: nuevaObs.toUpperCase() });
        break outer;
      }
    }
  }
  render();
}

window.abrirComboObsEdicion = function() {
  const list = document.getElementById('combo_edicion_obs');
  if (!list) return;
  const input = document.getElementById('edi_obs');
  const val = input ? input.value : '';
  let vals = OPCIONES_OBS;
  if (val) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(val)); });
  list.innerHTML = vals.length
    ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionObsEdicion(\'' + v + '\')">' + v + '</div>'; }).join('')
    : '<div class="combo-item">Sin coincidencias</div>';
  list.style.display = 'block';
};

window.toggleComboObsEdicion = function() {
  const list = document.getElementById('combo_edicion_obs');
  if (!list) return;
  if (list.style.display === 'block') { list.style.display = 'none'; }
  else { abrirComboObsEdicion(); }
};

window.filtrarComboObsEdicion = function(val) {
  const list = document.getElementById('combo_edicion_obs');
  if (!list) return;
  let vals = OPCIONES_OBS;
  if (val) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(val)); });
  list.innerHTML = vals.length
    ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionObsEdicion(\'' + v + '\')">' + v + '</div>'; }).join('')
    : '<div class="combo-item">Sin coincidencias</div>';
  list.style.display = 'block';
};

window.elegirOpcionObsEdicion = function(val) {
  const input = document.getElementById('edi_obs');
  if (input) input.value = val;
  const list = document.getElementById('combo_edicion_obs');
  if (list) list.style.display = 'none';
};

function getDistinctModal(col) {
  const set = new Set();
  datosModal.forEach(function(r) {
    let v = '';
    if (col==='fecha') v = fmtFecha(r.fecha);
    else if (col==='unidad') v = r.unidad||'';
    else if (col==='comuna') v = canonComuna(r.comuna)||'';
    else if (col==='transporte') v = r.transporte||'';
    else if (col==='observacion') v = r.observacion||'';
    else if (col==='rango') v = r.rango||'';
    if (v) set.add(v);
  });
  return Array.from(set).sort();
}

function poblarComboModal(col, filtro) {
  const list = document.getElementById('comboModal_'+col);
  if (!list) return;
  let vals = getDistinctModal(col);
  if (filtro) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(filtro)); });
  list.innerHTML = vals.length
    ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionModal(\'' + col + '\', \'' + v.replace(/'/g,"\\'") + '\')">' + v + '</div>'; }).join('')
    : '<div class="combo-item">Sin coincidencias</div>';
}

function poblarCombosModal() { 
  ['fecha','unidad','comuna','transporte','observacion','rango'].forEach(function(col) { 
    const inp = document.getElementById('fMod'+col.charAt(0).toUpperCase()+col.slice(1)); 
    poblarComboModal(col, inp ? inp.value : ''); 
  }); 
}

function cerrarCombosModal() { 
  document.querySelectorAll('.combo-list').forEach(function(l) { if (l.id.startsWith('comboModal_')) l.style.display='none'; }); 
  comboModalAbierto = null; 
}

window.toggleComboModal = function(col) {
  const list = document.getElementById('comboModal_'+col);
  if (!list) return;
  if (comboModalAbierto === col) { list.style.display='none'; comboModalAbierto=null; }
  else { cerrarCombosModal(); poblarComboModal(col,''); list.style.display='block'; comboModalAbierto=col; }
};

function abrirComboModal(col) { 
  cerrarCombosModal(); 
  poblarComboModal(col,''); 
  const list=document.getElementById('comboModal_'+col); 
  if(list){ list.style.display='block'; comboModalAbierto=col; } 
}

window.elegirOpcionModal = function(col, val) {
  const input = document.getElementById('fMod'+col.charAt(0).toUpperCase()+col.slice(1));
  if (input) input.value = val;
  cerrarCombosModal();
  aplicarFiltrosModal();
};

window.filtrarComboModal = function(col, val) {
  poblarComboModal(col, val);
  const list = document.getElementById('comboModal_'+col);
  if (list) { list.style.display='block'; comboModalAbierto=col; }
  aplicarFiltrosModal();
};

function sufBD(tipo){ 
  if (tipo==='AMPM') return 'Ampm';
  if (tipo==='B2C') return 'B2c';
  if (tipo==='ADM') return 'Adm';
  return 'Qdm';
}

function getBDBaseRows(tipo){ 
  let r = obtenerRegsTipo(tipo); 
  const f = filtroDiaBD[tipo]; 
  if (f.d) r = r.filter(function(x) { return (x.fecha||'').split('-')[2] === f.d; }); 
  if (f.m) r = r.filter(function(x) { return x.mes === f.m; }); 
  if (f.a) r = r.filter(function(x) { return x.anio === f.a; }); 
  return r; 
}

function getDistinctBD(tipo, campo){ 
  const set = new Set(); 
  getBDBaseRows(tipo).forEach(function(r) { 
    let v=''; 
    if(campo==='unidad')v=r.unidad||''; 
    else if(campo==='comuna')v=canonComuna(r.comuna)||''; 
    else if(campo==='transporte')v=r.transporte||''; 
    else if(campo==='rango')v=r.rango||''; 
    if(v)set.add(v); 
  }); 
  return Array.from(set).sort(); 
}

function poblarComboBD(tipo, campo, filtro){
  const list = document.getElementById('comboBD_'+sufBD(tipo)+'_'+campo);
  if(!list) return;
  let vals = getDistinctBD(tipo, campo);
  if (filtro) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(filtro)); });
  list.innerHTML = vals.length ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionBD(\'' + tipo + '\',\'' + campo + '\',\'' + v.replace(/'/g,"\\'") + '\')">' + v + '</div>'; }).join('') : '<div class="combo-item">Sin coincidencias</div>';
}

function cerrarCombosBD(){ 
  document.querySelectorAll('.combo-list').forEach(function(l) { if (l.id.startsWith('comboBD_')) l.style.display='none'; }); 
  comboBDAbierto = null; 
}

window.toggleComboBD = function(tipo, campo){
  const list = document.getElementById('comboBD_'+sufBD(tipo)+'_'+campo);
  if(!list) return;
  const id = tipo+'_'+campo;
  if (comboBDAbierto === id) { list.style.display='none'; comboBDAbierto=null; }
  else { cerrarCombosBD(); poblarComboBD(tipo,campo,''); list.style.display='block'; comboBDAbierto=id; }
};

function abrirComboBD(tipo, campo){ 
  cerrarCombosBD(); 
  poblarComboBD(tipo,campo,''); 
  const list=document.getElementById('comboBD_'+sufBD(tipo)+'_'+campo); 
  if(list){ list.style.display='block'; comboBDAbierto=tipo+'_'+campo; } 
}

window.elegirOpcionBD = function(tipo, campo, val){
  const input = document.getElementById('fBD'+sufBD(tipo)+'_'+campo);
  if (input) input.value = val;
  filtroDescBD[tipo][campo] = normSinTildes(val);
  cerrarCombosBD();
  const idMap = { AMPM: 'filtroIdAmpm', B2C: 'filtroIdB2c', ADM: 'filtroIdAdm', QDM: 'filtroIdQdm' };
  const pagMap = { AMPM: paginaBDAmpm, B2C: paginaBDB2c, ADM: paginaBDAdm, QDM: paginaBDQdm };
  renderTabBD(tipo, document.getElementById(idMap[tipo]).value, pagMap[tipo]);
};

window.filtrarBDCombo = function(tipo, campo, val){
  filtroDescBD[tipo][campo] = normSinTildes(val);
  poblarComboBD(tipo, campo, val);
  const list = document.getElementById('comboBD_'+sufBD(tipo)+'_'+campo);
  if (list) { list.style.display='block'; comboBDAbierto=tipo+'_'+campo; }
  const idMap = { AMPM: 'filtroIdAmpm', B2C: 'filtroIdB2c', ADM: 'filtroIdAdm', QDM: 'filtroIdQdm' };
  const pagMap = { AMPM: paginaBDAmpm, B2C: paginaBDB2c, ADM: paginaBDAdm, QDM: paginaBDQdm };
  renderTabBD(tipo, document.getElementById(idMap[tipo]).value, pagMap[tipo]);
};

function renderDescThead() {
  const thead = document.getElementById('theadDesc');
  if (!thead) return;
  const b2c = (seccionActiva === 'b2c');
  const combo = function(col, label) { 
    return '<th>' + label + '<div class="filtro-combo"><input type="text" class="th-filter" id="fDesc' + col.charAt(0).toUpperCase() + col.slice(1) + '" placeholder="Filtrar..." oninput="filtrarComboDesc(\'' + col + '\', this.value)" onfocus="abrirCombo(\'' + col + '\')"><button class="combo-arrow" onclick="toggleCombo(\'' + col + '\')">▼</button><div class="combo-list" id="combo_' + col + '"></div></div></th>'; 
  };
  const sel = '<th class="th-sel"><input type="checkbox" id="selTodosDesc" style="width:16px;height:16px;" onchange="toggleSeleccionarTodo(this.checked)" title="Seleccionar todo"></th>';
  let h;
  if (b2c) {
    h = sel + '<th>Fecha</th>' + combo('unidad','Unidad Negocio') + '<th>ID Pedido</th><th>Nombre Cliente</th><th>Celular</th><th>E-Mail</th><th>Direccion</th>' + combo('comuna','Comuna') + '<th>Valor Producto</th><th>Observacion</th>' + combo('transporte','Transporte') + combo('rango','Rango') + '<th>Acciones</th>';
  } else {
    h = sel + '<th>Fecha</th>' + combo('unidad','Unidad Negocio') + '<th>ID Pedido</th><th>Nombre Cliente</th><th>Direccion</th>' + combo('comuna','Comuna') + '<th>Valor</th><th>Observacion</th>' + combo('transporte','Transporte') + combo('rango','Rango') + '<th>Acciones</th>';
  }
  thead.innerHTML = '<tr>' + h + '</tr>';
}

function render() {
  if (theadSeccion !== seccionActiva) { renderDescThead(); theadSeccion = seccionActiva; }
  poblarCombos();
  const busq = document.getElementById('buscar').value.toLowerCase();
  const f = document.getElementById('fFecha');
  const fechaTrabajo = (f && f.value) ? f.value : new Date().toISOString().split('T')[0];
  const tipoSec = tipoDeSeccion();
  let regs = [];
  Object.keys(cache).forEach(function(a) { 
    Object.keys(cache[a]||{}).forEach(function(m) { 
      Object.keys(cache[a][m]).forEach(function(k) { 
        const r = { key:k, anio:a, mes:m };
        Object.keys(cache[a][m][k]).forEach(function(key) { r[key] = cache[a][m][k][key]; });
        if (getTipoRegistro(r) !== tipoSec) return; 
        regs.push(r); 
      }); 
    }); 
  });
  const keysConCambios = Object.keys(cambiosFechaLocales);
  if (!busq) {
    regs = regs.filter(function(r) {
      if (keysConCambios.includes(r.key)) return true;
      return r.fecha === fechaTrabajo;
    });
  } else {
    regs = regs.filter(function(r) { 
      return ['nombre','idPedido','transporte','comuna','unidad','celular','email'].some(function(c) { 
        return (r[c]||'').toLowerCase().includes(busq); 
      }); 
    });
  }
  pendientesDeSeccion().forEach(function(p) { 
    const reg = Object.assign({}, p.reg, { key: p.key, anio: p.anio, mes: p.mes, pendiente: true });
    regs.push(reg); 
  });
  const fd = leerFiltrosDesc();
  if (fd.unidad) regs = regs.filter(function(r) { return normSinTildes(r.unidad||'').includes(fd.unidad); });
  if (fd.comuna) regs = regs.filter(function(r) { return normSinTildes(canonComuna(r.comuna)||'').includes(fd.comuna); });
  if (fd.transporte) regs = regs.filter(function(r) { return normSinTildes(r.transporte||'').includes(fd.transporte); });
  if (fd.rango) regs = regs.filter(function(r) { return normSinTildes(r.rango||'').includes(fd.rango); });
  ordenarPorFechaDireccionId(regs);
  document.getElementById('sTotal').textContent = formatoEntero(regs.length);
  document.getElementById('sValor').textContent = formatoMoneda(sumaValores(regs));
  document.getElementById('sAM').textContent = formatoEntero(regs.filter(function(r){return r.rango==='AM';}).length);
  document.getElementById('sPM').textContent = formatoEntero(regs.filter(function(r){return r.rango==='PM';}).length);
  const tbody = document.getElementById('tbody'), empty = document.getElementById('empty');
  if (regs.length === 0) { 
    tbody.innerHTML = ''; 
    empty.style.display = 'block'; 
    empty.textContent = busq ? 'No se encontraron resultados' : 'No hay registros para el dia ' + fmtFechaConDia(fechaTrabajo); 
    keysVisiblesDesc = []; 
    renderPaginacionDesc(0,0,0); 
    sincronizarSelTodos(); 
    actualizarContadorEnviar(); 
    return; 
  }
  empty.style.display = 'none';
  const tp = Math.max(1, Math.ceil(regs.length / REGISTROS_POR_PAGINA_DESC));
  if (paginaDesc > tp) paginaDesc = tp; 
  if (paginaDesc < 1) paginaDesc = 1;
  const ini = (paginaDesc-1)*REGISTROS_POR_PAGINA_DESC;
  const pag = regs.slice(ini, ini+REGISTROS_POR_PAGINA_DESC);
  keysVisiblesDesc = pag.map(function(r) { return r.key; });
  const cf = detectarIdsRepetidosPorFecha(regs), cg = detectarIdsRepetidosGlobal(regs), dr = detectarDireccionesRepetidas(regs);
  tbody.innerHTML = pag.map(function(r) { return filaHTMLTabla(r, cf, cg, dr); }).join('');
  renderPaginacionDesc(tp, regs.length, paginaDesc);
  sincronizarSelTodos(); 
  actualizarContadorEnviar(); 
  actualizarBotonGuardar();
  sincronizarScrollHorizontal();
}

function sincronizarScrollHorizontal() {
  const top = document.getElementById('scrollTop');
  const bottom = document.getElementById('scrollBottom');
  if (!top || !bottom) return;
  top.onscroll = null; 
  bottom.onscroll = null;
  top.onscroll = function() { bottom.scrollLeft = top.scrollLeft; };
  bottom.onscroll = function() { top.scrollLeft = bottom.scrollLeft; };
}

function renderPaginacionDesc(tp, total, pag) {
  let cont = document.getElementById('paginacionDesc');
  if (!cont) { 
    cont = document.createElement('div'); 
    cont.id = 'paginacionDesc'; 
    cont.className = 'bd-paginacion'; 
    cont.style.margin = '10px 0 0 0'; 
    const sv = document.querySelector('.tabla-scroll-vertical'); 
    if (sv) sv.appendChild(cont); 
  }
  if (tp <= 1) { 
    cont.innerHTML = total>0 ? '<div class="bd-paginacion-info">Mostrando ' + formatoEntero(total) + ' de ' + formatoEntero(total) + ' registros</div>' : ''; 
    return; 
  }
  const ini = (pag-1)*REGISTROS_POR_PAGINA_DESC, fin = Math.min(ini+REGISTROS_POR_PAGINA_DESC, total);
  let h = '<div class="bd-paginacion-info">Pagina ' + pag + ' de ' + tp + ' | ' + formatoEntero(ini+1) + '-' + formatoEntero(fin) + ' de ' + formatoEntero(total) + ' registros</div>';
  h += pag>1 ? '<button class="btn-bd-pag-nav" onclick="irAPaginaDesc(' + (pag-1) + ')">‹ Anterior</button>' : '<button class="btn-bd-pag-nav" disabled>‹ Anterior</button>';
  const pI = Math.max(1,pag-2), pF = Math.min(tp,pag+2);
  if (pI>1){ h += '<button class="btn-bd-pag" onclick="irAPaginaDesc(1)">1</button>'; if(pI>2) h += '<span style="color:var(--text-muted);padding:0 4px">...</span>'; }
  for (let i=pI;i<=pF;i++) h += i===pag ? '<button class="btn-bd-pag activa">' + i + '</button>' : '<button class="btn-bd-pag" onclick="irAPaginaDesc(' + i + ')">' + i + '</button>';
  if (pF<tp){ if(pF<tp-1) h += '<span style="color:var(--text-muted);padding:0 4px">...</span>'; h += '<button class="btn-bd-pag" onclick="irAPaginaDesc(' + tp + ')">' + tp + '</button>'; }
  h += pag<tp ? '<button class="btn-bd-pag-nav" onclick="irAPaginaDesc(' + (pag+1) + ')">Siguiente ›</button>' : '<button class="btn-bd-pag-nav" disabled>Siguiente ›</button>';
  cont.innerHTML = h;
}

window.irAPaginaDesc = function(p) { 
  paginaDesc = p; 
  render(); 
  const sv = document.querySelector('.tabla-scroll-vertical'); 
  if (sv) sv.scrollTop = 0; 
};

function filaHTMLTabla(r, cf, cg, dr) {
  const b2c = (seccionActiva === 'b2c');
  const id = (r.idPedido||'').toString().trim().toUpperCase();
  const clave = (r.fecha||'') + '|' + id;
  const misma = id && cf[clave] > 1;
  const otra = !misma && id && cg[id] > 1;
  const dirShow = dirDe(r); 
  const dirKey = (r.fecha||'') + '|' + normDir(dirShow); 
  const dirRep = dr[dirKey] > 1;
  const sel = seleccionadosDesc.has(r.key) ? 'checked' : '';
  let clase = '', ind = '';
  if (misma){ clase += 'id-repetido '; ind = '<span style="color:#fff;background:#e74c3c;padding:2px 6px;border-radius:4px;font-size:.7em;font-weight:700">x' + cf[clave] + '</span>'; }
  else if (otra){ clase += 'id-repetido-otro '; ind = '<span style="color:#fff;background:#ff8c00;padding:2px 6px;border-radius:4px;font-size:.7em;font-weight:700">x' + cg[id] + '</span>'; }
  if (r.otroPalet) clase += 'fila-amarillo ';
  const cands = (r._candidatos && r._candidatos.length) ? r._candidatos : null;
  const debeElegir = cands && cands.length > 1 && !r.transporte;
  if (debeElegir) clase += 'fila-elegir-movil ';
  const tieneCambioFecha = cambiosFechaLocales[r.key] !== undefined;
  if (tieneCambioFecha) clase += 'fila-fecha-modificada ';
  const bp = r.pendiente ? '<span class="badge badge-pendiente">SIN GUARDAR</span>' : '';
  const indicadorCambio = tieneCambioFecha ? '<span style="color:var(--accent-orange);font-size:.7em;font-weight:700;margin-left:4px" title="Fecha modificada (pendiente de guardar)">✏️</span>' : '';
  const fechaMostrar = tieneCambioFecha ? cambiosFechaLocales[r.key].nuevaFecha : r.fecha;
  const celdaFecha = '<td><div class="fecha-cell-wrap"><input type="date" value="' + (fechaMostrar||'') + '" onchange="cambiarFechaFila(\'' + r.key + '\', this.value, ' + (r.pendiente?true:false) + ')"></div> ' + bp + indicadorCambio + '</td>';
  const celdaSel = '<td class="td-sel"><input type="checkbox" style="width:16px;height:16px;" ' + sel + ' onchange="toggleSeleccionDesc(\'' + r.key + '\', this.checked)"></td>';

  if (r.key === editandoKey) {
    const fechaInput = '<td class="celda-edit"><input type="date" id="edi_fecha" value="' + (r.fecha||'') + '"></td>';
    const unidadInput = '<td class="celda-edit"><input type="text" id="edi_unidad" value="' + (r.unidad||'').replace(/"/g,'&quot;') + '"></td>';
    const idInput = '<td class="celda-edit"><input type="text" id="edi_id" value="' + (r.idPedido||'').replace(/"/g,'&quot;') + '"></td>';
    const nombreInput = '<td class="celda-edit"><input type="text" id="edi_nombre" value="' + (r.nombre||'').replace(/"/g,'&quot;') + '"></td>';
    const dirInput = '<td class="celda-edit"><input type="text" id="edi_direccion" value="' + (r.direccion||'').replace(/"/g,'&quot;') + '"></td>';
    const comunaInput = '<td class="celda-edit"><input type="text" id="edi_comuna" value="' + (r.comuna||'').replace(/"/g,'&quot;') + '"></td>';
    const obsInput = '<td class="celda-edit"><div class="obs-combo-wrap"><input type="text" id="edi_obs" value="' + (r.observacion||'').replace(/"/g,'&quot;') + '" oninput="filtrarComboObsEdicion(this.value)" onfocus="abrirComboObsEdicion()"><button class="combo-arrow" onclick="toggleComboObsEdicion()">▼</button><div class="combo-list" id="combo_edicion_obs"></div></div></td>';
    const transInput = '<td class="celda-edit"><div class="filtro-combo" style="margin:0"><input type="text" id="edi_transporte" value="' + (r.transporte||'').replace(/"/g,'&quot;') + '" oninput="filtrarComboEdicion(this.value)" onfocus="abrirComboEdicion()"><button class="combo-arrow" onclick="toggleComboEdicion()">▼</button><div class="combo-list" id="combo_edicion_transporte"></div></div></td>';
    const rangoInput = '<td class="celda-edit"><select id="edi_rango"><option value="">--</option><option value="AM" ' + (r.rango==='AM'?'selected':'') + '>AM</option><option value="PM" ' + (r.rango==='PM'?'selected':'') + '>PM</option><option value="B2C" ' + (r.rango==='B2C'?'selected':'') + '>B2C</option><option value="ADM" ' + (r.rango==='ADM'?'selected':'') + '>ADM</option><option value="QDM" ' + (r.rango==='QDM'?'selected':'') + '>QDM</option></select></td>';
    const acc = '<td class="td-acciones"><button class="btn-acc" onclick="guardarEdicionInline(\'' + r.key + '\',\'' + r.anio + '\',\'' + r.mes + '\',' + (r.pendiente?true:false) + ')">✔</button><button class="btn-acc" onclick="cancelarEdicionInline()">#</button></td>';
    if (b2c) return '<tr class="' + clase + '">' + celdaSel + fechaInput + unidadInput + idInput + nombreInput + '<td class="celda-edit"><input type="text" id="edi_celular" value="' + (r.celular||'').replace(/"/g,'&quot;') + '"></td><td class="celda-edit"><input type="text" id="edi_email" value="' + (r.email||'').replace(/"/g,'&quot;') + '"></td>' + dirInput + comunaInput + '<td class="celda-edit">' + formatoMonedaAlineado(r.valor) + '</td>' + obsInput + transInput + rangoInput + acc + '</tr>';
    return '<tr class="' + clase + '">' + celdaSel + fechaInput + unidadInput + idInput + nombreInput + dirInput + comunaInput + '<td class="celda-edit">' + formatoMonedaAlineado(r.valor) + '</td>' + obsInput + transInput + rangoInput + acc + '</tr>';
  }

  let obs, trans, rango;
  if (r.pendiente) {
    obs = '<td class="celda-edit"><div class="obs-combo-wrap"><input type="text" id="obs_input_' + r.key + '" value="' + (r.observacion||'').replace(/"/g,'&quot;') + '" oninput="filtrarComboObs(\'' + r.key + '\', this.value)" onfocus="abrirComboObs(\'' + r.key + '\')"><button class="combo-arrow" onclick="toggleComboObs(\'' + r.key + '\')">▼</button><div class="combo-list" id="combo_obs_' + r.key + '"></div></div></td>';
    trans = '<td class="celda-edit"><div class="filtro-combo" style="margin:0"><input type="text" id="trans_input_' + r.key + '" value="' + (r.transporte||'').replace(/"/g,'&quot;') + '" oninput="filtrarComboTransporte(\'' + r.key + '\', this.value)" onfocus="abrirComboTransporte(\'' + r.key + '\')"><button class="combo-arrow" onclick="toggleComboTransporte(\'' + r.key + '\')">▼</button><div class="combo-list" id="combo_trans_' + r.key + '"></div>' + (debeElegir ? '<div style="color:var(--accent-orange);font-size:.7em;font-weight:700;margin-top:2px">Elige: ' + cands.join(' / ') + '</div>' : '') + '</div></td>';
    rango = '<td class="celda-edit"><select onchange="editarRangoPendiente(\'' + r.key + '\', this.value)"><option value="">--</option><option value="AM" ' + (r.rango==='AM'?'selected':'') + '>AM</option><option value="PM" ' + (r.rango==='PM'?'selected':'') + '>PM</option><option value="B2C" ' + (r.rango==='B2C'?'selected':'') + '>B2C</option><option value="ADM" ' + (r.rango==='ADM'?'selected':'') + '>ADM</option><option value="QDM" ' + (r.rango==='QDM'?'selected':'') + '>QDM</option></select></td>';
  } else {
    obs = '<td><div class="obs-combo-wrap" style="display:inline-block;vertical-align:middle;width:100%"><input type="text" id="obs_input_' + r.key + '" value="' + (r.observacion||'').replace(/"/g,'&quot;') + '" oninput="filtrarComboObs(\'' + r.key + '\', this.value)" onfocus="abrirComboObs(\'' + r.key + '\')"><button class="combo-arrow" onclick="toggleComboObs(\'' + r.key + '\')">▼</button><div class="combo-list" id="combo_obs_' + r.key + '"></div></div></td>';
    trans = '<td><div class="filtro-combo" style="margin:0;display:inline-block;vertical-align:middle"><input type="text" id="trans_input_' + r.key + '" value="' + (r.transporte||'').replace(/"/g,'&quot;') + '" style="width:120px;padding-right:22px" oninput="filtrarComboTransporte(\'' + r.key + '\', this.value)" onfocus="abrirComboTransporte(\'' + r.key + '\')"><button class="combo-arrow" onclick="toggleComboTransporte(\'' + r.key + '\')">▼</button><div class="combo-list" id="combo_trans_' + r.key + '"></div></div>' + (debeElegir ? '<div style="color:var(--accent-orange);font-size:.7em;font-weight:700">Elige: ' + cands.join(' / ') + '</div>' : '') + '</td>';
    rango = '<td><span class="badge badge-' + (r.rango||'').toLowerCase() + '">' + (r.rango||'') + '</span></td>';
  }
  const acc = '<td class="td-otro-palet"><input type="checkbox" ' + (r.otroPalet?'checked':'') + ' onchange="toggleOtroPalet(\'' + r.key + '\', ' + (r.pendiente?true:false) + ', this.checked)" title="Otro palet"></td><td class="td-acciones"><button class="btn-acc btn-borrar" onclick="pedirBorrarRegistro(\'' + r.key + '\',\'' + r.anio + '\',\'' + r.mes + '\',' + (r.pendiente?true:false) + ')" title="Eliminar">️</button></td>';
  const valorCelda = '<td>' + formatoMonedaAlineado(r.valor) + '</td>';
  if (b2c) {
    return '<tr class="' + clase + '">' + celdaSel + celdaFecha + '<td><span class="badge badge-unidad">' + (r.unidad||'') + '</span></td><td><strong>' + (r.idPedido||'') + '</strong>' + ind + '</td><td>' + (r.nombre||'') + '</td><td>' + (r.celular||'') + '</td><td>' + (r.email||'') + '</td><td>' + dirShow + (dirRep?' <span style="color:var(--accent-orange);font-size:.7em;font-weight:700">[misma dir x' + dr[dirKey] + ']</span>':'') + '</td><td>' + canonComuna(r.comuna) + '</td>' + valorCelda + obs + trans + rango + acc + '</tr>';
  }
  return '<tr class="' + clase + '">' + celdaSel + celdaFecha + '<td><span class="badge badge-unidad">' + (r.unidad||'') + '</span></td><td><strong>' + (r.idPedido||'') + '</strong>' + ind + '</td><td>' + (r.nombre||'') + '</td><td>' + dirShow + (dirRep?' <span style="color:var(--accent-orange);font-size:.7em;font-weight:700">[misma dir x' + dr[dirKey] + ']</span>':'') + '</td><td>' + canonComuna(r.comuna) + '</td>' + valorCelda + obs + trans + rango + acc + '</tr>';
}

window.filtrarComboEdicion = function(val) {
  const list = document.getElementById('combo_edicion_transporte');
  if (!list) return;
  let vals = OPCIONES_TRANSPORTE;
  if (val) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(val)); });
  list.innerHTML = vals.length
    ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionEdicion(\'' + v + '\')">' + v + '</div>'; }).join('')
    : '<div class="combo-item">Sin coincidencias</div>';
  list.style.display = 'block';
};

window.abrirComboEdicion = function() { filtrarComboEdicion(''); };

window.toggleComboEdicion = function() {
  const list = document.getElementById('combo_edicion_transporte');
  if (!list) return;
  if (list.style.display === 'block') { list.style.display = 'none'; }
  else { filtrarComboEdicion(document.getElementById('edi_transporte') ? document.getElementById('edi_transporte').value : ''); }
};

window.elegirOpcionEdicion = function(val) {
  const input = document.getElementById('edi_transporte');
  if (input) input.value = val;
  const list = document.getElementById('combo_edicion_transporte');
  if (list) list.style.display = 'none';
};

window.editarObsPendiente = function(k,v) { 
  const p = pendientesAMPM.find(function(p){return p.key===k;}) || pendientesADM.find(function(p){return p.key===k;}) || pendientesQDM.find(function(p){return p.key===k;}) || pendientesB2C.find(function(p){return p.key===k;}); 
  if (p) p.reg.observacion = v.toUpperCase(); 
};

window.editarRangoPendiente = function(k,v) { 
  const p = pendientesAMPM.find(function(p){return p.key===k;}) || pendientesADM.find(function(p){return p.key===k;}) || pendientesQDM.find(function(p){return p.key===k;}) || pendientesB2C.find(function(p){return p.key===k;}); 
  if (p) p.reg.rango = v; 
};

window.toggleOtroPalet = function(key, esPend, checked) {
  if (esPend) { 
    const p = pendientesAMPM.find(function(p){return p.key===key;}) || pendientesADM.find(function(p){return p.key===key;}) || pendientesQDM.find(function(p){return p.key===key;}) || pendientesB2C.find(function(p){return p.key===key;}); 
    if (p){ p.reg.otroPalet = checked; render(); } 
  }
  else { 
    outer: for (const a of Object.keys(cache)) {
      for (const m of Object.keys(cache[a]||{})) {
        if (cache[a][m] && cache[a][m][key]) { 
          cache[a][m][key].otroPalet = checked; 
          update(ref(db, RUTA_BASE + '/' + a + '/' + m + '/' + key), { otroPalet: checked }); 
          break outer; 
        }
      }
    }
    render(); 
  }
};

function actualizarBotonGuardar() { 
  const b = document.getElementById('btnGuardarAmpm');
  if (!b) return; 
  b.style.display = 'inline-block';
  const numCambios = Object.keys(cambiosFechaLocales).length;
  if (numCambios > 0) {
    b.textContent = 'GUARDAR (' + numCambios + ' cambios pendientes)';
    b.style.background = 'var(--accent-orange)';
  } else {
    b.textContent = 'GUARDAR';
    b.style.background = 'var(--accent-blue)';
  }
}

window.guardarPendientesSeccion = function() {
  const lista = pendientesDeSeccion();
  const numCambiosFecha = Object.keys(cambiosFechaLocales).length;
  if (!lista.length && numCambiosFecha === 0) {
    toast('No hay nada por guardar', 'info');
    return;
  }
  const sR = lista.filter(function(p){return !p.reg.rango;}).length;
  const sT = lista.filter(function(p){return !p.reg.transporte;}).length;
  if (sR || sT) {
    let m = 'NO SE PUEDE GUARDAR.\nFaltan campos OBLIGATORIOS:\n\n';
    if (sR) m += '• ' + sR + ' fila(s) sin RANGO.\n';
    if (sT) m += '• ' + sT + ' fila(s) sin TRANSPORTE.\n';
    m += '\nCompleta y vuelve a presionar GUARDAR.';
    toast('Faltan RANGO y/o TRANSPORTE','err');
    alert(m);
    return;
  }
  if (!confirm('Se guardarán ' + formatoEntero(lista.length) + ' registros' + (numCambiosFecha > 0 ? ' y ' + numCambiosFecha + ' cambio(s) de fecha' : '') + '.\n¿Continuar?')) return;
  toast('Guardando...','info');
  const promesasFecha = [];
  Object.keys(cambiosFechaLocales).forEach(function(key) {
    const cambio = cambiosFechaLocales[key];
    if (cambio.esPendiente) {
      const p = pendientesAMPM.find(function(p){return p.key===key;}) || pendientesADM.find(function(p){return p.key===key;}) || pendientesQDM.find(function(p){return p.key===key;}) || pendientesB2C.find(function(p){return p.key===key;});
      if (p) {
        p.reg.fecha = cambio.nuevaFecha;
        p.anio = cambio.nuevaAnio;
        p.mes = cambio.nuevaMes;
      }
    } else {
      const anioOriginal = cambio.anioOriginal;
      const mesOriginal = cambio.mesOriginal;
      const nuevaAnio = cambio.nuevaAnio;
      const nuevaMes = cambio.nuevaMes;
      const nuevaFecha = cambio.nuevaFecha;
      if (cache[anioOriginal] && cache[anioOriginal][mesOriginal] && cache[anioOriginal][mesOriginal][key]) {
        const regData = Object.assign({}, cache[anioOriginal][mesOriginal][key]);
        delete cache[anioOriginal][mesOriginal][key];
        if (!cache[nuevaAnio]) cache[nuevaAnio] = {};
        if (!cache[nuevaAnio][nuevaMes]) cache[nuevaAnio][nuevaMes] = {};
        regData.fecha = nuevaFecha;
        cache[nuevaAnio][nuevaMes][key] = regData;
        promesasFecha.push(
          remove(ref(db, RUTA_BASE + '/' + anioOriginal + '/' + mesOriginal + '/' + key))
            .then(function() { return set(ref(db, RUTA_BASE + '/' + nuevaAnio + '/' + nuevaMes + '/' + key), regData); })
        );
      }
    }
  });
  cambiosFechaLocales = {};
  let g = 0; 
  let li = 0;
  const lotes = [];
  for (let i=0;i<lista.length;i+=50) lotes.push(lista.slice(i,i+50));
  const proc = function() {
    if (li >= lotes.length) {
      lotes.flat().forEach(function(p) {
        const l = Object.assign({}, p.reg);
        delete l.pendiente;
        delete l._candidatos;
        if (!cache[p.anio]) cache[p.anio] = {};
        if (!cache[p.anio][p.mes]) cache[p.anio][p.mes] = {};
        cache[p.anio][p.mes]['local_' + p.key] = l;
      });
      if (seccionActiva==='ampm') pendientesAMPM=[];
      else if (seccionActiva==='adm') pendientesADM=[];
      else if (seccionActiva==='qdm') pendientesQDM=[];
      else if (seccionActiva==='b2c') pendientesB2C=[];
      Promise.all(promesasFecha)
        .then(function() {
          actualizarBotonGuardar();
          render();
          cargarDatos();
        })
        .catch(function(e) {
          toast('Error al guardar cambios de fecha: ' + e.message, 'err');
          actualizarBotonGuardar();
          render();
        });
      return;
    }
    Promise.all(lotes[li].map(function(p) {
      const l = Object.assign({}, p.reg);
      delete l.pendiente;
      delete l._candidatos;
      return push(ref(db, RUTA_BASE + '/' + p.anio + '/' + p.mes), l).then(function(){g++;});
    }))
    .then(function(){ li++; setTimeout(proc,100); });
  };
  proc();
};

window.pedirBorrarRegistro = function(key, anio, mes, esPend) {
  pedirClave(function() {
    if (!confirm('El registro se eliminará de la DESCRIPCION, de la BASE DE DATOS y de FIREBASE.\nEsta acción no se puede deshacer.\n¿Confirmas?')) return;
    if (esPend) {
      let i = pendientesAMPM.findIndex(function(p){return p.key===key;});
      if (i>=0) pendientesAMPM.splice(i,1);
      else { 
        i = pendientesADM.findIndex(function(p){return p.key===key;}); 
        if (i>=0) pendientesADM.splice(i,1); 
        else { 
          i = pendientesQDM.findIndex(function(p){return p.key===key;}); 
          if (i>=0) pendientesQDM.splice(i,1); 
          else {
            i = pendientesB2C.findIndex(function(p){return p.key===key;}); 
            if (i>=0) pendientesB2C.splice(i,1); 
          }
        } 
      }
      if (cache[anio] && cache[anio][mes] && cache[anio][mes][key]) delete cache[anio][mes][key];
      delete cambiosFechaLocales[key];
      toast('Eliminado de la plataforma (pendiente)','ok');
      render();
      return;
    }
    const existeEnCache = cache[anio] && cache[anio][mes] && cache[anio][mes][key];
    if (!existeEnCache) { toast('El registro ya no existe','err'); return; }
    if (cache[anio] && cache[anio][mes] && cache[anio][mes][key]) delete cache[anio][mes][key];
    delete cambiosFechaLocales[key];
    remove(ref(db, RUTA_BASE + '/' + anio + '/' + mes + '/' + key))
      .then(function() { toast('Eliminado de plataforma y Firebase','ok'); render(); renderizarBaseDatos(); })
      .catch(function(e) { toast('Error al borrar: ' + e.message, 'err'); if (!cache[anio]) cache[anio] = {}; if (!cache[anio][mes]) cache[anio][mes] = {}; cache[anio][mes][key] = existeEnCache; render(); });
  });
};

window.enviarSeleccion = function() {
  if (seleccionadosDesc.size === 0) { toast('Selecciona al menos una fila', 'err'); return; }
  const tipoSec = tipoDeSeccion();
  const tipoBitacora = getBitacoraTipo();
  let enviados = 0;
  let errores = [];
  const bitacorasModificadas = new Set();
  seleccionadosDesc.forEach(function(key) {
    let reg = null;
    let anio = '', mes = '';
    outer: for (const a of Object.keys(cache)) {
      for (const m of Object.keys(cache[a]||{})) {
        if (cache[a][m] && cache[a][m][key]) { 
          reg = Object.assign({}, cache[a][m][key]); 
          anio = a; 
          mes = m; 
          break outer; 
        }
      }
    }
    if (!reg) {
      const p = pendientesAMPM.find(function(p){return p.key===key;}) || pendientesADM.find(function(p){return p.key===key;}) || pendientesQDM.find(function(p){return p.key===key;}) || pendientesB2C.find(function(p){return p.key===key;});
      if (p) { reg = Object.assign({}, p.reg); anio = p.anio; mes = p.mes; }
    }
    if (!reg) { errores.push('Registro ' + key + ' no encontrado'); return; }
    if (cambiosFechaLocales[key]) {
      reg.fecha = cambiosFechaLocales[key].nuevaFecha;
    }
    const transporte = (reg.transporte || '').toUpperCase();
    
    let bitKey = null;
    if (transporte === 'SPOT') {
      bitKey = tipoBitacora + '_spot';
    } else if (transporte === 'SPOT 1') {
      bitKey = tipoBitacora + '_spot1';
    } else if (transporte === 'SPOT 2') {
      bitKey = tipoBitacora + '_spot2';
    } else {
      const match = transporte.match(/MOVIL\s+(\d)/i);
      let movilNum = null;
      if (match) {
        movilNum = parseInt(match[1]);
      } else if (tipoSec === 'B2C' || tipoSec === 'QDM' || tipoSec === 'ADM') {
        movilNum = 1;
      }
      if (!movilNum || movilNum < 1 || movilNum > 6) { errores.push((reg.idPedido || key) + ': Transporte no válido'); return; }
      bitKey = tipoBitacora + '_movil' + movilNum;
    }
    
    const filaBitacora = {
      requirente: reg.unidad || '',
      documentos: reg.idPedido || '',
      cliente: reg.nombre || '',
      direccion: reg.direccion || '',
      comuna: reg.comuna || '',
      obs: reg.observacion || ''
    };
    if (!bitacorasData[bitKey]) {
      bitacorasData[bitKey] = { filas: [], footer: { transporte: transporte, fecha: reg.fecha || '', ruta: reg.rango || 'AM', responsable: '', firma: '' } };
    }
    let filaIdx = -1;
    for (let i = 0; i < 15; i++) {
      if (!bitacorasData[bitKey].filas[i] ||
          (!bitacorasData[bitKey].filas[i].requirente &&
           !bitacorasData[bitKey].filas[i].documentos &&
           !bitacorasData[bitKey].filas[i].cliente)) {
        filaIdx = i;
        break;
      }
    }
    if (filaIdx === -1) { errores.push((reg.idPedido || key) + ': Bitácora llena'); return; }
    bitacorasData[bitKey].filas[filaIdx] = filaBitacora;
    bitacorasModificadas.add(bitKey);
    enviados++;
  });
  if (enviados > 0) {
    const promesas = [];
    bitacorasModificadas.forEach(function(key) {
      promesas.push(update(ref(db, RUTA_BITACORAS + '/' + key), { filas: bitacorasData[key].filas, footer: bitacorasData[key].footer }));
    });
    Promise.all(promesas)
      .then(function() {
        toast(enviados + ' registro(s) enviado(s) a BITACORAS', 'ok');
        if (errores.length > 0) setTimeout(function() { toast(errores.length + ' error(es): ' + errores.slice(0,2).join(', '), 'err'); }, 1000);
        renderizarTodasBitacoras();
        seleccionadosDesc.clear();
        render();
      })
      .catch(function(e) { toast('Error al guardar bitácoras: ' + e.message, 'err'); console.error('Error detallado:', e); });
  } else {
    toast('No se pudo enviar', 'err');
    if (errores.length > 0) setTimeout(function() { toast('Errores: ' + errores.slice(0,3).join('; '), 'err'); }, 1000);
  }
};

document.getElementById('formReg').addEventListener('submit', function(e) {
  e.preventDefault();
  const fecha = document.getElementById('fFecha').value; 
  if (!fecha) { toast('Seleccione fecha','err'); return; }
  const parts = fecha.split('-');
  const a = parts[0];
  const m = parts[1];
  const rango = document.getElementById('fRango').value; 
  if (!rango) { toast('Elija RANGO','err'); return; }
  const tipoSec = tipoDeSeccion();
  
  if (tipoSec === 'B2C') {
    const reg = { 
      fecha: fecha, 
      unidad: document.getElementById('fUnidad').value, 
      idPedido: document.getElementById('fId').value.trim(), 
      nombre: document.getElementById('fNombre').value.trim().toUpperCase(), 
      celular:'', 
      email:'', 
      direccion: document.getElementById('fDireccion').value.trim().toUpperCase(), 
      comuna: canonComuna(document.getElementById('fComuna').value), 
      valor: parseFloat(document.getElementById('fValor').value)||0, 
      observacion: document.getElementById('fObs').value.toUpperCase(), 
      transporte:'SERVICIO B2C', 
      rango:'B2C', 
      tipo:'B2C', 
      otroPalet:false, 
      creado: new Date().toISOString(), 
      usuario: auth.currentUser ? auth.currentUser.email : '' 
    };
    pendientesB2C.push({ anio:a, mes:m, key:'pend_nr_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), reg: reg });
    toast('Agregado. Presiona GUARDAR.','info'); 
    limpiar(); 
    paginaDesc = 1; 
    render(); 
    actualizarBotonGuardar();
    return;
  }
  
  if (tipoSec === 'ADM') {
    const reg = { 
      fecha: fecha, 
      unidad: document.getElementById('fUnidad').value, 
      idPedido: document.getElementById('fId').value.trim(), 
      nombre: document.getElementById('fNombre').value.trim().toUpperCase(), 
      direccion: document.getElementById('fDireccion').value.trim().toUpperCase(), 
      comuna: canonComuna(document.getElementById('fComuna').value), 
      valor: parseFloat(document.getElementById('fValor').value)||0, 
      observacion: document.getElementById('fObs').value.toUpperCase(), 
      transporte:'SERVICIO ADM', 
      rango:rango, 
      tipo:'ADM', 
      otroPalet:false, 
      creado: new Date().toISOString(), 
      usuario: auth.currentUser ? auth.currentUser.email : '' 
    };
    pendientesADM.push({ anio:a, mes:m, key:'pend_nr_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), reg: reg });
    toast('Agregado. Presiona GUARDAR.','info'); 
    limpiar(); 
    paginaDesc = 1; 
    render(); 
    actualizarBotonGuardar();
    return;
  }
  
  if (tipoSec === 'QDM') {
    const reg = { 
      fecha: fecha, 
      unidad: document.getElementById('fUnidad').value, 
      idPedido: document.getElementById('fId').value.trim(), 
      nombre: document.getElementById('fNombre').value.trim().toUpperCase(), 
      direccion: document.getElementById('fDireccion').value.trim().toUpperCase(), 
      comuna: canonComuna(document.getElementById('fComuna').value), 
      valor: parseFloat(document.getElementById('fValor').value)||0, 
      observacion: document.getElementById('fObs').value.toUpperCase(), 
      transporte:'SERVICIO QDM', 
      rango:rango, 
      tipo:'QDM', 
      otroPalet:false, 
      creado: new Date().toISOString(), 
      usuario: auth.currentUser ? auth.currentUser.email : '' 
    };
    pendientesQDM.push({ anio:a, mes:m, key:'pend_nr_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), reg: reg });
    toast('Agregado. Presiona GUARDAR.','info'); 
    limpiar(); 
    paginaDesc = 1; 
    render(); 
    actualizarBotonGuardar();
    return;
  }
  
  let reg = { 
    fecha: fecha, 
    unidad: document.getElementById('fUnidad').value, 
    idPedido: document.getElementById('fId').value.trim(), 
    nombre: document.getElementById('fNombre').value.trim().toUpperCase(), 
    direccion: document.getElementById('fDireccion').value.trim().toUpperCase(), 
    comuna: canonComuna(document.getElementById('fComuna').value), 
    valor: parseFloat(document.getElementById('fValor').value)||0, 
    observacion: document.getElementById('fObs').value.toUpperCase(), 
    transporte: document.getElementById('fTransporte').value, 
    rango: rango, 
    tipo: 'AMPM', 
    otroPalet:false, 
    creado: new Date().toISOString(), 
    usuario: auth.currentUser ? auth.currentUser.email : '' 
  };
  // ✅ Solo REGLA AM y REGLA PM para AM/PM
  if (!reg.transporte) {
    if (esAntesDe1400()) {
      reg = autocompletarTransportePM(reg);
    } else if (esDespuesDe1401()) {
      const diaManana = obtenerDiaSemanaManana();
      reg = autocompletarTransporteAM(reg, diaManana);
    }
  }
  pendientesAMPM.push({ anio:a, mes:m, key:'pend_nr_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), reg: reg });
  toast('Agregado. Presiona GUARDAR.','info'); 
  limpiar(); 
  paginaDesc = 1; 
  render(); 
  actualizarBotonGuardar();
});

window.limpiar = function() { 
  document.getElementById('formReg').reset(); 
  document.getElementById('fFecha').valueAsDate = new Date(); 
};

window.abrirModalExportar = function() { 
  const tipo = tipoDeSeccion(); 
  const hoy = new Date().toISOString().split('T')[
</thinking>

<response>
Sí, entiendo. He revisado el contenido del archivo `index.html` que me proporcionaste.

¿En qué puedo ayudarte con este archivo o con tu proyecto de Despacho Retail?
