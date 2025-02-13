import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取站点列表
export const getSiteList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Site/GetList", {
    params
  });
};

// 获取站点NV列表
export const getSiteNVList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Site/GetListNV", {
    params
  });
};

// 获取站点详情
export const getSite = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Site/Get", {
    params
  });
};

// 保存站点
export const addSite = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/Site/Create", {
    data
  });
};

// 编辑站点
export const editSite = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/Site/Update", {
    data
  });
};

// 删除站点
export const deleteSite = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Site/Delete", {
    params
  });
};
