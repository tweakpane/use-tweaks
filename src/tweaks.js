import { create } from './useTweaks'

export const useTweaks = create({
    speed: 4,
    factor: 5,
    rotateY: false,
    color: { r: 0, g: 255, b: 1},
    position: { x: 0, y: 0 },
    mouse: 0
})

useTweaks.addInput("speed", { min: 0, max: 10 })
useTweaks.addInput("factor", { min: 0, max: 10 })
useTweaks.addSeparator()
useTweaks.addInput("rotateY")

const folder = useTweaks.addFolder({ title: "test" })
folder.addInput("color")
folder.addSeparator()
folder.addInput("position", { x: { min: 0, max: 0 }, y: { min: -1, max: 1} })
folder.addMonitor("mouse", {
    view: "graph",
    min: -1,
    max: 1
})
