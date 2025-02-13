import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取收货入库列表
export const getRecvInStockList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvInStock/GetList",
    {
      params
    }
  );
};

// 获取收货入库详情
export const getRecvInStock = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvInStock/Get",
    {
      params
    }
  );
};

// 获取所有收货入库状态
export const getInStockStatus = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvInStock/GetInStockStatus",
    {
      params
    }
  );
};

// 生成入库单号
export const genInStockCode = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvInStock/GenInStockCode",
    {
      params
    }
  );
};

// 保存收货入库
export const createRecvInStock = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvInStock/Create",
    {
      data
    }
  );
};

// 编辑收货入库
export const editRecvInStock = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvInStock/Update",
    {
      data
    }
  );
};

// 删除收货入库
export const deleteRecvInStock = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvInStock/Delete",
    {
      params
    }
  );
};

// 收货入库
export const doInStock = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvInStock/DoInStock",
    {
      data
    }
  );
};
