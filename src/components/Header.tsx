import { Button } from "./ui/button"
import { Search, Bell, Settings, CircleUserRound } from "lucide-react"

export function Header() {
  return (
    <header className="bg-white border-b border-border px-6 py-3 flex items-center justify-between">
      {/* Left section: Logo and brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold text-sm">N</span>
        </div>
        <span className="text-gray-900 font-medium">Numaris</span>
      </div>

      {/* Right section: Actions and user */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <Button variant="ghost" size="sm" className="text-gray-600 p-2">
          <Search className="w-4 h-4" />
        </Button>
        
        {/* Notifications */}
        <Button variant="ghost" size="sm" className="text-gray-600 p-2">
          <Bell className="w-4 h-4" />
        </Button>
        
        {/* Settings */}
        <Button variant="ghost" size="sm" className="text-gray-600 p-2">
          <Settings className="w-4 h-4" />
        </Button>
        
        {/* User profile */}
        <Button variant="ghost" size="sm" className="text-gray-600 p-2">
          <CircleUserRound className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}