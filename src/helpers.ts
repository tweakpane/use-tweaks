import { uuid } from "./utils";

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

export function makeDirectory(title: string, schema: Schema) {
  return {
    [`_${uuid()}`]: {
      type: SpecialInputTypes.DIRECTORY,
      title,
      schema,
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
