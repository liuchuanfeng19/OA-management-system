import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 审核
export const ComputerCollectApprove = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ComputerCollect/Approve",
    {
      data
    }
  );
};

// 取消
export const ComputerCollectCancel = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ComputerCollect/Cancel",
    {
      data
    }
  );
};

// 新增
export const ComputerCollectCreate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ComputerCollect/Create",
    {
      data
    }
  );
};

// 更新
export const ComputerCollectUpdate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ComputerCollect/Update",
    {
      data
    }
  );
};

// 删除
export const ComputerCollectDelete = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ComputerCollect/Delete",
    {
      params
    }
  );
};

// 获取详情
export const getComputerCollect = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ComputerCollect/Get",
    {
      params
    }
  );
};

// 列表
export const getListComputerCollect = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ComputerCollect/GetList",
    {
      params
    }
  );
};

// 归还
export const ReturnBack = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ComputerCollect/ReturnBack",
    {
      data
    }
  );
};
