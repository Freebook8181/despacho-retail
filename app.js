<!DOCTYPE html>
<html lang="es" data-theme="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Despacho Retail</title>
<meta name="description" content="Sistema de Control de Despachos y Bitácoras Logísticas" />
<meta property="og:title" content="Despacho Retail" />
<meta property="og:description" content="Sistema de Control de Despachos y Bitácoras Logísticas" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<link rel="icon" href="data:,">
<script src="https://cdn.sheetjs.com/xlsx-0.20.0/package/dist/xlsx.full.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.2/jspdf.plugin.autotable.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
<link rel="stylesheet" href="/src/index.css">
</head>
<body>
<div id="loginSection">
  <div class="login-box">
    <h1>DESPACHO RETAIL</h1>
    <div class="version">v1.0</div>
    <p>Sistema de Control de Despachos<br>2026 - 2030</p>
    <input type="email" id="loginEmail" placeholder="Correo electrónico" autocomplete="off">
    <input type="password" id="loginPass" placeholder="Contraseña" autocomplete="new-password">
    <button onclick="login()">INGRESAR AL SISTEMA</button>
    <a href="/api/download" target="_blank" download="despacho-retail-vscode.zip" style="display:inline-block;margin-top:12px;padding:10px 16px;border:1px solid var(--accent-green);color:var(--accent-green);text-decoration:none;border-radius:4px;font-weight:600;font-size:0.85em">📥 DESCARGAR CÓDIGO (.ZIP)</a>
  </div>
