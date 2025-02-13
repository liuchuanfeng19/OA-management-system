import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取投标单位列表
export const getBidCompanyList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReBidCompany/GetList",
    {
      params
    }
  );
};

// 获取投标单位NV列表
export const getBidCompanyNVList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReBidCompany/GetListNV",
    {
      params
    }
  );
};

// 获取投标单位详情
export const getBidCompany = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReBidCompany/Get",
    {
      params
    }
  );
};

// 保存投标单位
export const createBidCompany = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReBidCompany/Create",
    {
      data
    }
  );
};

// 编辑投标单位
export const updateBidCompany = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReBidCompany/Update",
    {
      data
    }
  );
};

// 删除投标单位
export const deleteBidCompany = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReBidCompany/Delete",
    {
      params
    }
  );
};
