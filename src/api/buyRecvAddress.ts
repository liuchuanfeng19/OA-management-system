import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 收货地址新增
export const BuyRecvAddressCreate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyRecvAddress/Create",
    {
      data
    }
  );
};

// 收货地址更新
export const UpdateBuyRecvAddress = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyRecvAddress/Update",
    {
      data
    }
  );
};

// 收货地址删除
export const DeleteBuyRecvAddress = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyRecvAddress/Delete",
    {
      params
    }
  );
};

//收货地址获取详情
export const GetBuyRecvAddress = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyRecvAddress/Get",
    {
      params
    }
  );
};

// 收货地址获取列表
export const GetListBuyRecvAddress = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyRecvAddress/GetList",
    {
      params
    }
  );
};