</div>
<div id="appSection">
  <div class="header">
    <div class="header-left"><h1>DESPACHO RETAIL v1.0</h1></div>
    <div class="header-right">
      <div class="reloj-digital"><div class="reloj-fecha" id="relojFecha">--</div><div class="reloj-hora" id="relojHora">--:--</div><div class="reloj-segundos" id="relojSeg">--</div></div>
      <div class="theme-selector">
        <button class="theme-btn" data-theme="dark" onclick="cambiarTema('dark')" title="Oscuro"></button>
        <button class="theme-btn" data-theme="light" onclick="cambiarTema('light')" title="Claro"></button>
        <button class="theme-btn" data-theme="feminino" onclick="cambiarTema('feminino')" title="Femenino"></button>
      </div>
      <a href="/api/download" target="_blank" download="despacho-retail-vscode.zip" class="btn-importar-accion" style="display:flex;align-items:center;gap:6px;text-decoration:none">📥 Bajar Código (.ZIP)</a>
      <span class="user-info"><span id="userEmail"></span></span>
      <button class="btn-logout" onclick="logout()">Salir</button>
    </div>
  </div>
  <div class="secciones-bar">
    <div class="secciones-header">
      <div class="seccion-tab active" data-seccion="ampm" onclick="cambiarSeccion('ampm')">AM/PM</div>
      <div class="seccion-tab" data-seccion="b2c" onclick="cambiarSeccion('b2c')">B2C</div>
      <div class="seccion-tab" data-seccion="adm" onclick="cambiarSeccion('adm')">ADM</div>
      <div class="seccion-tab" data-seccion="qdm" onclick="cambiarSeccion('qdm')">QDM</div>
      <div class="seccion-tab" data-seccion="bitacoras" onclick="cambiarSeccion('bitacoras')">BITACORAS</div>
      <div class="seccion-tab" data-seccion="basedatos" onclick="cambiarSeccion('basedatos')" style="display:none">BASE DE DATOS</div>
      <div class="seccion-tab" data-seccion="actividad" onclick="cambiarSeccion('actividad')" style="display:none" id="tabActividad">ACTIVIDAD</div>
      <div class="seccion-tab" data-seccion="informes" onclick="cambiarSeccion('informes')" style="display:none">INFORMES</div>
    </div>
    <div class="seccion-contenido show" id="seccionAmpm">
      <div class="submenu-header" onclick="toggleSubmenu('busquedaAmpm')"><h3>Búsqueda AM/PM</h3><button class="btn-flecha-submenu" id="flechaBusquedaAmpm">▼</button></div>
      <div class="submenu-contenido show" id="submenuBusquedaAmpm">
        <div class="busqueda-filtros">
          <label>Día:</label><select class="select-filtro" id="filtroDiaAmpm"><option value="">-- Día --</option></select>
          <label>Mes:</label><select class="select-filtro" id="filtroMesAmpm"><option value="">-- Mes --</option><option value="01">Enero</option><option value="02">Febrero</option><option value="03">Marzo</option><option value="04">Abril</option><option value="05">Mayo</option><option value="06">Junio</option><option value="07">Julio</option><option value="08">Agosto</option><option value="09">Septiembre</option><option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option></select>
          <label>Año:</label><select class="select-filtro" id="filtroAnioAmpm"><option value="">-- Año --</option><option value="2026">2026</option><option value="2027">2027</option><option value="2028">2028</option><option value="2029">2029</option><option value="2030">2030</option></select>
          <button class="btn-buscar" onclick="buscarFiltrosAMPM()">BUSCAR</button>
        </div>
      </div>
    </div>
    <div class="seccion-contenido" id="seccionB2c">
      <div class="submenu-header" onclick="toggleSubmenu('busquedaB2c')"><h3>Búsqueda B2C</h3><button class="btn-flecha-submenu" id="flechaBusquedaB2c">▼</button></div>
      <div class="submenu-contenido show" id="submenuBusquedaB2c">
        <div class="busqueda-filtros">
          <label>Día:</label><select class="select-filtro" id="filtroDiaB2c"><option value="">-- Día --</option></select>
          <label>Mes:</label><select class="select-filtro" id="filtroMesB2c"><option value="">-- Mes --</option><option value="01">Enero</option><option value="02">Febrero</option><option value="03">Marzo</option><option value="04">Abril</option><option value="05">Mayo</option><option value="06">Junio</option><option value="07">Julio</option><option value="08">Agosto</option><option value="09">Septiembre</option><option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option></select>
          <label>Año:</label><select class="select-filtro" id="filtroAnioB2c"><option value="">-- Año --</option><option value="2026">2026</option><option value="2027">2027</option><option value="2028">2028</option><option value="2029">2029</option><option value="2030">2030</option></select>
          <button class="btn-buscar" onclick="buscarFiltrosB2C()">BUSCAR</button>
        </div>
      </div>
    </div>
    <div class="seccion-contenido" id="seccionAdm">
      <div class="submenu-header" onclick="toggleSubmenu('busquedaAdm')"><h3>Búsqueda ADM</h3><button class="btn-flecha-submenu" id="flechaBusquedaAdm">▼</button></div>
      <div class="submenu-contenido show" id="submenuBusquedaAdm">
        <div class="busqueda-filtros">
          <label>Día:</label><select class="select-filtro" id="filtroDiaAdm"><option value="">-- Día --</option></select>
          <label>Mes:</label><select class="select-filtro" id="filtroMesAdm"><option value="">-- Mes --</option><option value="01">Enero</option><option value="02">Febrero</option><option value="03">Marzo</option><option value="04">Abril</option><option value="05">Mayo</option><option value="06">Junio</option><option value="07">Julio</option><option value="08">Agosto</option><option value="09">Septiembre</option><option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option></select>
          <label>Año:</label><select class="select-filtro" id="filtroAnioAdm"><option value="">-- Año --</option><option value="2026">2026</option><option value="2027">2027</option><option value="2028">2028</option><option value="2029">2029</option><option value="2030">2030</option></select>
          <button class="btn-buscar" onclick="buscarFiltrosADM()">BUSCAR</button>
        </div>
      </div>
    </div>
    <div class="seccion-contenido" id="seccionQdm">
      <div class="submenu-header" onclick="toggleSubmenu('busquedaQdm')"><h3>Búsqueda QDM</h3><button class="btn-flecha-submenu" id="flechaBusquedaQdm">▼</button></div>
      <div class="submenu-contenido show" id="submenuBusquedaQdm">
        <div class="busqueda-filtros">
          <label>Día:</label><select class="select-filtro" id="filtroDiaQdm"><option value="">-- Día --</option></select>
          <label>Mes:</label><select class="select-filtro" id="filtroMesQdm"><option value="">-- Mes --</option><option value="01">Enero</option><option value="02">Febrero</option><option value="03">Marzo</option><option value="04">Abril</option><option value="05">Mayo</option><option value="06">Junio</option><option value="07">Julio</option><option value="08">Agosto</option><option value="09">Septiembre</option><option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option></select>
          <label>Año:</label><select class="select-filtro" id="filtroAnioQdm"><option value="">-- Año --</option><option value="2026">2026</option><option value="2027">2027</option><option value="2028">2028</option><option value="2029">2029</option><option value="2030">2030</option></select>
          <button class="btn-buscar" onclick="buscarFiltrosQDM()">BUSCAR</button>
        </div>
      </div>
    </div>
    <div class="seccion-contenido" id="seccionBitacoras">
      <h3 class="basedatos-subtitulo">BITACORAS</h3>
      <div class="bitacora-tabs">
        <div class="bitacora-tab active" data-btab="unificadas" onclick="cambiarTabBitacora('unificadas')">AM/PM - ADM - QDM</div>
        <div class="bitacora-tab" data-btab="b2c" onclick="cambiarTabBitacora('b2c')">B2C</div>
      </div>
      <div class="bitacora-tab-content show" id="bitContentUnificadas">
        <div class="bitacora-seccion">
          <div class="bitacora-actions">
            <button class="btn-guardar-bitacora" onclick="guardarTodasBitacoras('unificadas')">GUARDAR TODO</button>
            <button class="btn-exportar-bitacora" onclick="abrirModalExportarBitacoras('unificadas')">EXPORTAR EXCEL</button>
            <button class="btn-jpeg-bitacora" onclick="abrirModalJPEGBitacoras('unificadas')">EXPORTAR JPEG</button>
            <button class="btn-imprimir-bitacora" onclick="abrirModalImprimirBitacoras('unificadas')">IMPRIMIR</button>
            <button class="btn-borrar-bitacora-todo" onclick="abrirModalBorrarBitacoraTodo('unificadas')">BORRAR TODO</button>
            <button class="btn-borrar-bitacora-admin" id="btnBorrarBitacoraAdminU" onclick="abrirModalBorrarBitacoraAdmin('unificadas')" style="display:none">BORRAR ADMIN</button>
          </div>
          <div class="bitacora-seccion-titulo">BITACORAS AM/PM - ADM - QDM</div>
          <div id="bitacoraMovil1" class="bitacora-movil-content"></div>
          <div id="bitacoraMovil2" class="bitacora-movil-content"></div>
          <div id="bitacoraMovil3" class="bitacora-movil-content"></div>
          <div id="bitacoraMovil4" class="bitacora-movil-content"></div>
          <div id="bitacoraMovil5" class="bitacora-movil-content"></div>
          <div id="bitacoraMovil6" class="bitacora-movil-content"></div>
          <div id="bitacoraSpot" class="bitacora-movil-content"></div>
          <div id="bitacoraSpot1" class="bitacora-movil-content"></div>
          <div id="bitacoraSpot2" class="bitacora-movil-content"></div>
        </div>
      </div>
      <div class="bitacora-tab-content" id="bitContentB2c">
        <div class="bitacora-seccion">
          <div class="bitacora-actions">
            <button class="btn-guardar-bitacora" onclick="guardarTodasBitacoras('b2c')">GUARDAR TODO</button>
            <button class="btn-exportar-bitacora" onclick="abrirModalExportarBitacoras('b2c')">EXPORTAR EXCEL</button>
            <button class="btn-jpeg-bitacora" onclick="abrirModalJPEGBitacoras('b2c')">EXPORTAR JPEG</button>
            <button class="btn-imprimir-bitacora" onclick="abrirModalImprimirBitacoras('b2c')">IMPRIMIR</button>
            <button class="btn-borrar-bitacora-todo" onclick="abrirModalBorrarBitacoraTodo('b2c')">BORRAR TODO</button>
            <button class="btn-borrar-bitacora-admin" id="btnBorrarBitacoraAdminB" onclick="abrirModalBorrarBitacoraAdmin('b2c')" style="display:none">BORRAR ADMIN</button>
          </div>
          <div class="bitacora-seccion-titulo">BITACORAS B2C</div>
          <div id="bitacoraB2cMovil1" class="bitacora-movil-content"></div>
          <div id="bitacoraB2cMovil2" class="bitacora-movil-content"></div>
          <div id="bitacoraB2cMovil3" class="bitacora-movil-content"></div>
          <div id="bitacoraB2cMovil4" class="bitacora-movil-content"></div>
          <div id="bitacoraB2cMovil5" class="bitacora-movil-content"></div>
          <div id="bitacoraB2cMovil6" class="bitacora-movil-content"></div>
          <div id="bitacoraB2cSpot" class="bitacora-movil-content"></div>
          <div id="bitacoraB2cSpot1" class="bitacora-movil-content"></div>
          <div id="bitacoraB2cSpot2" class="bitacora-movil-content"></div>
        </div>
      </div>
    </div>
    <div class="seccion-contenido" id="seccionBasedatos">
      <h3 class="basedatos-subtitulo">BASE DE DATOS</h3>
      <div class="basedatos-tabs">
        <div class="basedatos-tab active" data-tab="ampm" onclick="cambiarTabBD('ampm')">AM/PM</div>
        <div class="basedatos-tab" data-tab="b2c" onclick="cambiarTabBD('b2c')">B2C</div>
        <div class="basedatos-tab" data-tab="adm" onclick="cambiarTabBD('adm')">ADM</div>
        <div class="basedatos-tab" data-tab="qdm" onclick="cambiarTabBD('qdm')">QDM</div>
      </div>
      <div class="basedatos-tab-content show" id="tabContentAmpm">
        <div class="bd-filtro-row">
          <button class="btn-buscar" onclick="abrirModalVerFecha('AMPM')">VER MES</button>
          <label>Filtrar ID:</label><input type="text" class="bd-filtro-input" id="filtroIdAmpm" placeholder="Escribe ID..." oninput="filtrarBD('AMPM')">
          <span class="pendientes-info" id="pendientesAmpm"></span>
          <button class="btn-bd-importar" onclick="importarDesdeBD('AMPM')">IMPORTAR</button>
          <button class="btn-bd-guardar" onclick="guardarEnFirebase()">GUARDAR</button>
          <button class="btn-bd-pdf" onclick="exportarPDFBD()">EXPORTAR PDF</button>
          <button class="btn-bd-borrar-mes" onclick="abrirBorrarMes('AMPM')">BORRAR MES</button>
        </div>
        <div class="bd-resumen" id="bdResumenAmpm"></div>
        <div class="bd-descripcion-subtitulo"><span>Descripcion</span><button class="btn-borrar-desc" onclick="abrirModalBorrarDescripcion('AMPM')">BORRAR DESCRIPCION AMPM</button></div>
        <div class="basedatos-tabla-wrap"><table class="basedatos-tabla"><thead id="theadAmpm"></thead><tbody id="bdTbodyAmpm"></tbody></table></div>
        <div class="bd-paginacion" id="bdPaginacionAmpm"></div>
      </div>
      <div class="basedatos-tab-content" id="tabContentB2c">
        <div class="bd-filtro-row">
          <button class="btn-buscar" onclick="abrirModalVerFecha('B2C')">VER MES</button>
          <label>Filtrar ID:</label><input type="text" class="bd-filtro-input" id="filtroIdB2c" placeholder="Escribe ID..." oninput="filtrarBD('B2C')">
          <span class="pendientes-info" id="pendientesB2c"></span>
          <button class="btn-bd-importar" onclick="importarDesdeBD('B2C')">IMPORTAR</button>
          <button class="btn-bd-guardar" onclick="guardarEnFirebase()">GUARDAR</button>
          <button class="btn-bd-pdf" onclick="exportarPDFBD()">EXPORTAR PDF</button>
          <button class="btn-bd-borrar-mes" onclick="abrirBorrarMes('B2C')">BORRAR MES</button>
        </div>
        <div class="bd-resumen" id="bdResumenB2c"></div>
        <div class="bd-descripcion-subtitulo"><span>Descripcion</span><button class="btn-borrar-desc" onclick="abrirModalBorrarDescripcion('B2C')">BORRAR DESCRIPCION B2C</button></div>
        <div class="basedatos-tabla-wrap"><table class="basedatos-tabla"><thead id="theadB2c"></thead><tbody id="bdTbodyB2c"></tbody></table></div>
        <div class="bd-paginacion" id="bdPaginacionB2c"></div>
      </div>
      <div class="basedatos-tab-content" id="tabContentAdm">
        <div class="bd-filtro-row">
          <button class="btn-buscar" onclick="abrirModalVerFecha('ADM')">VER MES</button>
          <label>Filtrar ID:</label><input type="text" class="bd-filtro-input" id="filtroIdAdm" placeholder="Escribe ID..." oninput="filtrarBD('ADM')">
          <span class="pendientes-info" id="pendientesAdm"></span>
          <button class="btn-bd-importar" onclick="importarDesdeBD('ADM')">IMPORTAR</button>
          <button class="btn-bd-guardar" onclick="guardarEnFirebase()">GUARDAR</button>
          <button class="btn-bd-pdf" onclick="exportarPDFBD()">EXPORTAR PDF</button>
          <button class="btn-bd-borrar-mes" onclick="abrirBorrarMes('ADM')">BORRAR MES</button>
        </div>
        <div class="bd-resumen" id="bdResumenAdm"></div>
        <div class="bd-descripcion-subtitulo"><span>Descripcion</span><button class="btn-borrar-desc" onclick="abrirModalBorrarDescripcion('ADM')">BORRAR DESCRIPCION ADM</button></div>
        <div class="basedatos-tabla-wrap"><table class="basedatos-tabla"><thead id="theadAdm"></thead><tbody id="bdTbodyAdm"></tbody></table></div>
        <div class="bd-paginacion" id="bdPaginacionAdm"></div>
      </div>
      <div class="basedatos-tab-content" id="tabContentQdm">
        <div class="bd-filtro-row">
          <button class="btn-buscar" onclick="abrirModalVerFecha('QDM')">VER MES</button>
          <label>Filtrar ID:</label><input type="text" class="bd-filtro-input" id="filtroIdQdm" placeholder="Escribe ID..." oninput="filtrarBD('QDM')">
          <span class="pendientes-info" id="pendientesQdm"></span>
          <button class="btn-bd-importar" onclick="importarDesdeBD('QDM')">IMPORTAR</button>
          <button class="btn-bd-guardar" onclick="guardarEnFirebase()">GUARDAR</button>
          <button class="btn-bd-pdf" onclick="exportarPDFBD()">EXPORTAR PDF</button>
          <button class="btn-bd-borrar-mes" onclick="abrirBorrarMes('QDM')">BORRAR MES</button>
        </div>
        <div class="bd-resumen" id="bdResumenQdm"></div>
        <div class="bd-descripcion-subtitulo"><span>Descripcion</span><button class="btn-borrar-desc" onclick="abrirModalBorrarDescripcion('QDM')">BORRAR DESCRIPCION QDM</button></div>
        <div class="basedatos-tabla-wrap"><table class="basedatos-tabla"><thead id="theadQdm"></thead><tbody id="bdTbodyQdm"></tbody></table></div>
        <div class="bd-paginacion" id="bdPaginacionQdm"></div>
      </div>
    </div>
    <div class="seccion-contenido" id="seccionActividad">
      <div class="actividad-container">
        <div class="actividad-header"><h3>REGISTRO DE ACTIVIDAD</h3><button class="btn-borrar-todo" onclick="limpiarActividadAntigua()">LIMPIAR ANTIGUAS (>30 días)</button></div>
        <div class="actividad-stats">
          <div class="actividad-stat online"><div class="stat-num" id="actUsuariosOnline">0</div><div class="stat-label">Usuarios en línea</div></div>
          <div class="actividad-stat"><div class="stat-num" id="actTotalRegistros">0</div><div class="stat-label">Registros totales</div></div>
          <div class="actividad-stat"><div class="stat-num" id="actHoy">0</div><div class="stat-label">Acciones hoy</div></div>
          <div class="actividad-stat"><div class="stat-num" id="actTotalAcciones">0</div><div class="stat-label">Total acciones</div></div>
        </div>
        <div style="margin-bottom:15px"><strong style="color:var(--accent-blue);font-size:.9em">USUARIOS ACTIVOS AHORA:</strong><div id="actUsuariosActivos" style="margin-top:8px;min-height:30px"><span style="color:var(--text-muted);font-size:.85em">Cargando...</span></div></div>
        <div class="actividad-list" id="actividadList"><div class="actividad-empty">Cargando actividad...</div></div>
      </div>
    </div>
    <div class="seccion-contenido" id="seccionInformes">
      <h3 class="basedatos-subtitulo">INFORMES LOGISTICOS - BUSINESS INTELLIGENCE</h3>
      <div class="basedatos-tabs">
        <div class="basedatos-tab active" data-inftipo="AMPM" onclick="setInfTipo('AMPM')">AM/PM</div>
        <div class="basedatos-tab" data-inftipo="B2C" onclick="setInfTipo('B2C')">B2C</div>
        <div class="basedatos-tab" data-inftipo="ADM" onclick="setInfTipo('ADM')">ADM</div>
        <div class="basedatos-tab" data-inftipo="QDM" onclick="setInfTipo('QDM')">QDM</div>
      </div>
      <div id="infResultado"><div style="padding:40px;text-align:center;color:var(--text-muted);font-style:italic;"><h3 style="margin-bottom:15px;color:var(--accent-blue)">Modulo de Informes Logisticos</h3><p>Seleccione los filtros y presione <strong>GENERAR INFORME</strong> para visualizar el analisis completo.</p><p style="margin-top:10px;font-size:.85em">Datos en tiempo real desde Firebase - Analisis BI profesional</p></div></div>
    </div>
  </div>
  <div class="stats-bar">
    <div class="stat-item"><div class="val" id="sTotal">0</div><div class="lbl">Despachos</div></div>
    <div class="stat-item"><div class="val" id="sValor">$0</div><div class="lbl">Valor Total</div></div>
    <div class="stat-item"><div class="val" id="sAM">0</div><div class="lbl">Turno AM</div></div>
    <div class="stat-item"><div class="val" id="sPM">0</div><div class="lbl">Turno PM</div></div>
  </div>
  <div class="seccion-registro">
    <div class="seccion-registro-header" onclick="toggleSeccion('registro')"><h3>NUEVO REGISTRO</h3><button class="btn-flecha" id="flechaRegistro">▼</button></div>
    <div class="seccion-contenido" id="contenidoRegistro">
      <form id="formReg" class="form-fila">
        <div class="campo c-fecha">
          <label>Fecha</label>
          <input type="date" id="fFecha" required>
        </div>
        <div class="campo c-unidad"><label>Unidad Negocio</label><select id="fUnidad" required><option value="">-- Elegir --</option><option>MacOnline Distribucion</option><option>MacOnline Empresas</option><option>MacOnline Tienda Web</option><option>MacOnline Administracion</option><option>MacOnline Tiendas</option><option>Vertical Tiendas</option><option>Vertical Web</option><option>QD-Web</option><option>QD Matorista</option><option>CD Quintec</option><option>QD-Retail</option><option>SSTT Quintec</option></select></div>
        <div class="campo c-id"><label>ID Pedido</label><input type="text" id="fId" required autocomplete="off"></div>
        <div class="campo c-nombre"><label>Nombre Cliente</label><input type="text" id="fNombre" required autocomplete="off"></div>
        <div class="campo c-direccion"><label>Direccion</label><input type="text" id="fDireccion" required autocomplete="off"></div>
        <div class="campo c-comuna"><label>Comuna</label><input type="text" id="fComuna" required autocomplete="off"></div>
        <div class="campo c-valor"><label>Valor</label><input type="number" id="fValor" step="0.01" min="0" required></div>
        <div class="campo c-obs"><label>Observacion</label><input type="text" id="fObs" placeholder="Elegir o escribir" autocomplete="off"></div>
        <div class="campo c-transporte"><label>Transporte</label><select id="fTransporte" required><option value="">-- Elegir --</option><option>MOVIL 1</option><option>MOVIL 2</option><option>MOVIL 3</option><option>MOVIL 4</option><option>MOVIL 5</option><option>MOVIL 6</option><option>DON JOSE</option><option>DON RAUL</option><option>SERVICIO AM/PM</option><option>SERVICIO B2C</option><option>SERVICIO ADM</option><option>SERVICIO QDM</option><option>SPOT</option><option>SPOT 1</option><option>SPOT 2</option><option>RETIRA CLIENTE</option><option>SERVICIO 3PL</option><option>TRANSGAMBOA</option></select></div>
        <div class="campo c-rango"><label>Rango</label><select id="fRango" required><option value="">--</option><option>AM</option><option>PM</option><option>B2C</option><option>ADM</option><option>QDM</option></select></div>
        <button type="submit" class="btn-registrar">REGISTRAR</button>
        <button type="button" class="btn-limpiar" onclick="limpiar()">LIMPIAR</button>
      </form>
    </div>
  </div>
  <div class="tabla-section">
    <div class="descripcion-subtitulo"><span>Descripcion</span><span style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn-borrar-desc" onclick="abrirModalBorrarDescripcionActual()">BORRAR DESCRIPCION</button><button class="btn-eliminar-admin" id="btnEliminarAdmin" onclick="abrirModalEliminarAdmin()" style="display:none">ELIMINAR ADMIN</button></span></div>
    <div class="acciones-bar">
      <input type="text" class="buscar-input" id="buscar" placeholder="Buscar...">
      <button class="btn-importar-accion" onclick="importarExcelSegunSeccion()">IMPORTAR EXCEL</button>
      <button class="btn-exportar" onclick="abrirModalExportar()">EXPORTAR EXCEL</button>
      <button class="btn-guardar" id="btnGuardarAmpm" onclick="guardarPendientesSeccion()">GUARDAR</button>
      <button class="btn-enviar" id="btnEnviar" onclick="enviarSeleccion()">ENVIAR A BITACORA</button>
    </div>
    <div class="tabla-scroll-vertical">
      <div class="tabla-scroll-horizontal-top" id="scrollTop"><div style="min-width:1400px;height:8px"></div></div>
      <div class="tabla-scroll-horizontal" id="scrollBottom"><table><thead id="theadDesc"></thead><tbody id="tbody"></tbody></table></div>
      <div class="loading-msg" id="loading"><div class="spinner"></div>Cargando datos...</div>
      <div class="empty-msg" id="empty" style="display:none">No hay registros para hoy</div>
      <div class="bd-paginacion" id="paginacionDesc"></div>
    </div>
  </div>
