import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 添加
export const addExtraWork = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ExtraWork/Create",
    {
      data
    }
  );
};
// 更新
export const updateExtraWork = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ExtraWork/Update",
    {
      data
    }
  );
};

// 审核
export const approveExtraWork = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ExtraWork/Approve",
    {
      data
    }
  );
};

// 撤销
export const cancelExtraWork = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ExtraWork/Cancel",
    {
      data
    }
  );
};

// 获取列表
export const getExtraWorkList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ExtraWork/GetExtraWorkList",
    {
      params
    }
  );
};
// 获取抄送人列表
export const getCcStaffListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ExtraWork/GetCcStaffListNV",
    {
      params
    }
  );
};

// 获取详情
export const getExtraWorkDetail = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/ExtraWork/Get", {
    params
  });
};

// 删除
export const deleteExtraWork = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ExtraWork/Delete",
    {
      params
    }
  );
};
// 计算时间
export const calcTimeExtraWork = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ExtraWork/CalcTime",
    {
      data
    }
  );
};
