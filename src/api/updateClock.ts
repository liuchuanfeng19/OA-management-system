import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 添加
export const addAttendFixRecord = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendFixRecord/Create",
    {
      data
    }
  );
};
// 更新
export const updateAttendFixRecord = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendFixRecord/Update",
    {
      data
    }
  );
};

// 审核
export const approveAttendFixRecord = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendFixRecord/Approve",
    {
      data
    }
  );
};

// 撤销
export const cancelAttendFixRecord = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendFixRecord/Cancel",
    {
      data
    }
  );
};

// 获取列表
export const getAttendFixRecordList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendFixRecord/GetList",
    {
      params
    }
  );
};

// 获取详情
export const getAttendFixRecordDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendFixRecord/Get",
    {
      params
    }
  );
};

// 删除
export const deleteAttendFixRecord = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendFixRecord/Delete",
    {
      params
    }
  );
};
