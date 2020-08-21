import { uuid } from "./utils";

import { Schema, OBJECT } from "./useTweaks";
import { MonitorParams } from "tweakpane/dist/types/api/types";

export enum SpecialInputTypes {
  SEPARATOR,
  DIRECTORY,
  BUTTON,
  MONITOR,
}

export function makeSeparator() {
  return {
    [`_${uuid()}`]: {
      type: SpecialInputTypes.SEPARATOR,
    },
  };
}

export function makeDirectory(title: string, schema: Schema, settings = {}) {
  return {
    [`_${uuid()}`]: {
      type: SpecialInputTypes.DIRECTORY,
      title,
      schema,
      settings,
    },
  };
}

export function makeButton(title: string, onClick: () => void) {
  return {
    [`_${uuid()}`]: {
      type: SpecialInputTypes.BUTTON,
      title,
      onClick,
    },
  };
}

export function makeMonitor(key: string, settings: MonitorParams = {}) {
  return {
    set: (value: any) => (OBJECT[key] = value),
    get: () => ({
      [`_${uuid()}`]: {
        type: SpecialInputTypes.MONITOR,
        key,
        settings,
      },
    }),
  };
}
