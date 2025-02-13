import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

//获取app版本记录
export const getAppFiles = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Updater/GetList",
    {
      params
    }
  );
};

//添加/编辑app包
export const saveAppFile = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Updater/save", {
    data
  });
};

//删除app包
export const deleteAppFile = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/Updater/Delete",
    {
      data
    }
  );
};

//升级状态
export const saveMustStatus = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/Updater/SaveMustStatus",
    {
      data
    }
  );
};

//发布状态
export const savePublishStatus = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/Updater/SavePublishStatus",
    {
      data
    }
  );
};

//获取iosapp 链接
export const getiOSAppUrls = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/AppleAppStore/GetList",
    {
      params
    }
  );
};

//导入
export const importIOSUrl = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/AppleAppStore/Import",
    {
      data
    }
  );
};
//添加/编辑app包
export const saveAppleAppStore = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/AppleAppStore/Save",
    {
      data
    }
  );
};
//删除ios
export const deleteIOSUrl = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/AppleAppStore/Delete",
    {
      data
    }
  );
};
