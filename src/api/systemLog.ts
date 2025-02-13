import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 分页获取系统日志列表
export const getSysLogList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/SysLog/GetList", {
    params
  });
};

// 分页获取操作日志列表
export const getOpLogList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/OpLog/GetList", {
    params
  });
};

// 获取所有操作日志类型
export const getOpLogTypes = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/OpLog/OpTypes", {
    params
  });
};
