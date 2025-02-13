import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 审核
export const ApproveStaffRenewAudit = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenewAudit/Approve",
    {
      data
    }
  );
};

// 取消/撤销
export const CancelStaffRenewAudit = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenewAudit/Cancel",
    {
      data
    }
  );
};

// 新增
export const CreateStaffRenewAudit = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenewAudit/Create",
    {
      data
    }
  );
};

//删除
export const DeleteStaffRenewAudit = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenewAudit/Delete",
    {
      params
    }
  );
};

// 详情
export const GetStaffRenewAudit = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenewAudit/Get",
    {
      params
    }
  );
};

// 列表
export const GetListStaffRenewAudit = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenewAudit/GetList",
    {
      data
    }
  );
};

// 更新
export const UpdateStaffRenewAudit = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenewAudit/Update",
    {
      data
    }
  );
};

// 记录标记为不显示
export const staffRenewAuditmarkAsNotDisplay = (
  params?: object
): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenewAudit/MarkAsNotDisplay",
    {
      params
    }
  );
};
