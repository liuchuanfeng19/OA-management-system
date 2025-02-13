import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

interface userType extends Promise<any> {
  svg?: string;
  code?: number;
  info?: object;
}

// 获取验证码
export const getVerify = (): userType => {
  return http.request("get", "/captcha");
};

// 登录
export const getLogin = (data: object) => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/auth/getToken", {
    data
  });
};

// 刷新token
export const refreshToken = (data?: object) => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/auth/refreshToken",
    { data }
  );
};

// 保存用户
export const saveUser = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/User/Save", {
    data
  });
};

// 删除用户
export const deleteUser = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/User/Delete", {
    data
  });
};

// 修改用户
export const updateUser = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/User/Update", {
    data
  });
};

// 重置密码
export const resetPassword = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/User/ResetPassword",
    {
      data
    }
  );
};

// 重置全部密码
export const resetAllPassword = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/User/ResetAllPassword",
    {
      data
    }
  );
};

// 修改密码
export const updatePassword = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/User/UpdatePassword",
    {
      data
    }
  );
};

// 修改头像
export const updateAvatarUrl = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/User/UpdateAvatarUrl",
    {
      data
    }
  );
};

// 获取角色授权列表
export const getList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/User/GetList", {
    params
  });
};
// 根据角色名获取用户列表
export const getListByRoleName = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/User/GetUserInfoListByRoleName",
    {
      params
    }
  );
};

// 根据角色名获取用户列表新
export const getListByRoleNameNew = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/User/GetUserInfoListByRoleName",
    {
      params
    }
  );
};
// 根据角色編碼获取用户列表
export const getUserListByRoleCode = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/User/GetUserInfoListByRoleCode",
    {
      params
    }
  );
};

// 根据角色編碼获取用户列表新
export const getUserListByRoleCodeNew = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/User/GetUserInfoListByRoleCode",
    {
      params
    }
  );
};
// 获取登录用户信息
export const getUserInfo = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/User/GetUserInfo",
    {
      params
    }
  );
};

// export const searchVague = (data: object) => {
//   return http.request("post", "/searchVague", { data });
// };

// 获取当前用户Id
export const getCurrentStaffId = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetCurrentStaffId",
    {
      params
    }
  );
};

// 退出登录
export const loginOut = (data: object) => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/Auth/LoginOutExt",
    {
      data
    }
  );
};
