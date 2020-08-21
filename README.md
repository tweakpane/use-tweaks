# 🎛️ use-tweaks

Use [Tweakpane](http://cocopon.github.io/tweakpane/) in React apps

![A screenshot of the library in use](https://raw.githubusercontent.com/gsimone/use-tweakpane/master/)

## Usage

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
