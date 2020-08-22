# 🎛️ use-tweaks

![npm](https://www.npmjs.com/package/use-tweaks) [![Discord Shield](https://discordapp.com/api/guilds/740090768164651008/widget.png?style=shield)](https://discord.gg/ZZjjNvJ)

Use [Tweakpane](http://cocopon.github.io/tweakpane/) in React apps

![A screenshot of the library in use](https://raw.githubusercontent.com/gsimone/use-tweaks/main/_screenshot.png)

## Basic example

```jsx
import { useTweaks } from "use-tweaks";

function MyComponent() {
  const { speed, factor } = useTweaks({
    speed: 1,
    factor: { value: 1, min: 10, max: 100 },
  });

  return (
    <div>
      {speed} * {factor}
    </div>
  );
}
```

## Misc

#### Folders

You can add a top-level folder by passing the name as first argument of the hook:

```jsx
import { useTweaks } from "use-tweaks";

const { speed, factor } = useTweaks("My title!", { speed: 1, factor: 1 });
```

You can also nest folders by using the `makeFolder` helper:

```jsx
import { useTweaks, makeFolder } from "use-tweaks";

const { speed, factor } = useTweaks("My Title!", {
  speed: 1,
  ...makeFolder(
    "Advanced",
    {
      factor: 1,
    },
    false
  ), // pass false to make the folder collapsed by default
});
```

#### Buttons

Use the `makeButton` helper to create and add a button

```jsx
import { useTweaks, makeButton } from "use-tweaks";

const { speed, factor } = useTweaks(
  makeButton("Log!", () => console.log("Hello World!"))
);
```

#### Separator

Use the `makeSeparator` helper to add a separator

```jsx
import { useTweaks, makeSeparator } from "use-tweaks";

const { speed, factor } = useTweaks({
  speed: 1,
  ...makeSeparator(),
  factor: { value: 1, min: 10, max: 100 },
});
```
