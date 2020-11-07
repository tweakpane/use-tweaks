import { SpecialInputTypes } from './types'
// @ts-expect-error
import get from 'get-value'
// @ts-expect-error
import set from 'set-value'
import { Schema, Folder, Button, InputConstructor, TweakpaneType, Monitor } from './types'
import { InputParams } from 'tweakpane/dist/types/api/types'
import { InputBindingApi } from 'tweakpane/dist/types/api/input-binding'
import { ButtonApi } from 'tweakpane/dist/types/api/button'
import { SeparatorApi } from 'tweakpane/dist/types/api/separator'
import { noCase } from 'change-case'
import create from 'zustand'

const join = (path: string, subPath: string) => [path, subPath].filter(Boolean).join('.')

function transformSettings(settings: InputParams) {
  if (!('options' in settings)) return settings

  if (Array.isArray(settings.options)) {
    // @ts-expect-error
    settings.options = settings.options.reduce((acc, option) => ({ ...acc, [option]: option }), {})
  }
  return settings
}

type Disposable = TweakpaneType | ButtonApi | SeparatorApi | InputBindingApi<any, any>

export const store = create(() => ({ data: {} }))
const setKey = (key: string, value: any) =>
  store.setState(s => {
    return { data: { ...s.data, [key]: value } }
  })

const DATA = {}
const PANES: Record<string, { pane: Disposable; count: number }> = {}

window.STORE = store
window.DATA = DATA
window.PANES = PANES

// DATA will be in the form of
// DATA = {
//   inputs: { input1: value1, input2: value2, ...},
//   folder1 : {
//     inputs: { input3: value3, ...}
//     folder11 : { ... }
//   },
//   folder 2 : { ... }
//   ...
// }

// this function traverses the schema and sets the initial input values.
// - if the global DATA object already holds a key matching the schema input,
//   then the DATA object key value is used as the initial value.
// - if the global DATA object key is empty, then the DATA object key is
//   initialized with the schema value.
export function initData(schema: Schema, rootPath: string = '', inputPath = join(rootPath, 'inputs')) {
  const data: Record<string, unknown> = Object.entries(schema).reduce((accValues, [key, input]) => {
    // the path to the inputs of object in nested folders
    // we use set and get to access paths such as
    // DATA.global.folder.nestedFolder.inputs
    let INPUTS = get(DATA, inputPath)
    // if INPUTS doesn't exist it means that the folder doesn't exist yet,
    // therefore we need to initialize it first
    if (!INPUTS) {
      INPUTS = {}
      set(DATA, inputPath, INPUTS)
    }

    if (typeof input === 'object') {
      // Handles any tweakpane object that's not an actual Input
      if ('type' in input) {
        // if the input type is a Folder, then we recursively add the folder schema
        if (input.type === SpecialInputTypes.FOLDER) {
          const { title, schema } = input as Folder
          return { ...accValues, ...initData(schema, `${rootPath}.${title}`) }
        }
        return { ...accValues }
      }
      // if the input is an actual value then we get its value from the
      // DATA object, and if it isn't set, we set it to the schema value
      else if ('value' in input) {
        // input is shaped as in input = { value: value, ...settings}
        INPUTS[key] = INPUTS[key] ?? (input as InputConstructor).value
      } else {
        // input is an object but is shaped as in input = { x: 0, y: 0 }
        INPUTS[key] = INPUTS[key] ?? input
      }
      return { ...accValues, [join(inputPath, key)]: INPUTS[key] }
    }
    // same as above, only this time the input is shaped as in { key: value }
    // instead of { key: { value: value } }
    INPUTS[key] = INPUTS[key] ?? input
    return { ...accValues, [join(inputPath, key)]: INPUTS[key] }
  }, {})

  return data
}

