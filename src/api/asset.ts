import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增资产类别
export const Create = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsCat/Create",
    {
      data
    }
  );
};

// 删除资产类别
export const Delete = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsCat/Delete",
    {
      params
    }
  );
};

// 获取资产类别树
export const GetTree = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsCat/GetTree",
    {
      params
    }
  );
};

// 获取资产类别详情
export const Get = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/AssetsCat/Get", {
    params
  });
};

// 更新资产类别
export const Update = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsCat/Update",
    {
      data
    }
  );
};

// 获取资产列表
export const GetList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Assets/GetList", {
    params
  });
};

// 入库资产
export const StoreIn = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Assets/StoreIn",
    {
      data
    }
  );
};

// 更新资产
export const UpdateAsset = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/Assets/Update", {
    data
  });
};

// 获取资产详情
export const GetAsset = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Assets/Get", {
    params
  });
};

// 删除资产（报废资产）
export const DeleteAsset = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Assets/Delete", {
    params
  });
};

// 获取报废列表
export const GetBrokenList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Assets/GetBrokenList",
    {
      params
    }
  );
};

// 报废

export const Broken = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/Assets/Broken", {
    data
  });
};

// 资产流转列表
export const AssetsFlowList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsFlow/GetList",
    {
      params
    }
  );
};

// 资产流转详情
export const GetAssetsFlow = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/AssetsFlow/Get", {
    params
  });
};

// 删除资产流转
export const DeleteAssetsFlow = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsFlow/Delete",
    {
      params
    }
  );
};

// 获取所有资产状态
export const GetAssetsStatusNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Assets/GetAssetsStatusNV",
    {
      params
    }
  );
};

// 获取我的资产列表
export const MyAssetsList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/MyAssets/GetList",
    {
      params
    }
  );
};

// 我的资产列表详情
export const MyAssets = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/MyAssets/Get", {
    params
  });
};

// 我的资产归还
export const ReturnBack = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/MyAssets/ReturnBack",
    {
      params
    }
  );
};

// 获取资产审核列表
export const GetAssetsApplyList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsApply/GetAssetsApplyList",
    {
      params
    }
  );
};

// 审核通过/不通过
export const Approve = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsApply/Approve",
    {
      data
    }
  );
};

// 撤回审核

export const Cancel = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsApply/Cancel",
    {
      data
    }
  );
};

// 创建申请
export const CreateApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsApply/Create",
    {
      data
    }
  );
};

// 获取审核详情
export const GetApply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsApply/Get",
    {
      params
    }
  );
};

// 获取资产申请状态
export const GetAssetsApplyStatusNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsApply/GetAssetsApplyStatusNV",
    {
      params
    }
  );
};

//我的资产申请列表
export const GetMyRequestList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsApply/GetMyRequestList",
    {
      params
    }
  );
};

//获取资产是否需要归还NV
export const GetIsNeedReturnNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Assets/GetIsNeedReturnNV",
    {
      params
    }
  );
};

//获取所有我的资产NV
export const GetMyAssetsStatusNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/MyAssets/GetMyAssetsStatusNV",
    {
      params
    }
  );
};

//获取资产类别父级数据
export const Get1stLevel = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsCat/Get1stLevel",
    {
      params
    }
  );
};

//获取资产类别子级数据
export const GetSublevelTree = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AssetsCat/GetTree",
    {
      params
    }
  );
};
