import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 申请
export const ContractJoinAdd = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ContractJoin/Add",
    {
      data
    }
  );
};

// 审核
export const ApproveContractJoin = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ContractJoin/Approve",
    {
      data
    }
  );
};

// 撤销
export const CancelContractJoin = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ContractJoin/Cancel",
    {
      data
    }
  );
};

//删除
export const DeleteContractJoin = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ContractJoin/Delete",
    {
      data
    }
  );
};

//详情
export const GetContractJoin = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ContractJoin/GetOne",
    {
      params
    }
  );
};

//列表
export const GetListContractJoin = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ContractJoin/GetPages",
    {
      params
    }
  );
};

// 更新
export const UpdateContractJoin = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ContractJoin/Update",
    {
      data
    }
  );
};
