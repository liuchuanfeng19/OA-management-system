import {
  type RouterHistory,
  type RouteRecordRaw,
  type RouteComponent,
  createWebHistory,
  createWebHashHistory,
  type RouteRecordNormalized
} from "vue-router";
import { router } from "./index";
import { isProxy, toRaw } from "vue";
import { useTimeoutFn } from "@vueuse/core";
import type { RouteConfigs } from "@/layout/types";
import {
  isString,
  cloneDeep,
  buildHierarchyTree,
  isIncludeAllChildren
} from "@pureadmin/utils";
import type { PureHttpResponseData } from "@/utils/http/types.d";
import { usePermissionStoreHook } from "@/store/modules/permission";
const IFrame = () => import("@/layout/frameView.vue");
// https://cn.vitejs.dev/guide/features.html#glob-import
const modulesRoutes = import.meta.glob("/src/views/**/*.{vue,tsx}");

// 动态路由
import { getRouterList } from "@/api/menuButton";

/** 按照路由中meta下的rank等级升序来排序路由 */
function ascending(arr: any[]) {
  arr.forEach(v => {
    if (v?.meta?.rank === null) v.meta.rank = undefined;
    if (v?.meta?.rank === 0) {
      if (v.name !== "Home" && v.path !== "/") {
        console.warn("rank only the home page can be 0");
      }
    }
  });
  return arr.sort(
    (a: { meta: { rank: number } }, b: { meta: { rank: number } }) => {
      return a?.meta?.rank - b?.meta?.rank;
    }
  );
}

/** 过滤meta中showLink为false的路由 */
function filterTree(data: RouteComponent[]) {
  const newTree = cloneDeep(data).filter(
    (v: { meta: { showLink: boolean } }) => v.meta?.showLink !== false
  );
  newTree.forEach(
    (v: { children }) => v.children && (v.children = filterTree(v.children))
  );
  return newTree;
}

/** 批量删除缓存路由(keepalive) */
function delAliveRoutes(delAliveRouteList: Array<RouteConfigs>) {
  delAliveRouteList.forEach(route => {
    usePermissionStoreHook().cacheOperate({
      mode: "delete",
      name: route?.name
    });
  });
}

/** 通过path获取父级路径 */
function getParentPaths(path: string, routes: RouteRecordRaw[]) {
  // 深度遍历查找
  function dfs(routes: RouteRecordRaw[], path: string, parents: string[]) {
    for (let i = 0; i < routes.length; i++) {
      const item = routes[i];
      // 找到path则返回父级path
      if (item.path === path) return parents;
      // children不存在或为空则不递归
      if (!item.children || !item.children.length) continue;
      // 往下查找时将当前path入栈
      parents.push(item.path);

      if (dfs(item.children, path, parents).length) return parents;
      // 深度遍历查找未找到时当前path 出栈
      parents.pop();
    }
    // 未找到时返回空数组
    return [];
  }

  return dfs(routes, path, []);
}

/** 查找对应path的路由信息 */
function findRouteByPath(path: string, routes: RouteRecordRaw[]) {
  let res = routes.find((item: { path: string }) => item.path == path);
  if (res) {
    return isProxy(res) ? toRaw(res) : res;
  } else {
    for (let i = 0; i < routes.length; i++) {
      if (
        routes[i].children instanceof Array &&
        routes[i].children.length > 0
      ) {
        res = findRouteByPath(path, routes[i].children);
        if (res) {
          return isProxy(res) ? toRaw(res) : res;
        }
      }
    }
    return null;
  }
}

