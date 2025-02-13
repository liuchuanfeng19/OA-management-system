import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取备用金/专项资金付款记录列表
export const getFundPayRecordList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/FundPayRecord/GetList",
    {
      params
    }
  );
};

// 获取备用金/专项资金付款记录详情
export const getFundPayRecord = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/FundPayRecord/Get",
    {
      params
    }
  );
};

// 保存备用金/专项资金付款记录
export const addFundPayRecord = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/FundPayRecord/Create",
    {
      data
    }
  );
};

// 编辑备用金/专项资金付款记录
export const editFundPayRecord = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/FundPayRecord/Update",
    {
      data
    }
  );
};

// 删除备用金/专项资金付款记录
export const deleteFundPayRecord = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/FundPayRecord/Delete",
    {
      params
    }
  );
};
