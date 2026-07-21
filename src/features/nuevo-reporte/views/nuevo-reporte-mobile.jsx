import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CATEGORIAS_REPORTE } from '../constants';
import { StepperHeader } from '../components/stepper-header';
import { CategoriaSelector } from '../components/categoria-selector';
import { IncidenteSelector } from '../components/incidente-selector';
import { PlantaSelector } from '../components/planta-selector';
import { AreaSelector } from '../components/area-selector';
import { TituloDisplay } from '../components/titulo-display';
import { ParoProduccionPanel } from '../components/paro-produccion-panel';
import { QrScannerInput } from '../components/qr-scanner-input';
import { MaquinaReadonlyCard } from '../components/maquina-readonly-card';
import { getMaquinaPrefill } from '@/features/maquinaria/api/maquinaria-api';
import { createReporte, getPlantas } from '../api/nuevo-reporte-api';
import { Icon } from '@/components/ui/z_index';
import { Input, Label } from '@/components/form/z_index';
import { GlassSheen } from '@/components/ui/liquid-glass-mobile';
import { notify } from '@/components/notification/adaptive-notify';

/**
 * Vista Unificada Móvil para Creación de Reportes con 4 Pasos Completos.
 * Paso 4 implementa flujo de 2 fases: Redacción de Descripción -> Resumen Completo Pre-Envío -> Enviar.
 */
