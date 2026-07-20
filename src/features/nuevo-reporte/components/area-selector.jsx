import React, { useState } from 'react';
import { Label, Select, Input } from '@/components/form/z_index';
import { AREAS_POR_PLANTA, LISTA_AREAS_TODAS } from '../constants';

export const AreaSelector = ({ plantaSeleccionada, areaSeleccionada, onChangeArea, error }) => {
  const areasPlanta = AREAS_POR_PLANTA[plantaSeleccionada] || LISTA_AREAS_TODAS;
  const esOtraArea = areaSeleccionada && !areasPlanta.includes(areaSeleccionada) && areaSeleccionada !== '';
  const [modoCustom, setModoCustom] = useState(esOtraArea);

  const handleSelectChange = (e) => {
    const val = e.target.value;
    if (val === 'OTRA') {
      setModoCustom(true);
      onChangeArea('');
    } else {
      setModoCustom(false);
      onChangeArea(val);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor="area" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
        Área u Ubicación *
      </Label>

      {!modoCustom ? (
        <Select
          id="area"
          name="area"
          value={areaSeleccionada}
          onChange={handleSelectChange}
          icon="location_on"
          error={error}
          className="h-11 bg-white/50 border-slate-200 focus:bg-white rounded-xl focus:ring-2 focus:ring-marca-primario/10 text-xs"
        >
          <option value="">Selecciona el área...</option>
          {areasPlanta.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
          <option value="OTRA">Otra ubicación (Escribir manualmente)</option>
        </Select>
      ) : (
        <div className="flex flex-col gap-1">
          <Input
            id="areaCustom"
            type="text"
            value={areaSeleccionada}
            onChange={(e) => onChangeArea(e.target.value)}
            placeholder="Ej. Comedor secundario, Caseta de vigilancia..."
            error={error}
            className="h-11 bg-white/50 border-slate-200 focus:bg-white rounded-xl text-xs"
          />
          <button
            type="button"
            onClick={() => {
              setModoCustom(false);
              onChangeArea(areasPlanta[0] || '');
            }}
            className="text-[10px] text-marca-primario font-bold underline text-right cursor-pointer mt-0.5"
          >
            Volver a la lista de áreas
          </button>
        </div>
      )}
    </div>
  );
};

export default AreaSelector;
