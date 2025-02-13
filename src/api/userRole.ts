import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 保存角色
export const setRole = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/UserRole/SetRole",
    {
      data
    }
  );
};

//获取单个用户信息
export const getUserRole = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/UserRole/Get", {
    params
  });
};

// 删除指定角色关系
export const removeUserRole = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/UserRole/Remove",
    {
      data
    }
  );
};
