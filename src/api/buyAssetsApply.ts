import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 审核
export const BuyAssetsApplyApprove = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyAssetsApply/Approve",
    {
      data
    }
  );
};

// 取消
export const BuyAssetsApplyCancel = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyAssetsApply/Cancel",
    {
      data
    }
  );
};

// 新增
export const BuyAssetsCreate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyAssetsApply/Create",
    {
      data
    }
  );
};

// 更新
export const BuyAssetsUpdate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyAssetsApply/Update",
    {
      data
    }
  );
};

// 删除
export const BuyAssetsApplyDelete = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyAssetsApply/Delete",
    {
      params
    }
  );
};

// 获取详情
export const getBuyAssetsApply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyAssetsApply/Get",
    {
      params
    }
  );
};

// 列表
export const getListBuyAssetsApply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyAssetsApply/GetList",
    {
      params
    }
  );
};

// 类型NV
export const GetBuyAssetsTypeNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyAssetsApply/GetBuyAssetsTypeNV",
    {
      params
    }
  );
};

// 入库
export const InStock = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyAssetsApply/InStock",
    {
      params
    }
  );
};
