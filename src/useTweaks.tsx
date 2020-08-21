import { useState, useEffect, useLayoutEffect, useRef } from "react";
import Tweakpane from "tweakpane";
import type {
  InputParams as TweakpaneInputParams,
  // @ts-ignore individual params not exported????
  BooleanInputParams,
} from "tweakpane/dist/types/api/types";
import zustandCreate from "zustand";
import shallow from "zustand/shallow";
import pick from "lodash.pick";

import produce from "immer";

const useStore = zustandCreate((set) => ({
  // @ts-expect-error
  setValue: (fn) => set(produce(fn)),
}));

const setValue = useStore.getState().setValue;

type InputConstructor = TweakpaneInputParams & { value: any };

interface Schema {
  [name: string]: InputConstructor | any;
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

function returnInitialData(schema: Schema): InitialValuesObject {
  function getInitialData(schema: Schema) {
    return Object.entries(schema).reduce((values, [key, inputDefinition]) => {
      let inputVal = null;

      if (typeof inputDefinition === "object") {
        inputVal = inputDefinition.value;

        if (inputDefinition.type === "_DIRECTORY") {
          return { ...values, ...getInitialData(inputDefinition.inputs) };
        }
      } else {
        inputVal = inputDefinition;
      }

      return { ...values, [key]: inputVal };
    }, {});
  }

  return getInitialData(schema);
}

// creates DOM node in body for the panes
function createContainer(): HTMLElement {
  const node = document.createElement("div");
  node.id = "tweaks-container";
  document.querySelector("body")?.append(node);

  return node;
}

const OBJECT = {};
let pane;

function uuid(): string {
  return `${Math.floor((new Date().getTime() * Math.random()) / 1000)}`;
}

function constructObjectAndState(OBJECT, pane, stuff, keys) {
  Object.entries(stuff).forEach(([key, inputDefinition]) => {
    // @ts-expect-error
    let inputVal = null;
    let settings = {};

    if (typeof inputDefinition === "object") {
      if (inputDefinition.type === "_SEPARATOR") {
        pane.addSeparator();

        return;
      }

      if (inputDefinition.type === "_DIRECTORY") {
        const folder = pane.addFolder({ title: inputDefinition.title });

        constructObjectAndState(OBJECT, folder, inputDefinition.inputs);

        return;
      }

      const { value, ...sett } = inputDefinition;
      inputVal = value;
      settings = sett;
    } else {
      inputVal = inputDefinition;
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

    keys.current.push(key);
    // set init value
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

  useLayoutEffect(() => {
    if (typeof pane === "undefined") {
      // look for a container, create one if it can't be found
      let container = document.querySelector("#tweaks-container");

      if (!container) {
        container = createContainer();
      }

      pane = new Tweakpane({
        container,
      });
    }
  }, []);

  const keys = useRef<string[]>([]);
  const constructed = useRef(false);

  useEffect(() => {
    if (!constructed.current) {
      constructObjectAndState(OBJECT, pane, schema);

      constructed.current = true;
    }
  }, [schema, id, setValue, constructObjectAndState]);

  // Only update when values concering this particular instance are changed
  const valuesFromState = useStore(
    (state) => pick(state[id], keys.current),
    shallow
  );

  return constructed.current ? valuesFromState : returnInitialData(schema);
}

export function makeSeparator() {
  return {
    [uuid()]: { type: "_SEPARATOR" },
  };
}

export function makeDirectory(title, inputs) {
  return {
    [uuid()]: {
      type: "_DIRECTORY",
      title,
      inputs,
    },
  };
}
