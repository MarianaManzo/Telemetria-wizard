import { Empty, Typography, Input, Checkbox, Row, Col } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { CheckboxChangeEvent } from 'antd/es/checkbox';
import StickyModal from '../../StickyModal';
import type { StickyModalProps } from '../../StickyModal';
import { Button as AntButton } from 'antd';
import type { ReactNode } from 'react';

const { Text } = Typography;

export interface TransferItem {
  id: string;
  name: string;
}

export interface TransferColumnProps {
  title: string;
  checkbox?: {
    checked: boolean;
    indeterminate?: boolean;
    disabled?: boolean;
    onChange: (event: CheckboxChangeEvent) => void;
  };
  onClear: () => void;
  clearDisabled?: boolean;
  searchPlaceholder: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  items: TransferItem[];
  emptyMessage: string;
  onItemClick: (item: TransferItem) => void;
  itemCheckboxChecked: boolean;
  renderSubtitle?: ReactNode;
}

export interface UnitsTransferModalProps
  extends Pick<StickyModalProps, 'open' | 'title' | 'subtitle' | 'size' | 'onClose' | 'onSubmit' | 'primaryLabel' | 'secondaryLabel' | 'hideSecondary'> {
  leftColumn: TransferColumnProps;
  rightColumn: TransferColumnProps;
}

const panelStyles: React.CSSProperties = {
  border: '1px solid #E5E7EB',
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  height: 360,
  maxHeight: 360,
  overflow: 'hidden',
};

const listStyles: React.CSSProperties = {
  borderRadius: 8,
  height: '100%',
  overflowY: 'auto',
  overflowX: 'hidden',
};

function TransferColumn({
  title,
  checkbox,
  onClear,
  clearDisabled,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  items,
  emptyMessage,
  onItemClick,
  itemCheckboxChecked,
  renderSubtitle,
}: TransferColumnProps) {
  return (
    <div style={{ ...panelStyles, width: '100%' }}>
      <div className="flex items-center justify-between" style={{ padding: 16, borderBottom: '1px solid #E5E7EB' }}>
        <div className="flex items-center gap-2" style={{ fontSize: 14 }}>
          {checkbox && (
            <Checkbox
              checked={checkbox.checked}
              indeterminate={checkbox.indeterminate}
              disabled={checkbox.disabled}
              onChange={checkbox.onChange}
            />
          )}
          <Text strong style={{ fontSize: 14 }}>
            {title}
          </Text>
        </div>
        <AntButton
          type="text"
          onClick={onClear}
          disabled={clearDisabled}
          style={{ fontSize: 14, height: 32, minHeight: 32, paddingInline: 16, color: '#1867FF' }}
        >
          Limpiar
        </AntButton>
      </div>

      {renderSubtitle && <div style={{ padding: '0 16px', fontSize: 14 }}>{renderSubtitle}</div>}

      <div style={{ padding: '16px 16px 12px', fontSize: 14 }}>
        <Input
          prefix={<SearchOutlined />}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(event) => onSearchChange(event.target.value)}
          allowClear
        />
      </div>
      <div style={{ padding: '0 16px 16px', flex: 1 }}>
        <div style={listStyles}>
          {items.length === 0 ? (
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyMessage} style={{ paddingTop: 40 }} />
          ) : (
            items.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-2"
                style={{ padding: '12px 16px', cursor: 'pointer' }}
                onClick={() => onItemClick(item)}
              >
                <Checkbox checked={itemCheckboxChecked} style={{ pointerEvents: 'none' }} />
                <Text style={{ fontSize: 14 }}>{item.name}</Text>
              </label>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default function UnitsTransferModal({
  open,
  title,
  subtitle,
  size,
  onClose,
  onSubmit,
  primaryLabel,
  secondaryLabel,
  hideSecondary,
  leftColumn,
  rightColumn,
}: UnitsTransferModalProps) {
  return (
    <StickyModal
      open={open}
      onClose={onClose}
      onSubmit={onSubmit}
      title={title}
      subtitle={subtitle}
      size={size}
      primaryLabel={primaryLabel}
      secondaryLabel={secondaryLabel}
      hideSecondary={hideSecondary}
    >
      <Row gutter={[24, 16]} className="ModalBase_standardContent" style={{ fontSize: 14 }}>
        <Col xs={24} md={12} style={{ display: 'flex' }}>
          <TransferColumn {...leftColumn} />
        </Col>
        <Col xs={24} md={12} style={{ display: 'flex' }}>
          <TransferColumn {...rightColumn} />
        </Col>
      </Row>
    </StickyModal>
  );
}
