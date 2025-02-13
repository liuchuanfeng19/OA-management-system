import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 查询表单组
export const getFormGroups = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ApplyGroup/GetGroupList",
    {
      params
    }
  );
};

// 表单排序
export const groupItemsSort = (params?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ApplyGroup/Sort",
    {
      params
    }
  );
};

// 添加表单组
export const createGroup = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ApplyGroup/Create",
    {
      data
    }
  );
};

// 编辑表单组
export const updateGroup = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ApplyGroup/Update",
    {
      data
    }
  );
};

// 删除表单组
export const deleteGroup = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ApplyGroup/Delete",
    {
      params
    }
  );
};

// 停用表单
export const stopForm = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ApplyForm/StopOrNot",
    {
      data
    }
  );
};

// 删除表单
export const deleteForm = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ApplyForm/Delete",
    {
      params
    }
  );
};

export const createForm = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ApplyForm/Create",
    {
      data
    }
  );
};

// 查询表单详情
export const getFormDetail = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/ApplyForm/Get", {
    params
  });
};

// 更新表单详情
export const updateFormDetail = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ApplyForm/Update",
    {
      data
    }
  );
};

export default {
  createGroup,
  deleteGroup,
  stopForm,
  deleteForm,
  getFormGroups,
  groupItemsSort,
  createForm,
  getFormDetail,
  updateGroup,
  updateFormDetail
};
