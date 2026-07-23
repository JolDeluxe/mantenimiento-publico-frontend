import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIAS_REPORTE } from '../constants';
import { StepperHeader } from '../components/stepper-header';
import { CategoriaSelector } from '../components/categoria-selector';
import { IncidenteSelector } from '../components/incidente-selector';
import { PlantaSelector } from '../components/planta-selector';
import { AreaSelector } from '../components/area-selector';
import { ParoProduccionPanel } from '../components/paro-produccion-panel';
import { MaquinaReadonlyCard } from '../components/maquina-readonly-card';
import { MaquinaVincularCard } from '../components/maquina-vincular-card';
import { TituloDisplay } from '../components/titulo-display';
import { ReporteResumenSidebar } from '../components/reporte-resumen-sidebar';
import { getMaquinaPrefill } from '@/features/maquinaria/api/maquinaria-api';
import { createReporte, getPlantas } from '../api/nuevo-reporte-api';
import { Icon } from '@/components/ui/z_index';
import { Input, Label } from '@/components/form/z_index';
import { GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { notify } from '@/components/notification/adaptive-notify';

/**
 * Vista de Escritorio para Creación de Reportes con 4 Pasos Completos.
 * Paso 4 implementa flujo de 2 fases: Redacción de Descripción -> Resumen Completo Pre-Envío -> Enviar.
 */
export const NuevoReporteDesktop = () => {
  const navigate = useNavigate();

  // Paso actual (1, 2, 3, 4)
  const [step, setStep] = useState(1);

  // Estados de categoría e incidente
  const [categoria, setCategoria] = useState('MAQUINARIA');
  const [incidente, setIncidente] = useState(null);
  const [tituloPersonalizado, setTituloPersonalizado] = useState('');
  const [planta, setPlanta] = useState('KAPPA');
  const [area, setArea] = useState('');
  const [descripcion, setDescripcion] = useState('');

  // Fase dentro del Paso 4 (false = Redactando, true = Revisando Resumen Final)
  const [modoResumenFinal, setModoResumenFinal] = useState(false);

  // Plantas operativas desde backend
  const [plantas, setPlantas] = useState(['KAPPA']);

  // Estados para vinculación de Maquinaria
  const [codigoMaquina, setCodigoMaquina] = useState('');
  const [loadingMaquina, setLoadingMaquina] = useState(false);
  const [maquinaData, setMaquinaData] = useState(null);
  const [errorMaquina, setErrorMaquina] = useState('');
  const [paroProduccion, setParoProduccion] = useState(false);
  const [fechaParoProduccion, setFechaParoProduccion] = useState('');
  const [impactoTemporal, setImpactoTemporal] = useState('');

  // Estados de envío y validación
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const esMaquina = categoria === 'MAQUINARIA';
  const categoriaSeleccionada = CATEGORIAS_REPORTE.find((c) => c.id === categoria) || CATEGORIAS_REPORTE[0];

  // Cargar plantas operativas desde backend al montar
  useEffect(() => {
    getPlantas()
      .then((res) => {
        const list = res?.data?.plantas || res?.data || [];
        if (Array.isArray(list) && list.length > 0) {
          setPlantas(list);
          if (list.includes('KAPPA')) {
            setPlanta('KAPPA');
          } else {
            setPlanta(list[0]);
          }
        }
      })
      .catch((err) => {
        console.error('[Get Plantas] Error:', err);
      });
  }, []);

  // Handlers
  const handleCategoriaChange = (newCat) => {
    setCategoria(newCat);
    setIncidente(null);
    setTituloPersonalizado('');
    setArea('');
    setDescripcion('');
    setMaquinaData(null);
    setCodigoMaquina('');
    setErrorMaquina('');
    setParoProduccion(false);
    setFechaParoProduccion('');
    setImpactoTemporal('');
    setModoResumenFinal(false);
    setSubmitted(false);
  };

  const handleIncidenteSelect = (inc) => {
    setIncidente(inc);
    if (!inc.permiteTituloPersonalizado) {
      setTituloPersonalizado('');
    }
  };

  const handleCambiarMaquina = () => {
    setMaquinaData(null);
    setCodigoMaquina('');
    setErrorMaquina('');
    setParoProduccion(false);
    setFechaParoProduccion('');
    setImpactoTemporal('');
  };

  const handleBuscarMaquina = async (e) => {
    if (e) e.preventDefault();
    setErrorMaquina('');

    if (!codigoMaquina.trim()) {
      setErrorMaquina('Ingresa el código de la máquina para buscar.');
      return;
    }

    setLoadingMaquina(true);
    setMaquinaData(null);

    try {
      const response = await getMaquinaPrefill(codigoMaquina.trim().toUpperCase());
      const resData = response?.data?.data || response?.data || response;
      if (resData && resData.maquinaId) {
        setMaquinaData(resData);
        setErrorMaquina('');
      } else {
        throw new Error('Formato de respuesta incorrecto');
      }
    } catch (err) {
      console.error('[Maquina Search Desktop] Error:', err);
      const backendError = err.response?.data?.errors?.[0]?.message || err.response?.data?.error || err.response?.data?.message;
      const status = err.response?.status;

      if (backendError && backendError !== 'Datos de entrada inválidos') {
        setErrorMaquina(backendError);
      } else if (status === 404) {
        setErrorMaquina('La máquina con ese código no existe o no está registrada.');
      } else if (status === 400) {
        setErrorMaquina('El código ingresado no tiene un formato válido.');
      } else if (!err.response) {
        setErrorMaquina('No se pudo conectar con el servidor. Revisa tu conexión.');
      } else {
        setErrorMaquina('No se encontró la máquina especificada.');
      }
    } finally {
      setLoadingMaquina(false);
    }
  };

  // Validaciones por paso
  const isStep1Valid = Boolean(categoria);
  const isStep2Valid = Boolean(incidente);
  const isStep3Valid = esMaquina
    ? Boolean(maquinaData && (!paroProduccion || fechaParoProduccion))
    : Boolean(planta && area.trim());
  const isStep4Valid = Boolean(
    descripcion &&
      descripcion.trim().length >= 10 &&
      (!incidente?.permiteTituloPersonalizado || (tituloPersonalizado && tituloPersonalizado.trim().length >= 10))
  );

  const stepValidations = {
    1: isStep1Valid,
    2: isStep2Valid,
    3: isStep3Valid,
    4: isStep4Valid,
  };

  const handleNextStep = () => {
    if (step === 1 && !isStep1Valid) {
      notify.error('Selecciona una categoría.');
      return;
    }
    if (step === 2 && !isStep2Valid) {
      notify.error('Selecciona un tipo de incidencia para continuar.');
      return;
    }
    if (step === 3 && !isStep3Valid) {
      if (esMaquina) {
        if (!maquinaData) notify.error('Falta vincular la máquina.');
        else if (paroProduccion && !fechaParoProduccion) notify.error('Debe seleccionar la fecha y hora del paro.');
      } else {
        if (!planta) notify.error('Selecciona una planta.');
        else if (!area.trim()) notify.error('Indica el área u ubicación.');
      }
      return;
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    if (step === 4 && modoResumenFinal) {
      setModoResumenFinal(false);
      return;
    }
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleVerResumenFinal = () => {
    setSubmitted(true);
    if (!descripcion || descripcion.trim().length < 10) {
      notify.error('Escribe una descripción de al menos 10 caracteres.');
      return;
    }
    if (incidente?.permiteTituloPersonalizado && (!tituloPersonalizado || tituloPersonalizado.trim().length < 10)) {
      notify.error('El título personalizado debe tener al menos 10 caracteres.');
      return;
    }
    setModoResumenFinal(true);
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setSubmitted(true);

    if (!incidente) {
      notify.error('Debes seleccionar un tipo de incidencia.');
      return;
    }

    if (incidente.permiteTituloPersonalizado && (!tituloPersonalizado || tituloPersonalizado.trim().length < 10)) {
      notify.error('El título personalizado debe tener al menos 10 caracteres.');
      return;
    }

    if (!descripcion || descripcion.trim().length < 10) {
      notify.error('La descripción debe tener al menos 10 caracteres.');
      return;
    }

    if (esMaquina) {
      if (!maquinaData) {
        setErrorMaquina('Debes vincular una máquina válida para continuar.');
        notify.error('Debes vincular una máquina válida.');
        return;
      }
      if (paroProduccion && !fechaParoProduccion) {
        notify.error('Debe seleccionar la fecha y hora del paro.');
        return;
      }
    } else {
      if (!planta) {
        notify.error('Selecciona una planta.');
        return;
      }
      if (!area.trim()) {
        notify.error('Indica el área u ubicación.');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('categoria', categoria);
      formData.append('incidenteId', incidente.id);
      
      const tituloFinal = incidente.permiteTituloPersonalizado
        ? tituloPersonalizado.trim()
        : incidente.titulo;
      formData.append('titulo', tituloFinal);
      formData.append('prioridad', incidente.prioridad || 'MEDIA');
      formData.append('descripcion', descripcion.trim());

      if (esMaquina && maquinaData) {
        formData.append('maquinaId', String(maquinaData.maquinaId));
        formData.append('paroProduccion', String(paroProduccion));
        if (paroProduccion && fechaParoProduccion) {
          formData.append('fechaParoProduccion', new Date(fechaParoProduccion).toISOString());
        }
      } else {
        formData.append('planta', planta);
        formData.append('area', area.trim());
      }

      const response = await createReporte(formData);
      if (response) {
        notify.success('¡Reporte creado exitosamente!');
        navigate('/activos');
      }
    } catch (err) {
      console.error('[Nuevo Reporte Desktop] Error al crear:', err);
      notify.error(err.response?.data?.error || 'Error al enviar el reporte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch overflow-hidden">
      
      {/* Columna Izquierda (7 Cols): Selección Paso a Paso */}
      <div className="lg:col-span-7 flex flex-col justify-between gap-3 h-full overflow-hidden">
        
        {/* Stepper Header Superior (shrink-0) */}
        <div className="shrink-0">
          <StepperHeader
            currentStep={step}
            onStepClick={(targetStep) => {
              if (targetStep !== 4) setModoResumenFinal(false);
              setStep(targetStep);
            }}
            stepValidations={stepValidations}
            esMaquina={esMaquina}
          />
        </div>

        {/* PASO 1: Categoría Principal */}
        {step === 1 && (
          <div className="w-full bg-white/85 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-xs flex flex-col justify-between flex-1 overflow-hidden gap-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 shrink-0">
              Paso 1: Selecciona la Categoría Principal
            </h3>
            <div className="flex-1 h-full overflow-y-auto max-h-[420px] p-2 -m-2 flex flex-col justify-center overflow-x-hidden">
              <CategoriaSelector value={categoria} onChange={handleCategoriaChange} />
            </div>
            <div className="flex justify-end pt-2 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={handleNextStep}
                className="h-10 px-5 text-xs font-bold uppercase tracking-wider rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Continuar a Tipo de Incidencia →
              </button>
            </div>
          </div>
        )}

        {/* PASO 2: Tipo de Incidencia */}
        {step === 2 && (
          <div className="w-full bg-white/85 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-xs flex flex-col justify-between flex-1 overflow-hidden gap-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 shrink-0">
              Paso 2: Tipo de Incidencia ({categoriaSeleccionada.nombre})
            </h3>
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden pr-1">
              <IncidenteSelector
                incidentes={categoriaSeleccionada.incidentes}
                incidenteSeleccionadoId={incidente?.id}
                onSelectIncidente={handleIncidenteSelect}
              />
            </div>
            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={handlePrevStep}
                className="h-10 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200/80 transition-all cursor-pointer"
              >
                ← Anterior
              </button>
              <button
                type="button"
                disabled={!isStep2Valid}
                onClick={handleNextStep}
                className="h-10 px-5 text-xs font-bold uppercase tracking-wider rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Continuar a {esMaquina ? 'Vinculación de Equipo' : 'Planta y Área'} →
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: Ubicación o Vinculación */}
        {step === 3 && (
          <div className="w-full bg-white/85 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-xs flex flex-col justify-between flex-1 overflow-hidden gap-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 shrink-0">
              Paso 3: {esMaquina ? 'Vinculación de Equipo' : 'Ubicación'}
            </h3>
            <div className="flex-1 overflow-y-auto max-h-[360px] pr-1 flex flex-col gap-3 justify-center">
              {esMaquina ? (
                <>
                  {!maquinaData ? (
                    <MaquinaVincularCard
                      codigo={codigoMaquina}
                      onCodigoChange={(val) => { setCodigoMaquina(val); setErrorMaquina(''); }}
                      onBuscar={handleBuscarMaquina}
                      loading={loadingMaquina}
                      error={errorMaquina}
                    />
                  ) : (
                    <div className="flex flex-col gap-3">
                      <MaquinaReadonlyCard
                        maquinaData={maquinaData}
                        onCambiarMaquina={handleCambiarMaquina}
                      />
                      <ParoProduccionPanel
                        paroProduccion={paroProduccion}
                        onChangeParoProduccion={setParoProduccion}
                        fechaParoProduccion={fechaParoProduccion}
                        onChangeFechaParoProduccion={setFechaParoProduccion}
                        impactoTemporal={impactoTemporal}
                        onChangeImpactoTemporal={setImpactoTemporal}
                        submitted={submitted}
                      />
                    </div>
                  )}
                </>
              ) : (
                <div className="flex flex-col gap-3">
                  <PlantaSelector
                    plantas={plantas}
                    plantaSeleccionada={planta}
                    onChangePlanta={setPlanta}
                    error={submitted && !planta}
                  />
                  <AreaSelector
                    plantaSeleccionada={planta}
                    areaSeleccionada={area}
                    onChangeArea={setArea}
                    error={submitted && !area.trim()}
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 shrink-0">
              <button
                type="button"
                onClick={handlePrevStep}
                className="h-10 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200/80 transition-all cursor-pointer"
              >
                ← Anterior
              </button>
              <button
                type="button"
                disabled={!isStep3Valid}
                onClick={handleNextStep}
                className="h-10 px-5 text-xs font-bold uppercase tracking-wider rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Continuar a Descripción →
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: Detalles (Fase 1: Redacción | Fase 2: Resumen Pre-Envío) */}
        {step === 4 && (
          <div className="w-full bg-white/85 backdrop-blur-xl border border-white/50 p-4 rounded-2xl shadow-xs flex flex-col justify-between flex-1 overflow-hidden gap-3">
            {!modoResumenFinal ? (
              /* FASE 1: Redacción de Descripción y Título */
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 shrink-0">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Paso 4: Redacción de la Descripción Detallada
                  </h3>
                  <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    FASE 1 DE 2
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[350px] pr-1 flex flex-col gap-3.5">
                  <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <TituloDisplay
                      incidente={incidente}
                      tituloPersonalizado={tituloPersonalizado}
                      onTituloPersonalizadoChange={setTituloPersonalizado}
                      maquinaData={maquinaData}
                      submitted={submitted}
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 p-3.5 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                    <div className="flex justify-between items-center px-0.5">
                      <Label htmlFor="descripcionDesktopInput" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Descripción detallada del problema *
                      </Label>
                      <span className="text-[9px] font-bold text-slate-400">
                        {descripcion.length} caracteres
                      </span>
                    </div>
                    <Input
                      id="descripcionDesktopInput"
                      name="descripcionDesktopInput"
                      multiline={true}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Describe la falla observada, síntomas o detalles del problema (mínimo 10 caracteres)..."
                      error={submitted && (!descripcion.trim() || descripcion.trim().length < 10)}
                      helperText={
                        submitted && (!descripcion.trim() || descripcion.trim().length < 10)
                          ? 'La descripción es obligatoria y debe tener al menos 10 caracteres.'
                          : ''
                      }
                      className="min-h-[110px] bg-white/70 border-slate-200 focus:bg-white rounded-xl p-3 text-xs"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="h-10 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200/80 transition-all cursor-pointer"
                  >
                    ← Regresar a {esMaquina ? 'Equipo' : 'Ubicación'}
                  </button>
                  
                  <button
                    type="button"
                    disabled={!isStep4Valid}
                    onClick={handleVerResumenFinal}
                    className="h-10 px-5 text-xs font-bold uppercase tracking-wider rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed text-white shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Ver Resumen Final →</span>
                  </button>
                </div>
              </>
            ) : (
              /* FASE 2: Resumen Completo del Reporte antes de Enviar */
              <>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2 shrink-0">
                  <div className="flex items-center gap-2">
                    <Icon name="fact_check" size="18px" className="text-emerald-600" />
                    <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Resumen Completo del Reporte
                    </h3>
                  </div>
                  <span className="text-[9px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    CONFIRMACIÓN FINAL
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto max-h-[350px] pr-1 flex flex-col gap-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Categoría</span>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Icon name={categoriaSeleccionada.icon} size="16px" className="text-emerald-600" />
                        <span>{categoriaSeleccionada.nombre}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Incidencia</span>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Icon name={incidente?.icon || 'report_problem'} size="16px" className="text-emerald-600" />
                        <span>{incidente ? incidente.nombre : 'Sin seleccionar'}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 sm:col-span-2 pt-2 border-t border-slate-200/60">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Equipo / Ubicación</span>
                      <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                        <Icon name={esMaquina ? 'precision_manufacturing' : 'location_on'} size="16px" className="text-emerald-600" />
                        <span>
                          {esMaquina
                            ? maquinaData
                              ? `${maquinaData.nombre} [${maquinaData.codigo}] — Planta ${maquinaData.planta}`
                              : 'Equipo sin vincular'
                            : `Planta ${planta} — ${area}`}
                        </span>
                      </div>
                      {esMaquina && maquinaData && paroProduccion && (
                        <div className="flex items-center gap-2 text-[10px] font-bold text-red-600 bg-red-50 border border-red-200/80 p-2 rounded-xl mt-1">
                          <Icon name="error" size="14px" className="shrink-0 text-red-500" />
                          <span>PARO DE PRODUCCIÓN — {fechaParoProduccion ? new Date(fechaParoProduccion).toLocaleString() : 'Hora requerida'}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-1 sm:col-span-2 pt-2 border-t border-slate-200/60">
                      <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Descripción Ingresada</span>
                      <p className="text-xs font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                        {descripcion}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="h-10 px-4 text-xs font-bold uppercase tracking-wider rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200/80 transition-all cursor-pointer"
                  >
                    ← Editar Descripción
                  </button>
                  
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={handleSubmit}
                    className="relative overflow-hidden h-11 px-8 text-xs font-bold uppercase tracking-wider rounded-2xl bg-emerald-600/90 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 text-white backdrop-blur-xl border border-white/40 shadow-[0_10px_30px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    <GlassSheen />
                    {isSubmitting ? (
                      <span className="relative z-10">Enviando...</span>
                    ) : (
                      <>
                        <Icon name="send" size="16px" className="relative z-10" />
                        <span className="relative z-10">Enviar</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

      </div>

      {/* Columna Derecha (5 Cols): Acumulación en Tiempo Real */}
      <div className="lg:col-span-5 h-full overflow-hidden">
        <ReporteResumenSidebar
          categoriaSeleccionada={categoriaSeleccionada}
          incidente={incidente}
          maquinaData={maquinaData}
          paroProduccion={paroProduccion}
          fechaParoProduccion={fechaParoProduccion}
          planta={planta}
          area={area}
          esMaquina={esMaquina}
          currentStep={step}
        />
      </div>

    </div>
  );
};

export default NuevoReporteDesktop;
