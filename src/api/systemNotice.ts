import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增通知
export const createSystemNotice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SystemNotice/Create",
    {
      data
    }
  );
};

// 删除通知
export const deleteSystemNotice = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SystemNotice/Delete",
    {
      params
    }
  );
};

// 批量删除工作待办通知
export const batchDeleteSystemNotice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SystemNotice/BatchDelete",
    {
      data
    }
  );
};

// 标记全部已读
export const markAllAsRead = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SystemNotice/MarkAllAsRead",
    {
      params
    }
  );
};

// 标记单条已读
export const markOneAsRead = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SystemNotice/MarkOneAsRead",
    {
      params
    }
  );
};

// 获取通知详情
export const getSystemNoticeDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SystemNotice/Get",
    {
      params
    }
  );
};

// 获取通知列表
export const getSystemNoticeList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SystemNotice/GetList",
    {
      params
    }
  );
};

export const getUnReadViewList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SystemNotice/GetUnReadViewList",
    {
      params
    }
  );
};

// 优先获取未读消息列表
export const GetUnReadFirst = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SystemNotice/GetUnReadFirst",
    {
      params
    }
  );
};
