import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取出库单列表
export const getOutStockList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OutStock/GetList",
    {
      params
    }
  );
};

// 获取出库单详情
export const getOutStock = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/OutStock/Get", {
    params
  });
};

// 获取所有出库单状态
export const getInStockStatus = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OutStock/GetInStockStatus",
    {
      params
    }
  );
};

// 生成出库单号
export const genInStockCode = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OutStock/GenInStockCode",
    {
      params
    }
  );
};

// 保存出库单
export const createOutStock = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/OutStock/Create",
    {
      data
    }
  );
};

// 编辑出库单
export const editOutStock = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/OutStock/Update",
    {
      data
    }
  );
};

// 删除出库单
export const deleteOutStock = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OutStock/Delete",
    {
      params
    }
  );
};

// 出库单
export const doInStock = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/OutStock/DoInStock",
    {
      data
    }
  );
};

// 获取出库明细
export const getItemsFromReqInvoice = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OutStock/GetItemsFromReqInvoice",
    {
      params
    }
  );
};

// 获取可出库明细
export const getAvailableItemsForManual = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OutStock/GetAvailableItemsForManual",
    {
      params
    }
  );
};

// 获取出库明细项目列表
export const getOutStockProjectListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OutStock/GetProjectListNV",
    {
      params
    }
  );
};

// 获取出库明细列表
export const getOutStockItems = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OutStock/GetItemsFromPss",
    {
      params
    }
  );
};

// 根据ID获取待出库明细
export const GetItemsFromPssEx = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/OutStock/GetItemsFromPssEx",
    {
      data
    }
  );
};
