import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取购销存列表
export const getPssManageList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/PssManage/GetList",
    {
      params
    }
  );
};

// 结转
export const carryOverPssManage = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/PssManage/CarryOver",
    {
      data
    }
  );
};

// 删除
export const deleteOverPssManage = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/PssManage/Delete",
    {
      params
    }
  );
};

// 更新（单位、开票金额）
export const UpdateSimple1 = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/PssManage/UpdateSimple1",
    {
      data
    }
  );
};
