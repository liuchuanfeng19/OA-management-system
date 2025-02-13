import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取所有岗位
export const getalljobtitle = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/JobTitle/GetListNv",
    {
      params
    }
  );
};

// 新增岗位
export const createJobTitle = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/JobTitle/Save", {
    data
  });
};

// 更新岗位
export const updateJobTitle = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/JobTitle/Update",
    {
      data
    }
  );
};

// 删除岗位
export const deleteJobTitle = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/JobTitle/Delete",
    {
      data
    }
  );
};

//分页获取岗位列表
export const getJobTitlePagedList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/JobTitle/GetList",
    {
      params
    }
  );
};

// 获取岗位详情
export const getJobTitle = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/JobTitle/Get", {
    params
  });
};

// 根据部门ID获取岗位列表NV
export const GetListNVByDeptId = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/JobTitle/GetListNVByDeptId",
    {
      params
    }
  );
};
