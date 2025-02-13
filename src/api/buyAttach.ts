import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增采购附件
export const createBuyAttach = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyAttach/Create",
    {
      data
    }
  );
};

// 更新采购附件
export const updateBuyAttach = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyAttach/Update",
    {
      data
    }
  );
};

// 删除采购附件
export const deleteBuyAttach = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyAttach/Delete",
    {
      params
    }
  );
};

// 获取采购附件详情
export const getBuyAttach = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/BuyAttach/Get", {
    params
  });
};

// 采购附件列表
export const getListBuyAttach = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyAttach/GetList",
    {
      params
    }
  );
};

// 获取采购会签合同NV
export const GetJoinSignNVList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyAttach/GetJoinSignNVList",
    {
      params
    }
  );
};
