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
const OPCIONES_TRANSPORTE_B2C = ['B2C','MOVIL 1','MOVIL 2','MOVIL 3','MOVIL 4','MOVIL 5','MOVIL 6','DON RAUL','DON JOSE','SERVICIO AM/PM','SPOT','SPOT 1','SPOT 2','RETIRA CLIENTE','SERVICIO 3PL','TRANSGAMBOA'];
const OPCIONES_OBS = ['AM/PM','CASA CENTRAL','RETIRO','RETIRO CLIENTE','RETIRO CASA CENTRAL'];

const BITACORAS_UNIFICADAS = [
  {key:'movil1',label:'MOVIL 1',domId:'bitacoraMovil1'},
  {key:'movil2',label:'MOVIL 2',domId:'bitacoraMovil2'},
  {key:'movil3',label:'MOVIL 3',domId:'bitacoraMovil3'},
  {key:'movil4',label:'MOVIL 4',domId:'bitacoraMovil4'},
  {key:'movil5',label:'MOVIL 5',domId:'bitacoraMovil5'},
  {key:'movil6',label:'MOVIL 6',domId:'bitacoraMovil6'},
  {key:'spot',label:'SPOT',domId:'bitacoraSpot'},
  {key:'spot1',label:'SPOT 1',domId:'bitacoraSpot1'},
  {key:'spot2',label:'SPOT 2',domId:'bitacoraSpot2'}
];

const BITACORAS_B2C = [
  {key:'b2c_movil1',label:'MOVIL 1',domId:'bitacoraB2cMovil1'},
  {key:'b2c_movil2',label:'MOVIL 2',domId:'bitacoraB2cMovil2'},
  {key:'b2c_movil3',label:'MOVIL 3',domId:'bitacoraB2cMovil3'},
  {key:'b2c_movil4',label:'MOVIL 4',domId:'bitacoraB2cMovil4'},
  {key:'b2c_movil5',label:'MOVIL 5',domId:'bitacoraB2cMovil5'},
  {key:'b2c_movil6',label:'MOVIL 6',domId:'bitacoraB2cMovil6'},
  {key:'b2c_spot',label:'SPOT',domId:'bitacoraB2cSpot'},
  {key:'b2c_spot1',label:'SPOT 1',domId:'bitacoraB2cSpot1'},
  {key:'b2c_spot2',label:'SPOT 2',domId:'bitacoraB2cSpot2'}
];

const REGLA_PM = {
  'MOVIL 1':['maipu','cerrillos','lo espejo','la cisterna','pedro aguirre cerda','el bosque','san bernardo','la florida','puente alto','san ramon'],
  'MOVIL 2':['huechuraba','recoleta','quilicura','conchali','quinta normal','pudahuel','cerro navia','independencia','renca','lo prado','colina','lampa'],
  'MOVIL 3':['providencia','nunoa','la reina','penalolen'],
  'MOVIL 4':['las condes','vitacura','lo barnechea'],
  'MOVIL 5':['santiago','estacion central','san joaquin','macul','san miguel']
};

const REGLA_AM = {
  1:{'MOVIL 1':['la reina','casa'],'MOVIL 2':['norte','pudahuel','quinta normal','independencia','quilicura','renca','huechuraba','cerro navia','conchali','recoleta','lo prado'],'MOVIL 3':['nunoa','egana','ñuñoa','providencia'],'MOVIL 4':['alc','alto las condes','pa','parque arauco','las condes','vitacura','lo barnechea'],'MOVIL 5':['maipu','alameda','santiago','san miguel'],'MOVIL 6':['costanera','mut','las condes']},
  2:{'MOVIL 1':['apmq','dom','dominicos','los dominicos','las condes','la reina','penalolen'],'MOVIL 2':['dom','de hesa','la dehesa','trapenses','vitacura','lo barnechea'],'MOVIL 3':['alc','alto las condes','pa','parque arauco','santiago','providencia'],'MOVIL 4':['costanera','tobalaba','san bernardo','el bosque','puente alto'],'MOVIL 5':['la florida','vespucio','la cisterna','lo espejo','san ramon','pedro aguirre cerda']},
  3:{'MOVIL 1':['pa','parque arauco','casa','las condes'],'MOVIL 2':['norte','pudahuel','quinta normal','independencia','quilicura','renca','huechuraba','cerro navia','conchali','recoleta','lo prado'],'MOVIL 3':['mut','las condes','mut back','nunoa','providencia','santiago'],'MOVIL 4':['alc','alto las condes','dom','dehesa','la dehesa','vitacura','lo barnechea'],'MOVIL 5':['maipu','oeste','la cisterna','lo espejo','san ramon','pedro aguirre cerda','cerrillos'],'MOVIL 6':['costanera','egana']},
  4:{'MOVIL 1':['nunoa','mut','las condes','providencia'],'MOVIL 2':['huerfanos','santiago','nunoa'],'MOVIL 3':['costanera','cc back','providencia','la reina','penalolen'],'MOVIL 4':['alc','alto las condes','pa','parque arauco','las condes','vitacura','lo barnechea'],'MOVIL 5':['tobalaba','san bernardo','el bosque','la florida','puente alto','la cisterna','lo espejo','san ramon','pedro aguirre cerda'],'MOVIL 6':['vespucio','oeste']},
  5:{'MOVIL 1':['casa','pa','parque arauco','las condes'],'MOVIL 2':['maipu','norte','pudahuel','quinta normal','independencia','quilicura','renca','huechuraba','cerro navia','conchali','recoleta','lo prado'],'MOVIL 3':['costanera','mut','las condes','providencia','nunoa','santiago','san miguel'],'MOVIL 4':['dom','dehesa','la dehesa','pie andino','las condes','vitacura','lo barnechea'],'MOVIL 5':['egana','tobalaba','san bernardo','el bosque','la florida','puente alto','la cisterna','lo espejo','san ramon','pedro aguirre cerda'],'MOVIL 6':['dom','dehesa','la dehesa','alc','alto las condes']}
};

// PUNTO 2: Si el transporte fue modificado manualmente (transporteManual = true), la regla queda nula
function autocompletarTransportePM(reg){
  if(!reg||!reg.comuna)return reg;
  if(reg.transporteManual)return reg; // Nula si cambió transporte
  const comunaNorm=normSinTildes(reg.comuna);
  for(const movil in REGLA_PM){
    const comunas=REGLA_PM[movil];
    for(let i=0;i<comunas.length;i++){
      if(comunaNorm.includes(comunas[i])||comunas[i].includes(comunaNorm)){
        reg.transporte=movil;
        return reg;
      }
    }
  }
  return reg;
}

function autocompletarTransporteAM(reg,diaSemana){
  if(!reg||!reg.comuna)return reg;
  if(reg.transporteManual)return reg; // Nula si cambió transporte
  const reglas=REGLA_AM[diaSemana];
  if(!reglas)return reg;
  const comunaNorm=normSinTildes(reg.comuna);
  for(const movil in reglas){
    const comunas=reglas[movil];
    for(let i=0;i<comunas.length;i++){
      if(comunaNorm.includes(comunas[i])||comunas[i].includes(comunaNorm)){
        reg.transporte=movil;
        return reg;
      }
    }
  }
  return reg;
}

function esAntesDe1400(){const ahora=new Date();return(ahora.getHours()*60+ahora.getMinutes())<(14*60);}
function esDespuesDe1401(){const ahora=new Date();return(ahora.getHours()*60+ahora.getMinutes())>=(14*60+1);}
function obtenerDiaSemanaManana(){const hoy=new Date();const manana=new Date(hoy);manana.setDate(hoy.getDate()+1);return manana.getDay();}

function obtenerClaveBitacora(transporte,tipoRegistro){
  const t=(transporte||'').toUpperCase().trim();
  const esB2C=(tipoRegistro==='B2C');
  const prefijo=esB2C?'b2c_':'';
  if(t==='MOVIL 1')return prefijo+'movil1';
  if(t==='MOVIL 2')return prefijo+'movil2';
  if(t==='MOVIL 3')return prefijo+'movil3';
  if(t==='MOVIL 4')return prefijo+'movil4';
  if(t==='MOVIL 5')return prefijo+'movil5';
  if(t==='MOVIL 6')return prefijo+'movil6';
  if(t==='SPOT')return prefijo+'spot';
  if(t==='SPOT 1')return prefijo+'spot1';
  if(t==='SPOT 2')return prefijo+'spot2';
  if(t==='SERVICIO AM/PM'||t==='SERVICIO ADM'||t==='SERVICIO QDM')return 'spot';
  if(t==='SERVICIO B2C')return 'b2c_spot';
  return null;
}

function obtenerBitacorasPorTipo(tipoBitacora){return tipoBitacora==='b2c'?BITACORAS_B2C:BITACORAS_UNIFICADAS;}
function esAdmin(email){return ADMIN_EMAILS.includes((email||'').toLowerCase().trim());}

let rolActual='operador';
let emailUsuarioActual='';
let userIdActual='';
const mSec=(location.hash||'').match(/sec=([a-z]+)/);
let seccionInicial=mSec?mSec[1]:'';
let cache={};
let pendientes=[];
let pendientesAMPM=[];
let pendientesADM=[];
let pendientesQDM=[];
let pendientesB2C=[];
let modoImportActual='';
let seccionActiva='ampm';
let tabBdActiva='ampm';
let bitTabActiva='unificadas';
let tipoBusquedaActual='AMPM';
let tipoImportacionActual='AMPM';
let tipoVerFechaActual='AMPM';
let infTipo='AMPM';
let datosModal=[];
let datosModalTotales=0;
let paginaModalActual=1;
let paginaBDAmpm=1;
let paginaBDB2c=1;
let paginaBDAdm=1;
let paginaBDQdm=1;
let paginaDesc=1;
let tipoBorrarMes='AMPM';
let filtroDiaBD={AMPM:{d:'',m:'',a:''},B2C:{d:'',m:'',a:''},ADM:{d:'',m:'',a:''},QDM:{d:'',m:'',a:''}};
let filtroMesBD={AMPM:'',B2C:'',ADM:'',QDM:''};
let filtroAnioBD={AMPM:'',B2C:'',ADM:'',QDM:''};

// PUNTO 1: Estado permanente de filtros de cabecera en DESCRIPCION
let filtroDescValues={unidad:'',comuna:'',observacion:'',transporte:'',rango:''};
let filtroDescBD={
  AMPM:{unidad:'',comuna:'',observacion:'',transporte:'',rango:''},
  B2C:{unidad:'',comuna:'',observacion:'',transporte:'',rango:''},
  ADM:{unidad:'',comuna:'',observacion:'',transporte:'',rango:''},
  QDM:{unidad:'',comuna:'',observacion:'',transporte:'',rango:''}
};

let seleccionadosDesc=new Set();
let keysVisiblesDesc=[];
let theadSeccion='';
let theadBDConstruidos={};
let comboAbierto=null;
let comboModalAbierto=null;
let comboBDAbierto=null;
let comboTransAbierto=null;
let comboObsAbierto=null;
let editandoKey=null;
let pwCallback=null;
let calendarioAbierto=false;
let calendarioMes=new Date().getMonth();
let calendarioAnio=new Date().getFullYear();
let calFilaAbierto=null;
let calFilaMes=null;
let calFilaAnio=null;
let cambiosFechaLocales={};
let bitacorasData={};
let actividadData=[];
let usuariosOnline={};
let heartbeatInterval=null;

