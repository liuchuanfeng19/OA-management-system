import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 项目出勤审核
export const ApproveProjAttend = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjAttend/Approve",
    {
      data
    }
  );
};

// 项目出勤撤销
export const CancelProjAttend = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjAttend/Cancel",
    {
      data
    }
  );
};

// 项目出勤新增
export const CreateProjAttend = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjAttend/Create",
    {
      data
    }
  );
};

// 项目出勤更新
export const UpdateProjAttend = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjAttend/Update",
    {
      data
    }
  );
};

// 删除项目出勤
export const DeleteProjAttend = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjAttend/Delete",
    {
      params
    }
  );
};

// 项目出勤详情
export const GetProjAttend = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/ProjAttend/Get", {
    params
  });
};

// 项目出勤列表
export const GetListProjAttend = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjAttend/GetList",
    {
      params
    }
  );
};

// 获取详情列表
export const GetDetialList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjAttend/GetDetialList",
    {
      params
    }
  );
};

//导入文件
export const ImportProjAttend = (param, data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") +
      "/api/ProjAttend/Import?attDate=" +
      param.attDate,
    {
      data
    }
  );
};