// this function acts similarly to the getData function, only
// this time the DATA object should be fully initialized, therefore
// we read its values are used to initialize Tweakpane.
// It also returns an array of top-level panes that will need to be disposed
// when the component is unmounted. Note that we only need top-level panes
// as nested panes will be disposed when their parents are.
export function buildPane(
  schema: Schema,
  rootPane: TweakpaneType,
  rootPath: string = '',
  nestedPanes: string[] = [],
  inputPath = join(rootPath, 'inputs')
) {
  // nestedPanes will hold the top level folder references that
  // will need to be disposed in useTweaks

  // we read the inputs of the nested path
  let INPUTS = get(DATA, inputPath)

  Object.entries(schema).forEach(([key, input]) => {
    if (typeof input === 'object') {
      if ('type' in input) {
        if (input.type === SpecialInputTypes.MONITOR) {
          const { title, ref, settings } = input as Monitor
          const monitorPath = join(inputPath, title)
          const currMonitor = PANES[monitorPath]
          if (currMonitor && currMonitor.count > 0) currMonitor.count++
          else {
            let monitor
            if (typeof ref === 'function') {
              const myObj = { current: ref() }
              const updateFn = () => (myObj.current = ref())

              monitor = rootPane.addMonitor(myObj, 'current', { label: title, ...settings }).on('update', updateFn)
            } else if ('current' in ref) {
              monitor = rootPane.addMonitor(ref, 'current', { label: title, ...settings })
            } else {
              monitor = rootPane.addMonitor(ref, title, settings)
            }
            PANES[monitorPath] = { pane: monitor, count: 1 }
            nestedPanes.unshift(monitorPath)
          }
        } else if (input.type === SpecialInputTypes.FOLDER) {
          // if the input is a Folder, we recursively add the folder structure
          // to Tweakpane
          const { title, settings, schema } = input as Folder
          const folderPath = join(inputPath, title)
          const currFolder = PANES[folderPath]
          if (currFolder && currFolder.count > 0) currFolder.count++
          else {
            const folderPane = rootPane.addFolder({ title, ...settings })
            PANES[folderPath] = { pane: folderPane, count: 1 }
            nestedPanes.unshift(folderPath)
            buildPane(schema, folderPane, `${rootPath}.${title}`, nestedPanes)
          }
        } else if (input.type === SpecialInputTypes.BUTTON) {
          // Input is a Button
          const { title, onClick } = input as Button
          const buttonPath = join(inputPath, title)
          const currButton = PANES[buttonPath]
          if (currButton && currButton.count > 0) currButton.count++
          else {
            if (typeof onClick !== 'function') throw new Error('Button onClick must be a function.')
            const button = rootPane.addButton({ title }).on('click', onClick)
            PANES[buttonPath] = { pane: button, count: 1 }
            nestedPanes.unshift(buttonPath)
          }
        } else if (input.type === SpecialInputTypes.SEPARATOR) {
          // Input is a separator
          //const separator = rootPane.addSeparator()
          //nestedPanes.unshift(separator)
        }
      } else {
        const { value, ...settings } = input as InputConstructor
        const _settings = value !== undefined ? transformSettings(settings) : undefined
        // we add the INPUTS object to Tweakpane and we listen to changes
        // to trigger setValue, which will set the useTweaks hook state.
        const inputPanePath = join(inputPath, _settings?.label || key)
        const currInput = PANES[inputPanePath]
        if (currInput && currInput.count > 0) currInput.count++
        else {
          const pane = rootPane
            .addInput(INPUTS, key, { label: noCase(key), ..._settings })
            .on('change', v => setKey(join(inputPath, key), v))

          PANES[inputPanePath] = { pane, count: 1 }
          nestedPanes.unshift(inputPanePath)
        }
      }
    } else {
      const inputPanePath = join(inputPath, key)
      const currInput = PANES[inputPanePath]
      if (currInput && currInput.count > 0) currInput.count++
      else {
        const pane = rootPane
          .addInput(INPUTS, key, { label: noCase(key) })
          .on('change', v => setKey(join(inputPath, key), v))
        PANES[inputPanePath] = { pane, count: 1 }
        nestedPanes.unshift(inputPanePath)
      }
    }
  }, {})

  return () =>
    nestedPanes.forEach(key => {
      const pane = PANES[key]
      pane.count--
      if (pane.count === 0) pane.pane.dispose()
    })
}
