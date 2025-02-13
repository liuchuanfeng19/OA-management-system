<script>
import { clone } from "@pureadmin/utils";
import { message } from "@/utils/message";
import { h, defineComponent, resolveComponent } from "vue";

//导入所有节点组件
import Approval from "./nodes/Approval.vue";
import Cc from "./nodes/Cc.vue";
import Concurrent from "./nodes/Concurrent.vue";
import Condition from "./nodes/Condition.vue";
import Trigger from "./nodes/Trigger.vue";
import Delay from "./nodes/Delay.vue";
import Empty from "./nodes/Empty.vue";
import Node from "./nodes/Node.vue";
import Root from "./nodes/Root.vue";

import { useOAStoreHook } from "@/store/modules/oa";
import DefaultProps from "./DefaultNodeProps";

export default defineComponent({
  name: "ProcessTree",
  components: {
    Node,
    Root,
    Approval,
    Cc,
    Trigger,
    Concurrent,
    Condition,
    Delay,
    Empty
  },
  emits: ["selectedNode"],
  data() {
    return {
      valid: true
    };
  },
  computed: {
    nodeMap() {
      return useOAStoreHook().nodeMap;
    },
    dom() {
      return useOAStoreHook().design.process;
    }
  },
  watch: {},
  methods: {
    getDomTree(node) {
      console.log("node", node);
      this.toMapping(node);
      if (this.isPrimaryNode(node)) {
        //普通业务节点
        const childDoms = this.getDomTree(node.children);
        // const childDoms = [];
        console.log("childDoms", childDoms);
        this.decodeAppendDom(node, childDoms);
        return [h("div", { class: ["primary-node"] }, childDoms)];
      } else if (this.isBranchNode(node)) {
        let index = 0;
        //遍历分支节点，包含并行及条件节点
        const branchItems = node.branchs.map(branchNode => {
          //处理每个分支内子节点
          this.toMapping(branchNode);
          const childDoms = this.getDomTree(branchNode.children);
          this.decodeAppendDom(branchNode, childDoms, {
            level: index + 1,
            size: node.branchs.length
          });
          //插入4条横线，遮挡掉条件节点左右半边线条
          this.insertCoverLine(index, childDoms, node.branchs);
          //遍历子分支尾部分支
          index++;
          return h("div", { class: ["branch-node-item"] }, childDoms);
        });
        //插入添加分支/条件的按钮
        branchItems.unshift(
          h("div", { class: ["add-branch-btn"] }, [
            h(
              "el-button",
              {
                class: ["add-branch-btn-el"],
                size: "small",
                round: true,
                onClick: () => this.addBranchNode(node),
                innerHTML: `添加${this.isConditionNode(node) ? "条件" : "分支"}`
              },
              []
            )
          ])
        );
        const bchDom = [h("div", { class: ["branch-node"] }, branchItems)];
        //继续遍历分支后的节点
        const afterChildDoms = this.getDomTree(node.children);
        return [h("div", {}, [bchDom, afterChildDoms])];
      } else if (this.isEmptyNode(node)) {
        //空节点，存在于分支尾部
        const childDoms = this.getDomTree(node.children);
        this.decodeAppendDom(node, childDoms);
        return [h("div", { class: ["empty-node"] }, childDoms)];
      } else {
        //遍历到了末端，无子节点
        return [];
      }
    },
    //解码渲染的时候插入dom到同级
    decodeAppendDom(node, dom, props = {}) {
      console.log("dom", dom);
      console.log("node", node);
      props.config = node;
      dom.unshift(
        h(
          // "div",
          resolveComponent(node.type.toLowerCase()),
          {
            ...props,
            ref: node.id,
            key: node.id,
            //定义事件，插入节点，删除节点，选中节点，复制/移动
            onInsertNode: type => this.insertNode(type, node),
            onDelNode: () => this.delNode(node),
            onSelected: () => this.selectNode(node),
            onCopy: () => this.copyBranch(node),
            onLeftMove: () => this.branchMove(node, -1),
            onRightMove: () => this.branchMove(node, 1)
          },
          []
        )
      );
    },
    //id映射到map，用来向上遍历
    toMapping(node) {
      if (node && node.id) {
        //console.log("node=> " + node.id + " name:" + node.name + " type:" + node.type)
        this.nodeMap.set(node.id, node);
      }
    },
    insertCoverLine(index, doms, branchs) {
      if (index === 0) {
        //最左侧分支
        doms.unshift(h("div", { class: ["line-top-left"] }, []));
        doms.unshift(h("div", { class: ["line-bot-left"] }, []));
      } else if (index === branchs.length - 1) {
        //最右侧分支
        doms.unshift(h("div", { class: ["line-top-right"] }, []));
        doms.unshift(h("div", { class: ["line-bot-right"] }, []));
      }
    },
    copyBranch(node) {
      const parentNode = this.nodeMap.get(node.parentId);
      const branchNode = clone(node, true);
      branchNode.name = branchNode.name + "-copy";
      this.forEachNode(parentNode, branchNode, (parent, node) => {
        const id = this.getRandomId();
        console.log(node, "新id =>" + id, "老nodeId:" + node.id);
        node.id = id;
        node.parentId = parent.id;
      });
      parentNode.branchs.splice(
        parentNode.branchs.indexOf(node),
        0,
        branchNode
      );
      this.$forceUpdate();
    },
    branchMove(node, offset) {
      const parentNode = this.nodeMap.get(node.parentId);
      const index = parentNode.branchs.indexOf(node);
      const branch = parentNode.branchs[index + offset];
      parentNode.branchs[index + offset] = parentNode.branchs[index];
      parentNode.branchs[index] = branch;
      this.$forceUpdate();
    },
    //判断是否为主要业务节点
    isPrimaryNode(node) {
      return (
        node &&
        (node.type === "ROOT" ||
          node.type === "APPROVAL" ||
          node.type === "CC" ||
          node.type === "DELAY" ||
          node.type === "TRIGGER")
      );
    },
    isBranchNode(node) {
      return (
        node && (node.type === "CONDITIONS" || node.type === "CONCURRENTS")
      );
    },
    isEmptyNode(node) {
      return node && node.type === "EMPTY";
    },
    //是分支节点
    isConditionNode(node) {
      return node.type === "CONDITIONS";
    },
    //是分支节点
    isBranchSubNode(node) {
      return node && (node.type === "CONDITION" || node.type === "CONCURRENT");
    },
    isConcurrentNode(node) {
      return node.type === "CONCURRENTS";
    },
    getRandomId() {
      return `node_${new Date().getTime().toString().substring(5)}${Math.round(
        Math.random() * 9000 + 1000
      )}`;
    },
    //选中一个节点
    selectNode(node) {
      useOAStoreHook().setSelectedNode(node);
      this.$emit("selectedNode", node);
    },
    //处理节点插入逻辑
    insertNode(type, parentNode) {
      this.$refs["_root"].click();
      //缓存一下后面的节点
      const afterNode = parentNode.children;
      //插入新节点
      parentNode.children = {
        id: this.getRandomId(),
        parentId: parentNode.id,
        props: {},
        type: type
      };
      switch (type) {
        case "APPROVAL":
          this.insertApprovalNode(parentNode, afterNode);
          break;
        case "CC":
          this.insertCcNode(parentNode);
          break;
        case "DELAY":
          this.insertDelayNode(parentNode);
          break;
        case "TRIGGER":
          this.insertTriggerNode(parentNode);
          break;
        case "CONDITIONS":
          this.insertConditionsNode(parentNode);
          break;
        case "CONCURRENTS":
          this.insertConcurrentsNode(parentNode);
          break;
        default:
          break;
      }
      //拼接后续节点
      if (this.isBranchNode({ type: type })) {
        if (afterNode && afterNode.id) {
          afterNode.parentId = parentNode.children.children.id;
        }
        parentNode.children.children.children = afterNode;
        // this.$set(parentNode.children.children, "children", afterNode);
      } else {
        if (afterNode && afterNode.id) {
          afterNode.parentId = parentNode.children.id;
        }
        parentNode.children.children = afterNode;
        // this.$set(parentNode.children, "children", afterNode);
      }
      this.$forceUpdate();
    },
    insertApprovalNode(parentNode) {
      parentNode.children.name = "审批人";
      parentNode.children.props = clone(DefaultProps.APPROVAL_PROPS, true);
      // this.$set(parentNode.children, "name", "审批人");
      // this.$set(
      //   parentNode.children,
      //   "props",
      //   clone(DefaultProps.APPROVAL_PROPS, true)
      // );
    },
    insertCcNode(parentNode) {
      parentNode.children.name = "抄送人";
      parentNode.children.props = clone(DefaultProps.CC_PROPS, true);
      // this.$set(parentNode.children, "name", "抄送人");
      // this.$set(
      //   parentNode.children,
      //   "props",
      //   clone(DefaultProps.CC_PROPS, true)
      // );
    },
    insertDelayNode(parentNode) {
      parentNode.children.name = "延时处理";
      parentNode.children.props = clone(DefaultProps.DELAY_PROPS, true);
      // this.$set(parentNode.children, "name", "延时处理");
      // this.$set(
      //   parentNode.children,
      //   "props",
      //   clone(DefaultProps.DELAY_PROPS, true)
      // );
    },
    insertTriggerNode(parentNode) {
      parentNode.children.name = "触发器";
      parentNode.children.props = clone(DefaultProps.TRIGGER_PROPS, true);
      // this.$set(parentNode.children, "name", "触发器");
      // this.$set(
      //   parentNode.children,
      //   "props",
      //   clone(DefaultProps.TRIGGER_PROPS, true)
      // );
    },
    insertConditionsNode(parentNode) {
      parentNode.children.name = "条件分支";
      parentNode.children.children = {
        id: this.getRandomId(),
        parentId: parentNode.children.id,
        type: "EMPTY"
      };
      parentNode.children.branchs = [
        {
          id: this.getRandomId(),
          parentId: parentNode.children.id,
          type: "CONDITION",
          props: clone(DefaultProps.CONDITION_PROPS, true),
          name: "条件1",
          children: {}
        },
        {
          id: this.getRandomId(),
          parentId: parentNode.children.id,
          type: "CONDITION",
          props: clone(DefaultProps.CONDITION_PROPS, true),
          name: "条件2",
          children: {}
        }
      ];

      // this.$set(parentNode.children, "name", "条件分支");
      // this.$set(parentNode.children, "children", {
      //   id: this.getRandomId(),
      //   parentId: parentNode.children.id,
      //   type: "EMPTY"
      // });
      // this.$set(parentNode.children, "branchs", [
      //   {
      //     id: this.getRandomId(),
      //     parentId: parentNode.children.id,
      //     type: "CONDITION",
      //     props: clone(DefaultProps.CONDITION_PROPS, true),
      //     name: "条件1",
      //     children: {}
      //   },
      //   {
      //     id: this.getRandomId(),
      //     parentId: parentNode.children.id,
      //     type: "CONDITION",
      //     props: clone(DefaultProps.CONDITION_PROPS, true),
      //     name: "条件2",
      //     children: {}
      //   }
      // ]);
    },
    insertConcurrentsNode(parentNode) {
      parentNode.children.name = "并行分支";
      parentNode.children.children = {
        id: this.getRandomId(),
        parentId: parentNode.children.id,
        type: "EMPTY"
      };
      parentNode.children.branchs = [
        {
          id: this.getRandomId(),
          name: "分支1",
          parentId: parentNode.children.id,
          type: "CONCURRENT",
          props: {},
          children: {}
        },
        {
          id: this.getRandomId(),
          name: "分支2",
          parentId: parentNode.children.id,
          type: "CONCURRENT",
          props: {},
          children: {}
        }
      ];

      // this.$set(parentNode.children, "name", "并行分支");
      // this.$set(parentNode.children, "children", {
      //   id: this.getRandomId(),
      //   parentId: parentNode.children.id,
      //   type: "EMPTY"
      // });
      // this.$set(parentNode.children, "branchs", [
      //   {
      //     id: this.getRandomId(),
      //     name: "分支1",
      //     parentId: parentNode.children.id,
      //     type: "CONCURRENT",
      //     props: {},
      //     children: {}
      //   },
      //   {
      //     id: this.getRandomId(),
      //     name: "分支2",
      //     parentId: parentNode.children.id,
      //     type: "CONCURRENT",
      //     props: {},
      //     children: {}
      //   }
      // ]);
    },
    getBranchEndNode(conditionNode) {
      if (!conditionNode.children || !conditionNode.children.id) {
        return conditionNode;
      }
      return this.getBranchEndNode(conditionNode.children);
    },
    addBranchNode(node) {
      if (node.branchs.length < 8) {
        node.branchs.push({
          id: this.getRandomId(),
          parentId: node.id,
          name:
            (this.isConditionNode(node) ? "条件" : "分支") +
            (node.branchs.length + 1),
          props: this.isConditionNode(node)
            ? clone(DefaultProps.CONDITION_PROPS, true)
            : {},
          type: this.isConditionNode(node) ? "CONDITION" : "CONCURRENT",
          children: {}
        });
      } else {
        message("最多只能添加 8 项😥", { customClass: "el", type: "warning" });
      }
    },
    //删除当前节点
    delNode(node) {
      console.log("删除节点", node);
      //获取该节点的父节点
      const parentNode = this.nodeMap.get(node.parentId);
      if (parentNode) {
        //判断该节点的父节点是不是分支节点
        if (this.isBranchNode(parentNode)) {
          //移除该分支
          parentNode.branchs.splice(parentNode.branchs.indexOf(node), 1);
          //处理只剩1个分支的情况
          if (parentNode.branchs.length < 2) {
            //获取条件组的父节点
            const ppNode = this.nodeMap.get(parentNode.parentId);
            //判断唯一分支是否存在业务节点
            if (
              parentNode.branchs[0].children &&
              parentNode.branchs[0].children.id
            ) {
              //将剩下的唯一分支头部合并到主干
              ppNode.children = parentNode.branchs[0].children;
              ppNode.children.parentId = ppNode.id;
              //搜索唯一分支末端最后一个节点
              const endNode = this.getBranchEndNode(parentNode.branchs[0]);
              //后续节点进行拼接, 这里要取EMPTY后的节点
              endNode.children = parentNode.children.children;
              if (endNode.children && endNode.children.id) {
                endNode.children.parentId = endNode.id;
              }
            } else {
              //直接合并分支后面的节点，这里要取EMPTY后的节点
              ppNode.children = parentNode.children.children;
              if (ppNode.children && ppNode.children.id) {
                ppNode.children.parentId = ppNode.id;
              }
            }
          }
        } else {
          //不是的话就直接删除
          if (node.children && node.children.id) {
            node.children.parentId = parentNode.id;
          }
          parentNode.children = node.children;
        }
        this.$forceUpdate();
      } else {
        message.warning("出现错误，找不到上级节点😥");
      }
    },
    validateProcess() {
      this.valid = true;
      const err = [];
      this.validate(err, this.dom);
      return err;
    },
    validateNode(err, node) {
      if (this.$refs[node.id].validate) {
        this.valid = this.$refs[node.id].validate(err);
      }
    },
    //更新指定节点的dom
    nodeDomUpdate(node) {
      this.$refs[node.id].$forceUpdate();
    },
    //给定一个起始节点，遍历内部所有节点
    forEachNode(parent, node, callback) {
      if (this.isBranchNode(node)) {
        callback(parent, node);
        this.forEachNode(node, node.children, callback);
        node.branchs.map(branchNode => {
          callback(node, branchNode);
          this.forEachNode(branchNode, branchNode.children, callback);
        });
      } else if (
        this.isPrimaryNode(node) ||
        this.isEmptyNode(node) ||
        this.isBranchSubNode(node)
      ) {
        callback(parent, node);
        this.forEachNode(node, node.children, callback);
      }
    },
    //校验所有节点设置
    validate(err, node) {
      if (this.isPrimaryNode(node)) {
        this.validateNode(err, node);
        this.validate(err, node.children);
      } else if (this.isBranchNode(node)) {
        //校验每个分支
        node.branchs.map(branchNode => {
          //校验条件节点
          this.validateNode(err, branchNode);
          //校验条件节点后面的节点
          this.validate(err, branchNode.children);
        });
        this.validate(err, node.children);
      } else if (this.isEmptyNode(node)) {
        this.validate(err, node.children);
      }
    }
  },
  render() {
    console.log("渲染流程树");
    this.nodeMap.clear();
    console.log("this", this);
    const processTrees = this.getDomTree(this.dom);
    console.log("processTrees1", processTrees);
    //插入末端节点
    processTrees.push(
      h("div", { style: { "text-align": "center" } }, [
        h("div", {
          class: ["process-end"],
          innerHTML: "流程结束"
        })
      ])
    );
    console.log("processTrees2", processTrees);
    return h("div", { class: ["_root"], ref: "_root" }, [processTrees]);
  }
});
</script>

