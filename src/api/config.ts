import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增配置
export const addConfig = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Config/save", {
    data
  });
};

// 删除配置
export const deleteConfig = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Config/delete", {
    data
  });
};

// 获取配置列表
export const getConfigList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Config/List", {
    params
  });
};

// 获取KV类型列表
export const getKvTypeList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Config/GetKvTypeList",
    {
      params
    }
  );
};

// 根据配置key获取Name-Value格式配置列表
export const getConfigNameValueListByKey = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Config/GetConfigList",
    {
      params
    }
  );
};

// 根据配置key获取配置列表
export const getConfigListByKey = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Config/ConfigList",
    {
      params
    }
  );
};

// 获取配置详情
export const getConfigDetail = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Config/Detail", {
    params
  });
};
