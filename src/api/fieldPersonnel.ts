import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 添加
export const addOutAttendApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/OutAttendApply/Add",
    {
      data
    }
  );
};
// 更新
export const updateOutAttendApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/OutAttendApply/Update",
    {
      data
    }
  );
};

// 审核
export const approveOutAttendApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/OutAttendApply/Approve",
    {
      data
    }
  );
};

// 撤销
export const cancelOutAttendApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/OutAttendApply/Cancel",
    {
      data
    }
  );
};

// 获取列表
export const getOutAttendApplyPage = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OutAttendApply/GetPages",
    {
      params
    }
  );
};

// 获取详情
export const getOutAttendApplyDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OutAttendApply/GetOne",
    {
      params
    }
  );
};

// 删除
export const deleteOutAttendApply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OutAttendApply/Delete",
    {
      params
    }
  );
};
