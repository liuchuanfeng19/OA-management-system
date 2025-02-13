import { $t } from "@/plugins/i18n";

const editorRouter: RouteConfigsTable = {
  path: "/editor",
  redirect: "/editor/index",
  meta: {
    icon: "edit",
    title: $t("menus.hseditor"),
    rank: 2,
    // 不在menu菜单中显示
    showLink: false
  },
  children: [
    {
      path: "/editor/index/:id",
      name: "Editor",
      component: () => import("@/views/editor/index.vue"),
      meta: {
        title: $t("menus.hseditor"),
        keepAlive: true,
        // 不在menu菜单中显示
        showLink: false
      }
    }
  ]
};

export default editorRouter;
