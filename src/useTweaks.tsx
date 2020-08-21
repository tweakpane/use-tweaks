import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";
import Tweakpane from "tweakpane";
import type {
  InputParams as TweakpaneInputParams,
  // @ts-ignore individual params not exported????
  BooleanInputParams,
} from "tweakpane/dist/types/api/types";
import shallow from "zustand/shallow";

import { useStore, setValue } from "./store";
import { uuid, ensureContainer } from "./utils";
import { SpecialInputTypes } from "./helpers";

type InputConstructor = (TweakpaneInputParams & { value: any }) | any;

interface Schema {
  [name: string]: InputConstructor;
}

interface InitialValuesObject {
  [name: string]: any;
}

// will be nested conditional for each inut type
type ReturnedInputState<
  InputType extends TweakpaneInputParams
> = InputType extends BooleanInputParams ? boolean : any;

// This should be a mapped type?
interface ReturnedStateObject<T> {
  [name: string]: ReturnedInputState<T>;
}

// The object that Tweakpane will mutate
const OBJECT = {};

// Will hold a reference to the Tweakpane instance
let pane;

function getInitialValues(schema: Schema): InitialValuesObject {
  return Object.entries(schema).reduce((values, [key, inputDefinition]) => {
    let inputVal = null;

    if (typeof inputDefinition === "object") {
      const { value, type } = inputDefinition;

      // if directory, get values from all inputs
      if (type === SpecialInputTypes.DIRECTORY) {
        return { ...values, ...getInitialValues(inputDefinition.schema) };
      } else {
        if (!(type in SpecialInputTypes)) {
          inputVal = value;
        }
      }
    } else {
      inputVal = inputDefinition;
    }

    return { ...values, [key]: inputVal };
  }, {});
}

function constructObjectAndState(id, OBJECT, pane, schema) {
  Object.entries(schema).forEach(([key, input]) => {
    // @ts-expect-error
    let inputVal = null;
    let settings = {};

    if (typeof input === "object") {
      const { type } = input;

      if (type === SpecialInputTypes.BUTTON) {
        const { title, onClick } = input;
        pane.addButton({ title }).on("click", onClick);

        return;
      }

      if (type === SpecialInputTypes.SEPARATOR) {
        pane.addSeparator();

        return;
      }

      if (type === SpecialInputTypes.DIRECTORY) {
        const { title, schema } = input;

        const folder = pane.addFolder({ title });

        constructObjectAndState(id, OBJECT, folder, schema);

        return;
      }

      const { value, ...sett } = input;
      inputVal = value;
      settings = sett;
    } else {
      inputVal = input;
    }

    // assign initial value
    OBJECT[key] = inputVal;

    // onchange, set value in state
    pane.addInput(OBJECT, key, settings).on("change", (value) => {
      // @ts-expect-error
      setValue((state) => {
        if (typeof state[id] === "undefined") {
          state[id] = {};
        }

        state[id][key] = value;
      });
    });

    // set init values
    // @ts-expect-error
    setValue((state) => {
      if (typeof state[id] === "undefined") {
        state[id] = {};
      }

      // @ts-expect-error
      state[id][key] = inputVal;
    });
  });
}

export function useTweaks(schema: Schema) {
  const [id] = useState(uuid());
  const constructed = useRef(false);

  useLayoutEffect(() => {
    // initialize a new pane whene non is defined
    if (typeof pane === "undefined") {
      const container = ensureContainer("tweaks-container");
      pane = new Tweakpane({ container });
    }
  }, []);

  useEffect(() => {
    if (!constructed.current) {
      constructObjectAndState(id, OBJECT, pane, schema);
      constructed.current = true;
    }
  }, [schema, id]);

  // Only update when values concering this particular instance are changed
  const valuesFromState = useStore(
    useCallback((state) => state[id], [id]),
    shallow
  );

  return constructed.current ? valuesFromState : getInitialValues(schema);
}
