import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取开票单位列表
export const getInvoiceCompanyList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/InvoiceCompany/GetList",
    {
      params
    }
  );
};

// 获取开票单位NV列表
export const getInvoiceCompanyNVList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/InvoiceCompany/GetListNV",
    {
      params
    }
  );
};

// 获取中标项目NV列表
export const getWinBidListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/InvoiceCompany/GetWinBidListNV",
    {
      params
    }
  );
};

// 获取开票单位详情
export const getInvoiceCompany = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/InvoiceCompany/Get",
    {
      params
    }
  );
};

// 获取发票种类
export const getInvoiceType = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/InvoiceCompany/GetInvoiceType",
    {
      params
    }
  );
};

// 保存开票单位
export const createInvoiceCompany = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/InvoiceCompany/Create",
    {
      data
    }
  );
};

// 编辑开票单位
export const updateInvoiceCompany = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/InvoiceCompany/Update",
    {
      data
    }
  );
};

// 删除开票单位
export const deleteInvoiceCompany = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/InvoiceCompany/Delete",
    {
      params
    }
  );
};
