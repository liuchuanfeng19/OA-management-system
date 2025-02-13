import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增通知
export const createNotice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/StaffNotice/Create",
    {
      data
    }
  );
};

// 删除通知
export const deleteNotice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/StaffNotice/Delete",
    {
      data
    }
  );
};

// 标记全部已读
export const markAllAsRead = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/StaffNotice/MarkAllAsRead",
    {
      params
    }
  );
};

// 获取通知详情
export const getNoticeDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/StaffNotice/Get",
    {
      params
    }
  );
};

// 获取通知列表
export const getNoticeList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/StaffNotice/GetList",
    {
      params
    }
  );
};

export const getUnReadViewList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/StaffNotice/GetUnReadViewList",
    {
      params
    }
  );
};

// 新增公告
export const createAnnounce = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffAnnounce/Create",
    {
      data
    }
  );
};

// 更新公告
export const Update = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffAnnounce/Update",
    {
      data
    }
  );
};

// 删除公告
export const deleteAnnounce = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffAnnounce/Delete",
    {
      params
    }
  );
};

// 获取公告详情
export const getAnnounceDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffAnnounce/Get",
    {
      params
    }
  );
};

// 获取公告列表
export const getAnnounceList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffAnnounce/GetList",
    {
      params
    }
  );
};

// 优先获取未读消息列表
export const GetUnReadFirst = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/StaffNotice/GetUnReadFirst",
    {
      params
    }
  );
};
