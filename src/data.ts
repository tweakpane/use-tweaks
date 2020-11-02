import { SpecialInputTypes } from './types'
// @ts-expect-error
import get from 'get-value'
// @ts-expect-error
import set from 'set-value'
import { Schema, Folder, Button, InputConstructor, TweakpaneType } from './types'
import { InputParams } from 'tweakpane/dist/types/api/types'
import { InputBindingApi } from 'tweakpane/dist/types/api/input-binding'
import { ButtonApi } from 'tweakpane/dist/types/api/button'
import { SeparatorApi } from 'tweakpane/dist/types/api/separator'

function transformSettings(settings: InputParams) {
  if (!('options' in settings)) return settings

  if (Array.isArray(settings.options)) {
    // @ts-expect-error
    settings.options = settings.options.reduce((acc, option) => ({ ...acc, [option]: option }), {})
  }
  return settings
}

type Disposable = TweakpaneType | ButtonApi | SeparatorApi | InputBindingApi<any, any>

const DATA: any = {
  global: {
    inputs: {},
  },
}

function getDataOrBuildPane(
  schema: Schema,
  rootPath: string = 'global',
  setValue?: (key: string, value: unknown) => void,
  rootPane?: TweakpaneType
) {
  const nestedPanes: Disposable[] = []
  const data: Record<string, unknown> = Object.entries(schema).reduce((accValues, [key, input]) => {
    let INPUTS = get(DATA, `${rootPath}.inputs`)
    if (!INPUTS) {
      INPUTS = {}
      set(DATA, `${rootPath}.inputs`, INPUTS)
    }

    if (typeof input === 'object') {
      // Handles any tweakpane object that's not an actual Input
      if ('type' in input) {
        if (input.type === SpecialInputTypes.FOLDER) {
          const { title, settings, schema } = input as Folder
          const folderPane = rootPane ? rootPane.addFolder({ title, ...settings }) : undefined
          nestedPanes.push(folderPane!)
          return { ...accValues, ...getDataOrBuildPane(schema, `${rootPath}.${title}`, setValue, folderPane) }
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
      INPUTS[key] = INPUTS[key] ?? value
      if (rootPane) {
        const pane = rootPane.addInput(INPUTS, key, _settings).on('change', value => setValue!(key, value))
        nestedPanes.push(pane)
      }
      return { ...accValues, [key]: INPUTS[key] }
    }
    INPUTS[key] = INPUTS[key] ?? input
    if (rootPane) {
      const pane = rootPane?.addInput(INPUTS, key).on('change', value => setValue!(key, value))
      nestedPanes.push(pane)
    }
    return { ...accValues, [key]: INPUTS[key] }
  }, {})

  return !!rootPane ? nestedPanes : data
}

export const getData = (schema: Schema, rootPath: string = 'global') =>
  getDataOrBuildPane(schema, rootPath) as Record<string, unknown>
export const buildPane = (
  schema: Schema,
  rootPath: string = 'global',
  setValue: (key: string, value: unknown) => void,
  rootPane: TweakpaneType
) => getDataOrBuildPane(schema, rootPath, setValue, rootPane) as Disposable[]
