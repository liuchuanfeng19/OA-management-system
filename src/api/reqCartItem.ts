import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 下采单（购物车）新增
export const createReqCartItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqCartItem/Create",
    {
      data
    }
  );
};

// 下采单（购物车）批量新增（废弃？）
export const BatchCreate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqCartItem/BatchCreate",
    {
      data
    }
  );
};

// 下采单（购物车）批量新增（新接口）
export const BatchSaveOrUpdate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqCartItem/BatchSaveOrUpdate",
    {
      data
    }
  );
};

// 下采单（购物车）更新
export const UpdateReqCartItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqCartItem/Update",
    {
      data
    }
  );
};

// 下采单（购物车）销售合同选择明细后保存
export const SaveFromSellContractItems = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqCartItem/SaveFromSellContractItems",
    {
      data
    }
  );
};

// 下采单（购物车）删除
export const DeleteReqCartItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqCartItem/Delete",
    {
      params
    }
  );
};

// 下采单（购物车）获取详情
export const GetReqCartItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqCartItem/Get",
    {
      params
    }
  );
};

// 下采单（购物车）获取列表
export const GetListReqCartItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqCartItem/GetList",
    {
      params
    }
  );
};

// 下采单（购物车）获取列表NV
export const GetMyProjectListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqCartItem/GetMyProjectListNV",
    {
      params
    }
  );
};

/**
 * 导入
 * @param data
 * @returns
 */
export function importReqCartItem(data: object) {
  return http.request<any>(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqCartItem/Import",
    {
      data
    }
  );
}

// 下采单（购物车）获取销售清单列表（添加物资页面）
export const GetUnCartList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItem/GetUnCartList",
    {
      params
    }
  );
};
