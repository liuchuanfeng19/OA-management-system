import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取备用金/专项资金列表
export const getFundApplyList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/FundApply/GetList",
    {
      params
    }
  );
};

// 获取备用金/专项资金详情
export const getFundApply = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/FundApply/Get", {
    params
  });
};

// 保存备用金/专项资金
export const addFundApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/FundApply/Create",
    {
      data
    }
  );
};

// 编辑备用金/专项资金
export const editFundApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/FundApply/Update",
    {
      data
    }
  );
};

// 删除备用金/专项资金
export const deleteFundApply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/FundApply/Delete",
    {
      params
    }
  );
};

// 更新状态
export const changeStateFundApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/FundApply/ChangeState",
    {
      data
    }
  );
};

// 审核备用金/专项资金
export const approveFundApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/FundApply/Approve",
    {
      data
    }
  );
};

// 备用金/专项资金办理状态NV
export const GetFundApplyProcessTypeNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/FundApply/GetFundApplyProcessTypeNV",
    {
      params
    }
  );
};
