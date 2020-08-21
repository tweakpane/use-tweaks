import { createRef, useEffect, useLayoutEffect, useRef } from "react";
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

type InputConstructor = TweakpaneInputParams & { value: any };

interface ConstructionStuff {
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

function returnInitialData(
  constructionStuff: ConstructionStuff
): InitialValuesObject {
  return Object.entries(constructionStuff).reduce(
    (acc, [key, inputDefintion]) => {
      let inputVal = null;

      if (typeof inputDefintion === "object") {
        inputVal = inputDefintion.value;
      } else {
        inputVal = inputDefintion;
      }

      return { ...acc, [key]: inputVal };
    },
    {}
  );
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

export function useTweaks(
  id: string /* `id` should maybe be called `title?`, id makes it seem like it could be anything */,
  constructionStuff: ConstructionStuff
) {
  useLayoutEffect(() => {
    if (typeof pane === "undefined") {
      // look for a container, create one if it can't be found
      let container = document.querySelector("#tweaks-container");

      if (!container) {
        container = createContainer();
      }

      pane = new Tweakpane({
        title: id,
        container,
      });
    }
  }, [id]);

  const setValue = useStore((state) => state.setValue);

  const keys = useRef([]);
  const constructed = useRef(false);

  useEffect(() => {
    if (!constructed.current) {
      Object.entries(constructionStuff).forEach(([key, inputDefintion]) => {
        // @ts-expect-error
        let inputVal = null;
        let settings = {};

        if (typeof inputDefintion === "object") {
          const { value, ...sett } = inputDefintion;
          inputVal = value;
          settings = sett;
        } else {
          inputVal = inputDefintion;
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

      constructed.current = true;
    }
  }, [constructionStuff, id, setValue]);

  const valuesFromState = useStore(
    (state) => pick(state[id], keys.current),
    shallow
  );

  return constructed.current
    ? valuesFromState
    : returnInitialData(constructionStuff);
}
