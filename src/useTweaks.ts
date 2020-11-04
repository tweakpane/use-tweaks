import { useState, useLayoutEffect, useRef, useEffect } from 'react'
import Tweakpane from 'tweakpane'

import { buildPane, getData } from './data'
import { Schema, Settings, UseTweaksValues } from './types'
import { getInitialDataFromUrl, setUrlFromData } from './utils'

let ROOTPANE: Tweakpane | undefined

export function useTweaks<T extends Schema>(
  nameOrSchema: string | T,
  schemaOrSettings?: T | Settings | undefined,
  settings?: Settings
): UseTweaksValues<T> {
  const _name = typeof nameOrSchema === 'string' ? nameOrSchema : undefined
  const _rootKey = typeof nameOrSchema === 'string' ? 'root.' + nameOrSchema : 'root'
  
  const rawSettings = typeof nameOrSchema === 'string' ? settings : (schemaOrSettings as Settings)
  const { setGetFromUrl, ...remainingSettings } = rawSettings || {}
  const _settings = useRef(remainingSettings)

  const rawSchema = typeof nameOrSchema === 'string' ? (schemaOrSettings as T) : nameOrSchema
  const _schema = useRef(setGetFromUrl ? getInitialDataFromUrl(rawSchema, _rootKey) : rawSchema)
  
  const [data, set] = useState(() => getData(_schema.current, _rootKey))
  
  useEffect(() => void (setGetFromUrl && setUrlFromData(data, _rootKey)), [setGetFromUrl, data, _rootKey])
  
  useLayoutEffect(() => {
    ROOTPANE = ROOTPANE || new Tweakpane({ ..._settings, container: _settings.current?.container?.current! })
    const isRoot = _name === undefined
    const _pane = _name ? ROOTPANE.addFolder({ title: _name }) : ROOTPANE
    const setValue = (key: string, value: unknown) => set(data => ({ ...data, [key]: value }))
    const disposablePanes = buildPane(_schema.current, _rootKey, setValue, _pane)

    return () => {
      if (!isRoot) _pane.dispose()
      // we only need to dispose the parentFolder
      else disposablePanes.forEach(d => d.dispose())
    }
  }, [_name, _rootKey])

  return data as UseTweaksValues<T>
}