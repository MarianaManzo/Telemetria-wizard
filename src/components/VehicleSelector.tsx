import { useEffect, useMemo, useState } from 'react';
import UnitsTransferModal, { TransferItem } from './modal/transfer/units';

interface Vehicle {
  id: string;
  name: string;
}

interface VehicleSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVehicles: Vehicle[];
  onSelectionChange: (vehicles: Vehicle[]) => void;
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
  { id: '23', name: 'Sur-023' },
];

const MAX_SELECTION = 10;

export function VehicleSelector({ isOpen, onClose, selectedVehicles, onSelectionChange }: VehicleSelectorProps) {
  const [searchAvailable, setSearchAvailable] = useState('');
  const [searchSelected, setSearchSelected] = useState('');
  const [tempSelected, setTempSelected] = useState<Vehicle[]>(selectedVehicles);

  useEffect(() => {
    if (isOpen) {
      const valid = (selectedVehicles || []).filter((vehicle) => vehicle?.id && vehicle?.name);
      setTempSelected(valid);
      setSearchAvailable('');
      setSearchSelected('');
    }
  }, [isOpen, selectedVehicles]);

  const availableVehicles = useMemo(
    () => mockVehicles.filter((vehicle) => !tempSelected.some((selected) => selected.id === vehicle.id)),
    [tempSelected],
  );

  const filteredAvailable = useMemo(() => {
    const term = searchAvailable.trim().toLowerCase();
    return availableVehicles.filter((vehicle) => vehicle.name.toLowerCase().includes(term));
  }, [availableVehicles, searchAvailable]);

  const filteredSelected = useMemo(() => {
    const term = searchSelected.trim().toLowerCase();
    return tempSelected.filter((vehicle) => vehicle.name.toLowerCase().includes(term));
  }, [tempSelected, searchSelected]);

  const handleSelectAvailable = (vehicle: Vehicle) => {
    if (tempSelected.length >= MAX_SELECTION) return;
    setTempSelected((prev) => [...prev, vehicle]);
  };

  const handleUnselect = (vehicle: Vehicle) => {
    setTempSelected((prev) => prev.filter((item) => item.id !== vehicle.id));
  };

  const handleSelectAllAvailable = () => {
    if (tempSelected.length >= MAX_SELECTION) return;
    const remainingSlots = MAX_SELECTION - tempSelected.length;
    const candidates = filteredAvailable.slice(0, remainingSlots);
    if (candidates.length === 0) return;
    setTempSelected((prev) => [...prev, ...candidates]);
  };

  const handleClearSelected = () => {
    setTempSelected([]);
  };

  const handleContinue = () => {
    onSelectionChange(tempSelected);
    onClose();
  };

  const totalSelected = tempSelected.length;

  const availableColumnItems: TransferItem[] = filteredAvailable;
  const selectedColumnItems: TransferItem[] = filteredSelected;

  return (
    <UnitsTransferModal
      open={isOpen}
      onClose={onClose}
      onSubmit={handleContinue}
      title="Seleccionar unidades"
      subtitle="Selecciona las unidades con las cuales deseas crear el reporte. Elige todas las unidades o solo algunas del total disponible. Recuerda que debes seleccionar al menos 1 unidad para continuar."
      size="md"
      primaryLabel="Continuar"
      secondaryLabel="Cancelar"
      leftColumn={{
        title: 'Unidades disponibles',
        checkbox: {
          checked: filteredAvailable.length === 0 && tempSelected.length > 0,
          indeterminate:
            filteredAvailable.length > 0 && filteredAvailable.length < availableVehicles.length,
          onChange: (event) => {
            if (event.target.checked) {
              handleSelectAllAvailable();
            }
          },
        },
        onClear: () => setSearchAvailable(''),
        clearDisabled: searchAvailable.trim() === '',
        searchPlaceholder: 'Buscar unidades',
        searchValue: searchAvailable,
        onSearchChange: setSearchAvailable,
        items: availableColumnItems,
        emptyMessage: 'No hay unidades',
        onItemClick: handleSelectAvailable,
        itemCheckboxChecked: false,
      }}
      rightColumn={{
        title: 'Unidades seleccionadas',
        checkbox: {
          checked: tempSelected.length > 0 && filteredSelected.length === tempSelected.length,
          indeterminate: tempSelected.length > 0 && filteredSelected.length < tempSelected.length,
          onChange: (event) => {
            if (!event.target.checked) {
              handleClearSelected();
            }
          },
        },
        onClear: handleClearSelected,
        clearDisabled: tempSelected.length === 0,
        searchPlaceholder: 'Buscar unidades seleccionadas',
        searchValue: searchSelected,
        onSearchChange: setSearchSelected,
        items: selectedColumnItems,
        emptyMessage: 'No tienes unidades',
        onItemClick: handleUnselect,
        itemCheckboxChecked: true,
      }}
    />
  );
}
