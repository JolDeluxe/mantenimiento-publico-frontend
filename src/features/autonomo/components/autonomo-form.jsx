import React, { useState, useMemo } from 'react';
import { Icon } from '@/components/ui/z_index';

const ZONA_HORARIA = 'America/Mexico_City';

const DEPARTAMENTOS_PROVISIONALES = [
  { id: 'PRODUCCION', nombre: 'Producción' },
  { id: 'MANTENIMIENTO', nombre: 'Mantenimiento' },
  { id: 'CALIDAD', nombre: 'Calidad y Seguridad' },
  { id: 'LOGISTICA', nombre: 'Logística' },
  { id: 'ADMINISTRACION', nombre: 'Administración' },
];

const RESPUESTAS_POR_TIPO = {
  OK_INCIDENCIA: [
    { valor: 'OK', label: 'OK', icon: 'check_circle', activeClass: 'bg-emerald-500 border-emerald-600 text-white shadow-sm' },
    { valor: 'INCIDENCIA', label: 'Incidencia', icon: 'warning', activeClass: 'bg-red-500 border-red-600 text-white shadow-sm' },
  ],
  OK_INCIDENCIA_NO_APLICA: [
    { valor: 'OK', label: 'OK', icon: 'check_circle', activeClass: 'bg-emerald-500 border-emerald-600 text-white shadow-sm' },
    { valor: 'INCIDENCIA', label: 'Incidencia', icon: 'warning', activeClass: 'bg-red-500 border-red-600 text-white shadow-sm' },
    { valor: 'NO_APLICA', label: 'N/A', icon: 'block', activeClass: 'bg-slate-500 border-slate-600 text-white shadow-sm' },
  ],
};

