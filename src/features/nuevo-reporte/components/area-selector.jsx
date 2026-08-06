import React, { useState, useEffect } from 'react';
import { Label, Input } from '@/components/form/z_index';
import { Icon } from '@/components/ui/z_index';
import { PLANTAS_AREAS, getPlantaFromArea } from '../constants';
import { cn } from '@/utils/cn';

const removeAccents = (str) => {
  if (!str) return '';
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
};

export const AreaSelector = ({ areaSeleccionada, onChangeArea, error }) => {
  // Inicialización inteligente basada en el área pre-seleccionada
  const plantaInicial = getPlantaFromArea(areaSeleccionada);
  const esAreaCustomInicial = Boolean(areaSeleccionada && !plantaInicial);
  
  const [planta, setPlanta] = useState(plantaInicial || (esAreaCustomInicial ? 'OTRA' : ''));
  const [esOtraArea, setEsOtraArea] = useState(esAreaCustomInicial || false);
  const [otraPlantaTexto, setOtraPlantaTexto] = useState('');
  const [areaCustomTexto, setAreaCustomTexto] = useState(esAreaCustomInicial ? areaSeleccionada : '');
  const [searchArea, setSearchArea] = useState('');

  // Sincronizar hacia arriba si es custom. 
  // No enviamos nada si falta la planta o el área manual, forzando la validación del form padre.
  useEffect(() => {
    if (planta === 'OTRA') {
      if (!otraPlantaTexto.trim() || !areaCustomTexto.trim()) {
        onChangeArea(''); // Bloquea submit
      } else {
        onChangeArea(areaCustomTexto.trim()); // Enviamos solo el área como dice el req.
      }
    } else if (planta && esOtraArea) {
      if (!areaCustomTexto.trim()) {
        onChangeArea(''); // Bloquea submit
      } else {
        onChangeArea(areaCustomTexto.trim());
      }
    }
  }, [planta, otraPlantaTexto, areaCustomTexto, esOtraArea, onChangeArea]);

  const handleSelectPlanta = (p) => {
    setPlanta(p);
    setEsOtraArea(p === 'OTRA');
    setOtraPlantaTexto('');
    setAreaCustomTexto('');
    setSearchArea('');
    onChangeArea('');
  };

  const handleSelectAreaText = (val) => {
    if (val === 'OTRA_AREA') {
      setEsOtraArea(true);
      setAreaCustomTexto('');
      onChangeArea('');
    } else {
      setEsOtraArea(false);
      onChangeArea(val);
    }
  };

  const PLANTAS = Object.keys(PLANTAS_AREAS);
  const mostrarErrorOtraPlanta = error && planta === 'OTRA' && !otraPlantaTexto.trim();
  const mostrarErrorAreaCustom = error && esOtraArea && !areaCustomTexto.trim();
  const mostrarErrorSelectArea = error && planta !== 'OTRA' && !esOtraArea && !areaSeleccionada;

  const currentAreas = (planta && planta !== 'OTRA') ? PLANTAS_AREAS[planta] : [];
  const areasFiltradas = currentAreas.filter(a => 
    removeAccents(a).includes(removeAccents(searchArea))
  );

  return (
    <div className="flex flex-col gap-4">
      {/* 1. Selector de Planta */}
      <div className="flex flex-col gap-2">
        <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
          1. Planta *
        </Label>
        <div className="flex flex-wrap gap-2">
          {PLANTAS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => handleSelectPlanta(p)}
              className={cn(
                "px-3.5 py-2 rounded-xl text-xs font-bold transition-all border",
                planta === p 
                  ? "bg-emerald-600 text-white border-emerald-700 shadow-md"
                  : "bg-white/60 text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300"
              )}
            >
              {p}
            </button>
          ))}
          <button
            type="button"
            onClick={() => handleSelectPlanta('OTRA')}
            className={cn(
              "px-3.5 py-2 rounded-xl text-xs font-bold transition-all border",
              planta === 'OTRA'
                ? "bg-emerald-600 text-white border-emerald-700 shadow-md"
                : "bg-white/60 text-slate-600 border-slate-200 hover:bg-white hover:border-slate-300"
            )}
          >
            OTRA
          </button>
        </div>
        {!planta && error && (
          <span className="text-[10px] text-red-500 font-bold px-1 mt-[-2px]">
            Selecciona una planta.
          </span>
        )}
      </div>

      {/* 2. Selector de Área (si aplica) */}
      {planta && (
        <div className="flex flex-col gap-3 bg-slate-50/50 p-3.5 rounded-2xl border border-slate-100">
          <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5 flex items-center justify-between">
            <span>2. Área o Lugar *</span>
            {mostrarErrorSelectArea && <span className="text-red-500 normal-case font-bold">Selecciona un área</span>}
          </Label>

          {planta === 'OTRA' ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-bold text-slate-500">Nombre de la planta o edificio</Label>
                <Input
                  type="text"
                  value={otraPlantaTexto}
                  onChange={(e) => setOtraPlantaTexto(e.target.value)}
                  placeholder="Ej. Bodega externa, CEDIS, oficinas..."
                  error={mostrarErrorOtraPlanta}
                  className="h-11 bg-white border-slate-200 focus:bg-white rounded-xl text-xs"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-[10px] font-bold text-slate-500">Área o lugar exacto</Label>
                <Input
                  type="text"
                  value={areaCustomTexto}
                  onChange={(e) => setAreaCustomTexto(e.target.value)}
                  placeholder="Escribe el área detallada..."
                  error={mostrarErrorAreaCustom}
                  className="h-11 bg-white border-slate-200 focus:bg-white rounded-xl text-xs"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {!esOtraArea ? (
                <div className="flex flex-col gap-2">
                  <div className="relative">
                    <Icon name="search" size="16px" className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <Input
                      type="text"
                      value={searchArea}
                      onChange={(e) => setSearchArea(e.target.value)}
                      placeholder={`Buscar en ${planta}...`}
                      className="pl-9 h-11 bg-white border-slate-200 focus:bg-white rounded-xl text-xs"
                    />
                  </div>
                  
                  <div className={cn(
                    "flex flex-col gap-1.5 p-1 rounded-xl border",
                    mostrarErrorSelectArea ? "border-red-300 bg-red-50/30" : "border-slate-100 bg-white"
                  )}>
                    {areasFiltradas.length > 0 ? (
                      areasFiltradas.map((a) => (
                        <button
                          key={a}
                          type="button"
                          onClick={() => handleSelectAreaText(a)}
                          className={cn(
                            "flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs text-left transition-all",
                            areaSeleccionada === a
                              ? "bg-emerald-50 border-emerald-500 text-emerald-800 font-bold shadow-xs"
                              : "bg-white border-slate-100 text-slate-600 hover:border-slate-300 hover:bg-slate-50"
                          )}
                        >
                          <span className="leading-snug">{a}</span>
                          {areaSeleccionada === a && (
                            <Icon name="check_circle" className="text-emerald-600 text-sm shrink-0 ml-2" />
                          )}
                        </button>
                      ))
                    ) : (
                      <p className="text-[10px] text-slate-400 p-3 text-center">No se encontraron áreas. Intenta con otra búsqueda o selecciona "Otra área".</p>
                    )}
                    
                    <div className="my-1 border-t border-slate-100"></div>
                    
                    <button
                      type="button"
                      onClick={() => handleSelectAreaText('OTRA_AREA')}
                      className="flex items-center justify-between px-3 py-2.5 rounded-lg border border-slate-200 bg-slate-100/80 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                    >
                      <span>NO ENCUENTRO MI ÁREA (OTRA ÁREA)</span>
                      <Icon name="add" className="text-slate-500 text-sm shrink-0" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Input
                    type="text"
                    value={areaCustomTexto}
                    onChange={(e) => setAreaCustomTexto(e.target.value)}
                    placeholder="Escribe el área detallada..."
                    error={mostrarErrorAreaCustom}
                    className="h-11 bg-white border-slate-200 focus:bg-white rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setEsOtraArea(false);
                      setAreaCustomTexto('');
                      onChangeArea('');
                    }}
                    className="text-[10px] text-blue-600 font-bold underline text-right cursor-pointer"
                  >
                    Volver a la lista de áreas
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Mensaje de ayuda */}
          <div className="mt-1 p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-2 shrink-0">
            <Icon name="info" className="text-blue-500 text-sm mt-0.5 shrink-0" />
            <p className="text-[10px] text-blue-700 leading-tight">
              {planta === 'OTRA' 
                ? "Escribe el nombre de la planta y el lugar exacto donde ocurrió la falla."
                : "¿No encuentras tu área o el lugar exacto de la falla? Selecciona la opción 'Otra Área' y escríbelo."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaSelector;
