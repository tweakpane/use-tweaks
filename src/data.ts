import {SpecialInputTypes} from './types'
import type { Schema, Folder, Button, InputConstructor, TweakpaneType } from './types'
import type { InputParams } from 'tweakpane/dist/types/api/types'
import type { InputBindingApi } from 'tweakpane/dist/types/api/input-binding'
import type { ButtonApi } from 'tweakpane/dist/types/api/button'
import type { SeparatorApi } from 'tweakpane/dist/types/api/separator'

function transformSettings(settings: InputParams) {
  if (!('options' in settings)) return settings

  if (Array.isArray(settings.options)) {
    // @ts-expect-error
    settings.options = settings.options.reduce((acc, option) => ({ ...acc, [option]: option }), {})
  }
  return settings
}

type Disposable = TweakpaneType | ButtonApi | SeparatorApi | InputBindingApi<any, any>

function getDataOrBuildPane(
  schema: Schema,
  setValue?: (key: string, value: unknown) => void,
  rootPane?: TweakpaneType
) {
  const nestedPanes: Disposable[] = []

  const data: Record<string, unknown> = Object.entries(schema).reduce((accValues, [key, input]) => {
    if (typeof input === 'object') {
      // Handles any tweakpane object that's not an actual Input
      if ('type' in input) {
        if (input.type === SpecialInputTypes.FOLDER) {
          const { title, settings, schema } = input as Folder
          const folderPane = rootPane ? rootPane.addFolder({ title, ...settings }) : undefined
          nestedPanes.push(folderPane!)
          return { ...accValues, ...getDataOrBuildPane(schema, setValue, folderPane) }
        }

        if (input.type === SpecialInputTypes.BUTTON) {
          const { title, onClick } = input as Button
          if (typeof onClick !== 'function') throw new Error('Button onClick must be a function.')
          const button = rootPane?.addButton({ title }).on('click', onClick)
          nestedPanes.push(button!)
        } else if (input.type === SpecialInputTypes.SEPARATOR) {
          const separator = rootPane?.addSeparator()
          nestedPanes.push(separator!)
        }
        return accValues
      }

      const { value, ...settings } = input as InputConstructor

      let _settings = transformSettings(settings)
      const pane = rootPane?.addInput({ [key]: value }, key, _settings).on('change', value => setValue!(key, value))
      nestedPanes.push(pane!)
      return { ...accValues, [key]: value }
    }

    const pane = rootPane?.addInput({ [key]: input }, key).on('change', value => setValue!(key, value))
    nestedPanes.push(pane!)
    return { ...accValues, [key]: input }
  }, {})

  return !!rootPane ? nestedPanes : data
}

export const getData = (schema: Schema) => getDataOrBuildPane(schema) as Record<string, unknown>
export const buildPane = (schema: Schema, setValue: (key: string, value: unknown) => void, rootPane: TweakpaneType) =>
  getDataOrBuildPane(schema, setValue, rootPane) as Disposable[]
