import React, { 
  createContext, 
  useContext, 
  useEffect, 
  useLayoutEffect, 
  useMemo,
  useRef,
} from 'react'
import Tweakpane from "tweakpane";
import create from "zustand";
import pick from "lodash.pick";
import shallow from "zustand/shallow";
import debounce from "lodash.debounce"

const useStore = create((set) => ({
  setValue: (key, value) => set(() => ({ [key]: value }))
}));

const folderContext = createContext()

// this could be used to mount the child three only when the GUI is ready
export function GUIRoot({ children, initialValues }) {

  const pane = new Tweakpane();
  const OBJECT = useRef(initialValues);
  
  useEffect(() => {
    useStore.setState(() => ({ ...initialValues }))
  }, [initialValues])
  
  return <folderContext.Provider value={{ OBJECT, pane}}>{OBJECT.current && children}</folderContext.Provider>;
}

// @bug folders are mounted twice and they are always before the inputs
export function Folder({ title, children }) {
  const { pane, OBJECT } = useContext(folderContext)
  const newPane = useMemo(() => pane.addFolder({
    title
  }), [title, pane])

  return <folderContext.Provider value={{ OBJECT, pane: newPane}}>{children}</folderContext.Provider>
}


export function useGUI(...keys) {
  return useStore((state) => Object.values(pick(state, keys)), shallow);
}

const debSetValue = debounce((values) => useStore.setState({ ...values }))

export function Input({
  name,
  options,
  value = 0,
  transform = (n) => n,
  ...settings
}) {
  
  const setValue = useStore((state) => state.setValue);
  const { OBJECT, pane } = useContext(folderContext)

  const ref = useRef(true)

  // set initial values in the OBJECT and state
  useLayoutEffect(() => {

    if (ref.current) {
      // add the actual input
      pane
      .addInput(OBJECT.current, name, { options, ...settings })
      .on("change", (value) => {

        const transformedValue = transform(value);

        // set the value in the zustand store when it changes
        // debounced because why not
        debSetValue({ [name]: transformedValue })
        return transformedValue;

      });

      ref.current = false

    }
      
    
  }, [name, value, settings, options, setValue, pane, transform]);

  return null;
}
