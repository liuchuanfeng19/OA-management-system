import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 新增项目
export const Create = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/Proj/Create", {
    data
  });
};

// 删除项目
export const Delete = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Proj/Delete", {
    params
  });
};

// 获取项目详情
export const GetPro = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Proj/Get", {
    params
  });
};

// 更新项目
export const Update = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/Proj/Update", {
    data
  });
};

// 获取项目列表
export const GetList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Proj/GetList", {
    params
  });
};

// 获取项目列表NV
export const GetListNV = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Proj/GetListNV", {
    params
  });
};

// 获取所有项目状态NV
export const GetProjStatusNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Proj/GetProjStatusNV",
    {
      params
    }
  );
};

// 新增项目人员
export const CreatePerson = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjStaff/Create",
    {
      data
    }
  );
};

// 删除项目人员
export const DeletePerson = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjStaff/Delete",
    {
      params
    }
  );
};

// 获取项目详情人员
export const GetProPerson = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/ProjStaff/Get", {
    params
  });
};

// 更新项目人员
export const UpdatePerson = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjStaff/Update",
    {
      data
    }
  );
};

// 获取项目人员列表
export const GetListPerson = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjStaff/GetList",
    {
      params
    }
  );
};

// 新增项目明细
export const Createdetail = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjItem/Create",
    {
      data
    }
  );
};

// 删除项目明细
export const Deletedetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjItem/Delete",
    {
      params
    }
  );
};

// 获取项目明细详情
export const GetProdetail = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/ProjItem/Get", {
    params
  });
};

// 更新项目明细
export const Updatedetail = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjItem/Update",
    {
      data
    }
  );
};

// 获取项目明细列表
export const GetListdetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjItem/GetList",
    {
      params
    }
  );
};

// 新增项目总预算
export const Createbudget = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudget/Create",
    {
      data
    }
  );
};

// 删除项目总预算
export const Deletebudget = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudget/Delete",
    {
      params
    }
  );
};

// 获取项目总预算详情
export const GetProbudget = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/ProjBudget/Get", {
    params
  });
};

// 更新项目总预算
export const Updatebudget = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudget/Update",
    {
      data
    }
  );
};

// 获取项目总预算列表
export const GetListbudget = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudget/GetList",
    {
      params
    }
  );
};

// 获取项目总预算列表NV
// export const GetbudgetListNV = (params?: object): ResponseType => {
//   return http.request(
//     "get",
//     getBaseUrl("DOMAIN_BUS") + "/api/ProjBudget/GetListNV",
//     {
//       params
//     }
//   );
// };

// 新增项目子预算
export const CreateChildbudget = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudgetOther/Create",
    {
      data
    }
  );
};

// 删除项目子预算
export const DeleteChildbudget = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudgetOther/Delete",
    {
      params
    }
  );
};

// 获取项目子预算详情
export const GetProChildbudget = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudgetOther/Get",
    {
      params
    }
  );
};

// 更新项目子预算
export const UpdateChildbudget = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudgetOther/Update",
    {
      data
    }
  );
};

// 获取项目子预算列表
export const GetListChildbudget = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudgetOther/GetList",
    {
      params
    }
  );
};

// 获取所有费用名称NV
export const GetProjCostTypeNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudgetOther/GetProjCostTypeNV",
    {
      params
    }
  );
};

// 获取预算（月度）列表NV
export const GetBudgetListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudget/GetListNV",
    {
      params
    }
  );
};

// 新增项目人员预算
export const CreateStaffbudget = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudgetStaff/Create",
    {
      data
    }
  );
};

// 删除项目人员预算
export const DeleteStaffbudget = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudgetStaff/Delete",
    {
      params
    }
  );
};

// 获取项目人员预算详情
export const GetStaffbudget = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudgetStaff/Get",
    {
      params
    }
  );
};

// 获取项目人员预算列表
export const StaffbudgetList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudgetStaff/GetList",
    {
      params
    }
  );
};

// 更新项目人员预算
export const UpdateStaffbudget = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjBudgetStaff/Update",
    {
      data
    }
  );
};

// 新增主合同
export const CreatePrimary = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/CreatePrimary",
    {
      data
    }
  );
};

// 新增补充合同
export const CreateSecondary = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/CreateSecondary",
    {
      data
    }
  );
};

// 删除合同
export const DeleteContract = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/Delete",
    {
      params
    }
  );
};

// 获取合同列表
export const GetContractList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/GetList",
    {
      params
    }
  );
};

// 获取主合同详情信息
export const GetPrimary = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/GetPrimary",
    {
      params
    }
  );
};

// // 获取补充合同详情信息
export const GetSecondary = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/GetSecondary",
    {
      params
    }
  );
};

// 更新补充合同
export const UpdateSecondary = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/UpdateSecondary",
    {
      data
    }
  );
};

