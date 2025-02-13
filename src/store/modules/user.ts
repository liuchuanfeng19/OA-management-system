import md5 from "@/utils/md5";
import { store } from "@/store";
import type { userType } from "./types";
import { defineStore } from "pinia";
import { ElMessage } from "element-plus";
import { router, resetRouter } from "@/router";
import { routerArrays } from "@/layout/types";
import { storageSession } from "@pureadmin/utils";
import { getMenuButtonList } from "@/api/menuButton";
import type { PureHttpResponseData } from "@/utils/http/types.d";
import { getToken, setToken, removeToken } from "@/utils/auth";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { getLogin, getUserInfo, refreshToken, loginOut } from "@/api/user";

export const useUserStore = defineStore({
  id: "pure-user",
  state: (): userType => ({
    userId: "",
    staffId: "",
    staffName: "",
    departmentId: "",
    departmentName: "",
    departmentCode: "",
    userCode: "",
    userName: "",
    avatarUrl: "",
    roleList: [
      // {
      //   id: "fd0cb26b-6dba-11e6-a526-00155d3a74aa",
      //   userId: "9472dfc2-477f-46c5-9383-1e512cad990a",
      //   roleName: "系统管理员",
      //   roleCode: "Administrator"
      // }
    ],
    token: getToken()?.accessToken,
    name: getToken()?.name ?? "admin",
    // 前端生成的验证码（按实际需求替换）
    verifyCode: "",
    // 登录显示组件判断 0：登录 1：手机登录 2：二维码登录 3：注册 4：忘记密码，默认0：登录
    currentPage: 0,
    buttons: []
  }),
  actions: {
    SET_USER_ID(userId) {
      this.userId = userId;
    },
    SET_STAFF_ID(staffId) {
      this.staffId = staffId;
    },
    SET_STAFF_NAME(staffName) {
      this.staffName = staffName;
    },
    SET_DEPARTMENT_ID(departmentId) {
      this.departmentId = departmentId;
    },
    SET_DEPARTMENT_NAME(departmentName) {
      this.departmentName = departmentName;
    },
    SET_DEPARTMENT_CODE(departmentCode) {
      this.departmentCode = departmentCode;
    },
    SET_USER_CODE(userCode) {
      this.userCode = userCode;
    },
    SET_USER_NAME(userName) {
      this.userName = userName;
    },
    SET_AVATAR_URL(avatarUrl) {
      this.avatarUrl = avatarUrl;
    },
    SET_ROLE_LIST(roleList) {
      this.roleList = roleList;
    },
    SET_TOKEN(token) {
      this.token = token;
    },
    SET_NAME(name) {
      this.name = name;
    },
    SET_VERIFYCODE(verifyCode) {
      this.verifyCode = verifyCode;
    },
    SET_CURRENTPAGE(value) {
      this.currentPage = value;
    },
    SET_BUTTONS(value) {
      this.buttons = value || [];
    },

    /** 登入 */
    async loginByUsername(data) {
      return new Promise<PureHttpResponseData>((resolve, reject) => {
        getLogin({
          loginName: data.username,
          password: md5(data.username, data.password)
        })
          .then((data: PureHttpResponseData) => {
            console.log("data", data);
            if (data.code == 0) {
              setToken(data);
            }
            resolve(data);
          })
          .catch(error => {
            reject(error);
          });
      });
    },
    /** 登出 清空缓存 */
    logOut() {
      loginOut({})
        .then((data: PureHttpResponseData) => {
          console.log("data", data);
          if (data.code == 0) {
            ElMessage.success(data.message);
            this.token = "";
            this.name = "";
            removeToken();
            storageSession().clear();
            useMultiTagsStoreHook().handleTags("equal", [...routerArrays]);
            resetRouter();
            router.push("/login");
            window.location.reload();
          }
        })
        .catch(() => {});
    },
    /**
     * @description 重置token、roles、permission、router、tabsBar等
     */
    async resetAll() {
      this.token = "";
      this.name = "";
      removeToken();
      storageSession().clear();
      useMultiTagsStoreHook().handleTags("equal", [
        {
          path: "/welcome",
          parentPath: "/",
          meta: {
            title: "menus.hshome",
            icon: "home-filled"
          }
        }
      ]);

      // this.setToken(null);
      // this.setUsername("游客");
      // this.setAvatar("https://i.gtimg.cn/club/item/face/img/2/15922_100.gif");

      // const aclStore = useAclStore();
      // const routesStore = useRoutesStore();
      // const tabsStore = useTabsStore();
      // aclStore.setFull(false);
      // aclStore.setRole([]);
      // aclStore.setPermission([]);
      // routesStore.clearRoutes();
      // tabsStore.delAllVisitedRoutes();
      // await resetRouter();
      // removeToken();
    },
    /** 刷新token */
    async refreshToken(params) {
      return new Promise<PureHttpResponseData>((resolve, reject) => {
        refreshToken(params)
          .then((data: PureHttpResponseData) => {
            console.log("data", data);
            if (data.code == 0) {
              setToken(data);
              resolve(data);
            }
          })
          .catch(err => {
            reject(err);
          });
      });
    },
    // 获取登录用户的按钮权限列表
    async getButtons() {
      const { data } = await getMenuButtonList({ platform: "OAWeb" });
      this.SET_BUTTONS(data);
    },
    // 获取登录用户信息
    async getUserInfo() {
      const { data } = await getUserInfo();
      console.log("getUserInfo data", data);
      // const userInfo = {
      //   userId: "9472dfc2-477f-46c5-9383-1e512cad990a",
      //   staffId: "9472dfc2-477f-46c5-9383-1e512cad9911",
      //   departmentId: "ac8bef88-905f-4b57-81ca-9fe4d5ae8e6d",
      //   departmentName: "技术部",
      //   departmentCode: "TYKJ-JSB",
      //   userCode: "18125694028",
      //   userName: "admin",
      //   staffName: "管理员",
      //   avatarUrl:
      //     "http://192.168.8.200:9092/oss-sz-1/UserAvatar/%e4%b8%8b%e8%bd%bd%20(3).png",
      //   roleList: [
      //     {
      //       id: "fd0cb26b-6dba-11e6-a526-00155d3a74aa",
      //       userId: "9472dfc2-477f-46c5-9383-1e512cad990a",
      //       roleName: "系统管理员",
      //       roleCode: "Administrator"
      //     }
      //   ]
      // };
      this.SET_USER_ID(data["userId"]);
      this.SET_STAFF_ID(data["staffId"]);
      this.SET_STAFF_NAME(data["staffName"]);
      this.SET_DEPARTMENT_ID(data["departmentId"]);
      this.SET_DEPARTMENT_NAME(data["departmentName"]);
      this.SET_DEPARTMENT_CODE(data["departmentCode"]);
      this.SET_USER_CODE(data["userCode"]);
      this.SET_USER_NAME(data["userName"]);
      this.SET_USER_NAME(data["userName"]);
      this.SET_AVATAR_URL(data["avatarUrl"]);
      this.SET_ROLE_LIST(data["roleList"]);
    }
  }
});

export function useUserStoreHook() {
  return useUserStore(store);
}
