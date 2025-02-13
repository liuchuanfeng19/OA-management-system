import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增
export const CreateComputerPart = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ComputerPart/Create",
    {
      data
    }
  );
};

// 删除
export const DeleteComputerPart = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ComputerPart/Delete",
    {
      params
    }
  );
};

// 详情
export const ComputerPartGet = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ComputerPart/Get",
    {
      params
    }
  );
};

// 列表
export const ComputerPartGetList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ComputerPart/GetList",
    {
      params
    }
  );
};

// 更新
export const UpdateComputerPart = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ComputerPart/Update",
    {
      data
    }
  );
};
