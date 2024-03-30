import Stats from "three/addons/libs/stats.module.js";

export const infoPanel = infoPanelInit();

function infoPanelInit() {
  const element = document.body.appendChild(document.createElement("div"));

  element.className = "info-panel";

  return {
    element: element,
    update: (name: string, speed: number, height: number) => {
      element.textContent = `Name: ${name}\n
      Speed: ${speed.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} m/s\n
      Height: ${height.toLocaleString(undefined, {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })} m`;
    },
  };
}

export const stats = new Stats();
document.body.appendChild(stats.dom);
