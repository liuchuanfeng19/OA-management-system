import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取外出列表
export const getOutApplyList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OutApply/GetList",
    {
      params
    }
  );
};

// 获取抄送人NV
export const getBusiTripCcStaffListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BusiTripApply/GetCcStaffListNV",
    {
      params
    }
  );
};

// 获取外出详情
export const getOutApply = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/OutApply/Get", {
    params
  });
};

// 创建外出申请
export const createOutApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/OutApply/Create",
    {
      data
    }
  );
};

// 更新外出申请
export const updateOutApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/OutApply/Update",
    {
      data
    }
  );
};

// 删除外出申请
export const deleteOutApply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/OutApply/Delete",
    {
      params
    }
  );
};
//外出审批是否通过

export const Approve = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/OutApply/Approve",
    {
      data
    }
  );
};

//撤回外出申请
export const CancelOutApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/OutApply/Cancel",
    {
      data
    }
  );
};
