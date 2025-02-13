import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 下采单审核
export const ApproveReqOrder = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrder/Approve",
    {
      data
    }
  );
};

// 下采单撤销
export const CancelReqOrder = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrder/Cancel",
    {
      data
    }
  );
};

// 下采单新增
export const CreateReqOrder = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrder/Create",
    {
      data
    }
  );
};

// 下采单删除
export const DeleteReqOrder = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrder/Delete",
    {
      params
    }
  );
};

// 下采单获取详情
export const GetReqOrder = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/ReqOrder/Get", {
    params
  });
};

// 下采单审核获取列表
export const GetListReqOrder = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrder/GetList",
    {
      params
    }
  );
};

// 下采单-我的下采单列表
export const GetMyListReqOrder = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrder/GetMyList",
    {
      params
    }
  );
};

// 下采单更新
export const UpdateReqOrder = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrder/Update",
    {
      data
    }
  );
};

// 下采单审核项目列表nv
export const GetApproveProjectListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrder/GetApproveProjectListNV",
    {
      params
    }
  );
};

// 我的下采单项目列表nv
export const GetMyProjectListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ReqOrder/GetMyProjectListNV",
    {
      params
    }
  );
};
