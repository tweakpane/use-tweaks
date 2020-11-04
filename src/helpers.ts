import { SpecialInputTypes, Schema, Separator, Folder, Button, Settings, Monitor } from './types';

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

export function makeMonitor<T>(title: string, ref: React.Ref<T> | (() => T) | T, settings: Settings): Record<string, Monitor> {
  return {
    [`_m_${title}`]: {
      type: SpecialInputTypes.MONITOR,
      title,
      ref,
      settings
    }
  }
}