// 更新主合同
export const UpdatePrimary = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/UpdatePrimary",
    {
      data
    }
  );
};

// 获取主合同列表NV
export const GetListPrimaryNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/GetListPrimaryNV",
    {
      params
    }
  );
};

// 获取补充合同列表NV
export const GetListSecondaryNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/GetListSecondaryNV",
    {
      params
    }
  );
};

// 获取所有合同类型NV
export const GetProjContractTypeNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjContract/GetProjContractTypeNV",
    {
      params
    }
  );
};

//新增项目总成本
export const CreateProjCost = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCost/Create",
    {
      data
    }
  );
};

// 删除项目总成本
export const DeleteProjCost = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCost/Delete",
    {
      params
    }
  );
};

// 获取项目总成本详情
export const GetProjCost = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/ProjCost/Get", {
    params
  });
};

// 项目总成本列表
export const GetListProjCost = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCost/GetList",
    {
      params
    }
  );
};

// 项目总成本列表NV
export const GetListNVProjCost = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCost/GetListNV",
    {
      params
    }
  );
};

//更新项目总成本
export const UpdateProjCost = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCost/Update",
    {
      data
    }
  );
};

//新增其他成本
export const CreateCostOther = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCostOther/Create",
    {
      data
    }
  );
};

// 删除其他成本
export const DeleteCostOther = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCostOther/Delete",
    {
      params
    }
  );
};

// 获取项目其他成本详情
export const GetCostOther = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCostOther/Get",
    {
      params
    }
  );
};

// 项目其他成本列表
export const GetListCostOther = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCostOther/GetList",
    {
      params
    }
  );
};

//更新项目其他成本
export const UpdateCostOther = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCostOther/Update",
    {
      data
    }
  );
};

//新增人员成本
export const CreateCostpeople = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCostStaff/Create",
    {
      data
    }
  );
};

// 删除其他成本
export const DeleteCostpeople = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCostStaff/Delete",
    {
      params
    }
  );
};

// 获取项目人员成本详情
export const GetCostpeople = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCostStaff/Get",
    {
      params
    }
  );
};

// 项目人员成本列表
export const GetListCostpeople = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCostStaff/GetList",
    {
      params
    }
  );
};

//更新人员其他成本
export const UpdateCostpeople = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjCostStaff/Update",
    {
      data
    }
  );
};

//审核项目收入
export const Approve = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncApply/Approve",
    {
      data
    }
  );
};

//新增/申请项目收入
export const CreateApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncApply/Create",
    {
      data
    }
  );
};

// 删除项目收入
export const DeleteApply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncApply/Delete",
    {
      params
    }
  );
};

// 获取项目收入详情
export const GetApply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncApply/Get",
    {
      params
    }
  );
};

// 获取项目收入列表
export const GetApplyList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncApply/GetList",
    {
      params
    }
  );
};

//更新项目收入
export const UpdateApply = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncApply/Update",
    {
      data
    }
  );
};

// 根据项目id获取准备数据（收入申请）
export const GetPrepare = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncApply/GetPrepare",
    {
      params
    }
  );
};

//新增/申请开票申请
export const CreateInvoice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncInvoice/Create",
    {
      data
    }
  );
};

// 删除开票申请
export const DeleteInvoice = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncInvoice/Delete",
    {
      params
    }
  );
};

//审核开票申请
export const ApproveInvoice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncInvoice/Approve",
    {
      data
    }
  );
};

// 获取项目开票申请详情
export const GetInvoice = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncInvoice/Get",
    {
      params
    }
  );
};

// 获取项目开票申请列表
export const GetInvoiceList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncInvoice/GetList",
    {
      params
    }
  );
};

//更新项目开票
export const UpdateInvoice = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncInvoice/Update",
    {
      data
    }
  );
};

// 根据项目id获取准备数据（开票申请）
export const GetPrepareInvoice = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncInvoice/GetPrepare",
    {
      params
    }
  );
};

// 根据项目id获取开票列表
export const GetListNVByProjId = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncInvoice/GetListNVByProjId",
    {
      params
    }
  );
};

//新增项目收入财务
export const CreateFinance = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncFinance/Create",
    {
      data
    }
  );
};

// 删除项目收入财务
export const DeleteFinance = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncFinance/Delete",
    {
      params
    }
  );
};

// 获取项目收入财务详情
export const GetFinance = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncFinance/Get",
    {
      params
    }
  );
};

// 获取项目收入财务列表
export const GetFinanceList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncFinance/GetList",
    {
      params
    }
  );
};

//更新项目收入财务
export const UpdateFinance = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncFinance/Update",
    {
      data
    }
  );
};

// 根据项目开票申请id获取准备数据（仅用于创建申请时）
export const GetPrepareFinance = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProjIncFinance/GetPrepare",
    {
      params
    }
  );
};
