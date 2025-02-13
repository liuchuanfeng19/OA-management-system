import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 审核
export const ApprovePurJoinSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/PurJoinSign/Approve",
    {
      data
    }
  );
};

// 新增
export const CreatePurJoinSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/PurJoinSign/Add",
    {
      data
    }
  );
};

// 撤销
export const CancelPurJoinSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/PurJoinSign/Cancel",
    {
      data
    }
  );
};

//删除
export const DeletePurJoinSign = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/PurJoinSign/Delete",
    {
      params
    }
  );
};

//详情
export const GetPurJoinSign = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/PurJoinSign/GetOne",
    {
      params
    }
  );
};

//列表
export const GetListPurJoinSign = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/PurJoinSign/GetPages",
    {
      params
    }
  );
};

// 更新
export const UpdatePurJoinSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/PurJoinSign/Update",
    {
      data
    }
  );
};
