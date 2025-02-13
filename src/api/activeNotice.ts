import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取员工动态列表
export const getActiveNoticeList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ActiveNotice/GetList",
    {
      params
    }
  );
};

// 获取员工动态详情
export const getActiveNotice = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ActiveNotice/Get",
    {
      params
    }
  );
};

// 保存员工动态
export const addActiveNotice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ActiveNotice/Create",
    {
      data
    }
  );
};

// 编辑员工动态
export const editActiveNotice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ActiveNotice/Update",
    {
      data
    }
  );
};

// 删除员工动态
export const deleteActiveNotice = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ActiveNotice/Delete",
    {
      params
    }
  );
};
