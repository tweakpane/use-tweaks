import { create } from './GUI'

export const useTweaks = create({
    speed: 4,
    factor: 5,
    rotateY: false,
    color: { r: 0, g: 255, b: 1}
})

useTweaks.addInput("speed", { min: 0, max: 10 })
useTweaks.addInput("factor", { min: 0, max: 10 })
useTweaks.addInput("rotateY")

const folder = useTweaks.addFolder({ title: "test" })
folder.addInput("color")
