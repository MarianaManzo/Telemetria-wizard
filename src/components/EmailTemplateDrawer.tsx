"use client"

import React, { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import {
  Mail,
  Settings,
  ChevronDown,
  Plus,
  GripVertical,
  AlertTriangle,
  Image,
  Type,
  FileText,
  MousePointerClick,
  Link as LinkIcon,
  Paperclip,
  Code,
  Quote,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Eye,
  Save
} from 'lucide-react'
import { Input } from './ui/input'

const TRIGGER_BASE_CLASSES = 'inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-semibold transition-colors'

const toolbarButtons = [
  { key: 'bold', label: 'B' },
  { key: 'italic', label: 'I' },
  { key: 'underline', label: 'U' },
  { key: 'link', icon: LinkIcon },
  { key: 'attach', icon: Paperclip },
  { key: 'code', icon: Code },
  { key: 'quote', icon: Quote },
  { key: 'list', icon: List },
  { key: 'list-ordered', icon: ListOrdered },
  { key: 'align-left', icon: AlignLeft },
  { key: 'align-center', icon: AlignCenter },
  { key: 'align-justify', icon: AlignJustify }
]

const templateComponents = [
  { icon: Type, label: 'Encabezado', helper: 'Titulo principal' },
  { icon: FileText, label: 'Bloque de Texto', helper: 'Parrafo de texto' },
  { icon: AlertTriangle, label: 'Mensaje de Alerta', helper: 'Parrafo de alerta' },
  { icon: MousePointerClick, label: 'Boton de Accion', helper: 'Boton destacable' },
  { icon: GripVertical, label: 'Divisor', helper: 'Linea separadora' },
  { icon: Image, label: 'Imagen', helper: 'Imagen o grafico' }
]

const variableChips = ['{{companyName}}', '{{firstName}}', '{{lastName}}', '{{event.url}}', '{{sensor}}', '{{unidad}}', '{{fecha}}', '{{hora}}']

type EmailTemplateDrawerProps = {
  variant?: 'default' | 'inline'
}

export function EmailTemplateDrawer({ variant = 'default' }: EmailTemplateDrawerProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return undefined
    const { overflow } = document.body.style
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = overflow
    }
  }, [open])

  const handleClose = () => setOpen(false)

  const triggerClasses =
    variant === 'inline'
      ? `${TRIGGER_BASE_CLASSES} border border-[#4C6FFF] bg-white text-[#3559FF] hover:bg-[#EEF2FF]`
      : `${TRIGGER_BASE_CLASSES} text-[#3559FF] hover:text-[#1D37B7]`

  const triggerButton = (
    <button type="button" onClick={() => setOpen(true)} className={triggerClasses}>
      <span className="text-[20px] leading-none">+</span>
      Crear plantilla
    </button>
  )

  const drawer =
    open &&
    createPortal(
      <div className="fixed inset-0 z-[1100]">
        <div
          className="absolute inset-0 z-10 bg-black/75 backdrop-blur-sm transition-opacity duration-200"
          onClick={handleClose}
        />

        <div className="absolute right-0 top-0 z-20 flex h-full w-[50vw] min-w-[520px] max-w-[960px] flex-col bg-white shadow-[0_0_60px_rgba(17,24,52,0.35)]">
          <header className="flex items-start justify-between border-b border-[#E4E8F5] px-8 py-6">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4C6FFF]">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-[20px] font-semibold text-[#1D2342]">Crear plantilla de email</h2>
                <p className="text-[13px] text-[#6F7390]">Disena tu plantilla con componentes y variables dinamicas</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E4E8F5] bg-white text-[#4A4F68] transition-colors hover:bg-[#F2F4FF]"
            >
              <span className="sr-only">Cerrar</span>
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" />
                <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" />
              </svg>
            </button>
          </header>

          <div className="flex flex-1 overflow-hidden bg-[#F7F8FF]">
            <section className="flex-1 overflow-y-auto border-r border-[#E4E8F5] px-8 py-6">
              <div className="space-y-6">
                <article className="rounded-2xl border border-[#E1E6FF] bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#EEF2FF] text-[#4C6FFF]">
                        <Settings className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-semibold text-[#1D2342]">Configuracion de plantilla</h3>
                        <p className="text-[12px] text-[#6F7390]">Define la informacion base de este correo automatizado.</p>
                      </div>
                    </div>
                    <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full border border-[#E4E8F5] bg-[#F9FAFF] text-[#4A4F68]">
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#414168]">
                        Nombre de plantilla <span className="text-[#4C6FFF]">*</span>
                      </label>
                      <Input placeholder="Ej: Alerta de velocidad excesiva" className="h-11 rounded-xl border-[#D8DEFF] bg-[#FCFDFF] text-[13px]" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#414168]">
                        Asunto del email <span className="text-[#4C6FFF]">*</span>
                      </label>
                      <Input placeholder="ALERTA: {{evento}} detectado en {{unidad}}" className="h-11 rounded-xl border-[#D8DEFF] bg-[#FCFDFF] text-[13px]" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-2">
                        <span className="text-[12px] font-semibold text-[#555A7A]">Remitente</span>
                        <div className="rounded-lg border border-[#D8DEFF] bg-[#F8F9FF] px-3 py-2 text-[13px] text-[#1D2342]">
                          sistema@numaris.com
                        </div>
                      </div>
                      <div className="space-y-2">
                        <span className="text-[12px] font-semibold text-[#555A7A]">Destinatarios</span>
                        <div className="rounded-lg border border-[#D8DEFF] bg-[#F8F9FF] px-3 py-2 text-[13px] text-[#1D2342]">
                          supervisor@empresa.com
                        </div>
                      </div>
                    </div>
                  </div>
                </article>

                <article className="rounded-2xl border border-[#E1E6FF] bg-white p-6 shadow-sm">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h3 className="text-[14px] font-semibold text-[#1D2342]">Contenido del Email</h3>
                      <p className="text-[12px] text-[#6F7390]">Usa '#' para autocompletar variables</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#D8DEFF] bg-[#F4F6FF] px-4 py-2">
                    {toolbarButtons.map((btn) => (
                      <button
                        key={btn.key}
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[13px] font-semibold text-[#4A4F68] transition-colors hover:bg-white"
                      >
                        {btn.icon ? <btn.icon className="h-4 w-4" /> : btn.label}
                      </button>
                    ))}
                  </div>

                  <div className="mt-4 rounded-2xl border border-dashed border-[#D8DEFF] bg-[#FBFCFF] p-6 text-[13px] leading-[22px] text-[#313655]">
                    <div className="relative mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-[12px] uppercase tracking-[0.08em] text-[#60689A]">
                        <GripVertical className="h-4 w-4 text-[#B7C0F4]" />
                        <span>Bloque de mensaje</span>
                      </div>
                      <button type="button" className="text-[12px] font-medium text-[#4C6FFF] hover:text-[#1D37B7]">
                        Insertar componente
                      </button>
                    </div>
                    <div className="space-y-3">
                      <p className="font-semibold">**ALERTA DETECTADA**</p>
                      <div className="space-y-1">
                        <p>
                          Unidad: <span className="inline-flex rounded-md bg-[#EFE7FF] px-2 py-0.5 text-[#5B34B6]">{`{{unidad}}`}</span>
                        </p>
                        <p>
                          Conductor: <span className="inline-flex rounded-md bg-[#EFE7FF] px-2 py-0.5 text-[#5B34B6]">{`{{conductor}}`}</span>
                        </p>
                        <p>
                          Ubicacion: <span className="inline-flex rounded-md bg-[#EFE7FF] px-2 py-0.5 text-[#5B34B6]">{`{{ubicacion}}`}</span>
                        </p>
                        <p>
                          Fecha y hora:{' '}
                          <span className="inline-flex rounded-md bg-[#EFE7FF] px-2 py-0.5 text-[#5B34B6]">{`{{fecha}}`}</span>{' '}
                          <span className="inline-flex rounded-md bg-[#EFE7FF] px-2 py-0.5 text-[#5B34B6]">{`{{hora}}`}</span>
                        </p>
                      </div>
                      <p className="pt-3">Por favor revise este evento.</p>
                      <p className="text-[12px] text-[#6F7390]">Sistema de Monitoreo Numaris</p>
                    </div>
                  </div>
                </article>
              </div>
            </section>

            <aside className="hidden w-[320px] flex-col gap-6 overflow-y-auto border-l border-[#E4E8F5] bg-white px-6 py-6 lg:flex">
              <div className="space-y-4">
                <div className="space-y-1">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#60689A]">Componentes</span>
                  <p className="text-[12px] text-[#7D82A0]">Construye bloques reutilizables para tu mensaje.</p>
                </div>
                <div className="space-y-2">
                  {templateComponents.map(({ icon: Icon, label, helper }) => (
                    <button
                      key={label}
                      type="button"
                      className="flex w-full items-center justify-between rounded-2xl border border-[#E2E7FF] bg-[#F8F9FF] px-3 py-3 text-left transition-colors hover:border-[#CBD3FF] hover:bg-white"
                    >
                      <span className="flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-[#4C6FFF]">
                          <Icon className="h-4 w-4" />
                        </span>
                        <span>
                          <span className="block text-[13px] font-semibold text-[#1D2342]">{label}</span>
                          <span className="block text-[11px] text-[#6F7390]">{helper}</span>
                        </span>
                      </span>
                      <Plus className="h-4 w-4 text-[#7F8CFF]" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <span className="text-[13px] font-semibold uppercase tracking-[0.08em] text-[#60689A]">Variables</span>
                  <p className="text-[12px] text-[#7D82A0]">Inserta datos dinamicos disponibles.</p>
                </div>
                <Input placeholder="Buscar variables..." className="h-10 rounded-lg border-[#D8DEFF] bg-[#FCFDFF] text-[13px]" />
                <div className="grid grid-cols-2 gap-2">
                  {variableChips.map((variable) => (
                    <button
                      key={variable}
                      type="button"
                      className="inline-flex items-center justify-center rounded-xl bg-[#F1E6FF] px-3 py-2 text-[12px] font-medium text-[#5B34B6] transition-colors hover:bg-[#E6DCFF]"
                    >
                      {variable}
                    </button>
                  ))}
                </div>
              </div>
            </aside>
          </div>

          <footer className="flex items-center justify-between border-t border-[#E4E8F5] bg-white px-8 py-4">
            <div className="flex items-center gap-3">
              <button type="button" onClick={handleClose} className="text-[13px] font-medium text-[#6F7390] hover:text-[#1D2342]">
                Cancelar
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-[#D8DEFF] px-3 py-1.5 text-[12px] font-semibold text-[#4C6FFF] hover:bg-[#F1F3FF]"
              >
                <Eye className="h-4 w-4" />
                Vista previa
              </button>
            </div>

            <button
              type="button"
              onClick={handleClose}
              className="inline-flex items-center gap-2 rounded-full bg-[#4C6FFF] px-5 py-2 text-[13px] font-semibold text-white shadow-[0_12px_20px_rgba(76,111,255,0.2)] hover:bg-[#3B55FF]"
            >
              <Save className="h-4 w-4" />
              Guardar y cerrar
            </button>
          </footer>
        </div>
      </div>,
      document.body
    )

  return (
    <>
      {triggerButton}
      {drawer}
    </>
  )
}
