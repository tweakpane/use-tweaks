import produce from "immer";
import create from "zustand";

export const useStore = create((set) => ({
  // @ts-expect-error
  setValue: (fn) => set(produce(fn)),
}));

export const setValue = useStore.getState().setValue;
