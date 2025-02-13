import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取告警通知列表
export const getAlarmNoticeList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AlarmNotice/GetList",
    {
      params
    }
  );
};

// 获取告警通知详情
export const getAlarmNotice = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AlarmNotice/Get",
    {
      params
    }
  );
};

// 保存告警通知
export const addAlarmNotice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AlarmNotice/Create",
    {
      data
    }
  );
};

// 编辑告警通知
export const editAlarmNotice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AlarmNotice/Update",
    {
      data
    }
  );
};

// 删除告警通知
export const deleteAlarmNotice = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AlarmNotice/Delete",
    {
      params
    }
  );
};

// 获取所有预警类型
export const getAllAlarmTypes = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AlarmNotice/GetAllNoticeTypes",
    {
      params
    }
  );
};

// 获取首页预警通知
export const getAlarmNoticeHome = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AlarmNotice/GetQuickList",
    {
      params
    }
  );
};
