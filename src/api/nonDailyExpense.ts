import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取非日常费用报销列表
export const getNonDailyExpenseList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NonDailyExpense/GetList",
    {
      params
    }
  );
};

// 获取非日常费用报销详情
export const getNonDailyExpense = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NonDailyExpense/Get",
    {
      params
    }
  );
};

// 保存非日常费用报销
export const addNonDailyExpense = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/NonDailyExpense/Create",
    {
      data
    }
  );
};

// 编辑非日常费用报销
export const editNonDailyExpense = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/NonDailyExpense/Update",
    {
      data
    }
  );
};

// 删除非日常费用报销
export const deleteNonDailyExpense = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/NonDailyExpense/Delete",
    {
      params
    }
  );
};
// 取消/撤销非日常费用报销
export const cancelNonDailyExpense = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/NonDailyExpense/Cancel",
    {
      data
    }
  );
};
// 审核非日常费用报销
export const approveNonDailyExpense = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/NonDailyExpense/Approve",
    {
      data
    }
  );
};
