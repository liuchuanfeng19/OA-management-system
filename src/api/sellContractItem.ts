import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取销售合同明细列表
export const getSellContractItemList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItem/GetList",
    {
      params
    }
  );
};
// 获取销售合同明细列表
export const getListForAttachDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItem/GetListForAttachDetail",
    {
      params
    }
  );
};

// 获取销售合同明细详情
export const getSellContractItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItem/Get",
    {
      params
    }
  );
};

// 获取物资列表
export const getUnCartListByProjectId = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItem/GetUnCartListByProjectId",
    {
      params
    }
  );
};

// 获取销售合同开票可用明细（不分页）
export const getUnInvoiceList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItem/GetUnInvoiceList",
    {
      params
    }
  );
};

// 保存销售合同明细
export const addSellContractItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItem/Save",
    {
      data
    }
  );
};

// 保存销售合同明细
export const editSellContractItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItem/Update",
    {
      data
    }
  );
};

// 删除销售合同明细
export const deleteSellContractItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItem/Delete",
    {
      data
    }
  );
};

// 获取销售合同明细（带站点）列表
export const getListWithSite = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItem/GetListWithSite",
    {
      params
    }
  );
};

// 导入销售合同明细
export const importSellContractItem = (param, data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") +
      "/api/SellContractItem/Import?projectId=" +
      param.projectId +
      "&sellContractId=" +
      param.sellContractId,
    {
      data
    }
  );
};
// 获取施工图管理（带站点）列表
export const getListWithSiteForDrawing = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") +
      "/api/SellContractItem/GetListWithSiteForDrawing",
    {
      params
    }
  );
};
// 施工图管理详情
export const GetForDrawing = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItem/GetForDrawing",
    {
      params
    }
  );
};

// 更新施工图管理
export const UpdateForDrawing = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItem/UpdateForDrawing",
    {
      data
    }
  );
};

// 更新销售明细合同数量序号
export const updateForItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SellContractItem/UpdateForItem",
    {
      data
    }
  );
};
