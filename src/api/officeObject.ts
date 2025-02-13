import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 删除
export const OfficeObjectDelete = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OfficeObject/Delete",
    {
      params
    }
  );
};

// 获取详情
export const getOfficeObject = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OfficeObject/Get",
    {
      params
    }
  );
};

// 列表
export const getListOfficeObject = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OfficeObject/GetList",
    {
      params
    }
  );
};

// 办公设备列表NV
export const GetOfficeListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OfficeObject/GetListNV",
    {
      params
    }
  );
};

// 办公设备列表NV(全)
export const getListNVV2 = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OfficeObject/getListNVV2",
    {
      params
    }
  );
};
