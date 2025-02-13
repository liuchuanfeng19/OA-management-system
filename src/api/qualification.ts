import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增资质证书
export const Create = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CompanyCert/Create",
    {
      data
    }
  );
};

// 删除资质证书
export const Delete = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CompanyCert/Delete",
    {
      params
    }
  );
};

// 导出
export const Export = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CompanyCert/Export",
    {
      params
    }
  );
};

// 获取所有公司证书类型
export const GetCompanyQualiTypes = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CompanyCert/GetCompanyQualiTypes",
    {
      params
    }
  );
};

// 获取资质证书详情
export const GetInfo = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CompanyCert/GetInfo",
    {
      params
    }
  );
};

// 获取资质证书列表
export const GetList = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CompanyCert/GetList",
    {
      data
    }
  );
};

// 更新资质证书
export const Update = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CompanyCert/Update",
    {
      data
    }
  );
};

// 获取资质证书提醒通知
export const GetByQualiType = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/QualiNotifySetting/GetByQualiType",
    {
      params
    }
  );
};

// 获取所有资质证书类型
export const GetQualiTypes = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/QualiNotifySetting/GetQualiTypes",
    {
      params
    }
  );
};

// 保存资质证书提醒通知
export const Save = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/QualiNotifySetting/Save",
    {
      data
    }
  );
};

// 获取所有资质证书类型
export const GetQualiTypesByCategoryNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") +
      "/api/QualiNotifySetting/GetQualiTypesByCategoryNV",
    {
      params
    }
  );
};

// 获取所有资质证书分类
export const GetQualiCategoriesNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/QualiNotifySetting/GetQualiCategoriesNV",
    {
      params
    }
  );
};

// 获取到期提醒列表
export const GetListByQualiCategory = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/QualiNotifySetting/GetListByQualiCategory",
    {
      params
    }
  );
};

// 新增到期提醒
export const Createdq = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/QualiNotifySetting/Create",
    {
      data
    }
  );
};

// 获取到期提醒详情
export const Get = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/QualiNotifySetting/Get",
    {
      params
    }
  );
};

// 更新到期提醒
export const Updatedq = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/QualiNotifySetting/Update",
    {
      data
    }
  );
};

// 删除到期提醒
export const Deletedq = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/QualiNotifySetting/Delete",
    {
      params
    }
  );
};

// 获取所有公司列表NV
export const GetCompanyList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CompanyCert/GetCompanyList",
    {
      params
    }
  );
};
