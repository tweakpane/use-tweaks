import { create } from './GUI'

export const useTweaks = create({
    speed: 4,
    factor: 5,
    rotateY: false
})

useTweaks.addInput("speed", { min: 0, max: 10 })
useTweaks.addInput("factor", { min: 0, max: 10 })
useTweaks.addInput("rotateY", { min: 0, max: 10 })
