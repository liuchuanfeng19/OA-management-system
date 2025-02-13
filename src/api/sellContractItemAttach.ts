import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取物资合同清单列表
export const getSellContractItemAttachList = (
  params?: object
): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItemAttach/GetList",
    {
      params
    }
  );
};

// 获取物资合同清单NV列表
export const getSellContractItemAttachNVList = (
  params?: object
): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItemAttach/GetListNV",
    {
      params
    }
  );
};

// 根据项目Id获取销售合同NV列表
export const getSellContractNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItemAttach/GetSellContractNV",
    {
      params
    }
  );
};

// 获取物资合同清单详情
export const getSellContractItemAttach = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItemAttach/Get",
    {
      params
    }
  );
};

// 解析物资合同清单/销售合同清单
export const analyzeContractItemFile = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") +
      "/api/SellContractItemAttach/AnalyzeContractItemFile",
    {
      data
    }
  );
};

// 保存物资合同清单
export const createSellContractItemAttach = (data: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItemAttach/Create",
    {
      data
    }
  );
};

// 绑定物资合同清单
export const updateFieldMapping = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItemAttach/UpdateFieldMapping",
    {
      data
    }
  );
};

// 编辑物资合同清单
export const updateSellContractItemAttach = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItemAttach/Update",
    {
      data
    }
  );
};

// 删除物资合同清单
export const deleteSellContractItemAttach = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItemAttach/Delete",
    {
      params
    }
  );
};