function registrarActividad(accion,detalle,modulo){
  if(!emailUsuarioActual)return;
  const ahora=new Date();
  const registro={usuario:emailUsuarioActual,esAdmin:rolActual==='admin',accion:accion,detalle:detalle,modulo:modulo||tipoDeSeccion(),fecha:ahora.toISOString(),timestamp:ahora.getTime()};
  push(ref(db,RUTA_ACTIVIDAD),registro).catch(function(e){console.error('Error registrando actividad:',e);});
}

function iniciarHeartbeat(){
  if(!emailUsuarioActual)return;
  const userId=emailUsuarioActual.replace(/[@.]/g,'_');
  userIdActual=userId;
  function actualizarOnline(){
    set(ref(db,RUTA_USUARIOS_ONLINE+'/'+userId),{email:emailUsuarioActual,esAdmin:rolActual==='admin',ultimoVisto:Date.now(),seccion:seccionActiva});
  }
  actualizarOnline();
  heartbeatInterval=setInterval(actualizarOnline,30000);
  window.addEventListener('beforeunload',function(){remove(ref(db,RUTA_USUARIOS_ONLINE+'/'+userId));});
}

function detenerHeartbeat(){
  if(heartbeatInterval){clearInterval(heartbeatInterval);heartbeatInterval=null;}
  if(userIdActual){remove(ref(db,RUTA_USUARIOS_ONLINE+'/'+userIdActual));}
}

function escucharUsuariosOnline(){
  onValue(ref(db,RUTA_USUARIOS_ONLINE),function(snapshot){
    const data=snapshot.val()||{};
    const ahora=Date.now();
    const hace5Min=ahora-(5*60*1000);
    usuariosOnline={};
    let count=0;
    Object.keys(data).forEach(function(key){
      const u=data[key];
      if(u.ultimoVisto&&u.ultimoVisto>hace5Min){
        usuariosOnline[key]=u;
        count++;
      }
    });
    actualizarDisplayUsuariosOnline(count);
  });
}

function actualizarDisplayUsuariosOnline(count){
  const el=document.getElementById('actUsuariosOnline');
  const lista=document.getElementById('actUsuariosActivos');
  if(el)el.textContent=count;
  if(lista){
    const keys=Object.keys(usuariosOnline);
    if(keys.length===0){
      lista.innerHTML='<span style="color:var(--text-muted);font-size:.85em">Sin usuarios activos</span>';
    }else{
      lista.innerHTML=keys.map(function(k){
        const u=usuariosOnline[k];
        const adminBadge=u.esAdmin?' (ADMIN)':'';
        const seccion=u.seccion?' - '+u.seccion.toUpperCase():'';
        return '<span class="usuario-activo"><span class="pulse"></span>'+u.email+adminBadge+seccion+'</span>';
      }).join('');
    }
  }
}

function escucharActividad(){
  onValue(ref(db,RUTA_ACTIVIDAD),function(snapshot){
    const data=snapshot.val()||{};
    actividadData=Object.keys(data).map(function(k){return Object.assign({id:k},data[k]);}).sort(function(a,b){return(b.timestamp||0)-(a.timestamp||0);});
    renderizarActividad();
  });
}

function renderizarActividad(){
  const lista=document.getElementById('actividadList');
  const totalEl=document.getElementById('actTotalAcciones');
  const hoyEl=document.getElementById('actHoy');
  const registrosEl=document.getElementById('actTotalRegistros');
  if(totalEl)totalEl.textContent=formatoEntero(actividadData.length);
  const hoy=new Date().toDateString();
  const hoyCount=actividadData.filter(function(a){return new Date(a.fecha).toDateString()===hoy;}).length;
  if(hoyEl)hoyEl.textContent=formatoEntero(hoyCount);
  let totalRegs=0;
  Object.keys(cache).forEach(function(a){Object.keys(cache[a]||{}).forEach(function(m){totalRegs+=Object.keys(cache[a][m]||{}).length;});});
  if(registrosEl)registrosEl.textContent=formatoEntero(totalRegs);
  if(!lista)return;
  if(actividadData.length===0){lista.innerHTML='<div class="actividad-empty">No hay actividad registrada</div>';return;}
  const iconos={'SUBIDA_ARCHIVO':'📤','GUARDADO':'💾','ELIMINACION':'🗑️','ENVIO_BITACORA':'📋','CAMBIO_FECHA':'📅','REGISTRO_NUEVO':'➕','LOGIN':'🔑','BORRADO_MASIVO':'⚠️','EXPORTACION':'📊','EDICION':'✏️'};
  lista.innerHTML=actividadData.slice(0,100).map(function(a){
    const icono=iconos[a.accion]||'📝';
    const fecha=new Date(a.fecha);
    const fechaStr=fecha.toLocaleDateString('es-CL')+' '+fecha.toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit'});
    const adminTag=a.esAdmin?'<span class="badge badge-admin">ADMIN</span>':'';
    return '<div class="actividad-item"><div class="actividad-icon">'+icono+'</div><div class="actividad-content"><div class="actividad-user">'+a.usuario+' '+adminTag+' <span style="color:var(--accent-blue);font-size:.8em">['+(a.modulo||'-')+']</span></div><div class="actividad-action">'+a.detalle+'</div><div class="actividad-time">'+fechaStr+'</div></div></div>';
  }).join('');
}

window.limpiarActividadAntigua=function(){
  if(rolActual!=='admin'){toast('Solo el administrador','err');return;}
  pedirClave(function(){
    const hace30Dias=Date.now()-(30*24*60*60*1000);
    const antiguas=actividadData.filter(function(a){return a.timestamp<hace30Dias;});
    if(antiguas.length===0){toast('No hay actividad antigua','info');return;}
    if(!confirm('¿Eliminar '+antiguas.length+' registros de actividad antiguos?'))return;
    let eliminados=0;
    const promesas=antiguas.map(function(a){return remove(ref(db,RUTA_ACTIVIDAD+'/'+a.id)).then(function(){eliminados++;});});
    Promise.all(promesas).then(function(){toast(eliminados+' registros de actividad eliminados','ok');});
  });
};

function toast(msg,tipo){
  const t=document.getElementById('toast');
  if(!t)return;
  t.textContent=msg;
  t.className='toast show '+(tipo||'info');
  setTimeout(function(){t.className='toast';},3000);
}

function fmtFecha(f){if(!f)return '';const p=f.split('-');return p[2]+'/'+p[1]+'/'+p[0];}
function nombreDiaSemana(f){if(!f)return '';const p=f.split('-');if(p.length!==3)return '';return DIAS_SEMANA[new Date(+p[0],+p[1]-1,+p[2]).getDay()]||'';}
function fmtFechaConDia(f){if(!f)return '';const p=f.split('-');const dS=nombreDiaSemana(f);return dS?dS+', '+p[2]+'-'+p[1]+'-'+p[0]:p[2]+'-'+p[1]+'-'+p[0];}
function formatoMoneda(v){return '$'+(Number(v)||0).toLocaleString('es-CL',{minimumFractionDigits:2,maximumFractionDigits:2});}
function formatoMonedaAlineado(v){const num=Number(v)||0;const formateado=num.toLocaleString('es-CL',{minimumFractionDigits:2,maximumFractionDigits:2});return '<span class="valor-alineado">$'+formateado+'</span>';}
function formatoEntero(v){return Math.round(Number(v)||0).toLocaleString('es-CL');}
function getTipoRegistro(reg){if(!reg)return 'AMPM';if(reg.tipo){if(reg.tipo==='B2C')return 'B2C';if(reg.tipo==='ADM')return 'ADM';if(reg.tipo==='QDM')return 'QDM';if(reg.tipo==='AMPM')return 'AMPM';}if(reg.rango==='B2C')return 'B2C';if(reg.rango==='ADM')return 'ADM';if(reg.rango==='QDM')return 'QDM';return 'AMPM';}
function sumaValores(regs){return regs.reduce(function(s,r){return s+(((r.valor||0)===1)?0:(r.valor||0));},0);}
function conteoUnPeso(regs){return regs.filter(function(r){return(r.valor||0)===1;}).length;}
function sinTildes(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'');}
function normSinTildes(s){return sinTildes(String(s||'').toLowerCase());}
function normEnc(h){return sinTildes(h).toUpperCase();}
function normDir(d){return sinTildes((d||'').toString().trim().toUpperCase());}

const CANON_COMUNAS=['Arica','Camarones','Putre','General Lagos','Iquique','Alto Hospicio','Pozo Almonte','Camiña','Colchane','Huara','Pica','Antofagasta','Mejillones','Sierra Gorda','Taltal','Calama','Ollagüe','San Pedro de Atacama','María Elena','Tocopilla','Copiapó','Caldera','Tierra Amarilla','Chañaral','Diego de Almagro','Vallenar','Alto del Carmen','Freirina','Huasco','La Serena','Coquimbo','Andacollo','La Higuera','Paiguano','Vicuña','Illapel','Canela','Los Vilos','Salamanca','Ovalle','Combarbalá','Monte Patria','Punitaqui','Río Hurtado','Valparaíso','Casablanca','Concón','Juan Fernández','Puchuncaví','Quintero','Viña del Mar','Isla de Pascua','Los Andes','Calle Larga','Rinconada','San Esteban','La Ligua','Cabildo','Papudo','Petorca','Zapallar','Quillota','La Calera','Hijuelas','La Cruz','Nogales','San Antonio','Algarrobo','Cartagena','El Quisco','El Tabo','Santo Domingo','San Felipe','Catemu','Llaillay','Panquehue','Putaendo','Santa María','Limache','Olmué','Quilpué','Villa Alemana','Santiago','Cerrillos','Cerro Navia','Conchalí','El Bosque','Estación Central','Huechuraba','Independencia','La Cisterna','La Florida','La Granja','La Pintana','La Reina','Las Condes','Lo Barnechea','Lo Espejo','Lo Prado','Macul','Maipú','Ñuñoa','Pedro Aguirre Cerda','Pudahuel','Quilicura','Quinta Normal','Recoleta','Renca','San Joaquín','San Miguel','San Ramón','Vitacura','Puente Alto','Pirque','San José de Maipo','Colina','Lampa','Tiltil','Buin','Calera de Tango','Paine','San Bernardo','Alhué','Curacaví','María Pinto','Melipilla','Padre Hurtado','Peñaflor','Talagante','El Monte','Isla de Maipo','Rancagua','Machalí','Graneros','Rengo','San Fernando','Curicó','Talca','Linares','Chillán','Concepción','Talcahuano','San Pedro de la Paz','Los Ángeles','Temuco','Valdivia','Osorno','Puerto Montt','Puerto Varas','Castro','Coyhaique','Punta Arenas'];
const MAPA_COMUNAS={};
CANON_COMUNAS.forEach(function(c){MAPA_COMUNAS[sinTildes(c).toLowerCase()]=c;});
function canonComuna(t){const t2=String(t||'').trim();if(!t2)return '';const k=sinTildes(t2).toLowerCase();return MAPA_COMUNAS[k]||t2.toLowerCase().replace(/(^|\s)\S/g,function(s){return s.toUpperCase();});}

