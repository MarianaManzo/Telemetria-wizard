import { Loader2 } from "lucide-react"

interface LoadingStateProps {
  onCancel?: () => void
  isUpdating?: boolean
  isSavedReport?: boolean
}

export function LoadingState({ onCancel, isUpdating = false, isSavedReport = false }: LoadingStateProps) {
  const getTitle = () => {
    if (isUpdating) {
      return "El reporte se está actualizando"
    }
    return "El reporte se está generando"
  }

  const getDescription = () => {
    if (isSavedReport) {
      return 'Puedes cerrar o cambiar de pantalla sin problema. Te avisaremos cuando esté listo y también lo podrás consultar en "Guardados".'
    }
    return 'Puedes cerrar o cambiar de pantalla sin problema. Te avisaremos cuando esté listo y también lo podrás consultar en "Borradores".'
  }

  return (
    <div className="bg-white mx-6 rounded-lg border border-gray-200 shadow-sm flex flex-col h-full">
      <div className="flex-1 flex items-center justify-center min-h-0">
        <div className="text-center max-w-md px-6">
          <div className="mb-6 flex justify-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
          <h4 className="text-lg font-medium text-gray-700 mb-4">
            {getTitle()}
          </h4>
          <p className="text-sm text-gray-500 leading-relaxed mb-6">
            {getDescription()}
          </p>
          <button 
            onClick={onCancel}
            className="text-blue-600 hover:text-blue-700 hover:underline transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  )
}