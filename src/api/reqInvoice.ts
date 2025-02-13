import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取发票列表
export const getReqInvoiceList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqInvoice/GetList",
    {
      params
    }
  );
};

// 获取项目列表
export const getReqInvoiceProjectList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqInvoice/GetProjectListNV",
    {
      params
    }
  );
};

// 获取发票详情
export const getReqInvoice = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/ReqInvoice/Get", {
    params
  });
};

// 保存发票
export const createReqInvoice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqInvoice/Create",
    {
      data
    }
  );
};

// 审核发票
export const auditReqInvoice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqInvoice/Approve",
    {
      data
    }
  );
};

// 编辑发票
export const editReqInvoice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqInvoice/Update",
    {
      data
    }
  );
};

// 删除发票
export const deleteReqInvoice = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqInvoice/Delete",
    {
      params
    }
  );
};

// 是否已收款
export const UpdateCollected = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqInvoice/UpdateCollected",
    {
      params
    }
  );
};
