import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增
export const OfficeStuffCreate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/OfficeStuff/Create",
    {
      data
    }
  );
};

// 更新
export const OfficeStuffUpdate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/OfficeStuff/Update",
    {
      data
    }
  );
};

// 删除
export const OfficeStuffDelete = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OfficeStuff/Delete",
    {
      params
    }
  );
};

// 获取详情
export const getOfficeStuff = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OfficeStuff/Get",
    {
      params
    }
  );
};

// 列表
export const getListOfficeStuff = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OfficeStuff/GetList",
    {
      params
    }
  );
};

// 归还
export const ReturnBackOfficeStuff = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OfficeStuff/ReturnBack",
    {
      params
    }
  );
};
