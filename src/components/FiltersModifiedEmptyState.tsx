import exampleImage from 'figma:asset/5571f568016ab6f69d2aa9654253c99e80b5c882.png'

export function FiltersModifiedEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-6">
      <div className="mb-6">
        <img 
          src={exampleImage} 
          alt="Tabla vacía" 
          className="w-16 h-16"
        />
      </div>
      
      <h3 className="text-gray-900 font-medium mb-2">Los filtros fueron modificados</h3>
      <p className="text-gray-500 text-sm text-center max-w-sm">
        Haz clic en "Generar" para ver los datos.
      </p>
    </div>
  )
}