import { useState } from "react"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Badge } from "./ui/badge"
import { Plus, Search, MoreHorizontal, Edit2, Trash2, Tag as TagIcon } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu"
import { Tag, TagsContext } from "../types"

interface TagsListProps {
  tags: Tag[]
  context?: TagsContext
  onNewTag?: () => void
  onEditTag?: (tag: Tag) => void
  onDeleteTag?: (tagId: string) => void
}

export function TagsList({ tags, context, onNewTag, onEditTag, onDeleteTag }: TagsListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredTags = tags.filter(tag =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    }).format(date)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[16px] text-foreground">Etiquetas</h1>
          </div>
          <Button 
            onClick={onNewTag}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva etiqueta
          </Button>
        </div>
      </div>

      {/* Search and Filters section removed */}

      {/* Tags Grid */}
      <div className="flex-1 overflow-auto p-6">
        {filteredTags.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <TagIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-[16px] text-foreground mb-2">
              {searchQuery ? "No se encontraron etiquetas" : "No hay etiquetas creadas"}
            </h3>
            <p className="text-[14px] text-muted-foreground mb-4 max-w-sm">
              {searchQuery 
                ? "Intenta con otros términos de búsqueda"
                : "Crea tu primera etiqueta para organizar mejor tus unidades y reglas"
              }
            </p>
            {!searchQuery && (
              <Button 
                onClick={onNewTag}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Nueva etiqueta
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 text-[12px] text-muted-foreground uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="text-left py-3 px-6 text-[12px] text-muted-foreground uppercase tracking-wider">
                      Asignaciones
                    </th>
                    <th className="w-12"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredTags.map((tag) => (
                    <tr key={tag.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          <span 
                            className="inline-flex items-center px-2.5 py-0.5 rounded text-[12px] font-medium"
                            style={{ 
                              backgroundColor: tag.color + '20',
                              color: tag.color,
                              border: `1px solid ${tag.color}30`
                            }}
                          >
                            {tag.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="text-[14px] text-foreground">
                          {tag.assignedCount}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem 
                              onClick={() => onEditTag?.(tag)}
                              className="flex items-center gap-2"
                            >
                              <Edit2 className="w-4 h-4" />
                              <span>Editar etiqueta</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => onDeleteTag?.(tag.id)}
                              className="flex items-center gap-2 text-destructive focus:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                              <span>Eliminar etiqueta</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Pagination Footer */}
            <div className="border-t border-gray-200 bg-white px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="text-[14px] text-muted-foreground">
                  Etiquetas creadas: {filteredTags.length}/{tags.length}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[14px] text-muted-foreground">1</span>
                  <span className="text-[14px] text-muted-foreground">de</span>
                  <span className="text-[14px] text-muted-foreground">1</span>
                  <span className="text-[14px] text-muted-foreground">a</span>
                  <span className="text-[14px] text-muted-foreground">{filteredTags.length} Elementos</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}