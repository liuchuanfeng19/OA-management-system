import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取日常费用报销列表
export const getDailyExpenseList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/DailyExpense/GetList",
    {
      params
    }
  );
};

// 获取审核通过的日常费用报销列表
export const getApproveCompletedList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/DailyExpense/GetApproveCompletedList",
    {
      params
    }
  );
};

// 获取日常费用报销详情
export const getDailyExpense = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/DailyExpense/Get",
    {
      params
    }
  );
};

// 保存日常费用报销
export const addDailyExpense = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/DailyExpense/Create",
    {
      data
    }
  );
};

// 编辑日常费用报销
export const editDailyExpense = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/DailyExpense/Update",
    {
      data
    }
  );
};

// 删除日常费用报销
export const deleteDailyExpense = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/DailyExpense/Delete",
    {
      params
    }
  );
};
// 取消/撤销日常费用报销
export const cancelDailyExpense = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/DailyExpense/Cancel",
    {
      data
    }
  );
};
// 审核日常费用报销
export const approveDailyExpense = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/DailyExpense/Approve",
    {
      data
    }
  );
};

// 更新费用报销状态
export const updateReimburseStatus = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/DailyExpense/UpdateReimburseStatus",
    {
      data
    }
  );
};

// 获取发票类别列表
export const getInvoiceCategories = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/DailyExpense/GetInvoiceCategories",
    {
      params
    }
  );
};

// 获取费用类别列表
export const getExpenseCategories = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/DailyExpense/GetExpenseCategories",
    {
      params
    }
  );
};
