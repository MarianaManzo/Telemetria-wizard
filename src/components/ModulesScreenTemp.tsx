// Esta es una verificación temporal para ver el final del archivo
import { useState, useEffect } from "react";

// ============================================================================
// COMPONENTE PRINCIPAL MODULES SCREEN
// ============================================================================

const ModulesScreen = ({ onReportSelect, savedReports, onToggleFavorite, initialActiveSection = "templates", onSectionChange }: any) => {
  const [activeSection, setActiveSection] = useState(initialActiveSection)

  // Update local state when initial section changes from parent
  useEffect(() => {
    setActiveSection(initialActiveSection)
  }, [initialActiveSection])

  // Handle section changes
  const handleSectionChange = (section: string) => {
    setActiveSection(section)
    // Notify parent component about the section change
    if (onSectionChange) {
      onSectionChange(section)
    }
  }

  // Modified handleReportClick to pass the current section
  const handleReportClick = (reportId: number, reportName: string, savedReportData?: any) => {
    if (onReportSelect) {
      onReportSelect(reportId, reportName, savedReportData, activeSection)
    }
  }

  return (
    <div>Test</div>
  )
}

export { ModulesScreen }