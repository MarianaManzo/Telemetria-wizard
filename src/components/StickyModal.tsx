import React from 'react'
import ModalBase, { ModalBaseProps } from './ModalBase'

export type StickyModalProps = Omit<ModalBaseProps, 'rootClassName'> & {
  rootClassName?: string
}

export default function StickyModal(props: StickyModalProps) {
  return <ModalBase {...props} rootClassName={props.rootClassName ?? 'nm-sticky-modal'} />
}

// StickyModalProps is exported above via `export type StickyModalProps = ...`
