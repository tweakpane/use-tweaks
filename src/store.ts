import produce from "immer";
import create from "zustand";

export const useStore = create((set) => ({
  // @ts-expect-error
  setValue: (fn) => set(produce(fn)),
}));

// @ts-expect-error
export const setValue = (id: string, key: string, value: any) =>
  useStore.getState().setValue((state) => {
    if (typeof state[id] === "undefined") {
      state[id] = {};
    }

    state[id][key] = value;
  });
