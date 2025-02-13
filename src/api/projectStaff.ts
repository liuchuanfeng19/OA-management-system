import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增项目人员
export const addProjectStaff = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectStaff/Add",
    {
      data
    }
  );
};

// 删除项目人员
export const deleteProjectStaff = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectStaff/Delete",
    {
      data
    }
  );
};

// 修改项目人员
export const updateProjectStaff = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectStaff/Update",
    {
      data
    }
  );
};

// 修改单条项目人员
export const updateOneProjectStaff = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectStaff/UpdateOne",
    {
      data
    }
  );
};

// 获取项目人员列表
export const getListProjectStaff = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectStaff/GetPages",
    {
      params
    }
  );
};

// 获取项目人员详情
export const getProjectStaff = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectStaff/GetOne",
    {
      params
    }
  );
};
