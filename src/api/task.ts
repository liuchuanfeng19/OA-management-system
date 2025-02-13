import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

//分页获取定时任务列表
export const getJobList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Job/GetList", {
    params
  });
};

//获取定时任务详情
export const getJobDetail = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Job/View", {
    params
  });
};

//新增定时任务
export const createJob = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Job/Save", {
    data
  });
};

//修改定时任务
export const updateJob = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Job/Update", {
    data
  });
};

//删除定时任务
export const deleteJob = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Job/Delete", {
    data
  });
};

//执行定时任务
export const doExecute = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Job/Execute", {
    data
  });
};

//分页获取定时任务日志列表
export const getJobLogList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/JobLog/GetList", {
    params
  });
};

//添加定时任务日志
export const createJobLog = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/JobLog/Save", {
    data
  });
};
