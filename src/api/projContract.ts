import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增主合同
export const CreatePrimary = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/CreatePrimary",
    {
      data
    }
  );
};

// 新增补充合同
export const CreateSecondary = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/CreateSecondary",
    {
      data
    }
  );
};

// 删除合同
export const DeleteContract = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/Delete",
    {
      params
    }
  );
};

// 获取合同列表
export const GetContractList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/GetList",
    {
      params
    }
  );
};

// 获取主合同详情信息
export const GetPrimary = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/GetPrimary",
    {
      params
    }
  );
};

// // 获取补充合同详情信息
export const GetSecondary = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/GetSecondary",
    {
      params
    }
  );
};

// 更新补充合同
export const UpdateSecondary = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/UpdateSecondary",
    {
      data
    }
  );
};

// 更新主合同
export const UpdatePrimary = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/UpdatePrimary",
    {
      data
    }
  );
};

// 获取主合同编号列表NV
export const getListCodePrimaryNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/GetListCodePrimaryNV",
    {
      params
    }
  );
};

// 获取主合同列表NV
export const GetListPrimaryNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/GetListPrimaryNV",
    {
      params
    }
  );
};

// 获取补充合同列表NV
export const GetListSecondaryNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/GetListSecondaryNV",
    {
      params
    }
  );
};

// 获取所有合同类型NV
export const GetProjContractTypeNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/GetProjContractTypeNV",
    {
      params
    }
  );
};