const COMUNAS_RM=['SANTIAGO','PROVIDENCIA','NUNOA','LAS CONDES','VITACURA','LO BARNECHEA','MACUL','PENALOLEN','LA FLORIDA','PUENTE ALTO','SAN MIGUEL','SAN JOAQUIN','LA CISTERNA','SAN BERNARDO','EL BOSQUE','LA PINTANA','SAN RAMON','PEDRO AGUIRRE CERDA','LO ESPEJO','CERRILLOS','MAIPU','PUDAHUEL','RENCA','QUILICURA','CONCHALI','HUECHURABA','INDEPENDENCIA','RECOLETA','LA REINA','LO PRADO','QUINTA NORMAL','CERRO NAVIA','SAN PABLO','COLINA','LAMPA','PADRE HURTADO','TALAGANTE','PENAFLOR','BUIN','PAINE','CALERA DE TANGO','ISLA DE MAIPO','MELIPILLA','SAN JOSE DE MAIPO','PIRQUE','EL MONTE','CURACAVI','MARIA PINTA','ALHUE','TILTIL'];
function levenshtein(a,b){if(a===b)return 0;if(!a.length)return b.length;if(!b.length)return a.length;let prev=Array.from({length:b.length+1},function(_,i){return i;});for(let i=1;i<=a.length;i++){const cur=[i];for(let j=1;j<=b.length;j++){cur[j]=Math.min(prev[j]+1,cur[j-1]+1,prev[j-1]+(a[i-1]===b[j-1]?0:1));}prev=cur;}return prev[b.length];}
function similar(a,b){if(a===b)return true;if(Math.abs(a.length-b.length)>1)return false;return levenshtein(a,b)<=1;}
function limpiarDireccion(dir,comuna){const partes=String(dir||'').split(',').map(function(s){return s.trim();}).filter(function(s){return s!=='';});const nc=comuna?sinTildes(String(comuna).trim().toUpperCase()):'';return partes.filter(function(p){const np=sinTildes(String(p).trim().toUpperCase());return np!=='CHILE'&&!(nc&&np===nc)&&!COMUNAS_RM.some(function(c){return similar(np,c);});}).join(', ');}
function dirDe(r){return limpiarDireccion(r.direccion,r.comuna);}

function parseCSVText(text){
  const firstLine=text.split(/\r?\n/)[0]||'';
  const cTab=(firstLine.match(/\t/g)||[]).length;
  const cPun=(firstLine.match(/;/g)||[]).length;
  const cCom=(firstLine.match(/,/g)||[]).length;
  let delim=',';
  if(cTab>=cPun&&cTab>=cCom)delim='\t';
  else if(cPun>cCom)delim=';';
  const rows=[];let row=[],cur='',inQ=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i];
    if(inQ){if(ch==='"'){if(text[i+1]==='"'){cur+='"';i++;}else inQ=false;}else cur+=ch;}
    else{if(ch==='"')inQ=true;else if(ch===delim){row.push(cur);cur='';}else if(ch==='\n'){row.push(cur);rows.push(row);row=[];cur='';}else if(ch!=='\r')cur+=ch;}
  }
  if(cur!==''||row.length){row.push(cur);rows.push(row);}
  return rows.filter(function(r){return r.some(function(c){return String(c).trim()!=='';});});
}

function leerFilas(file,cb){
  const n=file.name.toLowerCase();
  const reader=new FileReader();
  if(/\.csv$/.test(n)){
    reader.onload=function(e){try{cb(parseCSVText(e.target.result));}catch(e2){toast('CSV inválido: '+e2.message,'err');}};
    reader.readAsText(file);
  }else{
    reader.onload=function(e){
      try{
        const wb=XLSX.read(new Uint8Array(e.target.result),{type:'array',cellDates:true});
        cb(XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]],{header:1,defval:'',raw:true}));
      }catch(e2){toast('Archivo inválido: '+e2.message,'err');}
    };
    reader.readAsArrayBuffer(file);
  }
}

function parsearValor(v){if(v===null||v===undefined||v==='')return 0;if(typeof v==='number')return v;let s=String(v).trim().replace(/\s/g,'').replace(/[$€]/g,'');if(!s)return 0;if(s.includes(',')&&s.includes('.')){if(s.lastIndexOf(',')>s.lastIndexOf('.'))s=s.replace(/\./g,'').replace(',', '.');else s=s.replace(/,/g,'');}else if(s.includes(','))s=s.replace(',', '.');else if(s.includes('.')){const p=s.split('.');if(p.length>2)s=s.replace(/\./g,'');else if(p[1].length===3)s=s.replace(/\./g,'');}s=s.replace(/[^\d.-]/g,'');const n=parseFloat(s);return isNaN(n)?0:n;}
function parsearFecha(raw){if(raw instanceof Date){if(isNaN(raw.getTime()))return null;return raw.getFullYear()+'-'+String(raw.getMonth()+1).padStart(2,'0')+'-'+String(raw.getDate()).padStart(2,'0');}if(typeof raw==='number'){const d=new Date(Math.round((raw-25569)*86400*1000));if(isNaN(d.getTime()))return null;return d.getUTCFullYear()+'-'+String(d.getUTCMonth()+1).padStart(2,'0')+'-'+String(d.getUTCDate()).padStart(2,'0');}if(typeof raw==='string'){let s=raw.trim().replace(/[T\s]+\d{1,2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?$/i,'').trim();let m=s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);if(m)return m[1]+'-'+m[2].padStart(2,'0')+'-'+m[3].padStart(2,'0');m=s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})$/);if(m)return m[3]+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');m=s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2})$/);if(m){const a=parseInt(m[3])>50?'19'+m[3]:'20'+m[3];return a+'-'+m[2].padStart(2,'0')+'-'+m[1].padStart(2,'0');}const d=new Date(s);if(!isNaN(d.getTime()))return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}return null;}

function pedirClave(onOk){pwCallback=onOk;const inp=document.getElementById('pwInput');if(inp)inp.value='';document.getElementById('passwordOverlay').classList.add('show');setTimeout(function(){if(inp)inp.focus();},60);}
window.cerrarPassword=function(){pwCallback=null;document.getElementById('passwordOverlay').classList.remove('show');};
window.confirmarPassword=function(){const inp=document.getElementById('pwInput');const v=inp?inp.value:'';if(v!==CLAVE_ACCIONES){toast('Contraseña incorrecta','err');if(inp){inp.value='';inp.focus();}return;}const cb=pwCallback;cerrarPassword();if(cb)cb();};

function actualizarReloj(){
  const ahora=new Date();
  const horas=String(ahora.getHours()).padStart(2,'0');
  const minutos=String(ahora.getMinutes()).padStart(2,'0');
  const segundos=String(ahora.getSeconds()).padStart(2,'0');
  const dias=['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'];
  const meses=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const diaSemana=dias[ahora.getDay()];
  const dia=String(ahora.getDate()).padStart(2,'0');
  const mes=meses[ahora.getMonth()];
  const anio=ahora.getFullYear();
  const elFecha=document.getElementById('relojFecha');
  const elHora=document.getElementById('relojHora');
  const elSeg=document.getElementById('relojSeg');
  if(elFecha)elFecha.textContent=diaSemana+' '+dia+' '+mes+' '+anio;
  if(elHora)elHora.textContent=horas+':'+minutos;
  if(elSeg)elSeg.textContent=segundos;
}
setInterval(actualizarReloj,1000);
actualizarReloj();

// Login seguro con soporte para Administrador
function iniciarSesionDirectaAdmin(email){
  rolActual='admin';
  emailUsuarioActual=email;
  document.getElementById('loginSection').style.display='none';
  document.getElementById('appSection').style.display='flex';
  document.getElementById('userEmail').textContent=email+' (ADMIN)';
  aplicarRol();
  iniciarHeartbeat();
  escucharUsuariosOnline();
  escucharActividad();
  cargarDatos();
  toast('Bienvenido '+email+' (ADMIN)','ok');
}

window.login=function(){
  const email=(document.getElementById('loginEmail').value||'').trim().toLowerCase();
  const pass=document.getElementById('loginPass').value;
  if(!email||!pass){toast('Ingresa email y contraseña','err');return;}
  toast('Conectando...','info');

  setPersistence(auth,browserLocalPersistence).then(function(){
    return signInWithEmailAndPassword(auth,email,pass);
  }).then(function(userCredential){
    toast('Bienvenido '+email,'ok');
  }).catch(function(error){
    console.warn('Fallo Auth estándar:',error);
    // Si es el administrador oficial, permitir acceso
    if(esAdmin(email)){
      iniciarSesionDirectaAdmin(email);
      return;
    }
    if(error.code==='auth/user-not-found'||error.code==='auth/invalid-credential'){
      createUserWithEmailAndPassword(auth,email,pass).then(function(newUser){
        toast('Usuario creado: '+email,'ok');
      }).catch(function(createError){
        toast('Error: '+createError.message,'err');
      });
      return;
    }
    toast('Error: '+error.message,'err');
  });
};

window.logout=function(){detenerHeartbeat();signOut(auth);};

onAuthStateChanged(auth,function(user){
  if(user){
    rolActual=esAdmin(user.email)?'admin':'operador';
    emailUsuarioActual=user.email||'';
    document.getElementById('loginSection').style.display='none';
    document.getElementById('appSection').style.display='flex';
    document.getElementById('userEmail').textContent=user.email+(rolActual==='admin'?' (ADMIN)':'');
    aplicarRol();
    iniciarHeartbeat();
    if(rolActual==='admin'){
      escucharUsuariosOnline();
      escucharActividad();
    }
    cargarDatos().then(function(){
      if(seccionInicial){
        cambiarSeccion(seccionInicial);
        seccionInicial='';
      }
    });
    registrarActividad('LOGIN','Usuario inició sesión','SISTEMA');
  }else{
    if(!emailUsuarioActual){
      rolActual='operador';
      emailUsuarioActual='';
      userIdActual='';
      detenerHeartbeat();
      document.getElementById('loginSection').style.display='flex';
      document.getElementById('appSection').style.display='none';
    }
  }
});

function aplicarRol(){
  const t=document.querySelector('.seccion-tab[data-seccion="basedatos"]');
  const t2=document.querySelector('.seccion-tab[data-seccion="informes"]');
  const t3=document.getElementById('tabActividad');
  const btnEA=document.getElementById('btnEliminarAdmin');
  const btnBBAU=document.getElementById('btnBorrarBitacoraAdminU');
  const btnBBAB=document.getElementById('btnBorrarBitacoraAdminB');
  if(!t)return;
  if(rolActual==='admin'){
    t.style.display='';
    if(t2)t2.style.display='';
    if(t3)t3.style.display='';
    if(btnEA)btnEA.style.display='inline-block';
    if(btnBBAU)btnBBAU.style.display='inline-block';
    if(btnBBAB)btnBBAB.style.display='inline-block';
  }else{
    t.style.display='none';
    if(t2)t2.style.display='none';
    if(t3)t3.style.display='none';
    if(btnEA)btnEA.style.display='none';
    if(btnBBAU)btnBBAU.style.display='none';
    if(btnBBAB)btnBBAB.style.display='none';
    if(seccionActiva==='basedatos'||seccionActiva==='informes'||seccionActiva==='actividad')cambiarSeccion('ampm');
  }
}

function tipoDeSeccion(){
  if(seccionActiva==='ampm')return 'AMPM';
  if(seccionActiva==='b2c')return 'B2C';
  if(seccionActiva==='adm')return 'ADM';
  if(seccionActiva==='qdm')return 'QDM';
  return 'AMPM';
}

function pendientesDeSeccion(){
  if(seccionActiva==='ampm')return pendientesAMPM;
  if(seccionActiva==='adm')return pendientesADM;
  if(seccionActiva==='qdm')return pendientesQDM;
  if(seccionActiva==='b2c')return pendientesB2C;
  return [];
}

