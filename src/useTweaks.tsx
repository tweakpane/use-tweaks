import {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from "react";
import type { InputParams as TweakpaneInputParams } from "tweakpane/dist/types/api/types";
import shallow from "zustand/shallow";

import { useStore, getInitialValues } from "./store";

type InputConstructor = (TweakpaneInputParams & { value: any }) | any;

export interface Schema {
  [name: string]: InputConstructor;
}

export function useTweaks(
  nameOrSchema: string | Schema,
  schema?: Schema | Settings | undefined,
  settings?: Schema | undefined
) {
  const _schema = typeof nameOrSchema === "string" ? schema : nameOrSchema;
  const [id] = useState(() => JSON.stringify(schema));

  useEffect(() => {
    useStore.getState().init(id, nameOrSchema, schema, settings);

    return () => {
      useStore.getState().dispose();
    };
    // eslint-disable-next-line
  }, []);

  const refreshRef = useRef(0);
  const _refresh = useStore<number>((state) => state.refresh);

  // Only update when values concering this particular instance are changed
  const valuesFromState = useStore(
    useCallback((state) => state[id], [id]),
    (a, b) => shallow(a, b) && refreshRef.current === _refresh
  );

  useLayoutEffect(() => void (refreshRef.current = _refresh), [_refresh]);

  return valuesFromState || getInitialValues(_schema);
}
