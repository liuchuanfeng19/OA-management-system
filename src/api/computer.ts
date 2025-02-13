import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 编辑
export const ComputerUpdate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Computer/Update",
    {
      data
    }
  );
};

// 设备NV列表
export const ComputerGetListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Computer/GetListNV",
    {
      params
    }
  );
};

// 设备NV列表（全部信息）
export const GetListNVV2 = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Computer/GetListNVV2",
    {
      params
    }
  );
};

// 详情
export const ComputerGet = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Computer/Get", {
    params
  });
};

// 删除
export const ComputerDelete = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Computer/Delete",
    {
      params
    }
  );
};

// 列表
export const ComputerGetList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Computer/GetList",
    {
      params
    }
  );
};
