import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 添加
export const addSealBorrow = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SealBorrow/Create",
    {
      data
    }
  );
};
// 更新
export const updateSealBorrow = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SealBorrow/Update",
    {
      data
    }
  );
};

// 审核
export const approveSealBorrow = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SealBorrow/Approve",
    {
      data
    }
  );
};

// 撤销
export const cancelSealBorrow = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SealBorrow/Cancel",
    {
      data
    }
  );
};

// 更新状态
export const changeStatusSealBorrow = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SealBorrow/ChangeStatus",
    {
      data
    }
  );
};

// 获取印章借阅列表
export const getSealBorrowList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SealBorrow/GetList",
    {
      params
    }
  );
};

// 获取详情
export const getSealBorrowDetail = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/SealBorrow/Get", {
    params
  });
};

// 删除
export const deleteSealBorrow = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SealBorrow/Delete",
    {
      params
    }
  );
};

// 根据配置key获取借阅类型列表
export const getNVsByCatalogKey = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Cfg/GetNVsByCatalogKey",
    {
      params
    }
  );
};
