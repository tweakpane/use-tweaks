import { uuid } from "./utils";

import { Schema } from "./useTweaks";
import { MonitorParams } from "tweakpane/dist/types/api/types";

export enum SpecialInputTypes {
  SEPARATOR,
  DIRECTORY,
  BUTTON,
  MONITOR,
}

export function makeSeparator(name: string) {
  return {
    [`_${name}`]: {
      type: SpecialInputTypes.SEPARATOR,
    },
  };
}

export function makeFolder(title: string, schema: Schema, expanded = true) {
  return {
    [`_${title}`]: {
      type: SpecialInputTypes.DIRECTORY,
      title,
      schema,
      settings: {
        expanded,
      },
    },
  };
}

export const makeDirectory = makeFolder;

export function makeButton(title: string, onClick: () => void) {
  return {
    [`_${title}`]: {
      type: SpecialInputTypes.BUTTON,
      title,
      onClick,
    },
  };
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