<style lang="scss" scoped>
._root {
  margin: 0 auto;
}

.process-end {
  width: 80px;
  padding: 5px 10px;
  margin: 0 auto;
  margin-bottom: 20px;
  font-size: small;
  color: #747474;
  background-color: #f2f2f2;
  border-radius: 15px;
  box-shadow: 0 0 10px 0 #bcbcbc;
}

.primary-node {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.branch-node {
  display: flex;
  justify-content: center;

  /* border-top: 2px solid #cccccc;
  border-bottom: 2px solid #cccccc; */
}

.branch-node-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #f5f6f6;
  border-top: 2px solid #ccc;
  border-bottom: 2px solid #ccc;

  &::before {
    position: absolute;
    top: 0;
    left: calc(50% - 1px);
    width: 2px;
    height: 100%;
    margin: auto;
    content: "";
    background-color: #cacaca;
  }

  .line-top-left,
  .line-top-right,
  .line-bot-left,
  .line-bot-right {
    position: absolute;
    width: 50%;
    height: 4px;
    background-color: #f5f6f6;
  }

  .line-top-left {
    top: -2px;
    left: -1px;
  }

  .line-top-right {
    top: -2px;
    right: -1px;
  }

  .line-bot-left {
    bottom: -2px;
    left: -1px;
  }

  .line-bot-right {
    right: -1px;
    bottom: -2px;
  }
}

.add-branch-btn {
  position: absolute;
  width: 80px;

  .add-branch-btn-el {
    position: absolute;
    top: -15px;
    z-index: 999;
  }
}

.empty-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
