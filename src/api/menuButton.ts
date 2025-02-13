import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取登录路由菜单列表
export const getRouterList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Func/GetMenuTree",
    {
      params
    }
  );
};

// 保存按钮权限
export const saveMenuButton = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Func/Save", {
    data
  });
};

//保存角色授权
export const saveForRole = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/Func/SaveForRole",
    {
      data
    }
  );
};

//保存用户配置
export const saveForUser = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/Func/SaveForUser",
    {
      data
    }
  );
};

// 删除按钮权限
export const deleteMenuButton = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Func/Delete", {
    data
  });
};

// 删除指定角色的所有按钮权限
export const deleteMenuButtonByRoleId = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/Func/DeleteByRoleId",
    {
      data
    }
  );
};

// 删除指定用户的所有按钮权限
export const deleteMenuButtonByUserId = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/Func/DeleteByUserId",
    {
      data
    }
  );
};

// 获取登录用户的按钮权限列表
export const getMenuButtonList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Func/GetFuncItems",
    {
      params
    }
  );
};

// 移除按钮权限
export const removeMenuButton = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Func/Remove", {
    data
  });
};
