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
    // if (!_name) refCount++
    const _pane = _name ? ROOTPANE.addFolder({ title: _name }) : ROOTPANE
    // console.log('init', { _name, _schema, refCount, _pane }, ROOTPANE)
    const setValue = (key: string, value: unknown) => set(data => ({ ...data, [key]: value }))
    getDataAndBuildPane(_schema.current, setValue, _pane)

    return () => {
      // @ts-expect-error
      if (!_pane.doc_) return
      _pane.dispose()
      if (_pane === ROOTPANE) ROOTPANE = undefined
    }
  }, [_name])

  return data as UseTweaksValues<T>
}
