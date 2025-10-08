import { useState, useEffect, useMemo } from 'react'
import { Form, Input, Row, Col, Typography, Empty, Button as AntButton, Checkbox as AntCheckbox } from 'antd'
import { SearchOutlined } from '@ant-design/icons'
import StickyModal from './StickyModal'

interface Vehicle {
  id: string
  name: string
}

interface VehicleSelectorProps {
  isOpen: boolean
  onClose: () => void
  selectedVehicles: Vehicle[]
  onSelectionChange: (vehicles: Vehicle[]) => void
}

const mockVehicles: Vehicle[] = [
  { id: '1', name: 'Cagsa6' },
  { id: '2', name: 'Isuzu 92' },
  { id: '3', name: 'Cagsa8' },
  { id: '4', name: 'Vector 85' },
  { id: '25', name: 'DRM Leasing2' },
  { id: '26', name: 'Toyota 30' },
  { id: '5', name: 'Unidad de Reparto GDL' },
  { id: '6', name: 'Unidad de Reparto CDMX' },
  { id: '7', name: 'Unidad de Reparto GTO' },
  { id: '8', name: 'Unidad de Reparto Querétaro' },
  { id: '9', name: 'Unidad de Reparto Chiapas' },
  { id: '10', name: 'Toyota Camry Flota 1' },
  { id: '11', name: 'Ford Transit 2023' },
  { id: '12', name: 'Mercedes Sprinter' },
  { id: '13', name: 'Chevrolet Express' },
  { id: '14', name: 'Nissan NV200' },
  { id: '15', name: 'Volkswagen Crafter' },
  { id: '16', name: 'Iveco Daily' },
  { id: '17', name: 'Renault Master' },
  { id: '18', name: 'Peugeot Boxer' },
  { id: '19', name: 'Fiat Ducato' },
  { id: '20', name: 'RAM ProMaster' },
  { id: '21', name: 'Mitsubishi Fuso' },
  { id: '22', name: 'Norte-022' },
  { id: '23', name: 'Sur-023' }
]

const MAX_SELECTION = 10

const panelStyles: React.CSSProperties = {
  border: '1px solid #E5E7EB',
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  height: 360,
  maxHeight: 360,
  overflow: 'hidden',
}

const listStyles: React.CSSProperties = {
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
}

