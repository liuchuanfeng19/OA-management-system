import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取文件列表
export const getFileList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Files/GetList", {
    params
  });
};

// 获取文件类型列表
export const getFileTypeList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Files/GetFileTypeList",
    {
      params
    }
  );
};

// 获取文件详情
export const getFile = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Files/Get", {
    params
  });
};

// 根据文件类型获取最新的版本信息
export const GetLatest = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Filess/GetLatest",
    {
      params
    }
  );
};

// 保存文件
export const saveFile = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Files/Save", {
    data
  });
};

// 编辑文件
export const editFile = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Files/Update", {
    data
  });
};

// 删除文件
export const deleteFile = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Files/Delete", {
    data
  });
};
