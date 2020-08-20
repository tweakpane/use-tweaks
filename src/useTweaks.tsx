import { useLayoutEffect, useRef } from "react";
import Tweakpane from "tweakpane";
import zustandCreate from "zustand";
import pick from "lodash.pick";

import produce from "immer";

const useStore = zustandCreate((set) => ({
  // @ts-expect-error
  setValue: (fn) => set(produce(fn)),
}));

// @ts-expect-error
function returnInitialData(constructionStuff) {
  return Object.entries(constructionStuff).reduce(
    (acc, [key, inputDefintion]) => {
      let inputVal = null;

      if (typeof inputDefintion === "object") {
        // @ts-expect-error
        inputVal = inputDefintion.value;
      } else {
        inputVal = inputDefintion;
      }

      return { ...acc, [key]: inputVal };
    },
    {}
  );
}

interface InitialValuesObject {
  [name: string]: any;
}

// @ts-expect-error
export default function useTweaks(id: any, constructionStuff) {
  const OBJECT = useRef<InitialValuesObject>({});
  const pane = useRef<Tweakpane>();

  useLayoutEffect(() => {
    if (typeof pane.current === "undefined") {
      pane.current = new Tweakpane({
        title: id,
        container: document.querySelector(`.test .t${id}`),
      });
    }
  }, []);

  const setValue = useStore((state) => state.setValue);

  const keys = useRef([]);
  const constructed = useRef(false);

  useLayoutEffect(() => {
    if (!constructed.current) {
      Object.entries(constructionStuff).forEach(([key, inputDefintion]) => {
        // @ts-expect-error
        let inputVal = null;
        let settings = {};

        if (typeof inputDefintion === "object") {
          // @ts-expect-error
          const { value, ...sett } = inputDefintion;
          inputVal = value;
          settings = sett;
        } else {
          inputVal = inputDefintion;
        }

        OBJECT.current[key] = inputVal;

        // onchange, set value in state
        pane.current
          .addInput(OBJECT.current, key, settings)
          .on("change", (value) => {
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

      constructed.current = true;
    }
  }, [constructionStuff, id, setValue]);

  const valuesFromState = useStore((state) => pick(state[id], keys.current));

  return constructed.current
    ? valuesFromState
    : returnInitialData(constructionStuff);
}
