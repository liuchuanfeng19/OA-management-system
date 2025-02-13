import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取投标单位明细列表
export const getProjectItemList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectItem/GetList",
    {
      params
    }
  );
};

// 获取投标单位明细NV列表
export const getProjectItemNVList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectItem/GetListNV",
    {
      params
    }
  );
};

// 获取投标单位明细详情
export const getProjectItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectItem/Get",
    {
      params
    }
  );
};

// 获取投标单位明细附件详情
export const getAttach = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectItem/GetAttach",
    {
      params
    }
  );
};

// 保存投标单位明细
export const createProjectItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectItem/Create",
    {
      data
    }
  );
};

// 编辑投标单位明细
export const updateProjectItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectItem/Update",
    {
      data
    }
  );
};

// 删除投标单位明细
export const deleteProjectItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectItem/Delete",
    {
      params
    }
  );
};
