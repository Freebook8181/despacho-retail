import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js";
import { getDatabase, ref, get, push, remove, update, set, onValue } from "https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js";
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
const RUTA_ACTIVIDAD = 'actividad';
const RUTA_USUARIOS_ONLINE = 'usuarios_online';
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
const BITACORAS_UNIFICADAS = [
    { key: 'movil1', label: 'MOVIL 1', domId: 'bitacoraMovil1' },
    { key: 'movil2', label: 'MOVIL 2', domId: 'bitacoraMovil2' },
    { key: 'movil3', label: 'MOVIL 3', domId: 'bitacoraMovil3' },
    { key: 'movil4', label: 'MOVIL 4', domId: 'bitacoraMovil4' },
    { key: 'movil5', label: 'MOVIL 5', domId: 'bitacoraMovil5' },
    { key: 'movil6', label: 'MOVIL 6', domId: 'bitacoraMovil6' },
    { key: 'spot', label: 'SPOT', domId: 'bitacoraSpot' },
    { key: 'spot1', label: 'SPOT 1', domId: 'bitacoraSpot1' },
    { key: 'spot2', label: 'SPOT 2', domId: 'bitacoraSpot2' }
];
const BITACORAS_B2C = [
    { key: 'b2c_movil1', label: 'MOVIL 1', domId: 'bitacoraB2cMovil1' },
    { key: 'b2c_movil2', label: 'MOVIL 2', domId: 'bitacoraB2cMovil2' },
    { key: 'b2c_movil3', label: 'MOVIL 3', domId: 'bitacoraB2cMovil3' },
    { key: 'b2c_movil4', label: 'MOVIL 4', domId: 'bitacoraB2cMovil4' },
    { key: 'b2c_movil5', label: 'MOVIL 5', domId: 'bitacoraB2cMovil5' },
    { key: 'b2c_movil6', label: 'MOVIL 6', domId: 'bitacoraB2cMovil6' },
    { key: 'b2c_spot', label: 'SPOT', domId: 'bitacoraB2cSpot' },
    { key: 'b2c_spot1', label: 'SPOT 1', domId: 'bitacoraB2cSpot1' },
    { key: 'b2c_spot2', label: 'SPOT 2', domId: 'bitacoraB2cSpot2' }
];
const REGLA_PM = {
    'MOVIL 1': ['maipu','cerrillos','lo espejo','la cisterna','pedro aguirre cerda','el bosque','san bernardo','la florida','puente alto','san ramon'],
    'MOVIL 2': ['huechuraba','recoleta','quilicura','conchali','quinta normal','pudahuel','cerro navia','independencia','renca','lo prado','colina','lampa'],
    'MOVIL 3': ['providencia','nunoa','la reina','penalolen'],
    'MOVIL 4': ['las condes','vitacura','lo barnechea'],
    'MOVIL 5': ['santiago','estacion central','san joaquin','macul','san miguel']
};
const REGLA_AM = {
    1: { 'MOVIL 1': ['la reina','casa'], 'MOVIL 2': ['norte','pudahuel','quinta normal','independencia','quilicura','renca','huechuraba','cerro navia','conchali','recoleta','lo prado'], 'MOVIL 3': ['nunoa','egana','ñuñoa','providencia'], 'MOVIL 4': ['alc','alto las condes','pa','parque arauco','las condes','vitacura','lo barnechea'], 'MOVIL 5': ['maipu','alameda','santiago','san miguel'], 'MOVIL 6': ['costanera','mut','las condes'] },
    2: { 'MOVIL 1': ['apmq','dom','dominicos','los dominicos','las condes','la reina','penalolen'], 'MOVIL 2': ['dom','dehesa','la dehesa','trapenses','vitacura','lo barnechea'], 'MOVIL 3': ['alc','alto las condes','pa','parque arauco','santiago','providencia'], 'MOVIL 4': ['costanera','tobalaba','san bernardo','el bosque','puente alto'], 'MOVIL 5': ['la florida','vespucio','la cisterna','lo espejo','san ramon','pedro aguirre cerda'] },
    3: { 'MOVIL 1': ['pa','parque arauco','casa','las condes'], 'MOVIL 2': ['norte','pudahuel','quinta normal','independencia','quilicura','renca','huechuraba','cerro navia','conchali','recoleta','lo prado'], 'MOVIL 3': ['mut','las condes','mut back','nunoa','providencia','santiago'], 'MOVIL 4': ['alc','alto las condes','dom','dehesa','la dehesa','vitacura','lo barnechea'], 'MOVIL 5': ['maipu','oeste','la cisterna','lo espejo','san ramon','pedro aguirre cerda','cerrillos'], 'MOVIL 6': ['costanera','egana'] },
    4: { 'MOVIL 1': ['nunoa','mut','las condes','providencia'], 'MOVIL 2': ['huerfanos','santiago','nunoa'], 'MOVIL 3': ['costanera','cc back','providencia','la reina','penalolen'], 'MOVIL 4': ['alc','alto las condes','pa','parque arauco','las condes','vitacura','lo barnechea'], 'MOVIL 5': ['tobalaba','san bernardo','el bosque','la florida','puente alto','la cisterna','lo espejo','san ramon','pedro aguirre cerda'], 'MOVIL 6': ['vespucio','oeste'] },
    5: { 'MOVIL 1': ['casa','pa','parque arauco','las condes'], 'MOVIL 2': ['maipu','norte','pudahuel','quinta normal','independencia','quilicura','renca','huechuraba','cerro navia','conchali','recoleta','lo prado'], 'MOVIL 3': ['costanera','mut','las condes','providencia','nunoa','santiago','san miguel'], 'MOVIL 4': ['dom','dehesa','la dehesa','pie andino','las condes','vitacura','lo barnechea'], 'MOVIL 5': ['egana','tobalaba','san bernardo','el bosque','la florida','puente alto','la cisterna','lo espejo','san ramon','pedro aguirre cerda'], 'MOVIL 6': ['dom','dehesa','la dehesa','alc','alto las condes'] }
};

function autocompletarTransportePM(reg) {
    if (!reg || !reg.comuna) return reg;
    if (reg.transporteManual) return reg;
    const comunaNorm = normSinTildes(reg.comuna);
    for (const movil in REGLA_PM) {
        const comunas = REGLA_PM[movil];
        for (let i = 0; i < comunas.length; i++) {
            if (comunaNorm.includes(comunas[i]) || comunas[i].includes(comunaNorm)) { reg.transporte = movil; return reg; }
        }
    }
    return reg;
}

function autocompletarTransporteAM(reg, diaSemana) {
    if (!reg || !reg.comuna) return reg;
    if (reg.transporteManual) return reg;
    const reglas = REGLA_AM[diaSemana];
    if (!reglas) return reg;
    const comunaNorm = normSinTildes(reg.comuna);
    for (const movil in reglas) {
        const comunas = reglas[movil];
        for (let i = 0; i < comunas.length; i++) {
            if (comunaNorm.includes(comunas[i]) || comunas[i].includes(comunaNorm)) { reg.transporte = movil; return reg; }
        }
    }
    return reg;
}

function esAntesDe1400() { const ahora = new Date(); return (ahora.getHours() * 60 + ahora.getMinutes()) < (14 * 60); }
function esDespuesDe1401() { const ahora = new Date(); return (ahora.getHours() * 60 + ahora.getMinutes()) >= (14 * 60 + 1); }
function obtenerDiaSemanaManana() { const hoy = new Date(); const manana = new Date(hoy); manana.setDate(hoy.getDate() + 1); return manana.getDay(); }

function obtenerClaveBitacora(transporte, tipoRegistro) {
    const t = (transporte || '').toUpperCase().trim();
    const esB2C = (tipoRegistro === 'B2C');
    const prefijo = esB2C ? 'b2c_' : '';
    if (t === 'MOVIL 1') return prefijo + 'movil1';
    if (t === 'MOVIL 2') return prefijo + 'movil2';
    if (t === 'MOVIL 3') return prefijo + 'movil3';
    if (t === 'MOVIL 4') return prefijo + 'movil4';
    if (t === 'MOVIL 5') return prefijo + 'movil5';
    if (t === 'MOVIL 6') return prefijo + 'movil6';
    if (t === 'SPOT') return prefijo + 'spot';
    if (t === 'SPOT 1') return prefijo + 'spot1';
    if (t === 'SPOT 2') return prefijo + 'spot2';
    if (t === 'SERVICIO AM/PM' || t === 'SERVICIO ADM' || t === 'SERVICIO QDM') return 'spot';
    if (t === 'SERVICIO B2C') return 'b2c_spot';
    return null;
}

function obtenerBitacorasPorTipo(tipoBitacora) { return tipoBitacora === 'b2c' ? BITACORAS_B2C : BITACORAS_UNIFICADAS; }
function esAdmin(email) { return ADMIN_EMAILS.includes((email || '').toLowerCase().trim()); }

let rolActual = 'operador';
let emailUsuarioActual = '';
let userIdActual = '';
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
let bitTabActiva = 'unificadas';
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
let filtroDescBD = { AMPM: { unidad:'', comuna:'', transporte:'', rango:'' }, B2C: { unidad:'', comuna:'', transporte:'', rango:'' }, ADM: { unidad:'', comuna:'', transporte:'', rango:'' }, QDM: { unidad:'', comuna:'', transporte:'', rango:'' } };
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
let actividadData = [];
let usuariosOnline = {};
let heartbeatInterval = null;

function registrarActividad(accion, detalle, modulo) {
    if (!emailUsuarioActual) return;
    const ahora = new Date();
    const registro = { usuario: emailUsuarioActual, esAdmin: rolActual === 'admin', accion: accion, detalle: detalle, modulo: modulo || tipoDeSeccion(), fecha: ahora.toISOString(), timestamp: ahora.getTime() };
    push(ref(db, RUTA_ACTIVIDAD), registro).catch(function(e) { console.error('Error registrando actividad:', e); });
}

function iniciarHeartbeat() {
    if (!emailUsuarioActual) return;
    const userId = emailUsuarioActual.replace(/[@.]/g, '_');
    userIdActual = userId;
    function actualizarOnline() { set(ref(db, RUTA_USUARIOS_ONLINE + '/' + userId), { email: emailUsuarioActual, esAdmin: rolActual === 'admin', ultimoVisto: Date.now(), seccion: seccionActiva }); }
    actualizarOnline();
    heartbeatInterval = setInterval(actualizarOnline, 30000);
    window.addEventListener('beforeunload', function() { remove(ref(db, RUTA_USUARIOS_ONLINE + '/' + userId)); });
}

function detenerHeartbeat() {
    if (heartbeatInterval) { clearInterval(heartbeatInterval); heartbeatInterval = null; }
    if (userIdActual) { remove(ref(db, RUTA_USUARIOS_ONLINE + '/' + userIdActual)); }
}

function escucharUsuariosOnline() {
    onValue(ref(db, RUTA_USUARIOS_ONLINE), function(snapshot) {
        const data = snapshot.val() || {};
        const ahora = Date.now();
        const hace5Min = ahora - (5 * 60 * 1000);
        usuariosOnline = {};
        let count = 0;
        Object.keys(data).forEach(function(key) {
            const u = data[key];
            if (u.ultimoVisto && u.ultimoVisto > hace5Min) { usuariosOnline[key] = u; count++; }
        });
        actualizarDisplayUsuariosOnline(count);
    });
}

function actualizarDisplayUsuariosOnline(count) {
    const el = document.getElementById('actUsuariosOnline');
    const lista = document.getElementById('actUsuariosActivos');
    if (el) el.textContent = count;
    if (lista) {
        const keys = Object.keys(usuariosOnline);
        if (keys.length === 0) { lista.innerHTML = '<span style="color:var(--text-muted);font-size:.85em">Sin usuarios activos</span>'; }
        else { lista.innerHTML = keys.map(function(k) { const u = usuariosOnline[k]; const adminBadge = u.esAdmin ? ' (ADMIN)' : ''; const seccion = u.seccion ? ' - ' + u.seccion.toUpperCase() : ''; return '<span class="usuario-activo"><span class="pulse"></span>' + u.email + adminBadge + seccion + '</span>'; }).join(''); }
    }
}

function escucharActividad() {
    onValue(ref(db, RUTA_ACTIVIDAD), function(snapshot) {
        const data = snapshot.val() || {};
        actividadData = Object.keys(data).map(function(k) { return Object.assign({ id: k }, data[k]); }).sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); });
        renderizarActividad();
    });
}

function renderizarActividad() {
    const lista = document.getElementById('actividadList');
    const totalEl = document.getElementById('actTotalAcciones');
    const hoyEl = document.getElementById('actHoy');
    const registrosEl = document.getElementById('actTotalRegistros');
    if (totalEl) totalEl.textContent = formatoEntero(actividadData.length);
    const hoy = new Date().toDateString();
    const hoyCount = actividadData.filter(function(a) { return new Date(a.fecha).toDateString() === hoy; }).length;
    if (hoyEl) hoyEl.textContent = formatoEntero(hoyCount);
    let totalRegs = 0;
    Object.keys(cache).forEach(function(a) { Object.keys(cache[a]||{}).forEach(function(m) { totalRegs += Object.keys(cache[a][m]||{}).length; }); });
    if (registrosEl) registrosEl.textContent = formatoEntero(totalRegs);
    if (!lista) return;
    if (actividadData.length === 0) { lista.innerHTML = '<div class="actividad-empty">No hay actividad registrada</div>'; return; }
    const iconos = { 'SUBIDA_ARCHIVO': '', 'GUARDADO': '💾', 'ELIMINACION': '🗑️', 'ENVIO_BITACORA': '📋', 'CAMBIO_FECHA': '📅', 'REGISTRO_NUEVO': '➕', 'LOGIN': '🔑', 'BORRADO_MASIVO': '⚠️', 'EXPORTACION': '📊', 'EDICION': '✏️' };
    lista.innerHTML = actividadData.slice(0, 100).map(function(a) {
        const icono = iconos[a.accion] || '📝';
        const fecha = new Date(a.fecha);
        const fechaStr = fecha.toLocaleDateString('es-CL') + ' ' + fecha.toLocaleTimeString('es-CL', {hour:'2-digit',minute:'2-digit'});
        const adminTag = a.esAdmin ? '<span class="badge badge-admin">ADMIN</span>' : '';
        return '<div class="actividad-item"><div class="actividad-icon">' + icono + '</div><div class="actividad-content"><div class="actividad-user">' + a.usuario + ' ' + adminTag + ' <span style="color:var(--accent-blue);font-size:.8em">[' + (a.modulo||'-') + ']</span></div><div class="actividad-action">' + a.detalle + '</div><div class="actividad-time">' + fechaStr + '</div></div></div>';
    }).join('');
}

window.limpiarActividadAntigua = function() {
    if (rolActual !== 'admin') { toast('Solo el administrador', 'err'); return; }
    pedirClave(function() {
        const hace30Dias = Date.now() - (30 * 24 * 60 * 60 * 1000);
        const antiguas = actividadData.filter(function(a) { return a.timestamp < hace30Dias; });
        if (antiguas.length === 0) { toast('No hay actividad antigua', 'info'); return; }
        if (!confirm('¿Eliminar ' + antiguas.length + ' registros de actividad antiguos?')) return;
        let eliminados = 0;
        const promesas = antiguas.map(function(a) { return remove(ref(db, RUTA_ACTIVIDAD + '/' + a.id)).then(function() { eliminados++; }); });
        Promise.all(promesas).then(function() { toast(eliminados + ' registros de actividad eliminados', 'ok'); });
    });
};

function toast(msg, tipo) { const t = document.getElementById('toast'); t.textContent = msg; t.className = 'toast show ' + tipo; setTimeout(function() { t.className = 'toast'; }, 3000); }
function fmtFecha(f) { if (!f) return ''; const p = f.split('-'); return p[2] + '/' + p[1] + '/' + p[0]; }
function nombreDiaSemana(f) { if (!f) return ''; const p = f.split('-'); if (p.length !== 3) return ''; return DIAS_SEMANA[new Date(+p[0], +p[1]-1, +p[2]).getDay()] || ''; }
function fmtFechaConDia(f) { if (!f) return ''; const p = f.split('-'); const dS = nombreDiaSemana(f); return dS ? dS + ', ' + p[2] + '-' + p[1] + '-' + p[0] : p[2] + '-' + p[1] + '-' + p[0]; }
function formatoMoneda(v) { return '$' + (Number(v)||0).toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function formatoMonedaAlineado(v) { const num = Number(v) || 0; const formateado = num.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); return '<span class="valor-alineado">$' + formateado + '</span>'; }
function formatoEntero(v) { return Math.round(Number(v)||0).toLocaleString('es-CL'); }
function formatoPorcentaje(v) { return (Number(v)||0).toLocaleString('es-CL', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' %'; }

function getTipoRegistro(reg) {
    if (!reg) return 'AMPM';
    if (reg.tipo) {
        if (reg.tipo === 'B2C') return 'B2C';
        if (reg.tipo === 'ADM') return 'ADM';
        if (reg.tipo === 'QDM') return 'QDM';
        if (reg.tipo === 'AMPM') return 'AMPM';
    }
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

function detectarMesAnioDesdeNombre(nombre) {
    const up = sinTildes(nombre).toUpperCase();
    let mes = null, anio = null;
    for (let i = 0; i < MESES_NOM.length; i++) if (up.includes(MESES_NOM[i])) { mes = String(i+1).padStart(2,'0'); break; }
    if (!mes) { const c = ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC']; for (let i = 0; i < c.length; i++) if (up.includes(c[i])) { mes = String(i+1).padStart(2,'0'); break; } }
    const m = nombre.match(/(20\d{2})/);
    if (m) anio = m[1];
    return { mes: mes, anio: anio };
}

function parsearValor(v) { if (v === null || v === undefined || v === '') return 0; if (typeof v === 'number') return v; let s = String(v).trim().replace(/\s/g,'').replace(/[$€]/g,''); if (!s) return 0; if (s.includes(',') && s.includes('.')) { if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g,'').replace(',', '.'); else s = s.replace(/,/g,''); } else if (s.includes(',')) s = s.replace(',', '.'); else if (s.includes('.')) { const p = s.split('.'); if (p.length > 2) s = s.replace(/\./g,''); else if (p[1].length === 3) s = s.replace(/\./g,''); } s = s.replace(/[^\d.\-]/g,''); const n = parseFloat(s); return isNaN(n) ? 0 : n; }

function parsearFecha(raw) {
    if (raw instanceof Date) { if (isNaN(raw.getTime())) return null; return raw.getFullYear() + '-' + String(raw.getMonth()+1).padStart(2,'0') + '-' + String(raw.getDate()).padStart(2,'0'); }
    if (typeof raw === 'number') { const d = new Date(Math.round((raw - 25569) * 86400 * 1000)); if (isNaN(d.getTime())) return null; return d.getUTCFullYear() + '-' + String(d.getUTCMonth()+1).padStart(2,'0') + '-' + String(d.getUTCDate()).padStart(2,'0'); }
    if (typeof raw === 'string') { let s = raw.trim().replace(/[T\s]+\d{1,2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/i, '').trim(); let m = s.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/); if (m) return m[1] + '-' + m[2].padStart(2,'0') + '-' + m[3].padStart(2,'0'); m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/); if (m) return m[3] + '-' + m[2].padStart(2,'0') + '-' + m[1].padStart(2,'0'); m = s.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{2})$/); if (m) { const a = parseInt(m[3]) > 50 ? '19' + m[3] : '20' + m[3]; return a + '-' + m[2].padStart(2,'0') + '-' + m[1].padStart(2,'0'); } const d = new Date(s); if (!isNaN(d.getTime())) return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0'); }
    return null;
}

