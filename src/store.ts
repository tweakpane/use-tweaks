import { useState, useEffect } from 'react'
import create from 'zustand'
import Tweakpane from 'tweakpane'
import { Schema, Folder, SpecialInputTypes, Settings, Button, InputConstructor } from './types'
import { FolderApi } from 'tweakpane/dist/types/api/folder'

let pane: Tweakpane | undefined

type StoreType = {
  dispose: () => void
  data: { [key: string]: unknown }
}

function buildPaneAndReturnData(
  schema: Schema,
  _pane: Tweakpane | FolderApi,
  setValue: (key: string, value: unknown) => void
): { [key: string]: unknown } {
  return Object.entries(schema).reduce((accValues, [key, input]) => {
    if (typeof input === 'object') {
      if ('type' in input) {
        if (input.type === SpecialInputTypes.FOLDER) {
          const { title, settings, schema } = input as Folder
          _pane.addFolder({ title, ...settings })
          return { ...accValues, ...buildPaneAndReturnData(schema, _pane, setValue) }
        }

        if (input.type === SpecialInputTypes.BUTTON) {
          const { title, onClick } = input as Button
          if (typeof onClick !== 'function') throw new Error('Button onClick must be a function.')
          _pane.addButton({ title }).on('click', onClick)
        } else if (input.type === SpecialInputTypes.SEPARATOR) {
          _pane.addSeparator()
        }
        return accValues
      }

      const { value, ...settings } = input as InputConstructor
      _pane.addInput({ [key]: value }, key, settings).on('change', value => setValue(key, value))
      return { ...accValues, [key]: value }
    }

    _pane.addInput({ [key]: input }, key).on('change', value => setValue(key, value))
    return { ...accValues, [key]: input }
  }, {})
}

function init(set: any, title: string | undefined, schema: Schema, settings?: Settings) {
  console.log('init')
  pane = pane || new Tweakpane(settings)
  const _pane = title ? pane.addFolder({ title }) : pane

  // @ts-ignore
  const setValue = (key: string, value: unknown) => set(state => ({ ...state, data: { ...state.data, [key]: value } }))

  set({ pane })
  return buildPaneAndReturnData(schema, _pane, setValue)
}

export const useTweakStore = (title: string | undefined, schema: Schema, settings?: Settings) => {
  const [store] = useState(() =>
    create<StoreType>(set => ({
      data: init(set, title, schema, settings),
      pane: undefined,
      dispose: () => {
        if (pane) pane.dispose()
      },
    }))
  )

  const data = store(state => state.data)

  useEffect(() => {
    return () => store.getState().dispose()
  }, [store])

  return data
}
