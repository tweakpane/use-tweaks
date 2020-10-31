import { useState, useEffect, useRef } from 'react'
import Tweakpane from 'tweakpane'

import { getDataAndBuildPane } from './data'
import { Schema, Settings, UseTweaksValues } from './types'

let ROOTPANE: Tweakpane | undefined
// let refCount = 0

export function useTweaks<T extends Schema>(
  nameOrSchema: string | T,
  schemaOrSettings?: T | Settings | undefined,
  settings?: Settings
): UseTweaksValues<T> {
  const _name = typeof nameOrSchema === 'string' ? nameOrSchema : undefined
  const _settings = useRef(typeof nameOrSchema === 'string' ? settings : (schemaOrSettings as Settings))
  const _schema = useRef(typeof nameOrSchema === 'string' ? (schemaOrSettings as T) : nameOrSchema)

  const [data, set] = useState(() => getDataAndBuildPane(_schema.current))

  useEffect(() => {
    ROOTPANE = ROOTPANE || new Tweakpane({ ..._settings, container: _settings.current?.container?.current! })
    const isRoot = _name === undefined
    const _pane = _name ? ROOTPANE.addFolder({ title: _name }) : ROOTPANE
    const setValue = (key: string, value: unknown) => set(data => ({ ...data, [key]: value }))
    getDataAndBuildPane(_schema.current, setValue, _pane)

    return () => {
      console.log('disposing', _pane)
      if (!isRoot) _pane.dispose()
      // @ts-expect-error
      else if (_pane.doc_) {
        _pane.dispose()
        ROOTPANE = undefined
      }
    }
  }, [_name])

  return data as UseTweaksValues<T>
}
