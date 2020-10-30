import { SpecialInputTypes, Schema, Separator, Folder, Button } from './types'

export function makeSeparator(name: string): { [key: string]: Separator } {
  return {
    [`_${name}`]: { type: SpecialInputTypes.SEPARATOR },
  }
}

export function makeFolder<T extends Schema>(title: string, schema: T, expanded = true): { [key: string]: Folder<T> } {
  return {
    [`_${title}`]: { type: SpecialInputTypes.FOLDER, title, schema, settings: { expanded } },
  }
}

export const makeDirectory = makeFolder

export function makeButton(title: string, onClick: () => void): { [key: string]: Button } {
  return {
    [`_${title}`]: { type: SpecialInputTypes.BUTTON, title, onClick },
  }
}

// export function makeMonitor(key: string, settings: MonitorParams = {}) {
//   return {
//     set: (value: any) => (OBJECT[key] = value),
//     get: () => ({
//       [`_${uuid()}`]: {
//         type: SpecialInputTypes.MONITOR,
//         key,
//         settings,
//       },
//     }),
//   };
// }
