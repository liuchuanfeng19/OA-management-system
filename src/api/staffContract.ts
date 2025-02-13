import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取员工合同列表
export const getStaffContractList = (data: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffContract/GetList",
    {
      data
    }
  );
};

// 获取员工合同详情
export const getStaffContract = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffContract/Get",
    {
      params
    }
  );
};

// 保存员工合同
export const addStaffContract = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffContract/Create",
    {
      data
    }
  );
};

// 编辑员工合同
export const editStaffContract = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffContract/Update",
    {
      data
    }
  );
};

// 删除员工合同
export const deleteStaffContract = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffContract/Delete",
    {
      params
    }
  );
};

// 获取单个员工合同
export const getStaffContractByStaffId = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffContract/GetListByStaffId",
    {
      params
    }
  );
};
