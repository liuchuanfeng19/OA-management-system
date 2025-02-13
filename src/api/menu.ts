import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 保存菜单
export const saveMenu = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Menu/Save", {
    data
  });
};

// 删除菜单
export const deleteMenu = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Menu/Delete", {
    data
  });
};

// 获取菜单管理列表
export const getMeunTree = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Menu/GetTree", {
    params
  });
};

// 根据id获取菜单详情
export const getMeunByID = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Menu/Get", {
    params
  });
};

// 获取菜单一级
export const get1StMenuList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Menu/Get1StMenuList ",
    {
      params
    }
  );
};

// 根据父级id获取子级菜单
export const get1StSubMenuListById = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Menu/Get1StSubMenuListById",
    {
      params
    }
  );
};
