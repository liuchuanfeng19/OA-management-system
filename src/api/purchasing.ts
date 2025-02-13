import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取供应商列表
export const GetList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Supply/GetList", {
    params
  });
};

// 添加供应商
export const Create = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/Supply/Create", {
    data
  });
};

// 编辑修改供应商
export const Update = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/Supply/Update", {
    data
  });
};

// 获取供应商详情
export const Get = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Supply/Get", {
    params
  });
};

// 删除供应商
export const Delete = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Supply/Delete", {
    params
  });
};

// 获取所有供应商分类
export const GetListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SupplyCat/GetListNV",
    {
      params
    }
  );
};

// 获取采购申请列表
export const GetReqList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/GetList",
    {
      params
    }
  );
};

// 获取采购申请审核列表
export const GetReviewList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/GetReviewList",
    {
      params
    }
  );
};

// 获取所有采购/申请状态
export const GetBuyApplyStatusNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/GetBuyApplyStatusNV",
    {
      params
    }
  );
};

// // 仅获取申请状态
// export const GetBuyApplyReqStatusNV = (params?: object): ResponseType => {
//   return http.request(
//     "get",
//     getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/GetBuyApplyReqStatusNV",
//     {
//       params
//     }
//   );
// };

// 获取详情信息
export const GetById = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/Get", {
    params
  });
};

// 删除列表行数据
export const Deleteapply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/Delete",
    {
      params
    }
  );
};

// 撤销申请

export const Cancel = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/Cancel",
    {
      data
    }
  );
};

// 新增采购
export const CreateApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/Create",
    {
      data
    }
  );
};

// 采购审核
export const Approve = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/Approve",
    {
      data
    }
  );
};

// 获取所有供应商列表
export const GetSupplyListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Supply/GetListNV",
    {
      params
    }
  );
};

// 更新发票信息
export const UpdateInvoice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/UpdateInvoice",
    {
      data
    }
  );
};

// 更新物流信息
export const UpdateTrans = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/UpdateTrans",
    {
      data
    }
  );
};

//新增审核
export const CreateSupplyApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SupplyApply/Create",
    {
      data
    }
  );
};

//供应商审核
export const ApproveSupply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SupplyApply/Approve",
    {
      data
    }
  );
};

//删除供应商申请
export const DeleteSupply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SupplyApply/Delete",
    {
      params
    }
  );
};

//获取供应商申请详情
export const GetSupply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SupplyApply/Get",
    {
      params
    }
  );
};

//获取供应商列表
export const GetListSupply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SupplyApply/GetList",
    {
      params
    }
  );
};

//获取所有申请状态NV
export const GetSupplyApplyStatusNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SupplyApply/GetSupplyApplyStatusNV",
    {
      params
    }
  );
};

//获取所有申请类型NV
export const GetSupplyApplyTypeNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/SupplyApply/GetSupplyApplyTypeNV",
    {
      params
    }
  );
};

// 供应商撤销申请

export const SupplyCancel = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/SupplyApply/Cancel",
    {
      data
    }
  );
};

// ---------------下采单-------------
// 下采单审核
export const ApproveBuyApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/Approve",
    {
      data
    }
  );
};

// 下采单撤回
export const CancelBuyApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/Cancel",
    {
      data
    }
  );
};

// 下采单新增
export const CreateBuyApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/Create",
    {
      data
    }
  );
};

// 下采单修改
export const UpdateBuyApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/Update",
    {
      data
    }
  );
};

//删除下采单申请
export const DeleteBuyApply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/Delete",
    {
      params
    }
  );
};

//下采单申请详情
export const GetBuyApply = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/Get", {
    params
  });
};

//仅获取申请状态NV
export const GetBuyApplyReqStatusNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/GetBuyApplyReqStatusNV",
    {
      params
    }
  );
};

//获取下采单列表
export const GetListBuyApply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/GetList",
    {
      params
    }
  );
};

//获取下采单列表NV
export const GetApplyListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/GetListNV",
    {
      params
    }
  );
};

//仅获取物流状态NV
export const GetTransStatusNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApply/GetTransStatusNV",
    {
      params
    }
  );
};

// 下采单明细新增
export const CreateItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApplyItem/Create",
    {
      data
    }
  );
};

// 下采单明细更新
export const UpdateItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApplyItem/Update",
    {
      data
    }
  );
};

// 导入下采单明细
export const Import = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApplyItem/Import",
    {
      data
    }
  );
};

//删除下采单明细
export const DeleteItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApplyItem/Delete",
    {
      params
    }
  );
};

//导出下采单明细
export const ExporTemplate = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApplyItem/ExporTemplate",
    {
      params
    }
  );
};

//获取下采单明细详情
export const GetApplyItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApplyItem/Get",
    {
      params
    }
  );
};

//获取下采单明细列表
export const GetListItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApplyItem/GetList",
    {
      params
    }
  );
};

