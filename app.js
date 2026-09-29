import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, get, push, remove, update, set } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged, setPersistence, browserLocalPersistence } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-auth.js";

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
const ADMIN_EMAILS = ['administradordr@generico.cl'];

const MESES_NOM = ['ENERO','FEBRERO','MARZO','ABRIL','MAYO','JUNIO','JULIO','AGOSTO','SEPTIEMBRE','OCTUBRE','NOVIEMBRE','DICIEMBRE'];
const DIAS_SEMANA = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
const DIAS_SEMANA_CORTO = ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
const REGISTROS_POR_PAGINA_MODAL = 100;
const REGISTROS_POR_PAGINA_BD = 50;
const REGISTROS_POR_PAGINA_DESC = 30;
const COSTO_POR_PARADA = 3500;
const OPCIONES_TRANSPORTE = ['MOVIL 1','MOVIL 2','MOVIL 3','MOVIL 4','MOVIL 5','MOVIL 6','DON RAUL','DON JOSE','SERVICIO AM/PM','SPOT','SPOT 1','SPOT 2','RETIRA CLIENTE','SERVICIO 3PL','TRANSGAMBOA'];
const OPCIONES_OBS = ['CASA CENTRAL','RETIRO','RETIRO CLIENTE','RETIRO CASA CENTRAL'];

function esAdmin(email) { return ADMIN_EMAILS.includes((email || '').toLowerCase().trim()); }
let rolActual = 'operador';
const mSec = (location.hash || '').match(/sec=([a-z]+)/);
let seccionInicial = mSec ? mSec[1] : '';

let cache = {};
let pendientes = [];
let pendientesAMPM = [];
let pendientesB2C = [];
let modoImportActual = '';
let seccionActiva = 'ampm';
let tabBdActiva = 'ampm';
let tipoBusquedaActual = 'AMPM';
let tipoImportacionActual = 'AMPM';
let tipoVerFechaActual = 'AMPM';
let datosModal = [];
let datosModalTotales = 0;
let paginaModalActual = 1;
let paginaBDAmpm = 1;
let paginaBDB2c = 1;
let paginaDesc = 1;
let tipoBorrarMes = 'AMPM';
let filtroDiaBD = { AMPM: '', B2C: '' };
let filtroMesBD = { AMPM: '', B2C: '' };
let filtroAnioBD = { AMPM: '', B2C: '' };
let filtroDescBD = {
  AMPM:  { unidad:'', comuna:'', transporte:'', rango:'' },
  B2C:   { unidad:'', comuna:'', transporte:'', rango:'' }
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

let infTipo = 'AMPM';
let infDatos = [];
let infCharts = {};
let infPeriodoActual = 'dia';
let infMovilActual = 'todos';
let infUnidadActual = 'todas';
let infTipoActual = 'AMPM';
let infMapaVista = 'mapa';
let infAuditLog = [];
let bitacorasData = {};

//  TABLA DE 53 SEMANAS OPERATIVAS 2026
const TABLA_SEMANAS_2026 = [
  { num: 1, inicio: '2025-12-29', fin: '2026-01-02', mes: 'Diciembre 2025 / Enero 2026' },
  { num: 2, inicio: '2026-01-05', fin: '2026-01-09', mes: 'Enero' },
  { num: 3, inicio: '2026-01-12', fin: '2026-01-16', mes: 'Enero' },
  { num: 4, inicio: '2026-01-19', fin: '2026-01-23', mes: 'Enero' },
  { num: 5, inicio: '2026-01-26', fin: '2026-01-30', mes: 'Enero' },
  { num: 6, inicio: '2026-02-02', fin: '2026-02-06', mes: 'Febrero' },
  { num: 7, inicio: '2026-02-09', fin: '2026-02-13', mes: 'Febrero' },
  { num: 8, inicio: '2026-02-16', fin: '2026-02-20', mes: 'Febrero' },
  { num: 9, inicio: '2026-02-23', fin: '2026-02-27', mes: 'Febrero' },
  { num: 10, inicio: '2026-03-02', fin: '2026-03-06', mes: 'Marzo' },
  { num: 11, inicio: '2026-03-09', fin: '2026-03-13', mes: 'Marzo' },
  { num: 12, inicio: '2026-03-16', fin: '2026-03-20', mes: 'Marzo' },
  { num: 13, inicio: '2026-03-23', fin: '2026-03-27', mes: 'Marzo' },
  { num: 14, inicio: '2026-03-30', fin: '2026-04-03', mes: 'Marzo / Abril' },
  { num: 15, inicio: '2026-04-06', fin: '2026-04-10', mes: 'Abril' },
  { num: 16, inicio: '2026-04-13', fin: '2026-04-17', mes: 'Abril' },
  { num: 17, inicio: '2026-04-20', fin: '2026-04-24', mes: 'Abril' },
  { num: 18, inicio: '2026-04-27', fin: '2026-05-01', mes: 'Abril / Mayo' },
  { num: 19, inicio: '2026-05-04', fin: '2026-05-08', mes: 'Mayo' },
  { num: 20, inicio: '2026-05-11', fin: '2026-05-15', mes: 'Mayo' },
  { num: 21, inicio: '2026-05-18', fin: '2026-05-22', mes: 'Mayo' },
  { num: 22, inicio: '2026-05-25', fin: '2026-05-29', mes: 'Mayo' },
  { num: 23, inicio: '2026-06-01', fin: '2026-06-05', mes: 'Junio' },
  { num: 24, inicio: '2026-06-08', fin: '2026-06-12', mes: 'Junio' },
  { num: 25, inicio: '2026-06-15', fin: '2026-06-19', mes: 'Junio' },
  { num: 26, inicio: '2026-06-22', fin: '2026-06-26', mes: 'Junio' },
  { num: 27, inicio: '2026-06-29', fin: '2026-07-03', mes: 'Junio / Julio' },
  { num: 28, inicio: '2026-07-06', fin: '2026-07-10', mes: 'Julio' },
  { num: 29, inicio: '2026-07-13', fin: '2026-07-17', mes: 'Julio' },
  { num: 30, inicio: '2026-07-20', fin: '2026-07-24', mes: 'Julio' },
  { num: 31, inicio: '2026-07-27', fin: '2026-07-31', mes: 'Julio' },
  { num: 32, inicio: '2026-08-03', fin: '2026-08-07', mes: 'Agosto' },
  { num: 33, inicio: '2026-08-10', fin: '2026-08-14', mes: 'Agosto' },
  { num: 34, inicio: '2026-08-17', fin: '2026-08-21', mes: 'Agosto' },
  { num: 35, inicio: '2026-08-24', fin: '2026-08-28', mes: 'Agosto' },
  { num: 36, inicio: '2026-08-31', fin: '2026-09-04', mes: 'Agosto / Septiembre' },
  { num: 37, inicio: '2026-09-07', fin: '2026-09-11', mes: 'Septiembre' },
  { num: 38, inicio: '2026-09-14', fin: '2026-09-18', mes: 'Septiembre' },
  { num: 39, inicio: '2026-09-21', fin: '2026-09-25', mes: 'Septiembre' },
  { num: 40, inicio: '2026-09-28', fin: '2026-10-02', mes: 'Septiembre / Octubre' },
  { num: 41, inicio: '2026-10-05', fin: '2026-10-09', mes: 'Octubre' },
  { num: 42, inicio: '2026-10-12', fin: '2026-10-16', mes: 'Octubre' },
  { num: 43, inicio: '2026-10-19', fin: '2026-10-23', mes: 'Octubre' },
  { num: 44, inicio: '2026-10-26', fin: '2026-10-30', mes: 'Octubre' },
  { num: 45, inicio: '2026-11-02', fin: '2026-11-06', mes: 'Noviembre' },
  { num: 46, inicio: '2026-11-09', fin: '2026-11-13', mes: 'Noviembre' },
  { num: 47, inicio: '2026-11-16', fin: '2026-11-20', mes: 'Noviembre' },
  { num: 48, inicio: '2026-11-23', fin: '2026-11-27', mes: 'Noviembre' },
  { num: 49, inicio: '2026-11-30', fin: '2026-12-04', mes: 'Noviembre / Diciembre' },
  { num: 50, inicio: '2026-12-07', fin: '2026-12-11', mes: 'Diciembre' },
  { num: 51, inicio: '2026-12-14', fin: '2026-12-18', mes: 'Diciembre' },
  { num: 52, inicio: '2026-12-21', fin: '2026-12-25', mes: 'Diciembre' },
  { num: 53, inicio: '2026-12-28', fin: '2027-01-01', mes: 'Diciembre 2026 / Enero 2027' }
];

// 🗺️ MAPA DE COMUNAS DE SANTIAGO
const COMUNAS_SANTIAGO_MAPA = [
  { nombre: 'Colina', x: 450, y: 30, w: 80, h: 50 },
  { nombre: 'Lampa', x: 370, y: 40, w: 80, h: 50 },
  { nombre: 'Tiltil', x: 300, y: 20, w: 70, h: 40 },
  { nombre: 'Quilicura', x: 430, y: 130, w: 70, h: 50 },
  { nombre: 'Huechuraba', x: 500, y: 130, w: 70, h: 50 },
  { nombre: 'Conchalí', x: 470, y: 180, w: 60, h: 40 },
  { nombre: 'Recoleta', x: 530, y: 180, w: 60, h: 40 },
  { nombre: 'Independencia', x: 490, y: 220, w: 60, h: 40 },
  { nombre: 'Renca', x: 400, y: 200, w: 70, h: 50 },
  { nombre: 'Cerro Navia', x: 320, y: 200, w: 70, h: 50 },
  { nombre: 'Lo Prado', x: 320, y: 250, w: 70, h: 50 },
  { nombre: 'Pudahuel', x: 240, y: 200, w: 80, h: 80 },
  { nombre: 'Quinta Normal', x: 400, y: 250, w: 60, h: 40 },
  { nombre: 'Estación Central', x: 460, y: 260, w: 70, h: 50 },
  { nombre: 'Santiago', x: 530, y: 260, w: 70, h: 50 },
  { nombre: 'Providencia', x: 600, y: 240, w: 70, h: 50 },
  { nombre: 'Ñuñoa', x: 600, y: 290, w: 70, h: 50 },
  { nombre: 'La Reina', x: 670, y: 240, w: 70, h: 50 },
  { nombre: 'Peñalolén', x: 670, y: 290, w: 70, h: 50 },
  { nombre: 'Macul', x: 600, y: 340, w: 70, h: 50 },
  { nombre: 'San Joaquín', x: 530, y: 340, w: 70, h: 50 },
  { nombre: 'Pedro Aguirre Cerda', x: 460, y: 340, w: 70, h: 50 },
  { nombre: 'Lo Espejo', x: 460, y: 390, w: 70, h: 50 },
  { nombre: 'San Miguel', x: 530, y: 390, w: 70, h: 50 },
  { nombre: 'La Cisterna', x: 530, y: 440, w: 70, h: 50 },
  { nombre: 'El Bosque', x: 530, y: 490, w: 70, h: 50 },
  { nombre: 'San Ramón', x: 600, y: 440, w: 70, h: 50 },
  { nombre: 'La Granja', x: 600, y: 490, w: 70, h: 50 },
  { nombre: 'La Pintana', x: 600, y: 540, w: 70, h: 50 },
  { nombre: 'Puente Alto', x: 670, y: 440, w: 80, h: 80 },
  { nombre: 'La Florida', x: 670, y: 360, w: 80, h: 70 },
  { nombre: 'San José de Maipo', x: 760, y: 400, w: 80, h: 80 },
  { nombre: 'Pirque', x: 760, y: 500, w: 70, h: 60 },
  { nombre: 'Las Condes', x: 670, y: 180, w: 90, h: 60 },
  { nombre: 'Vitacura', x: 670, y: 130, w: 70, h: 50 },
  { nombre: 'Lo Barnechea', x: 750, y: 130, w: 90, h: 80 },
  { nombre: 'Maipú', x: 320, y: 300, w: 80, h: 80 },
  { nombre: 'Cerrillos', x: 400, y: 340, w: 60, h: 50 },
  { nombre: 'San Bernardo', x: 460, y: 490, w: 80, h: 70 },
  { nombre: 'Calera de Tango', x: 540, y: 560, w: 70, h: 50 },
  { nombre: 'Buin', x: 540, y: 620, w: 70, h: 50 },
  { nombre: 'Paine', x: 620, y: 620, w: 70, h: 50 },
  { nombre: 'Talagante', x: 240, y: 340, w: 70, h: 60 },
  { nombre: 'El Monte', x: 160, y: 340, w: 70, h: 60 },
  { nombre: 'Isla de Maipo', x: 160, y: 410, w: 70, h: 60 },
  { nombre: 'Melipilla', x: 80, y: 340, w: 80, h: 80 },
  { nombre: 'Padre Hurtado', x: 320, y: 390, w: 70, h: 50 },
  { nombre: 'Peñaflor', x: 240, y: 410, w: 70, h: 50 },
  { nombre: 'Curacaví', x: 160, y: 480, w: 70, h: 50 },
  { nombre: 'María Pinto', x: 80, y: 480, w: 70, h: 50 },
  { nombre: 'Alhué', x: 80, y: 550, w: 70, h: 50 }
];

function tipoDeSeccion() {
  if (seccionActiva === 'b2c') return 'B2C';
  return 'AMPM';
}
function getBitacoraTipo() {
  if (seccionActiva === 'b2c') return 'b2c';
  return 'ampm';
}
function pendientesDeSeccion() {
  if (seccionActiva === 'b2c') return pendientesB2C;
  return pendientesAMPM;
}

function toast(msg, tipo) { const t = document.getElementById('toast'); t.textContent = msg; t.className = 'toast show ' + tipo; setTimeout(() => t.className = 'toast', 3000); }
function fmtFecha(f) { if (!f) return ''; const [y,m,d] = f.split('-'); return `${d}/${m}/${y}`; }
function nombreDiaSemana(f) { if (!f) return ''; const p = f.split('-'); if (p.length !== 3) return ''; return DIAS_SEMANA[new Date(Date.UTC(+p[0], +p[1]-1, +p[2])).getUTCDay()] || ''; }
function fmtFechaConDia(f) { if (!f) return ''; const [y,m,d] = f.split('-'); const dS = nombreDiaSemana(f); return dS ? `${dS}, ${d}-${m}-${y}` : `${d}-${m}-${y}`; }
function formatoMoneda(v) { return '$' + (Number(v)||0).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function formatoMonedaAlineado(v) {
  const num = Number(v) || 0;
  const formateado = num.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return `<span class="valor-alineado">$${formateado}</span>`;
}
function formatoEntero(v) { return Math.round(Number(v)||0).toLocaleString('es-CL'); }
function formatoPorcentaje(v) { return (Number(v)||0).toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %'; }
function getTipoRegistro(reg) { return reg.tipo || (reg.rango === 'B2C' ? 'B2C' : 'AMPM'); }
function sumaValores(regs) { return regs.reduce((s,r) => s + (((r.valor||0) === 1) ? 0 : (r.valor||0)), 0); }
function conteoUnPeso(regs) { return regs.filter(r => (r.valor||0) === 1).length; }
function sinTildes(s) { return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,''); }
function normSinTildes(s) { return sinTildes(String(s||'').toLowerCase()); }
function normEnc(h) { return sinTildes(h).toUpperCase(); }
function normDir(d) { return sinTildes((d||'').toString().trim().toUpperCase()); }

const CANON_COMUNAS = ['Arica','Camarones','Putre','General Lagos','Iquique','Alto Hospicio','Pozo Almonte','Camiña','Colchane','Huara','Pica','Antofagasta','Mejillones','Sierra Gorda','Taltal','Calama','Ollagüe','San Pedro de Atacama','María Elena','Tocopilla','Copiapó','Caldera','Tierra Amarilla','Chañaral','Diego de Almagro','Vallenar','Alto del Carmen','Freirina','Huasco','La Serena','Coquimbo','Andacollo','La Higuera','Paiguano','Vicuña','Illapel','Canela','Los Vilos','Salamanca','Ovalle','Combarbalá','Monte Patria','Punitaqui','Río Hurtado','Valparaíso','Casablanca','Concón','Juan Fernández','Puchuncaví','Quintero','Viña del Mar','Isla de Pascua','Los Andes','Calle Larga','Rinconada','San Esteban','La Ligua','Cabildo','Papudo','Petorca','Zapallar','Quillota','La Calera','Hijuelas','La Cruz','Nogales','San Antonio','Algarrobo','Cartagena','El Quisco','El Tabo','Santo Domingo','San Felipe','Catemu','Llaillay','Panquehue','Putaendo','Santa María','Limache','Olmué','Quilpué','Villa Alemana','Santiago','Cerrillos','Cerro Navia','Conchalí','El Bosque','Estación Central','Huechuraba','Independencia','La Cisterna','La Florida','La Granja','La Pintana','La Reina','Las Condes','Lo Barnechea','Lo Espejo','Lo Prado','Macul','Maipú','Ñuñoa','Pedro Aguirre Cerda','Pudahuel','Quilicura','Quinta Normal','Recoleta','Renca','San Joaquín','San Miguel','San Ramón','Vitacura','Puente Alto','Pirque','San José de Maipo','Colina','Lampa','Tiltil','Buin','Calera de Tango','Paine','San Bernardo','Alhué','Curacaví','María Pinto','Melipilla','Padre Hurtado','Peñaflor','Talagante','El Monte','Isla de Maipo','Rancagua','Codegua','Coinco','Coltauco','Doñihue','Graneros','Las Cabras','Machalí','Malloa','Mostazal','Olivar','Peumo','Pichidegua','Quinta de Tilcoco','Rengo','Requínoa','San Vicente','Pichilemu','La Estrella','Litueche','Marchihue','Navidad','Paredones','San Fernando','Chépica','Chimbarongo','Lolol','Nancagua','Palmilla','Peralillo','Placilla','Pumanque','Santa Cruz','Talca','Constitución','Curepto','Empedrado','Maule','Pelarco','Pencahue','Río Claro','San Clemente','San Rafael','Cauquenes','Chanco','Pelluhue','Curicó','Hualañé','Licantén','Molina','Rauco','Romeral','Sagrada Familia','Teno','Vichuquén','Linares','Colbún','Longaví','Parral','Retiro','San Javier','Villa Alegre','Yerbas Buenas','Chillán','Chillán Viejo','Bulnes','Cobquecura','Coelemu','Coihueco','El Carmen','Ninhue','Ñiquén','Pemuco','Pinto','Portezuelo','Quillón','Quirihue','Ránquil','San Carlos','San Fabián','San Ignacio','San Nicolás','Treguaco','Yungay','Concepción','Coronel','Chiguayante','Florida','Hualpén','Hualqui','Lota','Penco','San Pedro de la Paz','Santa Juana','Talcahuano','Tomé','Arauco','Cañete','Contulmo','Curanilahue','Lebu','Los Álamos','Tirúa','Los Ángeles','Antuco','Cabrero','Laja','Mulchén','Nacimiento','Negrete','Quilaco','Quilleco','San Rosendo','Santa Bárbara','Tucapel','Yumbel','Alto Biobío','Temuco','Carahue','Cholchol','Cunco','Curarrehue','Freire','Gorbea','Lautaro','Loncoche','Melipeuco','Nueva Imperial','Padre Las Casas','Perquenco','Pitrufquén','Pucón','Saavedra','Teodoro Schmidt','Toltén','Vilcún','Villarrica','Angol','Collipulli','Curacautín','Ercilla','Lonquimay','Los Sauces','Lumaco','Purén','Renaico','Traiguén','Victoria','Valdivia','Corral','Lanco','Los Lagos','Máfil','Mariquina','Paillaco','Panguipulli','La Unión','Futrono','Lago Ranco','Río Bueno','Puerto Montt','Calbuco','Cochamó','Fresia','Frutillar','Llanquihue','Los Muermos','Maullín','Puerto Varas','Ancud','Castro','Chonchi','Curaco de Vélez','Dalcahue','Puqueldón','Queilén','Quellón','Quemchi','Quinchao','Osorno','Puerto Octay','Purranque','Puyehue','Río Negro','San Juan de la Costa','San Pablo','Chaitén','Futaleufú','Hualaihué','Palena','Coyhaique','Lago Verde','Aysén','Cisnes','Guaitecas','Cochrane','O\'Higgins','Tortel','Chile Chico','Río Ibáñez','Punta Arenas','Laguna Blanca','Río Verde','San Gregorio','Cabo de Hornos','Antártica','Porvenir','Primavera','Timaukel','Natales','Torres del Paine'];

const MAPA_COMUNAS = {};
CANON_COMUNAS.forEach(c => { MAPA_COMUNAS[sinTildes(c).toLowerCase()] = c; });

function canonComuna(t) { const t2 = String(t||'').trim(); if (!t2) return ''; const k = sinTildes(t2).toLowerCase(); return MAPA_COMUNAS[k] || t2.toLowerCase().replace(/(^|\s)\S/g, s => s.toUpperCase()); }

const COMUNAS_RM = ['SANTIAGO','PROVIDENCIA','NUNOA','LAS CONDES','VITACURA','LO BARNECHEA','MACUL','PENALOLEN','LA FLORIDA','PUENTE ALTO','SAN MIGUEL','SAN JOAQUIN','LA CISTERNA','SAN BERNARDO','EL BOSQUE','LA PINTANA','SAN RAMON','PEDRO AGUIRRE CERDA','LO ESPEJO','CERRILLOS','MAIPU','PUDAHUEL','RENCA','QUILICURA','CONCHALI','HUECHURABA','INDEPENDENCIA','RECOLETA','LA REINA','LO PRADO','QUINTA NORMAL','CERRO NAVIA','SAN PABLO','COLINA','LAMPA','PADRE HURTADO','TALAGANTE','PENAFLOR','BUIN','PAINE','CALERA DE TANGO','ISLA DE MAIPO','MELIPILLA','SAN JOSE DE MAIPO','PIRQUE','EL MONTE','CURACAVI','MARIA PINTA','ALHUE','TILTIL'];

function levenshtein(a, b) { if (a === b) return 0; if (!a.length) return b.length; if (!b.length) return a.length; let prev = Array.from({ length: b.length + 1 }, (_, i) => i); for (let i = 1; i <= a.length; i++) { const cur = [i]; for (let j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j-1] + 1, prev[j-1] + (a[i-1] === b[j-1] ? 0 : 1)); } prev = cur; } return prev[b.length]; }
function similar(a, b) { if (a === b) return true; if (Math.abs(a.length - b.length) > 1) return false; return levenshtein(a, b) <= 1; }
function limpiarDireccion(dir, comuna) {
  const partes = String(dir || '').split(',').map(s => s.trim()).filter(s => s !== '');
  const nc = comuna ? sinTildes(String(comuna).trim().toUpperCase()) : '';
  return partes.filter(p => { const np = sinTildes(String(p).trim().toUpperCase()); return np !== 'CHILE' && !(nc && np === nc) && !COMUNAS_RM.some(c => similar(np, c)); }).join(', ');
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
  return rows.filter(r => r.some(c => String(c).trim() !== ''));
}

function leerFilas(file, cb) {
  const n = file.name.toLowerCase();
  const reader = new FileReader();
  if (esCSV(n)) { reader.onload = e => { try { cb(parseCSVText(e.target.result)); } catch (e2) { toast('CSV inválido: ' + e2.message, 'err'); } }; reader.readAsText(file); }
  else { reader.onload = e => { try { const wb = XLSX.read(new Uint8Array(e.target.result), { type: 'array', cellDates: true }); cb(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '', raw: true })); } catch (e2) { toast('Archivo inválido: ' + e2.message, 'err'); } }; reader.readAsArrayBuffer(file); }
}

function ordenarPorFechaDireccionId(regs) { regs.sort((a,b) => (a.fecha||'').localeCompare(b.fecha||'') || normDir(dirDe(a)).localeCompare(normDir(dirDe(b))) || (a.idPedido||'').toString().localeCompare((b.idPedido||'').toString())); return regs; }
function ordenarPorFechaYId(regs) { regs.sort((a,b) => (a.fecha||'').localeCompare(b.fecha||'') || (a.idPedido||'').toString().localeCompare((b.idPedido||'').toString())); return regs; }
function detectarDireccionesRepetidas(regs) { const c = {}; regs.forEach(r => { const d = normDir(dirDe(r)); if (d && r.fecha) { const k = `${r.fecha}|${d}`; c[k] = (c[k]||0)+1; } }); return c; }
function detectarIdsRepetidosPorFecha(regs) { const c = {}; regs.forEach(r => { const id = (r.idPedido||'').toString().trim().toUpperCase(); if (id && r.fecha) { const k = `${r.fecha}|${id}`; c[k] = (c[k]||0)+1; } }); return c; }
function detectarIdsRepetidosGlobal(regs) { const c = {}; regs.forEach(r => { const id = (r.idPedido||'').toString().trim().toUpperCase(); if (id) c[id] = (c[id]||0)+1; }); return c; }
function detectarMesAnioDesdeNombre(nombre) { const up = sinTildes(nombre).toUpperCase(); let mes = null, anio = null; for (let i = 0; i < MESES_NOM.length; i++) if (up.includes(MESES_NOM[i])) { mes = String(i+1).padStart(2,'0'); break; } if (!mes) { const c = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']; for (let i = 0; i < c.length; i++) if (up.includes(c[i])) { mes = String(i+1).padStart(2,'0'); break; } } const m = nombre.match(/(20\d{2})/); if (m) anio = m[1]; return { mes, anio }; }
function diaSemanaNumero(f) { if (!f) return 0; const p = f.split('-'); if (p.length !== 3) return 0; return new Date(Date.UTC(+p[0], +p[1]-1, +p[2])).getUTCDay(); }
function coincideClave(t, c) { const esc = c.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); return new RegExp('(^|[^a-z0-9])' + esc + '($|[^a-z0-9])').test(t); }
function parsearValor(v) { if (v === null || v === undefined || v === '') return 0; if (typeof v === 'number') return v; let s = String(v).trim().replace(/\s/g,'').replace(/[$€]/g,''); if (!s) return 0; if (s.includes(',') && s.includes('.')) { if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g,'').replace(',', '.'); else s = s.replace(/,/g,''); } else if (s.includes(',')) s = s.replace(',', '.'); else if (s.includes('.')) { const p = s.split('.'); if (p.length > 2) s = s.replace(/\./g,''); else if (p[1].length === 3) s = s.replace(/\./g,''); } s = s.replace(/[^\d.\-]/g,''); const n = parseFloat(s); return isNaN(n) ? 0 : n; }
function parsearFecha(raw) {
  if (raw instanceof Date) { if (isNaN(raw.getTime())) return null; return `${raw.getUTCFullYear()}-${String(raw.getUTCMonth()+1).padStart(2,'0')}-${String(raw.getUTCDate()).padStart(2,'0')}`; }
  if (typeof raw === 'number') { const d = new Date(Math.round((raw - 25569) * 86400 * 1000)); if (isNaN(d.getTime())) return null; return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`; }
  if (typeof raw === 'string') { let s = raw.trim().replace(/[T\s]+\d{1,2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/i, '').trim(); let m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/); if (m) return `${m[1]}-${m[2].padStart(2,'0')}-${m[3].padStart(2,'0')}`; m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/); if (m) return `${m[3]}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2})$/); if (m) { const a = parseInt(m[3]) > 50 ? `19${m[3]}` : `20${m[3]}`; return `${a}-${m[2].padStart(2,'0')}-${m[1].padStart(2,'0')}`; } const d = new Date(s); if (!isNaN(d.getTime())) return `${d.getUTCFullYear()}-${String(d.getUTCMonth()+1).padStart(2,'0')}-${String(d.getUTCDate()).padStart(2,'0')}`; }
  return null;
}

// 🚫 ELIMINADAS: REGLAS_MOVIL_POR_DIA, REGLAS_MOVIL_POR_DIA_ADM, candidatosMovil, candidatosMovilAdm, autocompletarTransporteNuevo, autocompletarTransporteNuevoAdm

