import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 添加合同模板
export const addSellContractTemplate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractTemplate/Create",
    {
      data
    }
  );
};
// 更新合同模板
export const updateSellContractTemplate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractTemplate/Update",
    {
      data
    }
  );
};

// 获取合同模板列表
export const getSellContractTemplateList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractTemplate/GetList",
    {
      params
    }
  );
};

// 获取模板详情
export const getSellContractTemplateDetail = (
  params?: object
): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractTemplate/Get",
    {
      params
    }
  );
};

// 删除模板
export const deleteSellContractTemplate = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractTemplate/Delete",
    {
      params
    }
  );
};
