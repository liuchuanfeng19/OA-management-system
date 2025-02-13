import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取中标项目信息列表
export const getProjectWinBidList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectWinBid/GetList",
    {
      params
    }
  );
};

// 获取中标项目信息列表name-value
export const getProjectWinBidNVList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectWinBid/GetListNV",
    {
      params
    }
  );
};

// 获取中标项目信息详情
export const getProjectWinBid = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectWinBid/Get",
    {
      params
    }
  );
};

// 保存中标项目信息
export const createProjectWinBid = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectWinBid/Create",
    {
      data
    }
  );
};

// 编辑中标项目信息
export const updateProjectWinBid = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectWinBid/Update",
    {
      data
    }
  );
};

// 删除中标项目信息
export const deleteProjectWinBid = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectWinBid/Delete",
    {
      params
    }
  );
};

// 获取中标项目信息列表NV
export const GetListNVForApp = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectWinBid/GetListNVForApp",
    {
      params
    }
  );
};

// 获取中标项目进度NV
export const GetProgressStatusNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectWinBid/GetProgressStatusNV",
    {
      params
    }
  );
};

// 根据项目进度获取中标项目NV
export const GetListNVForApp2 = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectWinBid/GetListNVForApp",
    {
      params
    }
  );
};
