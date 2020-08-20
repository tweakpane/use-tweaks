# use-tweakpane
Created with CodeSandbox

# Usage

```jsx

import { useTweaks } from 'use-tweaks'

function MyComponent() {

  const { speed, factor } = useTweaks({ speed: 1, factor: { value: 1, min: 10, max: 100 })

  return (
    <div>
      {speed} * {factor}
    </div>
  )

}

```
