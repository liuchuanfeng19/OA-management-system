import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 添加用车申请
export const addCarApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/Create",
    {
      data
    }
  );
};
// 修改用车申请
export const updateCarApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/Update",
    {
      data
    }
  );
};
// 审核用车申请
export const auditCarApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/Approve",
    {
      data
    }
  );
};

// 获取用车申请状态列表
export const getCarApplyStatus = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/GetLeaveTypesNV",
    {
      params
    }
  );
};

// 获取用车申请列表
export const getCarApplyList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/GetList",
    {
      params
    }
  );
};

// 获取用车申请详情
export const getCarApplyDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/Get",
    {
      params
    }
  );
};

// 删除角色
export const deleteCarApply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/Delete",
    {
      params
    }
  );
};

// 获取项目用车列表
export const GetPorjectCar = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/GetPorjectCar",
    {
      params
    }
  );
};
