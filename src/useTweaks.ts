import { useMemo, useEffect, useRef } from 'react'
import shallow from 'zustand/shallow'
import Tweakpane from 'tweakpane'

import { store, initData, buildPane } from './data'
import { Schema, Settings, UseTweaksValues } from './types'
import { makeFolder } from './helpers'

let ROOTPANE: Tweakpane | undefined

function pick<T extends object>(object: T, keys: (keyof T)[]) {
  return keys.reduce((obj, key) => {
    if (object && object.hasOwnProperty(key)) {
      obj[key] = object[key]
    }
    return obj
  }, {} as Record<keyof T, unknown>)
}

export function useTweaks<T extends Schema>(schema: T, settings?: Settings): UseTweaksValues<T>
export function useTweaks<T extends Schema>(name: string, schema: T, settings?: Settings): UseTweaksValues<T>
export function useTweaks<T extends Schema>(
  nameOrSchema: string | T,
  schemaOrSettings?: T | Settings | undefined,
  settings?: Settings
): UseTweaksValues<T> {
  const _schema = useRef(
    typeof nameOrSchema === 'string' ? makeFolder(nameOrSchema, schemaOrSettings as T) : nameOrSchema
  )
  const _settings = useRef(typeof nameOrSchema === 'string' ? settings : (schemaOrSettings as Settings))

  const data = useMemo(() => {
    const data = initData(_schema.current)
    store.setState(s => ({ data: { ...s.data, ...data } }))
    return data
  }, [])

  useEffect(() => {
    ROOTPANE = ROOTPANE || new Tweakpane({ ..._settings, container: _settings.current?.container?.current! })
    const disposeFn = buildPane(_schema.current, ROOTPANE)

    return disposeFn
  }, [])

  // @ts-ignore
  return store(
    s =>
      // @ts-ignore
      Object.entries(pick(s.data, Object.keys(data))).reduce(
        // @ts-ignore
        (acc, [k, v]) => ({ ...acc, [k.split('.').pop()]: v }),
        {}
      ),
    shallow
  )
}
