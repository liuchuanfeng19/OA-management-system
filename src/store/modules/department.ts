import { defineStore } from "pinia";

import { store } from "@/store";
import type { departmentType } from "./types";
import { getTree, getRootDeptList } from "@/api/department";

export const userDepartmentStore = defineStore({
  id: "pure-department",
  state: (): departmentType => ({
    rootDepartment: [],
    departmentTree: []
  }),
  actions: {
    /**
     * 获取根部门列表
     * @returns
     */
    getRootDeptList() {
      return new Promise(resolve => {
        getRootDeptList()
          .then(({ data }) => {
            this.rootDepartment = data || [];
            resolve(data);
          })
          .catch(() => {
            resolve([]);
          });
      });
    },
    /**
     * 获取部门树
     * @returns
     */
    getDepartmentTree() {
      return new Promise(resolve => {
        getTree()
          .then(({ data }) => {
            this.departmentTree = data || [];
            resolve(data);
          })
          .catch(() => {
            resolve([]);
          });
      });
    }
  }
});

export function userDepartmentStoreHook() {
  return userDepartmentStore(store);
}
