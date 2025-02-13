import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取发货签收单明细列表
export const getRecvSignItemList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSignItem/GetList",
    {
      params
    }
  );
};

// 获取发货签收单明细详情
export const getRecvSignItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSignItem/Get",
    {
      params
    }
  );
};

// 保存发货签收单明细
export const addRecvSignItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSignItem/Create",
    {
      data
    }
  );
};

// 编辑发货签收单明细
export const editRecvSignItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSignItem/Update",
    {
      data
    }
  );
};

// 删除发货签收单明细
export const deleteRecvSignItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSignItem/Delete",
    {
      params
    }
  );
};

// 获取收货状态列表
export const getRecvItemStatus = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSignItem/GetRecvItemStatus",
    {
      params
    }
  );
};

// 标记未收货/未签收
export const unRecvSignItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSignItem/UnRecv",
    {
      data
    }
  );
};

// 标记收货/签收
export const doRecvSignItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSignItem/DoRecv",
    {
      data
    }
  );
};
