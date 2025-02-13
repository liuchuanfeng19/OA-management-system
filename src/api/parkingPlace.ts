import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取车位管理列表
export const GetList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ParkingPlace/GetList",
    {
      params
    }
  );
};

// 获取车位管理详情
export const Get = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ParkingPlace/Get",
    {
      params
    }
  );
};

// 更新车位管理
export const Update = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ParkingPlace/Update",
    {
      data
    }
  );
};

// 新增车位管理
export const Create = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ParkingPlace/Create",
    {
      data
    }
  );
};

// 删除车位
export const Delete = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ParkingPlace/Delete",
    {
      params
    }
  );
};
