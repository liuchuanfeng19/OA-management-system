import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 审核
export const ApproveStaffRenew = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenew/Approve",
    {
      data
    }
  );
};

// 取消/撤销
export const CancelStaffRenew = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenew/Cancel",
    {
      data
    }
  );
};

// 新增
export const CreateStaffRenew = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenew/Create",
    {
      data
    }
  );
};

//删除
export const DeleteStaffRenew = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenew/Delete",
    {
      params
    }
  );
};

// 导出
export const ExportStaffRenew = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenew/Export",
    {
      params
    }
  );
};

// 详情
export const GetStaffRenew = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/StaffRenew/Get", {
    params
  });
};

// 列表
export const GetListStaffRenew = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenew/GetList",
    {
      params
    }
  );
};

// 更新
export const UpdateStaffRenew = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenew/Update",
    {
      data
    }
  );
};

// 记录标记为不显示
export const staffRenewmarkAsNotDisplay = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffRenew/MarkAsNotDisplay",
    {
      params
    }
  );
};
