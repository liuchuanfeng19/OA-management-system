import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 审核
export const ApproveInterviewEvaluation = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/InterviewEvaluation/Approve",
    {
      data
    }
  );
};

// 取消/撤销
export const CancelInterviewEvaluation = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/InterviewEvaluation/Cancel",
    {
      data
    }
  );
};

// 新增
export const CreateInterviewEvaluation = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/InterviewEvaluation/Create",
    {
      data
    }
  );
};

//删除
export const DeleteInterviewEvaluation = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/InterviewEvaluation/Delete",
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
export const GetInterviewEvaluation = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/InterviewEvaluation/Get",
    {
      params
    }
  );
};

// 列表
export const GetListInterviewEvaluation = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/InterviewEvaluation/GetList",
    {
      params
    }
  );
};

// 更新
export const UpdateInterviewEvaluation = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/InterviewEvaluation/Update",
    {
      data
    }
  );
};

// 初试建议NV
export const GetInterviewFirstAdviceNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") +
      "/api/InterviewEvaluation/GetInterviewFirstAdviceNV",
    {
      params
    }
  );
};

// 复试建议NV
export const GetInterviewSecondAdviceNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") +
      "/api/InterviewEvaluation/GetInterviewSecondAdviceNV",
    {
      params
    }
  );
};

// 记录标记为不显示
export const intmarkAsNotDisplay = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/InterviewEvaluation/MarkAsNotDisplay",
    {
      params
    }
  );
};
