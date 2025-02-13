import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 审核
export const ApprovePersonnelRequirements = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/PersonnelRequirements/Approve",
    {
      data
    }
  );
};

//取消/撤销
export const CancelPersonnelRequirements = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/PersonnelRequirements/Cancel",
    {
      data
    }
  );
};

// 新增
export const CreatePersonnelRequirements = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/PersonnelRequirements/Create",
    {
      data
    }
  );
};

//删除
export const DeletePersonnelRequirements = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/PersonnelRequirements/Delete",
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
export const GetPersonnelRequirements = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/PersonnelRequirements/Get",
    {
      params
    }
  );
};

// 列表
export const GetListPersonnelRequirements = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/PersonnelRequirements/GetList",
    {
      params
    }
  );
};

// 更新
export const UpdatePersonnelRequirements = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/PersonnelRequirements/Update",
    {
      data
    }
  );
};

//获取招聘方式NV
export const GetRecruitmentMethodsNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") +
      "/api/PersonnelRequirements/GetRecruitmentMethodsNV",
    {
      params
    }
  );
};

//获取招聘理由NV
export const GetRecruitReasonNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/PersonnelRequirements/GetRecruitReasonNV",
    {
      params
    }
  );
};

// 记录标记为不显示
export const permarkAsNotDisplay = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/PersonnelRequirements/MarkAsNotDisplay",
    {
      params
    }
  );
};
