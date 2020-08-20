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

  const addInput = pane => (name, ...args) => {

    return pane.addInput(OBJECT, name, ...args)
      .on('change', value => {
        debSetValue({ [name]: value })
      })
  }

  const addFolder = pane => (settings) => {
    const folder = pane.addFolder(settings)
    
    return {
      addInput: addInput(folder),
      addFolder: addFolder(folder)
    }
  }

  useGUI.addInput = addInput(pane)
  useGUI.addFolder = addFolder(pane)
  
  return useGUI
}
