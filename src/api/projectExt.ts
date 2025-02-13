import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取销售列表
export const getProjectExtList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectExt/GetList",
    {
      params
    }
  );
};

// 获取销售NV列表
export const getProjectExtNVList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectExt/GetListNV",
    {
      params
    }
  );
};

// 获取中标项目NV列表
export const getWinBidListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectExt/GetWinBidListNV",
    {
      params
    }
  );
};

// 获取销售详情
export const getProjectExt = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/ProjectExt/Get", {
    params
  });
};

// 生成物资合同清单
export const getProjectExtStatus = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectExt/GenSellContractItems",
    {
      params
    }
  );
};

// 导入物资合同清单
export const analyzeContractItemFile = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectExt/AnalyzeContractItemFile",
    {
      data
    }
  );
};

// 更新物资合同清单字段映射关系
export const updateFieldMapping = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectExt/UpdateFieldMapping",
    {
      data
    }
  );
};

// 保存销售
export const createProjectExt = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectExt/Create",
    {
      data
    }
  );
};

// 编辑销售
export const updateProjectExt = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectExt/Update",
    {
      data
    }
  );
};

// 删除销售
export const deleteProjectExt = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjectExt/Delete",
    {
      params
    }
  );
};
