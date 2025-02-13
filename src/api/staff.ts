import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 保存员工
export const saveStaff = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Staff/Post", {
    data
  });
};

// 删除员工
export const deleteStaff = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Staff/Delete", {
    data
  });
};

// 修改员工
export const updateStaff = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Staff/Update", {
    data
  });
};

// 获取员工列表
export const getStaffList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Staff/GetList", {
    params
  });
};

// 获取未离职员工列表
export const getAllAliveStaffNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetAllAliveStaffNV",
    {
      params
    }
  );
};

// 根据部门编码获取员工列表
export const getStaffListByDeptCode = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Staff/GetListNvByDeptCode",
    {
      params
    }
  );
};

// 根据部门ID获取员工列表
export const getStaffListByDeptId = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Staff/GetListNvByDeptId",
    {
      params
    }
  );
};

// 获取员工详情
export const getStaff = (id?: string): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Staff/Get/" + id);
};

// 获取当前员工
export const getCurrentStaff = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetCurrentStaff",
    {
      params
    }
  );
};

// 获取人员精简信息
export const GetSimpleStaff = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetSimpleStaff",
    {
      params
    }
  );
};

// 获取所有员工NV列表
export const getStaffListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Staff/GetListNV",
    {
      params
    }
  );
};

// 获取所有员工状态nv
export const GetStaffStatusListNv = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/NameValue/GetStaffStatusListNv",
    {
      params
    }
  );
};

// 获取所有员工在职状态nv
export const GetJobStatusListNv = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/NameValue/GetJobStatusListNv",
    {
      params
    }
  );
};
