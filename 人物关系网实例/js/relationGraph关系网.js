// 如果您没有在main.js文件中使用Vue.use(RelationGraph); 就需要使用下面这一行代码来引入relation-graph
// import RelationGraph from 'relation-graph';
import demoData from "./Demo4AdvDataFilterData.json";
const graphOptions = {
  debug: false,
  defaultNodeBorderWidth: 0,
  defaultNodeColor: "rgba(238, 178, 94, 1)",
  allowSwitchLineShape: true,
  allowSwitchJunctionPoint: true,
  defaultLineShape: 1,
  layout: {
    label: "自动布局",
    layoutName: "force",
    layoutClassName: "seeks-layout-force",
  },
  defaultJunctionPoint: "border",

  // 这里可以参考"Graph 图谱"中的参数进行设置
};
export default {
  name: "RelationGraphDemo",
  components: {}, // 如果您没有在main.js文件中使用Vue.use(RelationGraph); 就需要在这里注册：components: { RelationGraph }
  data() {
    return {
      g_loading: true,
      demoname: "---",
      checked_sex: "",
      checked_isgoodman: "",
      rel_checkList: [
        "师生",
        "上下级",
        "亲戚",
        "情人",
        "朋友",
        "夫妻",
        "勾结",
        "腐化",
        "举报",
      ],
      all_rel_type: [
        "师生",
        "上下级",
        "亲戚",
        "情人",
        "朋友",
        "夫妻",
        "勾结",
        "腐化",
        "举报",
      ],
      graphOptions,
    };
  },
  created() {},
  mounted() {
    this.setGraphData();
  },
  methods: {
    setGraphData() {
      const __graph_json_data = demoData;
      this.$refs.graphRef.setJsonData(__graph_json_data, (graphInstance) => {
        // 这些写上当图谱初始化完成后需要执行的代码
      });
    },
    doFilter() {
      const _all_nodes = this.$refs.graphRef.getInstance().getNodes();
      const _all_links = this.$refs.graphRef.getInstance().getLinks();
      _all_nodes.forEach((thisNode) => {
        let _isHideThisLine = false;
        if (this.checked_sex !== "") {
          if (thisNode.data["sexType"] !== this.checked_sex) {
            _isHideThisLine = true;
          }
        }
        if (this.checked_isgoodman !== "") {
          if (thisNode.data["isGoodMan"] !== this.checked_isgoodman) {
            _isHideThisLine = true;
          }
        }
        thisNode.opacity = _isHideThisLine ? 0.1 : 1;
      });
      _all_links.forEach((thisLink) => {
        thisLink.relations.forEach((thisLine) => {
          if (this.rel_checkList.indexOf(thisLine.data["type"]) === -1) {
            if (!thisLine.isHide) {
              thisLine.isHide = true;
              console.log("Hide line:", thisLine);
            }
          } else {
            if (thisLine.isHide) {
              thisLine.isHide = false;
              console.log("Show line:", thisLine);
            }
          }
        });
        // thisNode.opacity = _isShowThisNode ? 1 : 0.1
      });
      this.$refs.graphRef.getInstance().dataUpdated();
    },
  },
};
