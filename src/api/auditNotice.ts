import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取工作待办通知列表
export const getAuditNoticeList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AuditNotice/GetList",
    {
      params
    }
  );
};

// 获取工作待办通知详情
export const getAuditNotice = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AuditNotice/Get",
    {
      params
    }
  );
};

// 保存工作待办通知
export const addAuditNotice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AuditNotice/Create",
    {
      data
    }
  );
};

// 编辑工作待办通知
export const editAuditNotice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AuditNotice/Update",
    {
      data
    }
  );
};

// 删除工作待办通知
export const deleteAuditNotice = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AuditNotice/Delete",
    {
      params
    }
  );
};

// 批量删除工作待办通知
export const batchDeleteAuditNotice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AuditNotice/BatchDelete",
    {
      data
    }
  );
};

// 优先获取未处理工作待办通知列表
export const getUnProcessedFirstAuditNoticeList = (
  params?: object
): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AuditNotice/GetUnProcessedFirstList",
    {
      params
    }
  );
};

// 仅获取未处理工作待办通知列表
export const getUnProcessedAuditNoticeList = (
  params?: object
): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AuditNotice/GetUnProcessedList",
    {
      params
    }
  );
};

// 获取审核类型NV列表
export const getAuditTypesNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AuditNotice/GetAuditTypesNV",
    {
      params
    }
  );
};

// 获取首页日程通知
export const getAuditNoticeHome = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AuditNotice/GetQuickList",
    {
      params
    }
  );
};

// 申请人标记申请为已处理
export const markAsProcessed = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AuditNotice/MarkAsProcessed",
    {
      params
    }
  );
};

// 记录标记为不显示
export const markAsNotDisplay = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AuditNotice/MarkAsNotDisplay",
    {
      params
    }
  );
};
