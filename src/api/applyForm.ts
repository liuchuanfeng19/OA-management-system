import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 审批表单列表NV（表单编号不为空的所有项）
export const ApplyFormGetListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ApplyForm/GetListNV",
    {
      params
    }
  );
};
