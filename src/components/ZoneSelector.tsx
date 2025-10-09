import { useEffect, useMemo, useState } from 'react';
import UnitsTransferModal, { TransferItem } from './modal/transfer/units';

interface Zone {
  id: string;
  name: string;
  type: string;
  description?: string;
}

interface ZoneSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedZones: Zone[];
  onSelectionChange: (zones: Zone[]) => void;
}

const mockZones: Zone[] = [
  { id: '1', name: 'Zona A', type: 'Ciudad', description: 'Zona metropolitana' },
  { id: '2', name: 'Centro', type: 'Comercial', description: 'Centro comercial' },
  { id: '3', name: 'Norte', type: 'Ruta', description: 'Ruta de distribución' },
  { id: '4', name: 'Industrial', type: 'Industrial', description: 'Área industrial' },
  { id: '5', name: 'Centro Histórico', type: 'Urbana', description: 'Zona histórica' },
  { id: '6', name: 'Aeropuerto', type: 'Transporte', description: 'Terminal aérea' },
  { id: '7', name: 'Puerto', type: 'Transporte', description: 'Terminal portuaria' },
  { id: '8', name: 'Almacén Principal', type: 'Logística', description: 'Centro de distribución' },
  { id: '9', name: 'Sucursal Norte', type: 'Comercial', description: 'Punto de venta' },
  { id: '10', name: 'Taller Central', type: 'Mantenimiento', description: 'Centro de servicio' },
];

export function ZoneSelector({ isOpen, onClose, selectedZones, onSelectionChange }: ZoneSelectorProps) {
  const [searchAvailable, setSearchAvailable] = useState('');
  const [searchSelected, setSearchSelected] = useState('');
  const [tempSelected, setTempSelected] = useState<Zone[]>(selectedZones);

  useEffect(() => {
    if (isOpen) {
      const valid = (selectedZones || []).filter((zone) => zone && zone.id && zone.name);
      setTempSelected(valid);
      setSearchAvailable('');
      setSearchSelected('');
    }
  }, [isOpen, selectedZones]);

  const availableZones = useMemo(
    () => mockZones.filter((zone) => !tempSelected.some((selected) => selected.id === zone.id)),
    [tempSelected],
  );

  const filteredAvailable = useMemo(() => {
    const term = searchAvailable.trim().toLowerCase();
    return availableZones.filter((zone) => zone.name.toLowerCase().includes(term));
  }, [availableZones, searchAvailable]);

  const filteredSelected = useMemo(() => {
    const term = searchSelected.trim().toLowerCase();
    return tempSelected.filter((zone) => zone.name.toLowerCase().includes(term));
  }, [tempSelected, searchSelected]);

  const handleSelectZone = (zone: Zone) => {
    setTempSelected((prev) => {
      if (prev.some((item) => item.id === zone.id)) {
        return prev;
      }
      return [...prev, zone];
    });
  };

  const handleRemoveZone = (zone: Zone) => {
    setTempSelected((prev) => prev.filter((item) => item.id !== zone.id));
  };

  const handleSelectAllAvailable = () => {
    setTempSelected((prev) => {
      const map = new Map(prev.map((item) => [item.id, item]));
      availableZones.forEach((zone) => {
        if (!map.has(zone.id)) {
          map.set(zone.id, zone);
        }
      });
      return Array.from(map.values());
    });
  };

  const handleClearSelected = () => {
    setTempSelected([]);
  };

  const resetState = () => {
    const valid = (selectedZones || []).filter((zone) => zone && zone.id && zone.name);
    setTempSelected(valid);
    setSearchAvailable('');
    setSearchSelected('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleSubmit = () => {
    onSelectionChange(tempSelected);
    onClose();
  };

  const availableItems: TransferItem[] = filteredAvailable.map((zone) => ({
    id: zone.id,
    name: zone.name,
    description: zone.type,
  }));

  const selectedItems: TransferItem[] = filteredSelected.map((zone) => ({
    id: zone.id,
    name: zone.name,
    description: zone.type,
  }));

  const allSelectedCount = tempSelected.length;
  const allAvailableSelected = availableZones.length === 0 && allSelectedCount > 0;
  const someAvailableSelected = allSelectedCount > 0 && availableZones.length !== mockZones.length;

  return (
    <UnitsTransferModal
      open={isOpen}
      onClose={handleClose}
      onSubmit={allSelectedCount > 0 ? handleSubmit : undefined}
      title="Seleccionar zonas"
      subtitle="Selecciona las zonas geográficas donde debe aplicarse la regla. Elige todas las zonas o solo algunas del total disponible. Recuerda que debes seleccionar al menos 1 zona para continuar."
      size="lg"
      primaryLabel="Continuar"
      secondaryLabel="Cancelar"
      leftColumn={{
        title: 'Zonas disponibles',
        checkbox: {
          checked: allAvailableSelected,
          indeterminate: !allAvailableSelected && someAvailableSelected,
          onChange: (event) => {
            if (event.target.checked) {
              handleSelectAllAvailable();
            }
          },
        },
        onClear: () => setSearchAvailable(''),
        clearDisabled: searchAvailable.trim() === '',
        searchPlaceholder: 'Buscar zonas',
        searchValue: searchAvailable,
        onSearchChange: setSearchAvailable,
        items: availableItems,
        emptyMessage: 'No tienes zonas disponibles',
        onItemClick: (item) => {
          const zone = filteredAvailable.find((zone) => zone.id === item.id);
          if (zone) {
            handleSelectZone(zone);
          }
        },
        itemCheckboxChecked: false,
        renderSubtitle: <span style={{ color: '#6B7280' }}>{availableZones.length} zonas</span>,
      }}
      rightColumn={{
        title: 'Zonas seleccionadas',
        checkbox: {
          checked: allSelectedCount > 0 && filteredSelected.length === allSelectedCount,
          indeterminate: allSelectedCount > 0 && filteredSelected.length < allSelectedCount,
          onChange: (event) => {
            if (!event.target.checked) {
              handleClearSelected();
            }
          },
        },
        onClear: handleClearSelected,
        clearDisabled: allSelectedCount === 0,
        searchPlaceholder: 'Buscar zonas seleccionadas',
        searchValue: searchSelected,
        onSearchChange: setSearchSelected,
        items: selectedItems,
        emptyMessage: 'No tienes zonas',
        onItemClick: (item) => {
          const zone = tempSelected.find((zone) => zone.id === item.id);
          if (zone) {
            handleRemoveZone(zone);
          }
        },
        itemCheckboxChecked: true,
        renderSubtitle: <span style={{ color: '#6B7280' }}>{allSelectedCount} seleccionadas</span>,
      }}
    />
  );
}
