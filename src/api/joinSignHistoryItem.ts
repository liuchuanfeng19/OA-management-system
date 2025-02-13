import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

//导出采购历史单价模板
export const ExportTemplate = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSignHistoryItem/ExportTemplate",
    {
      params
    }
  );
};

//采购历史单价列表
export const GetList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSignHistoryItem/GetList",
    {
      params
    }
  );
};

// 导入采购历史单价
export const ImportHistoryItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSignHistoryItem/Import",
    {
      data
    }
  );
};

// 导出
export const Export = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSignHistoryItem/Export",
    {
      data
    }
  );
};
