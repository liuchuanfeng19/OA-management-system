import { http, getBaseUrl } from "@/utils/http";

// 获取动态菜单列表
export const getAsyncRoutes = (params?: object) => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Func/GetMenuTree",
    {
      params
    }
  );
};