window.cambiarSeccion=function(sec){
  if(sec==='basedatos'&&rolActual!=='admin'){toast('Sin permiso para BASE DE DATOS','err');return;}
  if(sec==='informes'&&rolActual!=='admin'){toast('Sin permiso para INFORMES','err');return;}
  if(sec==='actividad'&&rolActual!=='admin'){toast('Sin permiso para ACTIVIDAD','err');return;}
  seccionActiva=sec;
  editandoKey=null;
  seleccionadosDesc.clear();
  document.querySelectorAll('.seccion-tab').forEach(function(t){t.classList.remove('active');});
  const tabBtn=document.querySelector('.seccion-tab[data-seccion="'+sec+'"]');
  if(tabBtn)tabBtn.classList.add('active');
  document.querySelectorAll('.secciones-bar > .seccion-contenido').forEach(function(c){c.classList.remove('show');});
  const cont=document.getElementById('seccion'+sec.charAt(0).toUpperCase()+sec.slice(1));
  if(cont)cont.classList.add('show');
  document.body.classList.toggle('oculta-principal',(sec==='basedatos'||sec==='bitacoras'||sec==='informes'||sec==='actividad'));
  paginaDesc=1;
  render();
  if(sec==='basedatos')renderizarBaseDatos();
  if(sec==='informes')renderInformes();
  if(sec==='bitacoras')renderizarTodasBitacoras();
  if(sec==='actividad'&&rolActual==='admin'){escucharActividad();renderizarActividad();}
  actualizarBotonGuardar();
};

window.cambiarTabBitacora=function(tab){
  bitTabActiva=tab;
  document.querySelectorAll('.bitacora-tab').forEach(function(t){t.classList.remove('active');});
  const tabBtn=document.querySelector('.bitacora-tab[data-btab="'+tab+'"]');
  if(tabBtn)tabBtn.classList.add('active');
  document.querySelectorAll('#seccionBitacoras .bitacora-tab-content').forEach(function(c){c.classList.remove('show');});
  const map={unificadas:'bitContentUnificadas',b2c:'bitContentB2c'};
  const cont=document.getElementById(map[tab]||'bitContentUnificadas');
  if(cont)cont.classList.add('show');
  renderizarTodasBitacoras();
};

window.toggleSeccion=function(s){
  document.getElementById('contenido'+s.charAt(0).toUpperCase()+s.slice(1)).classList.toggle('show');
  document.getElementById('flecha'+s.charAt(0).toUpperCase()+s.slice(1)).classList.toggle('rotada');
};

window.toggleSubmenu=function(s){
  document.getElementById('submenu'+s.charAt(0).toUpperCase()+s.slice(1)).classList.toggle('show');
  document.getElementById('flecha'+s.charAt(0).toUpperCase()+s.slice(1)).classList.toggle('rotada');
};

window.cambiarTema=function(t){
  document.documentElement.setAttribute('data-theme',t);
  document.querySelectorAll('.theme-btn').forEach(function(b){b.classList.toggle('active',b.getAttribute('data-theme')===t);});
  localStorage.setItem('temaDespachoRetail',t);
};

window.toggleSeleccionDesc=function(key,checked){checked?seleccionadosDesc.add(key):seleccionadosDesc.delete(key);sincronizarSelTodos();actualizarContadorEnviar();};
window.toggleSeleccionarTodo=function(checked){checked?keysVisiblesDesc.forEach(function(k){seleccionadosDesc.add(k);}):keysVisiblesDesc.forEach(function(k){seleccionadosDesc.delete(k);});render();};
function sincronizarSelTodos(){const el=document.getElementById('selTodosDesc');if(el)el.checked=keysVisiblesDesc.length>0&&keysVisiblesDesc.every(function(k){return seleccionadosDesc.has(k);});}
function actualizarContadorEnviar(){const b=document.getElementById('btnEnviar');if(b)b.textContent=seleccionadosDesc.size>0?'ENVIAR A BITACORA ('+seleccionadosDesc.size+')':'ENVIAR A BITACORA';}

function leerFiltrosDesc(){
  const g=function(id,colKey){
    const el=document.getElementById(id);
    if(el&&el.value)return normSinTildes(el.value.trim());
    return normSinTildes(filtroDescValues[colKey]||'');
  };
  return{
    unidad:g('fDescUnidad','unidad'),
    comuna:g('fDescComuna','comuna'),
    observacion:g('fDescObservacion','observacion'),
    transporte:g('fDescTransporte','transporte'),
    rango:g('fDescRango','rango')
  };
}

function getDescBaseRows(){
  const f=document.getElementById('fFecha');
  const fechaTrabajo=(f&&f.value)?f.value:new Date().toISOString().split('T')[0];
  const tipoSec=tipoDeSeccion();
  let regs=[];
  Object.keys(cache).forEach(function(a){
    Object.keys(cache[a]||{}).forEach(function(m){
      Object.keys(cache[a][m]).forEach(function(k){
        const r={key:k,anio:a,mes:m};
        Object.assign(r,cache[a][m][k]);
        if(getTipoRegistro(r)!==tipoSec)return;
        regs.push(r);
      });
    });
  });
  const keysConCambios=Object.keys(cambiosFechaLocales);
  regs=regs.filter(function(r){
    if(keysConCambios.includes(r.key))return true;
    return r.fecha===fechaTrabajo;
  });
  pendientesDeSeccion().forEach(function(p){
    const reg=Object.assign({},p.reg,{key:p.key,anio:p.anio,mes:p.mes,pendiente:true});
    regs.push(reg);
  });
  return regs;
}

// PUNTO 1: Valores únicos para todos los combos de filtro incluyendo Observacion
function getDistinctValues(col){
  const rows=getDescBaseRows();
  const setVals=new Set();
  rows.forEach(function(r){
    let v='';
    if(col==='unidad')v=r.unidad||'';
    else if(col==='comuna')v=canonComuna(r.comuna)||'';
    else if(col==='observacion')v=r.observacion||'';
    else if(col==='transporte')v=r.transporte||'';
    else if(col==='rango')v=r.rango||'';
    if(v)setVals.add(v);
  });
  if(col==='observacion'){
    OPCIONES_OBS.forEach(function(o){setVals.add(o);});
  }
  if(col==='transporte'){
    (seccionActiva==='b2c'?OPCIONES_TRANSPORTE_B2C:OPCIONES_TRANSPORTE).forEach(function(t){setVals.add(t);});
  }
  return Array.from(setVals).sort();
}

