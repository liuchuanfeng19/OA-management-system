import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

//导出项目明细台账
export const ExportAccList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSignItem/ExportAccList",
    {
      params
    }
  );
};

// 获取明细台账详情
export const GetAccDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSignItem/GetAccDetail",
    {
      params
    }
  );
};

// 项目明细台账列表
export const GetAccList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSignItem/GetAccList",
    {
      params
    }
  );
};

// 获取明细列表（入库时使用）
export const getListForInStock = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSignItem/GetListForInStock",
    {
      params
    }
  );
};

// 项目明细帐列表（V2）
export const GetAccListV2 = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSignItem/GetAccListV2",
    {
      params
    }
  );
};

// 发货日期历史
export const GetHistoryRecvAccList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSignItem/GetHistoryRecvAccList",
    {
      params
    }
  );
};

// 采购日期历史
export const GetHistoryJoinSignItemAccList = (
  params?: object
): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") +
      "/api/JoinSignItem/GetHistoryJoinSignItemAccList",
    {
      params
    }
  );
};

// 获取站点有效数量大于0的列表
export const getListForRecvSign = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSignItem/GetListForRecvSign",
    {
      params
    }
  );
};
