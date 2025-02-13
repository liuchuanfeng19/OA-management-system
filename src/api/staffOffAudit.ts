import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 审核
export const ApproveStaffOffAudit = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffAudit/Approve",
    {
      data
    }
  );
};

// 取消/撤销
export const CancelStaffOffAudit = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffAudit/Cancel",
    {
      data
    }
  );
};

// 新增
export const CreateStaffOffAudit = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffAudit/Create",
    {
      data
    }
  );
};

//删除
export const DeleteStaffOffAudit = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffAudit/Delete",
    {
      params
    }
  );
};

// 导出
export const ExportStaffOffAudit = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffAudit/Export",
    {
      params
    }
  );
};

// 详情
export const GetStaffOffAudit = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffAudit/Get",
    {
      params
    }
  );
};

// 列表
export const GetListStaffOffAudit = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffAudit/GetList",
    {
      params
    }
  );
};

// 更新
export const UpdateStaffOffAudit = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffAudit/Update",
    {
      data
    }
  );
};

// 员工辞职审批记录标记为不显示
export const staffOffAuditmarkAsNotDisplay = (
  params?: object
): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffOffAudit/MarkAsNotDisplay",
    {
      params
    }
  );
};