</div>
<input type="file" id="importFile" accept=".xlsx,.xls,.xlsm,.xlsb,.ods,.csv,.json" style="display:none">
<datalist id="dlTransporteDesc"></datalist>
<div class="modal-overlay" id="modalOverlay">
  <div class="modal-window">
    <div class="modal-titlebar"><div class="modal-title"><span id="modalTitleText">Detalle de Pedidos</span></div><div class="modal-controls"><button class="modal-btn pdf" onclick="exportarPDFModal()" title="Exportar PDF">PDF</button><button class="modal-btn close" onclick="cerrarModal()" title="Cerrar">X</button></div></div>
    <div class="modal-info" id="modalInfo"></div>
    <div class="modal-filtro"><label>Filtrar ID Pedido:</label><input type="text" id="filtroIdModal" placeholder="Escribe ID..." oninput="aplicarFiltroIdModal()"><span class="filtro-info" id="filtroInfo"></span></div>
    <div class="modal-body" id="modalBody">
      <table><thead><tr>
        <th>Fecha<div class="filtro-combo"><input type="text" class="th-filter" id="fModFecha" placeholder="Filtrar..." oninput="filtrarComboModal('fecha', this.value)" onfocus="abrirComboModal('fecha')"><button class="combo-arrow" onclick="toggleComboModal('fecha')">▼</button><div class="combo-list" id="comboModal_fecha"></div></div></th>
        <th>Unidad<div class="filtro-combo"><input type="text" class="th-filter" id="fModUnidad" placeholder="Filtrar..." oninput="filtrarComboModal('unidad', this.value)" onfocus="abrirComboModal('unidad')"><button class="combo-arrow" onclick="toggleComboModal('unidad')">▼</button><div class="combo-list" id="comboModal_unidad"></div></div></th>
        <th>ID Pedido</th><th>Cliente</th><th>Direccion</th>
        <th>Comuna<div class="filtro-combo"><input type="text" class="th-filter" id="fModComuna" placeholder="Filtrar..." oninput="filtrarComboModal('comuna', this.value)" onfocus="abrirComboModal('comuna')"><button class="combo-arrow" onclick="toggleComboModal('comuna')">▼</button><div class="combo-list" id="comboModal_comuna"></div></div></th>
        <th>Valor</th>
        <th>Observacion<div class="filtro-combo"><input type="text" class="th-filter" id="fModObservacion" placeholder="Filtrar..." oninput="filtrarComboModal('observacion', this.value)" onfocus="abrirComboModal('observacion')"><button class="combo-arrow" onclick="toggleComboModal('observacion')">▼</button><div class="combo-list" id="comboModal_observacion"></div></div></th>
        <th>Transporte<div class="filtro-combo"><input type="text" class="th-filter" id="fModTransporte" placeholder="Filtrar..." oninput="filtrarComboModal('transporte', this.value)" onfocus="abrirComboModal('transporte')"><button class="combo-arrow" onclick="toggleComboModal('transporte')">▼</button><div class="combo-list" id="comboModal_transporte"></div></div></th>
        <th>Rango<div class="filtro-combo"><input type="text" class="th-filter" id="fModRango" placeholder="Filtrar..." oninput="filtrarComboModal('rango', this.value)" onfocus="abrirComboModal('rango')"><button class="combo-arrow" onclick="toggleComboModal('rango')">▼</button><div class="combo-list" id="comboModal_rango"></div></div></th>
      </tr></thead><tbody id="modalTbody"></tbody></table>
    </div>
    <div class="modal-paginacion" id="modalPaginacion"></div>
  </div>
