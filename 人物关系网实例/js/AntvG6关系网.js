const { ExtensionCategory, Graph, HoverActivate, idOf, register } = G6;
const ACTIVE_COLOR = "#f6c523";
const COLOR_MAP = {
  "pre-inspection": "#3fc1c9",
  problem: "#8983f3",
  inspection: "#f48db4",
  solution: "#ffaa64",
};

const getNode = ({ data }) => {
  const { text, type } = data.data;
  const isHovered = data.states?.includes("active");
  const isSelected = data.states?.includes("selected");
  const color = isHovered ? ACTIVE_COLOR : COLOR_MAP[type];
  const containerStyle = `
    width="100%";
    height="100%";
    background=${color};
    borde= 3px solid ${color};
    border-radius=16;
    cursor=pointer;
  `;

  if (isSelected) {
    Object.assign(containerStyle, { border: `3px solid #000` });
  }
  return `<div style=${containerStyle}>${text}</div>`;
};

const initialState = () => {
  fetch("./json/AntvG6关系网.json")
    .then((d) => d.json())
    .then((data) => {
      const graph = new Graph({
        container: "container",
        data,
        autoFit: "view",
        node: {
          style: (d) => {
            const style = {
              component: getNode({ data: d }),
              ports: [{ placement: "top" }, { placement: "bottom" }],
            };
            const size = {
              "pre-inspection": [240, 120],
              problem: [200, 120],
              inspection: [330, 100],
              solution: [200, 120],
            }[d.data.type] || [200, 80];
            Object.assign(style, {
              size,
              dx: -size[0] / 2,
              dy: -size[1] / 2,
            });
            return style;
          },
          state: {
            active: {
              halo: false, // 光晕
            },
            selected: {
              halo: false, // 选择后的光晕效果
            },
          },
        },
        edge: {
          type: "polyline",
          style: {
            lineWidth: 3,
            radius: 20,
            stroke: "#8b9baf",
            endArrow: true,
            labelText: (d) => d.data.text,
            labelFill: "#8b9baf",
            labelFontWeight: 600,
            labelBackground: true,
            labelBackgroundFill: "#f8f8f8",
            labelBackgroundOpacity: 1,
            labelBackgroundLineWidth: 3,
            labelBackgroundStroke: "#8b9baf",
            labelPadding: [1, 10],
            labelBackgroundRadius: 4,
            router: { type: "orth" },
          },
          state: {
            active: {
              stroke: ACTIVE_COLOR,
              labelBackgroundStroke: ACTIVE_COLOR,
              halo: false,
            },
          },
        },
        // // 节点悬浮窗
        // plugins: [
        //   {
        //     type: "tooltip",
        //     key: "tooltip",
        //     enable: (event) =>
        //       //启用node和canvas事件
        //       event.targetType === "node" || event.targetType === "canvas",
        //   },
        // ],
        layout: { type: "antv-dagre" },
        behaviors: [
          // "zoom-canvas", // 缩放
          // "drag-canvas", // 拖拽
          "hover-element", // 元素划入
          "click-select", // 节点选择
        ],
      });
      graph.render();
      graph.on("node:click", (ev) => {
        const { target, originalTarget } = ev;
        // console.log("节点：", target.id, data);
        console.log("node节点：", target.id, graph.getData());
        // graph.hideElement(target.id); // 隐藏节点
        // graph.showElement(target.id); // 展示节点
      });
      graph.on("edge:click", (ev) => {
        const { target, originalTarget } = ev;
        console.log("edge节点：", target.id);
        // graph.hideElement(target.id); // 隐藏节点
        // graph.showElement(target.id); // 展示节点
      });
    });
};

initialState();
