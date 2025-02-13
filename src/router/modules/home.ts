import { $t } from "@/plugins/i18n";

const Layout = () => import("@/layout/index.vue");

const homeRouter: RouteConfigsTable = {
  path: "/",
  name: "Home",
  component: Layout,
  redirect: "/welcome",
  meta: {
    icon: "home-filled",
    title: $t("menus.hshome"),
    rank: 0
  },
  children: [
    {
      path: "/welcome",
      name: "Welcome",
      component: () => import("@/views/welcome/index.vue"),
      meta: {
        icon: "home-filled",
        title: $t("menus.hshome")
      }
    },
    {
      path: "/personalCenter",
      name: "PersonalCenter",
      component: () => import("@/views/system/personalCenter/index.vue"),
      meta: {
        title: $t("menus.hsPersonalCenter"),
        showLink: false
      }
    },
    {
      path: "/oa/design/index",
      name: "OADesign",
      component: () => import("@/views/oa/design/index.vue"),
      meta: {
        title: "表单流程设计",
        showLink: false
      }
    },
    {
      path: "/administration/project/tend/tenderDetail",
      name: "TenderDetail",
      component: () =>
        import("@/views/administration/project/tend/businesstender/detail.vue"),
      meta: {
        title: $t("menus.hseditor"),
        keepAlive: false,
        // 不在menu菜单中显示
        showLink: false
      }
    },
    {
      path: "/purchasing/PurchasList",
      name: "PurchasList",
      component: () => import("@/views/purchasing/picklist/list.vue"),
      meta: {
        title: "物资列表",
        keepAlive: false,
        // 不在menu菜单中显示
        showLink: false
      }
    },
    {
      path: "/administration/project/tend/tenderJoinDetail",
      name: "TenderJoinDetail",
      component: () =>
        import("@/views/administration/project/tend/tenderremind/detail.vue"),
      meta: {
        title: $t("menus.hseditor"),
        keepAlive: false,
        // 不在menu菜单中显示
        showLink: false
      }
    },

    //通知查看
    {
      path: "/personnel/noticeDetail",
      name: "NoticeDetail",
      component: () => import("@/views/personnel/notice/detail.vue"),
      meta: {
        title: $t("menus.hseditor"),
        keepAlive: false,
        // 不在menu菜单中显示
        showLink: false
      }
    },

    //员工管理
    {
      path: "/personnel/employeeInformationDetail",
      name: "EmployeeInformationDetail",
      component: () =>
        import("@/views/personnel/employeeInformation/detail.vue"),
      meta: {
        title: $t("menus.hseditor"),
        keepAlive: false,
        // 不在menu菜单中显示
        showLink: false
      }
    },

    //项目考勤管理
    {
      path: "/personnel/attendance/ProjectAttendanceDetail",
      name: "ProjectAttendanceDetail",
      component: () =>
        import("@/views/personnel/attendance/projectAttendance/detail.vue"),
      meta: {
        title: $t("menus.hseditor"),
        keepAlive: false,
        // 不在menu菜单中显示
        showLink: false
      }
    },

    //考勤设置
    {
      path: "/personnel/attendance/setUp",
      name: "AttendanceSetUp",
      component: () => import("@/views/personnel/attendance/setUp/index.vue"),
      meta: {
        title: "考勤设置",
        keepAlive: false,
        // 不在menu菜单中显示
        showLink: false
      }
    },
    {
      path: "/system/workFlow1",
      name: "workFlow1",
      meta: {
        title: "审批流程",
        keepAlive: false,
        // 不在menu菜单中显示
        showLink: false
      }
    }
  ]
};

export default homeRouter;