//获取下采单明细列表NV
export const GetListItemNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyApplyItem/GetListNV",
    {
      params
    }
  );
};

// ---------------采购合同---------

// 采购合同审核
export const ApproveBuyContract = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyContractApply/Approve",
    {
      data
    }
  );
};

// 采购合同新增
export const CreateBuyContract = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyContractApply/Create",
    {
      data
    }
  );
};

//采购合同删除
export const DeleteBuyContract = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyContractApply/Delete",
    {
      params
    }
  );
};

//获取采购合同详情
export const GetBuyContract = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyContractApply/Get",
    {
      params
    }
  );
};

//获取采购合同列表
export const GetListContract = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyContractApply/GetList",
    {
      params
    }
  );
};

// 采购合同更新
export const UpdateBuyContract = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyContractApply/Update",
    {
      data
    }
  );
};

// -----采购合同明细----
// 采购合同明细新增
export const CreateBuyContractItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyContractApplyItem/Create",
    {
      data
    }
  );
};

// 采购合同明细更新
export const UpdateBuyContractItem = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyContractApplyItem/Update",
    {
      data
    }
  );
};

//删除采购合同明细
export const DeleteBuyContractItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyContractApplyItem/Delete",
    {
      params
    }
  );
};

//获取采购合同明细详情
export const GetBuyContractItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyContractApplyItem/Get",
    {
      params
    }
  );
};

//获取采购合同明细列表
export const GetListBuyContractItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyContractApplyItem/GetList",
    {
      params
    }
  );
};

//会签采购合同
// 审核
export const ApproveJoinSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/Approve",
    {
      data
    }
  );
};

// 新增
export const CreateJoinSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/Create",
    {
      data
    }
  );
};

// 撤销申请
export const CancelJoinSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/Cancel",
    {
      data
    }
  );
};

//删除
export const DeleteJoinSign = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/Delete",
    {
      params
    }
  );
};

//详情
export const GetJoinSign = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/Get", {
    params
  });
};

//详情精简
export const GetJoinSignSimple = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/GetSimple",
    {
      params
    }
  );
};

//列表
export const GetListJoinSign = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/GetList",
    {
      params
    }
  );
};

// 更新
export const UpdateJoinSign = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/Update",
    {
      data
    }
  );
};
// 更新会签合同
export const UpdateJoinSignV2 = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/UpdateSimple",
    {
      data
    }
  );
};

//合同编号NV
export const GetJoinSignNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSign/GetSupplyContractListNV",
    {
      params
    }
  );
};

//会签合同项目NV
export const getListNVByJoinSignId = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/JoinSignProject/GetListNVByJoinSignId",
    {
      params
    }
  );
};

// ------入库------

// 入库审核
export const BuyInStockApprove = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyInStock/Approve",
    {
      data
    }
  );
};

//获取入库详情
export const GetBuyInStock = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/BuyInStock/Get", {
    params
  });
};

//获取入库列表
export const BuyInStockGetList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyInStock/GetList",
    {
      params
    }
  );
};

// 入库更新
export const BuyInStockUpdate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyInStock/Update",
    {
      data
    }
  );
};

// 根据采购合同生成采购入库
export const SaveFromBuyContractApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyInStock/SaveFromBuyContractApply",
    {
      data
    }
  );
};

// -----入库明细-----
//获取入库明细详情
export const GetBuyInStockItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyInStockItem/Get",
    {
      params
    }
  );
};

//获取入库明细列表
export const BuyInStockItemGetList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyInStockItem/GetList",
    {
      params
    }
  );
};

// -----采购收货-----

//获取收货详情
export const getBuyRecv = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/BuyRecv/Get", {
    params
  });
};

//获取收货列表
export const getBuyRecvList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyRecv/GetList",
    {
      params
    }
  );
};

// 根据采购合同生成采购收货
export const RecvBuyContractApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyRecv/SaveFromBuyContractApply",
    {
      data
    }
  );
};

// 更新采购收货
export const UpdateBuyRecv = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyRecv/Update",
    {
      data
    }
  );
};

// ------收货明细----

//获取收货明细详情
export const getBuyRecvItem = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyRecvItem/Get",
    {
      params
    }
  );
};

//获取收货明细列表
export const getBuyRecvItemList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyRecvItem/GetList",
    {
      params
    }
  );
};

//付款流程
// 审核
export const ApproveBuyPay = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuyPay/Approve",
    {
      data
    }
  );
};

// 新增
export const CreateBuyPay = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/BuyPay/Create", {
    data
  });
};

// 撤销
export const CancelBuyPay = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/BuyPay/Cancel", {
    data
  });
};

//删除
export const DeleteBuyPay = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/BuyPay/Delete", {
    params
  });
};

//详情
export const GetBuyPay = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/BuyPay/Get", {
    params
  });
};

//列表
export const GetListBuyPay = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/BuyPay/GetList", {
    params
  });
};

// 更新
export const UpdateBuyPay = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/BuyPay/Update", {
    data
  });
};
