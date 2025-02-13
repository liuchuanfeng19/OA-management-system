import { store } from "@/store";
import type { OAType } from "./types";
import { defineStore } from "pinia";

export const useOAStore = defineStore({
  id: "pure-oa",
  state: (): OAType => ({
    nodeMap: new Map(),
    isEdit: null,
    selectedNode: null,
    selectFormItem: null,
    design: null
  }),
  getters: {
    getNodeMap() {
      return this.nodeMap;
    },
    getIsEdit() {
      return this.isEdit;
    },
    getSelectedNode() {
      return this.selectedNode;
    },
    getSelectFormItem() {
      return this.selectFormItem;
    },
    getDesign() {
      return this.design;
    }
  },
  actions: {
    setSelectedNode(selectedNode) {
      console.log("selectedNode", selectedNode);
      this.selectedNode = selectedNode;
    }
  }
});

export function useOAStoreHook() {
  return useOAStore(store);
}
