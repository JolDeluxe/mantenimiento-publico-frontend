import React from 'react';
import { Label, Select } from '@/components/form/z_index';

export const PlantaSelector = ({ plantas = [], plantaSeleccionada, onChangePlanta, error }) => {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor="planta" className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-0.5">
        Planta u Origen *
      </Label>
      <Select
        id="planta"
        name="planta"
        value={plantaSeleccionada}
        onChange={(e) => onChangePlanta(e.target.value)}
        icon="factory"
        error={error}
        className="h-11 bg-white/50 border-slate-200 focus:bg-white rounded-xl focus:ring-2 focus:ring-marca-primario/10"
      >
        {plantas.length === 0 ? (
          <option value="KAPPA">KAPPA</option>
        ) : (
          plantas.map((p) => (
            <option key={p} value={p}>
              Planta {p}
            </option>
          ))
        )}
      </Select>
    </div>
  );
};

export default PlantaSelector;