</div>
<div class="overlay-centro" id="verFechaOverlay"><div class="modal-caja azul"><h3>BUSCAR POR FECHA</h3><div class="form-group"><label>Tipo:</label><input type="text" id="vfTipo" readonly style="background:var(--bg-tertiary);cursor:not-allowed"></div><div class="form-group"><label>Dia (opcional):</label><select id="vfDia"><option value="">-- Todos --</option></select></div><div class="form-group"><label>Mes:</label><select id="vfMes"><option value="">-- Todos --</option><option value="01">Enero</option><option value="02">Febrero</option><option value="03">Marzo</option><option value="04">Abril</option><option value="05">Mayo</option><option value="06">Junio</option><option value="07">Julio</option><option value="08">Agosto</option><option value="09">Septiembre</option><option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option></select></div><div class="form-group"><label>Año:</label><select id="vfAnio"><option value="2026">2026</option><option value="2027">2027</option><option value="2028">2028</option><option value="2029">2029</option><option value="2030">2030</option></select></div><div class="modal-caja-buttons"><button class="btn-mc-cancelar" onclick="cerrarModalVerFecha()">Cancelar</button><button class="btn-mc-azul" onclick="confirmarVerFecha()">VER</button></div></div></div>
<div class="overlay-centro" id="borrarMesOverlay"><div class="modal-caja roja"><h3>BORRAR MES</h3><div class="form-group"><label>Tipo:</label><input type="text" id="bmTipo" readonly style="background:var(--bg-tertiary);cursor:not-allowed"></div><div class="form-group"><label>1. Elige el mes a borrar:</label><select id="bmMes"><option value="">-- Seleccionar Mes --</option><option value="01">Enero</option><option value="02">Febrero</option><option value="03">Marzo</option><option value="04">Abril</option><option value="05">Mayo</option><option value="06">Junio</option><option value="07">Julio</option><option value="08">Agosto</option><option value="09">Septiembre</option><option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option></select></div><div class="form-group"><label>2. Elige el año:</label><select id="bmAnio"><option value="2026">2026</option><option value="2027">2027</option><option value="2028">2028</option><option value="2029">2029</option><option value="2030">2030</option></select></div><div class="info-registros" id="bmInfoRegistros">Selecciona mes y año para ver cantidad</div><div class="form-group"><label>3. Contraseña:</label><input type="password" id="bmPassword" placeholder="••••" maxlength="10"></div><div class="modal-caja-buttons"><button class="btn-mc-cancelar" onclick="cerrarBorrarMes()">Cancelar</button><button class="btn-mc-rojo" onclick="confirmarBorrarMes()">ELIMINAR</button></div></div></div>
<div class="overlay-centro" id="passwordOverlay"><div class="modal-caja roja" style="max-width:360px"><h3>CONTRASEÑA</h3><div class="form-group"><label>Ingresa la clave:</label><input type="password" id="pwInput" placeholder="••••" maxlength="10"></div><div class="modal-caja-buttons"><button class="btn-mc-cancelar" onclick="cerrarPassword()">Cancelar</button><button class="btn-mc-rojo" onclick="confirmarPassword()">Confirmar</button></div></div></div>
<div class="overlay-centro" id="borrarDescOverlay"><div class="modal-caja roja" style="max-width:450px"><h3>BORRAR DESCRIPCION</h3><p style="color:var(--text-secondary);text-align:center;margin-bottom:15px;font-size:.9em">Esta acción eliminará TODOS los registros de la descripción <strong id="bdTipoDesc">AM/PM</strong> de la plataforma y Firebase. Las BITACORAS NO serán afectadas.</p><div class="info-registros" id="bdInfoRegistros">Calculando...</div><div class="form-group"><label>Contraseña de administrador:</label><input type="password" id="bdPassword" placeholder="••••" maxlength="10"></div><div class="modal-caja-buttons"><button class="btn-mc-cancelar" onclick="cerrarModalBorrarDesc()">Cancelar</button><button class="btn-mc-rojo" onclick="confirmarBorrarDesc()">ELIMINAR DESCRIPCION</button></div></div></div>
<div class="overlay-centro" id="eliminarAdminOverlay"><div class="modal-caja verde" style="max-width:450px"><h3>ELIMINAR REGISTROS ADMIN</h3><p style="color:var(--text-secondary);text-align:center;margin-bottom:15px;font-size:.9em">Esta acción eliminará SOLO los registros marcados en VERDE (creados por el administrador).</p><div class="info-registros" id="eaInfoRegistros">Calculando...</div><div class="form-group"><label>Contraseña de administrador:</label><input type="password" id="eaPassword" placeholder="••••" maxlength="10"></div><div class="modal-caja-buttons"><button class="btn-mc-cancelar" onclick="cerrarModalEliminarAdmin()">Cancelar</button><button class="btn-mc-rojo" onclick="confirmarEliminarAdmin()">ELIMINAR SOLO ADMIN</button></div></div></div>
<div class="overlay-centro" id="borrarBitacoraTodoOverlay"><div class="modal-caja roja" style="max-width:450px"><h3 id="bbtTitulo">BORRAR TODAS LAS BITACORAS</h3><p style="color:var(--text-secondary);text-align:center;margin-bottom:15px;font-size:.9em" id="bbtDescripcion">Esta acción eliminará TODA la información de las 9 bitácoras. Esta acción es IRREVERSIBLE.</p><div class="info-registros" id="bbtInfoRegistros">Calculando...</div><div class="form-group"><label>Contraseña de administrador:</label><input type="password" id="bbtPassword" placeholder="••••" maxlength="10"></div><div class="modal-caja-buttons"><button class="btn-mc-cancelar" onclick="cerrarModalBorrarBitacoraTodo()">Cancelar</button><button class="btn-mc-rojo" onclick="confirmarBorrarBitacoraTodo()">ELIMINAR TODO</button></div></div></div>
<div class="overlay-centro" id="borrarBitacoraAdminOverlay"><div class="modal-caja verde" style="max-width:450px"><h3 id="bbaTitulo">BORRAR BITACORAS ADMIN</h3><p style="color:var(--text-secondary);text-align:center;margin-bottom:15px;font-size:.9em" id="bbaDescripcion">Esta acción eliminará SOLO los registros marcados en VERDE (creados por el administrador) de todas las bitácoras.</p><div class="info-registros" id="bbaInfoRegistros">Calculando...</div><div class="form-group"><label>Contraseña de administrador:</label><input type="password" id="bbaPassword" placeholder="••••" maxlength="10"></div><div class="modal-caja-buttons"><button class="btn-mc-cancelar" onclick="cerrarModalBorrarBitacoraAdmin()">Cancelar</button><button class="btn-mc-rojo" onclick="confirmarBorrarBitacoraAdmin()">ELIMINAR SOLO ADMIN</button></div></div></div>
<div class="exportar-modal-overlay" id="exportarModal"><div class="exportar-modal"><h3 id="expTitulo">Exportar a Excel</h3><div class="exp-fecha-row" id="expFilaFecha" style="display:none"><label>Dia:</label><select class="select-filtro" id="expDia" onchange="actualizarExpInfo()"><option value="">-- Todos --</option></select><label>Mes:</label><select class="select-filtro" id="expMes" onchange="actualizarExpInfo()"><option value="">-- Todos --</option><option value="01">Enero</option><option value="02">Febrero</option><option value="03">Marzo</option><option value="04">Abril</option><option value="05">Mayo</option><option value="06">Junio</option><option value="07">Julio</option><option value="08">Agosto</option><option value="09">Septiembre</option><option value="10">Octubre</option><option value="11">Noviembre</option><option value="12">Diciembre</option></select><label>Año:</label><select class="select-filtro" id="expAnio" onchange="actualizarExpInfo()"><option value="">-- Todos --</option><option value="2026">2026</option><option value="2027">2027</option><option value="2028">2028</option><option value="2029">2029</option><option value="2030">2030</option></select></div><div class="exp-info" id="expInfo"></div><div class="checkbox-group" id="exportarCheckboxes"></div><div class="exportar-modal-buttons"><button class="btn-exportar-cancelar" onclick="cerrarModalExportar()">Cancelar</button><button class="btn-exportar-confirmar" onclick="confirmarExportar()">Exportar</button></div></div></div>
<div class="bitacora-export-overlay" id="bitacoraExportOverlay"><div class="bitacora-export-modal"><h3 id="bitExpTitulo">Exportar Bitacoras a Excel</h3><p style="color:var(--text-secondary);text-align:center;margin-bottom:15px;font-size:.9em" id="bitExpSubtitulo">Selecciona las bitacoras que deseas exportar.</p><button class="bitacora-export-select-all" onclick="seleccionarTodasBitacoras()">Seleccionar todas</button><div class="bitacora-export-grid" id="bitacoraExportGrid"></div><div class="bitacora-export-actions"><button class="btn-exportar-cancelar" onclick="cerrarModalExportarBitacoras()">Cancelar</button><button class="btn-exportar-confirmar" onclick="confirmarExportarBitacoras()">Exportar seleccionadas</button></div></div></div>
<div class="bitacora-export-overlay" id="bitacoraJPEGOverlay"><div class="bitacora-export-modal"><h3 id="bitJpegTitulo">Exportar Bitacoras como JPEG</h3><p style="color:var(--text-secondary);text-align:center;margin-bottom:15px;font-size:.9em" id="bitJpegSubtitulo">Selecciona las bitacoras que deseas exportar como imagen.</p><button class="bitacora-export-select-all" onclick="seleccionarTodasBitacorasJPEG()">Seleccionar todas</button><div class="bitacora-export-grid" id="bitacoraJPEGGrid"></div><div class="bitacora-export-actions"><button class="btn-exportar-cancelar" onclick="cerrarModalJPEGBitacoras()">Cancelar</button><button class="btn-exportar-confirmar" onclick="confirmarExportarJPEGBitacoras()">Exportar seleccionadas</button></div></div></div>
<div class="bitacora-export-overlay" id="bitacoraPrintOverlay"><div class="bitacora-export-modal"><h3 id="bitPrintTitulo">Imprimir Bitacoras</h3><p style="color:var(--text-secondary);text-align:center;margin-bottom:15px;font-size:.9em" id="bitPrintSubtitulo">Selecciona las bitacoras que deseas imprimir.</p><button class="bitacora-export-select-all" onclick="seleccionarTodasBitacorasPrint()">Seleccionar todas</button><div class="bitacora-export-grid" id="bitacoraPrintGrid"></div><div class="bitacora-export-actions"><button class="btn-exportar-cancelar" onclick="cerrarModalImprimirBitacoras()">Cancelar</button><button class="btn-exportar-confirmar" onclick="confirmarImprimirBitacoras()">Imprimir seleccionadas</button></div></div></div>
<div class="toast" id="toast"></div>
<script type="module" src="app.js"></script>
<script>
window.addEventListener('DOMContentLoaded', function() {
  const emailInput = document.getElementById('loginEmail');
  const passInput = document.getElementById('loginPass');
  if (emailInput) emailInput.value = '';
  if (passInput) passInput.value = '';
  if (passInput) passInput.setAttribute('autocomplete', 'new-password');
});
</script>
</body>
</html>
