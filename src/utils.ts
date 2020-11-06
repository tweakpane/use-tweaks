import { useEffect, useLayoutEffect } from 'react'

export function uuid(): string {
  return `${Math.floor((new Date().getTime() * Math.random()) / 1000)}`
}

export const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
