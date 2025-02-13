import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增通知规则
export const createNoticeRule = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeRule/Create",
    {
      data
    }
  );
};

// 更新通知规则
export const updateNoticeRule = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeRule/Update",
    {
      data
    }
  );
};

// 删除通知规则
export const deleteNoticeRule = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeRule/Delete",
    {
      params
    }
  );
};

// 获取通知规则详情
export const getNoticeRule = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/NoticeRule/Get", {
    params
  });
};

// 通知规则列表
export const getListNoticeRule = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeRule/GetList",
    {
      params
    }
  );
};

// 获取业务名称nv列表
export const getBusinessType = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeRule/GetBusinessType",
    {
      params
    }
  );
};

// 获取业务名称nv列表
export const getBNVList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeRule/GetBNVList",
    {
      params
    }
  );
};

// 获取首次提醒时间单位NV
export const getFirstUnitType = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeRule/GetFirstUnitType",
    {
      params
    }
  );
};

// 获取间隔提醒时间单位NV
export const getIntervalUnitType = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeRule/GetCycleUnitType",
    {
      params
    }
  );
};
