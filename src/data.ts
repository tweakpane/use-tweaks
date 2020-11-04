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
import { raf } from 'rafz'

function transformSettings(settings: InputParams) {
  if (!('options' in settings)) return settings

  if (Array.isArray(settings.options)) {
    // @ts-expect-error
    settings.options = settings.options.reduce((acc, option) => ({ ...acc, [option]: option }), {})
  }
  return settings
}

type Disposable = TweakpaneType | ButtonApi | SeparatorApi | InputBindingApi<any, any>

// DATA will be in the form of
// DATA = {
//   root : {
//     inputs: { input1: value1, input2: value2, ...},
//     folder1 : {
//       inputs: { input3: value3, ...}
//       folder11 : { ... }
//     },
//     folder 2 : { ... }
//     ...
//   }
// }
const DATA: any = { root: {} }

// this function traverses the schema and sets the initial input values.
// - if the global DATA object already holds a key matching the schema input,
//   then the DATA object key value is used as the initial value.
// - if the global DATA object key is empty, then the DATA object key is
//   initialized with the schema value.
export function getData(schema: Schema, rootPath: string) {
  const data: Record<string, unknown> = Object.entries(schema).reduce((accValues, [key, input]) => {
    // the path to the inputs of object in nested folders
    // we use set and get to access paths such as
    // DATA.global.folder.nestedFolder.inputs
    let INPUTS = get(DATA, `${rootPath}.inputs`)
    // if INPUTS doesn't exist it means that the folder doesn't exist yet,
    // therefore we need to initialize it first
    if (!INPUTS) {
      INPUTS = {}
      set(DATA, `${rootPath}.inputs`, INPUTS)
    }

    if (typeof input === 'object') {
      // Handles any tweakpane object that's not an actual Input
      if ('type' in input) {
        // if the input type is a Folder, then we recursively add the folder schema
        if (input.type === SpecialInputTypes.FOLDER) {
          const { title, schema } = input as Folder
          return { ...accValues, ...getData(schema, `${rootPath}.${title}`) }
        }
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
      return { ...accValues, [key]: INPUTS[key] }
    }
    // same as above, only this time the input is shaped as in { key: value }
    // instead of { key: { value: value } }
    INPUTS[key] = INPUTS[key] ?? input
    return { ...accValues, [key]: INPUTS[key] }
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
  rootPath: string,
  setValue: (key: string, value: unknown) => void,
  rootPane: TweakpaneType
) {
  // nestedPanes will hold the top level folder references that
  // will need to be disposed in useTweaks
  const nestedPanes: Disposable[] = []
  const rafs: any[] =[]

  // we read the inputs of the nested path
  let INPUTS = get(DATA, `${rootPath}.inputs`)

  Object.entries(schema).forEach(([key, input]) => {
    if (typeof input === 'object') {
      if ('type' in input) {
        if (input.type === SpecialInputTypes.MONITOR) {
          
          const { title, ref, settings } = input as Monitor

          if (typeof ref === 'function') {
            const myObj: Record<string, number> = { [title]: ref()}
            const updateFn = () => {
              myObj[title] = ref()
              return true
            }
            
            // raf(updateFn)
            // rafs.push(updateFn)
            
            const monitor = rootPane.addMonitor(myObj, title, {
              label: title,
              ...settings
            }).on('update', () => {
              console.log('on update')
              updateFn()
            })
            nestedPanes.push(monitor)

          }
          else if ('current' in ref) {
            const monitor = rootPane.addMonitor(ref, 'current', {
              label: title,
              ...settings
            })
            nestedPanes.push(monitor)
          }
          else {
            const monitor = rootPane.addMonitor(ref, 'title', {
              ...settings
            })
            nestedPanes.push(monitor)
          }
          
        } else if (input.type === SpecialInputTypes.FOLDER) {
          
          // if the input is a Folder, we recursively add the folder structure
          // to Tweakpane
          const { title, settings, schema } = input as Folder
          const folderPane = rootPane.addFolder({ title, ...settings })
          nestedPanes.push(folderPane)
          buildPane(schema, `${rootPath}.${title}`, setValue, folderPane)
          
        } else if (input.type === SpecialInputTypes.BUTTON) {
          
          // Input is a Button
          const { title, onClick } = input as Button
          if (typeof onClick !== 'function') throw new Error('Button onClick must be a function.')
          const button = rootPane.addButton({ title }).on('click', onClick)
          nestedPanes.push(button)
          
        } else if (input.type === SpecialInputTypes.SEPARATOR) {
          
          // Input is a separator
          const separator = rootPane.addSeparator()
          nestedPanes.push(separator)
          
        }
      } else {
        
        const { value, ...settings } = input as InputConstructor
        const _settings = value !== undefined ? transformSettings(settings) : undefined
        // we add the INPUTS object to Tweakpane and we listen to changes
        // to trigger setValue, which will set the useTweaks hook state.
        const pane = rootPane.addInput(INPUTS, key, _settings).on('change', v => setValue!(key, v))
        nestedPanes.push(pane)
        
      }
    } else {
      
      const pane = rootPane.addInput(INPUTS, key).on('change', v => setValue!(key, v))
      nestedPanes.push(pane)

    }
  }, {})

  return [nestedPanes, rafs]
}