function poblarCombo(col,filtro){
  const list=document.getElementById('combo_'+col);
  if(!list)return;
  let vals=getDistinctValues(col);
  if(filtro){vals=vals.filter(function(v){return normSinTildes(v).includes(normSinTildes(filtro));});}
  list.innerHTML=vals.length?vals.map(function(v){
    return '<div class="combo-item" onmousedown="elegirOpcionCombo(\''+col+'\',\''+v.replace(/'/g,"\\'")+'\')">'+v+'</div>';
  }).join(''):'<div class="combo-item">Sin coincidencias</div>';
}

function poblarCombos(){
  ['unidad','comuna','observacion','transporte','rango'].forEach(function(col){
    const inp=document.getElementById('fDesc'+col.charAt(0).toUpperCase()+col.slice(1));
    poblarCombo(col,inp?inp.value:(filtroDescValues[col]||''));
  });
}

function cerrarTodosCombos(){
  document.querySelectorAll('.combo-list').forEach(function(l){
    if(!l.id.startsWith('comboModal_')&&!l.id.startsWith('comboBD_')&&!l.id.startsWith('combo_trans_')&&!l.id.startsWith('combo_obs_')){
      l.style.display='none';
    }
  });
  comboAbierto=null;
  comboTransAbierto=null;
  comboObsAbierto=null;
  if(calendarioAbierto){
    calendarioAbierto=false;
    const p=document.getElementById('calendarioPopup');
    if(p)p.classList.remove('show');
  }
  if(calFilaAbierto){
    const p=document.getElementById('cal_popup_'+calFilaAbierto);
    if(p)p.classList.remove('show');
    calFilaAbierto=null;
  }
}

window.toggleCombo=function(col){
  const list=document.getElementById('combo_'+col);
  if(!list)return;
  if(comboAbierto===col){
    list.style.display='none';
    comboAbierto=null;
  }else{
    cerrarTodosCombos();
    poblarCombo(col,'');
    list.style.display='block';
    comboAbierto=col;
  }
};

window.abrirCombo=function(col){
  cerrarTodosCombos();
  poblarCombo(col,'');
  const list=document.getElementById('combo_'+col);
  if(list){
    list.style.display='block';
    comboAbierto=col;
  }
};

window.elegirOpcionCombo=function(col,val){
  filtroDescValues[col]=val;
  const input=document.getElementById('fDesc'+col.charAt(0).toUpperCase()+col.slice(1));
  if(input)input.value=val;
  cerrarTodosCombos();
  paginaDesc=1;
  render();
};

window.filtrarComboDesc=function(col,val){
  filtroDescValues[col]=val;
  poblarCombo(col,val);
  const list=document.getElementById('combo_'+col);
  if(list){
    list.style.display='block';
    comboAbierto=col;
  }
  paginaDesc=1;
  render();
};

// PUNTO 2: Apertura de combo transporte mostrando TODAS las opciones sin filtrar por valor actual
window.abrirComboTransporte=function(key){
  const list=document.getElementById('combo_trans_'+key);
  if(!list)return;
  const esB2C=(seccionActiva==='b2c');
  const vals=esB2C?OPCIONES_TRANSPORTE_B2C:OPCIONES_TRANSPORTE;
  list.innerHTML=vals.length?vals.map(function(v){
    return '<div class="combo-item" onmousedown="elegirOpcionTransporte(\''+key+'\',\''+v+'\')">'+v+'</div>';
  }).join(''):'<div class="combo-item">Sin coincidencias</div>';
  list.style.display='block';
  comboTransAbierto=key;
};

window.toggleComboTransporte=function(key){
  const list=document.getElementById('combo_trans_'+key);
  if(!list)return;
  if(comboTransAbierto===key){
    list.style.display='none';
    comboTransAbierto=null;
  }else{
    cerrarTodosCombos();
    abrirComboTransporte(key);
  }
};

window.filtrarComboTransporte=function(key,val){
  const list=document.getElementById('combo_trans_'+key);
  if(!list)return;
  const esB2C=(seccionActiva==='b2c');
  let vals=esB2C?OPCIONES_TRANSPORTE_B2C:OPCIONES_TRANSPORTE;
  if(val)vals=vals.filter(function(v){return normSinTildes(v).includes(normSinTildes(val));});
  list.innerHTML=vals.length?vals.map(function(v){
    return '<div class="combo-item" onmousedown="elegirOpcionTransporte(\''+key+'\',\''+v+'\')">'+v+'</div>';
  }).join(''):'<div class="combo-item">Sin coincidencias</div>';
  list.style.display='block';
  comboTransAbierto=key;
};

window.elegirOpcionTransporte=function(key,val){
  const input=document.getElementById('trans_input_'+key);
  if(input)input.value=val;
  const list=document.getElementById('combo_trans_'+key);
  if(list)list.style.display='none';
  comboTransAbierto=null;
  actualizarTransporteRegistro(key,val);
};

// PUNTO 2: Actualización de Transporte y anulación de REGLA AM/PM
function actualizarTransporteRegistro(key,nuevoTransporte){
  nuevoTransporte=(nuevoTransporte||'').toUpperCase().trim();
  let p=pendientesAMPM.find(function(p){return p.key===key;})||
    pendientesADM.find(function(p){return p.key===key;})||
    pendientesQDM.find(function(p){return p.key===key;})||
    pendientesB2C.find(function(p){return p.key===key;});

  if(p){
    if(p.reg.transporte!==nuevoTransporte){
      const regAnterior=Object.assign({},p.reg);
      p.reg.transporte=nuevoTransporte;
      p.reg.transporteManual=true; // Reglas AM/PM nulas para este registro
      delete p.reg.candidatos;
      if(cache[p.anio]&&cache[p.anio][p.mes]&&cache[p.anio][p.mes][key]){
        update(ref(db,RUTA_BASE+'/'+p.anio+'/'+p.mes+'/'+key),{transporte:nuevoTransporte,transporteManual:true}).catch(function(){});
      }
      reorganizarBitacoraPorCambioTransporte(key,p.reg,regAnterior);
      render();
    }
    return;
  }

  outer:for(const a of Object.keys(cache)){
    for(const m of Object.keys(cache[a]||{})){
      if(cache[a][m]&&cache[a][m][key]){
        if(cache[a][m][key].transporte!==nuevoTransporte){
          const regAnterior=Object.assign({},cache[a][m][key]);
          cache[a][m][key].transporte=nuevoTransporte;
          cache[a][m][key].transporteManual=true; // Reglas AM/PM nulas para este registro
          delete cache[a][m][key].candidatos;
          update(ref(db,RUTA_BASE+'/'+a+'/'+m+'/'+key),{transporte:nuevoTransporte,transporteManual:true}).catch(function(){});
          reorganizarBitacoraPorCambioTransporte(key,cache[a][m][key],regAnterior);
        }
        break outer;
      }
    }
  }
  render();
}
window.actualizarTransporteRegistro=actualizarTransporteRegistro;

// PUNTO 2: Limpieza de la bitácora anterior y traslado a la bitácora de destino
function reorganizarBitacoraPorCambioTransporte(key,regNuevo,regAnterior){
  if(!regNuevo)return;
  const transporteNuevo=(regNuevo.transporte||'').toUpperCase().trim();
  const tipoRegistro=getTipoRegistro(regNuevo);
  const bitKeyNuevo=obtenerClaveBitacora(transporteNuevo,tipoRegistro);
  if(!bitKeyNuevo)return;

  // Limpiar el registro de cualquier otra bitácora previa
  Object.keys(bitacorasData).forEach(function(bitK){
    if(bitK!==bitKeyNuevo&&bitacorasData[bitK]&&Array.isArray(bitacorasData[bitK].filas)){
      let modificado=false;
      for(let i=0;i<bitacorasData[bitK].filas.length;i++){
        const fila=bitacorasData[bitK].filas[i];
        if(fila&&String(fila.documentos||'').trim()===String(regNuevo.idPedido||'').trim()){
          bitacorasData[bitK].filas[i]={requirente:'',documentos:'',cliente:'',direccion:'',comuna:'',obs:'',rango:'',tipo:''};
          modificado=true;
        }
      }
      if(modificado){
        update(ref(db,RUTA_BITACORAS+'/'+bitK),{filas:bitacorasData[bitK].filas,footer:bitacorasData[bitK].footer}).catch(function(){});
      }
    }
  });

  const filaBitacora={
    requirente:regNuevo.unidad||'',
    documentos:regNuevo.idPedido||'',
    cliente:regNuevo.nombre||'',
    direccion:regNuevo.direccion||'',
    comuna:regNuevo.comuna||'',
    obs:regNuevo.observacion||'',
    rango:regNuevo.rango||'',
    tipo:regNuevo.tipo||'',
    esAdmin:regNuevo.esAdmin||false
  };

  if(!bitacorasData[bitKeyNuevo]){
    bitacorasData[bitKeyNuevo]={filas:[],footer:{transporte:transporteNuevo,fecha:regNuevo.fecha||'',ruta:regNuevo.rango||'AM',responsable:'',firma:''}};
  }
  if(!Array.isArray(bitacorasData[bitKeyNuevo].filas)){
    bitacorasData[bitKeyNuevo].filas=[];
  }

  let filaIdx=-1;
  for(let i=0;i<bitacorasData[bitKeyNuevo].filas.length;i++){
    const f=bitacorasData[bitKeyNuevo].filas[i];
    if(f&&String(f.documentos||'').trim()===String(regNuevo.idPedido||'').trim()){
      filaIdx=i;
      break;
    }
  }

  if(filaIdx===-1){
    for(let i=0;i<15;i++){
      const f=bitacorasData[bitKeyNuevo].filas[i];
      if(!f||(!f.requirente&&!f.documentos&&!f.cliente)){
        filaIdx=i;
        break;
      }
    }
  }

  if(filaIdx===-1){
    bitacorasData[bitKeyNuevo].filas.push(filaBitacora);
  }else{
    bitacorasData[bitKeyNuevo].filas[filaIdx]=filaBitacora;
  }

  if(!bitacorasData[bitKeyNuevo].footer){
    bitacorasData[bitKeyNuevo].footer={transporte:transporteNuevo,fecha:regNuevo.fecha||'',ruta:regNuevo.rango||'AM',responsable:'',firma:''};
  }else{
    bitacorasData[bitKeyNuevo].footer.transporte=transporteNuevo;
    if(regNuevo.fecha&&!bitacorasData[bitKeyNuevo].footer.fecha){
      bitacorasData[bitKeyNuevo].footer.fecha=regNuevo.fecha;
    }
  }

  update(ref(db,RUTA_BITACORAS+'/'+bitKeyNuevo),{filas:bitacorasData[bitKeyNuevo].filas,footer:bitacorasData[bitKeyNuevo].footer}).catch(function(){});
  renderizarTodasBitacoras();
  toast('Transporte actualizado a '+transporteNuevo+' y enviado a BITACORA '+transporteNuevo,'ok');
}

// PUNTO 1: Apertura de combo observación mostrando TODAS las opciones sin borrar
window.abrirComboObs=function(key){
  const list=document.getElementById('combo_obs_'+key);
  if(!list)return;
  const vals=OPCIONES_OBS;
  list.innerHTML=vals.length?vals.map(function(v){
    return '<div class="combo-item" onmousedown="elegirOpcionObs(\''+key+'\',\''+v+'\')">'+v+'</div>';
  }).join(''):'<div class="combo-item">Sin coincidencias</div>';
  list.style.display='block';
  comboObsAbierto=key;
};

window.toggleComboObs=function(key){
  const list=document.getElementById('combo_obs_'+key);
  if(!list)return;
  if(comboObsAbierto===key){
    list.style.display='none';
    comboObsAbierto=null;
  }else{
    cerrarTodosCombos();
    abrirComboObs(key);
  }
};

window.filtrarComboObs=function(key,val){
  const list=document.getElementById('combo_obs_'+key);
  if(!list)return;
  let vals=OPCIONES_OBS;
  if(val)vals=vals.filter(function(v){return normSinTildes(v).includes(normSinTildes(val));});
  list.innerHTML=vals.length?vals.map(function(v){
    return '<div class="combo-item" onmousedown="elegirOpcionObs(\''+key+'\',\''+v+'\')">'+v+'</div>';
  }).join(''):'<div class="combo-item">Sin coincidencias</div>';
  list.style.display='block';
  comboObsAbierto=key;
};

window.elegirOpcionObs=function(key,val){
  actualizarObservacionRegistro(key,val);
  const input=document.getElementById('obs_input_'+key);
  if(input){input.value=val;input.focus();}
  const list=document.getElementById('combo_obs_'+key);
  if(list)list.style.display='none';
  comboObsAbierto=null;
};

function actualizarObservacionRegistro(key,nuevaObs){
  nuevaObs=(nuevaObs||'').toUpperCase().trim();
  let p=pendientesAMPM.find(function(p){return p.key===key;})||
    pendientesADM.find(function(p){return p.key===key;})||
    pendientesQDM.find(function(p){return p.key===key;})||
    pendientesB2C.find(function(p){return p.key===key;});

  if(p){
    p.reg.observacion=nuevaObs;
    if(cache[p.anio]&&cache[p.anio][p.mes]&&cache[p.anio][p.mes][key]){
      update(ref(db,RUTA_BASE+'/'+p.anio+'/'+p.mes+'/'+key),{observacion:nuevaObs});
    }
    render();
    return;
  }

  outer:for(const a of Object.keys(cache)){
    for(const m of Object.keys(cache[a]||{})){
      if(cache[a][m]&&cache[a][m][key]){
        cache[a][m][key].observacion=nuevaObs;
        update(ref(db,RUTA_BASE+'/'+a+'/'+m+'/'+key),{observacion:nuevaObs});
        break outer;
      }
    }
  }
  render();
}
window.actualizarObservacionRegistro=actualizarObservacionRegistro;

// PUNTO 1: Encabezados alineados y filtros con separación
function renderDescThead(){
  const thead=document.getElementById('theadDesc');
  if(!thead)return;
  const b2c=(seccionActiva==='b2c');

  const sel='<th rowspan="2" style="text-align:center;vertical-align:middle"><input type="checkbox" id="selTodosDesc" style="width:16px;height:16px;" onchange="toggleSeleccionarTodo(this.checked)" title="Seleccionar todo"></th>';
  const acc='<th rowspan="2" style="text-align:center;vertical-align:middle">Acciones</th>';

  const filtroUnidad='<div class="filtro-combo" style="margin:0"><input type="text" class="th-filter" id="fDescUnidad" placeholder="Filtrar..." style="width:100px" value="'+(filtroDescValues.unidad||'').replace(/"/g,'&quot;')+'" oninput="filtrarComboDesc(\'unidad\', this.value)" onfocus="abrirCombo(\'unidad\')"><button class="combo-arrow" onclick="toggleCombo(\'unidad\')">▼</button><div class="combo-list" id="combo_unidad"></div></div>';
  const filtroComuna='<div class="filtro-combo" style="margin:0"><input type="text" class="th-filter" id="fDescComuna" placeholder="Filtrar..." style="width:100px" value="'+(filtroDescValues.comuna||'').replace(/"/g,'&quot;')+'" oninput="filtrarComboDesc(\'comuna\', this.value)" onfocus="abrirCombo(\'comuna\')"><button class="combo-arrow" onclick="toggleCombo(\'comuna\')">▼</button><div class="combo-list" id="combo_comuna"></div></div>';
  const filtroObservacion='<div class="filtro-combo" style="margin:0"><input type="text" class="th-filter" id="fDescObservacion" placeholder="Filtrar..." style="width:120px" value="'+(filtroDescValues.observacion||'').replace(/"/g,'&quot;')+'" oninput="filtrarComboDesc(\'observacion\', this.value)" onfocus="abrirCombo(\'observacion\')"><button class="combo-arrow" onclick="toggleCombo(\'observacion\')">▼</button><div class="combo-list" id="combo_observacion"></div></div>';
  const filtroTransporte='<div class="filtro-combo" style="margin:0"><input type="text" class="th-filter" id="fDescTransporte" placeholder="Filtrar..." style="width:100px" value="'+(filtroDescValues.transporte||'').replace(/"/g,'&quot;')+'" oninput="filtrarComboDesc(\'transporte\', this.value)" onfocus="abrirCombo(\'transporte\')"><button class="combo-arrow" onclick="toggleCombo(\'transporte\')">▼</button><div class="combo-list" id="combo_transporte"></div></div>';
  const filtroRango='<div class="filtro-combo" style="margin:0"><input type="text" class="th-filter" id="fDescRango" placeholder="Filtrar..." style="width:80px" value="'+(filtroDescValues.rango||'').replace(/"/g,'&quot;')+'" oninput="filtrarComboDesc(\'rango\', this.value)" onfocus="abrirCombo(\'rango\')"><button class="combo-arrow" onclick="toggleCombo(\'rango\')">▼</button><div class="combo-list" id="combo_rango"></div></div>';

  if(b2c){
    thead.innerHTML='<tr>'+sel+
      '<th rowspan="2" style="text-align:center;vertical-align:middle;min-width:110px">Fecha</th>'+
      '<th style="text-align:center;vertical-align:middle;min-width:150px">Unidad Negocio</th>'+
      '<th rowspan="2" style="text-align:center;vertical-align:middle;min-width:120px">ID Pedido</th>'+
      '<th rowspan="2" style="text-align:center;vertical-align:middle;min-width:180px">Nombre Cliente</th>'+
      '<th rowspan="2" style="text-align:center;vertical-align:middle;min-width:130px">Celular</th>'+
      '<th rowspan="2" style="text-align:center;vertical-align:middle;min-width:200px">E-Mail</th>'+
      '<th rowspan="2" style="text-align:center;vertical-align:middle;min-width:250px">Dirección</th>'+
      '<th style="text-align:center;vertical-align:middle;min-width:120px">Comuna</th>'+
      '<th rowspan="2" style="text-align:center;vertical-align:middle;min-width:120px">Valor</th>'+
      '<th style="text-align:center;vertical-align:middle;min-width:160px">Observación</th>'+
      '<th style="text-align:center;vertical-align:middle;min-width:140px">Transporte</th>'+
      '<th style="text-align:center;vertical-align:middle;min-width:80px">Rango</th>'+
      acc+'</tr>'+
      '<tr>'+
      '<td style="text-align:center;padding:8px 4px">'+filtroUnidad+'</td>'+
      '<td style="text-align:center;padding:8px 4px">'+filtroComuna+'</td>'+
      '<td style="text-align:center;padding:8px 4px">'+filtroObservacion+'</td>'+
      '<td style="text-align:center;padding:8px 4px">'+filtroTransporte+'</td>'+
      '<td style="text-align:center;padding:8px 4px">'+filtroRango+'</td>'+
      '</tr>';
  }else{
    thead.innerHTML='<tr>'+sel+
      '<th rowspan="2" style="text-align:center;vertical-align:middle;min-width:110px">Fecha</th>'+
      '<th style="text-align:center;vertical-align:middle;min-width:150px">Unidad Negocio</th>'+
      '<th rowspan="2" style="text-align:center;vertical-align:middle;min-width:120px">ID Pedido</th>'+
      '<th rowspan="2" style="text-align:center;vertical-align:middle;min-width:180px">Nombre Cliente</th>'+
      '<th rowspan="2" style="text-align:center;vertical-align:middle;min-width:250px">Dirección</th>'+
      '<th style="text-align:center;vertical-align:middle;min-width:120px">Comuna</th>'+
      '<th rowspan="2" style="text-align:center;vertical-align:middle;min-width:120px">Valor</th>'+
      '<th style="text-align:center;vertical-align:middle;min-width:160px">Observación</th>'+
      '<th style="text-align:center;vertical-align:middle;min-width:140px">Transporte</th>'+
      '<th style="text-align:center;vertical-align:middle;min-width:80px">Rango</th>'+
      acc+'</tr>'+
      '<tr>'+
      '<td style="text-align:center;padding:8px 4px">'+filtroUnidad+'</td>'+
      '<td style="text-align:center;padding:8px 4px">'+filtroComuna+'</td>'+
      '<td style="text-align:center;padding:8px 4px">'+filtroObservacion+'</td>'+
      '<td style="text-align:center;padding:8px 4px">'+filtroTransporte+'</td>'+
      '<td style="text-align:center;padding:8px 4px">'+filtroRango+'</td>'+
      '</tr>';
  }
}

function render(){
  if(theadSeccion!==seccionActiva){renderDescThead();theadSeccion=seccionActiva;}
  poblarCombos();
  const busq=(document.getElementById('buscar').value||'').toLowerCase();
  const f=document.getElementById('fFecha');
  const fechaTrabajo=(f&&f.value)?f.value:new Date().toISOString().split('T')[0];
  const tipoSec=tipoDeSeccion();
  let regs=[];

  Object.keys(cache).forEach(function(a){
    Object.keys(cache[a]||{}).forEach(function(m){
      Object.keys(cache[a][m]).forEach(function(k){
        const r={key:k,anio:a,mes:m};
        Object.assign(r,cache[a][m][k]);
        if(getTipoRegistro(r)!==tipoSec)return;
        regs.push(r);
      });
    });
  });

  const keysConCambios=Object.keys(cambiosFechaLocales);
  if(!busq){
    regs=regs.filter(function(r){
      if(keysConCambios.includes(r.key))return true;
      return r.fecha===fechaTrabajo;
    });
  }else{
    regs=regs.filter(function(r){
      return['nombre','idPedido','transporte','comuna','unidad','celular','email','observacion'].some(function(c){
        return(r[c]||'').toLowerCase().includes(busq);
      });
    });
  }

  pendientesDeSeccion().forEach(function(p){
    const reg=Object.assign({},p.reg,{key:p.key,anio:p.anio,mes:p.mes,pendiente:true});
    regs.push(reg);
  });

  const fd=leerFiltrosDesc();
  if(fd.unidad)regs=regs.filter(function(r){return normSinTildes(r.unidad||'').includes(fd.unidad);});
  if(fd.comuna)regs=regs.filter(function(r){return normSinTildes(canonComuna(r.comuna)||'').includes(fd.comuna);});
  if(fd.observacion)regs=regs.filter(function(r){return normSinTildes(r.observacion||'').includes(fd.observacion);});
  if(fd.transporte)regs=regs.filter(function(r){return normSinTildes(r.transporte||'').includes(fd.transporte);});
  if(fd.rango)regs=regs.filter(function(r){return normSinTildes(r.rango||'').includes(fd.rango);});

  ordenarPorFechaDireccionId(regs);

  const elTotal=document.getElementById('sTotal');
  const elValor=document.getElementById('sValor');
  const elAM=document.getElementById('sAM');
  const elPM=document.getElementById('sPM');
  if(elTotal)elTotal.textContent=formatoEntero(regs.length);
  if(elValor)elValor.textContent=formatoMoneda(sumaValores(regs));
  if(elAM)elAM.textContent=formatoEntero(regs.filter(function(r){return r.rango==='AM';}).length);
  if(elPM)elPM.textContent=formatoEntero(regs.filter(function(r){return r.rango==='PM';}).length);

  const tbody=document.getElementById('tbody');
  const empty=document.getElementById('empty');
  if(!tbody||!empty)return;

  if(regs.length===0){
    tbody.innerHTML='';
    empty.style.display='block';
    empty.textContent=busq?'No se encontraron resultados':'No hay registros para el día '+fmtFechaConDia(fechaTrabajo);
    keysVisiblesDesc=[];
    renderPaginacionDesc(0,0,0);
    sincronizarSelTodos();
    actualizarContadorEnviar();
    return;
  }

  empty.style.display='none';
  const tp=Math.max(1,Math.ceil(regs.length/REGISTROS_POR_PAGINA_DESC));
  if(paginaDesc>tp)paginaDesc=tp;
  if(paginaDesc<1)paginaDesc=1;
  const ini=(paginaDesc-1)*REGISTROS_POR_PAGINA_DESC;
  const pag=regs.slice(ini,ini+REGISTROS_POR_PAGINA_DESC);
  keysVisiblesDesc=pag.map(function(r){return r.key;});

  const cf=detectarIdsRepetidosPorFecha(regs);
  const cg=detectarIdsRepetidosGlobal(regs);
  const dr=detectarDireccionesRepetidas(regs);

  tbody.innerHTML=pag.map(function(r){return filaHTMLTabla(r,cf,cg,dr);}).join('');
  renderPaginacionDesc(tp,regs.length,paginaDesc);
  sincronizarSelTodos();
  actualizarContadorEnviar();
  actualizarBotonGuardar();
  sincronizarScrollHorizontal();
}

function sincronizarScrollHorizontal(){
  const top=document.getElementById('scrollTop');
  const bottom=document.getElementById('scrollBottom');
  if(!top||!bottom)return;
  top.onscroll=null;bottom.onscroll=null;
  top.onscroll=function(){bottom.scrollLeft=top.scrollLeft;};
  bottom.onscroll=function(){top.scrollLeft=bottom.scrollLeft;};
}

// PUNTO 3: Barra de paginación más abajo para dejar ver el menú desplegable completo
function renderPaginacionDesc(tp,total,pag){
  const cont=document.getElementById('paginacionDesc');
  if(!cont)return;
  if(tp<=1){
    cont.innerHTML=total>0?'<div class="bd-paginacion-info">Mostrando '+formatoEntero(total)+' de '+formatoEntero(total)+' registros</div>':'';
    return;
  }
  const ini=(pag-1)*REGISTROS_POR_PAGINA_DESC;
  const fin=Math.min(ini+REGISTROS_POR_PAGINA_DESC,total);
  let h='<div class="bd-paginacion-info">Página '+pag+' de '+tp+' | '+formatoEntero(ini+1)+'-'+formatoEntero(fin)+' de '+formatoEntero(total)+' registros</div>';
  h+=pag>1?'<button class="btn-bd-pag-nav" onclick="irAPaginaDesc('+(pag-1)+')">‹ Anterior</button>':'<button class="btn-bd-pag-nav" disabled>‹ Anterior</button>';

  const pI=Math.max(1,pag-2);
  const pF=Math.min(tp,pag+2);
  if(pI>1){
    h+='<button class="btn-bd-pag" onclick="irAPaginaDesc(1)">1</button>';
    if(pI>2)h+='<span style="color:var(--text-muted);padding:0 4px">...</span>';
  }
  for(let i=pI;i<=pF;i++){
    h+=i===pag?'<button class="btn-bd-pag activa">'+i+'</button>':'<button class="btn-bd-pag" onclick="irAPaginaDesc('+i+')">'+i+'</button>';
  }
  if(pF<tp){
    if(pF<tp-1)h+='<span style="color:var(--text-muted);padding:0 4px">...</span>';
    h+='<button class="btn-bd-pag" onclick="irAPaginaDesc('+tp+')">'+tp+'</button>';
  }
  h+=pag<tp?'<button class="btn-bd-pag-nav" onclick="irAPaginaDesc('+(pag+1)+')">Siguiente ›</button>':'<button class="btn-bd-pag-nav" disabled>Siguiente ›</button>';
  cont.innerHTML=h;
}
window.irAPaginaDesc=function(p){paginaDesc=p;render();document.querySelector('.tabla-scroll-vertical')?.scrollTo({top:0});};

function ordenarPorFechaDireccionId(regs){
  regs.sort(function(a,b){
    return(a.fecha||'').localeCompare(b.fecha||'')||normDir(dirDe(a)).localeCompare(normDir(dirDe(b)))||(a.idPedido||'').toString().localeCompare((b.idPedido||'').toString());
  });
  return regs;
}

function ordenarPorFechaYId(regs){
  regs.sort(function(a,b){
    return(a.fecha||'').localeCompare(b.fecha||'')||(a.idPedido||'').toString().localeCompare((b.idPedido||'').toString());
  });
  return regs;
}

function detectarDireccionesRepetidas(regs){const c={};regs.forEach(function(r){const d=normDir(dirDe(r));if(d&&r.fecha){const k=r.fecha+'|'+d;c[k]=(c[k]||0)+1;}});return c;}
function detectarIdsRepetidosPorFecha(regs){const c={};regs.forEach(function(r){const id=(r.idPedido||'').toString().trim().toUpperCase();if(id&&r.fecha){const k=r.fecha+'|'+id;c[k]=(c[k]||0)+1;}});return c;}
function detectarIdsRepetidosGlobal(regs){const c={};regs.forEach(function(r){const id=(r.idPedido||'').toString().trim().toUpperCase();if(id)c[id]=(c[id]||0)+1;});return c;}

function filaHTMLTabla(r,cf,cg,dr){
  const b2c=(seccionActiva==='b2c');
  const id=(r.idPedido||'').toString().trim().toUpperCase();
  const clave=(r.fecha||'')+'|'+id;
  const misma=id&&cf[clave]>1;
  const otra=!misma&&id&&cg[id]>1;
  const dirShow=dirDe(r);
  const dirKey=(r.fecha||'')+'|'+normDir(dirShow);
  const dirRep=dr[dirKey]>1;
  const sel=seleccionadosDesc.has(r.key)?'checked':'';

  let clase='';let ind='';
  if(misma){clase+='id-repetido ';ind='<span style="color:#fff;background:#e74c3c;padding:2px 6px;border-radius:4px;font-size:.7em;font-weight:700">x'+cf[clave]+'</span>';}
  else if(otra){clase+='id-repetido-otro ';ind='<span style="color:#fff;background:#ff8c00;padding:2px 6px;border-radius:4px;font-size:.7em;font-weight:700">x'+cg[id]+'</span>';}

  if(r.otroPalet)clase+='fila-amarillo ';
  const cands=(r.candidatos&&r.candidatos.length)?r.candidatos:null;
  const debeElegir=cands&&cands.length>1&&!r.transporte;
  if(debeElegir)clase+='fila-elegir-movil ';
  const tieneCambioFecha=cambiosFechaLocales[r.key]!==undefined;
  if(tieneCambioFecha)clase+='fila-fecha-modificada ';
  if(r.esAdmin)clase+='fila-admin ';

  const bp=r.pendiente?'<span class="badge badge-pendiente">SIN GUARDAR</span>':'';
  const badgeAdmin=r.esAdmin?'<span class="badge badge-admin">ADMIN</span>':'';
  const indicadorCambio=tieneCambioFecha?'<span style="color:var(--accent-orange);font-size:.7em;font-weight:700;margin-left:4px">✏️</span>':'';
  const fechaMostrar=tieneCambioFecha?cambiosFechaLocales[r.key].nuevaFecha:r.fecha;

  const celdaFecha='<td><div class="fecha-cell-wrap"><input type="date" value="'+(fechaMostrar||'')+'" onchange="cambiarFechaFila(\''+r.key+'\', this.value, '+(r.pendiente?true:false)+')"></div>'+bp+indicadorCambio+badgeAdmin+'</td>';
  const celdaSel='<td class="td-sel"><input type="checkbox" style="width:16px;height:16px;" '+sel+' onchange="toggleSeleccionDesc(\''+r.key+'\', this.checked)"></td>';

  // Observación y Transporte con soporte directo
  let obs='<td><div class="obs-combo-wrap"><input type="text" id="obs_input_'+r.key+'" value="'+(r.observacion||'').replace(/"/g,'&quot;')+'" oninput="filtrarComboObs(\''+r.key+'\', this.value)" onchange="actualizarObservacionRegistro(\''+r.key+'\', this.value)" onfocus="abrirComboObs(\''+r.key+'\')"><button class="combo-arrow" onclick="toggleComboObs(\''+r.key+'\')">▼</button><div class="combo-list" id="combo_obs_'+r.key+'"></div></div></td>';
  let trans='<td><div class="filtro-combo" style="margin:0"><input type="text" id="trans_input_'+r.key+'" value="'+(r.transporte||'').replace(/"/g,'&quot;')+'" style="width:120px;padding-right:22px" oninput="filtrarComboTransporte(\''+r.key+'\', this.value)" onchange="actualizarTransporteRegistro(\''+r.key+'\', this.value)" onfocus="abrirComboTransporte(\''+r.key+'\')"><button class="combo-arrow" onclick="toggleComboTransporte(\''+r.key+'\')">▼</button><div class="combo-list" id="combo_trans_'+r.key+'"></div></div>'+(debeElegir?'<div style="color:var(--accent-orange);font-size:.7em;font-weight:700">Elige: '+cands.join(' / ')+'</div>':'')+'</td>';
  let rango='<td><span class="badge badge-'+(r.rango||'').toLowerCase()+'">'+(r.rango||'')+'</span></td>';

  if(r.pendiente){
    rango='<td class="celda-edit"><select onchange="editarRangoPendiente(\''+r.key+'\', this.value)"><option value="">--</option><option value="AM" '+(r.rango==='AM'?'selected':'')+'>AM</option><option value="PM" '+(r.rango==='PM'?'selected':'')+'>PM</option><option value="B2C" '+(r.rango==='B2C'?'selected':'')+'>B2C</option><option value="ADM" '+(r.rango==='ADM'?'selected':'')+'>ADM</option><option value="QDM" '+(r.rango==='QDM'?'selected':'')+'>QDM</option></select></td>';
  }

  const acc='<td class="td-otro-palet"><input type="checkbox" '+(r.otroPalet?'checked':'')+' onchange="toggleOtroPalet(\''+r.key+'\', '+(r.pendiente?true:false)+', this.checked)" title="Otro palet"></td><td class="td-acciones" style="text-align:center;vertical-align:middle"><button class="btn-acc btn-borrar" onclick="pedirBorrarRegistro(\''+r.key+'\',\''+r.anio+'\',\''+r.mes+'\','+(r.pendiente?true:false)+')" title="Eliminar">🗑️</button></td>';
  const valorCelda='<td>'+formatoMonedaAlineado(r.valor)+'</td>';

  if(b2c){
    return '<tr class="'+clase+'">'+celdaSel+celdaFecha+'<td><span class="badge badge-unidad">'+(r.unidad||'')+'</span></td><td><strong>'+(r.idPedido||'')+'</strong>'+ind+'</td><td>'+(r.nombre||'')+'</td><td>'+(r.celular||'')+'</td><td>'+(r.email||'')+'</td><td>'+dirShow+(dirRep?' <span style="color:var(--accent-orange);font-size:.7em;font-weight:700">[misma dir x'+dr[dirKey]+']</span>':'')+'</td><td>'+canonComuna(r.comuna)+'</td>'+valorCelda+obs+trans+rango+acc+'</tr>';
  }
  return '<tr class="'+clase+'">'+celdaSel+celdaFecha+'<td><span class="badge badge-unidad">'+(r.unidad||'')+'</span></td><td><strong>'+(r.idPedido||'')+'</strong>'+ind+'</td><td>'+(r.nombre||'')+'</td><td>'+dirShow+(dirRep?' <span style="color:var(--accent-orange);font-size:.7em;font-weight:700">[misma dir x'+dr[dirKey]+']</span>':'')+'</td><td>'+canonComuna(r.comuna)+'</td>'+valorCelda+obs+trans+rango+acc+'</tr>';
}

window.editarRangoPendiente=function(k,v){
  const p=pendientesAMPM.find(function(p){return p.key===k;})||pendientesADM.find(function(p){return p.key===k;})||pendientesQDM.find(function(p){return p.key===k;})||pendientesB2C.find(function(p){return p.key===k;});
  if(p)p.reg.rango=v;
};

window.toggleOtroPalet=function(key,esPend,checked){
  if(esPend){
    const p=pendientesAMPM.find(function(p){return p.key===key;})||pendientesADM.find(function(p){return p.key===key;})||pendientesQDM.find(function(p){return p.key===key;})||pendientesB2C.find(function(p){return p.key===key;});
    if(p){p.reg.otroPalet=checked;render();}
  }else{
    outer:for(const a of Object.keys(cache)){
      for(const m of Object.keys(cache[a]||{})){
        if(cache[a][m]&&cache[a][m][key]){
          cache[a][m][key].otroPalet=checked;
          update(ref(db,RUTA_BASE+'/'+a+'/'+m+'/'+key),{otroPalet:checked});
          break outer;
        }
      }
    }
    render();
  }
};

function actualizarBotonGuardar(){
  const b=document.getElementById('btnGuardarAmpm');
  if(!b)return;
  b.style.display='inline-block';
  const numCambios=Object.keys(cambiosFechaLocales).length;
  if(numCambios>0){
    b.textContent='GUARDAR ('+numCambios+' cambios pendientes)';
    b.style.background='var(--accent-orange)';
  }else{
    b.textContent='GUARDAR';
    b.style.background='var(--accent-blue)';
  }
}

window.guardarPendientesSeccion=function(){
  const lista=pendientesDeSeccion();
  const numCambiosFecha=Object.keys(cambiosFechaLocales).length;
  if(!lista.length&&numCambiosFecha===0){toast('No hay nada por guardar','info');return;}
  const sR=lista.filter(function(p){return!p.reg.rango;}).length;
  const sT=lista.filter(function(p){return!p.reg.transporte;}).length;
  if(sR||sT){
    toast('Faltan RANGO y/o TRANSPORTE','err');
    alert('Faltan campos obligatorios: Rango o Transporte');
    return;
  }
  toast('Guardando...','info');
  const promesas=[];
  lista.forEach(function(p){
    promesas.push(push(ref(db,RUTA_BASE+'/'+p.anio+'/'+p.mes),p.reg));
    if(!cache[p.anio])cache[p.anio]={};
    if(!cache[p.anio][p.mes])cache[p.anio][p.mes]={};
    cache[p.anio][p.mes][p.key]=p.reg;
  });
  if(seccionActiva==='ampm')pendientesAMPM=[];
  else if(seccionActiva==='adm')pendientesADM=[];
  else if(seccionActiva==='qdm')pendientesQDM=[];
  else if(seccionActiva==='b2c')pendientesB2C=[];
  Promise.all(promesas).then(function(){
    toast('Registros guardados correctamente','ok');
    actualizarBotonGuardar();
    render();
    cargarDatos();
  }).catch(function(e){toast('Error: '+e.message,'err');});
};

window.pedirBorrarRegistro=function(key,anio,mes,esPend){
  pedirClave(function(){
    if(!confirm('El registro se eliminará de la DESCRIPCION, de la BASE DE DATOS y de FIREBASE.\n¿Confirmas?'))return;
    if(esPend){
      [pendientesAMPM,pendientesADM,pendientesQDM,pendientesB2C].forEach(function(lista){
        const i=lista.findIndex(function(p){return p.key===key;});
        if(i>=0)lista.splice(i,1);
      });
      if(cache[anio]&&cache[anio][mes]&&cache[anio][mes][key])delete cache[anio][mes][key];
      delete cambiosFechaLocales[key];
      toast('Eliminado de la plataforma','ok');
      render();
      return;
    }
    if(cache[anio]&&cache[anio][mes]&&cache[anio][mes][key])delete cache[anio][mes][key];
    delete cambiosFechaLocales[key];
    remove(ref(db,RUTA_BASE+'/'+anio+'/'+mes+'/'+key)).then(function(){
      toast('Eliminado de plataforma y Firebase','ok');
      render();
    }).catch(function(e){toast('Error al borrar: '+e.message,'err');});
  });
};

window.enviarSeleccion=function(){
  if(seleccionadosDesc.size===0){toast('Selecciona al menos una fila','err');return;}
  let enviados=0;
  seleccionadosDesc.forEach(function(key){
    let reg=null;
    outer:for(const a of Object.keys(cache)){
      for(const m of Object.keys(cache[a]||{})){
        if(cache[a][m]&&cache[a][m][key]){reg=Object.assign({},cache[a][m][key]);break outer;}
      }
    }
    if(!reg){
      const p=pendientesAMPM.find(function(p){return p.key===key;})||pendientesADM.find(function(p){return p.key===key;})||pendientesQDM.find(function(p){return p.key===key;})||pendientesB2C.find(function(p){return p.key===key;});
      if(p)reg=Object.assign({},p.reg);
    }
    if(!reg)return;
    if(cambiosFechaLocales[key])reg.fecha=cambiosFechaLocales[key].nuevaFecha;
    reorganizarBitacoraPorCambioTransporte(key,reg);
    enviados++;
  });
  if(enviados>0){
    toast(enviados+' registro(s) enviado(s) a BITACORAS','ok');
    seleccionadosDesc.clear();
    render();
  }
};

window.cambiarFechaFila=function(key,nuevaFecha,esPend){
  if(!nuevaFecha)return;
  const parts=nuevaFecha.split('-');
  const nA=parts[0],nM=parts[1];
  let p=pendientesAMPM.find(function(p){return p.key===key;})||pendientesADM.find(function(p){return p.key===key;})||pendientesQDM.find(function(p){return p.key===key;})||pendientesB2C.find(function(p){return p.key===key;});
  if(p){
    cambiosFechaLocales[key]={esPendiente:true,nuevaFecha:nuevaFecha,nuevaAnio:nA,nuevaMes:nM};
    toast('Fecha cambiada a '+fmtFechaConDia(nuevaFecha),'info');
    render();
    return;
  }
  for(const a of Object.keys(cache)){
    for(const m of Object.keys(cache[a]||{})){
      if(cache[a][m]&&cache[a][m][key]){
        cambiosFechaLocales[key]={esPendiente:false,anioOriginal:a,mesOriginal:m,nuevaFecha:nuevaFecha,nuevaAnio:nA,nuevaMes:nM};
        toast('Fecha cambiada a '+fmtFechaConDia(nuevaFecha),'info');
        render();
        return;
      }
    }
  }
};

// Formulario de nuevo registro
document.getElementById('formReg')?.addEventListener('submit',function(e){
  e.preventDefault();
  const fecha=document.getElementById('fFecha').value;
  if(!fecha){toast('Seleccione fecha','err');return;}
  const parts=fecha.split('-');
  const a=parts[0],m=parts[1];
  const rango=document.getElementById('fRango').value;
  if(!rango){toast('Elija RANGO','err');return;}
  const tipoSec=tipoDeSeccion();
  const esAdm=rolActual==='admin';
  const idPedido=document.getElementById('fId').value.trim();
  const nombre=document.getElementById('fNombre').value.trim().toUpperCase();
  const direccion=document.getElementById('fDireccion').value.trim().toUpperCase();
  const comuna=canonComuna(document.getElementById('fComuna').value);
  const valor=parseFloat(document.getElementById('fValor').value)||0;
  const obs=document.getElementById('fObs').value.toUpperCase();
  const transporte=document.getElementById('fTransporte').value;
  const unidad=document.getElementById('fUnidad').value;

  let reg={
    fecha:fecha,unidad:unidad,idPedido:idPedido,nombre:nombre,direccion:direccion,comuna:comuna,
    valor:valor,observacion:obs,transporte:transporte,rango:rango,tipo:tipoSec,
    otroPalet:false,esAdmin:esAdm,usuario:emailUsuarioActual,creado:new Date().toISOString(),transporteManual:true
  };

  if(!reg.transporte){
    reg.transporteManual=false;
    if(esAntesDe1400())reg=autocompletarTransportePM(reg);
    else if(esDespuesDe1401()){
      const diaManana=obtenerDiaSemanaManana();
      reg=autocompletarTransporteAM(reg,diaManana);
    }
  }

  const pendItem={anio:a,mes:m,key:'pend_nr_'+Date.now()+'_'+Math.random().toString(36).substr(2,5),reg:reg};
  if(tipoSec==='AMPM')pendientesAMPM.push(pendItem);
  else if(tipoSec==='ADM')pendientesADM.push(pendItem);
  else if(tipoSec==='QDM')pendientesQDM.push(pendItem);
  else if(tipoSec==='B2C')pendientesB2C.push(pendItem);

  toast('Agregado. Presiona GUARDAR.','info');
  limpiar();
  paginaDesc=1;
  render();
  actualizarBotonGuardar();
});

window.limpiar=function(){
  document.getElementById('formReg')?.reset();
  const f=document.getElementById('fFecha');
  if(f)f.value=new Date().toISOString().split('T')[0];
};

// Renderizado de Bitácoras
function renderizarTodasBitacoras(){
  BITACORAS_UNIFICADAS.forEach(function(bit){renderizarBitacora(bit.key,bit.label,bit.domId);});
  BITACORAS_B2C.forEach(function(bit){renderizarBitacora(bit.key,bit.label,bit.domId);});
}

function renderizarBitacora(key,label,domId){
  const cont=document.getElementById(domId);
  if(!cont)return;
  const data=bitacorasData[key]||{filas:[],footer:{transporte:label,fecha:'',ruta:'',responsable:'',firma:''}};
  let html='<div class="bitacora-wrapper"><div class="bitacora-header-info">BITACORA '+label+'</div><table class="bitacora-table"><thead><tr><th style="width:40px;">N</th><th>REQUIRENTE</th><th>DOCUMENTOS</th><th>CLIENTE</th><th>DIRECCION</th><th>COMUNA</th><th>OBS</th></tr></thead><tbody>';

  for(let i=0;i<15;i++){
    const fila=data.filas[i]||{requirente:'',documentos:'',cliente:'',direccion:'',comuna:'',obs:'',esAdmin:false};
    const filaClass=fila.esAdmin?' class="fila-admin-bit"':'';
    html+='<tr'+filaClass+'><td class="num-col">'+(i+1)+'</td>'+
      '<td><input type="text" id="bit_'+key+'_'+i+'_requirente" value="'+(fila.requirente||'').replace(/"/g,'&quot;')+'"></td>'+
      '<td><input type="text" id="bit_'+key+'_'+i+'_documentos" value="'+(fila.documentos||'').replace(/"/g,'&quot;')+'"></td>'+
      '<td><input type="text" id="bit_'+key+'_'+i+'_cliente" value="'+(fila.cliente||'').replace(/"/g,'&quot;')+'"></td>'+
      '<td><input type="text" id="bit_'+key+'_'+i+'_direccion" value="'+(fila.direccion||'').replace(/"/g,'&quot;')+'"></td>'+
      '<td><input type="text" id="bit_'+key+'_'+i+'_comuna" value="'+(fila.comuna||'').replace(/"/g,'&quot;')+'"></td>'+
      '<td><input type="text" id="bit_'+key+'_'+i+'_obs" value="'+(fila.obs||'').replace(/"/g,'&quot;')+'"></td></tr>';
  }

  html+='</tbody></table><table class="bitacora-footer-table"><thead><tr><th>TRANSPORTE</th><th>FECHA</th><th>RUTA</th><th>RESPONSABLE</th><th>FIRMA</th></tr></thead><tbody><tr>'+
    '<td style="background:#fff"><input type="text" id="bit_'+key+'_footer_transporte" value="'+(data.footer.transporte||'').replace(/"/g,'&quot;')+'"></td>'+
    '<td style="background:#fff"><input type="date" id="bit_'+key+'_footer_fecha" value="'+(data.footer.fecha||'')+'"></td>'+
    '<td style="background:#fff"><input type="text" id="bit_'+key+'_footer_ruta" value="'+(data.footer.ruta||'').replace(/"/g,'&quot;')+'"></td>'+
    '<td style="background:#fff"><input type="text" id="bit_'+key+'_footer_responsable" value="'+(data.footer.responsable||'').replace(/"/g,'&quot;')+'"></td>'+
    '<td style="background:#fff"><input type="text" id="bit_'+key+'_footer_firma" value="'+(data.footer.firma||'').replace(/"/g,'&quot;')+'"></td>'+
    '</tr></tbody></table></div>';

  cont.innerHTML=html;
}

window.guardarTodasBitacoras=function(tipoBitacora){
  const bitacoras=obtenerBitacorasPorTipo(tipoBitacora);
  let guardadas=0;
  bitacoras.forEach(function(bit){
    const key=bit.key;
    const filas=[];
    for(let i=0;i<15;i++){
      const requirenteEl=document.getElementById('bit_'+key+'_'+i+'_requirente');
      if(requirenteEl){
        const fila={
          requirente:requirenteEl.value||'',
          documentos:document.getElementById('bit_'+key+'_'+i+'_documentos')?.value||'',
          cliente:document.getElementById('bit_'+key+'_'+i+'_cliente')?.value||'',
          direccion:document.getElementById('bit_'+key+'_'+i+'_direccion')?.value||'',
          comuna:document.getElementById('bit_'+key+'_'+i+'_comuna')?.value||'',
          obs:document.getElementById('bit_'+key+'_'+i+'_obs')?.value||''
        };
        if(fila.requirente||fila.documentos||fila.cliente)filas.push(fila);
      }
    }
    const footer={
      transporte:document.getElementById('bit_'+key+'_footer_transporte')?.value||'',
      fecha:document.getElementById('bit_'+key+'_footer_fecha')?.value||'',
      ruta:document.getElementById('bit_'+key+'_footer_ruta')?.value||'',
      responsable:document.getElementById('bit_'+key+'_footer_responsable')?.value||'',
      firma:document.getElementById('bit_'+key+'_footer_firma')?.value||''
    };
    bitacorasData[key]={filas:filas,footer:footer};
    update(ref(db,RUTA_BITACORAS+'/'+key),{filas:filas,footer:footer}).then(function(){guardadas++;});
  });
  setTimeout(function(){toast('Bitácoras guardadas','ok');},500);
};

async function cargarDatos(){
  toast('Cargando datos...','info');
  cache={};
  const anios=[2026,2027,2028,2029,2030];
  const tareas=[];
  anios.forEach(function(anio){
    for(let mes=1;mes<=12;mes++){
      const ms=String(mes).padStart(2,'0');
      tareas.push(get(ref(db,RUTA_BASE+'/'+anio+'/'+ms)).then(function(s){return{anio:anio,ms:ms,datos:s.val()};}).catch(function(){return null;}));
    }
  });
  const res=await Promise.all(tareas);
  let total=0;
  res.forEach(function(item){
    if(item&&item.datos){
      if(!cache[item.anio])cache[item.anio]={};
      cache[item.anio][item.ms]=item.datos;
      total+=Object.keys(item.datos).length;
    }
  });
  const loadEl=document.getElementById('loading');
  if(loadEl)loadEl.style.display='none';
  toast('Carga completa: '+total+' registros','ok');
  render();
  actualizarBotonGuardar();
  await cargarBitacoras();
}

async function cargarBitacoras(){
  try{
    const snap=await get(ref(db,RUTA_BITACORAS));
    bitacorasData=snap.val()||{};
    renderizarTodasBitacoras();
  }catch(e){console.error('Error cargando bitácoras:',e);}
}

// Global click para cerrar combos
document.addEventListener('click',function(e){
  if(!e.target.closest('.filtro-combo')&&!e.target.closest('.obs-combo-wrap')&&!e.target.closest('.fecha-wrap')&&!e.target.closest('.fecha-cell-wrap')&&!e.target.closest('.cal-popup-fila')){
    cerrarTodosCombos();
  }
});

document.addEventListener('keydown',function(e){
  if(e.key==='Escape'){cerrarTodosCombos();cerrarPassword();}
});

document.getElementById('buscar')?.addEventListener('input',function(){
  paginaDesc=1;
  render();
});

// Inicialización de fecha
const fInput=document.getElementById('fFecha');
if(fInput)fInput.value=new Date().toISOString().split('T')[0];
const temaGuardado=localStorage.getItem('temaDespachoRetail');
if(temaGuardado)cambiarTema(temaGuardado);
