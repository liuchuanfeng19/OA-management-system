import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 审核
export const ApproveDecasualization = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Decasualization/Approve",
    {
      data
    }
  );
};

// 取消/撤销
export const CancelDecasualization = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Decasualization/Cancel",
    {
      data
    }
  );
};

// 新增
export const CreateDecasualization = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Decasualization/Create",
    {
      data
    }
  );
};

//删除
export const DeleteDecasualization = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Decasualization/Delete",
    {
      params
    }
  );
};

// 导出
// export const ExportStaffOffAudit = (params?: object): ResponseType => {
//   return http.request(
//     "get",
//     getBaseUrl("DOMAIN_BUS") + "/api/StaffOffAudit/Export",
//     {
//       params
//     }
//   );
// };

// 详情
export const GetDecasualization = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Decasualization/Get",
    {
      params
    }
  );
};

// 列表
export const GetListDecasualization = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Decasualization/GetList",
    {
      params
    }
  );
};

// 更新
export const UpdateDecasualization = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Decasualization/Update",
    {
      data
    }
  );
};

// 获取实习期/培训期/试用期员工NV列表
export const getJobStaffListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetStaffListNV",
    {
      params
    }
  );
};

// 记录标记为不显示
export const decmarkAsNotDisplay = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Decasualization/MarkAsNotDisplay",
    {
      params
    }
  );
};
