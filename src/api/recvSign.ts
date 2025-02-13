import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取发货签收单列表
export const getRecvSignList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSign/GetListForWeb",
    {
      params
    }
  );
};

// 获取发货签收单详情
export const getRecvSign = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/RecvSign/Get", {
    params
  });
};

// 保存发货签收单
export const addRecvSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSign/Create",
    {
      data
    }
  );
};

// 编辑发货签收单
export const editRecvSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSign/Update",
    {
      data
    }
  );
};

// 删除发货签收单
export const deleteRecvSign = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSign/Delete",
    {
      params
    }
  );
};

// 获取收货状态列表
export const getRecvStatus = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSign/GetRecvStatus",
    {
      params
    }
  );
};

// 签收
export const doRecvSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSign/DoRecv",
    {
      data
    }
  );
};

// 获取项目负责人和会签经办人
export const getRecvSignNV1 = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/RecvSign/GetRecvSignNV1",
    {
      params
    }
  );
};
