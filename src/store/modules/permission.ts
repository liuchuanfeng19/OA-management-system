import { defineStore } from "pinia";
import { store } from "@/store";
import type { cacheType } from "./types";
import { constantMenus } from "@/router";
import { cloneDeep } from "lodash-unified";
import type { RouteConfigs } from "@/layout/types";
import { ascending, filterTree } from "@/router/utils";

const modulesRoutes = import.meta.glob("/src/views/**/components/*.vue");
export const usePermissionStore = defineStore({
  id: "pure-permission",
  state: () => ({
    // 静态路由生成的菜单
    constantMenus,
    // 整体路由生成的菜单（静态、动态）
    wholeMenus: [],
    // 深拷贝一个菜单树，与导航菜单不突出
    menusTree: [],
    buttonAuth: [],
    menuTree: [], //菜单树
    allMenuLeaves: [], //所有叶子菜单
    allMenuLeavesMap: new Map(), //所有叶子菜单Map
    allPathLeavesMap: new Map(), //所有叶子菜单路由Map
    // 缓存页面keepAlive
    cachePageList: []
  }),
  actions: {
    /** 设置所有叶子菜单 */
    setMenuTree(_menuTree) {
      this.menuTree = JSON.parse(JSON.stringify(_menuTree));
      // console.log("menuTree", this.menuTree);
    },
    /** 设置所有叶子菜单 */
    setAllMenuLeaves() {
      let menus = this.menuTree;
      for (let index = 0; index < 6; index++) {
        menus = menus.flatMap(item => {
          if (item.children.length > 0) {
            return item.children;
          } else {
            return item;
          }
        });
      }
      this.allMenuLeaves = menus;
      this.allMenuLeaves.forEach(item => {
        // console.log("item", item);
        const component = item.component.split("/index")[0];
        let dialog =
          modulesRoutes[
            "/src/views" + component + "/components/DialogForm.vue"
          ];
        if (dialog == undefined) {
          dialog =
            modulesRoutes[
              "/src/views" + component + "/components/FormDialog.vue"
            ];
        }
        if (dialog == undefined) {
          // console.log("component", component);
          // console.log("item.component", item.component);
        }
        // console.log("dialog", dialog);

        this.allPathLeavesMap.set(item.id, item.path);
        this.allMenuLeavesMap.set(item.id, dialog);
      });
      // console.log("allMenuLeaves", this.allMenuLeaves);
      // console.log("allMenuLeavesMap", this.allMenuLeavesMap);
    },
    /** 获取异步路由菜单 */
    asyncActionRoutes(routes) {
      if (this.wholeMenus.length > 0) return;
      this.wholeMenus = filterTree(
        ascending(this.constantMenus.concat(routes))
      );

      this.menusTree = cloneDeep(
        filterTree(ascending(this.constantMenus.concat(routes)))
      );

      const getButtonAuth = (arrRoutes: Array<RouteConfigs>) => {
        if (!arrRoutes || !arrRoutes.length) return;
        arrRoutes.forEach((v: RouteConfigs) => {
          if (v.meta && v.meta.authority) {
            this.buttonAuth.push(...v.meta.authority);
          }
          if (v.children) {
            getButtonAuth(v.children);
          }
        });
      };

      getButtonAuth(this.wholeMenus);
    },
    async changeSetting(routes) {
      await this.asyncActionRoutes(routes);
    },
    cacheOperate({ mode, name }: cacheType) {
      switch (mode) {
        case "add":
          this.cachePageList.push(name);
          this.cachePageList = [...new Set(this.cachePageList)];
          break;
        case "delete":
          // eslint-disable-next-line no-case-declarations
          const delIndex = this.cachePageList.findIndex(v => v === name);
          delIndex !== -1 && this.cachePageList.splice(delIndex, 1);
          break;
      }
    },
    /** 清空缓存页面 */
    clearAllCachePage() {
      this.wholeMenus = [];
      this.menusTree = [];
      this.buttonAuth = [];
      this.cachePageList = [];
    }
  }
});

export function usePermissionStoreHook() {
  return usePermissionStore(store);
}
