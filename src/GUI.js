import {useCallback} from 'react'
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
  
  function useTweaks(...keys) {
    return useStore((state) => Object.values(pick(state, keys)), shallow);
  }

  function useMonitor(key) {

    const set = useCallback((value) => {
      OBJECT[key] = value
    }, [])
    
    return set
  }
  
  const debSetValue = debounce((values) => useStore.setState({ ...values }))

  const addInput = pane => (name, ...args) => {

    return pane.addInput(OBJECT, name, ...args)
      .on('change', value => {
        debSetValue({ [name]: value })
      })
  }

  const addMonitor = pane => (name, ...args) => {
    return pane.addMonitor(OBJECT, name, ...args)
  }

  const addFolder = pane => (settings) => {

    const folder = pane.addFolder(settings)
    
    // return a proxy
    return {
      addInput: addInput(folder),
      addFolder: addFolder(folder),
      addSeparator: addSeparator(folder),
      addMonitor: addMonitor(folder)
    }
  }

  const addSeparator = pane => () => {
    pane.addSeparator()
  }

  // add the tweakmap api to the created hook
  useTweaks.addInput = addInput(pane)
  useTweaks.addFolder = addFolder(pane)
  useTweaks.addSeparator = addSeparator(pane)
  useTweaks.addMonitor = addMonitor(pane)


  useTweaks.useMonitor = useMonitor
  
  return useTweaks
}
