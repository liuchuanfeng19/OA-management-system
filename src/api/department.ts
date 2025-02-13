import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取部门树
export const getTree = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Dept/GetTree", {
    params
  });
};

// 新增部门
export const addDepartment = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/dept/save", {
    data
  });
};

// 修改部门
export const updateDepartment = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Dept/Update", {
    data
  });
};

// 删除部门
export const deleteDepartment = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/dept/delete", {
    data
  });
};

// 获取部门详情
export const getDepartment = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/dept/get", {
    params
  });
};

// 获取指定部门id对应的一级子部门列表
export const getDepartmentChildrenById = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/dept/getDepartmentChildrenById",
    {
      params
    }
  );
};

// 获取指定部门id对应的一级子部门列表
export const get1StSubDeptListById = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/dept/Get1StSubDeptListById",
    {
      params
    }
  );
};

// 获取单位/公司
export const getRootDeptList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Dept/GetRootDeptList",
    {
      params
    }
  );
};

// 根据公司ID获取对应下级部门数
export const GetTreeByDeptId = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Dept/GetTreeByDeptId",
    {
      params
    }
  );
};

// 根据部门性质
export const getDeptMarks = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Dept/GetDeptMarks",
    {
      params
    }
  );
};
