import { cn } from '@/utils/cn'

/**
 * Componente universal de iconos usando Material Symbols Rounded.
 * Elimina la necesidad de escribir SVGs inline en toda la app.
 *
 * @param {string}  name      - Nombre del icono en snake_case (ej. "arrow_back")
 * @param {number}  size      - Tamaño en px. Default: 24
 * @param {number}  weight    - Grosor del trazo: 100-700. Default: 400
 * @param {boolean} filled    - Si true, el icono aparece relleno. Default: false
 * @param {string}  className - Clases Tailwind adicionales para color, margen, etc.
 */
export function Icon({
  name,
  size = 24,
  weight = 400,
  filled = false,
  className,
  ...props
}) {
  return (
    <span
      className={cn('material-symbols-rounded', className)}
      style={{
        fontSize: `${size}px`,
        fontVariationSettings: `'FILL' ${filled ? 1 : 0}, 'wght' ${weight}, 'GRAD' 0, 'opsz' ${size}`,
        lineHeight: 1,
      }}
      aria-hidden="true"
      {...props}
    >
      {name}
    </span>
  )
}