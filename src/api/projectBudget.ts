import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取项目收付款预算列表
export const getProjectBudgetList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBudget/GetList",
    {
      params
    }
  );
};

// 获取中标项目NV列表
export const getWinBidListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBudget/GetWinBidListNV",
    {
      params
    }
  );
};

// 获取项目性质列表
export const getProjectNatureType = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBudget/GetProjectNatureType",
    {
      params
    }
  );
};

// 获取项目收付款预算详情
export const getProjectBudget = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBudget/Get",
    {
      params
    }
  );
};

// 保存项目收付款预算
export const createProjectBudget = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBudget/Create",
    {
      data
    }
  );
};

// 编辑项目收付款预算
export const updateProjectBudget = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBudget/Update",
    {
      data
    }
  );
};

// 删除项目收付款预算
export const deleteProjectBudget = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectBudget/Delete",
    {
      params
    }
  );
};