export const NuevoReporteMobile = () => {
  const navigate = useNavigate();

  // Paso del wizard (1, 2, 3, 4)
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

  // Estados de máquina
  const [pasoMaquina, setPasoMaquina] = useState('SCAN'); // SCAN | MANUAL | VINCULADO
  const [codigoManual, setCodigoManual] = useState('');
  const [loadingPrefill, setLoadingPrefill] = useState(false);
  const [maquinaData, setMaquinaData] = useState(null);
  const [errorMaquina, setErrorMaquina] = useState('');
  const [paroProduccion, setParoProduccion] = useState(false);
  const [fechaParoProduccion, setFechaParoProduccion] = useState('');
  const [impactoTemporal, setImpactoTemporal] = useState('');

  // Estado submit
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const esMaquina = categoria === 'MAQUINARIA';
  const categoriaSeleccionada = CATEGORIAS_REPORTE.find((c) => c.id === categoria) || CATEGORIAS_REPORTE[0];

  // Cargar plantas al montar
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
        console.error('[Get Plantas Mobile] Error:', err);
      });
  }, []);

  const handleCategoriaChange = (newCat) => {
    setCategoria(newCat);
    setIncidente(null);
    setTituloPersonalizado('');
    setArea('');
    setDescripcion('');
    setMaquinaData(null);
    setPasoMaquina('SCAN');
    setCodigoManual('');
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
    setPasoMaquina('SCAN');
    setCodigoManual('');
    setErrorMaquina('');
    setParoProduccion(false);
    setFechaParoProduccion('');
    setImpactoTemporal('');
  };

  const handleVincularCodigo = async (codigo) => {
    setErrorMaquina('');
    if (!codigo.trim()) {
      setErrorMaquina('Ingresa un código de máquina válido.');
      return;
    }

    setLoadingPrefill(true);

    try {
      const response = await getMaquinaPrefill(codigo.trim().toUpperCase());
      const resData = response?.data?.data || response?.data || response;

      if (resData && resData.maquinaId) {
        setMaquinaData(resData);
        setErrorMaquina('');
        setPasoMaquina('VINCULADO');
      } else {
        throw new Error('Formato de respuesta incorrecto');
      }
    } catch (err) {
      const backendError =
        err.response?.data?.errors?.[0]?.message ||
        err.response?.data?.error ||
        err.response?.data?.message;
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
        setErrorMaquina('La máquina ingresada no fue encontrada.');
      }
    } finally {
      setLoadingPrefill(false);
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
  const isScanStep = step === 3 && esMaquina && pasoMaquina === 'SCAN';

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
        if (!maquinaData) {
          setErrorMaquina('Debes vincular una máquina válida para continuar.');
          notify.error('Falta vincular la máquina.');
        } else if (paroProduccion && !fechaParoProduccion) {
          notify.error('Debe seleccionar la fecha y hora del paro.');
        }
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

    if (!isStep1Valid || !isStep2Valid || !isStep3Valid || !isStep4Valid) {
      notify.error('Todos los campos requeridos deben estar completos.');
      return;
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
      console.error('[Create Mobile] Error:', err);
      notify.error(err.response?.data?.error || 'Error al enviar el reporte.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden relative">
      
      {/* 1. INDICADOR DE PASOS MÓVIL (Fijo Arriba) */}
      <div className="shrink-0 p-3 pb-1.5 z-30">
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

      {/* 2. ESPACIO DE CONTENIDO CENTRAL SCROLLEABLE */}
      <div
        className={`min-h-0 flex-1 overscroll-none px-3 py-1 pb-2 custom-scrollbar ${
          isScanStep ? 'overflow-hidden' : 'overflow-y-auto'
        }`}
      >
        
        {/* PASO 1: Categoría */}
        {step === 1 && (
          <div className="w-full">
            <CategoriaSelector value={categoria} onChange={handleCategoriaChange} />
          </div>
        )}

        {/* PASO 2: Tipo de Incidencia */}
        {step === 2 && (
          <div className="bg-white/85 backdrop-blur-xl border border-white/45 p-3.5 rounded-2xl shadow-xs flex flex-col gap-3 w-full">
            <IncidenteSelector
              incidentes={categoriaSeleccionada.incidentes}
              incidenteSeleccionadoId={incidente?.id}
              onSelectIncidente={handleIncidenteSelect}
            />
          </div>
        )}

        {/* PASO 3: Vinculación o Ubicación */}
        {step === 3 && (
          <div className={isScanStep ? 'h-full min-h-0 w-full flex flex-col' : 'min-h-0 w-full'}>
            {esMaquina ? (
              <>
                {pasoMaquina === 'SCAN' && (
                  <div className="h-full min-h-0 bg-white/85 backdrop-blur-xl border border-white/45 p-3 rounded-2xl shadow-xs flex flex-col gap-2 overflow-hidden">
                    <div className="shrink-0 flex items-center justify-between border-b border-slate-100 pb-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Escaneo QR de Equipo
                      </span>
                      <button
                        type="button"
                        onClick={() => { setPasoMaquina('MANUAL'); setErrorMaquina(''); }}
                        className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Icon name="keyboard" size="14px" />
                        <span>Por teclado</span>
                      </button>
                    </div>
                    <div className="min-h-0 flex-1 overflow-hidden flex items-center justify-center">
                      <QrScannerInput
                        onScanSuccess={(code) => handleVincularCodigo(code)}
                        isProcessing={loadingPrefill}
                        validationError={errorMaquina}
                        onRetry={() => setErrorMaquina('')}
                      />
                    </div>
                  </div>
                )}

                {pasoMaquina === 'MANUAL' && (
                  <div className="bg-white/85 backdrop-blur-xl border border-white/45 rounded-2xl p-4 shadow-xs flex flex-col gap-3.5">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                        Ingreso Manual por Código
                      </h3>
                      <button
                        type="button"
                        onClick={() => { setPasoMaquina('SCAN'); setErrorMaquina(''); }}
                        className="text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Icon name="qr_code_scanner" size="14px" />
                        <span>Usar cámara</span>
                      </button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleVincularCodigo(codigoManual); }} className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="codigoManual" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
                          Código de la Máquina *
                        </Label>
                        <div className="relative flex items-center">
                          <Icon name="tag" size="16px" className="absolute left-3 text-slate-400" />
                          <Input
                            id="codigoManual"
                            type="text"
                            value={codigoManual}
                            onChange={(e) => { setCodigoManual(e.target.value); setErrorMaquina(''); }}
                            placeholder="Ej. MBC0001"
                            error={Boolean(errorMaquina)}
                            className={`font-mono text-xs uppercase pl-9 h-11 bg-white/50 rounded-xl tracking-wider placeholder:text-[10.5px] ${
                              errorMaquina
                                ? 'border-red-400 focus:border-red-500 text-red-950 font-bold'
                                : 'border-slate-200 focus:bg-white'
                            }`}
                          />
                        </div>
                      </div>

                      {errorMaquina && (
                        <div className="flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 p-2.5 rounded-xl">
                          <Icon name="error" size="16px" className="shrink-0 text-red-500" />
                          <span>{errorMaquina}</span>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loadingPrefill}
                        className="relative overflow-hidden w-full h-11 text-xs font-bold uppercase tracking-wider rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <GlassSheen />
                        <span className="relative z-10">{loadingPrefill ? 'Buscando...' : 'Buscar y Vincular'}</span>
                      </button>
                    </form>
                  </div>
                )}

                {pasoMaquina === 'VINCULADO' && maquinaData && (
                  <div className="flex flex-col gap-3.5">
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
              <div className="bg-white/85 backdrop-blur-xl border border-white/45 p-4 rounded-2xl shadow-xs flex flex-col gap-3.5">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2">
                  Ubicación del Problema
                </h4>
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
        )}

        {/* PASO 4: Detalles (Fase 1: Redacción | Fase 2: Resumen Pre-Envío) */}
        {step === 4 && (
          <div className="flex flex-col gap-3.5 w-full">
            {!modoResumenFinal ? (
              /* FASE 1: Redacción de Descripción y Título */
              <>
                <div className="bg-white/85 backdrop-blur-xl border border-white/45 p-3.5 rounded-2xl shadow-xs">
                  <TituloDisplay
                    incidente={incidente}
                    tituloPersonalizado={tituloPersonalizado}
                    onTituloPersonalizadoChange={setTituloPersonalizado}
                    maquinaData={maquinaData}
                    submitted={submitted}
                  />
                </div>

                <div className="bg-white/85 backdrop-blur-xl border border-white/45 p-4 rounded-2xl shadow-xs flex flex-col gap-3.5">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Icon name="edit_note" size="16px" className="text-emerald-600" />
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Detalles y Descripción de la Falla
                    </h4>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between items-center px-0.5">
                      <Label htmlFor="descripcionInput" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Descripción del problema *
                      </Label>
                      <span className="text-[9px] font-bold text-slate-400">
                        {descripcion.length} caracteres
                      </span>
                    </div>
                    <Input
                      id="descripcionInput"
                      name="descripcionInput"
                      multiline={true}
                      value={descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      placeholder="Describe la falla observada, sintomas o contexto (mínimo 10 caracteres)..."
                      error={submitted && (!descripcion.trim() || descripcion.trim().length < 10)}
                      helperText={
                        submitted && (!descripcion.trim() || descripcion.trim().length < 10)
                          ? 'La descripción es obligatoria y debe tener al menos 10 caracteres.'
                          : ''
                      }
                      className="min-h-28 bg-white/60 border-slate-200 focus:bg-white rounded-xl p-3 text-xs placeholder:text-[10.5px]"
                    />
                  </div>
                </div>
              </>
            ) : (
              /* FASE 2: Resumen Completo del Reporte antes de Enviar */
              <div className="bg-white/85 backdrop-blur-xl border border-white/45 p-4 rounded-2xl shadow-xs flex flex-col gap-3.5 animate-in fade-in duration-300">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                  <div className="flex items-center gap-2">
                    <Icon name="fact_check" size="18px" className="text-emerald-600" />
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">
                      Resumen Completo del Reporte
                    </h4>
                  </div>
                  <span className="text-[8.5px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    CONFIRMACIÓN FINAL
                  </span>
                </div>

                <div className="flex flex-col gap-2.5 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5">
                    <div className="p-1 rounded-lg bg-slate-900 text-white shrink-0">
                      <Icon name={categoriaSeleccionada.icon} size="14px" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Categoría</span>
                      <span className="font-extrabold text-slate-800 truncate">{categoriaSeleccionada.nombre}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex items-center gap-2.5">
                    <div className="p-1 rounded-lg bg-emerald-600 text-white shrink-0">
                      <Icon name={incidente?.icon || 'report_problem'} size="14px" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Tipo de Incidencia</span>
                      <span className="font-extrabold text-slate-800 truncate">{incidente ? incidente.nombre : 'Sin seleccionar'}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col gap-1">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1 rounded-lg bg-blue-600 text-white shrink-0">
                        <Icon name={esMaquina ? 'precision_manufacturing' : 'location_on'} size="14px" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">
                          {esMaquina ? 'Equipo Asignado' : 'Ubicación'}
                        </span>
                        <span className="font-extrabold text-slate-800 truncate">
                          {esMaquina
                            ? maquinaData
                              ? `${maquinaData.nombre} [${maquinaData.codigo}] — Planta ${maquinaData.planta}`
                              : 'Equipo sin vincular'
                            : `Planta ${planta} — ${area}`}
                        </span>
                      </div>
                    </div>

                    {esMaquina && maquinaData && paroProduccion && (
                      <div className="flex items-center gap-1.5 text-[9.5px] font-bold text-red-600 bg-red-50 border border-red-200/80 p-1.5 rounded-lg mt-1">
                        <Icon name="error" size="13px" className="shrink-0 text-red-500" />
                        <span>PARO DE PRODUCCIÓN — {fechaParoProduccion ? new Date(fechaParoProduccion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Hora requerida'}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/60 flex flex-col gap-1">
                    <span className="text-[8.5px] font-bold text-slate-400 uppercase tracking-wider">Descripción del Problema</span>
                    <p className="text-xs font-medium text-slate-700 whitespace-pre-wrap leading-relaxed">
                      {descripcion}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* 3. BOTONERA DE ACCIÓN FIJA ABAJO CON LIQUID GLASS */}
      <div className="shrink-0 p-2.5 pt-1 z-30">
        {step === 1 && (
          <button
            type="button"
            onClick={handleNextStep}
            className="relative overflow-hidden w-full h-11 text-[10.5px] font-extrabold uppercase tracking-wider rounded-2xl bg-emerald-600/90 hover:bg-emerald-600 active:bg-emerald-700 text-white backdrop-blur-xl border border-white/40 shadow-[0_10px_30px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all cursor-pointer flex items-center justify-center gap-1.5"
          >
            <GlassSheen />
            <span className="relative z-10 truncate">Continuar a Incidencia</span>
            <Icon name="arrow_forward" size="14px" className="relative z-10 shrink-0" />
          </button>
        )}

        {step === 2 && (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevStep}
              className="relative overflow-hidden h-10 px-3 text-[10px] font-extrabold uppercase tracking-wider rounded-2xl bg-slate-800/80 hover:bg-slate-800 active:bg-slate-900 text-white backdrop-blur-xl border border-white/20 shadow-xs transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <GlassSheen />
              <span className="relative z-10">← Anterior</span>
            </button>
            <button
              type="button"
              disabled={!isStep2Valid}
              onClick={handleNextStep}
              className="relative overflow-hidden flex-1 h-10 text-[10px] font-extrabold uppercase tracking-wider rounded-2xl bg-emerald-600/90 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white backdrop-blur-xl border border-white/40 shadow-[0_10px_30px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all cursor-pointer flex items-center justify-center gap-1 min-w-0"
            >
              <GlassSheen />
              <span className="relative z-10 truncate">Continuar a {esMaquina ? 'Equipo' : 'Ubicación'}</span>
              <Icon name="arrow_forward" size="14px" className="relative z-10 shrink-0" />
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevStep}
              className="relative overflow-hidden h-10 px-3 text-[10px] font-extrabold uppercase tracking-wider rounded-2xl bg-slate-800/80 hover:bg-slate-800 active:bg-slate-900 text-white backdrop-blur-xl border border-white/20 shadow-xs transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <GlassSheen />
              <span className="relative z-10">← Anterior</span>
            </button>
            <button
              type="button"
              disabled={!isStep3Valid}
              onClick={handleNextStep}
              className="relative overflow-hidden flex-1 h-10 text-[10px] font-extrabold uppercase tracking-wider rounded-2xl bg-emerald-600/90 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white backdrop-blur-xl border border-white/40 shadow-[0_10px_30px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all cursor-pointer flex items-center justify-center gap-1 min-w-0"
            >
              <GlassSheen />
              <span className="relative z-10 truncate">Continuar a Detalles</span>
              <Icon name="arrow_forward" size="14px" className="relative z-10 shrink-0" />
            </button>
          </div>
        )}

        {step === 4 && (
          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={handlePrevStep}
              className="relative overflow-hidden h-11 px-3.5 text-[10.5px] font-extrabold uppercase tracking-wider rounded-2xl bg-slate-800/80 hover:bg-slate-800 active:bg-slate-900 text-white backdrop-blur-xl border border-white/20 shadow-xs transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <GlassSheen />
              <span className="relative z-10">{modoResumenFinal ? '← Editar' : '← Anterior'}</span>
            </button>
            
            {!modoResumenFinal ? (
              <button
                type="button"
                disabled={!isStep4Valid}
                onClick={handleVerResumenFinal}
                className="relative overflow-hidden flex-1 h-11 text-[10.5px] font-extrabold uppercase tracking-wider rounded-2xl bg-emerald-600/90 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-white backdrop-blur-xl border border-white/40 shadow-[0_10px_30px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all cursor-pointer flex items-center justify-center gap-1 min-w-0"
              >
                <GlassSheen />
                <span className="relative z-10 truncate">Ver Resumen Final →</span>
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="relative overflow-hidden flex-1 h-11 text-[10.5px] font-extrabold uppercase tracking-wider rounded-2xl bg-emerald-600/90 hover:bg-emerald-600 active:bg-emerald-700 disabled:opacity-50 text-white backdrop-blur-xl border border-white/40 shadow-[0_10px_30px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.5)] transition-all cursor-pointer flex items-center justify-center gap-1.5 min-w-0"
              >
                <GlassSheen />
                {isSubmitting ? (
                  <span className="relative z-10 truncate">Enviando...</span>
                ) : (
                  <>
                    <Icon name="send" size="14px" className="relative z-10 shrink-0" />
                    <span className="relative z-10 truncate">Enviar</span>
                  </>
                )}
              </button>
            )}
          </div>
        )}
      </div>

    </div>
  );
};

export default NuevoReporteMobile;