function rebuideRouter(remoteRouters) {
  remoteRouters.forEach(v => {
    v.meta = {
      title: v.title,
      icon: v.icon,
      showLink: !v.isHiddenMenu,
      keepAlive: v.isKeepAlive,
      showParent: v.isHiddenNode,
      backstage: true, //将backstage属性加入meta，标识此路由为后端返回路由
      // refreshRedirect:false,
      // dynamicLevel:10,
      // saveSrollTop: true,
      // frameSrc: "https://pipipi-pikachu.github.io/PPTist/",
      // transition: {
      //   // name: "fade",
      //   enterTransition: "animate__zoomIn",
      //   leaveTransition: "animate__zoomOut"
      // },
      // extraIcon: {
      //   svg: true,
      //   name: "IF-icon-a-ziyuan2"
      // },
      rank: 1
      // savedPosition: true,
      // authority: []
    };
    if (v.children) {
      rebuideRouter(v.children);
    }
  });
}
//获取第一个显示的孩子
function getFirstChild(child) {
  if (child.children.length > 0) {
    const noHidden = child.children.find(item => !item.isHiddenMenu);
    if (noHidden) {
      child.redirect = child.children[0].path;
      return getFirstChild(noHidden);
    }
  } else {
    return child;
  }
}

function addPathMatch() {
  if (!router.hasRoute("pathMatch")) {
    router.addRoute({
      path: "/:pathMatch(.*)",
      name: "pathMatch",
      redirect: "/error/404"
    });
  }
}

/** 初始化路由 */
function initRouter() {
  return new Promise(resolve => {
    getRouterList({ platform: "OAWeb" }).then((res: PureHttpResponseData) => {
      const remoteRouters = res.data || [];
      usePermissionStoreHook().setMenuTree(remoteRouters);
      usePermissionStoreHook().setAllMenuLeaves();
      remoteRouters.forEach(item => {
        const firstChild = getFirstChild({ ...item });
        if (firstChild) {
          // 重定向到第一个显示的孩子
          item.redirect = firstChild.path;
        } else {
          // 获取第一个显示的孩子，则隐藏自己
          item.isHiddenMenu = true;
        }
      });
      rebuideRouter(remoteRouters);
      if (remoteRouters.length === 0) {
        usePermissionStoreHook().changeSetting(remoteRouters);
      } else {
        formatFlatteningRoutes(addAsyncRoutes(remoteRouters)).map(
          (v: RouteRecordRaw) => {
            // 防止重复添加路由
            if (
              router.options.routes[0].children.findIndex(
                value => value.path === v.path
              ) !== -1
            ) {
              return;
            } else {
              // 切记将路由push到routes后还需要使用addRoute，这样路由才能正常跳转
              router.options.routes[0].children.push(v);
              // 最终路由进行升序
              ascending(router.options.routes[0].children);
              if (!router.hasRoute(v?.name)) router.addRoute(v);
              const flattenRouters: any = router
                .getRoutes()
                .find(n => n.path === "/");
              router.addRoute(flattenRouters);
            }
            // resolve(router);
          }
        );
        usePermissionStoreHook().changeSetting(remoteRouters);
      }
      addPathMatch();
      resolve(router);
    });
  });
}

/**
 * 将多级嵌套路由处理成一维数组
 * @param routesList 传入路由
 * @returns 返回处理后的一维路由
 */
function formatFlatteningRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  let hierarchyList = buildHierarchyTree(routesList);
  for (let i = 0; i < hierarchyList.length; i++) {
    if (hierarchyList[i].children) {
      hierarchyList = hierarchyList
        .slice(0, i + 1)
        .concat(hierarchyList[i].children, hierarchyList.slice(i + 1));
    }
  }
  return hierarchyList;
}

/**
 * 一维数组处理成多级嵌套数组（三级及以上的路由全部拍成二级，keep-alive 只支持到二级缓存）
 * https://github.com/xiaoxian521/vue-pure-admin/issues/67
 * @param routesList 处理后的一维路由菜单数组
 * @returns 返回将一维数组重新处理成规定路由的格式
 */
function formatTwoStageRoutes(routesList: RouteRecordRaw[]) {
  if (routesList.length === 0) return routesList;
  const newRoutesList: RouteRecordRaw[] = [];
  routesList.forEach((v: RouteRecordRaw) => {
    if (v.path === "/") {
      newRoutesList.push({
        component: v.component,
        name: v.name,
        path: v.path,
        redirect: v.redirect,
        meta: v.meta,
        children: []
      });
    } else {
      newRoutesList[0].children.push({ ...v });
    }
  });
  return newRoutesList;
}

