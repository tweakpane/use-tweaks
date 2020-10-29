import produce from "immer";
import create from "zustand";
import Tweakpane from "tweakpane";

import { SpecialInputTypes } from "./helpers";

// The object that Tweakpane will mutate
export const OBJECT = {};

export function getInitialValues(schema: Schema): InitialValuesObject {
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
    OBJECT[key] = OBJECT[key] || inputVal;

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

export const useStore = create((set, get) => ({
  // @ts-expect-error
  setValue: (fn) => set(produce(fn)),
  pane: null,
  init: (id, nameOrSchema, schema, settings) => {
    const _name = typeof nameOrSchema === "string" && nameOrSchema;
    const _schema = typeof nameOrSchema === "string" ? schema : nameOrSchema;

    const pane = get().pane || new Tweakpane(settings);

    if (_name) {
      const paneFolder = pane.addFolder({ title: _name });
      constructObjectAndState(id, OBJECT, paneFolder, _schema);
    } else {
      constructObjectAndState(id, OBJECT, pane, _schema);
    }

    set({ pane });
  },
  dispose: () => {
    console.log("dispose", JSON.parse(JSON.stringify(OBJECT, null, "  ")));
    const { pane } = get();
    if (pane) {
      pane.dispose();
      set({ pane: null });
    }
  },
}));

// @ts-expect-error
export const setValue = (id: string, key: string, value: any) =>
  useStore.getState().setValue((state) => {
    if (typeof state[id] === "undefined") {
      state[id] = {};
    }

    state[id][key] = value;
  });

// useStore.subscribe(console.log)
