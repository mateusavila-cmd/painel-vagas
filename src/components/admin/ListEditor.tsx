'use client'

import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'

interface FieldConfig<T> {
  key: keyof T
  label: string
  placeholder?: string
  multiline?: boolean
}

interface ListEditorProps<T> {
  items: T[]
  onChange: (items: T[]) => void
  fields: FieldConfig<T>[]
  emptyItem: T
  addLabel: string
  emptyMessage: string
}

export function ListEditor<T extends Record<string, any>>({
  items,
  onChange,
  fields,
  emptyItem,
  addLabel,
  emptyMessage,
}: ListEditorProps<T>) {
  const updateItem = (index: number, key: keyof T, value: string) => {
    const next = [...items]
    next[index] = { ...next[index], [key]: value }
    onChange(next)
  }

  const removeItem = (index: number) => {
    onChange(items.filter((_, i) => i !== index))
  }

  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction
    if (target < 0 || target >= items.length) return
    const next = [...items]
    ;[next[index], next[target]] = [next[target], next[index]]
    onChange(next)
  }

  const addItem = () => {
    onChange([...items, { ...emptyItem }])
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && (
        <p className="text-xs text-slate-400 italic">{emptyMessage}</p>
      )}

      {items.map((item, index) => (
        <div key={index} className="border border-slate-200 rounded-xl p-4 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">#{index + 1}</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => moveItem(index, -1)}
                disabled={index === 0}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Mover para cima"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => moveItem(index, 1)}
                disabled={index === items.length - 1}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg disabled:opacity-30 disabled:pointer-events-none transition-colors"
                title="Mover para baixo"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                title="Remover"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {fields.map((field) => (
              <div key={String(field.key)} className={field.multiline ? 'sm:col-span-2' : ''}>
                <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                  {field.label}
                </label>
                {field.multiline ? (
                  <textarea
                    rows={2}
                    value={item[field.key] ?? ''}
                    onChange={(e) => updateItem(index, field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white text-slate-900 resize-y"
                  />
                ) : (
                  <input
                    type="text"
                    value={item[field.key] ?? ''}
                    onChange={(e) => updateItem(index, field.key, e.target.value)}
                    placeholder={field.placeholder}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm bg-white text-slate-900"
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        type="button"
        onClick={addItem}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-lg transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        {addLabel}
      </button>
    </div>
  )
}
