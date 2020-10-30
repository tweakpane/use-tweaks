import { useTweakStore } from './store'

import { Schema, Settings, UseTweaksValues } from './types'

export function useTweaks<T extends Schema>(
  nameOrSchema: string | T,
  schemaOrSettings?: T | Settings | undefined,
  settings?: Settings | undefined
): UseTweaksValues<T> {
  const _name = typeof nameOrSchema === 'string' ? nameOrSchema : undefined
  const _schema = typeof nameOrSchema === 'string' ? (schemaOrSettings as T) : nameOrSchema
  const _settings = typeof nameOrSchema === 'string' ? settings : (schemaOrSettings as Settings | undefined)

  const data = useTweakStore(_name, _schema, _settings)

  return data as UseTweaksValues<T>
}
