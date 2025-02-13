import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 报名费/投标保证金审核
export const approveProjRegister = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjRegister/Approve",
    {
      data
    }
  );
};

// 报名费/投标保证金取消/撤回
export const cancelProjRegister = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjRegister/Cancel",
    {
      data
    }
  );
};

// 报名费/投标保证金新增
export const createProjRegister = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjRegister/Create",
    {
      data
    }
  );
};

// 报名费/投标保证金更新
export const updateProjRegister = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjRegister/Update",
    {
      data
    }
  );
};

// 报名费/投标保证金删除
export const deleteProjRegister = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjRegister/Delete",
    {
      params
    }
  );
};

// 报名费/投标保证金获取详情
export const getProjRegister = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjRegister/Get",
    {
      params
    }
  );
};

// 报名费/投标保证金获取列表
export const getListProjRegister = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjRegister/GetList",
    {
      params
    }
  );
};

// 报名费/投标保证金底单上传
export const projRegisterUpdateAttach = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjRegister/UpdateAttach",
    {
      data
    }
  );
};

// 报名费/投标保证金更新办理状态
export const UpdateProcessType = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjRegister/UpdateProcessType",
    {
      data
    }
  );
};

// 报名费/投标保证金更新应退回日期
export const UpdateReturnTime = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjRegister/UpdateReturnTime",
    {
      data
    }
  );
};

// 报名费/投标保证金办理状态NV
export const GetProjRegisterProcessTypeNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjRegister/GetProjRegisterProcessTypeNV",
    {
      params
    }
  );
};

//  ----资信证明------------------------------------------------------------------

// 资信证明审核
export const approveProjCredit = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCredit/Approve",
    {
      data
    }
  );
};

// 资信证明取消/撤回
export const cancelProjCredit = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCredit/Cancel",
    {
      data
    }
  );
};

// 资信证明新增
export const createProjCredit = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCredit/Create",
    {
      data
    }
  );
};

// 资信证明更新
export const updateProjCredit = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCredit/Update",
    {
      data
    }
  );
};

// 资信证明删除
export const deleteProjCredit = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCredit/Delete",
    {
      params
    }
  );
};

// 资信证明获取详情
export const getProjCredit = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/ProjCredit/Get", {
    params
  });
};

// 资信证明获取列表
export const getListProjCredit = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCredit/GetList",
    {
      params
    }
  );
};

//资信证明财务办理
export const DoHandle = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCredit/DoHandle",
    {
      params
    }
  );
};

// 资信证明底单上传
export const updateAttach = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCredit/UpdateAttach",
    {
      data
    }
  );
};
