import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 待领采购单-领取
export const DoCollect = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrderItem/DoCollect",
    {
      data
    }
  );
};

// 我的待采单删除
export const DeleteReqOrderItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrderItem/Delete",
    {
      params
    }
  );
};

// 待领/我的待采-获取详情
export const GetReqOrderItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrderItem/Get",
    {
      params
    }
  );
};

// 待领采购单-获取列表
export const GetListReqOrderItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrderItem/GetList",
    {
      params
    }
  );
};

// 我的待采单-获取列表
export const GetMyListReqOrderItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrderItem/GetMyList",
    {
      params
    }
  );
};

// 我的待采单-更新
export const UpdateReqOrderItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrderItem/Update",
    {
      data
    }
  );
};

// 获取选择下采项列表
export const getCartList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrderItem/GetCartList",
    {
      params
    }
  );
};

// 加至下采项列表接口
export const selectReqOrderItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrderItem/BatchSaveOrUpdate",
    {
      data
    }
  );
};

// 我的待采单页面接口重构
// 我的待采单列表
export const getMyCollectItemList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/MyCollectItem/GetList",
    {
      params
    }
  );
};
// 我的待采单详情
export const getMyCollectItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/MyCollectItem/Get",
    {
      params
    }
  );
};
// 我的待采单页面 新建一条待采项
export const createCollectItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/MyCollectItem/Create",
    {
      data
    }
  );
};
// 我的待采单页面 领取待采项
export const doCollectItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/MyCollectItem/DoCollect",
    {
      data
    }
  );
};
// 我的待采单页面 待采项退回
export const unCollectItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/MyCollectItem/UnCollect",
    {
      params
    }
  );
};
// 我的待采单页面 待采项删除
export const deleteCollectItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/MyCollectItem/Delete",
    {
      params
    }
  );
};
// 我的待采单页面 更新一天待采项
export const updateCollectItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/MyCollectItem/Update",
    {
      data
    }
  );
};

// 我的待采单页面 导入
export const importCollectItem = (param, data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") +
      "/api/MyCollectItem/Import?projectId=" +
      param.projectId,
    {
      data
    }
  );
};
