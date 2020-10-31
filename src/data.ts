import { Schema, Folder, SpecialInputTypes, Button, InputConstructor, TweakpaneType } from './types'
import { InputParams } from 'tweakpane/dist/types/api/types';

function transformSettings(settings: InputParams) {

  const _settings = settings;

  // @ts-expect-error 
  if (settings.options && Array.isArray(settings.options)) {
    // @ts-expect-error
    _settings.options = settings.options.reduce((acc: Record<string|number, string|number>, option: string | number) => {
      acc[option] = option
      return acc 
    }, {})
  }
  
  return _settings

}

export function getDataAndBuildPane(
  schema: Schema,
  setValue?: (key: string, value: unknown) => void,
  rootPane?: TweakpaneType
): { [key: string]: unknown } {
  return Object.entries(schema).reduce((accValues, [key, input]) => {
    if (typeof input === 'object') {

      // Handles any tweakpane object that's not an actual Input
      if ('type' in input) {
        if (input.type === SpecialInputTypes.FOLDER) {
          const { title, settings, schema } = input as Folder
          const folderPane = rootPane ? rootPane.addFolder({ title, ...settings }) : undefined
          return { ...accValues, ...getDataAndBuildPane(schema, setValue, folderPane) }
        }

        if (input.type === SpecialInputTypes.BUTTON) {
          const { title, onClick } = input as Button
          if (typeof onClick !== 'function') throw new Error('Button onClick must be a function.')
          rootPane?.addButton({ title }).on('click', onClick)
        } else if (input.type === SpecialInputTypes.SEPARATOR) {
          rootPane?.addSeparator()
        }
        return accValues
      }

      const { value, ...settings } = input as InputConstructor

      let _settings = transformSettings(settings)
      rootPane?.addInput({ [key]: value }, key, _settings).on('change', value => setValue!(key, value))

      return { ...accValues, [key]: value }
    }

    rootPane?.addInput({ [key]: input }, key).on('change', value => setValue!(key, value))

    return { ...accValues, [key]: input }
  }, {})
}
