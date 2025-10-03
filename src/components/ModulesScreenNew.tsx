import { useState, useEffect, useRef } from "react";
import {
  Search,
  Grid3X3,
  List,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
  Wrench,
  MapPin,
  BarChart3,
  Star,
  Bell,
  Settings,
  CircleUserRound,
  MoreVertical,
  Loader2,
  Download,
  FileType,
  Calendar,
  Trash2,
  FileX,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "./ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/tooltip";
import { Skeleton } from "./ui/skeleton";
import svgPaths from "../imports/svg-1askxd5yi1";

// ============================================================================
// DATOS DE EJEMPLO
// ============================================================================

const reportsData = [
  {
    id: 1,
    nombre: "Viajes diario",
    descripcion: "Seguimiento diario de actividades de movi...",
    tipo: "Viajes",
    guardados: 2,
    icon: FileText,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: 2,
    nombre: "Estado de mantenimiento",
    descripcion: "Seguimiento diario de actividades de movi...",
    tipo: "Mantenimiento",
    guardados: 5,
    icon: Wrench,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: 3,
    nombre: "Seguimiento GPS",
    descripcion: "Seguimiento diario de actividades de movi...",
    tipo: "Eventos",
    guardados: 5,
    icon: MapPin,
    iconBg: "bg-teal-100",
    iconColor: "text-teal-600",
  },
];

const navigationItems = [
  { title: "Monitoreo", isActive: false },
  { title: "Unidades", isActive: false },
  { title: "Dispositivos", isActive: false },
  { title: "Zonas", isActive: false },
  { title: "Reportes", isActive: true },
];

const sidebarItems = [
  { title: "Reportes", isActive: true, key: "templates" },
  { title: "Borradores", isActive: false, key: "drafts" },
  { title: "Guardados", isActive: false, key: "saved" },
  { title: "Favoritos", isActive: false, key: "favorites" },
  { title: "Programados", isActive: false, key: "scheduled" },
];

// ============================================================================
// COMPONENTE HEADER GLOBAL
// ============================================================================

const GlobalHeader = () => {
  return (
    <header className="bg-white border-b border-border">
      <div className="flex items-center justify-between px-6 py-3">
        {/* Left section: Logo and Navigation */}
        <div className="flex items-center gap-8">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">N</span>
            </div>
            <span className="text-foreground">Numaris</span>
          </div>

          {/* Main Navigation */}
          <nav className="flex items-center gap-6">
            {navigationItems.map((item, index) => (
              <div
                key={index}
                className={`px-3 py-2 cursor-pointer transition-colors border-b-2 ${
                  item.isActive
                    ? "text-blue-600 border-blue-600"
                    : "text-muted-foreground border-transparent hover:text-foreground"
                }`}
              >
                {item.title}
              </div>
            ))}
          </nav>
        </div>

        {/* Right section: Actions and user */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="text-muted-foreground p-2">
            <Search className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground p-2">
            <Bell className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground p-2">
            <Settings className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" className="text-muted-foreground p-2">
            <CircleUserRound className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};

// ============================================================================
// COMPONENTE SIDEBAR
// ============================================================================

const Sidebar = ({ activeSection, onSectionChange }: { activeSection: string; onSectionChange: (section: string) => void }) => {
  const handleClick = (key: string, title: string) => {
    // Block navigation to drafts and scheduled sections
    if (key === 'drafts' || key === 'scheduled') {
      return; // Do nothing, prevent navigation
    }
    onSectionChange(key);
  };

  return (
    <div className="w-48 bg-white border-r border-border">
      <div className="p-4">
        <nav className="space-y-1">
          {sidebarItems.map((item, index) => (
            <div
              key={index}
              className={`px-3 py-2 rounded cursor-pointer transition-colors ${
                activeSection === item.key
                  ? "bg-gray-100 text-foreground"
                  : "text-muted-foreground hover:bg-gray-50 hover:text-foreground"
              }`}
              onClick={() => handleClick(item.key, item.title)}
            >
              {item.title}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
};

// ============================================================================
// INTERFACES
// ============================================================================

interface SavedReport {
  id: string;
  name: string;
  description: string;
  isFavorite: boolean;
  savedAt: Date;
  filters: any;
  hasGeneratedData: boolean;
  isGenerating?: boolean;
  lastUpdated?: Date;
  createdBy: string;
  originalTemplate: string;
}

interface DraftReport {
  id: string;
  name: string;
  templateName: string;
  createdAt: Date;
  filters: any;
  hasGeneratedData: boolean;
  isGenerating?: boolean;
  lastUpdated?: Date;
  createdBy: string;
  originalTemplate: string;
  daysUntilDeletion: number;
}

interface ModulesScreenProps {
  onReportSelect: (reportId: number, reportName: string, savedReportData?: SavedReport, draftReportData?: DraftReport, fromSection?: string) => void;
  savedReports: SavedReport[];
  draftReports: DraftReport[];
  onToggleFavorite: (reportId: string) => void;
  initialActiveSection?: string;
  onSectionChange?: (section: string) => void;
}

interface ReportsContentProps {
  onReportSelect?: (reportId: number, reportName: string, savedReportData?: SavedReport, draftReportData?: DraftReport) => void;
  savedReports: SavedReport[];
  draftReports: DraftReport[];
  activeSection: string;
  onToggleFavorite: (reportId: string) => void;
}

// ============================================================================
// COMPONENTE REPORTS CONTENT
// ============================================================================

type SortField = "nombre" | "tipo" | "guardados" | "lastUpdated" | "createdBy";
type SortDirection = "asc" | "desc";

const ReportsContent = ({ onReportSelect, savedReports, draftReports, activeSection, onToggleFavorite }: ReportsContentProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [viewMode, setViewMode] = useState<"cards" | "table">("table");

  // Force table view for non-template sections
  useEffect(() => {
    if (activeSection !== "templates") {
      setViewMode("table");
    }
  }, [activeSection]);
  const [selectedCategory, setSelectedCategory] = useState("Todas las categorías");
  const [isScrolled, setIsScrolled] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Helper function to map template names to their categories
  const getTemplateCategory = (templateName: string): string => {
    const templateCategoryMap: { [key: string]: string } = {
      "Viajes diario": "Viajes",
      "Estado de mantenimiento": "Mantenimiento", 
      "Seguimiento GPS": "Eventos"
    };
    
    return templateCategoryMap[templateName] || "Sin categoría";
  };

  // Helper function to get the correct title based on active section
  const getSectionTitle = () => {
    switch (activeSection) {
      case "saved":
        return "Guardados";
      case "favorites":
        return "Favoritos";
      case "drafts":
        return "Borradores";
      case "scheduled":
        return "Programados";
      default:
        return "Reportes";
    }
  };

  // Get current data based on active section
  const getCurrentData = () => {
    
    switch (activeSection) {
      case "saved":
        return (savedReports || []).map(report => ({
          id: parseInt(report.id.split('_')[1]) || 0,
          nombre: report.name,
          descripcion: report.description,
          tipo: getTemplateCategory(report.originalTemplate),
          guardados: 0,
          icon: FileText,
          iconBg: "bg-green-100",
          iconColor: "text-green-600",
          savedAt: report.savedAt,
          lastUpdated: report.lastUpdated,
          createdBy: report.createdBy,
          isFavorite: report.isFavorite,
          isGenerating: report.isGenerating,
          savedReportData: report,
          filtersPreview: getFiltersPreview(report.filters)
        }));
      case "favorites":
        return (savedReports || [])
          .filter(report => report.isFavorite)
          .map(report => ({
            id: parseInt(report.id.split('_')[1]) || 0,
            nombre: report.name,
            descripcion: report.description,
            tipo: getTemplateCategory(report.originalTemplate),
            guardados: 0,
            icon: Star,
            iconBg: "bg-yellow-100",
            iconColor: "text-yellow-600",
            savedAt: report.savedAt,
            lastUpdated: report.lastUpdated,
            createdBy: report.createdBy,
            isFavorite: report.isFavorite,
            isGenerating: report.isGenerating,
            savedReportData: report,
            filtersPreview: getFiltersPreview(report.filters)
          }));
      case "drafts":
        const draftsData = (draftReports || []).map(draft => ({
          id: parseInt(draft.id.split('_')[1]) || 0,
          nombre: draft.name,
          descripcion: `Borrador • Se eliminará automáticamente en ${draft.daysUntilDeletion} días`,
          tipo: getTemplateCategory(draft.originalTemplate),
          guardados: 0,
          icon: FileText,
          iconBg: "bg-gray-100",
          iconColor: "text-gray-600",
          createdAt: draft.createdAt,
          lastUpdated: draft.lastUpdated,
          createdBy: draft.createdBy,
          isFavorite: false,
          isGenerating: draft.isGenerating,
          draftReportData: draft,
          filtersPreview: getFiltersPreview(draft.filters),
          status: draft.hasGeneratedData ? (draft.isGenerating ? "Generando..." : "Generado") : "Sin generar"
        }));
        return draftsData;
      case "scheduled":
        return []; // Empty array for scheduled section
      default:
        return reportsData;
    }
  };

  // Helper function to create a preview of applied filters
  const getFiltersPreview = (filters: any) => {
    const parts = [];
    if (filters.dateRange) {
      parts.push(`Fecha: ${filters.dateRange.from || 'No especificada'} - ${filters.dateRange.to || 'No especificada'}`);
    }
    if (filters.vehicles && filters.vehicles.length > 0) {
      parts.push(`Unidades: ${filters.vehicles.length} seleccionadas`);
    }
    if (filters.tags && filters.tags.length > 0) {
      parts.push(`Etiquetas: ${filters.tags.length} aplicadas`);
    }
    return parts.length > 0 ? parts.join(', ') : 'Sin filtros configurados';
  };

  // Helper function to format date with time in Spanish format
  const formatDateWithTime = (date: Date): string => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'pm' : 'am';
    const displayHours = hours % 12 || 12;
    
    return `${day}/${month}/${year} ${displayHours.toString().padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
  };

  const currentData = getCurrentData();

  const handleReportClick = (reportId: number, reportName: string, savedReportData?: SavedReport, draftReportData?: DraftReport) => {
    if (onReportSelect) {
      onReportSelect(reportId, reportName, savedReportData, draftReportData);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex-1 bg-white flex flex-col">
        {/* Header with search - Fixed */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h1 className="text-foreground">{getSectionTitle()}</h1>

          {/* Search */}
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar reporte"
              className="pl-9 pr-9 bg-gray-50 border-gray-200"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* Table view with support for drafts */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <div className="border rounded-lg bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-b bg-gray-50">
                      <TableHead className="text-sm font-medium text-muted-foreground">
                        {activeSection === "drafts" ? "Fecha de creación" : "Nombre del reporte"}
                      </TableHead>
                      <TableHead className="text-sm font-medium text-muted-foreground w-80">
                        {activeSection === "drafts" ? "Borrador" : "Descripción"}
                      </TableHead>
                      {activeSection === "drafts" ? (
                        <>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Estado
                          </TableHead>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Categoría
                          </TableHead>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Creado por
                          </TableHead>
                          <TableHead className="w-12"></TableHead>
                        </>
                      ) : (activeSection === "saved" || activeSection === "favorites") ? (
                        <>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Última actualización
                          </TableHead>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Creado por
                          </TableHead>
                          <TableHead className="w-12"></TableHead>
                        </>
                      ) : (
                        <>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Tipo
                          </TableHead>
                          <TableHead className="text-sm font-medium text-muted-foreground">
                            Guardados
                          </TableHead>
                        </>
                      )}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentData.length === 0 ? (
                      <TableRow>
                        <TableCell 
                          colSpan={activeSection === "drafts" ? 6 : (activeSection === "saved" || activeSection === "favorites") ? 4 : 4} 
                          className="text-center py-8 text-muted-foreground"
                        >
                          {activeSection === "drafts" && "No tienes borradores guardados"}
                          {activeSection === "saved" && "No tienes reportes guardados"}
                          {activeSection === "favorites" && "No tienes reportes favoritos"}
                          {activeSection === "scheduled" && "No tienes reportes programados"}
                          {activeSection === "templates" && "No hay plantillas disponibles"}
                        </TableCell>
                      </TableRow>
                    ) : (
                      currentData.map((report) => (
                        <TableRow
                          key={report.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleReportClick(
                            report.id, 
                            report.nombre, 
                            (report as any).savedReportData,
                            (report as any).draftReportData
                          )}
                        >
                          <TableCell className="py-4">
                            {activeSection === "drafts" ? (
                              <div className="text-sm text-muted-foreground">
                                {new Date((report as any).createdAt).toLocaleDateString('es-ES', {
                                  day: '2-digit',
                                  month: '2-digit', 
                                  year: 'numeric'
                                }) + ' ' + 
                                new Date((report as any).createdAt).toLocaleTimeString('es-ES', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }) + ' pm'}
                              </div>
                            ) : (
                              <div className="flex items-center">
                                {(activeSection === "saved" || activeSection === "favorites") && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="p-1 mr-2"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          if ((report as any).savedReportData) {
                                            onToggleFavorite((report as any).savedReportData.id);
                                          }
                                        }}
                                      >
                                        <Star 
                                          className={`w-4 h-4 ${
                                            (report as any).isFavorite 
                                              ? 'text-yellow-500 fill-yellow-500' 
                                              : 'text-gray-400 hover:text-yellow-500'
                                          }`} 
                                        />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Favoritos</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                {(report as any).isGenerating && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <div className="mr-1" tabIndex={0}>
                                        <Skeleton className="w-4 h-4 rounded-full">
                                          <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                                        </Skeleton>
                                      </div>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Este reporte se está generando</p>
                                    </TooltipContent>
                                  </Tooltip>
                                )}
                                <span className="text-blue-600 hover:underline text-sm cursor-pointer">
                                  {report.nombre}
                                </span>
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-muted-foreground text-sm py-4 max-w-xs">
                            <div className="truncate" title={report.descripcion}>
                              {activeSection === "drafts" ? (
                                <span className="text-blue-600 hover:underline cursor-pointer">
                                  {report.nombre}
                                </span>
                              ) : (
                                report.descripcion
                              )}
                            </div>
                          </TableCell>
                          {activeSection === "drafts" ? (
                            <>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {(report as any).status}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {report.tipo}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {(report as any).createdBy}
                              </TableCell>
                              <TableCell className="py-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="p-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Eliminar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </>
                          ) : (activeSection === "saved" || activeSection === "favorites") ? (
                            <>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {(report as any).lastUpdated ? (
                                  formatDateWithTime((report as any).lastUpdated)
                                ) : (report as any).isGenerating || !(report as any).savedReportData?.hasGeneratedData ? (
                                  <span className="text-muted-foreground">--</span>
                                ) : (
                                  <span className="text-gray-500">Sin generar</span>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {(report as any).createdBy}
                              </TableCell>
                              <TableCell className="py-4">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="sm" 
                                      className="p-1"
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Download className="w-4 h-4 mr-2" />
                                      Exportar PDF
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <FileX className="w-4 h-4 mr-2" />
                                      Exportar CSV
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem>
                                      <Calendar className="w-4 h-4 mr-2" />
                                      Programar envío
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                                      <Trash2 className="w-4 h-4 mr-2" />
                                      Eliminar reporte
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {report.tipo}
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm py-4">
                                {report.guardados}
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

// ============================================================================
// COMPONENTE PRINCIPAL MODULES SCREEN
// ============================================================================

const ModulesScreen = ({ onReportSelect, savedReports, draftReports, onToggleFavorite, initialActiveSection = 'templates', onSectionChange }: ModulesScreenProps) => {
  const [activeSection, setActiveSection] = useState(initialActiveSection);

  // Update active section when prop changes
  useEffect(() => {
    setActiveSection(initialActiveSection);
  }, [initialActiveSection]);

  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    // Notify parent component about section change if callback is provided
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <GlobalHeader />
      <div className="flex flex-1 pt-16">
        <Sidebar activeSection={activeSection} onSectionChange={handleSectionChange} />
        <ReportsContent 
          onReportSelect={onReportSelect}
          savedReports={savedReports}
          draftReports={draftReports}
          activeSection={activeSection}
          onToggleFavorite={onToggleFavorite}
        />
      </div>
    </div>
  );
};

export default ModulesScreen;