function pedirClave(onOk) { pwCallback = onOk; const inp = document.getElementById('pwInput'); if (inp) inp.value = ''; document.getElementById('passwordOverlay').classList.add('show'); setTimeout(function() { if (inp) inp.focus(); }, 60); }
window.cerrarPassword = function() { pwCallback = null; document.getElementById('passwordOverlay').classList.remove('show'); };
window.confirmarPassword = function() { const inp = document.getElementById('pwInput'); const v = inp ? inp.value : ''; if (v !== CLAVE_ACCIONES) { toast('Contraseña incorrecta','err'); if (inp){ inp.value=''; inp.focus(); } return; } const cb = pwCallback; cerrarPassword(); if (cb) cb(); };

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
    if (!email || !pass) { toast('Ingresa email y contraseña', 'err'); return; }
    toast('Conectando...', 'info');
    setPersistence(auth, browserLocalPersistence).then(function() { return signInWithEmailAndPassword(auth, email, pass); }).then(function(userCredential) { toast('Bienvenido ' + email, 'ok'); }).catch(function(error) { console.error('Error de login:', error); if (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential') { toast('Usuario no encontrado. Creando...', 'info'); createUserWithEmailAndPassword(auth, email, pass).then(function(newUser) { toast('Usuario creado: ' + email, 'ok'); }).catch(function(createError) { toast('No se pudo crear: ' + createError.message, 'err'); }); return; } if (error.code === 'auth/wrong-password') { toast('Contraseña incorrecta para ' + email, 'err'); return; } if (error.code === 'auth/user-disabled') { toast('Usuario deshabilitado en Firebase', 'err'); return; } if (error.code === 'auth/too-many-requests') { toast('Demasiados intentos. Espera un momento.', 'err'); return; } toast('Error: ' + error.message, 'err'); });
};

window.logout = function() { detenerHeartbeat(); signOut(auth); };

onAuthStateChanged(auth, function(user) {
    if (user) {
        rolActual = esAdmin(user.email) ? 'admin' : 'operador';
        emailUsuarioActual = user.email || '';
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('appSection').style.display = 'flex';
        document.getElementById('userEmail').textContent = user.email + (rolActual === 'admin' ? '  (ADMIN)' : '');
        aplicarRol();
        iniciarHeartbeat();
        if (rolActual === 'admin') { escucharUsuariosOnline(); escucharActividad(); }
        cargarDatos().then(function() { if (seccionInicial === 'basedatos' || seccionInicial === 'informes' || seccionInicial === 'bitacoras' || seccionInicial === 'actividad') { cambiarSeccion(seccionInicial); seccionInicial = ''; } });
        registrarActividad('LOGIN', 'Usuario inició sesión', 'SISTEMA');
    } else {
        rolActual = 'operador';
        emailUsuarioActual = '';
        userIdActual = '';
        detenerHeartbeat();
        document.getElementById('loginSection').style.display = 'flex';
        document.getElementById('appSection').style.display = 'none';
    }
});

function aplicarRol() {
    const t = document.querySelector('.seccion-tab[data-seccion="basedatos"]');
    const t2 = document.querySelector('.seccion-tab[data-seccion="informes"]');
    const t3 = document.getElementById('tabActividad');
    const btnEA = document.getElementById('btnEliminarAdmin');
    const btnBBAU = document.getElementById('btnBorrarBitacoraAdminU');
    const btnBBAB = document.getElementById('btnBorrarBitacoraAdminB');
    if (!t) return;
    if (rolActual === 'admin') {
        t.style.display = '';
        if (t2) t2.style.display = '';
        if (t3) t3.style.display = '';
        if (btnEA) btnEA.style.display = 'inline-block';
        if (btnBBAU) btnBBAU.style.display = 'inline-block';
        if (btnBBAB) btnBBAB.style.display = 'inline-block';
    } else {
        t.style.display = 'none';
        if (t2) t2.style.display = 'none';
        if (t3) t3.style.display = 'none';
        if (btnEA) btnEA.style.display = 'none';
        if (btnBBAU) btnBBAU.style.display = 'none';
        if (btnBBAB) btnBBAB.style.display = 'none';
        if (seccionActiva === 'basedatos' || seccionActiva === 'informes' || seccionActiva === 'actividad') cambiarSeccion('ampm');
    }
}

function tipoDeSeccion() { if (seccionActiva === 'ampm') return 'AMPM'; if (seccionActiva === 'b2c') return 'B2C'; if (seccionActiva === 'adm') return 'ADM'; if (seccionActiva === 'qdm') return 'QDM'; return 'AMPM'; }
function pendientesDeSeccion() { if (seccionActiva === 'ampm') return pendientesAMPM; if (seccionActiva === 'adm') return pendientesADM; if (seccionActiva === 'qdm') return pendientesQDM; if (seccionActiva === 'b2c') return pendientesB2C; return []; }

window.cambiarSeccion = function(sec) {
    if (sec === 'basedatos' && rolActual !== 'admin') { toast('Sin permiso para BASE DE DATOS', 'err'); return; }
    if (sec === 'informes' && rolActual !== 'admin') { toast('Sin permiso para INFORMES', 'err'); return; }
    if (sec === 'actividad' && rolActual !== 'admin') { toast('Sin permiso para ACTIVIDAD', 'err'); return; }
    seccionActiva = sec;
    editandoKey = null;
    seleccionadosDesc.clear();
    document.querySelectorAll('.seccion-tab').forEach(function(t) { t.classList.remove('active'); });
    const tabBtn = document.querySelector('.seccion-tab[data-seccion="' + sec + '"]');
    if (tabBtn) tabBtn.classList.add('active');
    document.querySelectorAll('.secciones-bar > .seccion-contenido').forEach(function(c) { c.classList.remove('show'); });
    const cont = document.getElementById('seccion' + sec.charAt(0).toUpperCase() + sec.slice(1));
    if (cont) cont.classList.add('show');
    document.body.classList.toggle('oculta-principal', (sec === 'basedatos' || sec === 'bitacoras' || sec === 'informes' || sec === 'actividad'));
    paginaDesc = 1;
    render();
    if (sec === 'basedatos') renderizarBaseDatos();
    if (sec === 'informes') renderInformes();
    if (sec === 'bitacoras') renderizarTodasBitacoras();
    if (sec === 'actividad') { if (rolActual === 'admin') { escucharActividad(); renderizarActividad(); } }
    actualizarBotonGuardar();
};

window.cambiarTabBitacora = function(tab) {
    bitTabActiva = tab;
    document.querySelectorAll('.bitacora-tab').forEach(function(t) { t.classList.remove('active'); });
    const tabBtn = document.querySelector('.bitacora-tab[data-btab="' + tab + '"]');
    if (tabBtn) tabBtn.classList.add('active');
    document.querySelectorAll('#seccionBitacoras .bitacora-tab-content').forEach(function(c) { c.classList.remove('show'); });
    const map = { unificadas: 'bitContentUnificadas', b2c: 'bitContentB2c' };
    const cont = document.getElementById(map[tab] || 'bitContentUnificadas');
    if (cont) cont.classList.add('show');
    renderizarTodasBitacoras();
};

window.toggleSeccion = function(s) { document.getElementById('contenido' + s.charAt(0).toUpperCase() + s.slice(1)).classList.toggle('show'); document.getElementById('flecha' + s.charAt(0).toUpperCase() + s.slice(1)).classList.toggle('rotada'); };
window.toggleSubmenu = function(s) { document.getElementById('submenu' + s.charAt(0).toUpperCase() + s.slice(1)).classList.toggle('show'); document.getElementById('flecha' + s.charAt(0).toUpperCase() + s.slice(1)).classList.toggle('rotada'); };

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

window.cambiarTema = function(t) { document.documentElement.setAttribute('data-theme', t); document.querySelectorAll('.theme-btn').forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-theme') === t); }); localStorage.setItem('temaDespachoRetail', t); };
window.toggleSeleccionDesc = function(key, checked) { checked ? seleccionadosDesc.add(key) : seleccionadosDesc.delete(key); sincronizarSelTodos(); actualizarContadorEnviar(); };
window.toggleSeleccionarTodo = function(checked) { checked ? keysVisiblesDesc.forEach(function(k) { seleccionadosDesc.add(k); }) : keysVisiblesDesc.forEach(function(k) { seleccionadosDesc.delete(k); }); render(); };
function sincronizarSelTodos() { const el = document.getElementById('selTodosDesc'); if (el) el.checked = keysVisiblesDesc.length > 0 && keysVisiblesDesc.every(function(k) { return seleccionadosDesc.has(k); }); }
function actualizarContadorEnviar() { const b = document.getElementById('btnEnviar'); if (b) b.textContent = seleccionadosDesc.size > 0 ? 'ENVIAR A BITACORA (' + seleccionadosDesc.size + ')' : 'ENVIAR A BITACORA'; }
function leerFiltrosDesc() { const g = function(id) { const el = document.getElementById(id); return el ? normSinTildes(el.value.trim()) : ''; }; return { unidad: g('fDescUnidad'), comuna: g('fDescComuna'), transporte: g('fDescTransporte'), rango: g('fDescRango') }; }

function getDescBaseRows() {
    const f = document.getElementById('fFecha');
    const fechaTrabajo = (f && f.value) ? f.value : new Date().toISOString().split('T')[0];
    const tipoSec = tipoDeSeccion();
    let regs = [];
    Object.keys(cache).forEach(function(a) { Object.keys(cache[a]||{}).forEach(function(m) { Object.keys(cache[a][m]).forEach(function(k) { const r = { key:k, anio:a, mes:m }; Object.keys(cache[a][m][k]).forEach(function(key) { r[key] = cache[a][m][k][key]; }); if (getTipoRegistro(r) !== tipoSec) return; regs.push(r); }); }); });
    const keysConCambios = Object.keys(cambiosFechaLocales);
    regs = regs.filter(function(r) { if (keysConCambios.includes(r.key)) return true; return r.fecha === fechaTrabajo; });
    pendientesDeSeccion().forEach(function(p) { const reg = Object.assign({}, p.reg, { key: p.key, anio: p.anio, mes: p.mes, pendiente: true }); regs.push(reg); });
    return regs;
}

function getDistinctValues(col) { const rows = getDescBaseRows(); const set = new Set(); rows.forEach(function(r) { let v = ''; if (col === 'unidad') v = r.unidad || ''; else if (col === 'comuna') v = canonComuna(r.comuna) || ''; else if (col === 'transporte') v = r.transporte || ''; else if (col === 'rango') v = r.rango || ''; if (v) set.add(v); }); return Array.from(set).sort(); }
function poblarCombo(col, filtro) { const list = document.getElementById('combo_' + col); if (!list) return; let vals = getDistinctValues(col); if (filtro) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(filtro)); }); list.innerHTML = vals.length ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionCombo(\'' + col + '\', \'' + v.replace(/'/g,"\\'") + '\')">' + v + '</div>'; }).join('') : '<div class="combo-item">Sin coincidencias</div>'; }

// ✅ CORREGIDO: Paréntesis de cierre agregado
function poblarCombos() {
    ['unidad','comuna','transporte','rango'].forEach(function(col) {
        const inp = document.getElementById('fDesc' + col.charAt(0).toUpperCase() + col.slice(1));
        poblarCombo(col, inp ? inp.value : '');
    });
}

function cerrarTodosCombos() {
    document.querySelectorAll('.combo-list').forEach(function(l) { if (!l.id.startsWith('comboModal_') && !l.id.startsWith('comboBD_') && !l.id.startsWith('combo_trans_') && !l.id.startsWith('combo_obs_')) l.style.display = 'none'; });
    comboAbierto = null;
    comboTransAbierto = null;
    comboObsAbierto = null;
    if (calendarioAbierto) { calendarioAbierto = false; const p = document.getElementById('calendarioPopup'); if (p) p.classList.remove('show'); }
    if (calFilaAbierto) { const p = document.getElementById('cal_popup_' + calFilaAbierto); if (p) p.classList.remove('show'); calFilaAbierto = null; }
}

window.toggleCombo = function(col) { const list = document.getElementById('combo_' + col); if (!list) return; if (comboAbierto === col) { list.style.display = 'none'; comboAbierto = null; } else { cerrarTodosCombos(); poblarCombo(col, ''); list.style.display = 'block'; comboAbierto = col; } };
function abrirCombo(col) { cerrarTodosCombos(); poblarCombo(col, ''); const list = document.getElementById('combo_' + col); if (list) { list.style.display = 'block'; comboAbierto = col; } }

// ✅ CORREGIDO: Paréntesis de cierre agregado
window.elegirOpcionCombo = function(col, val) {
    const input = document.getElementById('fDesc' + col.charAt(0).toUpperCase() + col.slice(1));
    if (input) input.value = val;
    cerrarTodosCombos();
    render();
};

window.filtrarComboDesc = function(col, val) { poblarCombo(col, val); const list = document.getElementById('combo_' + col); if (list) { list.style.display = 'block'; comboAbierto = col; } render(); };

window.abrirComboTransporte = function(key) {
    const list = document.getElementById('combo_trans_' + key);
    if (!list) return;
    const input = document.getElementById('trans_input_' + key);
    const val = input ? input.value : '';
    let vals = OPCIONES_TRANSPORTE;
    if (val) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(val)); });
    list.innerHTML = vals.length ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionTransporte(\'' + key + '\', \'' + v + '\')">' + v + '</div>'; }).join('') : '<div class="combo-item">Sin coincidencias</div>';
    list.style.display = 'block';
    comboTransAbierto = key;
};

window.toggleComboTransporte = function(key) { const list = document.getElementById('combo_trans_' + key); if (!list) return; if (comboTransAbierto === key) { list.style.display = 'none'; comboTransAbierto = null; } else { cerrarTodosCombos(); abrirComboTransporte(key); } };
window.filtrarComboTransporte = function(key, val) { const list = document.getElementById('combo_trans_' + key); if (!list) return; let vals = OPCIONES_TRANSPORTE; if (val) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(val)); }); list.innerHTML = vals.length ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionTransporte(\'' + key + '\', \'' + v + '\')">' + v + '</div>'; }).join('') : '<div class="combo-item">Sin coincidencias</div>'; list.style.display = 'block'; comboTransAbierto = key; };
window.elegirOpcionTransporte = function(key, val) { const input = document.getElementById('trans_input_' + key); if (input) input.value = val; const list = document.getElementById('combo_trans_' + key); if (list) list.style.display = 'none'; comboTransAbierto = null; actualizarTransporteRegistro(key, val); };

function actualizarTransporteRegistro(key, nuevoTransporte) {
    let p = pendientesAMPM.find(function(p) { return p.key===key; }) || pendientesADM.find(function(p) { return p.key===key; }) || pendientesQDM.find(function(p) { return p.key===key; }) || pendientesB2C.find(function(p) { return p.key===key; });
    if (p) {
        if (p.reg.transporte !== nuevoTransporte) {
            p.reg.transporte = nuevoTransporte;
            p.reg.transporteManual = true;
            delete p.reg._candidatos;
            if (cache[p.anio] && cache[p.anio][p.mes] && cache[p.anio][p.mes][key]) {
                update(ref(db, RUTA_BASE + '/' + p.anio + '/' + p.mes + '/' + key), { transporte: nuevoTransporte, transporteManual: true }).then(function() { toast('Transporte actualizado', 'ok'); }).catch(function(e) { toast('Error: ' + e.message, 'err'); });
            }
            render();
        }
        return;
    }
    outer: for (const a of Object.keys(cache)) { for (const m of Object.keys(cache[a]||{})) { if (cache[a][m] && cache[a][m][key]) { if (cache[a][m][key].transporte !== nuevoTransporte) { cache[a][m][key].transporte = nuevoTransporte; cache[a][m][key].transporteManual = true; delete cache[a][m][key]._candidatos; update(ref(db, RUTA_BASE + '/' + a + '/' + m + '/' + key), { transporte: nuevoTransporte, transporteManual: true }).then(function() { toast('Transporte actualizado', 'ok'); }).catch(function(e) { toast('Error: ' + e.message, 'err'); }); } break outer; } } }
    render();
}

window.abrirComboObs = function(key) { const list = document.getElementById('combo_obs_' + key); if (!list) return; const input = document.getElementById('obs_input_' + key); const val = input ? input.value : ''; let vals = OPCIONES_OBS; if (val) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(val)); }); list.innerHTML = vals.length ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionObs(\'' + key + '\', \'' + v + '\')">' + v + '</div>'; }).join('') : '<div class="combo-item">Sin coincidencias</div>'; list.style.display = 'block'; comboObsAbierto = key; };
window.toggleComboObs = function(key) { const list = document.getElementById('combo_obs_' + key); if (!list) return; if (comboObsAbierto === key) { list.style.display = 'none'; comboObsAbierto = null; } else { cerrarTodosCombos(); abrirComboObs(key); } };
window.filtrarComboObs = function(key, val) { const list = document.getElementById('combo_obs_' + key); if (!list) return; let vals = OPCIONES_OBS; if (val) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(val)); }); list.innerHTML = vals.length ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionObs(\'' + key + '\', \'' + v + '\')">' + v + '</div>'; }).join('') : '<div class="combo-item">Sin coincidencias</div>'; list.style.display = 'block'; comboObsAbierto = key; };
window.elegirOpcionObs = function(key, val) { const input = document.getElementById('obs_input_' + key); if (input) input.value = val; const list = document.getElementById('combo_obs_' + key); if (list) list.style.display = 'none'; comboObsAbierto = null; actualizarObservacionRegistro(key, val); };

function actualizarObservacionRegistro(key, nuevaObs) {
    let p = pendientesAMPM.find(function(p) { return p.key===key; }) || pendientesADM.find(function(p) { return p.key===key; }) || pendientesQDM.find(function(p) { return p.key===key; }) || pendientesB2C.find(function(p) { return p.key===key; });
    if (p) { p.reg.observacion = nuevaObs.toUpperCase(); if (cache[p.anio] && cache[p.anio][p.mes] && cache[p.anio][p.mes][key]) { update(ref(db, RUTA_BASE + '/' + p.anio + '/' + p.mes + '/' + key), { observacion: nuevaObs.toUpperCase() }); } render(); return; }
    outer: for (const a of Object.keys(cache)) { for (const m of Object.keys(cache[a]||{})) { if (cache[a][m] && cache[a][m][key]) { cache[a][m][key].observacion = nuevaObs.toUpperCase(); update(ref(db, RUTA_BASE + '/' + a + '/' + m + '/' + key), { observacion: nuevaObs.toUpperCase() }); break outer; } } }
    render();
}

window.abrirComboObsEdicion = function() { const list = document.getElementById('combo_edicion_obs'); if (!list) return; const input = document.getElementById('edi_obs'); const val = input ? input.value : ''; let vals = OPCIONES_OBS; if (val) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(val)); }); list.innerHTML = vals.length ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionObsEdicion(\'' + v + '\')">' + v + '</div>'; }).join('') : '<div class="combo-item">Sin coincidencias</div>'; list.style.display = 'block'; };
window.toggleComboObsEdicion = function() { const list = document.getElementById('combo_edicion_obs'); if (!list) return; if (list.style.display === 'block') { list.style.display = 'none'; } else { abrirComboObsEdicion(); } };
window.filtrarComboObsEdicion = function(val) { const list = document.getElementById('combo_edicion_obs'); if (!list) return; let vals = OPCIONES_OBS; if (val) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(val)); }); list.innerHTML = vals.length ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionObsEdicion(\'' + v + '\')">' + v + '</div>'; }).join('') : '<div class="combo-item">Sin coincidencias</div>'; list.style.display = 'block'; };
window.elegirOpcionObsEdicion = function(val) { const input = document.getElementById('edi_obs'); if (input) input.value = val; const list = document.getElementById('combo_edicion_obs'); if (list) list.style.display = 'none'; };

