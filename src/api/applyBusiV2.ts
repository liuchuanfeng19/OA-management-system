import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 通用审批
export const GetCommonApplyStatus4 = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ApplyBusi/GetCommonApplyStatus4",
    {
      params
    }
  );
};

// 通用审批2
export const GetCommonApplyStatus1 = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ApplyBusi/GetCommonApplyStatus1",
    {
      params
    }
  );
};

// 通用审批3
export const GetCommonApplyStatus3 = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ApplyBusi/GetCommonApplyStatus3",
    {
      params
    }
  );
};
