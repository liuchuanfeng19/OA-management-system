import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 保存角色
export const saveRole = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Role/Save", {
    data
  });
};

// 获取角色管理列表
export const getRoleList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Role/GetList", {
    params
  });
};

// 根据功能项Id获取角色列表
export const getRoleListByFuncItemId = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Role/GetListByFuncItemId",
    {
      params
    }
  );
};

// 获取角色列表
export const getRoleListNv = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Role/GetListNv", {
    params
  });
};

// 删除角色
export const deleteRole = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Role/Delete", {
    data
  });
};
