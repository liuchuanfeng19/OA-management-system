import { computed } from "vue";
import { router } from "@/router";
import { getConfig } from "@/config";
import { useRouter } from "vue-router";
import { emitter } from "@/utils/mitt";
import type { routeMetaType } from "../types";

import { remainingPaths } from "@/router";
import { transformI18n } from "@/plugins/i18n";
import { useAppStoreHook } from "@/store/modules/app";
import { useUserStoreHook } from "@/store/modules/user";
import { i18nChangeLanguage } from "@wangeditor/editor";
import { sessionKey, type DataInfo } from "@/utils/auth";
import { storageSession, useGlobal } from "@pureadmin/utils";
import { useEpThemeStoreHook } from "@/store/modules/epTheme";

const errorInfo = "当前路由配置不正确，请检查配置";

export function useNav() {
  const pureApp = useAppStoreHook();
  const routers = useRouter().options.routes;
  /** 用户名 */
  const username: string =
    storageSession().getItem<DataInfo<number>>(sessionKey)?.username;

  // 职工名
  const staffName: string =
    storageSession().getItem<DataInfo<number>>(sessionKey)?.staffName;

  // 用户头像
  const avatarUrl: string =
    storageSession().getItem<DataInfo<number>>(sessionKey)?.avatarUrl;

  /** 设置国际化选中后的样式 */
  const getDropdownItemStyle = computed(() => {
    return (locale, t) => {
      return {
        background: locale === t ? useEpThemeStoreHook().epThemeColor : "",
        color: locale === t ? "#f4f4f5" : "#000"
      };
    };
  });

  const getDropdownItemClass = computed(() => {
    return (locale, t) => {
      return locale === t ? "" : "dark:hover:!text-primary";
    };
  });

  const avatarsStyle = computed(() => {
    return username ? { marginRight: "10px" } : "";
  });

  const isCollapse = computed(() => {
    return !pureApp.getSidebarStatus;
  });

  const device = computed(() => {
    return pureApp.getDevice;
  });

  const { $storage, $config } = useGlobal<GlobalPropertiesApi>();
  const layout = computed(() => {
    return $storage?.layout?.layout;
  });

  const title = computed(() => {
    return $config.Title;
  });

  /** 动态title */
  function changeTitle(meta: routeMetaType) {
    const Title = getConfig().Title;
    if (Title) document.title = `${transformI18n(meta.title)} | ${Title}`;
    else document.title = transformI18n(meta.title);
  }

  /** 退出登录 */
  function logout() {
    useUserStoreHook().logOut();
  }

  function backHome() {
    router.push("/welcome");
  }

  function onPanel() {
    emitter.emit("openPanel");
  }

  function toggleSideBar() {
    pureApp.toggleSideBar();
  }

  function handleResize(menuRef) {
    menuRef?.handleResize();
  }

  function resolvePath(route) {
    if (!route.children) return console.error(errorInfo);
    const httpReg = /^http(s?):\/\//;
    const routeChildPath = route.children[0]?.path;
    if (httpReg.test(routeChildPath)) {
      return route.path + "/" + routeChildPath;
    } else {
      return routeChildPath;
    }
  }

  function menuSelect(indexPath: string, routers): void {
    if (isRemaining(indexPath)) return;
    let parentPath = "";
    const parentPathIndex = indexPath.lastIndexOf("/");
    if (parentPathIndex > 0) {
      parentPath = indexPath.slice(0, parentPathIndex);
    }
    /** 找到当前路由的信息 */
    function findCurrentRoute(indexPath: string, routes) {
      if (!routes) return console.error(errorInfo);
      return routes.map(item => {
        if (item.path === indexPath) {
          if (item.redirect) {
            findCurrentRoute(item.redirect, item.children);
          } else {
            /** 切换左侧菜单 通知标签页 */
            emitter.emit("changLayoutRoute", {
              indexPath,
              parentPath
            });
          }
        } else {
          if (item.children) findCurrentRoute(indexPath, item.children);
        }
      });
    }
    findCurrentRoute(indexPath, routers);
  }

  /** 判断路径是否参与菜单 */
  function isRemaining(path: string): boolean {
    return remainingPaths.includes(path);
  }

  /**
   * 切换wangEditorV5国际化
   * @param language string 可选值 en、zh-CN
   * @returns void
   */
  function changeWangeditorLanguage(language: string): void {
    i18nChangeLanguage(language);
  }

  return {
    title,
    device,
    layout,
    logout,
    routers,
    $storage,
    backHome,
    onPanel,
    changeTitle,
    toggleSideBar,
    menuSelect,
    handleResize,
    resolvePath,
    isCollapse,
    pureApp,
    username,
    staffName,
    avatarUrl,
    avatarsStyle,
    getDropdownItemStyle,
    getDropdownItemClass,
    changeWangeditorLanguage
  };
}
