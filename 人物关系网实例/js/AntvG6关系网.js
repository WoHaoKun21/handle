const getNodeSide = (graph, datum) => {
  const parentData = graph.getParentData(datum.id, "tree");
  if (!parentData) return "center";
  return datum.style.x > parentData.style.x ? "right" : "left";
};

const initialState = () => {
  const { Graph, treeToGraphData } = G6;

  fetch("./json/AntvG6关系网.json")
    .then((o) => o.json())
    .then((data) => {
      const graph = new Graph({
        container: "container",
        autoFit: "view",
        data: treeToGraphData(data),
        node: {
          style: {
            labelText: (d) => d.id,
            labelBackground: true,
            labelPlacement: function (d) {
              const side = getNodeSide(this, d);
              return side === "center" ? "right" : side;
            },
            ports: [{ placement: "right" }, { placement: "left" }],
          },
          animation: {
            enter: false,
          },
        },
        edge: {
          type: "cubic-horizontal",
          animation: {
            enter: false,
          },
        },
        layout: {
          type: "mindmap",
          direction: "H",
          getHeight: () => 32,
          getWidth: () => 32,
          getVGap: () => 4,
          getHGap: () => 64,
        },
        behaviors: ["collapse-expand", "drag-canvas", "zoom-canvas"],
      });

      graph.render();
    });
};

initialState();
