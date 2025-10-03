import { useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Input } from "./ui/input"
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar"
import { ChevronDown, Search, X } from "lucide-react"

interface User {
  value: string
  label: string
  email?: string
  avatar?: string
}

interface SearchableUserSelectProps {
  defaultValue?: string
  users: User[]
  onValueChange?: (value: string) => void
}

export function SearchableUserSelect({ 
  defaultValue, 
  users, 
  onValueChange 
}: SearchableUserSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedValue, setSelectedValue] = useState(defaultValue || "")
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = users.filter(user => 
    user.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.value.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedUser = users.find(user => user.value === selectedValue)

  const handleSelect = (value: string) => {
    setSelectedValue(value)
    onValueChange?.(value)
    setIsOpen(false)
    setSearchTerm("")
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open) {
      setSearchTerm("")
    }
  }

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <div className="relative w-full">
          <input
            type="text"
            readOnly
            value={selectedUser?.label || "Seleccionar usuario"}
            className="w-full h-10 px-3 text-[14px] border border-gray-300 rounded-md bg-white appearance-none pr-8 cursor-pointer text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            onClick={() => setIsOpen(true)}
          />
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        </div>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <div className="flex flex-col max-h-[300px]">
          {/* Search Header */}
          <div className="p-3 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar usuarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-8 text-sm border-gray-200"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-3 h-3 text-gray-400" />
                </button>
              )}
            </div>
          </div>

          {/* Users List */}
          <div className="flex-1 overflow-y-auto">
            {filteredUsers.length > 0 ? (
              <div className="py-1">
                {filteredUsers.map((user) => (
                  <div
                    key={user.value}
                    className={`px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 ${
                      selectedValue === user.value ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                    }`}
                    onClick={() => handleSelect(user.value)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage 
                          src={user.avatar} 
                          alt={`Avatar de ${user.label}`}
                        />
                        <AvatarFallback className="text-[10px] bg-blue-100 text-blue-700">
                          {user.label.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-[14px] text-foreground">{user.label}</span>
                        {user.email && (
                          <span className="text-[12px] text-muted-foreground">{user.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No se encontraron usuarios con "{searchTerm}"</p>
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}