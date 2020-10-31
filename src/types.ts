import type { InputParams } from 'tweakpane/dist/types/api/types'
import type { TweakpaneConfig } from 'tweakpane/dist/types/tweakpane-config'
import type { FolderApi } from 'tweakpane/dist/types/api/folder'
import type Tweakpane from 'tweakpane'
import type { InputtableOutType } from 'tweakpane/dist/types/controller/binding-creators/input'

export type TweakpaneType = Tweakpane | FolderApi

export enum SpecialInputTypes {
  SEPARATOR,
  FOLDER,
  BUTTON,
  MONITOR,
}

export type InputConstructor = InputParams & { value: InputtableOutType }

export interface Schema {
  [name: string]: InputtableOutType | InputConstructor | Folder | Separator
}

export type Settings = Omit<TweakpaneConfig, 'container'> & { container?: React.RefObject<HTMLElement> } 

export interface Folder<T extends Schema = Schema> {
  type: SpecialInputTypes
  title: string
  schema: T
  settings: { expanded: boolean }
}

export interface Separator {
  type: SpecialInputTypes
}

export interface Button {
  type: SpecialInputTypes
  title: string
  onClick: () => void
}

type Prev = [never, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, ...0[]]

type Join<T, K extends keyof T, P> = '' extends P ? { [i in K]: T[K] } : P

// can probably be optimized ¯\_(ツ)_/¯
// @ts-ignore
type Leaves<T, D extends number = 10, P extends string | number | symbol = ''> = [D] extends [never]
  ? never
  : T extends Folder // @ts-ignore
  ? Join<T, 'schema', Leaves<T['schema'], Prev[D]>>
  : T extends InputConstructor
  ? { [i in P]: T['value'] }
  : T extends Separator | Button
  ? never
  : T extends object 
  ? T extends InputtableOutType
  ? { [i in P]: T }
  // @ts-ignore
  : { [K in keyof T]: Join<T, K, Leaves<T[K], Prev[D], K>> }[keyof T]
  : ''

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

// @ts-ignore
export type UseTweaksValues<T> = UnionToIntersection<Leaves<T>>


/*
function useTweaks<T>(schema: T): UseTweaksValues<T> {
  // @ts-ignore
  return schema
}
const b = useTweaks({
  b: 3,
  _2323: { type: SpecialInputTypes.SEPARATOR },
  h: { value: 32, min: 0 },
  _31: {
    type: SpecialInputTypes.FOLDER,
    title: 'folder2',
    schema: {
      d: 'al',
      f: 3,
      position: { value: { x: 0, y: 0 }, min: { x: -1, y: -1 }, max: { x: 1, y: 1 } },
      color: { r: 255,g:255,b:255,a:1 },
      offset: { x: 50, y: 25 },
      _33: {
        type: SpecialInputTypes.FOLDER,
        title: 'folder',
        schema: { c: { value: 'al' }, k: 4 },
        settings: { expanded: false },
      },
    },
    settings: { expanded: false },
  },
})
*/

