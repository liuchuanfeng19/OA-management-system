import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增驾驶员
export const createDriver = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarDriverInformation/Create",
    {
      data
    }
  );
};

// 删除驾驶员
export const deleteDriver = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarDriverInformation/Delete",
    {
      params
    }
  );
};

// 获取驾驶员详情
export const getDriverDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarDriverInformation/Get",
    {
      params
    }
  );
};

// 获取驾驶员列表
export const getDriverList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarDriverInformation/GetList",
    {
      params
    }
  );
};

// 更新驾驶员
export const updateDriver = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarDriverInformation/Update",
    {
      data
    }
  );
};

// 获取驾驶员状态列表
export const getDriverStatusList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") +
      "/api/CarDriverInformation/GetDriverStatusTypesNV",
    {
      params
    }
  );
};
