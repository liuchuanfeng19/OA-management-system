import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取项目信息列表
export const getProjectBidList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBid/GetList",
    {
      params
    }
  );
};

// 获取项目信息NV列表
export const getProjectBidNVList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBid/GetListNV",
    {
      params
    }
  );
};

// 获取招标NV列表
export const getProjectBidBiddingNVList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBid/GetBiddingListNV",
    {
      params
    }
  );
};

// 获取项目信息详情
export const getProjectBid = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/ProjectBid/Get", {
    params
  });
};

// 获取投标状态列表
export const getProjectBidStatus = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBid/GetProjectBidStatus",
    {
      params
    }
  );
};

// 保存项目信息
export const createProjectBid = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBid/Create",
    {
      data
    }
  );
};

// 编辑项目信息
export const updateProjectBid = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBid/Update",
    {
      data
    }
  );
};

// 更新项目状态
export const updateProjectBidStatus = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBid/UpdateBidStatus",
    {
      data
    }
  );
};

// 删除项目信息
export const deleteProjectBid = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBid/Delete",
    {
      params
    }
  );
};
