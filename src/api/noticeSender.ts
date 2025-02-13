import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增通知公告
export const createNoticeSender = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeSender/Create",
    {
      data
    }
  );
};

// 删除通知公告
export const deleteNoticeSender = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeSender/Delete",
    {
      params
    }
  );
};

//获取通知公告详情
export const getNoticeSender = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeSender/Get",
    {
      params
    }
  );
};

// 获取通知公告列表
export const getNoticeSenderList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeSender/GetList",
    {
      params
    }
  );
};

// 更新通知公告
export const updateNoticeSender = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeSender/Update",
    {
      data
    }
  );
};
