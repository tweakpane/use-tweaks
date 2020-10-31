import { SpecialInputTypes, Schema, Separator, Folder, Button } from './types'

let separatorCount = 0

export function makeSeparator(): Record<string, Separator> {
  return {
    [`_s_${separatorCount++}`]: { type: SpecialInputTypes.SEPARATOR },
  }
}

export function makeFolder<T extends Schema, P extends string>(title: P, schema: T, expanded = true) {
  return ({
    [`_f_${title}`]: { type: SpecialInputTypes.FOLDER, title, schema, settings: { expanded } },
  } as unknown) as Record<P, Folder<T>>
}

export const makeDirectory = makeFolder

export function makeButton(title: string, onClick: () => void): Record<string, Button> {
  return {
    [`_b_${title}`]: { type: SpecialInputTypes.BUTTON, title, onClick },
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
