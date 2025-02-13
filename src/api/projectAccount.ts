import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增甲方合同台账
export const CreateSellContract = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContract/Create",
    {
      data
    }
  );
};

// 更新甲方合同台账
export const UpdateSellContract = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContract/Update",
    {
      data
    }
  );
};

// 删除甲方合同台账
export const DeleteSellContract = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContract/Delete",
    {
      params
    }
  );
};

// 获取甲方合同台账详情
export const GetSellContract = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContract/Get",
    {
      params
    }
  );
};

// 获取甲方合同台账列表
export const GetSellContractList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContract/GetList",
    {
      params
    }
  );
};

// 根据ID获取销售合同NV
export const getSellContractListNVByProjectId = (
  params?: object
): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContract/GetListNVByProjectId",
    {
      params
    }
  );
};

// 获取销售合同类型
export const GetSellContractType = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContract/GetSellContractType",
    {
      params
    }
  );
};
