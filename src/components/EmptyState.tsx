import { FileText, BarChart3 } from "lucide-react"

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="mb-6">
        <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center mb-4 relative">
          <FileText className="w-8 h-8 text-gray-300" />
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
            <BarChart3 className="w-3 h-3 text-blue-600" />
          </div>
        </div>
      </div>
      
      <h3 className="text-gray-900 font-medium mb-2">Sin resultados todavía</h3>
      <p className="text-gray-500 text-sm text-center max-w-sm">
        Aplica los filtros y haz clic en "Generar" para ver los datos.
      </p>
    </div>
  )
}