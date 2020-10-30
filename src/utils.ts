export function uuid(): string {
  return `${Math.floor((new Date().getTime() * Math.random()) / 1000)}`
}
