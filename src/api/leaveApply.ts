import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取请假列表
export const getLeaveList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/GetLeaveApplyList",
    {
      params
    }
  );
};

// 获取我的请假列表
export const getMyLeaveApplyList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/GetMyLeaveApplyList",
    {
      params
    }
  );
};

// 获取请假详情
export const getLeave = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/GetLeaveApplyDetail",
    {
      params
    }
  );
};

// 创建请假申请
export const createLeave = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/Create",
    {
      data
    }
  );
};

// 更新请假申请
export const updateLeave = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/Update",
    {
      data
    }
  );
};

// 删除请假申请
export const deleteLeave = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/Delete",
    {
      params
    }
  );
};

// 获取请假类型key value
export const getAllLeaveTypes = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/GetLeaveTypes",
    {
      params
    }
  );
};

// 请假审批申请是否同意
export const Approve = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/Approve",
    {
      data
    }
  );
};

// 获取请假类型NV
export const GetLeaveTypesNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/GetLeaveTypesNV",
    {
      params
    }
  );
};

// 请假天数计算
export const CalcLeaveDays = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/CalcLeaveDays",
    {
      data
    }
  );
};
