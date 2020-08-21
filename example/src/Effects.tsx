import React from "react";
import { EffectComposer, ChromaticAberration } from "react-postprocessing";

import { makeSeparator, useTweaks } from "../../dist";

export default function Effects() {
  const { offset } = useTweaks(
    {
      offset: { value: { x: 1, y: 1 } },
      ...makeSeparator(),
    },
    {
      title: "My Tweaks",
    }
  );

  return (
    <EffectComposer>
      <ChromaticAberration
        // @ts-expect-error
        offset={[offset.x / 1000, offset.y / 1000]}
      />
    </EffectComposer>
  );
}
