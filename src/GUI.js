import Tweakpane from "tweakpane";
import create from "zustand";
import { useEffect, useLayoutEffect, useCallback } from "react";
import pick from "lodash.pick";
import memoize from "fast-memoize";
import shallow from "zustand/shallow";

// Array pick, re-renders the component when either state.nuts or state.honey change

// this is the object that will be mutated by Tweakpane
const OBJECT = {};

const pane = new Tweakpane();

const useStore = create((set) => ({
  setValue: (key, value) => set(() => ({ [key]: value }))
}));

// this could be used to mount the child three only when the GUI is ready
export function GUIRoot({ children }) {
  return children;
}

export function useGUI(...keys) {
  return useStore((state) => Object.values(pick(state, keys)), shallow);
}

export function Input({
  name,
  options,
  value = 0,
  transform = (n) => n,
  ...settings
}) {
  const setValue = useStore((state) => state.setValue);

  // set initial values in the OBJECT and state
  useLayoutEffect(() => {
    if (typeof OBJECT[name] === "undefined") {
      // options are saved by option name instead of value in tweakpane
      if (typeof options !== "undefined") {
        const defValue = options[value] || options[Object.keys(options)[0]];
        OBJECT[name] = defValue;
        setValue(name, defValue);
      } else {
        OBJECT[name] = value;
        setValue(name, value);
      }
    }
  }, [name, value, settings, options, setValue]);

  // add the actual input to the pane
  useEffect(() => {
    pane
      .addInput(OBJECT, name, { options, value, ...settings })
      .on("change", (value) => {
        const transformedValue = transform(value);
        // set the value in the zustand store when it changes
        setValue(name, transformedValue);
        return transformedValue;
      });

    return () => {
      // there's no remove lol
    };
  }, [name, value, settings, options, transform, setValue]);

  return null;
}
