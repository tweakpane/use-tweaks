import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useRef,
  useState,
} from 'react'
import Tweakpane from "tweakpane";
import zustandCreate from "zustand";
import pick from "lodash.pick";
import shallow from "zustand/shallow";
import debounce from "lodash.debounce"

export function create(initialValues) {
  const pane = new Tweakpane()
  const OBJECT = initialValues

  const useStore = zustandCreate((set) => ({
    ...initialValues,
    setValue: (key, value) => set(() => ({ [key]: value }))
  }));
  
  // useStore.subscribe(console.log)
  
  function useGUI(...keys) {
    return useStore((state) => Object.values(pick(state, keys)), shallow);
  }
  
  const debSetValue = debounce((values) => useStore.setState({ ...values }))

  function addInput(name, ...args) {

    return pane.addInput(OBJECT, name, ...args)
      .on('change', value => {
        debSetValue({ [name]: value })
      })
  }

  useGUI.addInput = addInput
  
  return useGUI
}
