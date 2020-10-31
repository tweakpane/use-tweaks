import { Schema, Folder, SpecialInputTypes, Button, InputConstructor, TweakpaneType } from './types'

export function getDataAndBuildPane(
  schema: Schema,
  setValue?: (key: string, value: unknown) => void,
  rootPane?: TweakpaneType
): { [key: string]: unknown } {
  return Object.entries(schema).reduce((accValues, [key, input]) => {
    if (typeof input === 'object') {
      if ('type' in input) {
        if (input.type === SpecialInputTypes.FOLDER) {
          const { title, settings, schema } = input as Folder
          const folderPane = rootPane ? rootPane.addFolder({ title, ...settings }) : undefined
          return { ...accValues, ...getDataAndBuildPane(schema, setValue, folderPane) }
        }

        if (input.type === SpecialInputTypes.BUTTON) {
          const { title, onClick } = input as Button
          if (typeof onClick !== 'function') throw new Error('Button onClick must be a function.')
          rootPane && rootPane.addButton({ title }).on('click', onClick)
        } else if (input.type === SpecialInputTypes.SEPARATOR) {
          rootPane && rootPane.addSeparator()
        }
        return accValues
      }

      const { value, ...settings } = input as InputConstructor
      rootPane && rootPane.addInput({ [key]: value }, key, settings).on('change', value => setValue!(key, value))

      return { ...accValues, [key]: value }
    }

    rootPane && rootPane.addInput({ [key]: input }, key).on('change', value => setValue!(key, value))

    return { ...accValues, [key]: input }
  }, {})
}
