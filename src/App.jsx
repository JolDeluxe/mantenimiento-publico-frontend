import { STATUS_COLORS, PRIORIDAD_COLORS } from './config/constants';
import { ENV } from '@/config/env';

console.log('Conectando a:', ENV.API_URL);

export const App = () => {
  return (
    <div className="min-h-screen p-8 space-y-12 bg-cuadra-arena/10">
      
      {/* 1. CABECERA PRINCIPAL */}
      <section className="space-y-4 border-b border-slate-200 pb-8">
        <h1 className="text-marca-primario fuente-titulos text-5xl uppercase">
          Ecosistema Cuadra Mantenimiento
        </h1>
        <p className="text-slate-600 text-lg">
          Esta es la fuente <strong>Lato / Work Sans</strong> para lectura general. 
          Robustez y elegancia técnica para los reportes.
        </p>
      </section>

      {/* 2. SECCIÓN DE BOTONES */}
      <section className="space-y-6">
        <h2 className="fuente-titulos text-2xl text-marca-acento italic">Botones de Acción</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <button className="boton-guardar uppercase text-sm">Guardar Cambios</button>
          <button className="boton-editar uppercase text-sm">Editar Tarea</button>
          <button className="boton-accion uppercase text-sm">Procesar (Azul)</button>
          <button className="boton-borrar uppercase text-sm">Borrar Registro</button>
          <button className="boton-cancelar uppercase text-sm">Cancelar / Cerrar</button>
          <button className="boton-guardar uppercase text-sm" disabled>Boton Bloqueado</button>
        </div>
      </section>

      {/* 3. SECCIÓN DE ESTADOS (BADGES) */}
      <section className="space-y-6">
        <h2 className="fuente-titulos text-2xl text-marca-acento italic">Estados de Tarea (Badges)</h2>
        <div className="flex flex-wrap gap-3">
          {Object.keys(STATUS_COLORS).map((estado) => (
            <span 
              key={estado} 
              className={`px-4 py-1 border text-xs font-bold rounded-full shadow-sm ${STATUS_COLORS[estado]}`}
            >
              {estado}
            </span>
          ))}
        </div>
      </section>

      {/* 4. SECCIÓN DE PRIORIDADES */}
      <section className="space-y-6">
        <h2 className="fuente-titulos text-2xl text-marca-acento italic">Niveles de Prioridad</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.keys(PRIORIDAD_COLORS).map((nivel) => (
            <div key={nivel} className="tarjeta-cuadra p-4">
              <span className="text-xs text-slate-400 block mb-1 uppercase font-bold">Nivel:</span>
              <p className={PRIORIDAD_COLORS[nivel]}>{nivel}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 5. IDENTIDAD VISUAL CUADRA */}
      <section className="space-y-4 pb-10">
        <h2 className="fuente-titulos text-2xl text-marca-acento italic">Paleta de Marca</h2>
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 bg-marca-primario rounded-full shadow-lg border border-white"></div>
            <span className="text-[10px] font-bold text-slate-500">PRIMARIO</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 bg-marca-secundario rounded-full shadow-lg border border-white"></div>
            <span className="text-[10px] font-bold text-slate-500">SECUNDARIO</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 bg-marca-acento rounded-full shadow-lg border border-white"></div>
            <span className="text-[10px] font-bold text-slate-500">ACENTO</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="h-16 w-16 bg-cuadra-arena rounded-full shadow-lg border border-slate-300"></div>
            <span className="text-[10px] font-bold text-slate-500">FONDO ARENA</span>
          </div>
        </div>
      </section>

      {/* 6. PRUEBA DE INPUTS */}
      <section className="space-y-4 max-w-md">
        <h2 className="fuente-titulos text-2xl text-marca-acento italic">Campos de Formulario</h2>
        <div className="space-y-3">
          <input type="text" placeholder="Nombre de la bota..." className="w-full p-2 border border-slate-300 rounded" />
          <select className="w-full p-2 border border-slate-300 rounded bg-white">
            <option>Seleccionar Planta...</option>
            <option>KAPPA</option>
            <option>OMEGA</option>
          </select>
          <textarea placeholder="Descripción del fallo técnico..." rows="3" className="w-full p-2 border border-slate-300 rounded"></textarea>
        </div>
      </section>

    </div>
  );
};