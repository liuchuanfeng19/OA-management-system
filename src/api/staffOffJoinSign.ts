import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 审核
export const ApproveStaffOffJoinSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffJoinSign/Approve",
    {
      data
    }
  );
};

// 取消/撤销
export const CancelStaffOffJoinSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffJoinSign/Cancel",
    {
      data
    }
  );
};

// 新增
export const CreateStaffOffJoinSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffJoinSign/Add",
    {
      data
    }
  );
};

//删除
export const DeleteStaffOffJoinSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffJoinSign/Delete",
    {
      data
    }
  );
};

// 导出
export const ExportStaffOffJoinSign = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffJoinSign/ExportOne",
    {
      params
    }
  );
};

// 详情
export const GetStaffOffJoinSign = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffJoinSign/GetOne",
    {
      params
    }
  );
};

// 列表
export const GetListStaffOffJoinSign = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffJoinSign/GetPages",
    {
      params
    }
  );
};

// 更新
export const UpdateStaffOffJoinSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffJoinSign/Update",
    {
      data
    }
  );
};

// 获取会签合同键值对
export const GetOffReasonListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffJoinSign/GetOffReasonListNV",
    {
      params
    }
  );
};

// 根据人员获取部门经理
export const GetAyStaffDept = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffJoinSign/GetAyStaffDept",
    {
      params
    }
  );
};
