import { useState, useLayoutEffect, useRef } from 'react'
import Tweakpane from 'tweakpane'

import { getData, buildPane } from './data'
import { Schema, Settings, UseTweaksValues } from './types'

let ROOTPANE: Tweakpane | undefined

export function useTweaks<T extends Schema>(schema: T, settings?: Settings): UseTweaksValues<T>
export function useTweaks<T extends Schema>(name: string, schema: T, settings?: Settings): UseTweaksValues<T>
export function useTweaks<T extends Schema>(
  nameOrSchema: string | T,
  schemaOrSettings?: T | Settings | undefined,
  settings?: Settings
): UseTweaksValues<T> {
  const _name = typeof nameOrSchema === 'string' ? nameOrSchema : undefined
  const _rootKey = typeof nameOrSchema === 'string' ? 'root.' + nameOrSchema : 'root'
  const _settings = useRef(typeof nameOrSchema === 'string' ? settings : (schemaOrSettings as Settings))
  const _schema = useRef(typeof nameOrSchema === 'string' ? (schemaOrSettings as T) : nameOrSchema)

  const [data, set] = useState(() => getData(_schema.current, _rootKey))

  useLayoutEffect(() => {
    ROOTPANE = ROOTPANE || new Tweakpane({ ..._settings, container: _settings.current?.container?.current! })
    const isRoot = _name === undefined
    const _pane = _name ? ROOTPANE.addFolder({ title: _name }) : ROOTPANE
    const setValue = (key: string, value: unknown) => set((data) => ({ ...data, [key]: value }))
    const disposablePanes = buildPane(_schema.current, _rootKey, setValue, _pane)

    return () => {
      if (!isRoot) _pane.dispose()
      // we only need to dispose the parentFolder
      else disposablePanes.forEach((d) => d.dispose())
    }
  }, [_name, _rootKey])

  return data as UseTweaksValues<T>
}
