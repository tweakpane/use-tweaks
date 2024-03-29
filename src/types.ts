import { FolderApi, InputParams, MonitorParams, RgbaColorObject, RgbColorObject } from '@tweakpane/core'
import { Pane } from 'tweakpane'
import { PaneConfig } from 'tweakpane/dist/types/pane/pane-config'

export type TweakpaneType = Pane | FolderApi

export enum SpecialInputTypes {
  SEPARATOR,
  FOLDER,
  BUTTON,
  MONITOR,
}

type Point2dObject = { x: number; y: number }
type InputValue = boolean | number | string | Point2dObject | RgbColorObject | RgbaColorObject

export type InputConstructor = InputParams & { value: InputValue }

export interface Schema {
  [name: string]: InputValue | InputConstructor | Folder | Separator
}

export type Settings = Omit<PaneConfig, 'container'> & { container?: React.RefObject<HTMLElement> }

export interface Monitor {
  type: SpecialInputTypes
  title: string
  ref: any | React.Ref<any> | (() => any)
  settings: MonitorParams
}

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

type Join<T, K extends keyof T, P> = '' extends P ? { [i in K]: T[K] } : P

// can probably be optimized ¯\_(ツ)_/¯
type Leaves<T, P extends string | number | symbol = ''> = {
  0: T extends { schema: any } ? Join<T, 'schema', Leaves<T['schema']>> : never
  1: T extends { value: any } ? { [i in P]: T['value'] } : never
  2: never
  3: { [i in P]: T }
  4: { [K in keyof T]: Join<T, K, Leaves<T[K], K>> }[keyof T]
  5: ''
}[T extends Folder
  ? 0
  : T extends InputConstructor
  ? 1
  : T extends Separator | Button
  ? 2
  : T extends object
  ? T extends InputValue
    ? 3
    : 4
  : 5]

/**
 * It does nothing but beautify union type
 *
 * ```
 * type A = { a: 'a' } & { b: 'b' } // { a: 'a' } & { b: 'b' }
 * type B = Id<{ a: 'a' } & { b: 'b' }> // { a: 'a', b: 'b' }
 * ```
 */
type Id<T> = T extends infer TT ? { [k in keyof TT]: TT[k] } : never

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never

export type UseTweaksValues<T> = Id<UnionToIntersection<Leaves<T>>>

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
      color: { r: 255, g: 255, b: 255, a: 1 },
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
