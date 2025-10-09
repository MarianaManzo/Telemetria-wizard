import React, { useEffect, useRef } from 'react'
import { Modal, Typography, Button } from 'antd'
import { CloseOutlined } from '@ant-design/icons'

const { Text } = Typography

export type ModalBaseProps = {
  open: boolean
  title?: React.ReactNode
  subtitle?: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
  maskClosable?: boolean
  onClose: () => void
  onSubmit?: () => void
  primaryLabel?: string
  secondaryLabel?: string
  hideSecondary?: boolean
  children?: React.ReactNode
  /** If provided, will be rendered instead of the default footer */
  customFooter?: React.ReactNode
  rootClassName?: string
}

const WIDTH_MAP: Record<NonNullable<ModalBaseProps['size']>, number> = {
  sm: 560,
  md: 720,
  lg: 880,
}

export default function ModalBase({
  open,
  title,
  subtitle,
  size = 'md',
  maskClosable = true,
  onClose,
  onSubmit,
  primaryLabel = 'Guardar',
  secondaryLabel = 'Cancelar',
  hideSecondary,
  children,
  customFooter,
  rootClassName,
}: ModalBaseProps) {
  const triggerRef = useRef<HTMLElement | null>(document.activeElement as HTMLElement)

  useEffect(() => {
    if (!open && triggerRef.current) {
      triggerRef.current.focus?.()
    }
  }, [open])

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={WIDTH_MAP[size]}
      centered
      maskClosable={maskClosable}
      keyboard
      closable={false}
      rootClassName={rootClassName ?? 'nm-modal-base'}
      style={{ top: 32 }}
      styles={{
        content: { borderRadius: 16, boxShadow: '0 12px 32px rgba(0,0,0,.18)', padding: 0 },
        header: { display: 'none' },
        body: { padding: 0 },
        footer: { display: 'none' },
      }}
    >
      <div
        className="ModalBase"
        style={{ display: 'flex', flexDirection: 'column', fontFamily: "'Source Sans 3', sans-serif" }}
      >
        {(title || true) && (
          <div
            className="ModalBase_header flex items-center justify-between border-b"
            style={{ padding: 16, minHeight: 64, fontFamily: 'Source Sans 3, sans-serif' }}
          >
            {title ? (
              <Typography.Title level={5} style={{ margin: 0, fontSize: 16, lineHeight: '24px', fontWeight: 600 }}>
                {title}
              </Typography.Title>
            ) : null}
            <Button type="text" aria-label="Cerrar" icon={<CloseOutlined />} onClick={onClose} />
          </div>
        )}

        <div className="ModalBase_standardContent" style={{ padding: 24, fontFamily: 'Source Sans 3, sans-serif', fontSize: 14 }}>
          {subtitle && (
            <Text style={{ display: 'block', fontSize: 14, lineHeight: '20px', color: '#6B7280', marginBottom: 24 }}>
              {subtitle}
            </Text>
          )}
          {children}
        </div>

        {customFooter ? (
          <div className="ModalBase_footer custom-footer" style={{ padding: '16px 24px' }}>
            {customFooter}
          </div>
        ) : (
          <div
            className="ModalBase_footer flex items-center justify-end gap-3 border-t"
            style={{ padding: '16px 24px', fontFamily: 'Source Sans 3, sans-serif' }}
          >
            {!hideSecondary && (
              <Button onClick={onClose} style={{ height: 32, minHeight: 32, paddingInline: 16, fontSize: 14 }}>
                {secondaryLabel}
              </Button>
            )}
            <Button
              type="primary"
              onClick={onSubmit}
              style={{ height: 32, minHeight: 32, paddingInline: 16, fontSize: 14 }}
              disabled={!onSubmit}
            >
              {primaryLabel}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}

// ModalBaseProps is already exported above via `export type ModalBaseProps = ...`