export const AutonomoForm = ({ maquina, secciones, onBack }) => {
  const [operarioName, setOperarioName] = useState('');
  const [departamentoId, setDepartamentoId] = useState('');
  
  // Guardamos las respuestas en un mapa de preguntaId -> { valor, observacion }
  const [respuestas, setRespuestas] = useState({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [touched, setTouched] = useState(false);
  const [imagenesFallidas, setImagenesFallidas] = useState({});

  // Obtener lista plana de todas las preguntas para facilitar validaciones
  const todasLasPreguntas = useMemo(() => {
    return secciones.flatMap((sec) => sec.preguntas);
  }, [secciones]);

  const departamentoSeleccionado = useMemo(() => {
    return DEPARTAMENTOS_PROVISIONALES.find((dep) => dep.id === departamentoId) || null;
  }, [departamentoId]);

  // Validaciones del formulario
  const validationErrors = useMemo(() => {
    const errs = {};

    if (!operarioName.trim()) {
      errs.operarioName = 'El nombre de quien realiza la revisión es requerido.';
    }

    if (!departamentoId) {
      errs.departamento = 'El departamento es requerido.';
    }

    todasLasPreguntas.forEach((preg) => {
      const resp = respuestas[preg.id];
      const opcionesAutorizadas = RESPUESTAS_POR_TIPO[preg.tipoRespuesta]?.map((opcion) => opcion.valor) || [];
      
      // Validar si es obligatoria y no se ha respondido
      if (preg.obligatoria && (!resp || !resp.valor)) {
        errs[preg.id] = 'Esta pregunta es obligatoria.';
        return;
      }

      if (resp?.valor && !opcionesAutorizadas.includes(resp.valor)) {
        errs[preg.id] = 'La respuesta seleccionada no está disponible para esta pregunta.';
        return;
      }

      // Validar si requiere observación y está vacía
      if (resp && resp.valor && preg.requiereObservacionSi?.includes(resp.valor)) {
        if (!resp.observacion || !resp.observacion.trim()) {
          errs[`obs_${preg.id}`] = 'Se requiere una observación detallada para esta respuesta.';
        }
      }
    });

    return errs;
  }, [operarioName, departamentoId, respuestas, todasLasPreguntas]);

  const isFormValid = Object.keys(validationErrors).length === 0;

  const handleSelectRespuesta = (pregId, valor) => {
    setRespuestas((prev) => {
      const current = prev[pregId] || { valor: '', observacion: '' };
      return {
        ...prev,
        [pregId]: {
          ...current,
          valor
        }
      };
    });
  };

  const handleTextChange = (pregId, observacion) => {
    setRespuestas((prev) => {
      const current = prev[pregId] || { valor: '', observacion: '' };
      return {
        ...prev,
        [pregId]: {
          ...current,
          observacion
        }
      };
    });
  };

  // Construir el payload de la vista previa
  const previewPayload = useMemo(() => {
    const formatRespuestas = Object.entries(respuestas).map(([preguntaId, resp]) => {
      const pregObj = todasLasPreguntas.find((p) => p.id === preguntaId);
      return {
        preguntaId,
        preguntaTexto: pregObj?.texto || '',
        valor: resp.valor,
        observacion: resp.observacion || null
      };
    });

    return {
      maquinaCodigo: maquina.codigo,
      maquinaNombre: maquina.nombre,
      operario: operarioName.trim(),
      departamentoId: departamentoSeleccionado?.id || null,
      departamentoNombre: departamentoSeleccionado?.nombre || null,
      departamentoContrato: 'PROVISIONAL_HARDCODED_MVP',
      fechaIso: new Date().toISOString(),
      fechaLocal: new Date().toLocaleString('es-MX', { timeZone: ZONA_HORARIA }),
      zonaHoraria: ZONA_HORARIA,
      respuestas: formatRespuestas,
      evidenciasMetadatos: null // Las evidencias físicas quedan fuera del alcance del envío en el MVP
    };
  }, [maquina, operarioName, departamentoSeleccionado, respuestas, todasLasPreguntas]);

  const handlePreviewClick = () => {
    setTouched(true);
    if (isFormValid) {
      setShowPreviewModal(true);
    }
  };

  return (
    <div className="h-full min-h-0 bg-slate-50 font-sans flex flex-col overflow-hidden">
      
      {/* Navbar Superior */}
      <header className="shrink-0 z-10 bg-slate-900 text-white shadow-md">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors text-sm font-semibold"
          >
            <Icon name="arrow_back" size="sm" />
            Volver
          </button>
          <h1 className="text-base font-bold tracking-tight">Mantenimiento Autónomo</h1>
          <div className="w-10"></div>
        </div>
      </header>

      {/* Main Container */}
      <main className="min-h-0 flex-1 w-full overflow-y-auto overscroll-contain">
        <div className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        
        {/* Info Máquina */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center gap-2.5 text-slate-800">
            <Icon name="precision_manufacturing" size="md" className="text-slate-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-900 leading-tight">{maquina.nombre}</h2>
              <p className="text-xs text-slate-500 font-mono">Código: {maquina.codigo}</p>
            </div>
          </div>
        </section>

        {/* Datos Operario */}
        <section className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Datos del Operador</h3>
          
          <div className="space-y-4">
            
            {/* Input Nombre */}
            <div className="space-y-1.5">
              <label htmlFor="operario-name-input" className="block text-xs font-semibold text-slate-700">
                Nombre de quien realiza la revisión
              </label>
              <input
                id="operario-name-input"
                type="text"
                value={operarioName}
                onChange={(e) => setOperarioName(e.target.value)}
                placeholder="Ej. Juan Pérez"
                className={`w-full text-sm border rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                  touched && validationErrors.operarioName ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200'
                }`}
              />
              {touched && validationErrors.operarioName && (
                <p className="text-[11px] text-red-500 font-medium">{validationErrors.operarioName}</p>
              )}
            </div>

            {/* Select Departamento */}
            <div className="space-y-1.5">
              <label htmlFor="dept-select" className="block text-xs font-semibold text-slate-700">
                Departamento correspondiente
              </label>
              <select
                id="dept-select"
                value={departamentoId}
                onChange={(e) => setDepartamentoId(e.target.value)}
                className={`w-full text-sm border rounded-xl px-3 py-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                  touched && validationErrors.departamento ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200'
                }`}
              >
                <option value="">Seleccione un departamento...</option>
                {DEPARTAMENTOS_PROVISIONALES.map((dep) => (
                  <option key={dep.id} value={dep.id}>{dep.nombre}</option>
                ))}
              </select>
              {touched && validationErrors.departamento && (
                <p className="text-[11px] text-red-500 font-medium">{validationErrors.departamento}</p>
              )}
            </div>

          </div>
        </section>

        {/* Cuestionario Dinámico */}
        <section className="space-y-6">
          {secciones.map((seccion) => (
            <div key={seccion.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              
              {/* Título Sección */}
              <div className="bg-slate-100 px-5 py-3 border-b border-slate-200/60">
                <h4 className="text-xs font-bold text-slate-700 leading-normal">{seccion.titulo}</h4>
              </div>

              {/* Preguntas */}
              <div className="divide-y divide-slate-100">
                {seccion.preguntas.map((preg) => {
                  const respuesta = respuestas[preg.id] || { valor: '', observacion: '' };
                  const errorMsg = validationErrors[preg.id];
                  const obsErrorMsg = validationErrors[`obs_${preg.id}`];
                  const showObs = preg.requiereObservacionSi?.includes(respuesta.valor);

                  return (
                    <div key={preg.id} className="p-5 space-y-4">
                      
                      {/* Enunciado */}
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-slate-800 leading-relaxed">
                          {preg.texto}
                          {preg.obligatoria && <span className="text-red-500 ml-0.5">*</span>}
                        </p>
                        {preg.ayuda && (
                          <p className="text-[10px] text-slate-500 leading-normal">
                            💡 {preg.ayuda}
                          </p>
                        )}
                      </div>

                      {/* Imagen de Referencia */}
                      {preg.imagenReferenciaUrl && (
                        <div className="max-w-xs rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                          {imagenesFallidas[preg.id] ? (
                            <div className="min-h-24 flex items-center justify-center gap-2 p-3 text-[11px] text-slate-500 text-center">
                              <Icon name="image_not_supported" size="sm" className="text-slate-400" />
                              No se pudo cargar la imagen de referencia.
                            </div>
                          ) : (
                            <img
                              src={preg.imagenReferenciaUrl}
                              alt={`Referencia visual para: ${preg.texto}`}
                              className="w-full h-auto object-cover max-h-32"
                              loading="lazy"
                              onError={() => {
                                setImagenesFallidas((prev) => ({ ...prev, [preg.id]: true }));
                              }}
                            />
                          )}
                        </div>
                      )}

                      {/* Botonera de Respuesta */}
                      <div className="flex gap-2">
                        {(RESPUESTAS_POR_TIPO[preg.tipoRespuesta] || []).map((opcion) => (
                          <button
                            key={opcion.valor}
                            type="button"
                            onClick={() => handleSelectRespuesta(preg.id, opcion.valor)}
                            className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border text-xs font-bold transition-all duration-150 ${
                              respuesta.valor === opcion.valor
                                ? opcion.activeClass
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            <Icon name={opcion.icon} size="xs" />
                            {opcion.label}
                          </button>
                        ))}
                      </div>

                      {/* Error de pregunta obligatoria */}
                      {touched && errorMsg && (
                        <p className="text-[11px] text-red-500 font-medium">{errorMsg}</p>
                      )}

                      {/* Caja de Observación Condicional */}
                      {showObs && (
                        <div className="space-y-1.5 pt-1 animate-fadeIn">
                          <label htmlFor={`obs-input-${preg.id}`} className="block text-[11px] font-semibold text-slate-700">
                            Detalle de la incidencia
                          </label>
                          <textarea
                            id={`obs-input-${preg.id}`}
                            value={respuesta.observacion}
                            onChange={(e) => handleTextChange(preg.id, e.target.value)}
                            placeholder="Escriba los detalles aquí..."
                            rows="2"
                            className={`w-full text-xs border rounded-xl p-2.5 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all ${
                              touched && obsErrorMsg ? 'border-red-500 ring-2 ring-red-500/10' : 'border-slate-200'
                            }`}
                          />
                          {touched && obsErrorMsg && (
                            <p className="text-[11px] text-red-500 font-medium">{obsErrorMsg}</p>
                          )}
                        </div>
                      )}

                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </section>

        {/* Botones de Envío / Vista Previa */}
        <section className="pt-4 pb-[calc(env(safe-area-inset-bottom)+6rem)] flex flex-col gap-3">
          
          {/* Botón Principal Deshabilitado del MVP */}
          <button
            type="button"
            disabled
            className="w-full bg-slate-300 text-slate-600 py-3 rounded-2xl text-sm font-bold cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Icon name="lock" size="xs" />
            Envío disponible próximamente
          </button>

          {/* Botón Vista Previa - Solo disponible en Entorno de Desarrollo (Vite tree-shaking) */}
          {import.meta.env.DEV && (
            <button
              type="button"
              onClick={handlePreviewClick}
              className="w-full bg-white text-slate-800 border border-slate-200 py-3 rounded-2xl text-sm font-bold hover:bg-slate-50 active:bg-slate-100 transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Icon name="visibility" size="xs" />
              Vista previa de datos
            </button>
          )}

          {touched && !isFormValid && (
            <p className="text-xs text-red-500 text-center font-medium">
              Por favor, complete todos los campos obligatorios antes de continuar.
            </p>
          )}

        </section>
        </div>
      </main>

      {/* Modal de Vista Previa de Datos (Exclusivo en Desarrollo) */}
      {import.meta.env.DEV && showPreviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            
            {/* Header Modal */}
            <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Icon name="bug_report" size="sm" className="text-emerald-400" />
                Vista Previa del Payload
              </h3>
              <button 
                onClick={() => setShowPreviewModal(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <Icon name="close" size="md" />
              </button>
            </div>

            {/* Contenido Modal */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs font-mono bg-slate-950 text-emerald-400">
              <pre className="whitespace-pre-wrap break-all leading-relaxed">
                {JSON.stringify(previewPayload, null, 2)}
              </pre>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="bg-slate-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-slate-800 transition-colors"
              >
                Cerrar vista previa
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default AutonomoForm;