/** 处理缓存路由（添加、删除、刷新） */
function handleAliveRoute(matched: RouteRecordNormalized[], mode?: string) {
  switch (mode) {
    case "add":
      matched.forEach(v => {
        usePermissionStoreHook().cacheOperate({ mode: "add", name: v.name });
      });
      break;
    case "delete":
      usePermissionStoreHook().cacheOperate({
        mode: "delete",
        name: matched[matched.length - 1].name
      });
      break;
    default:
      usePermissionStoreHook().cacheOperate({
        mode: "delete",
        name: matched[matched.length - 1].name
      });
      useTimeoutFn(() => {
        matched.forEach(v => {
          usePermissionStoreHook().cacheOperate({ mode: "add", name: v.name });
        });
      }, 100);
  }
}

/** 过滤后端传来的动态路由 重新生成规范路由 */
function addAsyncRoutes(arrRoutes: Array<RouteRecordRaw>) {
  if (!arrRoutes || !arrRoutes.length) return;
  const modulesRoutesKeys = Object.keys(modulesRoutes);
  arrRoutes.forEach((v: RouteRecordRaw) => {
    // 将backstage属性加入meta，标识此路由为后端返回路由
    v.meta.backstage = true;
    // 父级的redirect属性取值：如果子级存在且父级的redirect属性不存在，默认取第一个子级的path；如果子级存在且父级的redirect属性存在，取存在的redirect属性，会覆盖默认值
    if (v?.children && v.children.length && !v.redirect)
      v.redirect = v.children[0]?.path;
    // 父级的name属性取值：如果子级存在且父级的name属性不存在，默认取第一个子级的name；如果子级存在且父级的name属性存在，取存在的name属性，会覆盖默认值
    if (v?.children && v.children.length && !v.name)
      v.name = v.children[0]?.name;
    if (v.meta?.frameSrc) {
      v.component = IFrame;
    } else {
      // 对后端传component组件路径和不传做兼容（如果后端传component组件路径，那么path可以随便写，如果不传，component组件路径会跟path保持一致）
      const index = v?.component
        ? modulesRoutesKeys.findIndex(ev => ev.includes(v.component as any))
        : modulesRoutesKeys.findIndex(ev => ev.includes(v.path));
      v.component = modulesRoutes[modulesRoutesKeys[index]];
    }
    if (v?.children && v.children.length) {
      addAsyncRoutes(v.children);
    }
  });
  return arrRoutes;
}

/** 获取路由历史模式 https://next.router.vuejs.org/zh/guide/essentials/history-mode.html */
function getHistoryMode(): RouterHistory {
  const routerHistory = import.meta.env.VITE_ROUTER_HISTORY;
  // len为1 代表只有历史模式 为2 代表历史模式中存在base参数 https://next.router.vuejs.org/zh/api/#%E5%8F%82%E6%95%B0-1
  const historyMode = routerHistory.split(",");
  const leftMode = historyMode[0];
  const rightMode = historyMode[1];
  // no param
  if (historyMode.length === 1) {
    if (leftMode === "hash") {
      return createWebHashHistory("");
    } else if (leftMode === "h5") {
      return createWebHistory("");
    }
  } //has param
  else if (historyMode.length === 2) {
    if (leftMode === "hash") {
      return createWebHashHistory(rightMode);
    } else if (leftMode === "h5") {
      return createWebHistory(rightMode);
    }
  }
}

/** 获取当前页面按钮级别的权限 */
function getAuths(): Array<string> {
  return router.currentRoute.value.meta.auths as Array<string>;
}

/** 是否有按钮级别的权限 */
function hasAuth(value: string | Array<string>): boolean {
  if (!value) return false;
  /** 从当前路由的`meta`字段里获取按钮级别的所有自定义`code`值 */
  const metaAuths = getAuths();
  if (!metaAuths) return false;
  const isAuths = isString(value)
    ? metaAuths.includes(value)
    : isIncludeAllChildren(value, metaAuths);
  return isAuths ? true : false;
}

export {
  hasAuth,
  ascending,
  filterTree,
  initRouter,
  getHistoryMode,
  addAsyncRoutes,
  delAliveRoutes,
  getParentPaths,
  findRouteByPath,
  handleAliveRoute,
  formatTwoStageRoutes,
  formatFlatteningRoutes
};