function pedirClave(onOk) {
  pwCallback = onOk;
  const inp = document.getElementById('pwInput');
  if (inp) inp.value = '';
  document.getElementById('passwordOverlay').classList.add('show');
  setTimeout(() => { if (inp) inp.focus(); }, 60);
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

window.toggleCalendario = function() {
  const popup = document.getElementById('calendarioPopup');
  if (!popup) return;
  calendarioAbierto = !calendarioAbierto;
  if (calendarioAbierto) { renderizarCalendario(); popup.classList.add('show'); }
  else { popup.classList.remove('show'); }
};

function renderizarCalendario() {
  const popup = document.getElementById('calendarioPopup');
  if (!popup) return;
  const hoy = new Date();
  const primerDia = new Date(calendarioAnio, calendarioMes, 1);
  const ultimoDia = new Date(calendarioAnio, calendarioMes + 1, 0);
  const diasEnMes = ultimoDia.getDate();
  let primerDiaSemana = primerDia.getDay();
  if (primerDiaSemana === 0) primerDiaSemana = 7;
  const fechaInput = document.getElementById('fFecha');
  const fechaSeleccionada = fechaInput ? fechaInput.value : '';
  let html = `<div class="calendario-header"><button onclick="cambiarMesCalendario(-1)">◀</button><span>${MESES_NOM[calendarioMes].charAt(0) + MESES_NOM[calendarioMes].slice(1).toLowerCase()} ${calendarioAnio}</span><button onclick="cambiarMesCalendario(1)">▶</button></div><div class="calendario-grid">`;
  DIAS_SEMANA_CORTO.forEach(d => { html += `<div class="dia-semana">${d}</div>`; });
  for (let i = 1; i < primerDiaSemana; i++) { html += `<div class="dia vacio"></div>`; }
  for (let d = 1; d <= diasEnMes; d++) {
    const fechaStr = `${calendarioAnio}-${String(calendarioMes + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const esHoy = (d === hoy.getDate() && calendarioMes === hoy.getMonth() && calendarioAnio === hoy.getFullYear());
    const esSeleccionado = (fechaStr === fechaSeleccionada);
    let clases = 'dia';
    if (esHoy) clases += ' hoy';
    if (esSeleccionado) clases += ' seleccionado';
    html += `<div class="${clases}" onclick="seleccionarFechaCalendario('${fechaStr}')">${d}</div>`;
  }
  html += `</div>`;
  popup.innerHTML = html;
}

window.cambiarMesCalendario = function(delta) {
  calendarioMes += delta;
  if (calendarioMes > 11) { calendarioMes = 0; calendarioAnio++; }
  if (calendarioMes < 0) { calendarioMes = 11; calendarioAnio--; }
  renderizarCalendario();
};

window.seleccionarFechaCalendario = function(fecha) {
  const input = document.getElementById('fFecha');
  if (input) input.value = fecha;
  calendarioAbierto = false;
  const popup = document.getElementById('calendarioPopup');
  if (popup) popup.classList.remove('show');
  paginaDesc = 1;
  render();
};

window.toggleCalFila = function(key, event) {
  if (event) event.stopPropagation();
  document.querySelectorAll('.cal-popup-fila.show').forEach(p => p.classList.remove('show'));
  const popup = document.getElementById('cal_popup_' + key);
  if (!popup) return;
  if (calFilaAbierto === key) { popup.classList.remove('show'); calFilaAbierto = null; return; }
  let fechaActual = obtenerFechaActualRegistro(key);
  if (fechaActual) {
    const [y, mo, d] = fechaActual.split('-').map(Number);
    calFilaMes = mo - 1; calFilaAnio = y;
  } else { calFilaMes = new Date().getMonth(); calFilaAnio = new Date().getFullYear(); }
  calFilaAbierto = key;
  renderizarCalFila(key, fechaActual);
  popup.classList.add('show');
};

function obtenerFechaActualRegistro(key) {
  if (cambiosFechaLocales[key]) return cambiosFechaLocales[key].nuevaFecha;
  let p = pendientesAMPM.find(p=>p.key===key) || pendientesB2C.find(p=>p.key===key);
  if (p) return p.reg.fecha;
  for (const a of Object.keys(cache)) {
    for (const m of Object.keys(cache[a]||{})) {
      if (cache[a][m] && cache[a][m][key]) return cache[a][m][key].fecha;
    }
  }
  return null;
}

function renderizarCalFila(key, fechaSeleccionada) {
  const popup = document.getElementById('cal_popup_' + key);
  if (!popup) return;
  const hoy = new Date();
  const primerDia = new Date(calFilaAnio, calFilaMes, 1);
  const ultimoDia = new Date(calFilaAnio, calFilaMes + 1, 0);
  const diasEnMes = ultimoDia.getDate();
  let primerDiaSemana = primerDia.getDay();
  if (primerDiaSemana === 0) primerDiaSemana = 7;
  let html = `<div class="cal-header-fila"><button onclick="cambiarMesCalFila('${key}', -1, event)">◀</button><span>${MESES_NOM[calFilaMes].charAt(0) + MESES_NOM[calFilaMes].slice(1).toLowerCase()} ${calFilaAnio}</span><button onclick="cambiarMesCalFila('${key}', 1, event)">▶</button></div><div class="cal-grid-fila">`;
  DIAS_SEMANA_CORTO.forEach(d => { html += `<div class="dia-semana">${d}</div>`; });
  for (let i = 1; i < primerDiaSemana; i++) { html += `<div class="dia vacio"></div>`; }
  for (let d = 1; d <= diasEnMes; d++) {
    const fechaStr = `${calFilaAnio}-${String(calFilaMes + 1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
    const esHoy = (d === hoy.getDate() && calFilaMes === hoy.getMonth() && calFilaAnio === hoy.getFullYear());
    const esSeleccionado = (fechaStr === fechaSeleccionada);
    let clases = 'dia';
    if (esHoy) clases += ' hoy';
    if (esSeleccionado) clases += ' seleccionado';
    html += `<div class="${clases}" onclick="seleccionarFechaFila('${key}', '${fechaStr}', event)">${d}</div>`;
  }
  html += `</div>`;
  popup.innerHTML = html;
}

window.cambiarMesCalFila = function(key, delta, event) {
  if (event) event.stopPropagation();
  calFilaMes += delta;
  if (calFilaMes > 11) { calFilaMes = 0; calFilaAnio++; }
  if (calFilaMes < 0) { calFilaMes = 11; calFilaAnio--; }
  const fechaActual = obtenerFechaActualRegistro(key);
  renderizarCalFila(key, fechaActual);
};

window.seleccionarFechaFila = function(key, nuevaFecha, event) {
  if (event) event.stopPropagation();
  const popup = document.getElementById('cal_popup_' + key);
  if (popup) popup.classList.remove('show');
  calFilaAbierto = null;
  const [nA, nM] = nuevaFecha.split('-');
  const fechaAnterior = obtenerFechaActualRegistro(key);
  if (fechaAnterior === nuevaFecha) { render(); return; }
  let p = pendientesAMPM.find(p=>p.key===key) || pendientesB2C.find(p=>p.key===key);
  if (p) {
    cambiosFechaLocales[key] = { esPendiente: true, nuevaFecha, nuevaAnio: nA, nuevaMes: nM };
    toast(`Fecha cambiada a ${fmtFechaConDia(nuevaFecha)} (pendiente de guardar)`, 'info');
    render();
    return;
  }
  for (const a of Object.keys(cache)) {
    for (const m of Object.keys(cache[a]||{})) {
      if (cache[a][m] && cache[a][m][key]) {
        cambiosFechaLocales[key] = { esPendiente: false, anioOriginal: a, mesOriginal: m, nuevaFecha, nuevaAnio: nA, nuevaMes: nM };
        toast(`Fecha cambiada a ${fmtFechaConDia(nuevaFecha)} (pendiente de guardar)`, 'info');
        render();
        return;
      }
    }
  }
  toast('Registro no encontrado', 'err');
};

window.cambiarFechaFila = function(key, nuevaFecha, esPend) {
  if (!nuevaFecha) return;
  const [nA, nM] = nuevaFecha.split('-');
  const fechaAnterior = obtenerFechaActualRegistro(key);
  if (fechaAnterior === nuevaFecha) return;
  let p = pendientesAMPM.find(p=>p.key===key) || pendientesB2C.find(p=>p.key===key);
  if (p) {
    cambiosFechaLocales[key] = { esPendiente: true, nuevaFecha, nuevaAnio: nA, nuevaMes: nM };
    toast(`Fecha cambiada a ${fmtFechaConDia(nuevaFecha)} (pendiente de guardar)`, 'info');
    render();
    return;
  }
  for (const a of Object.keys(cache)) {
    for (const m of Object.keys(cache[a]||{})) {
      if (cache[a][m] && cache[a][m][key]) {
        cambiosFechaLocales[key] = { esPendiente: false, anioOriginal: a, mesOriginal: m, nuevaFecha, nuevaAnio: nA, nuevaMes: nM };
        toast(`Fecha cambiada a ${fmtFechaConDia(nuevaFecha)} (pendiente de guardar)`, 'info');
        render();
        return;
      }
    }
  }
};

async function cargarDatos() {
  const inicio = performance.now(); toast('Cargando datos...', 'info');
  cache = {};
  const anios = [2026,2027,2028,2029,2030]; const tareas = [];
  anios.forEach(anio => { for (let mes = 1; mes <= 12; mes++) { const ms = String(mes).padStart(2,'0');
    tareas.push(get(ref(db, `${RUTA_BASE}/${anio}/${ms}`)).then(s => ({t:'b', anio, ms, datos: s.val()})).catch(() => ({t:'b', anio, ms, datos: null}))); } });
  const res = await Promise.all(tareas); let total = 0;
  res.forEach(({t, anio, ms, datos}) => { if (datos) { if (!cache[anio]) cache[anio] = {}; cache[anio][ms] = datos; total += Object.keys(datos).length; } });
  document.getElementById('loading').style.display = 'none';
  toast(`Carga completa: ${total} registros (${((performance.now()-inicio)/1000).toFixed(1)}s)`, 'ok');
  render(); renderizarBaseDatos(); actualizarBotonGuardar();
  if (seccionActiva === 'informes') renderInformes();
  await cargarBitacoras();
}

async function cargarBitacoras() {
  try {
    const snap = await get(ref(db, RUTA_BITACORAS));
    bitacorasData = snap.val() || {};
    renderizarTodasBitacoras();
  } catch(e) { console.error('Error cargando bitácoras:', e); }
}

// 🚫 SIN AMPMADM
function renderizarTodasBitacoras() {
  ['ampm','b2c'].forEach(tipo => {
    for (let i = 1; i <= 6; i++) renderizarBitacora(tipo, i);
  });
}

function generarHTMLBitacora(tipo, movil) {
  const key = `${tipo}_movil${movil}`;
  const data = bitacorasData[key] || { filas: [], footer: { transporte: 'MOVIL '+movil, fecha: '', ruta: 'AM', responsable: '', firma: '' } };
  const filasConDatos = data.filas.filter(f => f && (f.requirente || f.documentos || f.cliente));
  let html = `<div class="bitacora-wrapper"><div class="bitacora-header-info">BITÁCORA MOVIL ${movil}</div><table class="bitacora-table"><thead><tr><th style="width:40px;">N°</th><th>REQUIRENTE</th><th>DOCUMENTOS</th><th>CLIENTE</th><th>DIRECCION</th><th>COMUNA</th><th>OBS</th></tr></thead><tbody>`;
  const maxFilas = Math.min(filasConDatos.length, 15);
  for (let i = 0; i < maxFilas; i++) {
    const fila = filasConDatos[i];
    html += `<tr><td class="num-col">${i+1}</td>`;
    html += `<td><input type="text" id="bit_${tipo}_${movil}_${i}_requirente" value="${(fila.requirente||'').replace(/"/g,'&quot;')}"></td>`;
    html += `<td><input type="text" id="bit_${tipo}_${movil}_${i}_documentos" value="${(fila.documentos||'').replace(/"/g,'&quot;')}"></td>`;
    html += `<td><input type="text" id="bit_${tipo}_${movil}_${i}_cliente" value="${(fila.cliente||'').replace(/"/g,'&quot;')}"></td>`;
    html += `<td><input type="text" id="bit_${tipo}_${movil}_${i}_direccion" value="${(fila.direccion||'').replace(/"/g,'&quot;')}"></td>`;
    html += `<td><input type="text" id="bit_${tipo}_${movil}_${i}_comuna" value="${(fila.comuna||'').replace(/"/g,'&quot;')}"></td>`;
    html += `<td><input type="text" id="bit_${tipo}_${movil}_${i}_obs" value="${(fila.obs||'').replace(/"/g,'&quot;')}"></td></tr>`;
  }
  for (let i = maxFilas; i < 15; i++) {
    html += `<tr><td class="num-col"></td>`;
    html += `<td><input type="text" id="bit_${tipo}_${movil}_${i}_requirente" value=""></td>`;
    html += `<td><input type="text" id="bit_${tipo}_${movil}_${i}_documentos" value=""></td>`;
    html += `<td><input type="text" id="bit_${tipo}_${movil}_${i}_cliente" value=""></td>`;
    html += `<td><input type="text" id="bit_${tipo}_${movil}_${i}_direccion" value=""></td>`;
    html += `<td><input type="text" id="bit_${tipo}_${movil}_${i}_comuna" value=""></td>`;
    html += `<td><input type="text" id="bit_${tipo}_${movil}_${i}_obs" value=""></td></tr>`;
  }
  html += `</tbody></table><table class="bitacora-footer-table"><thead><tr><th>TRANSPORTE</th><th>FECHA</th><th>RUTA</th><th>RESPONSABLE</th><th>FIRMA</th></tr></thead><tbody><tr>`;
  html += `<td style="background:#fff"><input type="text" id="bit_${tipo}_${movil}_footer_transporte" value="${(data.footer.transporte||'MOVIL '+movil).replace(/"/g,'&quot;')}"></td>`;
  html += `<td style="background:#fff"><input type="date" id="bit_${tipo}_${movil}_footer_fecha" value="${data.footer.fecha||''}"></td>`;
  html += `<td style="background:#fff"><input type="text" id="bit_${tipo}_${movil}_footer_ruta" value="${(data.footer.ruta||'AM').replace(/"/g,'&quot;')}"></td>`;
  html += `<td style="background:#fff"><input type="text" id="bit_${tipo}_${movil}_footer_responsable" value="${(data.footer.responsable||'').replace(/"/g,'&quot;')}"></td>`;
  html += `<td style="background:#fff"><input type="text" id="bit_${tipo}_${movil}_footer_firma" value="${(data.footer.firma||'').replace(/"/g,'&quot;')}"></td>`;
  html += `</tr></tbody></table></div>`;
  return html;
}

function renderizarBitacora(tipo, movil) {
  const cont = document.getElementById(`bitacora${tipo.charAt(0).toUpperCase()+tipo.slice(1)}Movil${movil}`);
  if (!cont) return;
  let html = `<div class="bitacora-actions"><button class="btn-bitacora btn-bitacora-guardar" onclick="guardarBitacora('${tipo}',${movil})">GUARDAR</button><button class="btn-bitacora btn-bitacora-excel" onclick="exportarBitacoraExcel('${tipo}',${movil})">EXPORTAR EXCEL</button><button class="btn-bitacora btn-bitacora-jpeg" onclick="exportarBitacoraJPEG('${tipo}',${movil})">EXPORTAR JPEG</button><button class="btn-bitacora" style="background:var(--accent-orange);color:#fff" onclick="imprimirBitacora('${tipo}',${movil})">IMPRIMIR</button></div><div id="bitacoraTable_${tipo}_${movil}">`;
  html += generarHTMLBitacora(tipo, movil);
  html += `</div>`;
  cont.innerHTML = html;
}

window.imprimirBitacora = function(tipo, movil) {
  const element = document.getElementById(`bitacoraTable_${tipo}_${movil}`);
  if (!element) { toast('Elemento no encontrado', 'err'); return; }
  const clone = element.cloneNode(true);
  const inputs = clone.querySelectorAll('input');
  inputs.forEach(inp => {
    const span = document.createElement('span');
    span.textContent = inp.value || '';
    span.style.cssText = 'display:block;width:100%;padding:4px;font-family:Arial,sans-serif;font-size:11px;';
    inp.parentNode.replaceChild(span, inp);
  });
  const printWindow = window.open('', '_blank', 'width=1200,height=900');
  if (!printWindow) { toast('Bloqueador de popups activo', 'err'); return; }
  const html = `<!DOCTYPE html><html><head><title>Bitácora Movil ${movil}</title><style>@page { size: letter landscape; margin: 10mm; }* { margin: 0; padding: 0; box-sizing: border-box; }body { font-family: Arial, sans-serif; padding: 10mm; background: #fff; }h2 { text-align: center; color: #1a5490; font-size: 18pt; margin-bottom: 12px; }table { width: 100%; border-collapse: collapse; margin-bottom: 12px; table-layout: auto; }th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; font-size: 11pt; background: #fff; }th { background: #1a5490; color: white; font-weight: bold; }.no-print { text-align: center; margin-top: 15px; }.no-print button { padding: 8px 16px; font-size: 12pt; cursor: pointer; margin: 0 5px; border: 1px solid #ccc; background: #f0f0f0; border-radius: 3px; }@media print { body { padding: 0; } .no-print { display: none; } table { page-break-inside: avoid; } }</style></head><body><h2>Bitácora Movil ${movil} - ${tipo.toUpperCase()}</h2>${clone.innerHTML}<div class="no-print"><button onclick="window.print()">Imprimir</button><button onclick="window.close()">Cerrar</button></div></body></html>`;
  printWindow.document.write(html);
  printWindow.document.close();
  toast('Ventana de impresión abierta', 'ok');
};

window.guardarBitacora = function(tipo, movil) {
  const key = `${tipo}_movil${movil}`;
  const filas = [];
  for (let i = 0; i < 15; i++) {
    const requirenteEl = document.getElementById(`bit_${tipo}_${movil}_${i}_requirente`);
    if (requirenteEl) {
      const fila = {
        requirente: requirenteEl.value || '',
        documentos: document.getElementById(`bit_${tipo}_${movil}_${i}_documentos`)?.value || '',
        cliente: document.getElementById(`bit_${tipo}_${movil}_${i}_cliente`)?.value || '',
        direccion: document.getElementById(`bit_${tipo}_${movil}_${i}_direccion`)?.value || '',
        comuna: document.getElementById(`bit_${tipo}_${movil}_${i}_comuna`)?.value || '',
        obs: document.getElementById(`bit_${tipo}_${movil}_${i}_obs`)?.value || ''
      };
      if (fila.requirente || fila.documentos || fila.cliente) filas.push(fila);
    }
  }
  const footer = {
    transporte: document.getElementById(`bit_${tipo}_${movil}_footer_transporte`)?.value || '',
    fecha: document.getElementById(`bit_${tipo}_${movil}_footer_fecha`)?.value || '',
    ruta: document.getElementById(`bit_${tipo}_${movil}_footer_ruta`)?.value || '',
    responsable: document.getElementById(`bit_${tipo}_${movil}_footer_responsable`)?.value || '',
    firma: document.getElementById(`bit_${tipo}_${movil}_footer_firma`)?.value || ''
  };
  bitacorasData[key] = { filas, footer };
  update(ref(db, `${RUTA_BITACORAS}/${key}`), { filas, footer })
    .then(() => toast('Bitácora guardada', 'ok'))
    .catch(e => toast('Error al guardar: ' + e.message, 'err'));
};

window.exportarBitacoraExcel = function(tipo, movil) {
  const key = `${tipo}_movil${movil}`;
  const data = bitacorasData[key] || { filas: [], footer: {} };
  const filasConDatos = data.filas.filter(f => f && (f.requirente || f.documentos || f.cliente));
  const wb = XLSX.utils.book_new();
  const wsData = [];
  wsData.push([`Bitácora Movil ${movil}`, '', '', '', '', '', '']);
  wsData.push(['', '', '', '', '', '', '']);
  wsData.push(['N°', 'Requirente', 'Documentos', 'Cliente', 'Direccion', 'Comuna', 'OBS']);
  for (let i = 0; i < filasConDatos.length; i++) {
    const fila = filasConDatos[i];
    wsData.push([i+1, fila.requirente||'', fila.documentos||'', fila.cliente||'', fila.direccion||'', fila.comuna||'', fila.obs||'']);
  }
  wsData.push(['', '', '', '', '', '', '']);
  wsData.push(['Transporte', 'Fecha', 'Ruta', 'Responsable', 'Firma', '', '']);
  wsData.push([data.footer.transporte||'', data.footer.fecha||'', data.footer.ruta||'', data.footer.responsable||'', data.footer.firma||'', '', '']);
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }];
  ws['!cols'] = [{ wch: 6 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 35 }, { wch: 18 }, { wch: 20 }];
  XLSX.utils.book_append_sheet(wb, ws, `Movil ${movil}`);
  const fecha = new Date().toISOString().split('T')[0];
  XLSX.writeFile(wb, `Bitacora_${tipo}_Movil${movil}_${fecha}.xlsx`);
  toast('Excel exportado', 'ok');
};

window.exportarBitacoraJPEG = function(tipo, movil) {
  const element = document.getElementById(`bitacoraTable_${tipo}_${movil}`);
  if (!element) { toast('Elemento no encontrado', 'err'); return; }
  const clone = element.cloneNode(true);
  const inputs = clone.querySelectorAll('input');
  inputs.forEach(inp => {
    const span = document.createElement('span');
    span.textContent = inp.value || '';
    span.style.cssText = 'display:block;width:100%;padding:4px 6px;font-family:Arial,sans-serif;font-size:11px;color:#000;white-space:normal;word-wrap:break-word;';
    inp.parentNode.replaceChild(span, inp);
  });
  const tables = clone.querySelectorAll('table');
  tables.forEach(t => { t.style.tableLayout = 'auto'; t.style.width = '100%'; });
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '0';
  clone.style.width = '1400px';
  clone.style.background = '#fff';
  clone.style.padding = '30px';
  clone.style.overflow = 'visible';
  document.body.appendChild(clone);
  html2canvas(clone, {
    backgroundColor: '#ffffff', scale: 2, useCORS: true, allowTaint: true, logging: false,
    width: 1400, windowWidth: 1400, windowHeight: clone.scrollHeight, scrollX: 0, scrollY: 0
  }).then(canvas => {
    document.body.removeChild(clone);
    const link = document.createElement('a');
    const fecha = new Date().toISOString().split('T')[0];
    link.download = `Bitacora_${tipo}_Movil${movil}_${fecha}.jpeg`;
    link.href = canvas.toDataURL('image/jpeg', 0.95);
    link.click();
    toast('JPEG exportado completo', 'ok');
  }).catch(e => {
    document.body.removeChild(clone);
    toast('Error al exportar JPEG: ' + e.message, 'err');
  });
};

onAuthStateChanged(auth, (user) => {
  if (user) {
    rolActual = esAdmin(user.email) ? 'admin' : 'operador';
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('appSection').style.display = 'flex';
    document.getElementById('userEmail').textContent = user.email + (rolActual === 'admin' ? '  (ADMIN)' : '');
    aplicarRol();
    cargarDatos().then(() => {
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
  const tabBD = document.querySelector('.seccion-tab[data-seccion="basedatos"]');
  const tabInf = document.querySelector('.seccion-tab[data-seccion="informes"]');
  if (rolActual === 'admin') {
    if (tabBD) tabBD.style.display = '';
    if (tabInf) tabInf.style.display = '';
  } else {
    if (tabBD) tabBD.style.display = 'none';
    if (tabInf) tabInf.style.display = 'none';
    if (seccionActiva === 'basedatos' || seccionActiva === 'informes') {
      cambiarSeccion('ampm');
    }
  }
}

window.login = function() {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPass').value;
  if (!email || !pass) { toast('Completa email y clave', 'err'); return; }
  setPersistence(auth, browserLocalPersistence).then(() =>
    signInWithEmailAndPassword(auth, email, pass)
  ).catch(e => toast('' + e.message, 'err'));
};

window.logout = function() {
  signOut(auth).then(() => { toast('Sesión cerrada', 'info'); })
    .catch(e => toast('Error al salir: ' + e.message, 'err'));
};

// 🚫 SIN AMPMADM
window.cambiarSeccion = function(sec) {
  if ((sec === 'basedatos' || sec === 'informes') && rolActual !== 'admin') {
    toast('Sin permiso para acceder a esta sección', 'err');
    return;
  }
  seccionActiva = sec;
  editandoKey = null;
  seleccionadosDesc.clear();
  document.querySelectorAll('.seccion-tab').forEach(t => t.classList.remove('active'));
  const tabBtn = document.querySelector(`.seccion-tab[data-seccion="${sec}"]`); if (tabBtn) tabBtn.classList.add('active');
  document.querySelectorAll('.secciones-bar > .seccion-contenido').forEach(c => c.classList.remove('show'));
  const cont = document.getElementById(`seccion${sec.charAt(0).toUpperCase()+sec.slice(1)}`); if (cont) cont.classList.add('show');
  document.body.classList.toggle('oculta-principal', (sec === 'basedatos' || sec === 'bitacoras' || sec === 'informes'));
  paginaDesc = 1; render();
  if (sec === 'basedatos') renderizarBaseDatos();
  if (sec === 'informes') renderInformes();
  if (sec === 'bitacoras') renderizarTodasBitacoras();
  actualizarBotonGuardar();
};

window.toggleSeccion = s => { document.getElementById(`contenido${s.charAt(0).toUpperCase()+s.slice(1)}`).classList.toggle('show'); document.getElementById(`flecha${s.charAt(0).toUpperCase()+s.slice(1)}`).classList.toggle('rotada'); };
window.toggleSubmenu = s => { document.getElementById(`submenu${s.charAt(0).toUpperCase()+s.slice(1)}`).classList.toggle('show'); document.getElementById(`flecha${s.charAt(0).toUpperCase()+s.slice(1)}`).classList.toggle('rotada'); };

//  SIN AMPMADM
window.cambiarTabBD = function(tab) {
  if (rolActual !== 'admin') return;
  tabBdActiva = tab;
  document.querySelectorAll('.basedatos-tab[data-tab]').forEach(t => t.classList.remove('active'));
  document.querySelector(`.basedatos-tab[data-tab="${tab}"]`).classList.add('active');
  document.querySelectorAll('#seccionBasedatos .basedatos-tab-content').forEach(c => c.classList.remove('show'));
  document.getElementById(tab === 'ampm' ? 'tabContentAmpm' : 'tabContentB2c').classList.add('show');
  renderizarBaseDatos();
};

window.cambiarTabBit = function(tab) {
  document.querySelectorAll('.basedatos-tab[data-btab]').forEach(t => t.classList.remove('active'));
  const b = document.querySelector(`.basedatos-tab[data-btab="${tab}"]`); if (b) b.classList.add('active');
  document.querySelectorAll('#seccionBitacoras .basedatos-tab-content').forEach(c => c.classList.remove('show'));
  document.getElementById(tab === 'ampm' ? 'bitContentAmpm' : 'bitContentB2c').classList.add('show');
  renderizarTodasBitacoras();
};

// 🚫 SIN AMPMADM
window.cambiarMovilBit = function(tipo, movil) {
  const cont = document.getElementById(tipo === 'ampm' ? 'bitContentAmpm' : 'bitContentB2c');
  if (!cont) return;
  cont.querySelectorAll('.bitacora-movil-tab').forEach(t => t.classList.remove('active'));
  cont.querySelector(`.bitacora-movil-tab[data-movil="${movil}"]`).classList.add('active');
  cont.querySelectorAll('.bitacora-movil-content').forEach(c => c.classList.remove('show'));
  document.getElementById(`bitacora${tipo.charAt(0).toUpperCase()+tipo.slice(1)}Movil${movil}`).classList.add('show');
};

window.cambiarTema = function(t) { document.documentElement.setAttribute('data-theme', t); document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.getAttribute('data-theme') === t)); localStorage.setItem('temaDespachoRetail', t); };

window.toggleSeleccionDesc = function(key, checked) { checked ? seleccionadosDesc.add(key) : seleccionadosDesc.delete(key); sincronizarSelTodos(); actualizarContadorEnviar(); };
window.toggleSeleccionarTodo = function(checked) { checked ? keysVisiblesDesc.forEach(k => seleccionadosDesc.add(k)) : keysVisiblesDesc.forEach(k => seleccionadosDesc.delete(k)); render(); };
function sincronizarSelTodos() { const el = document.getElementById('selTodosDesc'); if (el) el.checked = keysVisiblesDesc.length > 0 && keysVisiblesDesc.every(k => seleccionadosDesc.has(k)); }
function actualizarContadorEnviar() { const b = document.getElementById('btnEnviar'); if (b) b.textContent = seleccionadosDesc.size > 0 ? `ENVIAR A BITACORA (${seleccionadosDesc.size})` : 'ENVIAR A BITACORA'; }

function leerFiltrosDesc() {
  const g = id => { const el = document.getElementById(id); return el ? normSinTildes(el.value.trim()) : ''; };
  return { unidad: g('fDescUnidad'), comuna: g('fDescComuna'), transporte: g('fDescTransporte'), rango: g('fDescRango') };
}

function getDescBaseRows() {
  const f = document.getElementById('fFecha');
  const fechaTrabajo = (f && f.value) ? f.value : new Date().toISOString().split('T')[0];
  const tipoSec = tipoDeSeccion();
  let regs = [];
  Object.keys(cache).forEach(a => Object.keys(cache[a]||{}).forEach(m => Object.keys(cache[a][m]).forEach(k => { const r = { key:k, anio:a, mes:m, ...cache[a][m][k] }; if (getTipoRegistro(r) !== tipoSec) return; regs.push(r); })));
  const keysConCambios = Object.keys(cambiosFechaLocales);
  regs = regs.filter(r => {
    if (keysConCambios.includes(r.key)) return true;
    return r.fecha === fechaTrabajo;
  });
  pendientesDeSeccion().forEach(p => regs.push({ ...p.reg, key: p.key, anio: p.anio, mes: p.mes, pendiente: true }));
  return regs;
}

function getDistinctValues(col) {
  const rows = getDescBaseRows();
  const set = new Set();
  rows.forEach(r => {
    let v = '';
    if (col === 'unidad') v = r.unidad || '';
    else if (col === 'comuna') v = canonComuna(r.comuna) || '';
    else if (col === 'transporte') v = r.transporte || '';
    else if (col === 'rango') v = r.rango || '';
    if (v) set.add(v);
  });
  return [...set].sort();
}

function poblarCombo(col, filtro) {
  const list = document.getElementById('combo_' + col);
  if (!list) return;
  let vals = getDistinctValues(col);
  if (filtro) vals = vals.filter(v => normSinTildes(v).includes(normSinTildes(filtro)));
  list.innerHTML = vals.length
    ? vals.map(v => `<div class="combo-item" onmousedown="elegirOpcionCombo('${col}', \`${String(v).replace(/`/g,'\\`').replace(/'/g,"\\'")}\`)">${v}</div>`).join('')
    : '<div class="combo-item">Sin coincidencias</div>';
}

function poblarCombos() { ['unidad','comuna','transporte','rango'].forEach(col => { const inp = document.getElementById('fDesc' + col.charAt(0).toUpperCase() + col.slice(1)); poblarCombo(col, inp ? inp.value : ''); }); }

function cerrarTodosCombos() {
  document.querySelectorAll('.combo-list').forEach(l => {
    if (!l.id.startsWith('comboModal_') && !l.id.startsWith('comboBD_') && !l.id.startsWith('combo_trans_') && !l.id.startsWith('combo_obs_'))
      l.style.display = 'none';
  });
  comboAbierto = null; comboTransAbierto = null; comboObsAbierto = null;
  if (calendarioAbierto) { calendarioAbierto = false; const p = document.getElementById('calendarioPopup'); if (p) p.classList.remove('show'); }
  if (calFilaAbierto) { const p = document.getElementById('cal_popup_' + calFilaAbierto); if (p) p.classList.remove('show'); calFilaAbierto = null; }
}

window.toggleCombo = function(col) {
  const list = document.getElementById('combo_' + col);
  if (!list) return;
  if (comboAbierto === col) { list.style.display = 'none'; comboAbierto = null; }
  else { cerrarTodosCombos(); poblarCombo(col, ''); list.style.display = 'block'; comboAbierto = col; }
};

function abrirCombo(col) { cerrarTodosCombos(); poblarCombo(col, ''); const list = document.getElementById('combo_' + col); if (list) { list.style.display = 'block'; comboAbierto = col; } }

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
  if (val) vals = vals.filter(v => normSinTildes(v).includes(normSinTildes(val)));
  list.innerHTML = vals.length
    ? vals.map(v => `<div class="combo-item" onmousedown="elegirOpcionTransporte('${key}', '${v}')">${v}</div>`).join('')
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
  if (val) vals = vals.filter(v => normSinTildes(v).includes(normSinTildes(val)));
  list.innerHTML = vals.length
    ? vals.map(v => `<div class="combo-item" onmousedown="elegirOpcionTransporte('${key}', '${v}')">${v}</div>`).join('')
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
  let p = pendientesAMPM.find(p=>p.key===key) || pendientesB2C.find(p=>p.key===key);
  if (p) {
    if (p.reg.transporte !== nuevoTransporte) {
      p.reg.transporte = nuevoTransporte;
      if (cache[p.anio] && cache[p.anio][p.mes] && cache[p.anio][p.mes][key]) {
        update(ref(db, `${RUTA_BASE}/${p.anio}/${p.mes}/${key}`), { transporte: nuevoTransporte })
          .then(() => toast('Transporte actualizado', 'ok'))
          .catch(e => toast('Error: ' + e.message, 'err'));
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
          update(ref(db, `${RUTA_BASE}/${a}/${m}/${key}`), { transporte: nuevoTransporte })
            .then(() => toast('Transporte actualizado', 'ok'))
            .catch(e => toast('Error: ' + e.message, 'err'));
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
  if (val) vals = vals.filter(v => normSinTildes(v).includes(normSinTildes(val)));
  list.innerHTML = vals.length
    ? vals.map(v => `<div class="combo-item" onmousedown="elegirOpcionObs('${key}', '${v}')">${v}</div>`).join('')
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
  if (val) vals = vals.filter(v => normSinTildes(v).includes(normSinTildes(val)));
  list.innerHTML = vals.length
    ? vals.map(v => `<div class="combo-item" onmousedown="elegirOpcionObs('${key}', '${v}')">${v}</div>`).join('')
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
  let p = pendientesAMPM.find(p=>p.key===key) || pendientesB2C.find(p=>p.key===key);
  if (p) {
    p.reg.observacion = nuevaObs.toUpperCase();
    if (cache[p.anio] && cache[p.anio][p.mes] && cache[p.anio][p.mes][key]) {
      update(ref(db, `${RUTA_BASE}/${p.anio}/${p.mes}/${key}`), { observacion: nuevaObs.toUpperCase() });
    }
    render();
    return;
  }
  outer: for (const a of Object.keys(cache)) {
    for (const m of Object.keys(cache[a]||{})) {
      if (cache[a][m] && cache[a][m][key]) {
        cache[a][m][key].observacion = nuevaObs.toUpperCase();
        update(ref(db, `${RUTA_BASE}/${a}/${m}/${key}`), { observacion: nuevaObs.toUpperCase() });
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
  if (val) vals = vals.filter(v => normSinTildes(v).includes(normSinTildes(val)));
  list.innerHTML = vals.length
    ? vals.map(v => `<div class="combo-item" onmousedown="elegirOpcionObsEdicion('${v}')">${v}</div>`).join('')
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
  if (val) vals = vals.filter(v => normSinTildes(v).includes(normSinTildes(val)));
  list.innerHTML = vals.length
    ? vals.map(v => `<div class="combo-item" onmousedown="elegirOpcionObsEdicion('${v}')">${v}</div>`).join('')
    : '<div class="combo-item">Sin coincidencias</div>';
  list.style.display = 'block';
};

window.elegirOpcionObsEdicion = function(val) {
  const input = document.getElementById('edi_obs');
  if (input) input.value = val;
  const list = document.getElementById('combo_edicion_obs');
  if (list) list.style.display = 'none';
};

function renderDescThead() {
  const thead = document.getElementById('theadDesc');
  if (!thead) return;
  const b2c = (seccionActiva === 'b2c');
  const combo = (col, label) => `<th>${label}<div class="filtro-combo"><input type="text" class="th-filter" id="fDesc${col.charAt(0).toUpperCase()+col.slice(1)}" placeholder="Filtrar…" oninput="filtrarComboDesc('${col}', this.value)" onfocus="abrirCombo('${col}')"><button class="combo-arrow" onclick="toggleCombo('${col}')">▼</button><div class="combo-list" id="combo_${col}"></div></div></th>`;
  const sel = `<th class="th-sel"><input type="checkbox" id="selTodosDesc" style="width:16px;height:16px;" onchange="toggleSeleccionarTodo(this.checked)" title="Seleccionar todo"></th>`;
  let h;
  if (b2c) {
    h = sel + `<th>Fecha</th>` + combo('unidad','Unidad Negocio') + `<th>ID Pedido</th><th>Nombre Cliente</th><th>Celular</th><th>E-Mail</th><th>Dirección</th>` + combo('comuna','Comuna') + `<th>Valor Producto</th><th>Observación</th>` + combo('transporte','Transporte') + combo('rango','Rango') + `<th>Acciones</th>`;
  } else {
    h = sel + `<th>Fecha</th>` + combo('unidad','Unidad Negocio') + `<th>ID Pedido</th><th>Nombre Cliente</th><th>Dirección</th>` + combo('comuna','Comuna') + `<th>Valor</th><th>Observación</th>` + combo('transporte','Transporte') + combo('rango','Rango') + `<th>Acciones</th>`;
  }
  thead.innerHTML = `<tr>${h}</tr>`;
}

function render() {
  if (theadSeccion !== seccionActiva) { renderDescThead(); theadSeccion = seccionActiva; }
  poblarCombos();
  const busq = document.getElementById('buscar').value.toLowerCase();
  const f = document.getElementById('fFecha');
  const fechaTrabajo = (f && f.value) ? f.value : new Date().toISOString().split('T')[0];
  const tipoSec = tipoDeSeccion();
  let regs = [];
  Object.keys(cache).forEach(a => Object.keys(cache[a]||{}).forEach(m => Object.keys(cache[a][m]).forEach(k => { const r = { key:k, anio:a, mes:m, ...cache[a][m][k] }; if (getTipoRegistro(r) !== tipoSec) return; regs.push(r); })));
  const keysConCambios = Object.keys(cambiosFechaLocales);
  if (!busq) {
    regs = regs.filter(r => {
      if (keysConCambios.includes(r.key)) return true;
      return r.fecha === fechaTrabajo;
    });
  } else {
    regs = regs.filter(r => ['nombre','idPedido','transporte','comuna','unidad','celular','email'].some(c => (r[c]||'').toLowerCase().includes(busq)));
  }
  pendientesDeSeccion().forEach(p => regs.push({ ...p.reg, key: p.key, anio: p.anio, mes: p.mes, pendiente: true }));
  const fd = leerFiltrosDesc();
  if (fd.unidad) regs = regs.filter(r => normSinTildes(r.unidad||'').includes(fd.unidad));
  if (fd.comuna) regs = regs.filter(r => normSinTildes(canonComuna(r.comuna)||'').includes(fd.comuna));
  if (fd.transporte) regs = regs.filter(r => normSinTildes(r.transporte||'').includes(fd.transporte));
  if (fd.rango) regs = regs.filter(r => normSinTildes(r.rango||'').includes(fd.rango));
  ordenarPorFechaDireccionId(regs);
  document.getElementById('sTotal').textContent = formatoEntero(regs.length);
  document.getElementById('sValor').textContent = formatoMoneda(sumaValores(regs));
  document.getElementById('sAM').textContent = formatoEntero(regs.filter(r=>r.rango==='AM').length);
  document.getElementById('sPM').textContent = formatoEntero(regs.filter(r=>r.rango==='PM').length);
  const tbody = document.getElementById('tbody'), empty = document.getElementById('empty');
  if (regs.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; empty.textContent = busq ? 'No se encontraron resultados' : `No hay registros para el día ${fmtFechaConDia(fechaTrabajo)}`; keysVisiblesDesc = []; renderPaginacionDesc(0,0,0); sincronizarSelTodos(); actualizarContadorEnviar(); return; }
  empty.style.display = 'none';
  const tp = Math.max(1, Math.ceil(regs.length / REGISTROS_POR_PAGINA_DESC));
  if (paginaDesc > tp) paginaDesc = tp; if (paginaDesc < 1) paginaDesc = 1;
  const ini = (paginaDesc-1)*REGISTROS_POR_PAGINA_DESC;
  const pag = regs.slice(ini, ini+REGISTROS_POR_PAGINA_DESC);
  keysVisiblesDesc = pag.map(r => r.key);
  const cf = detectarIdsRepetidosPorFecha(regs), cg = detectarIdsRepetidosGlobal(regs), dr = detectarDireccionesRepetidas(regs);
  tbody.innerHTML = pag.map(r => filaHTMLTabla(r, cf, cg, dr)).join('');
  renderPaginacionDesc(tp, regs.length, paginaDesc);
  sincronizarSelTodos(); actualizarContadorEnviar(); actualizarBotonGuardar();
  sincronizarScrollHorizontal();
}

function sincronizarScrollHorizontal() {
  const top = document.getElementById('scrollTop');
  const bottom = document.getElementById('scrollBottom');
  if (!top || !bottom) return;
  top.onscroll = null; bottom.onscroll = null;
  top.onscroll = function() { bottom.scrollLeft = top.scrollLeft; };
  bottom.onscroll = function() { top.scrollLeft = bottom.scrollLeft; };
}

function renderPaginacionDesc(tp, total, pag) {
  let cont = document.getElementById('paginacionDesc');
  if (!cont) { cont = document.createElement('div'); cont.id = 'paginacionDesc'; cont.className = 'bd-paginacion'; cont.style.margin = '10px 0 0 0'; const sv = document.querySelector('.tabla-scroll-vertical'); if (sv) sv.appendChild(cont); }
  if (tp <= 1) { cont.innerHTML = total>0 ? `<div class="bd-paginacion-info">Mostrando ${formatoEntero(total)} de ${formatoEntero(total)} registros</div>` : ''; return; }
  const ini = (pag-1)*REGISTROS_POR_PAGINA_DESC, fin = Math.min(ini+REGISTROS_POR_PAGINA_DESC, total);
  let h = `<div class="bd-paginacion-info">Página ${pag} de ${tp} | ${formatoEntero(ini+1)}-${formatoEntero(fin)} de ${formatoEntero(total)} registros</div>`;
  h += pag>1 ? `<button class="btn-bd-pag-nav" onclick="irAPaginaDesc(${pag-1})">‹ Anterior</button>` : `<button class="btn-bd-pag-nav" disabled>‹ Anterior</button>`;
  const pI = Math.max(1,pag-2), pF = Math.min(tp,pag+2);
  if (pI>1){ h += `<button class="btn-bd-pag" onclick="irAPaginaDesc(1)">1</button>`; if(pI>2) h += `<span style="color:var(--text-muted);padding:0 4px">...</span>`; }
  for (let i=pI;i<=pF;i++) h += i===pag ? `<button class="btn-bd-pag activa">${i}</button>` : `<button class="btn-bd-pag" onclick="irAPaginaDesc(${i})">${i}</button>`;
  if (pF<tp){ if(pF<tp-1) h += `<span style="color:var(--text-muted);padding:0 4px">...</span>`; h += `<button class="btn-bd-pag" onclick="irAPaginaDesc(${tp})">${tp}</button>`; }
  h += pag<tp ? `<button class="btn-bd-pag-nav" onclick="irAPaginaDesc(${pag+1})">Siguiente ›</button>` : `<button class="btn-bd-pag-nav" disabled>Siguiente ›</button>`;
  cont.innerHTML = h;
}

window.irAPaginaDesc = p => { paginaDesc = p; render(); const sv = document.querySelector('.tabla-scroll-vertical'); if (sv) sv.scrollTop = 0; };

// 🚫 SIN color celeste ni autocompletado
function filaHTMLTabla(r, cf, cg, dr) {
  const b2c = (seccionActiva === 'b2c');
  const id = (r.idPedido||'').toString().trim().toUpperCase();
  const clave = `${r.fecha||''}|${id}`;
  const misma = id && cf[clave] > 1;
  const otra = !misma && id && cg[id] > 1;
  const dirShow = dirDe(r); const dirKey = `${r.fecha||''}|${normDir(dirShow)}`; const dirRep = dr[dirKey] > 1;
  const sel = seleccionadosDesc.has(r.key) ? 'checked' : '';
  let clase = '', ind = '';
  if (misma){ clase += 'id-repetido '; ind = `<span style="color:#fff;background:#e74c3c;padding:2px 6px;border-radius:4px;font-size:.7em;font-weight:700">x${cf[clave]}</span>`; }
  else if (otra){ clase += 'id-repetido-otro '; ind = `<span style="color:#fff;background:#ff8c00;padding:2px 6px;border-radius:4px;font-size:.7em;font-weight:700">x${cg[id]}</span>`; }
  if (r.otroPalet) clase += 'fila-amarillo ';
  const tieneCambioFecha = cambiosFechaLocales[r.key] !== undefined;
  if (tieneCambioFecha) clase += 'fila-fecha-modificada ';
  const bp = r.pendiente ? `<span class="badge badge-pendiente">SIN GUARDAR</span>` : '';
  const indicadorCambio = tieneCambioFecha ? `<span style="color:var(--accent-orange);font-size:.7em;font-weight:700;margin-left:4px" title="Fecha modificada (pendiente de guardar)">✏️</span>` : '';
  const fechaMostrar = tieneCambioFecha ? cambiosFechaLocales[r.key].nuevaFecha : r.fecha;
  const celdaFecha = `<td><div class="fecha-cell-wrap"><input type="date" value="${fechaMostrar||''}" onchange="cambiarFechaFila('${r.key}', this.value, ${r.pendiente?true:false})"><button type="button" class="btn-cal-fila" onclick="toggleCalFila('${r.key}', event)"></button><div class="cal-popup-fila" id="cal_popup_${r.key}"></div></div> ${bp}${indicadorCambio}</td>`;
  const celdaSel = `<td class="td-sel"><input type="checkbox" style="width:16px;height:16px;" ${sel} onchange="toggleSeleccionDesc('${r.key}', this.checked)"></td>`;

  if (r.key === editandoKey) {
    const fechaInput = `<td class="celda-edit"><input type="date" id="edi_fecha" value="${r.fecha||''}"></td>`;
    const unidadInput = `<td class="celda-edit"><input type="text" id="edi_unidad" value="${(r.unidad||'').replace(/"/g,'&quot;')}"></td>`;
    const idInput = `<td class="celda-edit"><input type="text" id="edi_id" value="${(r.idPedido||'').replace(/"/g,'&quot;')}"></td>`;
    const nombreInput = `<td class="celda-edit"><input type="text" id="edi_nombre" value="${(r.nombre||'').replace(/"/g,'&quot;')}"></td>`;
    const dirInput = `<td class="celda-edit"><input type="text" id="edi_direccion" value="${(r.direccion||'').replace(/"/g,'&quot;')}"></td>`;
    const comunaInput = `<td class="celda-edit"><input type="text" id="edi_comuna" value="${(r.comuna||'').replace(/"/g,'&quot;')}"></td>`;
    const obsInput = `<td class="celda-edit"><div class="obs-combo-wrap"><input type="text" id="edi_obs" value="${(r.observacion||'').replace(/"/g,'&quot;')}" oninput="filtrarComboObsEdicion(this.value)" onfocus="abrirComboObsEdicion()"><button class="combo-arrow" onclick="toggleComboObsEdicion()">▼</button><div class="combo-list" id="combo_edicion_obs"></div></div></td>`;
    const transInput = `<td class="celda-edit"><div class="filtro-combo" style="margin:0"><input type="text" id="edi_transporte" value="${(r.transporte||'').replace(/"/g,'&quot;')}" oninput="filtrarComboEdicion(this.value)" onfocus="abrirComboEdicion()"><button class="combo-arrow" onclick="toggleComboEdicion()">▼</button><div class="combo-list" id="combo_edicion_transporte"></div></div></td>`;
    const rangoInput = `<td class="celda-edit"><select id="edi_rango"><option value="">--</option><option value="AM" ${r.rango==='AM'?'selected':''}>AM</option><option value="PM" ${r.rango==='PM'?'selected':''}>PM</option><option value="B2C" ${r.rango==='B2C'?'selected':''}>B2C</option></select></td>`;
    const acc = `<td class="td-acciones"><button class="btn-acc" onclick="guardarEdicionInline('${r.key}','${r.anio}','${r.mes}',${r.pendiente?true:false})">✔</button><button class="btn-acc" onclick="cancelarEdicionInline()">#</button></td>`;
    if (b2c) return `<tr class="${clase}">${celdaSel}${fechaInput}${unidadInput}${idInput}${nombreInput}<td class="celda-edit"><input type="text" id="edi_celular" value="${(r.celular||'').replace(/"/g,'&quot;')}"></td><td class="celda-edit"><input type="text" id="edi_email" value="${(r.email||'').replace(/"/g,'&quot;')}"></td>${dirInput}${comunaInput}<td class="celda-edit">${formatoMonedaAlineado(r.valor)}</td>${obsInput}${transInput}${rangoInput}${acc}</tr>`;
    return `<tr class="${clase}">${celdaSel}${fechaInput}${unidadInput}${idInput}${nombreInput}${dirInput}${comunaInput}<td class="celda-edit">${formatoMonedaAlineado(r.valor)}</td>${obsInput}${transInput}${rangoInput}${acc}</tr>`;
  }

  let obs, trans, rango;
  if (r.pendiente) {
    obs = `<td class="celda-edit"><div class="obs-combo-wrap"><input type="text" id="obs_input_${r.key}" value="${(r.observacion||'').replace(/"/g,'&quot;')}" oninput="filtrarComboObs('${r.key}', this.value)" onfocus="abrirComboObs('${r.key}')"><button class="combo-arrow" onclick="toggleComboObs('${r.key}')">▼</button><div class="combo-list" id="combo_obs_${r.key}"></div></div></td>`;
    trans = `<td class="celda-edit"><div class="filtro-combo" style="margin:0"><input type="text" id="trans_input_${r.key}" value="${(r.transporte||'').replace(/"/g,'&quot;')}" oninput="filtrarComboTransporte('${r.key}', this.value)" onfocus="abrirComboTransporte('${r.key}')"><button class="combo-arrow" onclick="toggleComboTransporte('${r.key}')">▼</button><div class="combo-list" id="combo_trans_${r.key}"></div></div></td>`;
    rango = `<td class="celda-edit"><select onchange="editarRangoPendiente('${r.key}', this.value)"><option value="">--</option><option value="AM" ${r.rango==='AM'?'selected':''}>AM</option><option value="PM" ${r.rango==='PM'?'selected':''}>PM</option><option value="B2C" ${r.rango==='B2C'?'selected':''}>B2C</option></select></td>`;
  } else {
    obs = `<td><div class="obs-combo-wrap" style="display:inline-block;vertical-align:middle;width:100%"><input type="text" id="obs_input_${r.key}" value="${(r.observacion||'').replace(/"/g,'&quot;')}" oninput="filtrarComboObs('${r.key}', this.value)" onfocus="abrirComboObs('${r.key}')"><button class="combo-arrow" onclick="toggleComboObs('${r.key}')">▼</button><div class="combo-list" id="combo_obs_${r.key}"></div></div></td>`;
    trans = `<td><div class="filtro-combo" style="margin:0;display:inline-block;vertical-align:middle"><input type="text" id="trans_input_${r.key}" value="${(r.transporte||'').replace(/"/g,'&quot;')}" style="width:120px;padding-right:22px" oninput="filtrarComboTransporte('${r.key}', this.value)" onfocus="abrirComboTransporte('${r.key}')"><button class="combo-arrow" onclick="toggleComboTransporte('${r.key}')">▼</button><div class="combo-list" id="combo_trans_${r.key}"></div></div></td>`;
    rango = `<td><span class="badge badge-${(r.rango||'').toLowerCase()}">${r.rango||''}</span></td>`;
  }
  const acc = `<td class="td-acciones"><input type="checkbox" ${r.otroPalet?'checked':''} onchange="toggleOtroPalet('${r.key}', ${r.pendiente?true:false}, this.checked)"><button class="btn-acc btn-borrar" onclick="pedirBorrarRegistro('${r.key}','${r.anio}','${r.mes}',${r.pendiente?true:false})"></button></td>`;
  const valorCelda = `<td>${formatoMonedaAlineado(r.valor)}</td>`;
  if (b2c) {
    return `<tr class="${clase}">${celdaSel}${celdaFecha}<td><span class="badge badge-unidad">${r.unidad||''}</span></td><td><strong>${r.idPedido||''}</strong>${ind}</td><td>${r.nombre||''}</td><td>${r.celular||''}</td><td>${r.email||''}</td><td>${dirShow}${dirRep?` <span style="color:var(--accent-orange);font-size:.7em;font-weight:700">[misma dir x${dr[dirKey]}]</span>`:''}</td><td>${canonComuna(r.comuna)}</td>${valorCelda}${obs}${trans}${rango}${acc}</tr>`;
  }
  return `<tr class="${clase}">${celdaSel}${celdaFecha}<td><span class="badge badge-unidad">${r.unidad||''}</span></td><td><strong>${r.idPedido||''}</strong>${ind}</td><td>${r.nombre||''}</td><td>${dirShow}${dirRep?` <span style="color:var(--accent-orange);font-size:.7em;font-weight:700">[misma dir x${dr[dirKey]}]</span>`:''}</td><td>${canonComuna(r.comuna)}</td>${valorCelda}${obs}${trans}${rango}${acc}</tr>`;
}

window.filtrarComboEdicion = function(val) {
  const list = document.getElementById('combo_edicion_transporte');
  if (!list) return;
  let vals = OPCIONES_TRANSPORTE;
  if (val) vals = vals.filter(v => normSinTildes(v).includes(normSinTildes(val)));
  list.innerHTML = vals.length
    ? vals.map(v => `<div class="combo-item" onmousedown="elegirOpcionEdicion('${v}')">${v}</div>`).join('')
    : '<div class="combo-item">Sin coincidencias</div>';
  list.style.display = 'block';
};
window.abrirComboEdicion = function() { filtrarComboEdicion(''); };
window.toggleComboEdicion = function() {
  const list = document.getElementById('combo_edicion_transporte');
  if (!list) return;
  if (list.style.display === 'block') { list.style.display = 'none'; }
  else { filtrarComboEdicion(document.getElementById('edi_transporte')?.value || ''); }
};
window.elegirOpcionEdicion = function(val) {
  const input = document.getElementById('edi_transporte');
  if (input) input.value = val;
  const list = document.getElementById('combo_edicion_transporte');
  if (list) list.style.display = 'none';
};
window.editarObsPendiente = (k,v) => { const p = pendientesAMPM.find(p=>p.key===k) || pendientesB2C.find(p=>p.key===k); if (p) p.reg.observacion = v.toUpperCase(); };
window.editarRangoPendiente = (k,v) => { const p = pendientesAMPM.find(p=>p.key===k) || pendientesB2C.find(p=>p.key===k); if (p) p.reg.rango = v; };
window.toggleOtroPalet = function(key, esPend, checked) {
  if (esPend) { const p = pendientesAMPM.find(p=>p.key===key) || pendientesB2C.find(p=>p.key===key); if (p){ p.reg.otroPalet = checked; render(); } }
  else { outer: for (const a of Object.keys(cache)) for (const m of Object.keys(cache[a]||{})) if (cache[a][m] && cache[a][m][key]) { cache[a][m][key].otroPalet = checked; update(ref(db, `${RUTA_BASE}/${a}/${m}/${key}`), { otroPalet: checked }); break outer; }
    render(); }
};

function actualizarBotonGuardar() {
  const b = document.getElementById('btnGuardarAmpm');
  if (!b) return;
  b.style.display = 'inline-block';
  const numCambios = Object.keys(cambiosFechaLocales).length;
  if (numCambios > 0) {
    b.textContent = `GUARDAR (${numCambios} cambios pendientes)`;
    b.style.background = 'var(--accent-orange)';
  } else {
    b.textContent = 'GUARDAR';
    b.style.background = 'var(--accent-blue)';
  }
}

window.guardarPendientesSeccion = function() {
  const lista = pendientesDeSeccion();
  const numCambiosFecha = Object.keys(cambiosFechaLocales).length;
  if (!lista.length && numCambiosFecha === 0) { toast('No hay nada por guardar', 'info'); return; }
  const sR = lista.filter(p=>!p.reg.rango).length, sT = lista.filter(p=>!p.reg.transporte).length;
  if (sR || sT) { let m = 'NO SE PUEDE GUARDAR.\nFaltan campos OBLIGATORIOS:\n\n'; if (sR) m += `• ${sR} fila(s) sin RANGO.\n`; if (sT) m += `• ${sT} fila(s) sin TRANSPORTE.\n`; m += '\nCompleta y vuelve a presionar GUARDAR.'; toast('Faltan RANGO y/o TRANSPORTE','err'); alert(m); return; }
  if (!confirm(`Se guardarán ${formatoEntero(lista.length)} registros${numCambiosFecha > 0 ? ` y ${numCambiosFecha} cambio(s) de fecha` : ''}.\n¿Continuar?`)) return;
  toast('Guardando...','info');
  const promesasFecha = [];
  Object.keys(cambiosFechaLocales).forEach(key => {
    const cambio = cambiosFechaLocales[key];
    if (cambio.esPendiente) {
      const p = pendientesAMPM.find(p=>p.key===key) || pendientesB2C.find(p=>p.key===key);
      if (p) { p.reg.fecha = cambio.nuevaFecha; p.anio = cambio.nuevaAnio; p.mes = cambio.nuevaMes; }
    } else {
      const { anioOriginal, mesOriginal, nuevaAnio, nuevaMes, nuevaFecha } = cambio;
      if (cache[anioOriginal] && cache[anioOriginal][mesOriginal] && cache[anioOriginal][mesOriginal][key]) {
        const regData = { ...cache[anioOriginal][mesOriginal][key] };
        delete cache[anioOriginal][mesOriginal][key];
        if (!cache[nuevaAnio]) cache[nuevaAnio] = {};
        if (!cache[nuevaAnio][nuevaMes]) cache[nuevaAnio][nuevaMes] = {};
        regData.fecha = nuevaFecha;
        cache[nuevaAnio][nuevaMes][key] = regData;
        promesasFecha.push(
          remove(ref(db, `${RUTA_BASE}/${anioOriginal}/${mesOriginal}/${key}`))
            .then(() => set(ref(db, `${RUTA_BASE}/${nuevaAnio}/${nuevaMes}/${key}`), regData))
        );
      }
    }
  });
  cambiosFechaLocales = {};
  let g = 0; let li = 0; const lotes = []; for (let i=0;i<lista.length;i+=50) lotes.push(lista.slice(i,i+50));
  const proc = () => {
    if (li >= lotes.length) {
      lotes.flat().forEach(p => {
        const l = {...p.reg}; delete l.pendiente;
        if (!cache[p.anio]) cache[p.anio] = {};
        if (!cache[p.anio][p.mes]) cache[p.anio][p.mes] = {};
        cache[p.anio][p.mes]['local_' + p.key] = l;
      });
      if (seccionActiva==='b2c') pendientesB2C=[];
      else pendientesAMPM=[];
      Promise.all(promesasFecha)
        .then(() => { actualizarBotonGuardar(); render(); cargarDatos(); })
        .catch(e => { toast('Error al guardar cambios de fecha: ' + e.message, 'err'); actualizarBotonGuardar(); render(); });
      return;
    }
    Promise.all(lotes[li].map(p => { const l = {...p.reg}; delete l.pendiente; return push(ref(db, `${RUTA_BASE}/${p.anio}/${p.mes}`), l).then(()=>g++); }))
      .then(()=>{ li++; setTimeout(proc,100); });
  };
  proc();
};

window.pedirBorrarRegistro = function(key, anio, mes, esPend) {
  pedirClave(() => {
    if (!confirm('El registro se eliminará de la DESCRIPCION, de la BASE DE DATOS y de FIREBASE.\nEsta acción no se puede deshacer.\n¿Confirmas?')) return;
    if (esPend) {
      let i = pendientesAMPM.findIndex(p=>p.key===key);
      if (i>=0) pendientesAMPM.splice(i,1);
      else { i = pendientesB2C.findIndex(p=>p.key===key); if (i>=0) pendientesB2C.splice(i,1); }
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
    remove(ref(db, `${RUTA_BASE}/${anio}/${mes}/${key}`))
      .then(() => { toast('Eliminado de plataforma y Firebase','ok'); render(); renderizarBaseDatos(); })
      .catch(e => { toast('Error al borrar: ' + e.message, 'err'); if (!cache[anio]) cache[anio] = {}; if (!cache[anio][mes]) cache[anio][mes] = {}; cache[anio][mes][key] = existeEnCache; render(); });
  });
};

window.enviarSeleccion = function() {
  if (seleccionadosDesc.size === 0) { toast('Selecciona al menos una fila', 'err'); return; }
  const tipoSec = tipoDeSeccion();
  const tipoBitacora = getBitacoraTipo();
  let enviados = 0;
  let errores = [];
  const bitacorasModificadas = new Set();
  seleccionadosDesc.forEach(key => {
    let reg = null;
    let anio = '', mes = '';
    outer: for (const a of Object.keys(cache)) {
      for (const m of Object.keys(cache[a]||{})) {
        if (cache[a][m] && cache[a][m][key]) { reg = { ...cache[a][m][key] }; anio = a; mes = m; break outer; }
      }
    }
    if (!reg) {
      const p = pendientesAMPM.find(p=>p.key===key) || pendientesB2C.find(p=>p.key===key);
      if (p) { reg = { ...p.reg }; anio = p.anio; mes = p.mes; }
    }
    if (!reg) { errores.push(`Registro ${key} no encontrado`); return; }
    if (cambiosFechaLocales[key]) { reg.fecha = cambiosFechaLocales[key].nuevaFecha; }
    const transporte = (reg.transporte || '').toUpperCase();
    const match = transporte.match(/MOVIL\s+(\d)/i);
    let movilNum = null;
    if (match) { movilNum = parseInt(match[1]); }
    else if (tipoSec === 'B2C') { movilNum = 1; }
    if (!movilNum || movilNum < 1 || movilNum > 6) { errores.push(`${reg.idPedido || key}: Transporte no válido`); return; }
    const filaBitacora = {
      requirente: reg.unidad || '',
      documentos: reg.idPedido || '',
      cliente: reg.nombre || '',
      direccion: reg.direccion || '',
      comuna: reg.comuna || '',
      obs: reg.observacion || ''
    };
    const bitKey = `${tipoBitacora}_movil${movilNum}`;
    if (!bitacorasData[bitKey]) {
      bitacorasData[bitKey] = { filas: [], footer: { transporte: `MOVIL ${movilNum}`, fecha: reg.fecha || '', ruta: reg.rango || 'AM', responsable: '', firma: '' } };
    }
    let filaIdx = -1;
    for (let i = 0; i < 10; i++) {
      if (!bitacorasData[bitKey].filas[i] ||
          (!bitacorasData[bitKey].filas[i].requirente &&
           !bitacorasData[bitKey].filas[i].documentos &&
           !bitacorasData[bitKey].filas[i].cliente)) {
        filaIdx = i;
        break;
      }
    }
    if (filaIdx === -1) { errores.push(`${reg.idPedido || key}: Bitácora llena`); return; }
    bitacorasData[bitKey].filas[filaIdx] = filaBitacora;
    bitacorasModificadas.add(bitKey);
    enviados++;
  });
  if (enviados > 0) {
    const promesas = [];
    bitacorasModificadas.forEach(key => {
      promesas.push(update(ref(db, `${RUTA_BITACORAS}/${key}`), { filas: bitacorasData[key].filas, footer: bitacorasData[key].footer }));
    });
    Promise.all(promesas)
      .then(() => {
        toast(`${enviados} registro(s) enviado(s) a BITACORAS`, 'ok');
        if (errores.length > 0) setTimeout(() => toast(`${errores.length} error(es): ${errores.slice(0,2).join(', ')}`, 'err'), 1000);
        renderizarTodasBitacoras();
        seleccionadosDesc.clear();
        render();
      })
      .catch(e => { toast('Error al guardar bitácoras: ' + e.message, 'err'); console.error('Error detallado:', e); });
  } else {
    toast('No se pudo enviar', 'err');
    if (errores.length > 0) setTimeout(() => toast(`Errores: ${errores.slice(0,3).join('; ')}`, 'err'), 1000);
  }
};

// 🚫 SIN autocompletado
document.getElementById('formReg').addEventListener('submit', function(e) {
  e.preventDefault();
  const fecha = document.getElementById('fFecha').value; if (!fecha) { toast('Seleccione fecha','err'); return; }
  const [a,m] = fecha.split('-'); const rango = document.getElementById('fRango').value; if (!rango) { toast('Elija RANGO','err'); return; }
  const tipoSec = tipoDeSeccion();
  if (tipoSec === 'B2C') {
    const reg = { fecha, unidad: document.getElementById('fUnidad').value, idPedido: document.getElementById('fId').value.trim(), nombre: document.getElementById('fNombre').value.trim().toUpperCase(), celular:'', email:'', direccion: document.getElementById('fDireccion').value.trim().toUpperCase(), comuna: canonComuna(document.getElementById('fComuna').value), valor: parseFloat(document.getElementById('fValor').value)||0, observacion: document.getElementById('fObs').value.toUpperCase(), transporte:'SERVICIO B2C', rango:'B2C', tipo:'B2C', otroPalet:false, creado: new Date().toISOString(), usuario: auth.currentUser ? auth.currentUser.email : '' };
    pendientesB2C.push({ anio:a, mes:m, key:'pend_nr_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), reg });
    toast('Agregado. Presiona GUARDAR.','info'); limpiar(); paginaDesc = 1; render(); actualizarBotonGuardar();
    return;
  }
  const tipoReg = (rango==='B2C') ? 'B2C' : tipoSec;
  let reg = { fecha, unidad: document.getElementById('fUnidad').value, idPedido: document.getElementById('fId').value.trim(), nombre: document.getElementById('fNombre').value.trim().toUpperCase(), direccion: document.getElementById('fDireccion').value.trim().toUpperCase(), comuna: canonComuna(document.getElementById('fComuna').value), valor: parseFloat(document.getElementById('fValor').value)||0, observacion: document.getElementById('fObs').value.toUpperCase(), transporte: document.getElementById('fTransporte').value, rango, tipo: tipoReg, otroPalet:false, creado: new Date().toISOString(), usuario: auth.currentUser ? auth.currentUser.email : '' };
  // 🚫 SIN autocompletado
  pendientesAMPM.push({ anio:a, mes:m, key:'pend_nr_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), reg });
  toast('Agregado. Presiona GUARDAR.','info'); limpiar(); paginaDesc = 1; render(); actualizarBotonGuardar();
});
window.limpiar = function() { document.getElementById('formReg').reset(); document.getElementById('fFecha').valueAsDate = new Date(); };

window.abrirModalExportar = function() { const tipo = tipoDeSeccion(); const hoy = new Date().toISOString().split('T')[0];
  document.getElementById('expFilaFecha').style.display = 'none';
  document.getElementById('expTitulo').textContent = `Exportar a Excel — ${fmtFechaConDia(hoy)} (${tipo})`;
  document.getElementById('expInfo').textContent = `Registros del día: ${formatoEntero(contarRegsDelDia(tipo).length)}`;
  document.getElementById('exportarModal').classList.add('show'); };
window.actualizarExpInfo = function() { const tipo = tipoDeSeccion(); const hoy = new Date().toISOString().split('T')[0]; document.getElementById('expInfo').textContent = `Registros del día ${fmtFechaConDia(hoy)}: ${formatoEntero(contarRegsDelDia(tipo).length)}`; };
function contarRegsDelDia(tipo) { const hoy = new Date().toISOString().split('T')[0]; let r = obtenerRegsTipo(tipo).filter(r => r.fecha === hoy);
  if (tipo==='AMPM') r = r.concat(pendientesAMPM.map(p=>({...p.reg,key:p.key})));
  if (tipo==='B2C') r = r.concat(pendientesB2C.map(p=>({...p.reg,key:p.key})));
  return r; }
window.cerrarModalExportar = function() { document.getElementById('exportarModal').classList.remove('show'); };
window.confirmarExportar = function() {
  const cols = [{id:'expFecha',key:'fecha',label:'Fecha'},{id:'expUnidad',key:'unidad',label:'Unidad Negocio'},{id:'expIdPedido',key:'idPedido',label:'ID Pedido'},{id:'expNombre',key:'nombre',label:'Nombre Cliente'},{id:'expCelular',key:'celular',label:'Celular'},{id:'expEmail',key:'email',label:'E-Mail'},{id:'expDireccion',key:'direccion',label:'Dirección'},{id:'expComuna',key:'comuna',label:'Comuna'},{id:'expValor',key:'valor',label:'Valor'},{id:'expObservacion',key:'observacion',label:'Observación'},{id:'expTransporte',key:'transporte',label:'Transporte'},{id:'expRango',key:'rango',label:'Rango'}].filter(c => document.getElementById(c.id).checked);
  if (!cols.length) { toast('Elige al menos una columna','err'); return; }
  const tipo = tipoDeSeccion(); let regs = contarRegsDelDia(tipo); ordenarPorFechaDireccionId(regs);
  if (!regs.length) { toast('No hay registros del día','err'); return; }
  const datos = regs.map(r => { const f = {}; cols.forEach(c => { if (c.key==='fecha') f[c.label]=fmtFechaConDia(r.fecha); else if (c.key==='direccion') f[c.label]=dirDe(r); else if (c.key==='comuna') f[c.label]=canonComuna(r.comuna); else if (c.key==='valor') f[c.label]=formatoMoneda(r.valor); else f[c.label]=r[c.key]??''; }); return f; });
  const ws = XLSX.utils.json_to_sheet(datos); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Despachos');
  XLSX.writeFile(wb, `DespachoRetail_${tipo}_${new Date().toISOString().split('T')[0]}.xlsx`);
  toast(`Exportados ${formatoEntero(regs.length)} registros`,'ok'); cerrarModalExportar();
};

function procesarArchivoB2C(file, lista) {
  const ft = document.getElementById('fFecha').value || new Date().toISOString().split('T')[0];
  toast(`Leyendo ${file.name}...`, 'info');
  leerFilas(file, (filas) => { try {
    if (!filas || filas.length < 2) { toast('Archivo vacío','err'); return; }
    const enc = filas[0].map(normEnc);
    const col = { TRACKING: enc.findIndex(h => h.includes('TRACKING')), EMPRESA: enc.findIndex(h => h.includes('EMPRESA')), NOMBRE: enc.findIndex(h => h.includes('NOMBRE')), CELULAR: enc.findIndex(h => h.includes('CELULAR')), EMAIL: enc.findIndex(h => h.includes('EMAIL') || h.includes('MAIL')), DIRECCION: enc.findIndex(h => h.includes('DIRECCION')), COMUNA: enc.findIndex(h => h.includes('COMUNA')), VALOR: enc.findIndex(h => h.includes('VALOR')) };
    const [aT, mT] = ft.split('-'); const regs = [];
    for (let i = 1; i < filas.length; i++) {
      const row = filas[i]; if (!row || !row.length) continue;
      const gv = idx => (idx<0||idx>=row.length) ? '' : (row[idx]==null ? '' : String(row[idx]));
      const tr = String(gv(col.TRACKING)).trim(); if (!tr) continue;
      const comuna = canonComuna(gv(col.COMUNA));
      regs.push({ anio:aT, mes:mT, reg: { fecha: ft, unidad: String(gv(col.EMPRESA)).trim(), idPedido: tr, nombre: String(gv(col.NOMBRE)).trim(), celular: String(gv(col.CELULAR)).trim(), email: String(gv(col.EMAIL)).trim(), direccion: limpiarDireccion(gv(col.DIRECCION), comuna), comuna: comuna, valor: parsearValor(gv(col.VALOR)), observacion: '', transporte: 'SERVICIO B2C', rango: 'B2C', otroPalet: false, tipo: 'B2C', creado: new Date().toISOString(), importado: true } });
    }
    if (!regs.length) { toast('Sin filas con N° de tracking','err'); return; }
    if (lista) { lista.push(...regs); paginaDesc = 1; toast(`${formatoEntero(regs.length)} filas B2C cargadas. Presiona GUARDAR.`,'info'); render(); }
    else cargarPendientes(regs, `B2C (${file.name})`);
  } catch(e){ toast(''+e.message,'err'); } });
}

//  SIN AMPMADM
window.importarExcelSegunSeccion = function() { modoImportActual = (seccionActiva === 'b2c') ? 'B2C_DESC' : 'AMPM_DESC'; document.getElementById('importFile').click(); };
window.importarDesdeBD = function(tipo) { if (rolActual !== 'admin') { toast('Sin permiso','err'); return; } tipoImportacionActual = tipo; modoImportActual = tipo + '_BD'; document.getElementById('importFile').click(); };
document.getElementById('importFile').addEventListener('change', function(ev) {
  const file = ev.target.files[0]; if (!file) return; const n = file.name.toLowerCase();
  if (esJSON(n)) { if (modoImportActual==='AMPM_DESC') procesarJSONAMPM(file); else procesarJSON(file); }
  else if (esExcel(n) || esCSV(n)) {
    if (modoImportActual==='AMPM_DESC') procesarArchivoAMPM(file);
    else if (modoImportActual==='B2C_DESC') procesarArchivoB2C(file, pendientesB2C);
    else procesarArchivoGenerico(file, modoImportActual.replace('_BD',''));
  }
  else toast('Formato no soportado','err');
  ev.target.value = '';
});
function procesarArchivoAMPM(file) { procesarArchivoTipoSeccion(file, 'AMPM', pendientesAMPM); }

// 🚫 SIN autocompletado
function procesarArchivoTipoSeccion(file, tipo, lista) {
  const ft = document.getElementById('fFecha').value || new Date().toISOString().split('T')[0];
  toast(`Leyendo ${file.name}...`,'info');
  leerFilas(file, (filas) => { try {
    if (!filas || filas.length < 2) { toast('Archivo vacío','err'); return; }
    const enc = filas[0].map(normEnc);
    const col = { EMPRESA: enc.findIndex(h=>h.includes('EMPRESA')), TRACKING: enc.findIndex(h=>h.includes('TRACKING')), NOMBRE: enc.findIndex(h=>h.includes('NOMBRE')), DIRECCION: enc.findIndex(h=>h.includes('DIRECCION')), COMUNA: enc.findIndex(h=>h.includes('COMUNA')), VALOR: enc.findIndex(h=>h.includes('VALOR')), OBS: enc.findIndex(h=>h.includes('OBSERVACION')) };
    const [aT,mT] = ft.split('-'); const nuevos = [];
    for (let i=1;i<filas.length;i++){ const row = filas[i]; if (!row || !row.length) continue;
      const gv = idx => (idx<0||idx>=row.length) ? '' : (row[idx]==null ? '' : String(row[idx]));
      const tr = String(gv(col.TRACKING)).trim(); if (!tr) continue; const comuna = canonComuna(gv(col.COMUNA));
      let reg = { fecha: ft, unidad: String(gv(col.EMPRESA)).trim(), idPedido: tr, nombre: String(gv(col.NOMBRE)).trim(), direccion: limpiarDireccion(gv(col.DIRECCION), comuna), comuna, valor: parsearValor(gv(col.VALOR)), observacion: String(gv(col.OBS)).trim().toUpperCase(), transporte:'', rango:'', otroPalet:false, tipo };
      // 🚫 SIN autocompletado
      nuevos.push({ anio:aT, mes:mT, key:'pend_'+Date.now()+'_'+i+'_'+Math.random().toString(36).substr(2,5), reg }); }
    if (!nuevos.length) { toast('Sin filas con tracking','err'); return; }
    lista.push(...nuevos); paginaDesc = 1; toast(`${formatoEntero(nuevos.length)} filas. Revisa TRANSPORTE/RANGO y presiona GUARDAR.`,'info'); render();
  } catch(e){ toast(''+e.message,'err'); } });
}

function procesarJSONAMPM(file) { procesarJSONTipoSeccion(file, 'AMPM', pendientesAMPM); }

// 🚫 SIN autocompletado
function procesarJSONTipoSeccion(file, tipo, lista) {
  const ft = document.getElementById('fFecha').value || new Date().toISOString().split('T')[0];
  const reader = new FileReader();
  reader.onload = e => { try {
    const obj = JSON.parse(e.target.result);
    let arr = Array.isArray(obj) ? obj : (Array.isArray(obj.registros) ? obj.registros : (Array.isArray(obj.datos) ? obj.datos : null));
    if (!arr) { toast('JSON debe ser lista','err'); return; }
    const [aT,mT] = ft.split('-'); const nuevos = [];
    arr.forEach((o,i) => { const m = {}; Object.keys(o).forEach(k => m[normEnc(k)] = o[k]);
      const gi = (...subs) => { for (const k of Object.keys(m)) for (const s of subs) if (k.includes(s)) { const v = m[k]; if (v!=null && String(v).trim()!=='') return String(v); } return ''; };
      const tr = gi('TRACKING','ID PEDIDO','IDPEDIDO'); if (!tr) return; const comuna = canonComuna(gi('COMUNA'));
      let reg = { fecha: ft, unidad: gi('EMPRESA','UNIDAD'), idPedido: tr, nombre: gi('NOMBRE'), direccion: limpiarDireccion(gi('DIRECCION'), comuna), comuna, valor: parsearValor(gi('VALOR')), observacion: gi('OBSERVACION').toUpperCase(), transporte: gi('TRANSPORTE'), rango: (gi('RANGO')||'').toUpperCase(), otroPalet:false, tipo };
      // 🚫 SIN autocompletado
      nuevos.push({ anio:aT, mes:mT, key:'pend_'+Date.now()+'_'+i+'_'+Math.random().toString(36).substr(2,5), reg }); });
    if (!nuevos.length) { toast('JSON sin registros válidos','err'); return; }
    lista.push(...nuevos); paginaDesc = 1; toast(`${formatoEntero(nuevos.length)} registros JSON. Presiona GUARDAR.`,'info'); render();
  } catch(e){ toast('JSON inválido','err'); } };
  reader.readAsText(file);
}

function procesarArchivoGenerico(file, tipo) {
  tipoImportacionActual = tipo; const { mes: mA, anio: aA } = detectarMesAnioDesdeNombre(file.name);
  toast(`Leyendo ${file.name}...`,'info');
  leerFilas(file, (filas) => { try {
    if (!filas || filas.length < 2) { toast('Archivo vacío','err'); return; }
    const enc = filas[0].map(normEnc);
    let idxID = enc.findIndex(h => h.includes('PEDIDO') && h.includes('ID') && !h.includes('N°') && !h.includes('NRO') && !h.includes('NUM') && !h.includes('NUMBER'));
    if (idxID < 0) idxID = enc.findIndex(h => h.includes('PEDIDO'));
    const col = { FECHA: enc.findIndex(h=>h.includes('FECHA')), UNIDAD: enc.findIndex(h=>h.includes('UNIDAD')||h.includes('NEGOCIO')), ID: idxID, NOMBRE: enc.findIndex(h=>h.includes('NOMBRE')), DIRECCION: enc.findIndex(h=>h.includes('DIRECCION')), COMUNA: enc.findIndex(h=>h.includes('COMUNA')), VALOR: enc.findIndex(h=>h.includes('VALOR')), OBS: enc.findIndex(h=>h.includes('OBSERVACION')), TRANSPORTE: enc.findIndex(h=>h.includes('TRANSPORTE')||h.includes('MOVIL')), RANGO: enc.findIndex(h=>h.includes('RANGO')||h.includes('TURNO')) };
    const regs = []; let sinF = 0;
    for (let i=1;i<filas.length;i++){ const row = filas[i]; if (!row || !row.length) continue;
      const gv = idx => (idx<0||idx>=row.length) ? '' : (row[idx]==null ? '' : String(row[idx]));
      const fr = col.FECHA>=0 ? gv(col.FECHA) : gv(0); if (fr === '') continue;
      let fecha = null;
      if (typeof fr === 'number' && Number.isInteger(fr) && fr>=1 && fr<=31) { if (mA&&aA) fecha = `${aA}-${mA}-${String(fr).padStart(2,'0')}`; }
      else { fecha = parsearFecha(fr); if (!fecha && mA&&aA){ const d = parseInt(String(fr).trim()); if (!isNaN(d)&&d>=1&&d<=31) fecha = `${aA}-${mA}-${String(d).padStart(2,'0')}`; } }
      if (!fecha) { sinF++; continue; }
      const [anio, mes] = fecha.split('-'); const rango = String(gv(col.RANGO)).trim().toUpperCase(); const comuna = canonComuna(gv(col.COMUNA));
      regs.push({ anio, mes, reg: { fecha, unidad: String(gv(col.UNIDAD)).trim(), idPedido: String(gv(col.ID)).trim(), nombre: String(gv(col.NOMBRE)).trim(), direccion: limpiarDireccion(gv(col.DIRECCION), comuna), comuna, valor: parsearValor(gv(col.VALOR)), observacion: String(gv(col.OBS)).trim(), transporte: String(gv(col.TRANSPORTE)).trim(), rango: rango || (tipo==='B2C'?'B2C':'AM'), otroPalet:false, tipo, creado: new Date().toISOString(), importado:true } }); }
    if (sinF) toast(`${formatoEntero(sinF)} filas sin fecha válida`,'err');
    cargarPendientes(regs, `${tipo==='B2C'?'B2C':'AM/PM'} (${file.name})`);
  } catch(e){ toast(''+e.message,'err'); } });
}
function procesarJSON(file) { toast(`Leyendo JSON: ${file.name}...`,'info'); const r = new FileReader(); r.onload = e => { try { const obj = JSON.parse(e.target.result); cargarPendientes(extraerRegsDesdeJSON(obj), 'JSON'); } catch(e){ toast('JSON inválido','err'); } }; r.readAsText(file); }
function extraerRegsDesdeJSON(obj) {
  const out = []; const esA = k => /^20\d{2}$/.test(k); const esM = k => /^(0[1-9]|1[0-2])$/.test(k);
  const proc = n => { Object.keys(n).forEach(a => { if (!esA(a)) return; const ms = n[a]; if (typeof ms !== 'object') return; Object.keys(ms).forEach(m => { if (!esM(m)) return; const rs = ms[m]; if (typeof rs !== 'object') return; Object.keys(rs).forEach(k => { const r = rs[k]; if (r && r.fecha) out.push({ anio:a, mes:m, reg:{...r} }); }); }); }); };
  if (Array.isArray(obj)) { obj.forEach(r => { if (r && r.fecha) { const [a,m] = String(r.fecha).split('-'); out.push({ anio:a, mes:m, reg:{...r} }); } }); return out; }
  if (Object.keys(obj).some(esA)) { proc(obj); return out; }
  Object.keys(obj).forEach(k => { const v = obj[k]; if (v && typeof v==='object' && !Array.isArray(v) && Object.keys(v).some(esA)) proc(v); });
  return out;
}
function cargarPendientes(regs, origen) {
  if (!regs.length) { toast('Sin registros válidos','err'); return; }
  regs.forEach(({anio, mes, reg}) => { if (!reg.tipo) reg.tipo = tipoImportacionActual; if (!reg.rango) reg.rango = tipoImportacionActual==='B2C'?'B2C':'AM'; if (reg.comuna) reg.comuna = canonComuna(reg.comuna);
    if (!cache[anio]) cache[anio] = {}; if (!cache[anio][mes]) cache[anio][mes] = {}; const tk = 'pend_'+Date.now()+'_'+Math.random().toString(36).substr(2,9); cache[anio][mes][tk] = reg; pendientes.push({ anio, mes, reg }); });
  actualizarPendientesInfo(); render(); renderizarBaseDatos(); toast(`${formatoEntero(regs.length)} registros (${origen}). Guardando...`,'info'); guardarPendientesEnFirebase();
}
function actualizarPendientesInfo() {
  const nA = pendientes.filter(p=>p.reg.tipo==='AMPM').length, nB = pendientes.filter(p=>p.reg.tipo==='B2C').length;
  const a = document.getElementById('pendientesAmpm'), b = document.getElementById('pendientesB2c');
  if (a) a.textContent = nA>0 ? `Guardando: ${formatoEntero(nA)}` : '';
  if (b) b.textContent = nB>0 ? `Guardando: ${formatoEntero(nB)}` : '';
}
function guardarPendientesEnFirebase() {
  if (!pendientes.length) return; const total = pendientes.length; const por = pendientes.slice(); let g = 0, f = 0; let li = 0; const lotes = []; for (let i=0;i<por.length;i+=50) lotes.push(por.slice(i,i+50));
  const proc = () => { if (li >= lotes.length) { if (f) { toast(`Guardados ${g}, FALLIDOS ${f}`,'err'); return; } pendientes = []; actualizarPendientesInfo(); verificarGuardado(); return; }
    Promise.all(lotes[li].map(p => push(ref(db, `${RUTA_BASE}/${p.anio}/${p.mes}`), p.reg).then(()=>g++).catch(e=>{f++;}))).then(()=>{ li++; setTimeout(proc,100); }); };
  proc();
}
async function verificarGuardado() { const anios = [2026,2027,2028,2029,2030]; const t = []; anios.forEach(a => { for (let m=1;m<=12;m++){ const ms = String(m).padStart(2,'0'); t.push(get(ref(db, `${RUTA_BASE}/${a}/${ms}`)).then(s=>s.val()).catch(()=>null)); } });
  const res = await Promise.all(t); let total = 0; res.forEach(v => { if (v) total += Object.keys(v).length; }); toast(`Verificado: ${formatoEntero(total)} registros en Firebase`,'ok'); cargarDatos(); }
window.guardarEnFirebase = function() { if (rolActual !== 'admin') { toast('Sin permiso','err'); return; } if (!pendientes.length) { toast('Todo guardado','info'); return; } toast('Guardando pendientes...','info'); guardarPendientesEnFirebase(); };

function obtenerRegsTipo(tipo) { const r = []; Object.keys(cache).forEach(a => Object.keys(cache[a]||{}).forEach(m => Object.keys(cache[a][m]).forEach(k => { const r2 = { key:k, anio:a, mes:m, ...cache[a][m][k] }; if (getTipoRegistro(r2) === tipo) r.push(r2); }))); return ordenarPorFechaYId(r); }
function obtenerRegsFiltradosBD(tipo) { let r = obtenerRegsTipo(tipo); if (filtroDiaBD[tipo].d) r = r.filter(x => (x.fecha||'').split('-')[2] === filtroDiaBD[tipo].d); if (filtroMesBD[tipo].m) r = r.filter(x => x.mes === filtroMesBD[tipo].m); if (filtroAnioBD[tipo].a) r = r.filter(x => x.anio === filtroAnioBD[tipo].a); return r; }
window.abrirModalVerFecha = function(tipo) { if (rolActual !== 'admin') { toast('Sin permiso','err'); return; } tipoVerFechaActual = tipo; document.getElementById('vfTipo').value = tipo; document.getElementById('vfDia').value = filtroDiaBD[tipo].d; document.getElementById('vfMes').value = filtroDiaBD[tipo].m; document.getElementById('vfAnio').value = filtroDiaBD[tipo].a; document.getElementById('verFechaOverlay').classList.add('show'); };
window.cerrarModalVerFecha = function() { document.getElementById('verFechaOverlay').classList.remove('show'); };
window.confirmarVerFecha = function() {
  const t = tipoVerFechaActual;
  const d = document.getElementById('vfDia').value, m = document.getElementById('vfMes').value, a = document.getElementById('vfAnio').value;
  if (d && !m) { toast('Si eliges Día, también Mes','err'); return; }
  filtroDiaBD[t] = {d,m,a};
  if (t==='AMPM') paginaBDAmpm = 1; else paginaBDB2c = 1;
  const fd = document.getElementById('fFecha');
  if (m && a) fd.value = `${a}-${m}-${d || '01'}`;
  cerrarModalVerFecha(); renderizarBaseDatos(); render();
  toast(`Mostrando: ${textoPeriodo(t)}`,'info');
};
function textoPeriodo(t) { const f = filtroDiaBD[t]; if (f.d && f.m) return `Día ${parseInt(f.d)} de ${MESES_NOM[parseInt(f.m)-1]}${f.a?' '+f.a:''}`; if (f.m) return `${MESES_NOM[parseInt(f.m)-1]}${f.a?' '+f.a:''}`; if (f.a) return `Año ${f.a}`; return 'Todos'; }

// 🚫 SIN AMPMADM
function renderizarBaseDatos() {
  if (rolActual !== 'admin') return;
  if (tabBdActiva === 'ampm') renderTabBD('AMPM', document.getElementById('filtroIdAmpm').value, paginaBDAmpm);
  else if (tabBdActiva === 'b2c') renderTabBD('B2C', document.getElementById('filtroIdB2c').value, paginaBDB2c);
}

function claseYIndicadorSimple(r, cf, cg) { const id = (r.idPedido||'').toString().trim().toUpperCase(); const k = `${r.fecha||''}|${id}`; const misma = id && cf[k] > 1; const otra = !misma && id && cg[id] > 1; let c = '', i = ''; if (misma){ c='id-repetido'; i=`<span style="color:#fff;background:#e74c3c;padding:2px 6px;border-radius:4px;font-size:.7em;font-weight:700">x${cf[k]}</span>`; } else if (otra){ c='id-repetido-otro'; i=`<span style="color:#fff;background:#ff8c00;padding:2px 6px;border-radius:4px;font-size:.7em;font-weight:700">x${cg[id]}</span>`; } return { clase:c, ind:i }; }

function sufBD(tipo){ return tipo==='AMPM'?'Ampm':'B2c'; }

function renderBDThead(tipo) {
  const suf = sufBD(tipo);
  const thead = document.getElementById('thead'+suf);
  if (!thead) return;
  const bdCombo = (campo, label) => `<th>${label}<div class="filtro-combo"><input type="text" class="th-filter" id="fBD${suf}_${campo}" placeholder="Filtrar…" oninput="filtrarBDCombo('${tipo}','${campo}', this.value)" onfocus="abrirComboBD('${tipo}','${campo}')"><button class="combo-arrow" onclick="toggleComboBD('${tipo}','${campo}')">▼</button><div class="combo-list" id="comboBD_${suf}_${campo}"></div></div></th>`;
  thead.innerHTML = `<tr><th>Fecha</th>${bdCombo('unidad','Unidad Negocio')}<th>ID Pedido</th><th>Nombre Cliente</th><th>Dirección</th>${bdCombo('comuna','Comuna')}<th>Valor</th><th>Observación</th>${bdCombo('transporte','Transporte')}${bdCombo('rango','Rango')}<th>Acciones</th></tr>`;
}

function renderTabBD(tipo, filtroId, pagina) {
  const suf = sufBD(tipo);
  if (!theadBDConstruidos[suf]) { renderBDThead(tipo); theadBDConstruidos[suf] = true; }
  let regs = obtenerRegsFiltradosBD(tipo); if (filtroId) { const f = filtroId.toUpperCase().trim(); regs = regs.filter(r => (r.idPedido||'').toString().toUpperCase().includes(f)); }
  const fd = filtroDescBD[tipo];
  if (fd.unidad) regs = regs.filter(r => normSinTildes(r.unidad||'').includes(fd.unidad));
  if (fd.comuna) regs = regs.filter(r => normSinTildes(canonComuna(r.comuna)||'').includes(fd.comuna));
  if (fd.transporte) regs = regs.filter(r => normSinTildes(r.transporte||'').includes(fd.transporte));
  if (fd.rango) regs = regs.filter(r => normSinTildes(r.rango||'').includes(fd.rango));
  const rd = document.getElementById('bdResumen'+suf);
  if (rd) { const suma = sumaValores(regs), n1 = conteoUnPeso(regs); rd.innerHTML = `<span class="res-periodo">Viendo: <strong>${textoPeriodo(tipo)}</strong></span><span>Valor total: <strong>${formatoMoneda(suma)}</strong>${n1?` <small>(sin ${formatoEntero(n1)} de $1)</small>`:''}</span><span>Pedidos: <strong>${formatoEntero(regs.length)}</strong></span><span class="res-am">AM: <strong>${formatoEntero(regs.filter(r=>r.rango==='AM').length)}</strong></span><span class="res-pm">PM: <strong>${formatoEntero(regs.filter(r=>r.rango==='PM').length)}</strong></span>`; }
  const tbody = document.getElementById('bdTbody'+suf); const pagDiv = document.getElementById('bdPaginacion'+suf);
  if (!regs.length) { tbody.innerHTML = `<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-muted)">No hay registros</td></tr>`; pagDiv.innerHTML = ''; return; }
  const tp = Math.max(1, Math.ceil(regs.length / REGISTROS_POR_PAGINA_BD)); if (pagina > tp) pagina = tp; if (pagina < 1) pagina = 1;
  if (tipo==='AMPM') paginaBDAmpm = pagina; else paginaBDB2c = pagina;
  const ini = (pagina-1)*REGISTROS_POR_PAGINA_BD; const pag = regs.slice(ini, ini+REGISTROS_POR_PAGINA_BD);
  const cf = detectarIdsRepetidosPorFecha(regs), cg = detectarIdsRepetidosGlobal(regs);
  tbody.innerHTML = pag.map(r => { const { clase, ind } = claseYIndicadorSimple(r, cf, cg); return `<tr class="${clase}"><td>${fmtFecha(r.fecha)}</td><td><span class="badge badge-unidad">${r.unidad||''}</span></td><td><strong>${r.idPedido||''}</strong>${ind}</td><td>${r.nombre||''}</td><td>${dirDe(r)}</td><td>${canonComuna(r.comuna)}</td><td>${formatoMonedaAlineado(r.valor)}</td><td>${r.observacion||''}</td><td>${r.transporte||''}</td><td><span class="badge badge-${(r.rango||'').toLowerCase()}">${r.rango||''}</span></td><td class="td-acciones"><button class="btn-acc" onclick="pedirEditarRegistroBD('${r.key}','${r.anio}','${r.mes}')">✏️</button><button class="btn-acc btn-borrar" onclick="pedirBorrarRegistroBD('${r.key}','${r.anio}','${r.mes}')"></button></td></tr>`; }).join('');
  if (tp <= 1) { pagDiv.innerHTML = `<div class="bd-paginacion-info">Mostrando ${formatoEntero(regs.length)} de ${formatoEntero(regs.length)}</div>`; return; }
  let h = `<div class="bd-paginacion-info">Página ${pagina} de ${tp} | ${formatoEntero(ini+1)}-${formatoEntero(Math.min(ini+REGISTROS_POR_PAGINA_BD, regs.length))} de ${formatoEntero(regs.length)}</div>`;
  h += pagina>1 ? `<button class="btn-bd-pag-nav" onclick="irPaginaBD('${tipo}',${pagina-1})">‹ Anterior</button>` : `<button class="btn-bd-pag-nav" disabled>‹ Anterior</button>`;
  const pI = Math.max(1,pagina-2), pF = Math.min(tp,pagina+2);
  if (pI>1){ h += `<button class="btn-bd-pag" onclick="irPaginaBD('${tipo}',1)">1</button>`; if(pI>2) h += `<span style="color:var(--text-muted)">...</span>`; }
  for (let i=pI;i<=pF;i++) h += i===pagina ? `<button class="btn-bd-pag activa">${i}</button>` : `<button class="btn-bd-pag" onclick="irPaginaBD('${tipo}',${i})">${i}</button>`;
  if (pF<tp){ if(pF<tp-1) h += `<span style="color:var(--text-muted)">...</span>`; h += `<button class="btn-bd-pag" onclick="irPaginaBD('${tipo}',${tp})">${tp}</button>`; }
  h += pagina<tp ? `<button class="btn-bd-pag-nav" onclick="irPaginaBD('${tipo}',${pagina+1})">Siguiente ›</button>` : `<button class="btn-bd-pag-nav" disabled>Siguiente ›</button>`;
  pagDiv.innerHTML = h;
}
window.irPaginaBD = function(t,p) { if (rolActual !== 'admin') return; if (t==='AMPM') paginaBDAmpm = p; else paginaBDB2c = p; renderizarBaseDatos(); };
window.filtrarBD = function(t) { if (rolActual !== 'admin') return; if (t==='AMPM') paginaBDAmpm = 1; else paginaBDB2c = 1; renderizarBaseDatos(); };

window.pedirEditarRegistroBD = function(key, anio, mes) {
  pedirClave(() => { editandoKey = key; render(); renderizarBaseDatos(); });
};
window.guardarEdicionInline = function(key, anio, mes, esPend) {
  const gv = id => { const el = document.getElementById(id); return el ? el.value : ''; };
  const nuevo = {
    fecha: gv('edi_fecha'), unidad: gv('edi_unidad'), idPedido: gv('edi_id'), nombre: gv('edi_nombre'),
    direccion: gv('edi_direccion'), comuna: canonComuna(gv('edi_comuna')), valor: parseFloat(gv('edi_valor'))||0,
    observacion: gv('edi_obs'), transporte: gv('edi_transporte'), rango: gv('edi_rango')
  };
  nuevo.tipo = gv('edi_rango') === 'B2C' ? 'B2C' : 'AMPM';
  if (document.getElementById('edi_celular')) nuevo.celular = gv('edi_celular');
  if (document.getElementById('edi_email')) nuevo.email = gv('edi_email');
  const [nA, nM] = (nuevo.fecha||'').split('-');
  if (cache[anio] && cache[anio][mes] && cache[anio][mes][key]) {
    cache[anio][mes][key] = { ...cache[anio][mes][key], ...nuevo };
  }
  if (nA && nM && (nA!==anio || nM!==mes)) {
    if (cache[anio] && cache[anio][mes]) delete cache[anio][mes][key];
    if (!cache[nA]) cache[nA] = {};
    if (!cache[nA][nM]) cache[nA][nM] = {};
    cache[nA][nM][key] = { ...nuevo };
    remove(ref(db, `${RUTA_BASE}/${anio}/${mes}/${key}`));
    set(ref(db, `${RUTA_BASE}/${nA}/${nM}/${key}`), nuevo);
  } else {
    update(ref(db, `${RUTA_BASE}/${anio}/${mes}/${key}`), nuevo);
  }
  editandoKey = null;
  toast('Registro actualizado','ok');
  render();
  renderizarBaseDatos();
};
window.cancelarEdicionInline = function() { editandoKey = null; render(); renderizarBaseDatos(); };
window.pedirBorrarRegistroBD = function(key, anio, mes) {
  pedirClave(() => {
    if (!confirm('El registro se eliminará permanentemente.\n¿Confirmas?')) return;
    if (cache[anio] && cache[anio][mes] && cache[anio][mes][key]) {
      delete cache[anio][mes][key];
    }
    remove(ref(db, `${RUTA_BASE}/${anio}/${mes}/${key}`)).then(()=>{
      toast('Eliminado de plataforma y Firebase','ok');
      render();
      renderizarBaseDatos();
    }).catch(e => toast('Error: ' + e.message, 'err'));
  });
};
window.abrirBorrarMes = function(t) { if (rolActual !== 'admin') { toast('Sin permiso','err'); return; } tipoBorrarMes = t; document.getElementById('bmTipo').value = t; document.getElementById('bmMes').value = ''; document.getElementById('bmPassword').value = ''; document.getElementById('bmInfoRegistros').textContent = 'Selecciona mes y año para ver cantidad'; document.getElementById('borrarMesOverlay').classList.add('show'); };
window.cerrarBorrarMes = function() { document.getElementById('borrarMesOverlay').classList.remove('show'); };
function actualizarInfoBorrarMes() { const m = document.getElementById('bmMes').value, a = document.getElementById('bmAnio').value, d = document.getElementById('bmInfoRegistros'); if (!m) { d.textContent = 'Selecciona mes y año para ver cantidad'; return; } const c = Object.keys(cache[a]?.[m]||{}).filter(k => getTipoRegistro(cache[a][m][k]) === tipoBorrarMes).length; d.textContent = c === 0 ? `Sin registros ${tipoBorrarMes} en ${MESES_NOM[parseInt(m)-1]} ${a}` : `${formatoEntero(c)} registros ${tipoBorrarMes} en ${MESES_NOM[parseInt(m)-1]} ${a}`; }
window.confirmarBorrarMes = function() {
  if (rolActual !== 'admin') { toast('Sin permiso','err'); return; }
  const m = document.getElementById('bmMes').value, a = document.getElementById('bmAnio').value, p = document.getElementById('bmPassword').value;
  if (!m) { toast('Primero elige el mes','err'); return; }
  if (p !== CLAVE_ACCIONES) { toast('Contraseña incorrecta','err'); return; }
  const keys = Object.keys(cache[a]?.[m]||{}).filter(k => getTipoRegistro(cache[a][m][k]) === tipoBorrarMes);
  if (!keys.length) { toast('No hay registros que borrar','info'); return; }
  if (!confirm(`Se BORRARÁN PERMANENTEMENTE ${formatoEntero(keys.length)} registros ${tipoBorrarMes} de ${MESES_NOM[parseInt(m)-1]} ${a}.\nNo se puede deshacer.\n¿Confirmas?`)) return;
  toast('Borrando permanentemente...','info');
  Promise.all(keys.map(k => remove(ref(db, `${RUTA_BASE}/${a}/${m}/${k}`))))
    .then(()=>{ keys.forEach(k => { if (cache[a] && cache[a][m]) delete cache[a][m][k]; });
      toast('Mes borrado permanentemente','ok');
      cerrarBorrarMes(); renderizarBaseDatos(); render(); })
    .catch(e => toast(''+e.message,'err'));
};

// 🚫 ELIMINADA: buscarFiltrosAmpmAdmQdm
window.buscarFiltrosAMPM = function() { buscarFiltros('AMPM'); };
window.buscarFiltrosB2C = function() { buscarFiltros('B2C'); };

// 🚫 SIN AMPMADM
function idsFecha(tipo) { if (tipo === 'AMPM') return { dia:'filtroDiaAmpm', mes:'filtroMesAmpm', anio:'filtroAnioAmpm' }; return { dia:'filtroDiaB2c', mes:'filtroMesB2c', anio:'filtroAnioB2c' }; }
function leerFiltrosBusqueda(t) { const i = idsFecha(t); const d = document.getElementById(i.dia), m = document.getElementById(i.mes), a = document.getElementById(i.anio); if (!d || !m || !a) return null; return { dia: d.value, mes: m.value, anio: a.value }; }
function textoPeriodoBusqueda(t) { const f = leerFiltrosBusqueda(t); if (!f) return 'Todos'; if (f.dia && f.mes) return `Día ${parseInt(f.dia)} de ${MESES_NOM[parseInt(f.mes)-1]}${f.anio?' '+f.anio:''}`; if (f.mes) return `${MESES_NOM[parseInt(f.mes)-1]}${f.anio?' '+f.anio:''}`; if (f.anio) return `Año ${f.anio}`; return 'Todos'; }

function buscarFiltros(tipo) { try { tipoBusquedaActual = tipo; const f = leerFiltrosBusqueda(tipo); if (!f) { toast('Recarga con Ctrl+Shift+R','err'); return; } if (!f.mes && !f.anio) { toast('Selecciona al menos Mes o Año','err'); return; } if (f.anio && !f.mes) { toast('Si eliges Año, también Mes','err'); return; } if (f.dia && !f.mes) { toast('Si eliges Día, también Mes','err'); return; }
  let res = []; Object.keys(cache).forEach(a => { if (f.anio && a !== f.anio) return; Object.keys(cache[a]||{}).forEach(m => { if (f.mes && m !== f.mes) return; Object.keys(cache[a][m]).forEach(k => { const r = { key:k, anio:a, mes:m, ...cache[a][m][k] }; if (getTipoRegistro(r) !== tipo) return; if (f.dia && (r.fecha||'').split('-')[2] !== f.dia) return; res.push(r); }); }); });
  ordenarPorFechaYId(res); if (!res.length) { toast('No se encontraron registros','info'); return; }
  datosModal = res; datosModalTotales = res.length; paginaModalActual = 1;
  ['fModFecha','fModUnidad','fModComuna','fModTransporte','fModObservacion','fModRango'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  poblarCombosModal();
  document.getElementById('modalTitleText').textContent = `${textoPeriodoBusqueda(tipo)} (${tipo}) - ${formatoEntero(res.length)} pedidos`;
  document.getElementById('modalInfo').innerHTML = `<strong>Total:</strong> ${formatoEntero(res.length)} | <strong>Valor:</strong> ${formatoMoneda(sumaValores(res))} | <strong>AM:</strong> ${formatoEntero(res.filter(r=>r.rango==='AM').length)} | <strong>PM:</strong> ${formatoEntero(res.filter(r=>r.rango==='PM').length)} | <strong>B2C:</strong> ${formatoEntero(res.filter(r=>r.rango==='B2C').length)}`;
  document.getElementById('filtroIdModal').value = ''; renderizarModal(); document.getElementById('modalOverlay').classList.add('show');
} catch(e){ toast('Error al buscar: '+e.message,'err'); } }

function leerFiltrosModal() { const g = id => { const el = document.getElementById(id); return el ? normSinTildes(el.value.trim()) : ''; }; return { fecha:g('fModFecha'), unidad:g('fModUnidad'), comuna:g('fModComuna'), transporte:g('fModTransporte'), observacion:g('fModObservacion'), rango:g('fModRango') }; }
function aplicarFiltrosCampoModal(regs, fm) { if (fm.fecha) regs = regs.filter(r => normSinTildes(fmtFecha(r.fecha)).includes(fm.fecha) || normSinTildes(r.fecha||'').includes(fm.fecha)); if (fm.unidad) regs = regs.filter(r => normSinTildes(r.unidad||'').includes(fm.unidad)); if (fm.comuna) regs = regs.filter(r => normSinTildes(canonComuna(r.comuna)).includes(fm.comuna)); if (fm.transporte) regs = regs.filter(r => normSinTildes(r.transporte||'').includes(fm.transporte)); if (fm.observacion) regs = regs.filter(r => normSinTildes(r.observacion||'').includes(fm.observacion)); if (fm.rango) regs = regs.filter(r => normSinTildes(r.rango||'').includes(fm.rango)); return regs; }
window.aplicarFiltrosModal = function() { paginaModalActual = 1; renderizarModal(); };
window.aplicarFiltroIdModal = function() { paginaModalActual = 1; renderizarModal(); };
window.cerrarModal = function() { document.getElementById('modalOverlay').classList.remove('show'); datosModal = []; };
window.irAPaginaModal = p => { paginaModalActual = p; renderizarModal(); document.getElementById('modalBody').scrollTop = 0; };

function renderizarModal() {
  const fid = document.getElementById('filtroIdModal').value.toUpperCase().trim(); const fm = leerFiltrosModal();
  let regs = datosModal; if (fid) regs = regs.filter(r => (r.idPedido||'').toString().toUpperCase().includes(fid)); regs = aplicarFiltrosCampoModal(regs, fm); ordenarPorFechaYId(regs);
  poblarCombosModal();
  const tp = Math.max(1, Math.ceil(regs.length / REGISTROS_POR_PAGINA_MODAL)); if (paginaModalActual > tp) paginaModalActual = tp; if (paginaModalActual < 1) paginaModalActual = 1;
  const ini = (paginaModalActual-1)*REGISTROS_POR_PAGINA_MODAL; const pag = regs.slice(ini, ini+REGISTROS_POR_PAGINA_MODAL);
  const cf = detectarIdsRepetidosPorFecha(regs), cg = detectarIdsRepetidosGlobal(regs);
  document.getElementById('filtroInfo').textContent = `${formatoEntero(datosModalTotales)} totales | Mostrando ${regs.length?formatoEntero(ini+1):0}-${formatoEntero(Math.min(ini+REGISTROS_POR_PAGINA_MODAL, regs.length))} (pág ${paginaModalActual}/${tp}) | IDs repetidos: ${formatoEntero(Object.values(cg).filter(c=>c>1).length)}`;
  const tbody = document.getElementById('modalTbody');
  if (!pag.length) { tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:60px;color:var(--text-muted)">No hay registros</td></tr>'; document.getElementById('modalPaginacion').innerHTML = ''; return; }
  tbody.innerHTML = pag.map(r => { const { clase, ind } = claseYIndicadorSimple(r, cf, cg); return `<tr class="${clase}"><td>${fmtFecha(r.fecha)}</td><td><span class="badge badge-unidad">${r.unidad||''}</span></td><td><strong>${r.idPedido||''}</strong>${ind}</td><td>${r.nombre||''}</td><td>${dirDe(r)}</td><td>${canonComuna(r.comuna)}</td><td>${formatoMonedaAlineado(r.valor)}</td><td>${r.observacion||''}</td><td>${r.transporte||''}</td><td><span class="badge badge-${(r.rango||'').toLowerCase()}">${r.rango||''}</span></td></tr>`; }).join('');
  let h = `<div class="modal-paginacion-info">Página ${paginaModalActual} de ${tp}</div>`;
  h += paginaModalActual>1 ? `<button class="btn-pag-nav" onclick="irAPaginaModal(${paginaModalActual-1})">‹ Anterior</button>` : `<button class="btn-pag-nav" disabled>‹ Anterior</button>`;
  const pI = Math.max(1,paginaModalActual-2), pF = Math.min(tp,paginaModalActual+2);
  for (let i=pI;i<=pF;i++) h += i===paginaModalActual ? `<button class="btn-pag-numero activa">${i}</button>` : `<button class="btn-pag-numero" onclick="irAPaginaModal(${i})">${i}</button>`;
  h += paginaModalActual<tp ? `<button class="btn-pag-nav" onclick="irAPaginaModal(${paginaModalActual+1})">Siguiente ›</button>` : `<button class="btn-pag-nav" disabled>Siguiente ›</button>`;
  document.getElementById('modalPaginacion').innerHTML = h;
}

function generarPDFRegistros(regs, titulo) { const suma = sumaValores(regs), n1 = conteoUnPeso(regs); const nA = regs.filter(r=>r.rango==='AM').length, nP = regs.filter(r=>r.rango==='PM').length;
  const { jsPDF } = window.jspdf; const doc = new jsPDF({ orientation:'landscape', unit:'pt', format:'a4' });
  doc.setFontSize(14); doc.text(`DESPACHO RETAIL - ${titulo}`, 40, 32); doc.setFontSize(9);
  doc.text(`Pedidos: ${formatoEntero(regs.length)} | AM: ${formatoEntero(nA)} | PM: ${formatoEntero(nP)} | Valor: ${formatoMoneda(suma)}${n1?` (excluye ${formatoEntero(n1)} de $1)`:''}`, 40, 48);
  doc.text(`Generado: ${new Date().toLocaleString('es-CL')}`, 40, 60);
  doc.autoTable({ startY: 72, head: [['Fecha','Unidad','ID Pedido','Cliente','Direccion','Comuna','Valor','Observacion','Transporte','Rango']], body: regs.map(r => [fmtFecha(r.fecha), r.unidad||'', r.idPedido||'', r.nombre||'', dirDe(r), canonComuna(r.comuna), formatoMoneda(r.valor), r.observacion||'', r.transporte||'', r.rango||'']), styles: { fontSize:7, cellPadding:3, overflow:'linebreak' }, headStyles: { fillColor:[0,120,212], textColor:255 }, alternateRowStyles: { fillColor:[245,245,245] }, columnStyles: { 0:{cellWidth:55}, 2:{cellWidth:60}, 5:{cellWidth:60}, 6:{cellWidth:65,halign:'right'}, 9:{cellWidth:35} } });
  doc.save(`DespachoRetail_${titulo.replace(/\s+/g,'_')}.pdf`); toast(`PDF exportado: ${formatoEntero(regs.length)} registros`,'ok'); }

// 🚫 SIN AMPMADM
window.exportarPDFBD = function() { if (rolActual !== 'admin') { toast('Sin permiso','err'); return; } const t = tabBdActiva==='b2c'?'B2C':'AMPM'; let r = obtenerRegsFiltradosBD(t); const f = document.getElementById(t==='AMPM'?'filtroIdAmpm':'filtroIdB2c').value; if (f) { const ff = f.toUpperCase().trim(); r = r.filter(x => (x.idPedido||'').toString().toUpperCase().includes(ff)); } if (!r.length) { toast('No hay registros','err'); return; } generarPDFRegistros(r, `${t} - ${textoPeriodo(t)}`); };
window.exportarPDFModal = function() { const t = tipoBusquedaActual; const f = document.getElementById('filtroIdModal').value.toUpperCase().trim(); const fm = leerFiltrosModal(); let r = datosModal.slice(); if (f) r = r.filter(x => (x.idPedido||'').toString().toUpperCase().includes(f)); r = aplicarFiltrosCampoModal(r, fm); if (!r.length) { toast('No hay registros','err'); return; } let t2 = `${t} - ${textoPeriodoBusqueda(t)}`; if (f) t2 += ` - ID ${f}`; generarPDFRegistros(r, t2); };

function getBDBaseRows(tipo){ let r = obtenerRegsTipo(tipo); const f = filtroDiaBD[tipo]; if (f.d) r = r.filter(x => (x.fecha||'').split('-')[2] === f.d); if (f.m) r = r.filter(x => x.mes === f.m); if (f.a) r = r.filter(x => x.anio === f.a); return r; }
function getDistinctBD(tipo, campo){ const set = new Set(); getBDBaseRows(tipo).forEach(r => { let v=''; if(campo==='unidad')v=r.unidad||''; else if(campo==='comuna')v=canonComuna(r.comuna)||''; else if(campo==='transporte')v=r.transporte||''; else if(campo==='rango')v=r.rango||''; if(v)set.add(v); }); return [...set].sort(); }
function poblarComboBD(tipo, campo, filtro){
  const list = document.getElementById('comboBD_'+sufBD(tipo)+'_'+campo);
  if(!list) return;
  let vals = getDistinctBD(tipo, campo);
  if (filtro) vals = vals.filter(v => normSinTildes(v).includes(normSinTildes(filtro)));
  list.innerHTML = vals.length ? vals.map(v => `<div class="combo-item" onmousedown="elegirOpcionBD('${tipo}','${campo}', \`${String(v).replace(/`/g,'\\`').replace(/'/g,"\\'")}\`)">${v}</div>`).join('') : '<div class="combo-item">Sin coincidencias</div>';
}
function cerrarCombosBD(){ document.querySelectorAll('.combo-list').forEach(l => { if (l.id.startsWith('comboBD_')) l.style.display='none'; }); comboBDAbierto = null; }
window.toggleComboBD = function(tipo, campo){
  const list = document.getElementById('comboBD_'+sufBD(tipo)+'_'+campo);
  if(!list) return;
  const id = tipo+'_'+campo;
  if (comboBDAbierto === id) { list.style.display='none'; comboBDAbierto=null; }
  else { cerrarCombosBD(); poblarComboBD(tipo,campo,''); list.style.display='block'; comboBDAbierto=id; }
};
function abrirComboBD(tipo, campo){ cerrarCombosBD(); poblarComboBD(tipo,campo,''); const list=document.getElementById('comboBD_'+sufBD(tipo)+'_'+campo); if(list){ list.style.display='block'; comboBDAbierto=tipo+'_'+campo; } }
window.elegirOpcionBD = function(tipo, campo, val){
  const input = document.getElementById('fBD'+sufBD(tipo)+'_'+campo);
  if (input) input.value = val;
  filtroDescBD[tipo][campo] = normSinTildes(val);
  cerrarCombosBD();
  renderTabBD(tipo, document.getElementById(tipo==='AMPM'?'filtroIdAmpm':'filtroIdB2c').value, tipo==='AMPM'?paginaBDAmpm:paginaBDB2c);
};
window.filtrarBDCombo = function(tipo, campo, val){
  filtroDescBD[tipo][campo] = normSinTildes(val);
  poblarComboBD(tipo, campo, val);
  const list = document.getElementById('comboBD_'+sufBD(tipo)+'_'+campo);
  if (list) { list.style.display='block'; comboBDAbierto=tipo+'_'+campo; }
  renderTabBD(tipo, document.getElementById(tipo==='AMPM'?'filtroIdAmpm':'filtroIdB2c').value, tipo==='AMPM'?paginaBDAmpm:paginaBDB2c);
};

function getDistinctModal(col) {
  const set = new Set();
  datosModal.forEach(r => {
    let v = '';
    if (col==='fecha') v = fmtFecha(r.fecha);
    else if (col==='unidad') v = r.unidad||'';
    else if (col==='comuna') v = canonComuna(r.comuna)||'';
    else if (col==='transporte') v = r.transporte||'';
    else if (col==='observacion') v = r.observacion||'';
    else if (col==='rango') v = r.rango||'';
    if (v) set.add(v);
  });
  return [...set].sort();
}
function poblarComboModal(col, filtro) {
  const list = document.getElementById('comboModal_'+col);
  if (!list) return;
  let vals = getDistinctModal(col);
  if (filtro) vals = vals.filter(v => normSinTildes(v).includes(normSinTildes(filtro)));
  list.innerHTML = vals.length
    ? vals.map(v => `<div class="combo-item" onmousedown="elegirOpcionModal('${col}', \`${String(v).replace(/`/g,'\\`').replace(/'/g,"\\'")}\`)">${v}</div>`).join('')
    : '<div class="combo-item">Sin coincidencias</div>';
}
function poblarCombosModal() { ['fecha','unidad','comuna','transporte','observacion','rango'].forEach(col => { const inp = document.getElementById('fMod'+col.charAt(0).toUpperCase()+col.slice(1)); poblarComboModal(col, inp ? inp.value : ''); }); }
function cerrarCombosModal() { document.querySelectorAll('.combo-list').forEach(l => { if (l.id.startsWith('comboModal_')) l.style.display='none'; }); comboModalAbierto = null; }
window.toggleComboModal = function(col) {
  const list = document.getElementById('comboModal_'+col);
  if (!list) return;
  if (comboModalAbierto === col) { list.style.display='none'; comboModalAbierto=null; }
  else { cerrarCombosModal(); poblarComboModal(col,''); list.style.display='block'; comboModalAbierto=col; }
};
function abrirComboModal(col) { cerrarCombosModal(); poblarComboModal(col,''); const list=document.getElementById('comboModal_'+col); if(list){ list.style.display='block'; comboModalAbierto=col; } }
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

// =====================================================================
// 📊 MÓDULO INFORMES PROFESIONAL
// =====================================================================
window.setInfTipo = function(t) {
  infTipo = t;
  document.querySelectorAll('.basedatos-tab[data-inftipo]').forEach(b => b.classList.toggle('active', b.getAttribute('data-inftipo') === t));
  generarInforme();
};

function onInfPeriodoChange() {
  const periodo = document.getElementById('infPeriodo').value;
  document.getElementById('infContFecha').style.display = periodo === 'dia' ? '' : 'none';
  document.getElementById('infContSemana').style.display = periodo === 'semana' ? '' : 'none';
  document.getElementById('infContMes').style.display = (periodo === 'mes' || periodo === 'anio' || periodo === 'semana') ? '' : 'none';
  document.getElementById('infContAnio').style.display = (periodo === 'anio' || periodo === 'mes' || periodo === 'semana') ? '' : 'none';
  if (periodo === 'semana') poblarSemanasSelect();
}

function onInfSemanaChange() {
  const semanaNum = parseInt(document.getElementById('infSemana').value);
  if (!semanaNum) return;
  const semana = TABLA_SEMANAS_2026.find(s => s.num === semanaNum);
  if (semana) {
    document.getElementById('infSemanaInicio').value = semana.inicio;
    document.getElementById('infSemanaFin').value = semana.fin;
  }
}

function onInfMesChange() {
  if (document.getElementById('infPeriodo').value === 'semana') {
    poblarSemanasSelect();
  }
}

function poblarSemanasSelect() {
  const mes = document.getElementById('infMes').value;
  const anio = document.getElementById('infAnio').value;
  const select = document.getElementById('infSemana');
  if (!select) return;
  const semanasDelMes = TABLA_SEMANAS_2026.filter(s => {
    const mesInicio = s.inicio.split('-')[1];
    const mesFin = s.fin.split('-')[1];
    return mesInicio === mes || mesFin === mes;
  });
  select.innerHTML = '<option value="">-- Seleccionar semana --</option>' +
    semanasDelMes.map(s => `<option value="${s.num}">Semana ${s.num} (${fmtFecha(s.inicio)} al ${fmtFecha(s.fin)}) - ${s.mes}</option>`).join('');
}

async function obtenerDatosInforme(periodo, fecha, semanaNum, mes, anio, tipo, movil, unidad) {
  let regs = [];
  Object.keys(cache).forEach(a => {
    Object.keys(cache[a]||{}).forEach(m => {
      Object.keys(cache[a][m]).forEach(k => {
        const r = { key:k, anio:a, mes:m, ...cache[a][m][k] };
        if (getTipoRegistro(r) !== tipo) return;
        let incluir = false;
        if (periodo === 'dia') {
          incluir = r.fecha === fecha;
        } else if (periodo === 'semana') {
          const semana = TABLA_SEMANAS_2026.find(s => s.num === semanaNum);
          if (semana) {
            incluir = r.fecha >= semana.inicio && r.fecha <= semana.fin;
          }
        } else if (periodo === 'mes') {
          incluir = r.anio === anio && r.mes === mes;
        } else if (periodo === 'anio') {
          incluir = r.anio === anio;
        }
        if (incluir && movil !== 'todos') {
          const transpNorm = (r.transporte || '').toUpperCase();
          if (!transpNorm.includes(movil.toUpperCase())) incluir = false;
        }
        if (incluir && unidad !== 'todas') {
          if ((r.unidad || '').toLowerCase() !== unidad.toLowerCase()) incluir = false;
        }
        if (incluir) regs.push(r);
      });
    });
  });
  return ordenarPorFechaYId(regs);
}

async function generarInforme() {
  const periodo = document.getElementById('infPeriodo').value;
  const fecha = document.getElementById('infFecha').value;
  const semanaNum = parseInt(document.getElementById('infSemana').value) || 1;
  const mes = document.getElementById('infMes').value;
  const anio = document.getElementById('infAnio').value;
  const movil = document.getElementById('infMovil').value;
  const unidad = document.getElementById('infUnidad').value;
  const tipo = document.getElementById('infTipo').value;

  if (periodo === 'dia' && !fecha) { toast('Seleccione una fecha', 'err'); return; }
  toast(' Generando informe...', 'info');

  Object.values(infCharts).forEach(c => { if (c) c.destroy(); });
  infCharts = {};
  infAuditLog = [];

  infDatos = await obtenerDatosInforme(periodo, fecha, semanaNum, mes, anio, tipo, movil, unidad);
  infPeriodoActual = periodo;
  infMovilActual = movil;
  infUnidadActual = unidad;
  infTipoActual = tipo;

  if (infDatos.length === 0) {
    document.getElementById('infResultado').innerHTML = `<div style="padding:60px;text-align:center;color:var(--text-muted)"><h3 style="margin-bottom:15px">⚠️ Sin datos</h3><p>No se encontraron registros para los filtros seleccionados.</p></div>`;
    document.getElementById('infExportButtons').style.display = 'none';
    return;
  }

  const kpis = calcularKPIs(infDatos);

  let html = '';
  html += renderResumenEjecutivo(kpis, periodo, fecha, semanaNum, mes, anio, movil, unidad, tipo);
  html += renderKPIs(kpis);

  html += renderMapaSantiago(kpis);

  html += '<div class="inf-charts-grid">';
  html += renderChartTransporte();
  html += renderChartPareto();
  html += renderChartTendencia();
  html += renderChartIncidencias();
  html += renderChartUnidades();
  html += renderChartRango();
  html += '</div>';
  html += renderPlanillaPowerBI();
  html += renderInsights(kpis);

  document.getElementById('infResultado').innerHTML = html;
  document.getElementById('infExportButtons').style.display = 'flex';

  setTimeout(() => {
    inicializarGraficos(kpis);
    inicializarMapaSantiago(kpis);
  }, 100);

  toast(`✅ Informe generado: ${formatoEntero(infDatos.length)} registros`, 'ok');
}

function calcularKPIs(regs) {
  const totalPedidos = regs.length;
  const totalValor = sumaValores(regs);
  const ticketPromedio = totalPedidos > 0 ? totalValor / totalPedidos : 0;
  const amCount = regs.filter(r => r.rango === 'AM').length;
  const pmCount = regs.filter(r => r.rango === 'PM').length;
  const b2cCount = regs.filter(r => r.rango === 'B2C').length;

  const porUnidad = {}, porComuna = {}, porTransporte = {}, porCliente = {}, incidencias = {}, porDia = {}, porRango = {};
  regs.forEach(r => {
    const u = r.unidad || 'Sin unidad'; if (!porUnidad[u]) porUnidad[u] = { pedidos: 0, valor: 0 }; porUnidad[u].pedidos++; porUnidad[u].valor += (r.valor || 0) === 1 ? 0 : (r.valor || 0);
    const c = canonComuna(r.comuna) || 'Sin comuna'; if (!porComuna[c]) porComuna[c] = { pedidos: 0, valor: 0 }; porComuna[c].pedidos++; porComuna[c].valor += (r.valor || 0) === 1 ? 0 : (r.valor || 0);
    const t = r.transporte || 'Sin transporte'; if (!porTransporte[t]) porTransporte[t] = { pedidos: 0, valor: 0 }; porTransporte[t].pedidos++; porTransporte[t].valor += (r.valor || 0) === 1 ? 0 : (r.valor || 0);
    const cl = r.nombre || 'Sin nombre'; if (!porCliente[cl]) porCliente[cl] = { pedidos: 0, valor: 0 }; porCliente[cl].pedidos++; porCliente[cl].valor += (r.valor || 0) === 1 ? 0 : (r.valor || 0);
    const obs = (r.observacion || '').trim().toUpperCase(); if (obs) { if (!incidencias[obs]) incidencias[obs] = 0; incidencias[obs]++; }
    const d = r.fecha || 'Sin fecha'; if (!porDia[d]) porDia[d] = { pedidos: 0, valor: 0 }; porDia[d].pedidos++; porDia[d].valor += (r.valor || 0) === 1 ? 0 : (r.valor || 0);
    const rg = r.rango || 'Sin rango'; if (!porRango[rg]) porRango[rg] = { pedidos: 0, valor: 0 }; porRango[rg].pedidos++; porRango[rg].valor += (r.valor || 0) === 1 ? 0 : (r.valor || 0);
  });

  const totalConIncidencia = Object.values(incidencias).reduce((a,b) => a+b, 0);
  const tasaIncidencia = totalPedidos > 0 ? (totalConIncidencia / totalPedidos * 100) : 0;
  const comunasUnicas = Object.keys(porComuna).length;
  const clientesUnicos = Object.keys(porCliente).length;
  const transportesActivos = Object.keys(porTransporte).length;
  const unidadesActivas = Object.keys(porUnidad).length;
  const pedidosPorTransporte = transportesActivos > 0 ? totalPedidos / transportesActivos : 0;
  const densidadComunas = comunasUnicas > 0 ? totalPedidos / comunasUnicas : 0;

  const clientesSorted = Object.entries(porCliente).sort((a,b) => b[1].valor - a[1].valor);
  const valorTotalClientes = clientesSorted.reduce((sum, [,d]) => sum + d.valor, 0);
  let acumuladoCliente = 0;
  const clientesPareto80 = [];
  for (const [c, d] of clientesSorted) { acumuladoCliente += d.valor; clientesPareto80.push(c); if (acumuladoCliente >= valorTotalClientes * 0.8) break; }

  return {
    totalPedidos, totalValor, ticketPromedio, amCount, pmCount, b2cCount,
    porUnidad, porComuna, porTransporte, porCliente, incidencias,
    totalConIncidencia, tasaIncidencia, porDia, porRango,
    comunasUnicas, clientesUnicos, transportesActivos, unidadesActivas,
    pedidosPorTransporte, densidadComunas,
    clientesPareto80, clientesSorted
  };
}

function renderResumenEjecutivo(kpis, periodo, fecha, semanaNum, mes, anio, movil, unidad, tipo) {
  let periodoTexto = '';
  if (periodo === 'dia') periodoTexto = `día ${fmtFechaConDia(fecha)}`;
  else if (periodo === 'semana') {
    const semana = TABLA_SEMANAS_2026.find(s => s.num === semanaNum);
    if (semana) periodoTexto = `semana ${semanaNum} (${fmtFecha(semana.inicio)} al ${fmtFecha(semana.fin)}) - ${semana.mes}`;
  }
  else if (periodo === 'mes') periodoTexto = `${MESES_NOM[parseInt(mes)-1]} ${anio}`;
  else if (periodo === 'anio') periodoTexto = `año ${anio}`;

  let filtroTexto = '';
  if (movil !== 'todos') filtroTexto += ` | Móvil: ${movil}`;
  if (unidad !== 'todas') filtroTexto += ` | ${unidad}`;
  filtroTexto += ` | Tipo: ${tipo}`;

  const topComuna = Object.entries(kpis.porComuna).sort((a,b) => b[1].pedidos - a[1].pedidos)[0];
  const topUnidad = Object.entries(kpis.porUnidad).sort((a,b) => b[1].pedidos - a[1].pedidos)[0];
  const topTransporte = Object.entries(kpis.porTransporte).sort((a,b) => b[1].pedidos - a[1].pedidos)[0];

  return `<div class="inf-resumen-ejecutivo">
    <h3>📋 RESUMEN EJECUTIVO GERENCIAL</h3>
    <p style="margin-bottom:15px;color:var(--text-secondary)"><strong>Período:</strong> ${periodoTexto} <strong>Filtros:</strong> ${filtroTexto}</p>
    <ul>
      <li><strong>Volumen total:</strong> ${formatoEntero(kpis.totalPedidos)} pedidos procesados.</li>
      <li><strong>Facturación acumulada:</strong> ${formatoMoneda(kpis.totalValor)} | Ticket promedio: ${formatoMoneda(kpis.ticketPromedio)}</li>
      <li><strong>Distribución por turno:</strong> AM: ${formatoEntero(kpis.amCount)} (${kpis.totalPedidos>0?(kpis.amCount/kpis.totalPedidos*100).toFixed(1):0}%) | PM: ${formatoEntero(kpis.pmCount)} | B2C: ${formatoEntero(kpis.b2cCount)}</li>
      ${topComuna ? `<li><strong>Comuna líder:</strong> ${topComuna[0]} con ${formatoEntero(topComuna[1].pedidos)} entregas</li>` : ''}
      ${topUnidad ? `<li><strong>Unidad principal:</strong> ${topUnidad[0]} - ${formatoEntero(topUnidad[1].pedidos)} pedidos</li>` : ''}
      ${topTransporte ? `<li><strong>Transporte líder:</strong> ${topTransporte[0]} - ${formatoEntero(topTransporte[1].pedidos)} despachos</li>` : ''}
      <li><strong>Cobertura:</strong> ${kpis.comunasUnicas} comunas | ${kpis.clientesUnicos} clientes | ${kpis.transportesActivos} transportes | ${kpis.unidadesActivas} unidades</li>
      <li><strong>Tasa de incidencias:</strong> ${kpis.tasaIncidencia.toFixed(1)}% (${formatoEntero(kpis.totalConIncidencia)} pedidos con observaciones)</li>
      <li><strong>Eficiencia operativa:</strong> ${kpis.pedidosPorTransporte.toFixed(1)} pedidos/transporte | ${kpis.densidadComunas.toFixed(1)} pedidos/comuna</li>
      <li><strong>Clientes top 20% (Pareto):</strong> ${kpis.clientesPareto80.length} clientes concentran el 80% de la facturación</li>
    </ul>
  </div>`;
}

function renderKPIs(kpis) {
  return `<div class="inf-kpi-grid">
    <div class="inf-kpi-card"><div class="inf-kpi-label">Total Pedidos</div><div class="inf-kpi-value">${formatoEntero(kpis.totalPedidos)}</div><div class="inf-kpi-sub">Despachos procesados</div></div>
    <div class="inf-kpi-card green"><div class="inf-kpi-label">Facturación Total</div><div class="inf-kpi-value">${formatoMoneda(kpis.totalValor)}</div><div class="inf-kpi-sub">Valor acumulado</div></div>
    <div class="inf-kpi-card am"><div class="inf-kpi-label">Ticket Promedio</div><div class="inf-kpi-value">${formatoMoneda(kpis.ticketPromedio)}</div><div class="inf-kpi-sub">Por pedido</div></div>
    <div class="inf-kpi-card"><div class="inf-kpi-label">Turno AM</div><div class="inf-kpi-value">${formatoEntero(kpis.amCount)}</div><div class="inf-kpi-sub">${kpis.totalPedidos>0?(kpis.amCount/kpis.totalPedidos*100).toFixed(1):0}% del total</div></div>
    <div class="inf-kpi-card pm"><div class="inf-kpi-label">Turno PM</div><div class="inf-kpi-value">${formatoEntero(kpis.pmCount)}</div><div class="inf-kpi-sub">${kpis.totalPedidos>0?(kpis.pmCount/kpis.totalPedidos*100).toFixed(1):0}% del total</div></div>
    <div class="inf-kpi-card red"><div class="inf-kpi-label">Tasa Incidencias</div><div class="inf-kpi-value">${kpis.tasaIncidencia.toFixed(1)}%</div><div class="inf-kpi-sub">${formatoEntero(kpis.totalConIncidencia)} con observaciones</div></div>
    <div class="inf-kpi-card"><div class="inf-kpi-label">Comunas</div><div class="inf-kpi-value">${kpis.comunasUnicas}</div><div class="inf-kpi-sub">Zonas cubiertas</div></div>
    <div class="inf-kpi-card green"><div class="inf-kpi-label">Clientes</div><div class="inf-kpi-value">${kpis.clientesUnicos}</div><div class="inf-kpi-sub">Base activa</div></div>
    <div class="inf-kpi-card"><div class="inf-kpi-label">Transportes</div><div class="inf-kpi-value">${kpis.transportesActivos}</div><div class="inf-kpi-sub">En operación</div></div>
    <div class="inf-kpi-card"><div class="inf-kpi-label">Unidades</div><div class="inf-kpi-value">${kpis.unidadesActivas}</div><div class="inf-kpi-sub">Negocios activos</div></div>
    <div class="inf-kpi-card"><div class="inf-kpi-label">Eficiencia</div><div class="inf-kpi-value">${kpis.pedidosPorTransporte.toFixed(1)}</div><div class="inf-kpi-sub">Pedidos/transporte</div></div>
    <div class="inf-kpi-card green"><div class="inf-kpi-label">Densidad</div><div class="inf-kpi-value">${kpis.densidadComunas.toFixed(1)}</div><div class="inf-kpi-sub">Pedidos/comuna</div></div>
  </div>`;
}

function renderMapaSantiago(kpis) {
  return `<div class="mapa-santiago-wrap">
    <div class="mapa-santiago-title">
      🗺️ Mapa de Calor Geográfico - Santiago
      <button class="btn-toggle-vista" onclick="cambiarVistaMapa()">🔄 ${infMapaVista === 'mapa' ? 'VER GRÁFICO' : 'VER MAPA'}</button>
    </div>
    <div id="mapaHeatmapContainer" class="mapa-svg-container"></div>
    <div class="mapa-legend">
      <div class="mapa-legend-item"><div class="mapa-legend-color" style="background:rgba(239,68,68,0.9)"></div>Muy Alta demanda</div>
      <div class="mapa-legend-item"><div class="mapa-legend-color" style="background:rgba(245,158,11,0.8)"></div>Alta demanda</div>
      <div class="mapa-legend-item"><div class="mapa-legend-color" style="background:rgba(251,191,36,0.7)"></div>Media demanda</div>
      <div class="mapa-legend-item"><div class="mapa-legend-color" style="background:rgba(59,130,246,0.6)"></div>Baja demanda</div>
      <div class="mapa-legend-item"><div class="mapa-legend-color" style="background:rgba(100,116,139,0.3)"></div>Sin pedidos</div>
    </div>
    <div class="inf-insight"><strong>💡 Insight Geográfico:</strong> ${generarInsightGeografico(kpis)}</div>
  </div>`;
}

function generarInsightGeografico(kpis) {
  const topComunas = Object.entries(kpis.porComuna).sort((a,b) => b[1].pedidos - a[1].pedidos).slice(0, 3);
  if (topComunas.length === 0) return 'Sin datos geográficos disponibles.';
  const total = kpis.totalPedidos;
  const concentracion = topComunas.reduce((sum, [,d]) => sum + d.pedidos, 0);
  const porcentaje = ((concentracion / total) * 100).toFixed(1);
  return `Las 3 comunas líderes (${topComunas.map(c=>c[0]).join(', ')}) concentran el ${porcentaje}% de los despachos. Se recomienda optimizar rutas en estas zonas para reducir costos operativos.`;
}

function renderChartTransporte() {
  return `<div class="inf-chart-card"><div class="inf-chart-header"><div><h3> Rendimiento por Tipo de Transporte</h3><p class="inf-chart-sub">Comparativa de flota completa</p></div><div class="inf-chart-actions"><button class="btn-expand" onclick="expandirChart('transporte','Análisis comparativo de la flota completa de transporte. Muestra el número de pedidos y el valor monetario transportado por cada operador. Permite identificar cuellos de botella, sobrecarga de operadores y oportunidades de redistribución de carga para optimizar costos logísticos.')">⛶ Pantalla completa</button></div></div><div class="inf-chart-container"><canvas id="chartTransporte"></canvas></div><div class="inf-insight"><strong> Insight Logístico:</strong> Participación de flota completa y valor transportado. Identifica operadores sobrecargados y permite rebalancear la carga para optimizar costos.</div></div>`;
}

function renderChartPareto() {
  return `<div class="inf-chart-card"><div class="inf-chart-header"><div><h3>🎯 Análisis Pareto (80/20) - Comunas</h3><p class="inf-chart-sub">Comunas que concentran el 80% de los despachos</p></div><div class="inf-chart-actions"><button class="btn-expand" onclick="expandirChart('pareto','Aplicación del Principio de Pareto (80/20) a las comunas de entrega. La línea acumulada muestra qué porcentaje de comunas concentra el 80% de los despachos. Típicamente, un pequeño número de comunas (20%) genera la mayor parte del volumen (80%), lo que permite enfocar recursos en zonas críticas y optimizar la asignación de flota.')">⛶ Pantalla completa</button></div></div><div class="inf-chart-container"><canvas id="chartPareto"></canvas></div><div class="inf-insight"><strong>💡 Insight Estratégico:</strong> Principio 80/20 aplicado a comunas. Identifica las comunas críticas que concentran la mayor parte de los despachos para priorizar recursos.</div></div>`;
}

function renderChartTendencia() {
  return `<div class="inf-chart-card"><div class="inf-chart-header"><div><h3>📈 Evolución Temporal: Pedidos vs Facturación</h3><p class="inf-chart-sub">Tendencia dual de volumen y valor</p></div><div class="inf-chart-actions"><button class="btn-expand" onclick="expandirChart('tendencia','Gráfico de tendencia dual que muestra la evolución del volumen de pedidos (línea azul) y la facturación acumulada (línea naranja) a lo largo del período seleccionado. Permite detectar picos de demanda, estacionalidad intra-período, correlación entre volumen y valor, y días de baja operación que requieren análisis de causas raíz.')">⛶ Pantalla completa</button></div></div><div class="inf-chart-container"><canvas id="chartTendencia"></canvas></div><div class="inf-insight"><strong>💡 Insight Temporal:</strong> Tendencia dual de volumen y facturación. Permite detectar picos de demanda, estacionalidad y correlación volumen-valor para planificación de capacidad.</div></div>`;
}

function renderChartIncidencias() {
  return `<div class="inf-chart-card"><div class="inf-chart-header"><div><h3>⚠️ Análisis de Incidencias (Observaciones)</h3><p class="inf-chart-sub">Categorización de incidencias logísticas</p></div><div class="inf-chart-actions"><button class="btn-expand" onclick="expandirChart('incidencias','Categorización de incidencias logísticas presentes en la columna OBSERVACIÓN. Muestra la distribución porcentual de cada tipo de observación. Una tasa alta de incidencias indica problemas en procesos de validación de direcciones, coordinación con clientes o calidad de datos que requieren atención inmediata y planes de acción correctiva.')">⛶ Pantalla completa</button></div></div><div class="inf-chart-container"><canvas id="chartIncidencias"></canvas></div><div class="inf-insight"><strong>💡 Insight de Calidad:</strong> Tipos de incidencias logísticas. Una tasa alta indica problemas operativos que requieren revisión de procesos de validación y coordinación.</div></div>`;
}

function renderChartUnidades() {
  return `<div class="inf-chart-card"><div class="inf-chart-header"><div><h3>🏢 Rendimiento por Unidad de Negocio</h3><p class="inf-chart-sub">Desempeño por unidad</p></div><div class="inf-chart-actions"><button class="btn-expand" onclick="expandirChart('unidades','Análisis de desempeño por unidad de negocio. Muestra el volumen de pedidos y facturación de cada unidad, permitiendo identificar las unidades más rentables y las que requieren apoyo operativo.')">⛶ Pantalla completa</button></div></div><div class="inf-chart-container"><canvas id="chartUnidades"></canvas></div><div class="inf-insight"><strong>💡 Insight de Negocio:</strong> Desempeño por unidad de negocio. Identifica las unidades más rentables y las que requieren estrategias diferenciadas.</div></div>`;
}

function renderChartRango() {
  return `<div class="inf-chart-card"><div class="inf-chart-header"><div><h3>🔄 Distribución por Rango (AM/PM/B2C)</h3><p class="inf-chart-sub">Balance de turnos</p></div><div class="inf-chart-actions"><button class="btn-expand" onclick="expandirChart('rango','Distribución de despachos por rango horario (AM, PM, B2C). Permite analizar la carga operativa por turno y detectar desbalances que puedan afectar la eficiencia de la flota y los tiempos de entrega.')">⛶ Pantalla completa</button></div></div><div class="inf-chart-container"><canvas id="chartRango"></canvas></div><div class="inf-insight"><strong>💡 Insight Operativo:</strong> Distribución por turno. Detecta desbalances entre AM/PM/B2C para optimizar asignación de recursos.</div></div>`;
}

function renderPlanillaPowerBI() {
  const columnas = ['N°', 'FECHA', 'UNIDAD', 'ID PEDIDO', 'CLIENTE', 'DIRECCION', 'COMUNA', 'VALOR', 'OBS', 'TRANSPORTE', 'RANGO'];
  const letras = ['A','B','C','D','E','F','G','H','I','J','K'];

  let html = `
    <div class="inf-tabla-section">
      <div class="inf-tabla-header">
        <div class="inf-tabla-title">📋 Planilla Power BI - ${formatoEntero(infDatos.length)} registros | Auditoría activa</div>
        <div class="inf-tabla-actions">
          <button class="inf-btn primary" onclick="copiarPlanilla()">📋 Copiar</button>
          <button class="inf-btn success" onclick="exportarPlanillaCSV()">📤 Exportar CSV</button>
          <button class="inf-btn warning" onclick="verAuditoria()">📝 Ver Auditoría (${infAuditLog.length})</button>
          <button class="inf-btn" onclick="agregarFilaPlanilla()">➕ Agregar fila</button>
          <button class="inf-btn danger" onclick="limpiarSeleccionPlanilla()">🗑️ Limpiar</button>
        </div>
      </div>
      <div class="planilla-filtros">
        <input type="text" id="infPlanillaBuscar" placeholder=" Buscar en planilla..." oninput="filtrarPlanilla()">
        <select id="planillaOrdenar" onchange="ordenarPlanilla()">
          <option value="">Ordenar por...</option>
          <option value="fecha">Fecha</option>
          <option value="comuna">Comuna</option>
          <option value="valor">Valor</option>
          <option value="transporte">Transporte</option>
        </select>
        <span style="color:var(--text-muted);font-size:.8em" id="planillaInfo">${formatoEntero(infDatos.length)} filas</span>
      </div>
      <div class="inf-excel-wrap">
        <table class="inf-excel-table" id="infExcelTable">
          <thead>
            <tr>
              <th class="row-num"></th>
              ${columnas.map((c, i) => `<th onclick="ordenarPlanillaPorColumna(${i})">${letras[i]}<br>${c} ⇅</th>`).join('')}
            </tr>
          </thead>
          <tbody id="planillaBody">
  `;

  infDatos.forEach((r, idx) => {
    html += `<tr data-idx="${idx}">
      <td class="row-num">${idx+1}</td>
      <td contenteditable="true" data-col="fecha" onblur="auditarCambio(${idx},'fecha',this)">${r.fecha||''}</td>
      <td contenteditable="true" data-col="unidad" onblur="auditarCambio(${idx},'unidad',this)">${r.unidad||''}</td>
      <td contenteditable="true" data-col="idPedido" onblur="auditarCambio(${idx},'idPedido',this)">${r.idPedido||''}</td>
      <td contenteditable="true" data-col="nombre" onblur="auditarCambio(${idx},'nombre',this)">${r.nombre||''}</td>
      <td contenteditable="true" data-col="direccion" onblur="auditarCambio(${idx},'direccion',this)">${r.direccion||''}</td>
      <td contenteditable="true" data-col="comuna" onblur="auditarCambio(${idx},'comuna',this)">${r.comuna||''}</td>
      <td contenteditable="true" data-col="valor" onblur="auditarCambio(${idx},'valor',this)">${r.valor||0}</td>
      <td contenteditable="true" data-col="observacion" onblur="auditarCambio(${idx},'observacion',this)">${r.observacion||''}</td>
      <td contenteditable="true" data-col="transporte" onblur="auditarCambio(${idx},'transporte',this)">${r.transporte||''}</td>
      <td contenteditable="true" data-col="rango" onblur="auditarCambio(${idx},'rango',this)">${r.rango||''}</td>
    </tr>`;
  });

  for (let i = 0; i < 10; i++) {
    html += `<tr data-idx="${infDatos.length + i}">
      <td class="row-num">${infDatos.length + i + 1}</td>
      ${columnas.slice(1).map(() => `<td contenteditable="true"></td>`).join('')}
    </tr>`;
  }

  html += `
          </tbody>
        </table>
      </div>
      <div class="audit-panel" id="auditPanel" style="display:none">
        <h4>📝 Registro de Auditoría - Cambios en la planilla</h4>
        <div id="auditLogContent"></div>
      </div>
    </div>
  `;

  return html;
}

function auditarCambio(idx, columna, elemento) {
  const nuevoValor = elemento.textContent.trim();
  const fila = infDatos[idx];
  if (!fila) return;

  const valorAnterior = fila[columna] || '';
  if (String(valorAnterior) !== nuevoValor) {
    const cambio = {
      fecha: new Date().toISOString(),
      usuario: auth.currentUser ? auth.currentUser.email : 'anonimo',
      fila: idx + 1,
      columna: columna,
      valorAnterior: valorAnterior,
      valorNuevo: nuevoValor
    };
    infAuditLog.unshift(cambio);
    elemento.classList.add('audit-changed');
    toast(`✏️ Cambio registrado: ${columna} en fila ${idx+1}`, 'info');
  }
}

function verAuditoria() {
  const panel = document.getElementById('auditPanel');
  const content = document.getElementById('auditLogContent');
  if (panel.style.display === 'none') {
    panel.style.display = 'block';
    if (infAuditLog.length === 0) {
      content.innerHTML = '<p style="color:var(--text-muted);padding:10px">Sin cambios registrados</p>';
    } else {
      content.innerHTML = infAuditLog.slice(0, 50).map(c =>
        `<div class="audit-entry">
          <span class="audit-time">${new Date(c.fecha).toLocaleString('es-CL')}</span> |
          <span class="audit-user">${c.usuario}</span> |
          Fila ${c.fila} | Columna: <strong>${c.columna}</strong> |
          <span class="audit-change">${c.valorAnterior} → ${c.valorNuevo}</span>
        </div>`
      ).join('');
    }
  } else {
    panel.style.display = 'none';
  }
}

function filtrarPlanilla() {
  const busq = document.getElementById('infPlanillaBuscar').value.toLowerCase();
  const rows = document.querySelectorAll('#planillaBody tr');
  let visibles = 0;
  rows.forEach(row => {
    const texto = row.textContent.toLowerCase();
    if (texto.includes(busq)) {
      row.style.display = '';
      visibles++;
    } else {
      row.style.display = 'none';
    }
  });
  document.getElementById('planillaInfo').textContent = `${visibles} filas visibles de ${infDatos.length}`;
}

function ordenarPlanilla() {
  const campo = document.getElementById('planillaOrdenar').value;
  if (!campo) return;
  infDatos.sort((a,b) => {
    const va = a[campo] || '';
    const vb = b[campo] || '';
    if (campo === 'valor') return parseFloat(va) - parseFloat(vb);
    return String(va).localeCompare(String(vb));
  });
  generarInforme();
}

function ordenarPlanillaPorColumna(colIdx) {
  const campos = ['fecha','unidad','idPedido','nombre','direccion','comuna','valor','observacion','transporte','rango'];
  const campo = campos[colIdx - 1];
  if (!campo) return;
  infDatos.sort((a,b) => {
    const va = a[campo] || '';
    const vb = b[campo] || '';
    if (campo === 'valor') return parseFloat(va) - parseFloat(vb);
    return String(va).localeCompare(String(vb));
  });
  generarInforme();
}

function exportarPlanillaCSV() {
  let csv = 'N°,FECHA,UNIDAD,ID_PEDIDO,CLIENTE,DIRECCION,COMUNA,VALOR,OBS,TRANSPORTE,RANGO\n';
  infDatos.forEach((r, i) => {
    csv += `${i+1},"${r.fecha||''}","${r.unidad||''}","${r.idPedido||''}","${r.nombre||''}","${r.direccion||''}","${r.comuna||''}",${r.valor||0},"${r.observacion||''}","${r.transporte||''}","${r.rango||''}"\n`;
  });
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `planilla_${infPeriodoActual}_${infTipoActual}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  toast(' CSV exportado', 'ok');
}

function copiarPlanilla() {
  const table = document.getElementById('infExcelTable');
  if (!table) return;
  const range = document.createRange();
  range.selectNode(table);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  try {
    document.execCommand('copy');
    toast('📋 Datos copiados al portapapeles', 'ok');
  } catch(e) { toast('Error al copiar', 'err'); }
  window.getSelection().removeAllRanges();
}

function limpiarSeleccionPlanilla() {
  const cells = document.querySelectorAll('.inf-excel-table td.selected');
  cells.forEach(c => { c.textContent = ''; c.classList.remove('selected','audit-changed'); });
  toast('🗑️ Selección limpiada', 'ok');
}

function agregarFilaPlanilla() {
  const tbody = document.querySelector('#planillaBody');
  if (!tbody) return;
  const rowCount = tbody.rows.length + 1;
  const tr = document.createElement('tr');
  tr.innerHTML = `<td class="row-num">${rowCount}</td>` +
    ['fecha','unidad','idPedido','nombre','direccion','comuna','valor','observacion','transporte','rango'].map((col, i) =>
      `<td contenteditable="true" data-col="${col}" onblur="auditarCambio(${infDatos.length},'${col}',this)"></td>`
    ).join('');
  tbody.appendChild(tr);
  infDatos.push({ fecha:'', unidad:'', idPedido:'', nombre:'', direccion:'', comuna:'', valor:0, observacion:'', transporte:'', rango:'' });
  toast(' Fila agregada', 'ok');
}

function renderInsights(kpis) {
  const topComunas = Object.entries(kpis.porComuna).sort((a,b) => b[1].pedidos - a[1].pedidos).slice(0, 5);
  const topTransportes = Object.entries(kpis.porTransporte).sort((a,b) => b[1].pedidos - a[1].pedidos).slice(0, 5);
  const topClientes = kpis.clientesSorted.slice(0, 5);
  const topUnidades = Object.entries(kpis.porUnidad).sort((a,b) => b[1].pedidos - a[1].pedidos).slice(0, 5);

  return `<div class="inf-resumen-ejecutivo">
    <h3>🎯 ANÁLISIS PROFUNDO Y OPORTUNIDADES DE MEJORA</h3>

    <h4 style="color:var(--accent-orange);margin:15px 0 10px 0"> Top 5 Comunas por Volumen</h4>
    <ul>${topComunas.map(([c, d], i) => `<li><strong>#${i+1} ${c}:</strong> ${formatoEntero(d.pedidos)} pedidos | ${formatoMoneda(d.valor)} facturados</li>`).join('')}</ul>

    <h4 style="color:var(--accent-purple);margin:15px 0 10px 0">🚚 Top 5 Transportes por Utilización</h4>
    <ul>${topTransportes.map(([t, d], i) => `<li><strong>#${i+1} ${t}:</strong> ${formatoEntero(d.pedidos)} despachos | ${formatoMoneda(d.valor)} transportados</li>`).join('')}</ul>

    <h4 style="color:var(--accent-green);margin:15px 0 10px 0">👥 Top 5 Clientes por Facturación</h4>
    <ul>${topClientes.map(([c, d], i) => `<li><strong>#${i+1} ${c}:</strong> ${formatoEntero(d.pedidos)} pedidos | ${formatoMoneda(d.valor)}</li>`).join('')}</ul>

    <h4 style="color:var(--accent-blue);margin:15px 0 10px 0">🏢 Top 5 Unidades de Negocio</h4>
    <ul>${topUnidades.map(([u, d], i) => `<li><strong>#${i+1} ${u}:</strong> ${formatoEntero(d.pedidos)} pedidos | ${formatoMoneda(d.valor)}</li>`).join('')}</ul>

    <h4 style="color:var(--accent-red);margin:15px 0 10px 0"> Oportunidades de Mejora Operativa</h4>
    <ul>
      <li><strong>Optimización de rutas:</strong> Concentrar despachos en comunas de alta densidad reduce costos de combustible y tiempo.</li>
      <li><strong>Balance de flota:</strong> ${topTransportes[0] ? `El transporte ${topTransportes[0][0]} concentra el ${(topTransportes[0][1].pedidos/kpis.totalPedidos*100).toFixed(1)}% de los despachos.` : ''} Considerar redistribución.</li>
      <li><strong>Reducción de incidencias:</strong> Con una tasa del ${kpis.tasaIncidencia.toFixed(1)}%, revisar procesos de validación de direcciones.</li>
      <li><strong>Planificación de capacidad:</strong> Los picos de demanda requieren ajuste de recursos en días específicos.</li>
      <li><strong>Segmentación de clientes:</strong> ${kpis.clientesPareto80.length} clientes concentran el 80% de la facturación. Aplicar estrategia diferenciada.</li>
      <li><strong>Cobertura geográfica:</strong> ${kpis.comunasUnicas} comunas atendidas. Evaluar expansión en zonas de baja cobertura.</li>
      <li><strong>Eficiencia de transporte:</strong> ${kpis.transportesActivos} transportes activos con ${kpis.pedidosPorTransporte.toFixed(1)} pedidos promedio cada uno.</li>
      <li><strong>Diversificación de unidades:</strong> ${kpis.unidadesActivas} unidades de negocio activas. Analizar rentabilidad por unidad.</li>
    </ul>
  </div>`;
}

function inicializarGraficos(kpis) {
  const colors = {
    primary: '#1a5490', secondary: '#3b82f6', accent: '#f59e0b',
    success: '#10b981', danger: '#ef4444', purple: '#a855f7',
    gray: '#64748b', light: '#e2e8f0'
  };

  const transportes = Object.keys(kpis.porTransporte);
  const dias = Object.keys(kpis.porDia).sort();
  const unidades = Object.keys(kpis.porUnidad);

  // 1. Transporte
  if (transportes.length > 0) {
    const ctxTransp = document.getElementById('chartTransporte');
    if (ctxTransp) {
      infCharts.transporte = new Chart(ctxTransp, {
        type: 'bar',
        data: {
          labels: transportes,
          datasets: [
            { label: 'Pedidos', data: transportes.map(t => kpis.porTransporte[t]?.pedidos || 0), backgroundColor: colors.primary },
            { label: 'Valor ($)', data: transportes.map(t => kpis.porTransporte[t]?.valor || 0), backgroundColor: colors.accent, yAxisID: 'y1' }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: colors.light } } },
          scales: {
            x: { ticks: { color: colors.light, maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y: { type: 'linear', display: true, position: 'left', ticks: { color: colors.light }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y1: { type: 'linear', display: true, position: 'right', ticks: { color: colors.accent }, grid: { drawOnChartArea: false } }
          }
        }
      });
    }
  }

  // 2. Pareto
  const comunasSorted = Object.entries(kpis.porComuna).sort((a,b) => b[1].pedidos - a[1].pedidos).slice(0, 15);
  if (comunasSorted.length > 0) {
    const totalPareto = comunasSorted.reduce((sum, [,d]) => sum + d.pedidos, 0);
    let acumulado = 0;
    const paretoData = comunasSorted.map(([c, d]) => {
      acumulado += d.pedidos;
      return (acumulado / totalPareto) * 100;
    });

    const ctxPareto = document.getElementById('chartPareto');
    if (ctxPareto) {
      infCharts.pareto = new Chart(ctxPareto, {
        type: 'bar',
        data: {
          labels: comunasSorted.map(([c]) => c.length > 15 ? c.substring(0, 15) + '...' : c),
          datasets: [
            { label: 'Pedidos', data: comunasSorted.map(([,d]) => d.pedidos), backgroundColor: colors.primary, order: 2 },
            { label: '% Acumulado', data: paretoData, type: 'line', borderColor: colors.accent, backgroundColor: colors.accent, yAxisID: 'y1', order: 1 }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: colors.light } } },
          scales: {
            x: { ticks: { color: colors.light, maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y: { type: 'linear', display: true, position: 'left', ticks: { color: colors.light }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y1: { type: 'linear', display: true, position: 'right', min: 0, max: 100, ticks: { color: colors.accent, callback: v => v + '%' }, grid: { drawOnChartArea: false } }
          }
        }
      });
    }
  }

  // 3. Tendencia
  if (dias.length > 0) {
    const ctxTend = document.getElementById('chartTendencia');
    if (ctxTend) {
      infCharts.tendencia = new Chart(ctxTend, {
        type: 'line',
        data: {
          labels: dias.map(d => fmtFecha(d)),
          datasets: [
            { label: 'Pedidos', data: dias.map(d => kpis.porDia[d]?.pedidos || 0), borderColor: colors.primary, backgroundColor: colors.primary, tension: 0.3, yAxisID: 'y' },
            { label: 'Valor ($)', data: dias.map(d => kpis.porDia[d]?.valor || 0), borderColor: colors.accent, backgroundColor: colors.accent, tension: 0.3, yAxisID: 'y1' }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: colors.light } } },
          scales: {
            x: { ticks: { color: colors.light, maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y: { type: 'linear', display: true, position: 'left', ticks: { color: colors.light }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y1: { type: 'linear', display: true, position: 'right', ticks: { color: colors.accent }, grid: { drawOnChartArea: false } }
          }
        }
      });
    }
  }

  // 4. Incidencias
  const incidenciasEntries = Object.entries(kpis.incidencias).sort((a,b) => b[1] - a[1]).slice(0, 10);
  if (incidenciasEntries.length > 0) {
    const ctxInc = document.getElementById('chartIncidencias');
    if (ctxInc) {
      infCharts.incidencias = new Chart(ctxInc, {
        type: 'doughnut',
        data: {
          labels: incidenciasEntries.map(([i]) => i.length > 20 ? i.substring(0, 20) + '...' : i),
          datasets: [{
            data: incidenciasEntries.map(([,c]) => c),
            backgroundColor: [colors.primary, colors.secondary, colors.accent, colors.success, colors.danger, colors.purple, colors.gray, '#06b6d4', '#84cc16', '#f97316']
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { color: colors.light, font: { size: 10 } } } }
        }
      });
    }
  }

  // 5. Unidades
  if (unidades.length > 0) {
    const ctxUnid = document.getElementById('chartUnidades');
    if (ctxUnid) {
      infCharts.unidades = new Chart(ctxUnid, {
        type: 'bar',
        data: {
          labels: unidades,
          datasets: [
            { label: 'Pedidos', data: unidades.map(u => kpis.porUnidad[u]?.pedidos || 0), backgroundColor: colors.purple },
            { label: 'Valor ($)', data: unidades.map(u => kpis.porUnidad[u]?.valor || 0), backgroundColor: colors.success, yAxisID: 'y1' }
          ]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { labels: { color: colors.light } } },
          scales: {
            x: { ticks: { color: colors.light, maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y: { type: 'linear', display: true, position: 'left', ticks: { color: colors.light }, grid: { color: 'rgba(255,255,255,0.1)' } },
            y1: { type: 'linear', display: true, position: 'right', ticks: { color: colors.success }, grid: { drawOnChartArea: false } }
          }
        }
      });
    }
  }

  // 6. Rango
  const rangos = Object.keys(kpis.porRango);
  if (rangos.length > 0) {
    const ctxRango = document.getElementById('chartRango');
    if (ctxRango) {
      infCharts.rango = new Chart(ctxRango, {
        type: 'pie',
        data: {
          labels: rangos,
          datasets: [{
            data: rangos.map(r => kpis.porRango[r]?.pedidos || 0),
            backgroundColor: [colors.primary, colors.accent, colors.success]
          }]
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: { legend: { position: 'right', labels: { color: colors.light } } }
        }
      });
    }
  }
}

function inicializarMapaSantiago(kpis) {
  const cont = document.getElementById('mapaHeatmapContainer');
  if (!cont) return;

  if (infMapaVista === 'mapa') {
    cont.innerHTML = renderMapaSVG(kpis);
  } else {
    cont.innerHTML = '<canvas id="chartMapaBar" style="width:100%;height:450px;"></canvas>';
    setTimeout(() => {
      const ctx = document.getElementById('chartMapaBar');
      if (ctx) {
        const topComunas = Object.entries(kpis.porComuna).sort((a,b) => b[1].pedidos - a[1].pedidos).slice(0, 15);
        if (infCharts.mapaBar) infCharts.mapaBar.destroy();
        infCharts.mapaBar = new Chart(ctx, {
          type: 'bar',
          data: {
            labels: topComunas.map(c => c[0]),
            datasets: [{ label: 'Pedidos por Comuna', data: topComunas.map(c => c[1].pedidos), backgroundColor: topComunas.map((_, i) => { const intensity = 0.3 + (i / topComunas.length) * 0.7; return `rgba(245,158,11,${intensity})`; }) }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: '#e2e8f0' } } }, scales: { x: { ticks: { color: '#e2e8f0', maxRotation: 45 }, grid: { color: 'rgba(255,255,255,0.1)' } }, y: { ticks: { color: '#e2e8f0' }, grid: { color: 'rgba(255,255,255,0.1)' } } } }
        });
      }
    }, 50);
  }
}

function renderMapaSVG(kpis) {
  const maxPedidos = Math.max(...Object.values(kpis.porComuna).map(c => c.pedidos), 1);
  let svg = `<svg viewBox="0 0 900 700" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:100%;background:var(--bg-primary);border-radius:8px;padding:20px;">`;
  svg += `<text x="450" y="25" text-anchor="middle" fill="var(--accent-orange)" font-size="18" font-weight="bold">MAPA DE CALOR - DISTRIBUCIÓN DE PEDIDOS POR COMUNA (TONOS NARANJO)</text>`;

  COMUNAS_SANTIAGO_MAPA.forEach(comuna => {
    const datos = kpis.porComuna[comuna.nombre];
    const pedidos = datos ? datos.pedidos : 0;
    const valor = datos ? datos.valor : 0;
    const intensidad = pedidos / maxPedidos;

    let color;
    if (pedidos === 0) color = 'rgba(100,116,139,0.2)';
    else if (intensidad > 0.75) color = 'rgba(194,65,12,0.95)';
    else if (intensidad > 0.5) color = 'rgba(234,88,12,0.85)';
    else if (intensidad > 0.25) color = 'rgba(245,158,11,0.75)';
    else color = 'rgba(253,224,71,0.6)';

    svg += `<rect class="mapa-comuna" x="${comuna.x}" y="${comuna.y}" width="${comuna.w}" height="${comuna.h}"
            fill="${color}" stroke="#fff" stroke-width="0.5" rx="3"
            data-comuna="${comuna.nombre}" data-pedidos="${pedidos}" data-valor="${valor}"
            onmouseenter="mostrarTooltipMapa(event, '${comuna.nombre}', ${pedidos}, ${valor})"
            onmouseleave="ocultarTooltipMapa()"
            onclick="filtrarPorComuna('${comuna.nombre}')">
            <title>${comuna.nombre}: ${pedidos} pedidos | ${formatoMoneda(valor)}</title>
          </rect>`;
    if (comuna.w > 50 && comuna.h > 30) {
      svg += `<text x="${comuna.x + comuna.w/2}" y="${comuna.y + comuna.h/2 - 3}"
              text-anchor="middle" fill="${pedidos > 0 ? '#fff' : 'var(--text-muted)'}"
              font-size="${comuna.w > 70 ? 10 : 8}" font-weight="bold" pointer-events="none">
              ${comuna.nombre.length > 12 ? comuna.nombre.substring(0,12) : comuna.nombre}
            </text>`;
      if (pedidos > 0) {
        svg += `<text x="${comuna.x + comuna.w/2}" y="${comuna.y + comuna.h/2 + 10}"
                text-anchor="middle" fill="#fff" font-size="11" font-weight="bold" pointer-events="none">${pedidos}</text>`;
      }
    }
  });

  svg += `</svg>`;
  return svg;
}

window.mostrarTooltipMapa = function(e, comuna, pedidos, valor) {
  const tt = document.getElementById('mapaTooltip');
  if (!tt) return;
  const data = infDatos.filter(r => canonComuna(r.comuna) === comuna);
  const valorTotal = data.reduce((s, r) => s + (((r.valor || 0) === 1) ? 0 : (r.valor || 0)), 0);
  tt.innerHTML = `<strong style="color:var(--accent-orange);font-size:14px">${comuna}</strong><br>
    <span style="color:#fbbf24">Pedidos:</span> ${formatoEntero(pedidos)}<br>
    <span style="color:#fbbf24">Valor:</span> ${formatoMoneda(valor)}<br>
    <span style="color:#fbbf24">Registros:</span> ${data.length}<br>
    <em style="color:#94a3b8;font-size:11px">Click para filtrar</em>`;
  tt.style.display = 'block';
  tt.style.left = (e.clientX + 15) + 'px';
  tt.style.top = (e.clientY + 15) + 'px';
};

window.ocultarTooltipMapa = function() {
  const tt = document.getElementById('mapaTooltip');
  if (tt) tt.style.display = 'none';
};

window.filtrarPorComuna = function(comuna) {
  const inp = document.getElementById('infPlanillaBuscar');
  if (inp) { inp.value = comuna; filtrarPlanilla(); }
  toast(`🔍 Filtrando por comuna: ${comuna}`, 'info');
};

window.cambiarVistaMapa = function() {
  infMapaVista = infMapaVista === 'mapa' ? 'grafico' : 'mapa';
  const kpis = calcularKPIs(infDatos);
  inicializarMapaSantiago(kpis);
  const btn = document.querySelector('.btn-toggle-vista');
  if (btn) btn.textContent = `🔄 ${infMapaVista === 'mapa' ? 'VER GRÁFICO' : 'VER MAPA'}`;
};

window.expandirChart = function(chartName, explicacion) {
  const canvas = document.getElementById(`chart${chartName.charAt(0).toUpperCase() + chartName.slice(1)}`);
  if (!canvas) return;

  const overlay = document.getElementById('chartFullscreen');
  const tituloEl = document.getElementById('chartFullscreenTitle');
  const subtituloEl = document.getElementById('chartFullscreenSubtitle');
  const bodyEl = document.getElementById('chartFullscreenBody');

  const periodoTexto = infPeriodoActual === 'dia' ? `día ${fmtFechaConDia(document.getElementById('infFecha').value)}` :
                       infPeriodoActual === 'semana' ? `semana ${document.getElementById('infSemana').value}` :
                       infPeriodoActual === 'mes' ? `mes ${MESES_NOM[parseInt(document.getElementById('infMes').value)-1]}` :
                       `año ${document.getElementById('infAnio').value}`;

  const movilTexto = infMovilActual === 'todos' ? 'Flota Completa' : infMovilActual;
  const kpis = calcularKPIs(infDatos);

  let analisisDetallado = `<strong> Análisis Detallado - ${chartName.toUpperCase()}</strong><br><br>`;
  analisisDetallado += `<strong>Período analizado:</strong> ${periodoTexto}<br>`;
  analisisDetallado += `<strong>Filtros aplicados:</strong> Móvil: ${movilTexto} | Tipo: ${infTipoActual}<br>`;
  analisisDetallado += `<strong>Total de registros:</strong> ${formatoEntero(kpis.totalPedidos)} pedidos | ${formatoMoneda(kpis.totalValor)} facturados<br><br>`;
  analisisDetallado += `<strong>Explicación del gráfico:</strong><br>${explicacion || 'Visualización de datos del informe logístico.'}<br><br>`;

  if (chartName === 'transporte') {
    const topTransp = Object.entries(kpis.porTransporte).sort((a,b) => b[1].pedidos - a[1].pedidos)[0];
    if (topTransp) {
      analisisDetallado += `<strong>🔍 Hallazgo clave:</strong> El transporte ${topTransp[0]} lidera con ${formatoEntero(topTransp[1].pedidos)} despachos (${((topTransp[1].pedidos/kpis.totalPedidos)*100).toFixed(1)}% del total) y ${formatoMoneda(topTransp[1].valor)} en valor transportado.<br>`;
    }
    analisisDetallado += `<strong>💡 Recomendación:</strong> Evaluar distribución de carga entre transportes para evitar sobrecarga y optimizar costos.`;
  } else if (chartName === 'pareto') {
    analisisDetallado += `<strong> Principio 80/20:</strong> Típicamente el 20% de las comunas concentra el 80% de los despachos.<br>`;
    analisisDetallado += `<strong>💡 Recomendación:</strong> Enfocar recursos logísticos en las comunas críticas identificadas.`;
  } else if (chartName === 'tendencia') {
    analisisDetallado += `<strong>🔍 Análisis temporal:</strong> Observar picos y valles en la curva de pedidos vs facturación.<br>`;
    analisisDetallado += `<strong>💡 Recomendación:</strong> Ajustar capacidad operativa en días de alta demanda identificados.`;
  } else if (chartName === 'incidencias') {
    analisisDetallado += `<strong>🔍 Calidad operativa:</strong> Tasa de incidencias del ${kpis.tasaIncidencia.toFixed(1)}%.<br>`;
    analisisDetallado += `<strong>💡 Recomendación:</strong> Revisar procesos de validación de direcciones y coordinación con clientes.`;
  } else if (chartName === 'unidades') {
    const topUnd = Object.entries(kpis.porUnidad).sort((a,b) => b[1].pedidos - a[1].pedidos)[0];
    if (topUnd) {
      analisisDetallado += `<strong>🔍 Unidad líder:</strong> ${topUnd[0]} con ${formatoEntero(topUnd[1].pedidos)} pedidos.<br>`;
    }
    analisisDetallado += `<strong>💡 Recomendación:</strong> Analizar rentabilidad por unidad y asignar recursos según volumen.`;
  } else if (chartName === 'rango') {
    analisisDetallado += `<strong>🔍 Distribución por turno:</strong> AM: ${formatoEntero(kpis.amCount)} | PM: ${formatoEntero(kpis.pmCount)} | B2C: ${formatoEntero(kpis.b2cCount)}<br>`;
    analisisDetallado += `<strong>💡 Recomendación:</strong> Balancear carga entre turnos para optimizar utilización de flota.`;
  }

  tituloEl.textContent = `📊 ${chartName.toUpperCase()} - Análisis Detallado`;
  subtituloEl.textContent = analisisDetallado;
  overlay.classList.add('show');

  bodyEl.innerHTML = '';
  const canvasClone = document.createElement('canvas');
  canvasClone.style.maxWidth = '100%';
  canvasClone.style.maxHeight = '100%';
  bodyEl.appendChild(canvasClone);

  const chart = infCharts[chartName];
  if (chart) {
    if (infCharts.fullscreen) infCharts.fullscreen.destroy();
    infCharts.fullscreen = new Chart(canvasClone.getContext('2d'), {
      type: chart.config.type,
      data: JSON.parse(JSON.stringify(chart.config.data)),
      options: {
        ...chart.config.options,
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          ...chart.config.options.plugins,
          title: {
            display: true,
            text: `${chartName.toUpperCase()} - ${periodoTexto}`,
            color: '#1a5490',
            font: { size: 18, weight: 'bold' }
          }
        }
      }
    });
  }
};

window.cerrarChartFullscreen = function() {
  const overlay = document.getElementById('chartFullscreen');
  overlay.classList.remove('show');
  if (infCharts.fullscreen) {
    infCharts.fullscreen.destroy();
    infCharts.fullscreen = null;
  }
};

async function exportarInformePDF() {
  if (infDatos.length === 0) { toast('No hay datos para exportar', 'err'); return; }
  toast(' Generando PDF...', 'info');

  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const kpis = calcularKPIs(infDatos);
  const periodo = infPeriodoActual;
  const movil = infMovilActual;
  const unidad = infUnidadActual;
  const tipo = infTipoActual;

  let periodoTexto = '';
  if (periodo === 'dia') periodoTexto = 'Informe Diario';
  else if (periodo === 'semana') periodoTexto = 'Informe Semanal';
  else if (periodo === 'mes') periodoTexto = 'Informe Mensual';
  else if (periodo === 'anio') periodoTexto = 'Informe Anual';

  doc.setFillColor(26, 84, 144);
  doc.rect(0, 0, 210, 60, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('DESPACHO RETAIL', 105, 25, { align: 'center' });
  doc.setFontSize(16);
  doc.text(periodoTexto, 105, 40, { align: 'center' });
  doc.setFontSize(10);
  doc.text(`Generado: ${new Date().toLocaleString('es-CL')}`, 105, 52, { align: 'center' });

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  let y = 75;
  doc.text(`Tipo: ${tipo}`, 20, y); y += 7;
  doc.text(`Móvil: ${movil === 'todos' ? 'Flota Completa' : movil}`, 20, y); y += 7;
  doc.text(`Unidad: ${unidad === 'todas' ? 'Todas' : unidad}`, 20, y); y += 10;

  doc.setFont(undefined, 'bold');
  doc.setFontSize(13);
  doc.text('INDICADORES CLAVE (KPIs)', 20, y); y += 8;
  doc.setFont(undefined, 'normal');
  doc.setFontSize(10);

  const kpiData = [
    ['Total Pedidos', formatoEntero(kpis.totalPedidos)],
    ['Facturación Total', formatoMoneda(kpis.totalValor)],
    ['Ticket Promedio', formatoMoneda(kpis.ticketPromedio)],
    ['Turno AM', `${formatoEntero(kpis.amCount)} (${kpis.totalPedidos>0?(kpis.amCount/kpis.totalPedidos*100).toFixed(1):0}%)`],
    ['Turno PM', `${formatoEntero(kpis.pmCount)} (${kpis.totalPedidos>0?(kpis.pmCount/kpis.totalPedidos*100).toFixed(1):0}%)`],
    ['B2C', formatoEntero(kpis.b2cCount)],
    ['Tasa de Incidencias', `${kpis.tasaIncidencia.toFixed(1)}%`],
    ['Comunas Cubiertas', kpis.comunasUnicas],
    ['Clientes Únicos', kpis.clientesUnicos],
    ['Transportes Activos', kpis.transportesActivos],
    ['Unidades de Negocio', kpis.unidadesActivas],
    ['Eficiencia (pedidos/transporte)', kpis.pedidosPorTransporte.toFixed(1)],
    ['Densidad (pedidos/comuna)', kpis.densidadComunas.toFixed(1)]
  ];

  doc.autoTable({
    startY: y, head: [['Indicador', 'Valor']], body: kpiData,
    theme: 'striped', headStyles: { fillColor: [26, 84, 144], textColor: 255 }, styles: { fontSize: 9 }
  });

  y = doc.lastAutoTable.finalY + 10;

  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFont(undefined, 'bold');
  doc.setFontSize(13);
  doc.text('TOP 10 COMUNAS POR VOLUMEN', 20, y); y += 8;
  doc.setFont(undefined, 'normal');
  const topComunas = Object.entries(kpis.porComuna).sort((a,b) => b[1].pedidos - a[1].pedidos).slice(0, 10).map(([c, d], i) => [i+1, c, formatoEntero(d.pedidos), formatoMoneda(d.valor)]);
  doc.autoTable({ startY: y, head: [['#', 'Comuna', 'Pedidos', 'Valor']], body: topComunas, theme: 'striped', headStyles: { fillColor: [26, 84, 144], textColor: 255 }, styles: { fontSize: 9 } });
  y = doc.lastAutoTable.finalY + 10;

  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFont(undefined, 'bold');
  doc.setFontSize(13);
  doc.text('TOP 10 TRANSPORTES POR UTILIZACIÓN', 20, y); y += 8;
  doc.setFont(undefined, 'normal');
  const topTransp = Object.entries(kpis.porTransporte).sort((a,b) => b[1].pedidos - a[1].pedidos).slice(0, 10).map(([t, d], i) => [i+1, t, formatoEntero(d.pedidos), formatoMoneda(d.valor)]);
  doc.autoTable({ startY: y, head: [['#', 'Transporte', 'Pedidos', 'Valor']], body: topTransp, theme: 'striped', headStyles: { fillColor: [26, 84, 144], textColor: 255 }, styles: { fontSize: 9 } });
  y = doc.lastAutoTable.finalY + 10;

  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFont(undefined, 'bold');
  doc.setFontSize(13);
  doc.text('TOP 10 UNIDADES DE NEGOCIO', 20, y); y += 8;
  doc.setFont(undefined, 'normal');
  const topUnid = Object.entries(kpis.porUnidad).sort((a,b) => b[1].pedidos - a[1].pedidos).slice(0, 10).map(([u, d], i) => [i+1, u, formatoEntero(d.pedidos), formatoMoneda(d.valor)]);
  doc.autoTable({ startY: y, head: [['#', 'Unidad', 'Pedidos', 'Valor']], body: topUnid, theme: 'striped', headStyles: { fillColor: [26, 84, 144], textColor: 255 }, styles: { fontSize: 9 } });

  const paginasMinimas = periodo === 'dia' ? 4 : periodo === 'semana' ? 6 : periodo === 'mes' ? 10 : 12;
  while (doc.internal.pages.length - 1 < paginasMinimas - 1) { doc.addPage(); }

  doc.addPage();
  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(26, 84, 144);
  doc.text('DETALLE DE REGISTROS', 105, 20, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont(undefined, 'normal');
  const detalleData = infDatos.slice(0, 100).map((r, i) => [i+1, r.fecha || '', (r.unidad || '').substring(0, 25), r.idPedido || '', (r.nombre || '').substring(0, 20), canonComuna(r.comuna || ''), formatoMoneda(r.valor || 0), r.transporte || '', r.rango || '']);
  doc.autoTable({ startY: 30, head: [['#', 'Fecha', 'Unidad', 'ID', 'Cliente', 'Comuna', 'Valor', 'Transporte', 'Rango']], body: detalleData, theme: 'striped', headStyles: { fillColor: [26, 84, 144], textColor: 255, fontSize: 7 }, styles: { fontSize: 7 }, margin: { left: 10, right: 10 } });

  doc.addPage();
  doc.setFont(undefined, 'bold');
  doc.setFontSize(14);
  doc.setTextColor(26, 84, 144);
  doc.text('ANÁLISIS DE INCIDENCIAS', 105, 20, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  y = 35;
  doc.text(`Tasa de incidencias: ${kpis.tasaIncidencia.toFixed(1)}%`, 20, y); y += 7;
  doc.text(`Total con observaciones: ${formatoEntero(kpis.totalConIncidencia)} de ${formatoEntero(kpis.totalPedidos)}`, 20, y); y += 10;
  const incidenciasTop = Object.entries(kpis.incidencias).sort((a,b) => b[1] - a[1]).slice(0, 10);
  if (incidenciasTop.length > 0) {
    doc.autoTable({ startY: y, head: [['Incidencia', 'Cantidad', '%']], body: incidenciasTop.map(([i, c]) => [i, c, ((c/kpis.totalPedidos)*100).toFixed(1) + '%']), theme: 'striped', headStyles: { fillColor: [26, 84, 144], textColor: 255 }, styles: { fontSize: 9 } });
  }

  doc.addPage();
  doc.setFont(undefined, 'bold');
  doc.setFontSize(16);
  doc.setTextColor(26, 84, 144);
  doc.text('OPORTUNIDADES DE MEJORA', 105, 20, { align: 'center' });
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  const mejoras = [
    '1. OPTIMIZACIÓN DE RUTAS: Concentrar despachos en comunas de alta densidad reduce costos de combustible y tiempo de entrega.',
    '2. BALANCE DE FLOTA: Redistribuir carga entre transportes para evitar sobrecarga en operadores específicos.',
    '3. REDUCCIÓN DE INCIDENCIAS: Revisar procesos de validación de direcciones y coordinación con clientes.',
    '4. PLANIFICACIÓN DE CAPACIDAD: Ajustar recursos en días de pico de demanda identificados en el análisis temporal.',
    '5. SEGMENTACIÓN DE CLIENTES: Estrategia diferenciada para clientes de alto valor (top 20%) vs. clientes regulares.',
    '6. TECNOLOGÍA Y AUTOMATIZACIÓN: Implementar sistema de tracking en tiempo real para mejorar visibilidad operativa.',
    '7. CAPACITACIÓN OPERATIVA: Entrenamiento continuo para conductores en manejo de incidencias y rutas.',
    '8. ANÁLISIS PREDICTIVO: Utilizar datos históricos para anticipar demanda y optimizar asignación de recursos.',
    '9. COBERTURA GEOGRÁFICA: Evaluar expansión en zonas de baja cobertura identificadas en el mapa de calor.',
    '10. EFICIENCIA POR TURNO: Balancear carga entre turnos AM/PM/B2C para optimizar utilización de flota.'
  ];
  let y2 = 35;
  mejoras.forEach(m => {
    if (y2 > 270) { doc.addPage(); y2 = 20; }
    const lines = doc.splitTextToSize(m, 170);
    doc.text(lines, 20, y2);
    y2 += lines.length * 6 + 4;
  });

  if (infAuditLog.length > 0) {
    doc.addPage();
    doc.setFont(undefined, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(26, 84, 144);
    doc.text('REGISTRO DE AUDITORÍA', 105, 20, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    const auditData = infAuditLog.slice(0, 50).map(c => [new Date(c.fecha).toLocaleString('es-CL'), c.usuario, `Fila ${c.fila}`, c.columna, c.valorAnterior, c.valorNuevo]);
    doc.autoTable({ startY: 30, head: [['Fecha/Hora', 'Usuario', 'Fila', 'Columna', 'Valor Anterior', 'Valor Nuevo']], body: auditData, theme: 'striped', headStyles: { fillColor: [26, 84, 144], textColor: 255, fontSize: 7 }, styles: { fontSize: 7 }, margin: { left: 10, right: 10 } });
  }

  const filename = `Informe_${periodoTexto}_${tipo}_${movil === 'todos' ? 'FlotaCompleta' : movil}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
  toast(`✅ PDF exportado: ${filename}`, 'ok');
}

function exportarInformeExcel() {
  if (infDatos.length === 0) { toast('No hay datos para exportar', 'err'); return; }

  const wb = XLSX.utils.book_new();
  const kpis = calcularKPIs(infDatos);

  const resumenData = [
    ['RESUMEN EJECUTIVO - INFORME LOGÍSTICO'], [],
    ['Período', infPeriodoActual],
    ['Móvil', infMovilActual === 'todos' ? 'Flota Completa' : infMovilActual],
    ['Unidad', infUnidadActual === 'todas' ? 'Todas' : infUnidadActual],
    ['Tipo', infTipoActual],
    ['Fecha de generación', new Date().toLocaleString('es-CL')],
    [],
    ['INDICADORES CLAVE (KPIs)'],
    ['Total Pedidos', kpis.totalPedidos],
    ['Facturación Total', kpis.totalValor],
    ['Ticket Promedio', kpis.ticketPromedio],
    ['Turno AM', kpis.amCount],
    ['Turno PM', kpis.pmCount],
    ['B2C', kpis.b2cCount],
    ['Tasa de Incidencias', `${kpis.tasaIncidencia.toFixed(1)}%`],
    ['Comunas Cubiertas', kpis.comunasUnicas],
    ['Clientes Únicos', kpis.clientesUnicos],
    ['Transportes Activos', kpis.transportesActivos],
    ['Unidades de Negocio', kpis.unidadesActivas],
    ['Eficiencia (pedidos/transporte)', kpis.pedidosPorTransporte.toFixed(1)],
    ['Densidad (pedidos/comuna)', kpis.densidadComunas.toFixed(1)],
    [],
    ['TOP 10 COMUNAS'],
    ['Comuna', 'Pedidos', 'Valor', '% del Total'],
    ...Object.entries(kpis.porComuna).sort((a,b) => b[1].pedidos - a[1].pedidos).slice(0, 10).map(([c, d]) => [c, d.pedidos, d.valor, ((d.pedidos/kpis.totalPedidos)*100).toFixed(1) + '%']),
    [],
    ['TOP 10 TRANSPORTES'],
    ['Transporte', 'Pedidos', 'Valor', '% del Total'],
    ...Object.entries(kpis.porTransporte).sort((a,b) => b[1].pedidos - a[1].pedidos).slice(0, 10).map(([t, d]) => [t, d.pedidos, d.valor, ((d.pedidos/kpis.totalPedidos)*100).toFixed(1) + '%']),
    [],
    ['TOP 10 UNIDADES DE NEGOCIO'],
    ['Unidad', 'Pedidos', 'Valor', '% del Total'],
    ...Object.entries(kpis.porUnidad).sort((a,b) => b[1].pedidos - a[1].pedidos).slice(0, 10).map(([u, d]) => [u, d.pedidos, d.valor, ((d.pedidos/kpis.totalPedidos)*100).toFixed(1) + '%'])
  ];
  const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
  XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen Ejecutivo');

  const detalleData = [
    ['N°', 'FECHA', 'UNIDAD', 'ID PEDIDO', 'CLIENTE', 'DIRECCION', 'COMUNA', 'VALOR', 'OBS', 'TRANSPORTE', 'RANGO'],
    ...infDatos.map((r, i) => [i+1, r.fecha, r.unidad, r.idPedido, r.nombre, r.direccion, r.comuna, r.valor, r.observacion, r.transporte, r.rango])
  ];
  const wsDetalle = XLSX.utils.aoa_to_sheet(detalleData);
  XLSX.utils.book_append_sheet(wb, wsDetalle, 'Detalle Registros');

  const wsPlanilla = XLSX.utils.aoa_to_sheet([
    ['PLANILLA EDITABLE - Datos del informe'], [],
    ['N°', 'FECHA', 'UNIDAD', 'ID PEDIDO', 'CLIENTE', 'DIRECCION', 'COMUNA', 'VALOR', 'OBS', 'TRANSPORTE', 'RANGO'],
    ...infDatos.map((r, i) => [i+1, r.fecha, r.unidad, r.idPedido, r.nombre, r.direccion, r.comuna, r.valor, r.observacion, r.transporte, r.rango])
  ]);
  XLSX.utils.book_append_sheet(wb, wsPlanilla, 'Planilla Editable');

  if (infAuditLog.length > 0) {
    const auditData = [
      ['REGISTRO DE AUDITORÍA - Cambios en la planilla'], [],
      ['Fecha/Hora', 'Usuario', 'Fila', 'Columna', 'Valor Anterior', 'Valor Nuevo'],
      ...infAuditLog.map(c => [new Date(c.fecha).toLocaleString('es-CL'), c.usuario, c.fila, c.columna, c.valorAnterior, c.valorNuevo])
    ];
    const wsAudit = XLSX.utils.aoa_to_sheet(auditData);
    XLSX.utils.book_append_sheet(wb, wsAudit, 'Auditoría');
  }

  const incidenciasData = [
    ['ANÁLISIS DE INCIDENCIAS'], [],
    ['Incidencia', 'Cantidad', '% del Total'],
    ...Object.entries(kpis.incidencias).sort((a,b) => b[1] - a[1]).map(([i, c]) => [i, c, ((c/kpis.totalPedidos)*100).toFixed(1) + '%'])
  ];
  const wsIncid = XLSX.utils.aoa_to_sheet(incidenciasData);
  XLSX.utils.book_append_sheet(wb, wsIncid, 'Incidencias');

  const filename = `Informe_${infPeriodoActual}_${infTipoActual}_${infMovilActual === 'todos' ? 'FlotaCompleta' : infMovilActual}_${new Date().toISOString().split('T')[0]}.xlsx`;
  XLSX.writeFile(wb, filename);
  toast(`✅ Excel exportado: ${filename}`, 'ok');
}

async function renderInformes() {
  const cont = document.getElementById('infResultado');
  if (!cont) return;
  cont.innerHTML = `<div class="inf-loading"><div class="spinner"></div><p>Cargando datos para el informe...</p></div>`;
  await poblarUnidadesInforme();
  const infFecha = document.getElementById('infFecha');
  if (infFecha && !infFecha.value) infFecha.value = new Date().toISOString().split('T')[0];
  cont.innerHTML = `<div style="padding:40px;text-align:center;color:var(--text-muted);font-style:italic;">
    <h3 style="margin-bottom:15px;color:var(--accent-blue)"> Dashboard de Informes Logísticos</h3>
    <p>Seleccione los filtros y presione <strong>GENERAR INFORME</strong> para visualizar el análisis completo.</p>
    <p style="margin-top:10px;font-size:.85em">Datos en tiempo real desde Firebase • Análisis BI profesional • Mapa de calor geográfico</p>
  </div>`;
}

async function poblarUnidadesInforme() {
  const unidades = new Set();
  Object.keys(cache).forEach(a => {
    Object.keys(cache[a]||{}).forEach(m => {
      Object.keys(cache[a][m]).forEach(k => {
        const r = cache[a][m][k];
        if (r.unidad) unidades.add(r.unidad);
      });
    });
  });
  const select = document.getElementById('infUnidad');
  if (select) {
    const valorActual = select.value || 'todas';
    select.innerHTML = '<option value="todas">Todas las unidades</option>';
    [...unidades].sort().forEach(u => {
      const opt = document.createElement('option');
      opt.value = u;
      opt.textContent = u;
      if (u === valorActual) opt.selected = true;
      select.appendChild(opt);
    });
  }
}

window.onInfPeriodoChange = onInfPeriodoChange;
window.onInfSemanaChange = onInfSemanaChange;
window.onInfMesChange = onInfMesChange;
window.generarInforme = generarInforme;
window.expandirChart = expandirChart;
window.cerrarChartFullscreen = cerrarChartFullscreen;
window.exportarInformePDF = exportarInformePDF;
window.exportarInformeExcel = exportarInformeExcel;
window.copiarPlanilla = copiarPlanilla;
window.limpiarSeleccionPlanilla = limpiarSeleccionPlanilla;
window.agregarFilaPlanilla = agregarFilaPlanilla;
window.verAuditoria = verAuditoria;
window.filtrarPlanilla = filtrarPlanilla;
window.ordenarPlanilla = ordenarPlanilla;
window.ordenarPlanillaPorColumna = ordenarPlanillaPorColumna;
window.exportarPlanillaCSV = exportarPlanillaCSV;
window.cambiarVistaMapa = cambiarVistaMapa;
window.mostrarTooltipMapa = mostrarTooltipMapa;
window.ocultarTooltipMapa = ocultarTooltipMapa;
window.filtrarPorComuna = filtrarPorComuna;

(function init(){
  if (seccionInicial === 'basedatos') document.title = 'DR-BASE DE DATOS';
  else if (seccionInicial === 'informes') document.title = 'DR-INFORMES';
  else if (seccionInicial === 'bitacoras') document.title = 'DR-BITACORAS';

  const st = document.createElement('style');
  st.textContent = `tr.fila-amarillo td{background:#ffd54f !important;color:#000 !important;} tr.fila-amarillo:hover td{background:#ffca28 !important;} tr.fila-fecha-modificada td{background:#fff3cd !important;color:#000 !important;} tr.fila-fecha-modificada:hover td{background:#ffe69c !important;}`;
  document.head.appendChild(st);

  const bp = document.getElementById('btnPegarSel'); if (bp) bp.remove();
  const be = document.querySelector('.btn-exportar');
  if (be) { be.style.background = '#a5d6a7'; be.style.color = '#1b5e20'; }
  const dl = document.getElementById('dlTransporteDesc'); if (dl) dl.innerHTML = OPCIONES_TRANSPORTE.map(o => `<option value="${o}"></option>`).join('');
  ['filtroDiaAmpm','filtroDiaB2c','vfDia','expDia'].forEach(id => {
    const s = document.getElementById(id);
    if (!s) return;
    for (let i=1;i<=31;i++){
      const o = document.createElement('option');
      o.value = String(i).padStart(2,'0');
      o.textContent=i;
      s.appendChild(o);
    }
  });

  document.getElementById('fFecha').valueAsDate = new Date();

  const infFecha = document.getElementById('infFecha');
  if (infFecha) infFecha.value = new Date().toISOString().split('T')[0];

  document.getElementById('fObs').addEventListener('input', e => {
    const p = e.target.selectionStart;
    e.target.value = e.target.value.toUpperCase();
    e.target.setSelectionRange(p,p);
  });

  document.getElementById('buscar').addEventListener('input', () => { paginaDesc = 1; render(); });
  document.getElementById('bmMes').addEventListener('change', actualizarInfoBorrarMes);
  document.getElementById('bmAnio').addEventListener('change', actualizarInfoBorrarMes);

  const pw = document.getElementById('pwInput');
  if (pw) pw.addEventListener('keydown', e => { if (e.key === 'Enter') confirmarPassword(); });

  document.addEventListener('click', e => {
    if (!e.target.closest('.filtro-combo') && !e.target.closest('.obs-combo-wrap') && !e.target.closest('.fecha-wrap') && !e.target.closest('.fecha-cell-wrap') && !e.target.closest('.cal-popup-fila')) {
      cerrarTodosCombos(); cerrarCombosModal(); cerrarCombosBD();
    }
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      if (document.getElementById('passwordOverlay').classList.contains('show')) cerrarPassword();
      else if (document.getElementById('exportarModal').classList.contains('show')) cerrarModalExportar();
      else if (document.getElementById('borrarMesOverlay').classList.contains('show')) cerrarBorrarMes();
      else if (document.getElementById('verFechaOverlay').classList.contains('show')) cerrarModalVerFecha();
      else if (document.getElementById('chartFullscreen').classList.contains('show')) cerrarChartFullscreen();
      else if (calendarioAbierto) { calendarioAbierto = false; const p = document.getElementById('calendarioPopup'); if (p) p.classList.remove('show'); }
      else if (calFilaAbierto) { const p = document.getElementById('cal_popup_' + calFilaAbierto); if (p) p.classList.remove('show'); calFilaAbierto = null; }
      else cerrarModal();
    }
  });

  const t = localStorage.getItem('temaDespachoRetail');
  if (t) cambiarTema(t);

  actualizarContadorEnviar();
})();

setInterval(() => {
  const hoy = new Date().toISOString().split('T')[0];
  const f = document.getElementById('fFecha');
  if (f && f.value !== hoy) { f.value = hoy; paginaDesc = 1; render(); }
}, 60000);
