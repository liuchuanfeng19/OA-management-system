import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 原件借阅审核
export const approveProjDocLend = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjDocLend/Approve",
    {
      data
    }
  );
};

// 原件借阅取消/撤回
export const cancelProjDocLend = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjDocLend/Cancel",
    {
      data
    }
  );
};

// 原件借阅新增
export const createProjDocLend = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjDocLend/Create",
    {
      data
    }
  );
};

// 原件借阅更新
export const updateProjDocLend = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjDocLend/Update",
    {
      data
    }
  );
};

// 原件借阅删除
export const deleteProjDocLend = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjDocLend/Delete",
    {
      params
    }
  );
};

// 原件借阅获取详情
export const getProjDocLend = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjDocLend/Get",
    {
      params
    }
  );
};

// 原件借阅获取列表
export const getListProjDocLend = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjDocLend/GetList",
    {
      params
    }
  );
};

// 原件借阅获取资料列表NV
export const GetDocNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjDocLend/GetDocNV",
    {
      params
    }
  );
};

// 原件借阅借出
export const DoLend = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjDocLend/DoLend",
    {
      params
    }
  );
};

// 原件借阅归还
export const DoReturn = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjDocLend/DoReturn",
    {
      data
    }
  );
};
