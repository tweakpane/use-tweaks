import { useState, useEffect } from 'react'
import Tweakpane from 'tweakpane'

import { getDataAndBuildPane } from './data'
import { Schema, Settings, UseTweaksValues } from './types'

let ROOTPANE: Tweakpane | undefined

export function useTweaks<T extends Schema>(
  nameOrSchema: string | T,
  schemaOrSettings?: T | Settings | undefined,
  settings?: Settings | undefined
): UseTweaksValues<T> {
  const _name = typeof nameOrSchema === 'string' ? nameOrSchema : undefined
  const _schema = typeof nameOrSchema === 'string' ? (schemaOrSettings as T) : nameOrSchema
  const _settings = typeof nameOrSchema === 'string' ? settings : (schemaOrSettings as Settings | undefined)

  const [data, set] = useState(() => getDataAndBuildPane(_schema))

  useEffect(() => {
    ROOTPANE = ROOTPANE || new Tweakpane(_settings)
    const _pane = _name ? ROOTPANE.addFolder({ title: _name }) : ROOTPANE
    const setValue = (key: string, value: unknown) => set(data => ({ ...data, [key]: value }))
    getDataAndBuildPane(_schema, setValue, _pane)

    return () => {
      _pane !== ROOTPANE && _pane.dispose()
    }
  }, [])

  return data as UseTweaksValues<T>
}
