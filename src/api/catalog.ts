import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增类别
export const addCatalog = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Catalog/save", {
    data
  });
};

// 删除类别
export const deleteCatalog = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/Catalog/delete",
    {
      data
    }
  );
};

// 获取类别列表
export const getCatalogList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Catalog/List", {
    params
  });
};

// 根据类别key获取Name-Value格式类别列表
export const getCatalogNameValueListByKey = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Catalog/GetCatalogList",
    {
      params
    }
  );
};

// 获取类别树
export const getCatalogTree = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Catalog/Tree", {
    params
  });
};

// 获取类别详情
export const getCatalogDetail = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Catalog/Detail", {
    params
  });
};