export function VehicleSelector({ isOpen, onClose, selectedVehicles, onSelectionChange }: VehicleSelectorProps) {
  const [searchAvailable, setSearchAvailable] = useState('')
  const [searchSelected, setSearchSelected] = useState('')
  const [tempSelected, setTempSelected] = useState<Vehicle[]>(selectedVehicles)

  useEffect(() => {
    if (isOpen) {
      const valid = (selectedVehicles || []).filter(v => v?.id && v?.name)
      setTempSelected(valid)
      setSearchAvailable('')
      setSearchSelected('')
    }
  }, [isOpen, selectedVehicles])

  const availableVehicles = useMemo(
    () => mockVehicles.filter(vehicle => !tempSelected.some(selected => selected.id === vehicle.id)),
    [tempSelected]
  )

  const filteredAvailable = useMemo(() => {
    const term = searchAvailable.trim().toLowerCase()
    return availableVehicles.filter(vehicle => vehicle.name.toLowerCase().includes(term))
  }, [availableVehicles, searchAvailable])

  const filteredSelected = useMemo(() => {
    const term = searchSelected.trim().toLowerCase()
    return tempSelected.filter(vehicle => vehicle.name.toLowerCase().includes(term))
  }, [tempSelected, searchSelected])

  const handleSelectAvailable = (vehicle: Vehicle) => {
    if (tempSelected.length >= MAX_SELECTION) return
    setTempSelected(prev => [...prev, vehicle])
  }

  const handleUnselect = (vehicle: Vehicle) => {
    setTempSelected(prev => prev.filter(item => item.id !== vehicle.id))
  }

  const handleSelectAllAvailable = () => {
    const candidates = filteredAvailable.slice(0, MAX_SELECTION - tempSelected.length)
    if (candidates.length === 0) return
    setTempSelected(prev => [...prev, ...candidates])
  }

  const handleClearSelected = () => {
    setTempSelected([])
  }

  const handleContinue = () => {
    onSelectionChange(tempSelected)
    onClose()
  }

  const totalUnits = mockVehicles.length
  const totalSelected = tempSelected.length

  return (
    <StickyModal
      open={isOpen}
      onClose={onClose}
      onSubmit={totalSelected > 0 ? handleContinue : undefined}
      title="Seleccionar unidades"
      subtitle="Selecciona las unidades con las cuales deseas crear el reporte. Elige todas las unidades o solo algunas del total disponible. Recuerda que debes seleccionar al menos 1 unidad para continuar."
      size="md"
      primaryLabel="Continuar"
      secondaryLabel="Cancelar"
    >
      <div style={{ fontSize: 14 }} className="ModalBase_standardContent">
        <Form layout="vertical">
          <Row gutter={[24, 16]}>
            <Col xs={24} md={12} style={{ display: 'flex' }}>
              <div style={{ ...panelStyles, width: '100%' }}>
                <div className="flex items-center justify-between" style={{ padding: 16, borderBottom: '1px solid #E5E7EB' }}>
                  <div className="flex items-center gap-2" style={{ fontSize: 14 }}>
                    <AntCheckbox
                      checked={filteredAvailable.length === 0 && tempSelected.length > 0}
                      indeterminate={filteredAvailable.length > 0 && filteredAvailable.length < availableVehicles.length}
                      onChange={(event) => {
                        if (event.target.checked) {
                          handleSelectAllAvailable()
                        }
                      }}
                    />
                    <Typography.Text strong style={{ fontSize: 14 }}>
                      {totalUnits} Unidades
                    </Typography.Text>
                  </div>
                  <div className="flex items-center gap-3" style={{ fontSize: 14 }}>
                    <AntButton type="text" size="small" onClick={() => setSearchAvailable('')} style={{ fontSize: 14 }}>
                      Limpiar
                    </AntButton>
                    <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                      {filteredAvailable.length} disponibles
                    </Typography.Text>
                  </div>
                </div>
                <div style={{ padding: '16px 16px 12px' }}>
                  <Input
                    prefix={<SearchOutlined />}
                    placeholder="Buscar Unidades"
                    value={searchAvailable}
                    onChange={(event) => setSearchAvailable(event.target.value)}
                    allowClear
                  />
                </div>
                <div style={{ padding: '0 16px 16px', flex: 1 }}>
                  <div style={listStyles}>
                    {filteredAvailable.length === 0 ? (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No hay unidades" style={{ paddingTop: 40 }} />
                    ) : (
                      filteredAvailable.map(vehicle => (
                        <label
                          key={vehicle.id}
                          className="flex items-center gap-2"
                          style={{ padding: '12px 16px', cursor: 'pointer' }}
                          onClick={() => handleSelectAvailable(vehicle)}
                        >
                          <AntCheckbox checked={false} style={{ pointerEvents: 'none' }} />
                          <Typography.Text style={{ fontSize: 14 }}>{vehicle.name}</Typography.Text>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
          </Col>

          <Col xs={24} md={12} style={{ display: 'flex' }}>
            <div style={{ ...panelStyles, width: '100%' }}>
                <div className="flex items-center justify-between" style={{ padding: 16, borderBottom: '1px solid #E5E7EB' }}>
                  <div className="flex items-center gap-2" style={{ fontSize: 14 }}>
                    <AntCheckbox
                      indeterminate={tempSelected.length > 0 && filteredSelected.length > 0 && filteredSelected.length < tempSelected.length}
                      checked={tempSelected.length > 0}
                      onChange={(event) => {
                        if (!event.target.checked) {
                          handleClearSelected()
                        }
                      }}
                    />
                    <Typography.Text strong style={{ fontSize: 14 }}>
                      {tempSelected.length} Seleccionadas
                    </Typography.Text>
                  </div>
                  <div className="flex items-center gap-3" style={{ fontSize: 14 }}>
                    <AntButton
                      type="text"
                      size="small"
                      onClick={handleClearSelected}
                      disabled={tempSelected.length === 0}
                      style={{ fontSize: 14 }}
                    >
                      Limpiar
                    </AntButton>
                    <Typography.Text type="secondary" style={{ fontSize: 14 }}>
                      Máx. {MAX_SELECTION}
                    </Typography.Text>
                  </div>
                </div>
                <div style={{ padding: '16px 16px 12px' }}>
                  <Input
                    prefix={<SearchOutlined />}
                    placeholder="Buscar Unidades"
                    value={searchSelected}
                    onChange={(event) => setSearchSelected(event.target.value)}
                    allowClear
                  />
                </div>
                <div style={{ padding: '0 16px 16px', flex: 1 }}>
                  <div style={listStyles}>
                    {filteredSelected.length === 0 ? (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No tienes unidades" style={{ paddingTop: 40 }} />
                    ) : (
                      filteredSelected.map(vehicle => (
                        <label
                          key={vehicle.id}
                          className="flex items-center gap-2"
                          style={{ padding: '12px 16px', cursor: 'pointer' }}
                          onClick={() => handleUnselect(vehicle)}
                        >
                          <AntCheckbox checked style={{ pointerEvents: 'none' }} />
                          <Typography.Text style={{ fontSize: 14 }}>{vehicle.name}</Typography.Text>
                        </label>
                      ))
                    )}
                  </div>
                </div>
              </div>
          </Col>
        </Row>
      </Form>
    </div>
    </StickyModal>
  )
}
