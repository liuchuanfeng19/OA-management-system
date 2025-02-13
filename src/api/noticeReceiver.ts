import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取接收通知列表
export const getNoticeReceiverList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeReceiver/GetList",
    {
      params
    }
  );
};

// 获取接收通知详情
export const getNoticeReceiver = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeReceiver/Get",
    {
      params
    }
  );
};

// 优先获取未读消息列表
export const getUnReadFirstNoticeReceiverList = (
  params?: object
): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeReceiver/GetUnReadFirstList",
    {
      params
    }
  );
};

// 仅获取未读消息列表
export const getUnReadNoticeReceiverList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeReceiver/GetUnReadList",
    {
      params
    }
  );
};

// 获取右上角消息列表
export const getUnReadNoticeViewReceiverList = (
  params?: object
): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeReceiver/GetUnReadViewList",
    {
      params
    }
  );
};

// 标记所有消息已读
export const MarkAllNoticeReceiverAsRead = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeReceiver/MarkAllAsRead",
    {
      params
    }
  );
};

// 标记单条消息已读
export const MarkOneNoticeReceiverAsRead = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeReceiver/MarkOneAsRead",
    {
      params
    }
  );
};

// 保存接收通知
export const addNoticeReceiver = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeReceiver/Create",
    {
      data
    }
  );
};

// 编辑接收通知
export const editNoticeReceiver = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeReceiver/Update",
    {
      data
    }
  );
};

// 删除接收通知
export const deleteNoticeReceiver = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NoticeReceiver/Delete",
    {
      params
    }
  );
};
