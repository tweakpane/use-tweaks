import type { InputParams as TweakpaneInputParams } from "tweakpane/dist/types/api/types";
declare type InputConstructor = TweakpaneInputParams & {
  value: any;
};
interface ConstructionStuff {
  [name: string]: InputConstructor | any;
}
interface InitialValuesObject {
  [name: string]: any;
}
export default function useTweaks(
  id: string,
  constructionStuff: ConstructionStuff
): InitialValuesObject;
export {};
