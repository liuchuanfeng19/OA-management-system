import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

//获取项目合同台账列表
export const GetAccList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/GetAccList",
    {
      params
    }
  );
};

//获取项目合同台账详情
export const GetAccDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/GetAccDetail",
    {
      params
    }
  );
};

//导出项目合同台账
export const ExportAccList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/ExportAccList",
    {
      params
    }
  );
};

// 更新会签采购合同项目的 合同内容
export const UpdateAccContractContent = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/UpdateAccContractContent",
    {
      data
    }
  );
};

// 更新会签采购合同项目的 发票已开、发票未开（由财务更新）
export const UpdateAccInvoiceAmount = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/UpdateAccInvoiceAmount",
    {
      data
    }
  );
};

// 更新合同原件是否返还
export const UpdateAccReturn1 = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/UpdateAccReturn1",
    {
      data
    }
  );
};

// 更新签收单/验收单是否返还
export const UpdateAccReturn2 = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/UpdateAccReturn2",
    {
      data
    }
  );
};

// 更新原始合同附件
export const UpdateOriginAttach = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/UpdateOriginAttach",
    {
      data
    }
  );
};
