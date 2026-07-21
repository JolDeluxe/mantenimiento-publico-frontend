import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Icon, Button } from '@/components/ui/z_index';

// Configuración de pasos concisos fuera del componente para maximizar legibilidad
const FLOW_STEPS = [
  {
    number: '01',
    icon: 'qr_code_scanner',
    title: 'Reporta la falla',
    description:
      'Busca la máquina por su código o elije una categoría general y describe la falla de forma manual.',
    iconClass:
      'bg-marca-primario/10 text-marca-primario border-marca-primario/10',
  },
  {
    number: '02',
    icon: 'engineering',
    title: 'Da seguimiento',
    description:
      'El equipo de mantenimiento recibe el reporte y actualiza su progreso.',
    iconClass:
      'bg-indigo-500/10 text-indigo-700 border-indigo-500/10',
  },
  {
    number: '03',
    icon: 'fact_check',
    title: 'Valida el trabajo',
    description:
      'Cuando se resuelva, podrás aprobar el servicio o solicitar una revisión.',
    iconClass:
      'bg-emerald-500/10 text-emerald-700 border-emerald-500/10',
  },
];

/**
 * Vista de escritorio para la página de bienvenida y guía del portal de clientes.
 */
export const WelcomeDesktop = () => {
  const navigate = useNavigate();

  const handleStartReport = () => {
    navigate('/nuevo-reporte');
  };

  const handleGoToActive = () => {
    navigate('/activos');
  };

  const handleGoToHistory = () => {
    navigate('/historico');
  };

  return (
    <div className="max-w-full mx-auto p-6 bg-transparent pb-6 flex flex-col gap-6 animate-in fade-in duration-300">
      
      {/* Banner Principal de Bienvenida */}
      <div
        className="
          relative
          overflow-hidden
          min-h-[320px]
          rounded-3xl
          border border-white/15
          bg-marca-primario
          p-4 sm:p-6 lg:p-8
          text-white
          shadow-[0_12px_40px_rgba(72,43,44,0.12)]
          flex items-center
        "
      >
        {/* Imagen derecha */}
        <div
          className="
            hidden md:block
            absolute
            inset-y-0 right-0
            w-[48%] lg:w-[50%]
            pointer-events-none
            select-none
          "
        >
          <div
            className="
              h-full w-full
              [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_30%,black_100%)]
              [mask-image:linear-gradient(to_right,transparent_0%,black_30%,black_100%)]
            "
          >
            <img
              src="/img/escaneo-qr.png"
              alt="Escaneo QR"
              className="
                h-full w-full
                object-cover
                object-center
                mix-blend-luminosity
                opacity-90
              "
            />
          </div>
        </div>

        {/* Capa café que protege visualmente el texto */}
        <div
          className="
            hidden md:block
            absolute inset-0
            z-[1]
            pointer-events-none
            bg-gradient-to-r
            from-marca-primario
            via-marca-primario/95
            to-transparent
          "
        />

        {/* Contenido */}
        <div
          className="
            relative z-10
            w-full
            md:w-[58%]
            lg:w-[60%]
            xl:w-[62%]
            max-w-[680px]
            min-w-0

            flex flex-col
            gap-3

            bg-white/[0.04]
            backdrop-blur-[6px]

            p-4 sm:p-5 lg:p-6
            rounded-2xl
            border border-white/10

            shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]
          "
        >
          <span
            className="
              w-fit max-w-full
              px-3 py-1
              rounded-full
              border border-white/15
              bg-white/10

              text-[9px] sm:text-[10px]
              font-extrabold
              uppercase
              tracking-widest
              leading-relaxed
              whitespace-normal
            "
          >
            Portal de mantenimientos CUADRA
          </span>

          <h1
            className="
              text-2xl
              sm:text-[28px]
              xl:text-3xl
              font-black
              tracking-tight
              leading-tight
              break-words
              [text-wrap:balance]
            "
          >
            ¿Cómo podemos ayudarte hoy?
          </h1>

          <p
            className="
              max-w-xl
              text-[11px] sm:text-xs
              text-white/80
              leading-relaxed
              font-medium
              [text-wrap:pretty]
            "
          >
            Reporta incidencias de maquinaria o fallas en áreas comunes en segundos.
            Monitorea el progreso del soporte técnico y valida el trabajo de forma
            inmediata.
          </p>

          {/* Acciones */}
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              xl:grid-cols-3
              gap-3
              mt-3
              w-full
            "
          >
            {/* En pantallas medianas ocupa toda la primera fila */}
            <div className="sm:col-span-2 xl:col-span-1">
              <Button
                onClick={handleStartReport}
                variant="secundario"
                icon="post_add"
                className="
                  w-full
                  min-h-[54px]
                  h-full
                  justify-center

                  bg-white
                  text-marca-primario
                  hover:bg-slate-50

                  px-4 py-3
                  text-[11px]
                  font-bold
                  uppercase
                  tracking-wider
                  leading-tight
                  text-center

                  shadow-md
                  rounded-xl
                "
              >
                Crear Nuevo Reporte
              </Button>
            </div>

            <button
              onClick={handleGoToActive}
              className="
                w-full
                min-h-[54px]
                justify-center

                flex items-center
                gap-2

                px-4 py-3
                rounded-xl
                border border-white/10
                bg-white/5

                text-[11px]
                font-bold
                text-white
                leading-tight
                text-center

                cursor-pointer
                transition-all
                hover:bg-white/10
              "
            >
              <Icon name="assignment" className="text-lg shrink-0" />
              <span>Reportes Activos</span>
            </button>

            <button
              onClick={handleGoToHistory}
              className="
                w-full
                min-h-[54px]
                justify-center

                flex items-center
                gap-2

                px-4 py-3
                rounded-xl
                border border-white/10
                bg-white/5

                text-[11px]
                font-bold
                text-white/90
                leading-tight
                text-center

                cursor-pointer
                transition-all
                hover:bg-white/10
              "
            >
              <Icon name="history" className="text-lg shrink-0" />
              <span>Ver Historial</span>
            </button>
          </div>
        </div>
      </div>

      {/* Flujo del proceso */}
      <section className="flex flex-col gap-5">
        <div className="flex flex-col gap-1 px-1">
          <span className="text-[10px] font-extrabold text-marca-primario uppercase tracking-[0.18em]">
            Proceso de atención
          </span>

          <h3 className="text-lg font-black text-slate-800 tracking-tight">
            Reportar una falla es muy sencillo
          </h3>

          <p className="text-xs text-slate-500 font-medium">
            Sigue estos tres pasos para reportar y dar seguimiento a una incidencia.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FLOW_STEPS.map((step) => (
            <article
              key={step.number}
              className="
                group
                relative
                overflow-hidden
                min-h-[170px]
                bg-white/75
                backdrop-blur-xl
                border border-white/50
                p-5
                rounded-2xl
                shadow-[0_8px_30px_rgba(15,23,42,0.035)]
                transition-all duration-200
                hover:-translate-y-0.5
                hover:shadow-[0_12px_35px_rgba(15,23,42,0.07)]
                hover:border-slate-200/70
              "
            >
              {/* Número decorativo */}
              <span
                className="
                  absolute
                  top-4 right-5
                  text-4xl
                  font-black
                  text-slate-900/[0.035]
                  select-none
                  transition-colors
                  group-hover:text-slate-900/[0.06]
                "
              >
                {step.number}
              </span>

              <div className="relative z-10 flex flex-col gap-4">
                <div
                  className={`
                    w-11 h-11
                    rounded-xl
                    flex items-center justify-center
                    border
                    ${step.iconClass}
                  `}
                >
                  <Icon name={step.icon} className="text-[22px]" />
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.18em]">
                    Paso {step.number}
                  </span>

                  <h4 className="text-sm font-extrabold text-slate-800">
                    {step.title}
                  </h4>

                  <p className="text-[11.5px] leading-relaxed text-slate-500 font-medium">
                    {step.description}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

    </div>
  );
};

export default WelcomeDesktop;
