export function uuid(): string {
  return `${Math.floor((new Date().getTime() * Math.random()) / 1000)}`;
}

export function ensureContainer(containerId = "tweaks-container"): HTMLElement {
  const container = document.getElementById("tweaks-container");

  if (container) return container;

  const newContainer = document.createElement("div");
  newContainer.id = containerId;
  document.querySelector("body")?.append(newContainer);

  return newContainer;
}
