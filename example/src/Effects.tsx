import React from "react";
import { EffectComposer, ChromaticAberration } from "react-postprocessing";

import { makeFolder, useTweaks } from "../../dist";

export default function Effects() {
  const { offset } = useTweaks(
    makeFolder("Effects", { offset: { value: { x: 1, y: 1 } } }, false)
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
