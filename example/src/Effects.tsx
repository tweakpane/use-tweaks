import React from "react";
import { EffectComposer, ChromaticAberration } from "react-postprocessing";

import { makeDirectory, useTweaks } from "../../dist";

export default function Effects() {
  const { offset } = useTweaks({
    ...makeDirectory(
      "Effects",
      {
        offset: { value: { x: 1, y: 1 } },
      },
      {
        expanded: false,
      }
    ),
  });

  return (
    <EffectComposer>
      <ChromaticAberration
        // @ts-expect-error
        offset={[offset.x / 1000, offset.y / 1000]}
      />
    </EffectComposer>
  );
}
