import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import Tweakpane from "tweakpane";
import type { InputParams as TweakpaneInputParams } from "tweakpane/dist/types/api/types";
import shallow from "zustand/shallow";

import { useStore, setValue } from "./store";
import { uuid } from "./utils";
import { SpecialInputTypes } from "./helpers";
import { Folder } from "tweakpane/dist/types/model/folder";

type InputConstructor = (TweakpaneInputParams & { value: any }) | any;

export interface Schema {
  [name: string]: InputConstructor;
}

interface InitialValuesObject {
  [name: string]: any;
}

// The object that Tweakpane will mutate
export const OBJECT = {};

// Will hold a reference to the Tweakpane instance
let pane: Tweakpane;

function getInitialValues(schema: Schema): InitialValuesObject {
  return Object.entries(schema).reduce((values, [key, inputDefinition]) => {
    let inputVal = null;

    if (typeof inputDefinition === "object") {
      const { value, min, type } = inputDefinition;

      // if directory, get values from all inputs
      if (type === SpecialInputTypes.DIRECTORY) {
        return { ...values, ...getInitialValues(inputDefinition.schema) };
      } else {
        if (!(type in SpecialInputTypes)) {
          inputVal = value || min;
        }
      }
    } else {
      inputVal = inputDefinition;
    }

    return { ...values, [key]: inputVal };
  }, {});
}

function constructObjectAndState(id, OBJECT, pane: Tweakpane & Folder, schema) {
  Object.entries(schema).forEach(([key, input]) => {
    // @ts-expect-error
    let inputVal = null;
    let settings = {};

    if (typeof input === "object") {
      const { type } = input;

      if (type === SpecialInputTypes.MONITOR) {
        const { key, settings } = input;

        OBJECT[key] = 0;
        pane.addMonitor(OBJECT, key, settings);

        return;
      }

      if (type === SpecialInputTypes.BUTTON) {
        const { title, onClick } = input;

        if (typeof onClick !== "function")
          throw new Error("Button onClick must be a function.");
        pane.addButton({ title }).on("click", onClick);

        return;
      }

      if (type === SpecialInputTypes.SEPARATOR) {
        pane.addSeparator();

        return;
      }

      if (type === SpecialInputTypes.DIRECTORY) {
        const { title, schema, settings } = input;

        const folder = pane.addFolder({ title, ...settings });

        constructObjectAndState(id, OBJECT, folder, schema);

        return;
      }

      const { value, ...sett } = input;
      inputVal = value || sett.min;

      settings = sett;
    } else {
      inputVal = input;
    }

    // assign initial value
    OBJECT[key] = inputVal;

    // set init values
    // @ts-expect-error
    setValue(id, key, inputVal);

    // onchange, set value in state
    pane.addInput(OBJECT, key, settings).on("change", (value) => {
      // @ts-expect-error
      setValue(id, key, value);
    });
  });
}

type Settings = {};

export function useTweaks(
  nameOrSchema: string | Schema,
  schema?: Schema | Settings | undefined,
  settings?: Schema | undefined
) {
  const _name = typeof nameOrSchema === "string" && nameOrSchema;
  const _schema = typeof nameOrSchema === "string" ? schema : nameOrSchema;

  const [id] = useState(uuid());
  const constructed = useRef(false);

  useLayoutEffect(() => {
    // initialize a new pane whene non is defined
    if (typeof pane === "undefined") {
      pane = new Tweakpane(settings);
    }
  }, []);

  useEffect(() => {
    if (!constructed.current) {
      if (_name) {
        const paneFolder = pane.addFolder({ title: _name });

        constructObjectAndState(id, OBJECT, paneFolder, _schema);
      } else {
        constructObjectAndState(id, OBJECT, pane, _schema);
      }

      constructed.current = true;
    }
  }, [_name, _schema, id]);

  // Only update when values concering this particular instance are changed
  const valuesFromState = useStore(
    useCallback((state) => state[id], [id]),
    shallow
  );

  return constructed.current ? valuesFromState : getInitialValues(_schema);
}

export function useTweaksInDev(
  nameOrSchema: string | Schema,
  schema?: Schema | Settings | undefined,
  settings?: Schema | undefined
) {
  const _schema = typeof nameOrSchema === "string" ? schema : nameOrSchema;

  if (process.env.NODE_ENV !== "development") {
    return getInitialValues(_schema);
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useTweaks(nameOrSchema, schema, settings);
}
