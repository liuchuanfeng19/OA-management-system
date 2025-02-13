import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 根据菜单Id获取按钮列表
export const getButtonListByMenuId = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/FuncItem/ListByMenuId",
    {
      params
    }
  );
};

// 获取角色授权列表
export const getListByRoleId = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/FuncItem/GetFuncItemListByRoleId",
    {
      params
    }
  );
};

// 获取角色授权列表
export const getListByUserId = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/FuncItem/GetFuncItemListByUserId",
    {
      params
    }
  );
};

// 保存按钮
export const saveButton = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/FuncItem/Save", {
    data
  });
};

// 删除角色
export const deleteButton = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/FuncItem/Delete",
    {
      data
    }
  );
};