function getDistinctModal(col) { const set = new Set(); datosModal.forEach(function(r) { let v = ''; if (col==='fecha') v = fmtFecha(r.fecha); else if (col==='unidad') v = r.unidad||''; else if (col==='comuna') v = canonComuna(r.comuna)||''; else if (col==='transporte') v = r.transporte||''; else if (col==='observacion') v = r.observacion||''; else if (col==='rango') v = r.rango||''; if (v) set.add(v); }); return Array.from(set).sort(); }
function poblarComboModal(col, filtro) { const list = document.getElementById('comboModal_'+col); if (!list) return; let vals = getDistinctModal(col); if (filtro) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(filtro)); }); list.innerHTML = vals.length ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionModal(\'' + col + '\', \'' + v.replace(/'/g,"\\'") + '\')">' + v + '</div>'; }).join('') : '<div class="combo-item">Sin coincidencias</div>'; }
function poblarCombosModal() { ['fecha','unidad','comuna','transporte','observacion','rango'].forEach(function(col) { const inp = document.getElementById('fMod'+col.charAt(0).toUpperCase()+col.slice(1)); poblarComboModal(col, inp ? inp.value : ''); }); }
function cerrarCombosModal() { document.querySelectorAll('.combo-list').forEach(function(l) { if (l.id.startsWith('comboModal_')) l.style.display='none'; }); comboModalAbierto = null; }
window.toggleComboModal = function(col) { const list = document.getElementById('comboModal_'+col); if (!list) return; if (comboModalAbierto === col) { list.style.display='none'; comboModalAbierto=null; } else { cerrarCombosModal(); poblarComboModal(col,''); list.style.display='block'; comboModalAbierto=col; } };
function abrirComboModal(col) { cerrarCombosModal(); poblarComboModal(col,''); const list=document.getElementById('comboModal_'+col); if(list){ list.style.display='block'; comboModalAbierto=col; } }
window.elegirOpcionModal = function(col, val) { const input = document.getElementById('fMod'+col.charAt(0).toUpperCase()+col.slice(1); if (input) input.value = val; cerrarCombosModal(); aplicarFiltrosModal(); };
window.filtrarComboModal = function(col, val) { poblarComboModal(col, val); const list = document.getElementById('comboModal_'+col); if (list) { list.style.display='block'; comboModalAbierto=col; } aplicarFiltrosModal(); };

function sufBD(tipo){ if (tipo==='AMPM') return 'Ampm'; if (tipo==='B2C') return 'B2c'; if (tipo==='ADM') return 'Adm'; return 'Qdm'; }
function getBDBaseRows(tipo){ let r = obtenerRegsTipo(tipo); const f = filtroDiaBD[tipo]; if (f.d) r = r.filter(function(x) { return (x.fecha||'').split('-')[2] === f.d; }); if (f.m) r = r.filter(function(x) { return x.mes === f.m; }); if (f.a) r = r.filter(function(x) { return x.anio === f.a; }); return r; }
function getDistinctBD(tipo, campo){ const set = new Set(); getBDBaseRows(tipo).forEach(function(r) { let v=''; if(campo==='unidad')v=r.unidad||''; else if(campo==='comuna')v=canonComuna(r.comuna)||''; else if(campo==='transporte')v=r.transporte||''; else if(campo==='rango')v=r.rango||''; if(v)set.add(v); }); return Array.from(set).sort(); }
function poblarComboBD(tipo, campo, filtro){ const list = document.getElementById('comboBD_'+sufBD(tipo)+'_'+campo); if(!list) return; let vals = getDistinctBD(tipo, campo); if (filtro) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(filtro)); }); list.innerHTML = vals.length ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionBD(\'' + tipo + '\',\'' + campo + '\',\'' + v.replace(/'/g,"\\'") + '\')">' + v + '</div>'; }).join('') : '<div class="combo-item">Sin coincidencias</div>'; }
function cerrarCombosBD(){ document.querySelectorAll('.combo-list').forEach(function(l) { if (l.id.startsWith('comboBD_')) l.style.display='none'; }); comboBDAbierto = null; }
window.toggleComboBD = function(tipo, campo){ const list = document.getElementById('comboBD_'+sufBD(tipo)+'_'+campo); if(!list) return; const id = tipo+'_'+campo; if (comboBDAbierto === id) { list.style.display='none'; comboBDAbierto=null; } else { cerrarCombosBD(); poblarComboBD(tipo,campo,''); list.style.display='block'; comboBDAbierto=id; } };
function abrirComboBD(tipo, campo){ cerrarCombosBD(); poblarComboBD(tipo,campo,''); const list=document.getElementById('comboBD_'+sufBD(tipo)+'_'+campo); if(list){ list.style.display='block'; comboBDAbierto=tipo+'_'+campo; } }

// ✅ CORREGIDO: Paréntesis de cierre agregado
window.elegirOpcionBD = function(tipo, campo, val){
    const input = document.getElementById('fBD'+sufBD(tipo)+'_'+campo);
    if (input) input.value = val;
    filtroDescBD[tipo][campo] = normSinTildes(val);
    cerrarCombosBD();
    const idMap = { AMPM: 'filtroIdAmpm', B2C: 'filtroIdB2c', ADM: 'filtroIdAdm', QDM: 'filtroIdQdm' };
    const pagMap = { AMPM: paginaBDAmpm, B2C: paginaBDB2c, ADM: paginaBDAdm, QDM: paginaBDQdm };
    renderTabBD(tipo, document.getElementById(idMap[tipo]).value, pagMap[tipo]);
};

window.filtrarBDCombo = function(tipo, campo, val){ filtroDescBD[tipo][campo] = normSinTildes(val); poblarComboBD(tipo, campo, val); const list = document.getElementById('comboBD_'+sufBD(tipo)+'_'+campo; if (list) { list.style.display='block'; comboBDAbierto=tipo+'_'+campo; } const idMap = { AMPM: 'filtroIdAmpm', B2C: 'filtroIdB2c', ADM: 'filtroIdAdm', QDM: 'filtroIdQdm' }; const pagMap = { AMPM: paginaBDAmpm, B2C: paginaBDB2c, ADM: paginaBDAdm, QDM: paginaBDQdm }; renderTabBD(tipo, document.getElementById(idMap[tipo]).value, pagMap[tipo]); };

function renderDescThead() {
    const thead = document.getElementById('theadDesc');
    if (!thead) return;
    const b2c = (seccionActiva === 'b2c');
    const sel = '<th rowspan="2" style="text-align:center;vertical-align:middle"><input type="checkbox" id="selTodosDesc" style="width:16px;height:16px;" onchange="toggleSeleccionarTodo(this.checked)" title="Seleccionar todo"></th>';
    const acc = '<th rowspan="2" style="text-align:center;vertical-align:middle">Acciones</th>';
    const filtroUnidad = '<input type="text" class="th-filter" id="fDescUnidad" placeholder="Filtrar..." style="width:100px" oninput="filtrarComboDesc(\'unidad\', this.value)" onfocus="abrirCombo(\'unidad\')">';
    const filtroComuna = '<input type="text" class="th-filter" id="fDescComuna" placeholder="Filtrar..." style="width:100px" oninput="filtrarComboDesc(\'comuna\', this.value)" onfocus="abrirCombo(\'comuna\')">';
    const filtroTransporte = '<input type="text" class="th-filter" id="fDescTransporte" placeholder="Filtrar..." style="width:100px" oninput="filtrarComboDesc(\'transporte\', this.value)" onfocus="abrirCombo(\'transporte\')">';
    const filtroRango = '<input type="text" class="th-filter" id="fDescRango" placeholder="Filtrar..." style="width:80px" oninput="filtrarComboDesc(\'rango\', this.value)" onfocus="abrirCombo(\'rango\')">';
    if (b2c) {
        thead.innerHTML = '<tr>' + sel + '<th rowspan="2" style="text-align:center;vertical-align:middle">Fecha</th><th style="text-align:center;vertical-align:middle">Unidad Negocio</th><th rowspan="2" style="text-align:center;vertical-align:middle">ID Pedido</th><th rowspan="2" style="text-align:center;vertical-align:middle">Nombre Cliente</th><th rowspan="2" style="text-align:center;vertical-align:middle">Celular</th><th rowspan="2" style="text-align:center;vertical-align:middle">E-Mail</th><th rowspan="2" style="text-align:center;vertical-align:middle">Dirección</th><th style="text-align:center;vertical-align:middle">Comuna</th><th rowspan="2" style="text-align:center;vertical-align:middle">Valor Producto</th><th rowspan="2" style="text-align:center;vertical-align:middle">Observación</th><th style="text-align:center;vertical-align:middle">Transporte</th><th style="text-align:center;vertical-align:middle">Rango</th>' + acc + '</tr><tr><td style="text-align:center;padding:4px">' + filtroUnidad + '</td><td style="text-align:center;padding:4px">' + filtroComuna + '</td><td style="text-align:center;padding:4px">' + filtroTransporte + '</td><td style="text-align:center;padding:4px">' + filtroRango + '</td></tr>';
    } else {
        thead.innerHTML = '<tr>' + sel + '<th rowspan="2" style="text-align:center;vertical-align:middle">Fecha</th><th style="text-align:center;vertical-align:middle">Unidad Negocio</th><th rowspan="2" style="text-align:center;vertical-align:middle">ID Pedido</th><th rowspan="2" style="text-align:center;vertical-align:middle">Nombre Cliente</th><th rowspan="2" style="text-align:center;vertical-align:middle">Dirección</th><th style="text-align:center;vertical-align:middle">Comuna</th><th rowspan="2" style="text-align:center;vertical-align:middle">Valor</th><th rowspan="2" style="text-align:center;vertical-align:middle">Observación</th><th style="text-align:center;vertical-align:middle">Transporte</th><th style="text-align:center;vertical-align:middle">Rango</th>' + acc + '</tr><tr><td style="text-align:center;padding:4px">' + filtroUnidad + '</td><td style="text-align:center;padding:4px">' + filtroComuna + '</td><td style="text-align:center;padding:4px">' + filtroTransporte + '</td><td style="text-align:center;padding:4px">' + filtroRango + '</td></tr>';
    }
}

function render() {
    if (theadSeccion !== seccionActiva) { renderDescThead(); theadSeccion = seccionActiva; }
    poblarCombos();
    const busq = document.getElementById('buscar').value.toLowerCase();
    const f = document.getElementById('fFecha');
    const fechaTrabajo = (f && f.value) ? f.value : new Date().toISOString().split('T')[0];
    const tipoSec = tipoDeSeccion();
    let regs = [];
    Object.keys(cache).forEach(function(a) { Object.keys(cache[a]||{}).forEach(function(m) { Object.keys(cache[a][m]).forEach(function(k) { const r = { key:k, anio:a, mes:m }; Object.keys(cache[a][m][k]).forEach(function(key) { r[key] = cache[a][m][k][key]; }); if (getTipoRegistro(r) !== tipoSec) return; regs.push(r); }); }); });
    const keysConCambios = Object.keys(cambiosFechaLocales);
    if (!busq) { regs = regs.filter(function(r) { if (keysConCambios.includes(r.key)) return true; return r.fecha === fechaTrabajo; }); }
    else { regs = regs.filter(function(r) { return ['nombre','idPedido','transporte','comuna','unidad','celular','email'].some(function(c) { return (r[c]||'').toLowerCase().includes(busq); }); }); }
    pendientesDeSeccion().forEach(function(p) { const reg = Object.assign({}, p.reg, { key: p.key, anio: p.anio, mes: p.mes, pendiente: true }); regs.push(reg); });
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
    if (regs.length === 0) { tbody.innerHTML = ''; empty.style.display = 'block'; empty.textContent = busq ? 'No se encontraron resultados' : 'No hay registros para el dia ' + fmtFechaConDia(fechaTrabajo); keysVisiblesDesc = []; renderPaginacionDesc(0,0,0); sincronizarSelTodos(); actualizarContadorEnviar(); return; }
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

function sincronizarScrollHorizontal() { const top = document.getElementById('scrollTop'); const bottom = document.getElementById('scrollBottom'); if (!top || !bottom) return; top.onscroll = null; bottom.onscroll = null; top.onscroll = function() { bottom.scrollLeft = top.scrollLeft; }; bottom.onscroll = function() { top.scrollLeft = bottom.scrollLeft; }; }

function renderPaginacionDesc(tp, total, pag) {
    let cont = document.getElementById('paginacionDesc');
    if (!cont) { cont = document.createElement('div'); cont.id = 'paginacionDesc'; cont.className = 'bd-paginacion'; cont.style.margin = '10px 0 0 0'; const sv = document.querySelector('.tabla-scroll-vertical'); if (sv) sv.appendChild(cont); }
    if (tp <= 1) { cont.innerHTML = total>0 ? '<div class="bd-paginacion-info">Mostrando ' + formatoEntero(total) + ' de ' + formatoEntero(total) + ' registros</div>' : ''; return; }
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

window.irAPaginaDesc = function(p) { paginaDesc = p; render(); const sv = document.querySelector('.tabla-scroll-vertical'); if (sv) sv.scrollTop = 0; };

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
    if (r.esAdmin) clase += 'fila-admin ';
    const bp = r.pendiente ? '<span class="badge badge-pendiente">SIN GUARDAR</span>' : '';
    const badgeAdmin = r.esAdmin ? '<span class="badge badge-admin">ADMIN</span>' : '';
    const indicadorCambio = tieneCambioFecha ? '<span style="color:var(--accent-orange);font-size:.7em;font-weight:700;margin-left:4px">✏️</span>' : '';
    const fechaMostrar = tieneCambioFecha ? cambiosFechaLocales[r.key].nuevaFecha : r.fecha;
    const celdaFecha = '<td><div class="fecha-cell-wrap"><input type="date" value="' + (fechaMostrar||'') + '" onchange="cambiarFechaFila(\'' + r.key + '\', this.value, ' + (r.pendiente?true:false) + ')"></div> ' + bp + indicadorCambio + badgeAdmin + '</td>';
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
        const acc = '<td class="td-acciones" style="text-align:center;vertical-align:middle"><button class="btn-acc" onclick="guardarEdicionInline(\'' + r.key + '\',\'' + r.anio + '\',\'' + r.mes + '\',' + (r.pendiente?true:false) + ')">✔</button><button class="btn-acc" onclick="cancelarEdicionInline()">#</button></td>';
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
    const acc = '<td class="td-otro-palet"><input type="checkbox" ' + (r.otroPalet?'checked':'') + ' onchange="toggleOtroPalet(\'' + r.key + '\', ' + (r.pendiente?true:false) + ', this.checked)" title="Otro palet"></td><td class="td-acciones" style="text-align:center;vertical-align:middle"><button class="btn-acc btn-borrar" onclick="pedirBorrarRegistro(\'' + r.key + '\',\'' + r.anio + '\',\'' + r.mes + '\',' + (r.pendiente?true:false) + ')" title="Eliminar">️</button></td>';
    const valorCelda = '<td>' + formatoMonedaAlineado(r.valor) + '</td>';
    if (b2c) { return '<tr class="' + clase + '">' + celdaSel + celdaFecha + '<td><span class="badge badge-unidad">' + (r.unidad||'') + '</span></td><td><strong>' + (r.idPedido||'') + '</strong>' + ind + '</td><td>' + (r.nombre||'') + '</td><td>' + (r.celular||'') + '</td><td>' + (r.email||'') + '</td><td>' + dirShow + (dirRep?' <span style="color:var(--accent-orange);font-size:.7em;font-weight:700">[misma dir x' + dr[dirKey] + ']</span>':'') + '</td><td>' + canonComuna(r.comuna) + '</td>' + valorCelda + obs + trans + rango + acc + '</tr>'; }
    return '<tr class="' + clase + '">' + celdaSel + celdaFecha + '<td><span class="badge badge-unidad">' + (r.unidad||'') + '</span></td><td><strong>' + (r.idPedido||'') + '</strong>' + ind + '</td><td>' + (r.nombre||'') + '</td><td>' + dirShow + (dirRep?' <span style="color:var(--accent-orange);font-size:.7em;font-weight:700">[misma dir x' + dr[dirKey] + ']</span>':'') + '</td><td>' + canonComuna(r.comuna) + '</td>' + valorCelda + obs + trans + rango + acc + '</tr>';
}

window.filtrarComboEdicion = function(val) { const list = document.getElementById('combo_edicion_transporte'); if (!list) return; let vals = OPCIONES_TRANSPORTE; if (val) vals = vals.filter(function(v) { return normSinTildes(v).includes(normSinTildes(val)); }); list.innerHTML = vals.length ? vals.map(function(v) { return '<div class="combo-item" onmousedown="elegirOpcionEdicion(\'' + v + '\')">' + v + '</div>'; }).join('') : '<div class="combo-item">Sin coincidencias</div>'; list.style.display = 'block'; };
window.abrirComboEdicion = function() { filtrarComboEdicion(''); };
window.toggleComboEdicion = function() { const list = document.getElementById('combo_edicion_transporte'); if (!list) return; if (list.style.display === 'block') { list.style.display = 'none'; } else { filtrarComboEdicion(document.getElementById('edi_transporte') ? document.getElementById('edi_transporte').value : ''); } };
window.elegirOpcionEdicion = function(val) { const input = document.getElementById('edi_transporte'); if (input) input.value = val; const list = document.getElementById('combo_edicion_transporte'); if (list) list.style.display = 'none'; };
window.editarObsPendiente = function(k,v) { const p = pendientesAMPM.find(function(p){return p.key===k;}) || pendientesADM.find(function(p){return p.key===k;}) || pendientesQDM.find(function(p){return p.key===k;}) || pendientesB2C.find(function(p){return p.key===k;}); if (p) p.reg.observacion = v.toUpperCase(); };
window.editarRangoPendiente = function(k,v) { const p = pendientesAMPM.find(function(p){return p.key===k;}) || pendientesADM.find(function(p){return p.key===k;}) || pendientesQDM.find(function(p){return p.key===k;}) || pendientesB2C.find(function(p){return p.key===k;}); if (p) p.reg.rango = v; };

window.toggleOtroPalet = function(key, esPend, checked) {
    if (esPend) { const p = pendientesAMPM.find(function(p){return p.key===key;}) || pendientesADM.find(function(p){return p.key===key;}) || pendientesQDM.find(function(p){return p.key===key;}) || pendientesB2C.find(function(p){return p.key===key;}); if (p){ p.reg.otroPalet = checked; render(); } }
    else { outer: for (const a of Object.keys(cache)) { for (const m of Object.keys(cache[a]||{})) { if (cache[a][m] && cache[a][m][key]) { cache[a][m][key].otroPalet = checked; update(ref(db, RUTA_BASE + '/' + a + '/' + m + '/' + key), { otroPalet: checked }); break outer; } } } render(); }
};

function actualizarBotonGuardar() { const b = document.getElementById('btnGuardarAmpm'); if (!b) return; b.style.display = 'inline-block'; const numCambios = Object.keys(cambiosFechaLocales).length; if (numCambios > 0) { b.textContent = 'GUARDAR (' + numCambios + ' cambios pendientes)'; b.style.background = 'var(--accent-orange)'; } else { b.textContent = 'GUARDAR'; b.style.background = 'var(--accent-blue)'; } }

// ✅ CORREGIDO: Strings con \n escapado (no saltos de línea reales)
window.guardarPendientesSeccion = function() {
    const lista = pendientesDeSeccion();
    const numCambiosFecha = Object.keys(cambiosFechaLocales).length;
    if (!lista.length && numCambiosFecha === 0) { toast('No hay nada por guardar', 'info'); return; }
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
        if (cambio.esPendiente) { const p = pendientesAMPM.find(function(p){return p.key===key;}) || pendientesADM.find(function(p){return p.key===key;}) || pendientesQDM.find(function(p){return p.key===key;}) || pendientesB2C.find(function(p){return p.key===key;}); if (p) { p.reg.fecha = cambio.nuevaFecha; p.anio = cambio.nuevaAnio; p.mes = cambio.nuevaMes; } }
        else { const anioOriginal = cambio.anioOriginal; const mesOriginal = cambio.mesOriginal; if (cache[anioOriginal] && cache[anioOriginal][mesOriginal] && cache[anioOriginal][mesOriginal][key]) { const regData = Object.assign({}, cache[anioOriginal][mesOriginal][key]); delete cache[anioOriginal][mesOriginal][key]; if (!cache[cambio.nuevaAnio]) cache[cambio.nuevaAnio] = {}; if (!cache[cambio.nuevaAnio][cambio.nuevaMes]) cache[cambio.nuevaAnio][cambio.nuevaMes] = {}; regData.fecha = cambio.nuevaFecha; cache[cambio.nuevaAnio][cambio.nuevaMes][key] = regData; promesasFecha.push(remove(ref(db, RUTA_BASE + '/' + anioOriginal + '/' + mesOriginal + '/' + key)).then(function() { return set(ref(db, RUTA_BASE + '/' + cambio.nuevaAnio + '/' + cambio.nuevaMes + '/' + key), regData); })); } }
    });
    cambiosFechaLocales = {};
    let g = 0; let li = 0;
    const lotes = []; for (let i=0;i<lista.length;i+=50) lotes.push(lista.slice(i,i+50));
    const proc = function() { if (li >= lotes.length) { lotes.flat().forEach(function(p) { const l = Object.assign({}, p.reg); delete l.pendiente; delete l._candidatos; if (!cache[p.anio]) cache[p.anio] = {}; if (!cache[p.anio][p.mes]) cache[p.anio][p.mes] = {}; cache[p.anio][p.mes]['local_' + p.key] = l; }); if (seccionActiva==='ampm') pendientesAMPM=[]; else if (seccionActiva==='adm') pendientesADM=[]; else if (seccionActiva==='qdm') pendientesQDM=[]; else if (seccionActiva==='b2c') pendientesB2C=[]; Promise.all(promesasFecha).then(function() { actualizarBotonGuardar(); render(); cargarDatos(); }).catch(function(e) { toast('Error al guardar cambios de fecha: ' + e.message, 'err'); actualizarBotonGuardar(); render(); }); return; } Promise.all(lotes[li].map(function(p) { return push(ref(db, RUTA_BASE + '/' + p.anio + '/' + p.mes), p.reg).then(function(){g++;}).catch(function(e){}); })).then(function(){ li++; setTimeout(proc,100); }); };
    proc();
    registrarActividad('GUARDADO', formatoEntero(lista.length) + ' registros guardados en ' + tipoDeSeccion(), tipoDeSeccion());
};

window.pedirBorrarRegistro = function(key, anio, mes, esPend) {
    pedirClave(function() {
        if (!confirm('El registro se eliminará de la DESCRIPCION, de la BASE DE DATOS y de FIREBASE.\nEsta acción no se puede deshacer.\n¿Confirmas?')) return;
        if (esPend) { let i = pendientesAMPM.findIndex(function(p){return p.key===key;}); if (i>=0) pendientesAMPM.splice(i,1); else { i = pendientesADM.findIndex(function(p){return p.key===key;}); if (i>=0) pendientesADM.splice(i,1); else { i = pendientesQDM.findIndex(function(p){return p.key===key;}); if (i>=0) pendientesQDM.splice(i,1); else { i = pendientesB2C.findIndex(function(p){return p.key===key;}); if (i>=0) pendientesB2C.splice(i,1); } } } if (cache[anio] && cache[anio][mes] && cache[anio][mes][key]) delete cache[anio][mes][key]; delete cambiosFechaLocales[key]; toast('Eliminado de la plataforma (pendiente)','ok'); render(); return; }
        const existeEnCache = cache[anio] && cache[anio][mes] && cache[anio][mes][key];
        if (!existeEnCache) { toast('El registro ya no existe','err'); return; }
        if (cache[anio] && cache[anio][mes] && cache[anio][mes][key]) delete cache[anio][mes][key];
        delete cambiosFechaLocales[key];
        remove(ref(db, RUTA_BASE + '/' + anio + '/' + mes + '/' + key)).then(function() { toast('Eliminado de plataforma y Firebase','ok'); render(); renderizarBaseDatos(); }).catch(function(e) { toast('Error al borrar: ' + e.message, 'err'); if (!cache[anio]) cache[anio] = {}; if (!cache[anio][mes]) cache[anio][mes] = {}; cache[anio][mes][key] = existeEnCache; render(); });
        registrarActividad('ELIMINACION', 'Registro eliminado: ' + key, tipoDeSeccion());
    });
};

window.enviarSeleccion = function() {
    if (seleccionadosDesc.size === 0) { toast('Selecciona al menos una fila', 'err'); return; }
    let enviados = 0;
    let errores = [];
    const bitacorasModificadas = new Set();
    seleccionadosDesc.forEach(function(key) {
        let reg = null;
        outer: for (const a of Object.keys(cache)) { for (const m of Object.keys(cache[a]||{})) { if (cache[a][m] && cache[a][m][key]) { reg = Object.assign({}, cache[a][m][key]); break outer; } } }
        if (!reg) { const p = pendientesAMPM.find(function(p){return p.key===key;}) || pendientesADM.find(function(p){return p.key===key;}) || pendientesQDM.find(function(p){return p.key===key;}) || pendientesB2C.find(function(p){return p.key===key;}); if (p) { reg = Object.assign({}, p.reg); } }
        if (!reg) { errores.push('Registro ' + key + ' no encontrado'); return; }
        if (cambiosFechaLocales[key]) { reg.fecha = cambiosFechaLocales[key].nuevaFecha; }
        const transporte = (reg.transporte || '').toUpperCase();
        const tipoRegistro = getTipoRegistro(reg);
        const bitKey = obtenerClaveBitacora(transporte, tipoRegistro);
        if (!bitKey) { errores.push((reg.idPedido || key) + ': Transporte no reconocido (' + transporte + ')'); return; }
        const filaBitacora = { requirente: reg.unidad || '', documentos: reg.idPedido || '', cliente: reg.nombre || '', direccion: reg.direccion || '', comuna: reg.comuna || '', obs: reg.observacion || '', rango: reg.rango || '', tipo: reg.tipo || '', esAdmin: reg.esAdmin || false };
        if (!bitacorasData[bitKey]) { bitacorasData[bitKey] = { filas: [], footer: { transporte: transporte, fecha: reg.fecha || '', ruta: reg.rango || 'AM', responsable: '', firma: '' } }; }
        let filaIdx = -1;
        for (let i = 0; i < 15; i++) { if (!bitacorasData[bitKey].filas[i] || (!bitacorasData[bitKey].filas[i].requirente && !bitacorasData[bitKey].filas[i].documentos && !bitacorasData[bitKey].filas[i].cliente)) { filaIdx = i; break; } }
        if (filaIdx === -1) { errores.push((reg.idPedido || key) + ': Bitácora llena'); return; }
        bitacorasData[bitKey].filas[filaIdx] = filaBitacora;
        bitacorasModificadas.add(bitKey);
        enviados++;
    });
    if (enviados > 0) {
        const promesas = [];
        bitacorasModificadas.forEach(function(key) { promesas.push(update(ref(db, RUTA_BITACORAS + '/' + key), { filas: bitacorasData[key].filas, footer: bitacorasData[key].footer })); });
        Promise.all(promesas).then(function() { toast(enviados + ' registro(s) enviado(s) a BITACORAS', 'ok'); if (errores.length > 0) setTimeout(function() { toast(errores.length + ' error(es): ' + errores.slice(0,2).join(', '), 'err'); }, 1000); renderizarTodasBitacoras(); seleccionadosDesc.clear(); render(); }).catch(function(e) { toast('Error al guardar bitácoras: ' + e.message, 'err'); console.error('Error detallado:', e); });
        registrarActividad('ENVIO_BITACORA', formatoEntero(enviados) + ' registros enviados a bitácoras', 'BITACORAS');
    } else { toast('No se pudo enviar', 'err'); if (errores.length > 0) setTimeout(function() { toast('Errores: ' + errores.slice(0,3).join('; '), 'err'); }, 1000); }
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
    const esAdm = rolActual === 'admin';
    if (tipoSec === 'B2C') {
        const reg = { fecha: fecha, unidad: document.getElementById('fUnidad').value, idPedido: document.getElementById('fId').value.trim(), nombre: document.getElementById('fNombre').value.trim().toUpperCase(), celular:'', email:'', direccion: document.getElementById('fDireccion').value.trim().toUpperCase(), comuna: canonComuna(document.getElementById('fComuna').value), valor: parseFloat(document.getElementById('fValor').value)||0, observacion: document.getElementById('fObs').value.toUpperCase(), transporte:'SERVICIO B2C', rango:'B2C', tipo:'B2C', otroPalet:false, esAdmin: esAdm, usuario: emailUsuarioActual, creado: new Date().toISOString(), transporteManual: true };
        pendientesB2C.push({ anio:a, mes:m, key:'pend_nr_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), reg: reg });
        toast('Agregado. Presiona GUARDAR.','info'); limpiar(); paginaDesc = 1; render(); actualizarBotonGuardar();
        return;
    }
    if (tipoSec === 'ADM') {
        const reg = { fecha: fecha, unidad: document.getElementById('fUnidad').value, idPedido: document.getElementById('fId').value.trim(), nombre: document.getElementById('fNombre').value.trim().toUpperCase(), direccion: document.getElementById('fDireccion').value.trim().toUpperCase(), comuna: canonComuna(document.getElementById('fComuna').value), valor: parseFloat(document.getElementById('fValor').value)||0, observacion: document.getElementById('fObs').value.toUpperCase(), transporte: document.getElementById('fTransporte').value || 'SERVICIO ADM', rango:rango, tipo:'ADM', otroPalet:false, esAdmin: esAdm, usuario: emailUsuarioActual, creado: new Date().toISOString(), transporteManual: true };
        pendientesADM.push({ anio:a, mes:m, key:'pend_nr_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), reg: reg });
        toast('Agregado. Presiona GUARDAR.','info'); limpiar(); paginaDesc = 1; render(); actualizarBotonGuardar();
        return;
    }
    if (tipoSec === 'QDM') {
        const reg = { fecha: fecha, unidad: document.getElementById('fUnidad').value, idPedido: document.getElementById('fId').value.trim(), nombre: document.getElementById('fNombre').value.trim().toUpperCase(), direccion: document.getElementById('fDireccion').value.trim().toUpperCase(), comuna: canonComuna(document.getElementById('fComuna').value), valor: parseFloat(document.getElementById('fValor').value)||0, observacion: document.getElementById('fObs').value.toUpperCase(), transporte: document.getElementById('fTransporte').value || 'SERVICIO QDM', rango:rango, tipo:'QDM', otroPalet:false, esAdmin: esAdm, usuario: emailUsuarioActual, creado: new Date().toISOString(), transporteManual: true };
        pendientesQDM.push({ anio:a, mes:m, key:'pend_nr_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), reg: reg });
        toast('Agregado. Presiona GUARDAR.','info'); limpiar(); paginaDesc = 1; render(); actualizarBotonGuardar();
        return;
    }
    let reg = { fecha: fecha, unidad: document.getElementById('fUnidad').value, idPedido: document.getElementById('fId').value.trim(), nombre: document.getElementById('fNombre').value.trim().toUpperCase(), direccion: document.getElementById('fDireccion').value.trim().toUpperCase(), comuna: canonComuna(document.getElementById('fComuna').value), valor: parseFloat(document.getElementById('fValor').value)||0, observacion: document.getElementById('fObs').value.toUpperCase(), transporte: document.getElementById('fTransporte').value, rango: rango, tipo: 'AMPM', otroPalet:false, esAdmin: esAdm, usuario: emailUsuarioActual, creado: new Date().toISOString(), transporteManual: true };
    if (!reg.transporte) { reg.transporteManual = false; if (esAntesDe1400()) { reg = autocompletarTransportePM(reg); } else if (esDespuesDe1401()) { const diaManana = obtenerDiaSemanaManana(); reg = autocompletarTransporteAM(reg, diaManana); } }
    pendientesAMPM.push({ anio:a, mes:m, key:'pend_nr_'+Date.now()+'_'+Math.random().toString(36).substr(2,5), reg: reg });
    toast('Agregado. Presiona GUARDAR.','info'); limpiar(); paginaDesc = 1; render(); actualizarBotonGuardar();
});

window.limpiar = function() { document.getElementById('formReg').reset(); document.getElementById('fFecha').valueAsDate = new Date(); };
window.abrirModalExportar = function() { const tipo = tipoDeSeccion(); const hoy = new Date().toISOString().split('T')[0]; document.getElementById('expFilaFecha').style.display = 'none'; document.getElementById('expTitulo').textContent = 'Exportar a Excel — ' + fmtFechaConDia(hoy) + ' (' + tipo + ')'; document.getElementById('expInfo').textContent = 'Registros del día: ' + formatoEntero(contarRegsDelDia(tipo).length); document.getElementById('exportarModal').classList.add('show'); };
window.actualizarExpInfo = function() { const tipo = tipoDeSeccion(); const hoy = new Date().toISOString().split('T')[0]; document.getElementById('expInfo').textContent = 'Registros del día ' + fmtFechaConDia(hoy) + ': ' + formatoEntero(contarRegsDelDia(tipo).length); };
function contarRegsDelDia(tipo) { const hoy = new Date().toISOString().split('T')[0]; let r = obtenerRegsTipo(tipo).filter(function(r) { return r.fecha === hoy; }); if (tipo==='AMPM') r = r.concat(pendientesAMPM.map(function(p){return Object.assign({}, p.reg, {key:p.key});})); if (tipo==='ADM') r = r.concat(pendientesADM.map(function(p){return Object.assign({}, p.reg, {key:p.key});})); if (tipo==='QDM') r = r.concat(pendientesQDM.map(function(p){return Object.assign({}, p.reg, {key:p.key});})); if (tipo==='B2C') r = r.concat(pendientesB2C.map(function(p){return Object.assign({}, p.reg, {key:p.key});})); return r; }
window.cerrarModalExportar = function() { document.getElementById('exportarModal').classList.remove('show'); };
window.confirmarExportar = function() { const cols = [{id:'expFecha',key:'fecha',label:'Fecha'},{id:'expUnidad',key:'unidad',label:'Unidad Negocio'},{id:'expIdPedido',key:'idPedido',label:'ID Pedido'},{id:'expNombre',key:'nombre',label:'Nombre Cliente'},{id:'expCelular',key:'celular',label:'Celular'},{id:'expEmail',key:'email',label:'E-Mail'},{id:'expDireccion',key:'direccion',label:'Direccion'},{id:'expComuna',key:'comuna',label:'Comuna'},{id:'expValor',key:'valor',label:'Valor'},{id:'expObservacion',key:'observacion',label:'Observacion'},{id:'expTransporte',key:'transporte',label:'Transporte'},{id:'expRango',key:'rango',label:'Rango'}].filter(function(c) { return document.getElementById(c.id).checked; }); if (!cols.length) { toast('Elige al menos una columna','err'); return; } const tipo = tipoDeSeccion(); let regs = contarRegsDelDia(tipo); ordenarPorFechaDireccionId(regs); if (!regs.length) { toast('No hay registros del día','err'); return; } const datos = regs.map(function(r) { const f = {}; cols.forEach(function(c) { if (c.key==='fecha') f[c.label]=fmtFechaConDia(r.fecha); else if (c.key==='direccion') f[c.label]=dirDe(r); else if (c.key==='comuna') f[c.label]=canonComuna(r.comuna); else if (c.key==='valor') f[c.label]=formatoMoneda(r.valor); else f[c.label]=r[c.key]!==undefined ? r[c.key] : ''; }); return f; }); const ws = XLSX.utils.json_to_sheet(datos); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Despachos'); XLSX.writeFile(wb, 'DespachoRetail_' + tipo + '_' + new Date().toISOString().split('T')[0] + '.xlsx'); toast('Exportados ' + formatoEntero(regs.length) + ' registros','ok'); cerrarModalExportar(); registrarActividad('EXPORTACION', 'Exportó ' + formatoEntero(regs.length) + ' registros a Excel', tipo); };

function renderizarTodasBitacoras() { BITACORAS_UNIFICADAS.forEach(function(bit) { renderizarBitacora(bit.key, bit.label, bit.domId); }); BITACORAS_B2C.forEach(function(bit) { renderizarBitacora(bit.key, bit.label, bit.domId); }); }
function renderizarBitacora(key, label, domId) { const cont = document.getElementById(domId); if (!cont) return; cont.innerHTML = generarHTMLBitacora(key, label); }
function generarHTMLBitacora(key, label) { const data = bitacorasData[key] || { filas: [], footer: { transporte: label, fecha: '', ruta: '', responsable: '', firma: '' } }; let html = '<div class="bitacora-wrapper"><div class="bitacora-header-info">BITACORA ' + label + '</div><table class="bitacora-table"><thead><tr><th style="width:40px;">N</th><th>REQUIRENTE</th><th>DOCUMENTOS</th><th>CLIENTE</th><th>DIRECCION</th><th>COMUNA</th><th>OBS</th></tr></thead><tbody>'; for (let i = 0; i < 15; i++) { const fila = data.filas[i] || { requirente: '', documentos: '', cliente: '', direccion: '', comuna: '', obs: '', esAdmin: false }; const filaClass = fila.esAdmin ? ' class="fila-admin-bit"' : ''; html += '<tr' + filaClass + '><td class="num-col">' + (i+1) + '</td>'; html += '<td><input type="text" id="bit_' + key + '_' + i + '_requirente" value="' + (fila.requirente||'').replace(/"/g,'&quot;') + '"></td>'; html += '<td><input type="text" id="bit_' + key + '_' + i + '_documentos" value="' + (fila.documentos||'').replace(/"/g,'&quot;') + '"></td>'; html += '<td><input type="text" id="bit_' + key + '_' + i + '_cliente" value="' + (fila.cliente||'').replace(/"/g,'&quot;') + '"></td>'; html += '<td><input type="text" id="bit_' + key + '_' + i + '_direccion" value="' + (fila.direccion||'').replace(/"/g,'&quot;') + '"></td>'; html += '<td><input type="text" id="bit_' + key + '_' + i + '_comuna" value="' + (fila.comuna||'').replace(/"/g,'&quot;') + '"></td>'; html += '<td><input type="text" id="bit_' + key + '_' + i + '_obs" value="' + (fila.obs||'').replace(/"/g,'&quot;') + '"></td></tr>'; } html += '</tbody></table><table class="bitacora-footer-table"><thead><tr><th>TRANSPORTE</th><th>FECHA</th><th>RUTA</th><th>RESPONSABLE</th><th>FIRMA</th></tr></thead><tbody><tr>'; html += '<td style="background:#fff"><input type="text" id="bit_' + key + '_footer_transporte" value="' + (data.footer.transporte||'').replace(/"/g,'&quot;') + '"></td>'; html += '<td style="background:#fff"><input type="date" id="bit_' + key + '_footer_fecha" value="' + (data.footer.fecha||'') + '"></td>'; html += '<td style="background:#fff"><input type="text" id="bit_' + key + '_footer_ruta" value="' + (data.footer.ruta||'').replace(/"/g,'&quot;') + '"></td>'; html += '<td style="background:#fff"><input type="text" id="bit_' + key + '_footer_responsable" value="' + (data.footer.responsable||'').replace(/"/g,'&quot;') + '"></td>'; html += '<td style="background:#fff"><input type="text" id="bit_' + key + '_footer_firma" value="' + (data.footer.firma||'').replace(/"/g,'&quot;') + '"></td>'; html += '</tr></tbody></table></div>'; return html; }

window.guardarTodasBitacoras = function(tipoBitacora) { const bitacoras = obtenerBitacorasPorTipo(tipoBitacora); let guardadas = 0; bitacoras.forEach(function(bit) { const key = bit.key; const filas = []; for (let i = 0; i < 15; i++) { const requirenteEl = document.getElementById('bit_' + key + '_' + i + '_requirente'); if (requirenteEl) { const fila = { requirente: requirenteEl.value || '', documentos: document.getElementById('bit_' + key + '_' + i + '_documentos') ? document.getElementById('bit_' + key + '_' + i + '_documentos').value : '', cliente: document.getElementById('bit_' + key + '_' + i + '_cliente') ? document.getElementById('bit_' + key + '_' + i + '_cliente').value : '', direccion: document.getElementById('bit_' + key + '_' + i + '_direccion') ? document.getElementById('bit_' + key + '_' + i + '_direccion').value : '', comuna: document.getElementById('bit_' + key + '_' + i + '_comuna') ? document.getElementById('bit_' + key + '_' + i + '_comuna').value : '', obs: document.getElementById('bit_' + key + '_' + i + '_obs') ? document.getElementById('bit_' + key + '_' + i + '_obs').value : '' }; if (fila.requirente || fila.documentos || fila.cliente) filas.push(fila); } } const footer = { transporte: document.getElementById('bit_' + key + '_footer_transporte') ? document.getElementById('bit_' + key + '_footer_transporte').value : '', fecha: document.getElementById('bit_' + key + '_footer_fecha') ? document.getElementById('bit_' + key + '_footer_fecha').value : '', ruta: document.getElementById('bit_' + key + '_footer_ruta') ? document.getElementById('bit_' + key + '_footer_ruta').value : '', responsable: document.getElementById('bit_' + key + '_footer_responsable') ? document.getElementById('bit_' + key + '_footer_responsable').value : '', firma: document.getElementById('bit_' + key + '_footer_firma') ? document.getElementById('bit_' + key + '_footer_firma').value : '' }; bitacorasData[key] = { filas: filas, footer: footer }; update(ref(db, RUTA_BITACORAS + '/' + key), { filas: filas, footer: footer }).then(function() { guardadas++; }).catch(function(e) { toast('Error al guardar ' + key + ': ' + e.message, 'err'); }); }); setTimeout(function() { toast('Bitácoras ' + (tipoBitacora === 'b2c' ? 'B2C' : 'AM/PM-ADM-QDM') + ' guardadas: ' + guardadas, 'ok'); }, 500); registrarActividad('GUARDADO', 'Guardadas ' + guardadas + ' bitácoras ' + (tipoBitacora === 'b2c' ? 'B2C' : 'AM/PM-ADM-QDM'), 'BITACORAS'); };

window.abrirModalBorrarBitacoraTodo = function(tipoBitacora) { if (rolActual !== 'admin') { toast('Solo el administrador', 'err'); return; } const bitacoras = obtenerBitacorasPorTipo(tipoBitacora); let totalFilas = 0; bitacoras.forEach(function(bit) { const data = bitacorasData[bit.key]; if (data && data.filas) { totalFilas += data.filas.filter(function(f) { return f && (f.requirente || f.documentos || f.cliente); }).length; } }); const tipoLabel = tipoBitacora === 'b2c' ? 'B2C' : 'AM/PM-ADM-QDM'; document.getElementById('bbtTitulo').textContent = 'BORRAR BITÁCORAS ' + tipoLabel; document.getElementById('bbtDescripcion').textContent = 'Esta acción eliminará TODA la información de las 9 bitácoras ' + tipoLabel + '. Esta acción es IRREVERSIBLE.'; document.getElementById('bbtInfoRegistros').textContent = 'Total de filas en bitácoras ' + tipoLabel + ' a eliminar: ' + formatoEntero(totalFilas); document.getElementById('bbtPassword').value = ''; document.getElementById('borrarBitacoraTodoOverlay').dataset.tipoBitacora = tipoBitacora; document.getElementById('borrarBitacoraTodoOverlay').classList.add('show'); };
window.cerrarModalBorrarBitacoraTodo = function() { document.getElementById('borrarBitacoraTodoOverlay').classList.remove('show'); };

// ✅ CORREGIDO: \n escapado
window.confirmarBorrarBitacoraTodo = function() {
    const p = document.getElementById('bbtPassword').value;
    if (p !== CLAVE_ACCIONES) { toast('Contraseña incorrecta','err'); return; }
    const overlay = document.getElementById('borrarBitacoraTodoOverlay');
    const tipoBitacora = overlay.dataset.tipoBitacora || 'unificadas';
    const bitacoras = obtenerBitacorasPorTipo(tipoBitacora);
    const tipoLabel = tipoBitacora === 'b2c' ? 'B2C' : 'AM/PM-ADM-QDM';
    if (!confirm('¿Eliminar TODA la información de las bitácoras ' + tipoLabel + '?\nEsta acción es IRREVERSIBLE.')) return;
    toast('Eliminando bitácoras ' + tipoLabel + '...','info');
    const promesas = [];
    bitacoras.forEach(function(bit) { promesas.push(remove(ref(db, RUTA_BITACORAS + '/' + bit.key)).catch(function(){})); bitacorasData[bit.key] = { filas: [], footer: { transporte: bit.label, fecha: '', ruta: '', responsable: '', firma: '' } }; });
    Promise.all(promesas).then(function() { toast('Todas las bitácoras ' + tipoLabel + ' eliminadas','ok'); cerrarModalBorrarBitacoraTodo(); renderizarTodasBitacoras(); registrarActividad('BORRADO_MASIVO', 'Eliminó todas las bitácoras ' + tipoLabel + ' (' + bitacoras.length + ' bitácoras)', 'BITACORAS'); }).catch(function(e) { toast('Error al eliminar: ' + e.message, 'err'); });
};

window.abrirModalBorrarBitacoraAdmin = function(tipoBitacora) { if (rolActual !== 'admin') { toast('Solo el administrador', 'err'); return; } const bitacoras = obtenerBitacorasPorTipo(tipoBitacora); let totalAdmin = 0; bitacoras.forEach(function(bit) { const data = bitacorasData[bit.key]; if (data && data.filas) { totalAdmin += data.filas.filter(function(f) { return f && f.esAdmin; }).length; } }); const tipoLabel = tipoBitacora === 'b2c' ? 'B2C' : 'AM/PM-ADM-QDM'; document.getElementById('bbaTitulo').textContent = 'BORRAR BITÁCORAS ADMIN ' + tipoLabel; document.getElementById('bbaDescripcion').textContent = 'Esta acción eliminará SOLO los registros marcados en VERDE (creados por el administrador) de las bitácoras ' + tipoLabel + '.'; document.getElementById('bbaInfoRegistros').textContent = 'Total de filas ADMIN (verde) en bitácoras ' + tipoLabel + ' a eliminar: ' + formatoEntero(totalAdmin); document.getElementById('bbaPassword').value = ''; document.getElementById('borrarBitacoraAdminOverlay').dataset.tipoBitacora = tipoBitacora; document.getElementById('borrarBitacoraAdminOverlay').classList.add('show'); };
window.cerrarModalBorrarBitacoraAdmin = function() { document.getElementById('borrarBitacoraAdminOverlay').classList.remove('show'); };
window.confirmarBorrarBitacoraAdmin = function() { const p = document.getElementById('bbaPassword').value; if (p !== CLAVE_ACCIONES) { toast('Contraseña incorrecta','err'); return; } const overlay = document.getElementById('borrarBitacoraAdminOverlay'); const tipoBitacora = overlay.dataset.tipoBitacora || 'unificadas'; const bitacoras = obtenerBitacorasPorTipo(tipoBitacora); const tipoLabel = tipoBitacora === 'b2c' ? 'B2C' : 'AM/PM-ADM-QDM'; if (!confirm('¿Eliminar SOLO los registros ADMIN (verde) de las bitácoras ' + tipoLabel + '?')) return; toast('Eliminando registros admin de bitácoras ' + tipoLabel + '...','info'); let totalEliminados = 0; bitacoras.forEach(function(bit) { const data = bitacorasData[bit.key]; if (data && data.filas) { data.filas = data.filas.filter(function(f) { if (f && f.esAdmin) { totalEliminados++; return false; } return true; }); update(ref(db, RUTA_BITACORAS + '/' + bit.key), { filas: data.filas, footer: data.footer }).catch(function(){}); } }); toast(formatoEntero(totalEliminados) + ' registros admin eliminados de bitácoras ' + tipoLabel,'ok'); cerrarModalBorrarBitacoraAdmin(); renderizarTodasBitacoras(); registrarActividad('BORRADO_MASIVO', 'Eliminó ' + formatoEntero(totalEliminados) + ' registros ADMIN de bitácoras ' + tipoLabel, 'BITACORAS'); };

window.abrirModalExportarBitacoras = function(tipoBitacora) { const bitacoras = obtenerBitacorasPorTipo(tipoBitacora); const grid = document.getElementById('bitacoraExportGrid'); if (!grid) return; document.getElementById('bitExpTitulo').textContent = 'Exportar Bitácoras ' + (tipoBitacora === 'b2c' ? 'B2C' : 'AM/PM-ADM-QDM') + ' a Excel'; document.getElementById('bitExpSubtitulo').textContent = 'Selecciona las bitácoras que deseas exportar.'; let html = ''; bitacoras.forEach(function(bit, idx) { const data = bitacorasData[bit.key]; const tieneDatos = data && data.filas && data.filas.length > 0; const count = tieneDatos ? data.filas.filter(function(f) { return f && (f.requirente || f.documentos || f.cliente); }).length : 0; const label = bit.label + (count > 0 ? ' (' + count + ')' : ''); html += '<div class="bitacora-export-item"><input type="checkbox" id="bitExp_' + idx + '" ' + (tieneDatos ? 'checked' : '') + '><label for="bitExp_' + idx + '">' + label + '</label></div>'; }); grid.innerHTML = html; grid.dataset.tipoBitacora = tipoBitacora; document.getElementById('bitacoraExportOverlay').classList.add('show'); };
window.cerrarModalExportarBitacoras = function() { document.getElementById('bitacoraExportOverlay').classList.remove('show'); };
window.seleccionarTodasBitacoras = function() { const checkboxes = document.querySelectorAll('#bitacoraExportGrid input[type="checkbox"]'); const allChecked = Array.from(checkboxes).every(function(cb) { return cb.checked; }); checkboxes.forEach(function(cb) { cb.checked = !allChecked; }); };
window.confirmarExportarBitacoras = function() { const grid = document.getElementById('bitacoraExportGrid'); const tipoBitacora = grid.dataset.tipoBitacora || 'unificadas'; const bitacoras = obtenerBitacorasPorTipo(tipoBitacora); const checkboxes = document.querySelectorAll('#bitacoraExportGrid input[type="checkbox"]:checked'); if (checkboxes.length === 0) { toast('Selecciona al menos una bitácora', 'err'); return; } const wb = XLSX.utils.book_new(); let exportadas = 0; checkboxes.forEach(function(cb) { const idx = parseInt(cb.id.replace('bitExp_', '')); const bit = bitacoras[idx]; const data = bitacorasData[bit.key]; if (!data || !data.filas || data.filas.length === 0) return; const filasConDatos = data.filas.filter(function(f) { return f && (f.requirente || f.documentos || f.cliente); }); if (filasConDatos.length === 0) return; const wsData = []; wsData.push(['Bitácora ' + bit.label + ' (' + (tipoBitacora === 'b2c' ? 'B2C' : 'AM/PM-ADM-QDM') + ')', '', '', '', '', '', '']); wsData.push(['', '', '', '', '', '', '']); wsData.push(['N', 'Requirente', 'Documentos', 'Cliente', 'Direccion', 'Comuna', 'OBS']); filasConDatos.forEach(function(fila, i) { wsData.push([i+1, fila.requirente||'', fila.documentos||'', fila.cliente||'', fila.direccion||'', fila.comuna||'', fila.obs||'']); }); wsData.push(['', '', '', '', '', '', '']); wsData.push(['Transporte', 'Fecha', 'Ruta', 'Responsable', 'Firma', '', '']); wsData.push([data.footer.transporte||'', data.footer.fecha||'', data.footer.ruta||'', data.footer.responsable||'', data.footer.firma||'', '', '']); const ws = XLSX.utils.aoa_to_sheet(wsData); ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]; ws['!cols'] = [{ wch: 6 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 35 }, { wch: 18 }, { wch: 20 }]; const sheetName = (tipoBitacora === 'b2c' ? 'B2C_' : '') + bit.label; XLSX.utils.book_append_sheet(wb, ws, sheetName.substring(0, 31)); exportadas++; }); if (exportadas === 0) { toast('No hay bitácoras con datos para exportar', 'err'); return; } const fecha = new Date().toISOString().split('T')[0]; const sufijo = tipoBitacora === 'b2c' ? 'B2C' : 'Unificadas'; XLSX.writeFile(wb, 'Bitacoras_' + sufijo + '_' + fecha + '.xlsx'); toast(exportadas + ' bitácoras exportadas', 'ok'); cerrarModalExportarBitacoras(); registrarActividad('EXPORTACION', 'Exportó ' + exportadas + ' bitácoras ' + sufijo + ' a Excel', 'BITACORAS'); };

window.abrirModalJPEGBitacoras = function(tipoBitacora) { const bitacoras = obtenerBitacorasPorTipo(tipoBitacora); const grid = document.getElementById('bitacoraJPEGGrid'); if (!grid) return; document.getElementById('bitJpegTitulo').textContent = 'Exportar Bitácoras ' + (tipoBitacora === 'b2c' ? 'B2C' : 'AM/PM-ADM-QDM') + ' como JPEG'; document.getElementById('bitJpegSubtitulo').textContent = 'Selecciona las bitácoras que deseas exportar como imagen.'; let html = ''; bitacoras.forEach(function(bit, idx) { const data = bitacorasData[bit.key]; const tieneDatos = data && data.filas && data.filas.length > 0; const count = tieneDatos ? data.filas.filter(function(f) { return f && (f.requirente || f.documentos || f.cliente); }).length : 0; const label = bit.label + (count > 0 ? ' (' + count + ' registros)' : ''); html += '<div class="bitacora-export-item"><input type="checkbox" id="bitJpeg_' + idx + '" ' + (tieneDatos ? 'checked' : '') + '><label for="bitJpeg_' + idx + '">' + label + '</label></div>'; }); grid.innerHTML = html; grid.dataset.tipoBitacora = tipoBitacora; document.getElementById('bitacoraJPEGOverlay').classList.add('show'); };
window.cerrarModalJPEGBitacoras = function() { document.getElementById('bitacoraJPEGOverlay').classList.remove('show'); };
window.seleccionarTodasBitacorasJPEG = function() { const checkboxes = document.querySelectorAll('#bitacoraJPEGGrid input[type="checkbox"]'); const allChecked = Array.from(checkboxes).every(function(cb) { return cb.checked; }); checkboxes.forEach(function(cb) { cb.checked = !allChecked; }); };
window.confirmarExportarJPEGBitacoras = function() { const grid = document.getElementById('bitacoraJPEGGrid'); const tipoBitacora = grid.dataset.tipoBitacora || 'unificadas'; const bitacoras = obtenerBitacorasPorTipo(tipoBitacora); const checkboxes = document.querySelectorAll('#bitacoraJPEGGrid input[type="checkbox"]:checked'); if (checkboxes.length === 0) { toast('Selecciona al menos una bitácora', 'err'); return; } const fecha = new Date().toISOString().split('T')[0]; let exportadas = 0; const total = checkboxes.length; checkboxes.forEach(function(cb) { const idx = parseInt(cb.id.replace('bitJpeg_', '')); const bit = bitacoras[idx]; const element = document.getElementById(bit.domId); if (!element) return; const clone = element.cloneNode(true); const inputs = clone.querySelectorAll('input'); inputs.forEach(function(inp) { const span = document.createElement('span'); span.textContent = inp.value || ''; span.style.cssText = 'display:block;width:100%;padding:4px 6px;font-family:Arial,sans-serif;font-size:11px;color:#000;white-space:normal;word-wrap:break-word;'; inp.parentNode.replaceChild(span, inp); }); const tables = clone.querySelectorAll('table'); tables.forEach(function(t) { t.style.tableLayout = 'auto'; t.style.width = '100%'; }); clone.style.position = 'absolute'; clone.style.left = '-9999px'; clone.style.top = '0'; clone.style.width = '1400px'; clone.style.background = '#fff'; clone.style.padding = '30px'; clone.style.overflow = 'visible'; document.body.appendChild(clone); html2canvas(clone, { backgroundColor: '#ffffff', scale: 2, useCORS: true, allowTaint: true, logging: false, width: 1400, windowWidth: 1400, windowHeight: clone.scrollHeight, scrollX: 0, scrollY: 0 }).then(function(canvas) { document.body.removeChild(clone); const link = document.createElement('a'); const sufijo = tipoBitacora === 'b2c' ? 'B2C_' : ''; link.download = 'Bitacora_' + sufijo + bit.key + '_' + fecha + '.jpeg'; link.href = canvas.toDataURL('image/jpeg', 0.95); link.click(); exportadas++; if (exportadas === total) { toast(exportadas + ' bitácoras JPEG exportadas', 'ok'); } }).catch(function(e) { document.body.removeChild(clone); toast('Error al exportar JPEG: ' + e.message, 'err'); }); }); cerrarModalJPEGBitacoras(); registrarActividad('EXPORTACION', 'Exportó ' + checkboxes.length + ' bitácoras ' + (tipoBitacora === 'b2c' ? 'B2C' : 'AM/PM-ADM-QDM') + ' como JPEG', 'BITACORAS'); };

window.abrirModalImprimirBitacoras = function(tipoBitacora) { const bitacoras = obtenerBitacorasPorTipo(tipoBitacora); const grid = document.getElementById('bitacoraPrintGrid'); if (!grid) return; document.getElementById('bitPrintTitulo').textContent = 'Imprimir Bitácoras ' + (tipoBitacora === 'b2c' ? 'B2C' : 'AM/PM-ADM-QDM'); document.getElementById('bitPrintSubtitulo').textContent = 'Selecciona las bitácoras que deseas imprimir.'; let html = ''; bitacoras.forEach(function(bit, idx) { const data = bitacorasData[bit.key]; const tieneDatos = data && data.filas && data.filas.length > 0; const count = tieneDatos ? data.filas.filter(function(f) { return f && (f.requirente || f.documentos || f.cliente); }).length : 0; const label = bit.label + (count > 0 ? ' (' + count + ' registros)' : ''); html += '<div class="bitacora-export-item"><input type="checkbox" id="bitPrint_' + idx + '" ' + (tieneDatos ? 'checked' : '') + '><label for="bitPrint_' + idx + '">' + label + '</label></div>'; }); grid.innerHTML = html; grid.dataset.tipoBitacora = tipoBitacora; document.getElementById('bitacoraPrintOverlay').classList.add('show'); };
window.cerrarModalImprimirBitacoras = function() { document.getElementById('bitacoraPrintOverlay').classList.remove('show'); };
window.seleccionarTodasBitacorasPrint = function() { const checkboxes = document.querySelectorAll('#bitacoraPrintGrid input[type="checkbox"]'); const allChecked = Array.from(checkboxes).every(function(cb) { return cb.checked; }); checkboxes.forEach(function(cb) { cb.checked = !allChecked; }); };

// ✅ CORREGIDO: Eliminado <h1> duplicado
window.confirmarImprimirBitacoras = function() {
    const grid = document.getElementById('bitacoraPrintGrid');
    const tipoBitacora = grid.dataset.tipoBitacora || 'unificadas';
    const bitacoras = obtenerBitacorasPorTipo(tipoBitacora);
    const checkboxes = document.querySelectorAll('#bitacoraPrintGrid input[type="checkbox"]:checked');
    if (checkboxes.length === 0) { toast('Selecciona al menos una bitácora', 'err'); return; }
    let contenidoImpresion = '';
    const fecha = new Date().toLocaleDateString('es-CL');
    const tipoLabel = tipoBitacora === 'b2c' ? 'B2C' : 'AM/PM-ADM-QDM';
    checkboxes.forEach(function(cb) {
        const idx = parseInt(cb.id.replace('bitPrint_', ''));
        const bit = bitacoras[idx];
        const element = document.getElementById(bit.domId);
        if (!element) return;
        const clone = element.cloneNode(true);
        const inputs = clone.querySelectorAll('input');
        inputs.forEach(function(inp) { const span = document.createElement('span'); span.textContent = inp.value || ''; span.style.cssText = 'display:block;width:100%;padding:4px;font-family:Arial,sans-serif;font-size:11px;'; inp.parentNode.replaceChild(span, inp); });
        contenidoImpresion += '<div class="bitacora-print-page"><h2>Bitácora ' + bit.label + ' (' + tipoLabel + ') - Fecha: ' + fecha + '</h2>' + clone.innerHTML + '</div>';
    });
    const printWindow = window.open('', '_blank', 'width=1200,height=900');
    if (!printWindow) { toast('Bloqueador de popups activo', 'err'); return; }
    const html = '<!DOCTYPE html><html><head><title>Bitácoras ' + tipoLabel + '</title><style>@page { size: letter landscape; margin: 10mm; }* { margin: 0; padding: 0; box-sizing: border-box; }body { font-family: Arial, sans-serif; padding: 10mm; background: #fff; }.bitacora-print-page { page-break-after: always; margin-bottom: 20mm; }.bitacora-print-page:last-child { page-break-after: auto; }h2 { text-align: center; color: #1a5490; font-size: 18pt; margin-bottom: 12px; }table { width: 100%; border-collapse: collapse; margin-bottom: 12px; table-layout: auto; }th, td { border: 1px solid #333; padding: 6px 8px; text-align: left; font-size: 11pt; background: #fff; }th { background: #1a5490; color: white; font-weight: bold; }.no-print { text-align: center; margin-top: 15px; }.no-print button { padding: 8px 16px; font-size: 12pt; cursor: pointer; margin: 0 5px; border: 1px solid #ccc; background: #f0f0f0; border-radius: 3px; }@media print { body { padding: 0; } .no-print { display: none; } table { page-break-inside: avoid; } }</style></head><body>' + contenidoImpresion + '<div class="no-print"><button onclick="window.print()">Imprimir</button><button onclick="window.close()">Cerrar</button></div></body></html>';
    printWindow.document.write(html);
    printWindow.document.close();
    toast(checkboxes.length + ' bitácora(s) lista(s) para imprimir', 'ok');
    cerrarModalImprimirBitacoras();
    registrarActividad('EXPORTACION', 'Imprimió ' + checkboxes.length + ' bitácoras ' + tipoLabel, 'BITACORAS');
};

function procesarArchivoB2C(file, lista) { const ft = document.getElementById('fFecha').value || new Date().toISOString().split('T')[0]; toast('Leyendo ' + file.name + '...', 'info'); leerFilas(file, function(filas) { try { if (!filas || filas.length < 2) { toast('Archivo vacío','err'); return; } const enc = filas[0].map(normEnc); const col = { TRACKING: enc.findIndex(function(h) { return h.includes('TRACKING'); }), EMPRESA: enc.findIndex(function(h) { return h.includes('EMPRESA'); }), NOMBRE: enc.findIndex(function(h) { return h.includes('NOMBRE'); }), CELULAR: enc.findIndex(function(h) { return h.includes('CELULAR'); }), EMAIL: enc.findIndex(function(h) { return h.includes('EMAIL') || h.includes('MAIL'); }), DIRECCION: enc.findIndex(function(h) { return h.includes('DIRECCION'); }), COMUNA: enc.findIndex(function(h) { return h.includes('COMUNA'); }), VALOR: enc.findIndex(function(h) { return h.includes('VALOR'); }) }; const parts = ft.split('-'); const aT = parts[0]; const mT = parts[1]; const regs = []; for (let i = 1; i < filas.length; i++) { const row = filas[i]; if (!row || !row.length) continue; const gv = function(idx) { return (idx<0||idx>=row.length) ? '' : (row[idx]==null ? '' : row[idx]); }; const tr = String(gv(col.TRACKING)).trim(); if (!tr) continue; const comuna = canonComuna(gv(col.COMUNA)); regs.push({ anio:aT, mes:mT, reg: { fecha: ft, unidad: String(gv(col.EMPRESA)).trim(), idPedido: tr, nombre: String(gv(col.NOMBRE)).trim(), celular: String(gv(col.CELULAR)).trim(), email: String(gv(col.EMAIL)).trim(), direccion: limpiarDireccion(gv(col.DIRECCION), comuna), comuna: comuna, valor: parsearValor(gv(col.VALOR)), observacion: '', transporte: 'SERVICIO B2C', rango: 'B2C', otroPalet: false, tipo: 'B2C', esAdmin: rolActual === 'admin', usuario: emailUsuarioActual, creado: new Date().toISOString(), importado: true, transporteManual: false } }); } if (!regs.length) { toast('Sin filas con N° de tracking','err'); return; } if (lista) { lista.push.apply(lista, regs); paginaDesc = 1; toast(formatoEntero(regs.length) + ' filas B2C cargadas. Presiona GUARDAR.','info'); render(); } else cargarPendientes(regs, 'B2C (' + file.name + ')'); registrarActividad('SUBIDA_ARCHIVO', 'Subió archivo B2C: ' + file.name + ' (' + formatoEntero(regs.length) + ' registros)', 'B2C'); } catch(e){ toast(''+e.message,'err'); } }); }

window.importarExcelSegunSeccion = function() { modoImportActual = (seccionActiva === 'ampm') ? 'AMPM_DESC' : (seccionActiva === 'adm') ? 'ADM_DESC' : (seccionActiva === 'qdm') ? 'QDM_DESC' : 'B2C_DESC'; document.getElementById('importFile').click(); };
window.importarDesdeBD = function(tipo) { if (rolActual !== 'admin') { toast('Sin permiso','err'); return; } tipoImportacionActual = tipo; modoImportActual = tipo + '_BD'; document.getElementById('importFile').click(); };
document.getElementById('importFile').addEventListener('change', function(ev) { const file = ev.target.files[0]; if (!file) return; const n = file.name.toLowerCase(); if (esJSON(n)) { if (modoImportActual==='AMPM_DESC') procesarJSONAMPM(file); else if (modoImportActual==='ADM_DESC') procesarJSONAdm(file); else if (modoImportActual==='QDM_DESC') procesarJSONQdm(file); else procesarJSON(file); } else if (esExcel(n) || esCSV(n)) { if (modoImportActual==='AMPM_DESC') procesarArchivoAMPM(file); else if (modoImportActual==='ADM_DESC') procesarArchivoAdm(file); else if (modoImportActual==='QDM_DESC') procesarArchivoQdm(file); else if (modoImportActual==='B2C_DESC') procesarArchivoB2C(file, pendientesB2C); else procesarArchivoGenerico(file, modoImportActual.replace('_BD','')); } else toast('Formato no soportado','err'); ev.target.value = ''; });

function procesarArchivoAMPM(file) { procesarArchivoTipoSeccion(file, 'AMPM', pendientesAMPM); }
function procesarArchivoAdm(file) { procesarArchivoTipoSeccion(file, 'ADM', pendientesADM); }
function procesarArchivoQdm(file) { procesarArchivoTipoSeccion(file, 'QDM', pendientesQDM); }

function procesarArchivoTipoSeccion(file, tipo, lista) {
    const ft = document.getElementById('fFecha').value || new Date().toISOString().split('T')[0];
    toast('Leyendo ' + file.name + '...','info');
    const aplicarReglaPM = esAntesDe1400();
    const aplicarReglaAM = esDespuesDe1401();
    if (aplicarReglaPM) { toast('Antes de 14:00 - Aplicando REGLA PM', 'info'); }
    else if (aplicarReglaAM) { const diaManana = obtenerDiaSemanaManana(); const nombresDia = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado']; toast('Después de 14:01 - Aplicando REGLA AM para ' + nombresDia[diaManana], 'info'); }
    leerFilas(file, function(filas) {
        try {
            if (!filas || filas.length < 2) { toast('Archivo vacío','err'); return; }
            const enc = filas[0].map(normEnc);
            const col = { EMPRESA: enc.findIndex(function(h){return h.includes('EMPRESA');}), TRACKING: enc.findIndex(function(h){return h.includes('TRACKING');}), NOMBRE: enc.findIndex(function(h){return h.includes('NOMBRE');}), DIRECCION: enc.findIndex(function(h){return h.includes('DIRECCION');}), COMUNA: enc.findIndex(function(h){return h.includes('COMUNA');}), VALOR: enc.findIndex(function(h){return h.includes('VALOR');}), OBS: enc.findIndex(function(h){return h.includes('OBSERVACION');}) };
            const parts = ft.split('-'); const aT = parts[0]; const mT = parts[1];
            const nuevos = [];
            for (let i=1;i<filas.length;i++){
                const row = filas[i]; if (!row || !row.length) continue;
                const gv = function(idx) { return (idx<0||idx>=row.length) ? '' : (row[idx]==null ? '' : row[idx]); };
                const tr = String(gv(col.TRACKING)).trim(); if (!tr) continue;
                const comuna = canonComuna(gv(col.COMUNA));
                let reg = { fecha: ft, unidad: String(gv(col.EMPRESA)).trim(), idPedido: tr, nombre: String(gv(col.NOMBRE)).trim(), direccion: limpiarDireccion(gv(col.DIRECCION), comuna), comuna: comuna, valor: parsearValor(gv(col.VALOR)), observacion: String(gv(col.OBS)).trim().toUpperCase(), transporte:'', rango:'', otroPalet:false, tipo: tipo, esAdmin: rolActual === 'admin', usuario: emailUsuarioActual, creado: new Date().toISOString(), importado: true, transporteManual: false };
                if (aplicarReglaPM) { reg = autocompletarTransportePM(reg); }
                else if (aplicarReglaAM) { const diaManana = obtenerDiaSemanaManana(); reg = autocompletarTransporteAM(reg, diaManana); }
                nuevos.push({ anio:aT, mes:mT, key:'pend_'+Date.now()+'_'+i+'_'+Math.random().toString(36).substr(2,5), reg: reg });
            }
            if (!nuevos.length) { toast('Sin filas con tracking','err'); return; }
            lista.push.apply(lista, nuevos); paginaDesc = 1;
            toast(formatoEntero(nuevos.length) + ' filas. Revisa TRANSPORTE/RANGO y presiona GUARDAR.','info');
            render();
            registrarActividad('SUBIDA_ARCHIVO', 'Subió archivo ' + tipo + ': ' + file.name + ' (' + formatoEntero(nuevos.length) + ' registros)', tipo);
        } catch(e){ toast(''+e.message,'err'); }
    });
}

function procesarJSONAMPM(file) { procesarJSONTipoSeccion(file, 'AMPM', pendientesAMPM); }
function procesarJSONAdm(file) { procesarJSONTipoSeccion(file, 'ADM', pendientesADM); }
function procesarJSONQdm(file) { procesarJSONTipoSeccion(file, 'QDM', pendientesQDM); }

function procesarJSONTipoSeccion(file, tipo, lista) {
    const ft = document.getElementById('fFecha').value || new Date().toISOString().split('T')[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const obj = JSON.parse(e.target.result);
            let arr = Array.isArray(obj) ? obj : (Array.isArray(obj.registros) ? obj.registros : (Array.isArray(obj.datos) ? obj.datos : null));
            if (!arr) { toast('JSON debe ser lista','err'); return; }
            const parts = ft.split('-'); const aT = parts[0]; const mT = parts[1];
            const nuevos = [];
            const aplicarReglaPM = esAntesDe1400();
            const aplicarReglaAM = esDespuesDe1401();
            arr.forEach(function(o,i) {
                const m = {}; Object.keys(o).forEach(function(k) { m[normEnc(k)] = o[k]; });
                const gi = function() { const subs = Array.from(arguments); for (const k of Object.keys(m)) { for (const s of subs) { if (k.includes(s)) { const v = m[k]; if (v!=null && String(v).trim()!=='') return String(v); } } } return ''; };
                const tr = gi('TRACKING','ID PEDIDO','IDPEDIDO'); if (!tr) return;
                const comuna = canonComuna(gi('COMUNA'));
                let reg = { fecha: ft, unidad: gi('EMPRESA','UNIDAD'), idPedido: tr, nombre: gi('NOMBRE'), direccion: limpiarDireccion(gi('DIRECCION'), comuna), comuna: comuna, valor: parsearValor(gi('VALOR')), observacion: gi('OBSERVACION').toUpperCase(), transporte: gi('TRANSPORTE'), rango: (gi('RANGO')||'').toUpperCase(), otroPalet:false, tipo: tipo, esAdmin: rolActual === 'admin', usuario: emailUsuarioActual, creado: new Date().toISOString(), importado: true, transporteManual: false };
                if (aplicarReglaPM && !reg.transporte) { reg = autocompletarTransportePM(reg); }
                else if (aplicarReglaAM && !reg.transporte) { const diaManana = obtenerDiaSemanaManana(); reg = autocompletarTransporteAM(reg, diaManana); }
                nuevos.push({ anio:aT, mes:mT, key:'pend_'+Date.now()+'_'+i+'_'+Math.random().toString(36).substr(2,5), reg: reg });
            });
            if (!nuevos.length) { toast('JSON sin registros válidos','err'); return; }
            lista.push.apply(lista, nuevos); paginaDesc = 1;
            toast(formatoEntero(nuevos.length) + ' registros JSON. Presiona GUARDAR.','info');
            render();
            registrarActividad('SUBIDA_ARCHIVO', 'Subió JSON ' + tipo + ': ' + file.name + ' (' + formatoEntero(nuevos.length) + ' registros)', tipo);
        } catch(e){ toast('JSON inválido','err'); }
    };
    reader.readAsText(file);
}

function procesarArchivoGenerico(file, tipo) {
    tipoImportacionActual = tipo;
    const mesAnio = detectarMesAnioDesdeNombre(file.name);
    const mA = mesAnio.mes; const aA = mesAnio.anio;
    toast('Leyendo ' + file.name + '...','info');
    const aplicarReglaPM = esAntesDe1400();
    const aplicarReglaAM = esDespuesDe1401();
    leerFilas(file, function(filas) {
        try {
            if (!filas || filas.length < 2) { toast('Archivo vacío','err'); return; }
            const enc = filas[0].map(normEnc);
            let idxID = enc.findIndex(function(h) { return h.includes('PEDIDO') && h.includes('ID') && !h.includes('N°') && !h.includes('NRO') && !h.includes('NUM') && !h.includes('NUMBER'); });
            if (idxID < 0) idxID = enc.findIndex(function(h) { return h.includes('PEDIDO'); });
            const col = { FECHA: enc.findIndex(function(h){return h.includes('FECHA');}), UNIDAD: enc.findIndex(function(h){return h.includes('UNIDAD')||h.includes('NEGOCIO');}), ID: idxID, NOMBRE: enc.findIndex(function(h){return h.includes('NOMBRE');}), DIRECCION: enc.findIndex(function(h){return h.includes('DIRECCION');}), COMUNA: enc.findIndex(function(h){return h.includes('COMUNA');}), VALOR: enc.findIndex(function(h){return h.includes('VALOR');}), OBS: enc.findIndex(function(h){return h.includes('OBSERVACION');}), TRANSPORTE: enc.findIndex(function(h){return h.includes('TRANSPORTE')||h.includes('MOVIL');}), RANGO: enc.findIndex(function(h){return h.includes('RANGO')||h.includes('TURNO');}) };
            const regs = []; let sinF = 0;
            for (let i=1;i<filas.length;i++){
                const row = filas[i]; if (!row || !row.length) continue;
                const gv = function(idx) { return (idx<0||idx>=row.length) ? '' : (row[idx]==null ? '' : row[idx]); };
                const fr = col.FECHA>=0 ? gv(col.FECHA) : gv(0); if (fr === '') continue;
                let fecha = null;
                if (typeof fr === 'number' && Number.isInteger(fr) && fr>=1 && fr<=31) { if (mA&&aA) fecha = aA + '-' + mA + '-' + String(fr).padStart(2,'0'); }
                else { fecha = parsearFecha(fr); if (!fecha && mA&&aA){ const d = parseInt(String(fr).trim()); if (!isNaN(d)&&d>=1&&d<=31) fecha = aA + '-' + mA + '-' + String(d).padStart(2,'0'); } }
                if (!fecha) { sinF++; continue; }
                const parts = fecha.split('-'); const anio = parts[0]; const mes = parts[1];
                const rango = String(gv(col.RANGO)).trim().toUpperCase();
                const comuna = canonComuna(gv(col.COMUNA));
                let reg = { anio: anio, mes: mes, reg: { fecha: fecha, unidad: String(gv(col.UNIDAD)).trim(), idPedido: String(gv(col.ID)).trim(), nombre: String(gv(col.NOMBRE)).trim(), direccion: limpiarDireccion(gv(col.DIRECCION), comuna), comuna: comuna, valor: parsearValor(gv(col.VALOR)), observacion: String(gv(col.OBS)).trim(), transporte: String(gv(col.TRANSPORTE)).trim(), rango: rango || (tipo==='B2C'?'B2C':(tipo==='ADM'?'ADM':(tipo==='QDM'?'QDM':'AM'))), otroPalet:false, tipo: tipo, esAdmin: rolActual === 'admin', usuario: emailUsuarioActual, creado: new Date().toISOString(), importado:true, transporteManual: false } };
                if (aplicarReglaPM && !reg.reg.transporte) { reg.reg = autocompletarTransportePM(reg.reg); }
                else if (aplicarReglaAM && !reg.reg.transporte) { const diaManana = obtenerDiaSemanaManana(); reg.reg = autocompletarTransporteAM(reg.reg, diaManana); }
                regs.push(reg);
            }
            if (sinF) toast(formatoEntero(sinF) + ' filas sin fecha válida','err');
            cargarPendientes(regs, tipo + ' (' + file.name + ')');
            registrarActividad('SUBIDA_ARCHIVO', 'Subió archivo genérico ' + tipo + ': ' + file.name, tipo);
        } catch(e){ toast(''+e.message,'err'); }
    });
}

function procesarJSON(file) { toast('Leyendo JSON: ' + file.name + '...','info'); const r = new FileReader(); r.onload = function(e) { try { const obj = JSON.parse(e.target.result); cargarPendientes(extraerRegsDesdeJSON(obj), 'JSON'); } catch(e){ toast('JSON inválido','err'); } }; r.readAsText(file); }

function extraerRegsDesdeJSON(obj) {
    const out = [];
    const esA = function(k) { return /^20\d{2}$/.test(k); };
    const esM = function(k) { return /^(0[1-9]|1[0-2])$/.test(k); };
    const proc = function(n) { Object.keys(n).forEach(function(a) { if (!esA(a)) return; const ms = n[a]; if (typeof ms !== 'object') return; Object.keys(ms).forEach(function(m) { if (!esM(m)) return; const rs = ms[m]; if (typeof rs !== 'object') return; Object.keys(rs).forEach(function(k) { const r = rs[k]; if (r && r.fecha) out.push({ anio:a, mes:m, reg:Object.assign({}, r) }); }); }); }); };
    if (Array.isArray(obj)) { obj.forEach(function(r) { if (r && r.fecha) { const parts = String(r.fecha).split('-'); out.push({ anio:parts[0], mes:parts[1], reg:Object.assign({}, r) }); } }); return out; }
    if (Object.keys(obj).some(esA)) { proc(obj); return out; }
    Object.keys(obj).forEach(function(k) { const v = obj[k]; if (v && typeof v==='object' && !Array.isArray(v) && Object.keys(v).some(esA)) proc(v); });
    return out;
}

function cargarPendientes(regs, origen) { if (!regs.length) { toast('Sin registros válidos','err'); return; } regs.forEach(function(item) { const anio = item.anio; const mes = item.mes; const reg = item.reg; if (!reg.tipo) reg.tipo = tipoImportacionActual; if (!reg.rango) reg.rango = tipoImportacionActual==='B2C'?'B2C':(tipoImportacionActual==='ADM'?'ADM':(tipoImportacionActual==='QDM'?'QDM':'AM')); if (reg.comuna) reg.comuna = canonComuna(reg.comuna); if (!cache[anio]) cache[anio] = {}; if (!cache[anio][mes]) cache[anio][mes] = {}; const tk = 'pend_'+Date.now()+'_'+Math.random().toString(36).substr(2,9); cache[anio][mes][tk] = reg; pendientes.push({ anio: anio, mes: mes, reg: reg }); }); actualizarPendientesInfo(); render(); renderizarBaseDatos(); toast(formatoEntero(regs.length) + ' registros (' + origen + '). Guardando...','info'); guardarPendientesEnFirebase(); }
function actualizarPendientesInfo() { const nA = pendientes.filter(function(p){return p.reg.tipo==='AMPM';}).length; const nB = pendientes.filter(function(p){return p.reg.tipo==='B2C';}).length; const nAdm = pendientes.filter(function(p){return p.reg.tipo==='ADM';}).length; const nQdm = pendientes.filter(function(p){return p.reg.tipo==='QDM';}).length; const a = document.getElementById('pendientesAmpm'); const b = document.getElementById('pendientesB2c'); const ad = document.getElementById('pendientesAdm'); const qd = document.getElementById('pendientesQdm'); if (a) a.textContent = nA>0 ? 'Guardando: ' + formatoEntero(nA) : ''; if (b) b.textContent = nB>0 ? 'Guardando: ' + formatoEntero(nB) : ''; if (ad) ad.textContent = nAdm>0 ? 'Guardando: ' + formatoEntero(nAdm) : ''; if (qd) qd.textContent = nQdm>0 ? 'Guardando: ' + formatoEntero(nQdm) : ''; }

function guardarPendientesEnFirebase() {
    if (!pendientes.length) return;
    const total = pendientes.length; const por = pendientes.slice();
    let g = 0; let f = 0; let li = 0;
    const lotes = []; for (let i=0;i<por.length;i+=50) lotes.push(por.slice(i,i+50));
    const proc = function() { if (li >= lotes.length) { if (f) { toast('Guardados ' + g + ', FALLIDOS ' + f,'err'); return; } pendientes = []; actualizarPendientesInfo(); verificarGuardado(); return; } Promise.all(lotes[li].map(function(p) { return push(ref(db, RUTA_BASE + '/' + p.anio + '/' + p.mes), p.reg).then(function(){g++;}).catch(function(e){f++;}); })).then(function(){ li++; setTimeout(proc,100); }); };
    proc();
}

async function verificarGuardado() { const anios = [2026,2027,2028,2029,2030]; const t = []; anios.forEach(function(a) { for (let m=1;m<=12;m++){ const ms = String(m).padStart(2,'0'); t.push(get(ref(db, RUTA_BASE + '/' + a + '/' + ms)).then(function(s){return s.val();}).catch(function(){return null;})); } }); const res = await Promise.all(t); let total = 0; res.forEach(function(v) { if (v) total += Object.keys(v).length; }); toast('Verificado: ' + formatoEntero(total) + ' registros en Firebase','ok'); cargarDatos(); }
window.guardarEnFirebase = function() { if (rolActual !== 'admin') { toast('Sin permiso','err'); return; } if (!pendientes.length) { toast('Todo guardado','info'); return; } toast('Guardando pendientes...','info'); guardarPendientesEnFirebase(); };

function obtenerRegsTipo(tipo) { const r = []; Object.keys(cache).forEach(function(a) { Object.keys(cache[a]||{}).forEach(function(m) { Object.keys(cache[a][m]).forEach(function(k) { const r2 = { key:k, anio:a, mes:m }; Object.keys(cache[a][m][k]).forEach(function(key) { r2[key] = cache[a][m][k][key]; }); if (getTipoRegistro(r2) === tipo) r.push(r2); }); }); }); return ordenarPorFechaYId(r); }
function obtenerRegsFiltradosBD(tipo) { let r = obtenerRegsTipo(tipo); if (filtroDiaBD[tipo].d) r = r.filter(function(x) { return (x.fecha||'').split('-')[2] === filtroDiaBD[tipo].d; }); if (filtroMesBD[tipo].m) r = r.filter(function(x) { return x.mes === filtroMesBD[tipo].m; }); if (filtroAnioBD[tipo].a) r = r.filter(function(x) { return x.anio === filtroAnioBD[tipo].a; }); return r; }

window.abrirModalVerFecha = function(tipo) { if (rolActual !== 'admin') { toast('Sin permiso','err'); return; } tipoVerFechaActual = tipo; document.getElementById('vfTipo').value = tipo; document.getElementById('vfDia').value = filtroDiaBD[tipo].d; document.getElementById('vfMes').value = filtroMesBD[tipo].m; document.getElementById('vfAnio').value = filtroAnioBD[tipo].a; document.getElementById('verFechaOverlay').classList.add('show'); };
window.cerrarModalVerFecha = function() { document.getElementById('verFechaOverlay').classList.remove('show'); };
window.confirmarVerFecha = function() { const t = tipoVerFechaActual; const d = document.getElementById('vfDia').value; const m = document.getElementById('vfMes').value; const a = document.getElementById('vfAnio').value; if (d && !m) { toast('Si eliges Día, también Mes','err'); return; } filtroDiaBD[t] = {d:d, m:m, a:a}; const pagMap = { AMPM: 'paginaBDAmpm', B2C: 'paginaBDB2c', ADM: 'paginaBDAdm', QDM: 'paginaBDQdm' }; if (pagMap[t]) window[pagMap[t]] = 1; const fd = document.getElementById('fFecha'); if (m && a) fd.value = a + '-' + m + '-' + (d || '01'); cerrarModalVerFecha(); renderizarBaseDatos(); render(); toast('Mostrando: ' + textoPeriodo(t),'info'); };
function textoPeriodo(t) { const f = filtroDiaBD[t]; if (f.d && f.m) return 'Día ' + parseInt(f.d) + ' de ' + MESES_NOM[parseInt(f.m)-1] + (f.a?' '+f.a:''); if (f.m) return MESES_NOM[parseInt(f.m)-1] + (f.a?' '+f.a:''); if (f.a) return 'Año ' + f.a; return 'Todos'; }
function renderizarBaseDatos() { if (rolActual !== 'admin') return; renderTabBD('AMPM', document.getElementById('filtroIdAmpm').value, paginaBDAmpm); renderTabBD('B2C', document.getElementById('filtroIdB2c').value, paginaBDB2c); renderTabBD('ADM', document.getElementById('filtroIdAdm').value, paginaBDAdm); renderTabBD('QDM', document.getElementById('filtroIdQdm').value, paginaBDQdm); }
function claseYIndicadorSimple(r, cf, cg) { const id = (r.idPedido||'').toString().trim().toUpperCase(); const k = (r.fecha||'') + '|' + id; const misma = id && cf[k] > 1; const otra = !misma && id && cg[id] > 1; let c = '', i = ''; if (misma){ c='id-repetido'; i='<span style="color:#fff;background:#e74c3c;padding:2px 6px;border-radius:4px;font-size:.7em;font-weight:700">x' + cf[k] + '</span>'; } else if (otra){ c='id-repetido-otro'; i='<span style="color:#fff;background:#ff8c00;padding:2px 6px;border-radius:4px;font-size:.7em;font-weight:700">x' + cg[id] + '</span>'; } return { clase:c, ind:i }; }

function renderBDThead(tipo) {
    const suf = sufBD(tipo);
    const thead = document.getElementById('thead'+suf);
    if (!thead) return;
    const filtroUnidad = '<input type="text" class="th-filter" id="fBD' + suf + '_unidad" placeholder="Filtrar..." style="width:100px" oninput="filtrarBDCombo(\'' + tipo + '\',\'unidad\', this.value)" onfocus="abrirComboBD(\'' + tipo + '\',\'unidad\')">';
    const filtroComuna = '<input type="text" class="th-filter" id="fBD' + suf + '_comuna" placeholder="Filtrar..." style="width:100px" oninput="filtrarBDCombo(\'' + tipo + '\',\'comuna\', this.value)" onfocus="abrirComboBD(\'' + tipo + '\',\'comuna\')">';
    const filtroTransporte = '<input type="text" class="th-filter" id="fBD' + suf + '_transporte" placeholder="Filtrar..." style="width:100px" oninput="filtrarBDCombo(\'' + tipo + '\',\'transporte\', this.value)" onfocus="abrirComboBD(\'' + tipo + '\',\'transporte\')">';
    const filtroRango = '<input type="text" class="th-filter" id="fBD' + suf + '_rango" placeholder="Filtrar..." style="width:80px" oninput="filtrarBDCombo(\'' + tipo + '\',\'rango\', this.value)" onfocus="abrirComboBD(\'' + tipo + '\',\'rango\')">';
    thead.innerHTML = '<tr><th rowspan="2" style="text-align:center;vertical-align:middle">Fecha</th><th style="text-align:center;vertical-align:middle">Unidad Negocio</th><th rowspan="2" style="text-align:center;vertical-align:middle">ID Pedido</th><th rowspan="2" style="text-align:center;vertical-align:middle">Nombre Cliente</th><th rowspan="2" style="text-align:center;vertical-align:middle">Direccion</th><th style="text-align:center;vertical-align:middle">Comuna</th><th rowspan="2" style="text-align:center;vertical-align:middle">Valor</th><th rowspan="2" style="text-align:center;vertical-align:middle">Observacion</th><th style="text-align:center;vertical-align:middle">Transporte</th><th style="text-align:center;vertical-align:middle">Rango</th><th rowspan="2" style="text-align:center;vertical-align:middle">Acciones</th></tr><tr><td style="text-align:center;padding:4px">' + filtroUnidad + '</td><td style="text-align:center;padding:4px">' + filtroComuna + '</td><td style="text-align:center;padding:4px">' + filtroTransporte + '</td><td style="text-align:center;padding:4px">' + filtroRango + '</td></tr>';
}

function renderTabBD(tipo, filtroId, pagina) {
    const suf = sufBD(tipo);
    if (!theadBDConstruidos[suf]) { renderBDThead(tipo); theadBDConstruidos[suf] = true; }
    let regs = obtenerRegsFiltradosBD(tipo);
    if (filtroId) { const f = filtroId.toUpperCase().trim(); regs = regs.filter(function(r) { return (r.idPedido||'').toString().toUpperCase().includes(f); }); }
    const fd = filtroDescBD[tipo];
    if (fd.unidad) regs = regs.filter(function(r) { return normSinTildes(r.unidad||'').includes(fd.unidad); });
    if (fd.comuna) regs = regs.filter(function(r) { return normSinTildes(canonComuna(r.comuna)||'').includes(fd.comuna); });
    if (fd.transporte) regs = regs.filter(function(r) { return normSinTildes(r.transporte||'').includes(fd.transporte); });
    if (fd.rango) regs = regs.filter(function(r) { return normSinTildes(r.rango||'').includes(fd.rango); });
    const rd = document.getElementById('bdResumen'+suf);
    if (rd) { const suma = sumaValores(regs); const n1 = conteoUnPeso(regs); rd.innerHTML = '<span class="res-periodo">Viendo: <strong>' + textoPeriodo(tipo) + '</strong></span><span>Valor total: <strong>' + formatoMoneda(suma) + '</strong>' + (n1?'<small>(sin ' + formatoEntero(n1) + ' de $1)</small>':'') + '</span><span>Pedidos: <strong>' + formatoEntero(regs.length) + '</strong></span><span class="res-am">AM: <strong>' + formatoEntero(regs.filter(function(r){return r.rango==='AM';}).length) + '</strong></span><span class="res-pm">PM: <strong>' + formatoEntero(regs.filter(function(r){return r.rango==='PM';}).length) + '</strong></span>'; }
    const tbody = document.getElementById('bdTbody'+suf);
    const pagDiv = document.getElementById('bdPaginacion'+suf);
    if (!regs.length) { tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:40px;color:var(--text-muted)">No hay registros</td></tr>'; pagDiv.innerHTML = ''; return; }
    const tp = Math.max(1, Math.ceil(regs.length / REGISTROS_POR_PAGINA_BD));
    if (pagina > tp) pagina = tp; if (pagina < 1) pagina = 1;
    const pagMap = { AMPM: 'paginaBDAmpm', B2C: 'paginaBDB2c', ADM: 'paginaBDAdm', QDM: 'paginaBDQdm' };
    if (pagMap[tipo]) window[pagMap[tipo]] = pagina;
    const ini = (pagina-1)*REGISTROS_POR_PAGINA_BD; const pag = regs.slice(ini, ini+REGISTROS_POR_PAGINA_BD);
    const cf = detectarIdsRepetidosPorFecha(regs), cg = detectarIdsRepetidosGlobal(regs);
    tbody.innerHTML = pag.map(function(r) { const claseYInd = claseYIndicadorSimple(r, cf, cg); const claseAdmin = r.esAdmin ? ' fila-admin' : ''; const badgeAdmin = r.esAdmin ? ' <span class="badge badge-admin">ADMIN</span>' : ''; return '<tr class="' + claseYInd.clase + claseAdmin + '"><td>' + fmtFecha(r.fecha) + '</td><td><span class="badge badge-unidad">' + (r.unidad||'') + '</span></td><td><strong>' + (r.idPedido||'') + '</strong>' + claseYInd.ind + badgeAdmin + '</td><td>' + (r.nombre||'') + '</td><td>' + dirDe(r) + '</td><td>' + canonComuna(r.comuna) + '</td><td>' + formatoMonedaAlineado(r.valor) + '</td><td>' + (r.observacion||'') + '</td><td>' + (r.transporte||'') + '</td><td><span class="badge badge-' + (r.rango||'').toLowerCase() + '">' + (r.rango||'') + '</span></td><td class="td-acciones"><button class="btn-acc" onclick="pedirEditarRegistroBD(\'' + r.key + '\',\'' + r.anio + '\',\'' + r.mes + '\')">✏️</button><button class="btn-acc btn-borrar" onclick="pedirBorrarRegistroBD(\'' + r.key + '\',\'' + r.anio + '\',\'' + r.mes + '\')" title="Eliminar">🗑️</button></td></tr>'; }).join('');
    if (tp <= 1) { pagDiv.innerHTML = '<div class="bd-paginacion-info">Mostrando ' + formatoEntero(regs.length) + ' de ' + formatoEntero(regs.length) + '</div>'; return; }
    let h = '<div class="bd-paginacion-info">Pagina ' + pagina + ' de ' + tp + ' | ' + formatoEntero(ini+1) + '-' + formatoEntero(Math.min(ini+REGISTROS_POR_PAGINA_BD, regs.length)) + ' de ' + formatoEntero(regs.length) + '</div>';
    h += pagina>1 ? '<button class="btn-bd-pag-nav" onclick="irPaginaBD(\'' + tipo + '\',' + (pagina-1) + ')">‹ Anterior</button>' : '<button class="btn-bd-pag-nav" disabled>‹ Anterior</button>';
    const pI = Math.max(1,pagina-2), pF = Math.min(tp,pagina+2);
    if (pI>1){ h += '<button class="btn-bd-pag" onclick="irPaginaBD(\'' + tipo + '\',1)">1</button>'; if(pI>2) h += '<span style="color:var(--text-muted)">...</span>'; }
    for (let i=pI;i<=pF;i++) h += i===pagina ? '<button class="btn-bd-pag activa">' + i + '</button>' : '<button class="btn-bd-pag" onclick="irPaginaBD(\'' + tipo + '\',' + i + ')">' + i + '</button>';
    if (pF<tp){ if(pF<tp-1) h += '<span style="color:var(--text-muted)">...</span>'; h += '<button class="btn-bd-pag" onclick="irPaginaBD(\'' + tipo + '\',' + tp + ')">' + tp + '</button>'; }
    h += pagina<tp ? '<button class="btn-bd-pag-nav" onclick="irPaginaBD(\'' + tipo + '\',' + (pagina+1) + ')">Siguiente ›</button>' : '<button class="btn-bd-pag-nav" disabled>Siguiente ›</button>';
    pagDiv.innerHTML = h;
}

window.irPaginaBD = function(t,p) { if (rolActual !== 'admin') return; const pagMap = { AMPM: 'paginaBDAmpm', B2C: 'paginaBDB2c', ADM: 'paginaBDAdm', QDM: 'paginaBDQdm' }; if (pagMap[t]) window[pagMap[t]] = p; renderizarBaseDatos(); };
window.filtrarBD = function(t) { if (rolActual !== 'admin') return; const pagMap = { AMPM: 'paginaBDAmpm', B2C: 'paginaBDB2c', ADM: 'paginaBDAdm', QDM: 'paginaBDQdm' }; if (pagMap[t]) window[pagMap[t]] = 1; renderizarBaseDatos(); };
window.pedirEditarRegistroBD = function(key, anio, mes) { pedirClave(function() { editandoKey = key; render(); renderizarBaseDatos(); }); };

window.guardarEdicionInline = function(key, anio, mes, esPend) {
    const gv = function(id) { const el = document.getElementById(id); return el ? el.value : ''; };
    const nuevo = { fecha: gv('edi_fecha'), unidad: gv('edi_unidad'), idPedido: gv('edi_id'), nombre: gv('edi_nombre'), direccion: gv('edi_direccion'), comuna: canonComuna(gv('edi_comuna')), valor: parseFloat(gv('edi_valor'))||0, observacion: gv('edi_obs'), transporte: gv('edi_transporte'), rango: gv('edi_rango') };
    nuevo.tipo = gv('edi_rango') === 'B2C' ? 'B2C' : (gv('edi_rango') === 'ADM' ? 'ADM' : (gv('edi_rango') === 'QDM' ? 'QDM' : 'AMPM'));
    if (document.getElementById('edi_celular')) nuevo.celular = gv('edi_celular');
    if (document.getElementById('edi_email')) nuevo.email = gv('edi_email');
    const parts = (nuevo.fecha||'').split('-'); const nA = parts[0]; const nM = parts[1];
    if (cache[anio] && cache[anio][mes] && cache[anio][mes][key]) {
        const transporteAnterior = cache[anio][mes][key].transporte;
        const esManual = cache[anio][mes][key].transporteManual;
        if (nuevo.transporte !== transporteAnterior) { nuevo.transporteManual = true; } else { nuevo.transporteManual = esManual; }
        nuevo.esAdmin = cache[anio][mes][key].esAdmin;
        nuevo.usuario = cache[anio][mes][key].usuario;
        cache[anio][mes][key] = Object.assign({}, cache[anio][mes][key], nuevo);
    }
    if (nA && nM && (nA!==anio || nM!==mes)) { if (cache[anio] && cache[anio][mes]) delete cache[anio][mes][key]; if (!cache[nA]) cache[nA] = {}; if (!cache[nA][nM]) cache[nA][nM] = {}; cache[nA][nM][key] = Object.assign({}, nuevo); remove(ref(db, RUTA_BASE + '/' + anio + '/' + mes + '/' + key)); set(ref(db, RUTA_BASE + '/' + nA + '/' + nM + '/' + key), nuevo); }
    else { update(ref(db, RUTA_BASE + '/' + anio + '/' + mes + '/' + key), nuevo); }
    editandoKey = null; toast('Registro actualizado','ok'); render(); renderizarBaseDatos();
    registrarActividad('EDICION', 'Editó registro ' + key, tipoDeSeccion());
};

window.cancelarEdicionInline = function() { editandoKey = null; render(); renderizarBaseDatos(); };

window.pedirBorrarRegistroBD = function(key, anio, mes) {
    pedirClave(function() {
        if (!confirm('El registro se eliminará permanentemente.\n¿Confirmas?')) return;
        if (cache[anio] && cache[anio][mes] && cache[anio][mes][key]) { delete cache[anio][mes][key]; }
        remove(ref(db, RUTA_BASE + '/' + anio + '/' + mes + '/' + key)).then(function(){ toast('Eliminado de plataforma y Firebase','ok'); render(); renderizarBaseDatos(); }).catch(function(e) { toast('Error: ' + e.message, 'err'); });
        registrarActividad('ELIMINACION', 'Eliminó registro ' + key + ' de BD', tipoDeSeccion());
    });
};

window.abrirModalBorrarDescripcion = function(tipo) { if (rolActual !== 'admin') { toast('Solo el administrador', 'err'); return; } document.getElementById('bdTipoDesc').textContent = tipo || tipoDeSeccion(); let total = 0; const tipoBusqueda = tipo || tipoDeSeccion(); Object.keys(cache).forEach(function(a) { Object.keys(cache[a]||{}).forEach(function(m) { Object.keys(cache[a][m]||{}).forEach(function(k) { if (getTipoRegistro(cache[a][m][k]) === tipoBusqueda) total++; }); }); }); document.getElementById('bdInfoRegistros').textContent = 'Registros de ' + tipoBusqueda + ' a eliminar: ' + formatoEntero(total); document.getElementById('bdPassword').value = ''; document.getElementById('borrarDescOverlay').classList.add('show'); };
window.cerrarModalBorrarDesc = function() { document.getElementById('borrarDescOverlay').classList.remove('show'); };

// ✅ CORREGIDO: \n escapado
window.confirmarBorrarDesc = function() {
    const p = document.getElementById('bdPassword').value;
    if (p !== CLAVE_ACCIONES) { toast('Contraseña incorrecta','err'); return; }
    const tipo = document.getElementById('bdTipoDesc').textContent;
    if (!confirm('¿Eliminar TODOS los registros de ' + tipo + '?\nLas BITACORAS NO serán afectadas.')) return;
    toast('Eliminando descripción ' + tipo + '...','info');
    const promesas = []; const keysAEliminar = [];
    Object.keys(cache).forEach(function(a) { Object.keys(cache[a]||{}).forEach(function(m) { Object.keys(cache[a][m]||{}).forEach(function(k) { if (getTipoRegistro(cache[a][m][k]) === tipo) { keysAEliminar.push({ anio: a, mes: m, key: k }); } }); }); });
    keysAEliminar.forEach(function(item) { promesas.push(remove(ref(db, RUTA_BASE + '/' + item.anio + '/' + item.mes + '/' + item.key)).catch(function(){})); });
    keysAEliminar.forEach(function(item) { if (cache[item.anio] && cache[item.anio][item.mes]) { delete cache[item.anio][item.mes][item.key]; } });
    if (tipo === 'AMPM') pendientesAMPM = []; else if (tipo === 'ADM') pendientesADM = []; else if (tipo === 'QDM') pendientesQDM = []; else if (tipo === 'B2C') pendientesB2C = [];
    Promise.all(promesas).then(function() { toast(formatoEntero(keysAEliminar.length) + ' registros de ' + tipo + ' eliminados','ok'); cerrarModalBorrarDesc(); render(); renderizarBaseDatos(); registrarActividad('BORRADO_MASIVO', 'Eliminó toda la descripción ' + tipo + ' (' + formatoEntero(keysAEliminar.length) + ' registros)', tipo); }).catch(function(e) { toast('Error: ' + e.message, 'err'); });
};

window.abrirModalBorrarDescripcionActual = function() { abrirModalBorrarDescripcion(tipoDeSeccion()); };
window.abrirModalEliminarAdmin = function() { if (rolActual !== 'admin') { toast('Solo el administrador', 'err'); return; } let totalAdmin = 0; Object.keys(cache).forEach(function(a) { Object.keys(cache[a]||{}).forEach(function(m) { Object.keys(cache[a][m]||{}).forEach(function(k) { if (cache[a][m][k] && cache[a][m][k].esAdmin) totalAdmin++; }); }); }); [pendientesAMPM, pendientesADM, pendientesQDM, pendientesB2C].forEach(function(lista) { lista.forEach(function(p) { if (p.reg && p.reg.esAdmin) totalAdmin++; }); }); document.getElementById('eaInfoRegistros').textContent = 'Total de registros ADMIN (verde) a eliminar: ' + formatoEntero(totalAdmin); document.getElementById('eaPassword').value = ''; document.getElementById('eliminarAdminOverlay').classList.add('show'); };
window.cerrarModalEliminarAdmin = function() { document.getElementById('eliminarAdminOverlay').classList.remove('show'); };

// ✅ CORREGIDO: \n escapado
window.confirmarEliminarAdmin = function() {
    const p = document.getElementById('eaPassword').value;
    if (p !== CLAVE_ACCIONES) { toast('Contraseña incorrecta','err'); return; }
    if (!confirm('¿Eliminar SOLO los registros del ADMIN (línea verde)?\nLos registros de otros usuarios NO serán afectados.')) return;
    toast('Eliminando registros admin...','info');
    const promesas = []; const keysAEliminar = [];
    Object.keys(cache).forEach(function(a) { Object.keys(cache[a]||{}).forEach(function(m) { Object.keys(cache[a][m]||{}).forEach(function(k) { if (cache[a][m][k] && cache[a][m][k].esAdmin) { keysAEliminar.push({ anio: a, mes: m, key: k }); } }); }); });
    keysAEliminar.forEach(function(item) { promesas.push(remove(ref(db, RUTA_BASE + '/' + item.anio + '/' + item.mes + '/' + item.key)).catch(function(){})); });
    keysAEliminar.forEach(function(item) { if (cache[item.anio] && cache[item.anio][item.mes]) { delete cache[item.anio][item.mes][item.key]; } });
    [pendientesAMPM, pendientesADM, pendientesQDM, pendientesB2C].forEach(function(lista) { for (let i = lista.length - 1; i >= 0; i--) { if (lista[i].reg && lista[i].reg.esAdmin) { lista.splice(i, 1); } } });
    Promise.all(promesas).then(function() { toast(formatoEntero(keysAEliminar.length) + ' registros admin eliminados','ok'); cerrarModalEliminarAdmin(); render(); renderizarBaseDatos(); registrarActividad('BORRADO_MASIVO', 'Eliminó ' + formatoEntero(keysAEliminar.length) + ' registros ADMIN', 'SISTEMA'); }).catch(function(e) { toast('Error al eliminar: ' + e.message, 'err'); });
};

window.abrirBorrarMes = function(t) { if (rolActual !== 'admin') { toast('Sin permiso','err'); return; } tipoBorrarMes = t; document.getElementById('bmTipo').value = t; document.getElementById('bmMes').value = ''; document.getElementById('bmPassword').value = ''; document.getElementById('bmInfoRegistros').textContent = 'Selecciona mes y año para ver cantidad'; document.getElementById('borrarMesOverlay').classList.add('show'); };
window.cerrarBorrarMes = function() { document.getElementById('borrarMesOverlay').classList.remove('show'); };
function actualizarInfoBorrarMes() { const m = document.getElementById('bmMes').value; const a = document.getElementById('bmAnio').value; const d = document.getElementById('bmInfoRegistros'); if (!m) { d.textContent = 'Selecciona mes y año para ver cantidad'; return; } const c = Object.keys((cache[a] && cache[a][m]) ? cache[a][m] : {}).filter(function(k) { return getTipoRegistro(cache[a][m][k]) === tipoBorrarMes; }).length; d.textContent = c === 0 ? 'Sin registros ' + tipoBorrarMes + ' en ' + MESES_NOM[parseInt(m)-1] + ' ' + a : formatoEntero(c) + ' registros ' + tipoBorrarMes + ' en ' + MESES_NOM[parseInt(m)-1] + ' ' + a; }

// ✅ CORREGIDO: \n escapado
window.confirmarBorrarMes = function() {
    if (rolActual !== 'admin') { toast('Sin permiso','err'); return; }
    const m = document.getElementById('bmMes').value;
    const a = document.getElementById('bmAnio').value;
    const p = document.getElementById('bmPassword').value;
    if (!m) { toast('Primero elige el mes','err'); return; }
    if (p !== CLAVE_ACCIONES) { toast('Contraseña incorrecta','err'); return; }
    const keys = Object.keys((cache[a] && cache[a][m]) ? cache[a][m] : {}).filter(function(k) { return getTipoRegistro(cache[a][m][k]) === tipoBorrarMes; });
    if (!keys.length) { toast('No hay registros que borrar','info'); return; }
    if (!confirm('Se BORRARAN PERMANENTEMENTE ' + formatoEntero(keys.length) + ' registros ' + tipoBorrarMes + ' de ' + MESES_NOM[parseInt(m)-1] + ' ' + a + '.\nNo se puede deshacer.\n¿Confirmas?')) return;
    toast('Borrando permanentemente...','info');
    Promise.all(keys.map(function(k) { return remove(ref(db, RUTA_BASE + '/' + a + '/' + m + '/' + k)); })).then(function(){ keys.forEach(function(k) { if (cache[a] && cache[a][m]) delete cache[a][m][k]; }); toast('Mes borrado permanentemente','ok'); cerrarBorrarMes(); renderizarBaseDatos(); render(); registrarActividad('BORRADO_MASIVO', 'Borró mes ' + MESES_NOM[parseInt(m)-1] + ' ' + a + ' de ' + tipoBorrarMes + ' (' + formatoEntero(keys.length) + ' registros)', tipoBorrarMes); }).catch(function(e) { toast(''+e.message,'err'); });
};

window.buscarFiltrosAMPM = function() { buscarFiltros('AMPM'); };
window.buscarFiltrosB2C = function() { buscarFiltros('B2C'); };
window.buscarFiltrosADM = function() { buscarFiltros('ADM'); };
window.buscarFiltrosQDM = function() { buscarFiltros('QDM'); };
function idsFecha(tipo) { if (tipo === 'AMPM') return { dia:'filtroDiaAmpm', mes:'filtroMesAmpm', anio:'filtroAnioAmpm' }; if (tipo === 'B2C') return { dia:'filtroDiaB2c', mes:'filtroMesB2c', anio:'filtroAnioB2c' }; if (tipo === 'ADM') return { dia:'filtroDiaAdm', mes:'filtroMesAdm', anio:'filtroAnioAdm' }; return { dia:'filtroDiaQdm', mes:'filtroMesQdm', anio:'filtroAnioQdm' }; }
function leerFiltrosBusqueda(t) { const i = idsFecha(t); const d = document.getElementById(i.dia); const m = document.getElementById(i.mes); const a = document.getElementById(i.anio); if (!d || !m || !a) return null; return { dia: d.value, mes: m.value, anio: a.value }; }
function textoPeriodoBusqueda(t) { const f = leerFiltrosBusqueda(t); if (!f) return 'Todos'; if (f.dia && f.mes) return 'Día ' + parseInt(f.dia) + ' de ' + MESES_NOM[parseInt(f.mes)-1] + (f.anio?' '+f.anio:''); if (f.mes) return MESES_NOM[parseInt(f.mes)-1] + (f.anio?' '+f.anio:''); if (f.anio) return 'Año ' + f.anio; return 'Todos'; }

function buscarFiltros(tipo) {
    try {
        tipoBusquedaActual = tipo;
        const f = leerFiltrosBusqueda(tipo);
        if (!f) { toast('Recarga con Ctrl+Shift+R','err'); return; }
        if (!f.mes && !f.anio) { toast('Selecciona al menos Mes o Año','err'); return; }
        if (f.anio && !f.mes) { toast('Si eliges Año, también Mes','err'); return; }
        if (f.dia && !f.mes) { toast('Si eliges Día, también Mes','err'); return; }
        let res = [];
        Object.keys(cache).forEach(function(a) { if (f.anio && a !== f.anio) return; Object.keys(cache[a]||{}).forEach(function(m) { if (f.mes && m !== f.mes) return; Object.keys(cache[a][m]).forEach(function(k) { const r = { key:k, anio:a, mes:m }; Object.keys(cache[a][m][k]).forEach(function(key) { r[key] = cache[a][m][k][key]; }); if (getTipoRegistro(r) !== tipo) return; if (f.dia && (r.fecha||'').split('-')[2] !== f.dia) return; res.push(r); }); }); });
        ordenarPorFechaYId(res);
        if (!res.length) { toast('No se encontraron registros','info'); return; }
        datosModal = res; datosModalTotales = res.length; paginaModalActual = 1;
        ['fModFecha','fModUnidad','fModComuna','fModTransporte','fModObservacion','fModRango'].forEach(function(id) { const el = document.getElementById(id); if (el) el.value = ''; });
        poblarCombosModal();
        document.getElementById('modalTitleText').textContent = textoPeriodoBusqueda(tipo) + ' (' + tipo + ') - ' + formatoEntero(res.length) + ' pedidos';
        document.getElementById('modalInfo').innerHTML = '<strong>Total:</strong> ' + formatoEntero(res.length) + ' | <strong>Valor:</strong> ' + formatoMoneda(sumaValores(res)) + ' | <strong>AM:</strong> ' + formatoEntero(res.filter(function(r){return r.rango==='AM';}).length) + ' | <strong>PM:</strong> ' + formatoEntero(res.filter(function(r){return r.rango==='PM';}).length) + ' | <strong>B2C:</strong> ' + formatoEntero(res.filter(function(r){return r.rango==='B2C';}).length);
        document.getElementById('filtroIdModal').value = '';
        renderizarModal();
        document.getElementById('modalOverlay').classList.add('show');
    } catch(e){ toast('Error al buscar: '+e.message,'err'); }
}

function leerFiltrosModal() { const g = function(id) { const el = document.getElementById(id); return el ? normSinTildes(el.value.trim()) : ''; }; return { fecha: g('fModFecha'), unidad: g('fModUnidad'), comuna: g('fModComuna'), transporte: g('fModTransporte'), observacion: g('fModObservacion'), rango: g('fModRango') }; }
function aplicarFiltrosCampoModal(regs, fm) { if (fm.fecha) regs = regs.filter(function(r) { return normSinTildes(fmtFecha(r.fecha)).includes(fm.fecha) || normSinTildes(r.fecha||'').includes(fm.fecha); }); if (fm.unidad) regs = regs.filter(function(r) { return normSinTildes(r.unidad||'').includes(fm.unidad); }); if (fm.comuna) regs = regs.filter(function(r) { return normSinTildes(canonComuna(r.comuna)).includes(fm.comuna); }); if (fm.transporte) regs = regs.filter(function(r) { return normSinTildes(r.transporte||'').includes(fm.transporte); }); if (fm.observacion) regs = regs.filter(function(r) { return normSinTildes(r.observacion||'').includes(fm.observacion); }); if (fm.rango) regs = regs.filter(function(r) { return normSinTildes(r.rango||'').includes(fm.rango); }); return regs; }
window.aplicarFiltrosModal = function() { paginaModalActual = 1; renderizarModal(); };
window.aplicarFiltroIdModal = function() { paginaModalActual = 1; renderizarModal(); };
window.cerrarModal = function() { document.getElementById('modalOverlay').classList.remove('show'); datosModal = []; };
window.irAPaginaModal = function(p) { paginaModalActual = p; renderizarModal(); document.getElementById('modalBody').scrollTop = 0; };

function renderizarModal() {
    const fid = document.getElementById('filtroIdModal').value.toUpperCase().trim();
    const fm = leerFiltrosModal();
    let regs = datosModal;
    if (fid) regs = regs.filter(function(r) { return (r.idPedido||'').toString().toUpperCase().includes(fid); });
    regs = aplicarFiltrosCampoModal(regs, fm);
    ordenarPorFechaYId(regs);
    poblarCombosModal();
    const tp = Math.max(1, Math.ceil(regs.length / REGISTROS_POR_PAGINA_MODAL));
    if (paginaModalActual > tp) paginaModalActual = tp; if (paginaModalActual < 1) paginaModalActual = 1;
    const ini = (paginaModalActual-1)*REGISTROS_POR_PAGINA_MODAL; const pag = regs.slice(ini, ini+REGISTROS_POR_PAGINA_MODAL);
    const cf = detectarIdsRepetidosPorFecha(regs), cg = detectarIdsRepetidosGlobal(regs);
    document.getElementById('filtroInfo').textContent = formatoEntero(datosModalTotales) + ' totales | Mostrando ' + (regs.length?formatoEntero(ini+1):0) + '-' + formatoEntero(Math.min(ini+REGISTROS_POR_PAGINA_MODAL, regs.length)) + ' (pag ' + paginaModalActual + '/' + tp + ') | IDs repetidos: ' + formatoEntero(Object.values(cg).filter(function(c){return c>1;}).length);
    const tbody = document.getElementById('modalTbody');
    if (!pag.length) { tbody.innerHTML = '<tr><td colspan="10" style="text-align:center;padding:60px;color:var(--text-muted)">No hay registros</td></tr>'; document.getElementById('modalPaginacion').innerHTML = ''; return; }
    tbody.innerHTML = pag.map(function(r) { const claseYInd = claseYIndicadorSimple(r, cf, cg); return '<tr class="' + claseYInd.clase + '"><td>' + fmtFecha(r.fecha) + '</td><td><span class="badge badge-unidad">' + (r.unidad||'') + '</span></td><td><strong>' + (r.idPedido||'') + '</strong>' + claseYInd.ind + '</td><td>' + (r.nombre||'') + '</td><td>' + dirDe(r) + '</td><td>' + canonComuna(r.comuna) + '</td><td>' + formatoMonedaAlineado(r.valor) + '</td><td>' + (r.observacion||'') + '</td><td>' + (r.transporte||'') + '</td><td><span class="badge badge-' + (r.rango||'').toLowerCase() + '">' + (r.rango||'') + '</span></td></tr>'; }).join('');
    let h = '<div class="modal-paginacion-info">Pagina ' + paginaModalActual + ' de ' + tp + '</div>';
    h += paginaModalActual>1 ? '<button class="btn-pag-nav" onclick="irAPaginaModal(' + (paginaModalActual-1) + ')">‹ Anterior</button>' : '<button class="btn-pag-nav" disabled>‹ Anterior</button>';
    const pI = Math.max(1,paginaModalActual-2), pF = Math.min(tp,paginaModalActual+2);
    for (let i=pI;i<=pF;i++) h += i===paginaModalActual ? '<button class="btn-pag-numero activa">' + i + '</button>' : '<button class="btn-pag-numero" onclick="irAPaginaModal(' + i + ')">' + i + '</button>';
    h += paginaModalActual<tp ? '<button class="btn-pag-nav" onclick="irAPaginaModal(' + (paginaModalActual+1) + ')">Siguiente ›</button>' : '<button class="btn-pag-nav" disabled>Siguiente ›</button>';
    document.getElementById('modalPaginacion').innerHTML = h;
}

function generarPDFRegistros(regs, titulo) { const suma = sumaValores(regs); const n1 = conteoUnPeso(regs); const nA = regs.filter(function(r){return r.rango==='AM';}).length; const nP = regs.filter(function(r){return r.rango==='PM';}).length; const jsPDF = window.jspdf.jsPDF; const doc = new jsPDF({ orientation:'landscape', unit:'pt', format:'a4' }); doc.setFontSize(14); doc.text('DESPACHO RETAIL - ' + titulo, 40, 32); doc.setFontSize(9); doc.text('Pedidos: ' + formatoEntero(regs.length) + ' | AM: ' + formatoEntero(nA) + ' | PM: ' + formatoEntero(nP) + ' | Valor: ' + formatoMoneda(suma) + (n1?' (excluye ' + formatoEntero(n1) + ' de $1)':''), 40, 48); doc.text('Generado: ' + new Date().toLocaleString('es-CL'), 40, 60); doc.autoTable({ startY: 72, head: [['Fecha','Unidad','ID Pedido','Cliente','Direccion','Comuna','Valor','Observacion','Transporte','Rango']], body: regs.map(function(r) { return [fmtFecha(r.fecha), r.unidad||'', r.idPedido||'', r.nombre||'', dirDe(r), canonComuna(r.comuna), formatoMoneda(r.valor), r.observacion||'', r.transporte||'', r.rango||'']; }), styles: { fontSize:7, cellPadding:3, overflow:'linebreak' }, headStyles: { fillColor:[0,120,212], textColor:255 }, alternateRowStyles: { fillColor:[245,245,245] }, columnStyles: { 0:{cellWidth:55}, 2:{cellWidth:60}, 5:{cellWidth:60}, 6:{cellWidth:65,halign:'right'}, 9:{cellWidth:35} } }); doc.save('DespachoRetail_' + titulo.replace(/\s+/g,'_') + '.pdf'); toast('PDF exportado: ' + formatoEntero(regs.length) + ' registros','ok'); }
window.exportarPDFBD = function() { if (rolActual !== 'admin') { toast('Sin permiso','err'); return; } const t = tabBdActiva==='b2c'?'B2C':(tabBdActiva==='adm'?'ADM':(tabBdActiva==='qdm'?'QDM':'AMPM')); let r = obtenerRegsFiltradosBD(t); const idMap = { AMPM: 'filtroIdAmpm', B2C: 'filtroIdB2c', ADM: 'filtroIdAdm', QDM: 'filtroIdQdm' }; const f = document.getElementById(idMap[t]).value; if (f) { const ff = f.toUpperCase().trim(); r = r.filter(function(x) { return (x.idPedido||'').toString().toUpperCase().includes(ff); }); } if (!r.length) { toast('No hay registros','err'); return; } generarPDFRegistros(r, t + ' - ' + textoPeriodo(t)); };
window.exportarPDFModal = function() { const t = tipoBusquedaActual; const f = document.getElementById('filtroIdModal').value.toUpperCase().trim(); const fm = leerFiltrosModal(); let r = datosModal.slice(); if (f) r = r.filter(function(x) { return (x.idPedido||'').toString().toUpperCase().includes(f); }); r = aplicarFiltrosCampoModal(r, fm); if (!r.length) { toast('No hay registros','err'); return; } let t2 = t + ' - ' + textoPeriodoBusqueda(t); if (f) t2 += ' - ID ' + f; generarPDFRegistros(r, t2); };
window.setInfTipo = function(t) { infTipo = t; document.querySelectorAll('.basedatos-tab[data-inftipo]').forEach(function(b) { b.classList.toggle('active', b.getAttribute('data-inftipo') === t); }); const cont = document.getElementById('infResultado'); if (cont) cont.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);font-style:italic;">Modulo de informes en desarrollo para ' + t + '</div>'; };
window.toggleCalendario = function() { const popup = document.getElementById('calendarioPopup'); if (!popup) return; calendarioAbierto = !calendarioAbierto; if (calendarioAbierto) { renderizarCalendario(); popup.classList.add('show'); } else { popup.classList.remove('show'); } };

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
    let html = '<div class="calendario-header"><button onclick="cambiarMesCalendario(-1)">◀</button><span>' + MESES_NOM[calendarioMes].charAt(0) + MESES_NOM[calendarioMes].slice(1).toLowerCase() + ' ' + calendarioAnio + '</span><button onclick="cambiarMesCalendario(1)">▶</button></div><div class="calendario-grid">';
    DIAS_SEMANA_CORTO.forEach(function(d) { html += '<div class="dia-semana">' + d + '</div>'; });
    for (let i = 1; i < primerDiaSemana; i++) { html += '<div class="dia vacio"></div>'; }
    for (let d = 1; d <= diasEnMes; d++) {
        const fechaStr = calendarioAnio + '-' + String(calendarioMes + 1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
        const esHoy = (d === hoy.getDate() && calendarioMes === hoy.getMonth() && calendarioAnio === hoy.getFullYear());
        const esSeleccionado = (fechaStr === fechaSeleccionada);
        let clases = 'dia';
        if (esHoy) clases += ' hoy';
        if (esSeleccionado) clases += ' seleccionado';
        html += '<div class="' + clases + '" onclick="seleccionarFechaCalendario(\'' + fechaStr + '\')">' + d + '</div>';
    }
    html += '</div>';
    popup.innerHTML = html;
}

window.cambiarMesCalendario = function(delta) { calendarioMes += delta; if (calendarioMes > 11) { calendarioMes = 0; calendarioAnio++; } if (calendarioMes < 0) { calendarioMes = 11; calendarioAnio--; } renderizarCalendario(); };
window.seleccionarFechaCalendario = function(fecha) { const input = document.getElementById('fFecha'); if (input) input.value = fecha; calendarioAbierto = false; const popup = document.getElementById('calendarioPopup'); if (popup) popup.classList.remove('show'); paginaDesc = 1; render(); };
window.toggleCalFila = function(key, event) { if (event) event.stopPropagation(); document.querySelectorAll('.cal-popup-fila.show').forEach(function(p) { p.classList.remove('show'); }); const popup = document.getElementById('cal_popup_' + key); if (!popup) return; if (calFilaAbierto === key) { popup.classList.remove('show'); calFilaAbierto = null; return; } let fechaActual = obtenerFechaActualRegistro(key); if (fechaActual) { const parts = fechaActual.split('-').map(Number); calFilaMes = parts[1] - 1; calFilaAnio = parts[0]; } else { calFilaMes = new Date().getMonth(); calFilaAnio = new Date().getFullYear(); } calFilaAbierto = key; renderizarCalFila(key, fechaActual); popup.classList.add('show'); };
function obtenerFechaActualRegistro(key) { if (cambiosFechaLocales[key]) { return cambiosFechaLocales[key].nuevaFecha; } let p = pendientesAMPM.find(function(p){return p.key===key;}) || pendientesADM.find(function(p){return p.key===key;}) || pendientesQDM.find(function(p){return p.key===key;}) || pendientesB2C.find(function(p){return p.key===key;}); if (p) return p.reg.fecha; for (const a of Object.keys(cache)) { for (const m of Object.keys(cache[a]||{})) { if (cache[a][m] && cache[a][m][key]) { return cache[a][m][key].fecha; } } } return null; }

function renderizarCalFila(key, fechaSeleccionada) {
    const popup = document.getElementById('cal_popup_' + key);
    if (!popup) return;
    const hoy = new Date();
    const primerDia = new Date(calFilaAnio, calFilaMes, 1);
    const ultimoDia = new Date(calFilaAnio, calFilaMes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    let primerDiaSemana = primerDia.getDay();
    if (primerDiaSemana === 0) primerDiaSemana = 7;
    let html = '<div class="cal-header-fila"><button onclick="cambiarMesCalFila(\'' + key + '\', -1, event)"></button><span>' + MESES_NOM[calFilaMes].charAt(0) + MESES_NOM[calFilaMes].slice(1).toLowerCase() + ' ' + calFilaAnio + '</span><button onclick="cambiarMesCalFila(\'' + key + '\', 1, event)">▶</button></div><div class="cal-grid-fila">';
    DIAS_SEMANA_CORTO.forEach(function(d) { html += '<div class="dia-semana">' + d + '</div>'; });
    for (let i = 1; i < primerDiaSemana; i++) { html += '<div class="dia vacio"></div>'; }
    for (let d = 1; d <= diasEnMes; d++) {
        const fechaStr = calFilaAnio + '-' + String(calFilaMes + 1).padStart(2,'0') + '-' + String(d).padStart(2,'0');
        const esHoy = (d === hoy.getDate() && calFilaMes === hoy.getMonth() && calFilaAnio === hoy.getFullYear());
        const esSeleccionado = (fechaStr === fechaSeleccionada);
        let clases = 'dia';
        if (esHoy) clases += ' hoy';
        if (esSeleccionado) clases += ' seleccionado';
        html += '<div class="' + clases + '" onclick="seleccionarFechaFila(\'' + key + '\', \'' + fechaStr + '\', event)">' + d + '</div>';
    }
    html += '</div>';
    popup.innerHTML = html;
}

window.cambiarMesCalFila = function(key, delta, event) { if (event) event.stopPropagation(); calFilaMes += delta; if (calFilaMes > 11) { calFilaMes = 0; calFilaAnio++; } if (calFilaMes < 0) { calFilaMes = 11; calFilaAnio--; } const fechaActual = obtenerFechaActualRegistro(key); renderizarCalFila(key, fechaActual); };

window.seleccionarFechaFila = function(key, nuevaFecha, event) {
    if (event) event.stopPropagation();
    const popup = document.getElementById('cal_popup_' + key);
    if (popup) popup.classList.remove('show');
    calFilaAbierto = null;
    const parts = nuevaFecha.split('-'); const nA = parts[0]; const nM = parts[1];
    const fechaAnterior = obtenerFechaActualRegistro(key);
    if (fechaAnterior === nuevaFecha) { render(); return; }
    let p = pendientesAMPM.find(function(p){return p.key===key;}) || pendientesADM.find(function(p){return p.key===key;}) || pendientesQDM.find(function(p){return p.key===key;}) || pendientesB2C.find(function(p){return p.key===key;});
    if (p) { cambiosFechaLocales[key] = { esPendiente: true, nuevaFecha: nuevaFecha, nuevaAnio: nA, nuevaMes: nM }; toast('Fecha cambiada a ' + fmtFechaConDia(nuevaFecha) + ' (pendiente de guardar)', 'info'); render(); return; }
    for (const a of Object.keys(cache)) { for (const m of Object.keys(cache[a]||{})) { if (cache[a][m] && cache[a][m][key]) { cambiosFechaLocales[key] = { esPendiente: false, anioOriginal: a, mesOriginal: m, nuevaFecha: nuevaFecha, nuevaAnio: nA, nuevaMes: nM }; toast('Fecha cambiada a ' + fmtFechaConDia(nuevaFecha) + ' (pendiente de guardar)', 'info'); render(); return; } } }
    toast('Registro no encontrado', 'err');
};

window.cambiarFechaFila = function(key, nuevaFecha, esPend) {
    if (!nuevaFecha) return;
    const parts = nuevaFecha.split('-'); const nA = parts[0]; const nM = parts[1];
    const fechaAnterior = obtenerFechaActualRegistro(key);
    if (fechaAnterior === nuevaFecha) return;
    let p = pendientesAMPM.find(function(p){return p.key===key;}) || pendientesADM.find(function(p){return p.key===key;}) || pendientesQDM.find(function(p){return p.key===key;}) || pendientesB2C.find(function(p){return p.key===key;});
    if (p) { cambiosFechaLocales[key] = { esPendiente: true, nuevaFecha: nuevaFecha, nuevaAnio: nA, nuevaMes: nM }; toast('Fecha cambiada a ' + fmtFechaConDia(nuevaFecha) + ' (pendiente de guardar)', 'info'); render(); return; }
    for (const a of Object.keys(cache)) { for (const m of Object.keys(cache[a]||{})) { if (cache[a][m] && cache[a][m][key]) { cambiosFechaLocales[key] = { esPendiente: false, anioOriginal: a, mesOriginal: m, nuevaFecha: nuevaFecha, nuevaAnio: nA, nuevaMes: nM }; toast('Fecha cambiada a ' + fmtFechaConDia(nuevaFecha) + ' (pendiente de guardar)', 'info'); render(); return; } } }
};

async function cargarDatos() {
    const inicio = performance.now();
    toast('Cargando datos...', 'info');
    cache = {};
    const anios = [2026,2027,2028,2029,2030];
    const tareas = [];
    anios.forEach(function(anio) { for (let mes = 1; mes <= 12; mes++) { const ms = String(mes).padStart(2,'0'); tareas.push(get(ref(db, RUTA_BASE + '/' + anio + '/' + ms)).then(function(s) { return {t:'b', anio: anio, ms: ms, datos: s.val()}; }).catch(function() { return {t:'b', anio: anio, ms: ms, datos: null}; })); } });
    const res = await Promise.all(tareas);
    let total = 0;
    res.forEach(function(item) { const anio = item.anio; const ms = item.ms; const datos = item.datos; if (datos) { if (!cache[anio]) cache[anio] = {}; cache[anio][ms] = datos; total += Object.keys(datos).length; } });
    document.getElementById('loading').style.display = 'none';
    toast('Carga completa: ' + total + ' registros (' + ((performance.now()-inicio)/1000).toFixed(1) + 's)', 'ok');
    render(); renderizarBaseDatos(); actualizarBotonGuardar();
    if (seccionActiva === 'informes') renderInformes();
    if (seccionActiva === 'actividad' && rolActual === 'admin') { escucharActividad(); renderizarActividad(); }
    await cargarBitacoras();
}

async function cargarBitacoras() { try { const snap = await get(ref(db, RUTA_BITACORAS)); bitacorasData = snap.val() || {}; renderizarTodasBitacoras(); } catch(e) { console.error('Error cargando bitácoras:', e); } }
function renderInformes() { const cont = document.getElementById('infResultado'); if (!cont) return; cont.innerHTML = '<div style="padding:40px;text-align:center;color:var(--text-muted);font-style:italic;"><h3 style="margin-bottom:15px;color:var(--accent-blue)">Modulo de Informes Logisticos</h3><p>Seleccione los filtros y presione <strong>GENERAR INFORME</strong> para visualizar el analisis completo.</p><p style="margin-top:10px;font-size:.85em">Datos en tiempo real desde Firebase - Analisis BI profesional</p></div>'; }

(function init(){
    if (seccionInicial === 'basedatos') document.title = 'DR-BASE DE DATOS';
    else if (seccionInicial === 'informes') document.title = 'DR-INFORMES';
    else if (seccionInicial === 'bitacoras') document.title = 'DR-BITACORAS';
    else if (seccionInicial === 'actividad') document.title = 'DR-ACTIVIDAD';
    const st = document.createElement('style');
    st.textContent = 'tr.fila-amarillo td{background:#ffd54f !important;color:#000 !important;} tr.fila-amarillo:hover td{background:#ffca28 !important;} tr.fila-elegir-movil td{background:#b3e5fc !important;color:#000 !important;} tr.fila-elegir-movil:hover td{background:#81d4fa !important;} tr.fila-fecha-modificada td{background:#fff3cd !important;color:#000 !important;} tr.fila-fecha-modificada:hover td{background:#ffe69c !important;} #theadDesc th, #theadAmpm th, #theadB2c th, #theadAdm th, #theadQdm th {vertical-align:middle !important;text-align:center !important;} #theadDesc tr:first-child th, #theadAmpm tr:first-child th, #theadB2c tr:first-child th, #theadAdm tr:first-child th, #theadQdm tr:first-child th {padding:8px 6px !important;border-bottom:1px solid var(--border-color) !important;} #theadDesc tr:last-child td, #theadAmpm tr:last-child td, #theadB2c tr:last-child td, #theadAdm tr:last-child td, #theadQdm tr:last-child td {padding:4px 6px !important;border-top:none !important;} .th-filter{font-size:0.8em !important;padding:3px 6px !important;margin:0 !important;}';
    document.head.appendChild(st);
    const bp = document.getElementById('btnPegarSel'); if (bp) bp.remove();
    const be = document.querySelector('.btn-exportar'); if (be) { be.style.background = 'transparent'; be.style.color = 'var(--text-primary)'; }
    const dl = document.getElementById('dlTransporteDesc'); if (dl) dl.innerHTML = OPCIONES_TRANSPORTE.map(function(o) { return '<option value="' + o + '"></option>'; }).join('');
    ['filtroDiaAmpm','filtroDiaB2c','filtroDiaAdm','filtroDiaQdm','vfDia','expDia'].forEach(function(id) { const s = document.getElementById(id); if (!s) return; for (let i=1;i<=31;i++){ const o = document.createElement('option'); o.value = String(i).padStart(2,'0'); o.textContent=i; s.appendChild(o); } });
    document.getElementById('fFecha').valueAsDate = new Date();
    document.getElementById('fObs').addEventListener('input', function(e) { const p = e.target.selectionStart; e.target.value = e.target.value.toUpperCase(); e.target.setSelectionRange(p,p); });
    document.getElementById('buscar').addEventListener('input', function() { paginaDesc = 1; render(); });
    document.getElementById('bmMes').addEventListener('change', actualizarInfoBorrarMes);
    document.getElementById('bmAnio').addEventListener('change', actualizarInfoBorrarMes);
    const pw = document.getElementById('pwInput');
    if (pw) pw.addEventListener('keydown', function(e) { if (e.key === 'Enter') confirmarPassword(); });
    document.addEventListener('click', function(e) { if (!e.target.closest('.filtro-combo') && !e.target.closest('.obs-combo-wrap') && !e.target.closest('.fecha-wrap') && !e.target.closest('.fecha-cell-wrap') && !e.target.closest('.cal-popup-fila')) { cerrarTodosCombos(); cerrarCombosModal(); cerrarCombosBD(); } });
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            if (document.getElementById('passwordOverlay').classList.contains('show')) cerrarPassword();
            else if (document.getElementById('exportarModal').classList.contains('show')) cerrarModalExportar();
            else if (document.getElementById('bitacoraExportOverlay').classList.contains('show')) cerrarModalExportarBitacoras();
            else if (document.getElementById('bitacoraJPEGOverlay').classList.contains('show')) cerrarModalJPEGBitacoras();
            else if (document.getElementById('bitacoraPrintOverlay').classList.contains('show')) cerrarModalImprimirBitacoras();
            else if (document.getElementById('borrarDescOverlay').classList.contains('show')) cerrarModalBorrarDesc();
            else if (document.getElementById('eliminarAdminOverlay').classList.contains('show')) cerrarModalEliminarAdmin();
            else if (document.getElementById('borrarBitacoraTodoOverlay').classList.contains('show')) cerrarModalBorrarBitacoraTodo();
            else if (document.getElementById('borrarBitacoraAdminOverlay').classList.contains('show')) cerrarModalBorrarBitacoraAdmin();
            else if (document.getElementById('borrarMesOverlay').classList.contains('show')) cerrarBorrarMes();
            else if (document.getElementById('verFechaOverlay').classList.contains('show')) cerrarModalVerFecha();
            else if (calendarioAbierto) { calendarioAbierto = false; const p = document.getElementById('calendarioPopup'); if (p) p.classList.remove('show'); }
            else if (calFilaAbierto) { const p = document.getElementById('cal_popup_' + calFilaAbierto); if (p) p.classList.remove('show'); calFilaAbierto = null; }
            else cerrarModal();
        }
    });
    const t = localStorage.getItem('temaDespachoRetail'); if (t) cambiarTema(t);
    actualizarContadorEnviar();
})();

setInterval(function() { const hoy = new Date().toISOString().split('T')[0]; const f = document.getElementById('fFecha'); if (f && f.value !== hoy) { f.value = hoy; paginaDesc = 1; render(); } }, 60000);
