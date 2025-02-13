import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取示例列表
export const getExampleList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BFW") + "/api/Example/GetList",
    {
      params
    }
  );
};

// 获取示例详情
export const getExample = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BFW") + "/api/Example/Get", {
    params
  });
};

// 保存示例
export const addExample = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BFW") + "/api/Example/Save", {
    data
  });
};

// 编辑示例
export const editExample = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/Example/Update",
    {
      data
    }
  );
};

// 删除示例
export const deleteExample = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BFW") + "/api/Example/Delete",
    {
      data
    }
  );
};
