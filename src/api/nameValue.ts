import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

//获取设备类型NV列表
export const getAppSystemListNv = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/NameValue/GetAppSystemListNv",
    {
      params
    }
  );
};
