import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取出差列表
export const getBusinessTravelList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BusiTripApply/GetBusiTripApplyList",
    {
      params
    }
  );
};
// 获取抄送人NV
export const getBusiTripCcStaffListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BusiTripApply/GetCcStaffListNV",
    {
      params
    }
  );
};

// 获取出差详情
export const getBusinessTravel = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BusiTripApply/GetBusiTripApplyDetail",
    {
      params
    }
  );
};

// 创建出差申请
export const createBusinessTravel = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BusiTripApply/Create",
    {
      data
    }
  );
};

// 更新出差申请
export const updateBusinessTravel = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BusiTripApply/Update",
    {
      data
    }
  );
};

// 删除出差申请
export const deleteBusinessTravel = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BusiTripApply/Delete",
    {
      params
    }
  );
};
//出差审批是否通过

export const Approvecc = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BusiTripApply/Approve",
    {
      data
    }
  );
};
//新建出差获取审批人员列表
export const CreateReviewerscc = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BusiTripApply/CreateReviewers",
    {
      data
    }
  );
};

// 获取请假列表
export const getLeaveList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/GetLeaveApplyList",
    {
      params
    }
  );
};

// 获取请假详情
export const getLeave = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/GetLeaveApplyDetail",
    {
      params
    }
  );
};

// 创建请假申请
export const createLeave = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/Create",
    {
      data
    }
  );
};

// 更新请假申请
export const updateLeave = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/Update",
    {
      data
    }
  );
};

// 删除请假申请
export const deleteLeave = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/Delete",
    {
      params
    }
  );
};

// 获取请假类型key value
export const getAllLeaveTypes = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/GetLeaveTypes",
    {
      params
    }
  );
};

// 请假审批申请是否同意
export const Approve = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/Approve",
    {
      data
    }
  );
};

// 获取请假类型NV
export const GetLeaveTypesNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/GetLeaveTypesNV",
    {
      params
    }
  );
};
// 获取抄送人NV
export const getCcStaffListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/GetCcStaffListNV",
    {
      params
    }
  );
};

// 创建人员基础信息
export const create = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/Staff/Create", {
    data
  });
};

// 更新人员基础信息
export const update = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/Staff/Update", {
    data
  });
};

// 获取人员列表
export const getStaffList = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetStaffList",
    {
      data
    }
  );
};

// 获取人员基础信息（修改时带入数据接口）
export const GetStaff = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetStaff", {
    params
  });
};

// 删除人员列表信息
export const deleteStaffList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Staff/Delete", {
    params
  });
};

// 获取转正列表
export const GetStaffOnList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffLifeCycle/GetStaffOnList",
    {
      params
    }
  );
};

// 获取转正详情
export const GetStaffOnInfo = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffLifeCycle/GetStaffOnInfo",
    {
      params
    }
  );
};

// 更新转正详情
export const UpdateStaffOn = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffLifeCycle/UpdateStaffOn",
    {
      data
    }
  );
};

// ------工作经历-------
//获取工作经历列表
export const GeWorkExperienceList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetWorkExperienceList",
    {
      params
    }
  );
};

// 创建工作经历
export const CreateWorkExperience = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/CreateWorkExperience",
    {
      data
    }
  );
};

// 获取工作经历详情（修改时带入数据接口）
export const GetStGetWorkExperienceaff = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetWorkExperience",
    {
      params
    }
  );
};

// 删除工作经历
export const DeleteWorkExperience = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/DeleteWorkExperience",
    {
      params
    }
  );
};

// 更新工作经历信息
export const UpdateWorkExperience = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/UpdateWorkExperience",
    {
      data
    }
  );
};

// ------教育经历-------
//获取教育经历列表
export const GeEducationExperienceList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetEducationExperienceList",
    {
      params
    }
  );
};
// 创建教育经历
export const CreateEducationExperience = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/CreateEducationExperience",
    {
      data
    }
  );
};

// 获取教育经历详情（修改时带入数据接口）
export const GetEducationExperience = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetEducationExperience",
    {
      params
    }
  );
};

// 删除教育经历
export const DeleteEducationExperience = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/DeleteEducationExperience",
    {
      params
    }
  );
};

// 更新教育经历信息
export const UpdateEducationExperience = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/UpdateEducationExperience",
    {
      data
    }
  );
};

// ------资质证书-------
//获取资质证书列表
export const GetQualificationCertificateList = (
  data?: object
): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetQualificationCertificateList",
    {
      data
    }
  );
};
// 创建资质证书
export const CreateQualificationCertificate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/CreateQualificationCertificate",
    {
      data
    }
  );
};

// 获取资质证书详情（修改时带入数据接口）
export const GetQualificationCertificate = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetQualificationCertificate",
    {
      params
    }
  );
};

// 删除资质证书
export const DeleteQualificationCertificate = (
  params?: object
): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/DeleteQualificationCertificate",
    {
      params
    }
  );
};

// 更新资质证书信息
export const UpdateQualificationCertificate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/UpdateQualificationCertificate",
    {
      data
    }
  );
};

// ------奖惩记录-------
//获取奖惩记录列表
export const GetRewardPunishmentList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetRewardPunishmentList",
    {
      params
    }
  );
};

// 创建奖惩记录
export const CreateRewardPunishment = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/CreateRewardPunishment",
    {
      data
    }
  );
};

// 获取奖惩记录详情（修改时带入数据接口）
export const GetRewardPunishment = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetRewardPunishment",
    {
      params
    }
  );
};

// 删除奖惩记录
export const DeleteRewardPunishment = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/DeleteRewardPunishment",
    {
      params
    }
  );
};

// 更新奖惩记录
export const UpdateRewardPunishment = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/UpdateRewardPunishment",
    {
      data
    }
  );
};

// ------家庭信息-------
//获取家庭信息列表
export const GetStaffFamilyList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetStaffFamilyList",
    {
      params
    }
  );
};

// 创建家庭信息
export const CreateStaffFamily = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/CreateStaffFamily",
    {
      data
    }
  );
};

// 获取家庭信息详情（修改时带入数据接口）
export const GetStaffFamily = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetStaffFamily",
    {
      params
    }
  );
};

// 删除家庭信息
export const DeleteStaffFamily = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/DeleteStaffFamily",
    {
      params
    }
  );
};

// 更新家庭信息
export const UpdateStaffFamily = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/UpdateStaffFamily",
    {
      data
    }
  );
};

// ------薪酬福利-------
//获取薪酬福利
export const GetStaffBenefitsByStaffId = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetStaffBenefitsByStaffId",
    {
      params
    }
  );
};

// 创建/保存薪酬福利
export const SaveStaffBenefits = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/SaveStaffBenefits",
    {
      data
    }
  );
};

// 删除薪酬福利
export const DeleteStaffBenefits = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/DeleteStaffBenefits",
    {
      params
    }
  );
};

//获取所有岗位类型
export const GetStaffJobTypes = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetStaffJobTypes",
    {
      params
    }
  );
};

//同意/拒绝转正
export const ConfirmStaffOn = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffLifeCycle/ConfirmStaffOn",
    {
      data
    }
  );
};

//同意/拒绝离职
export const ConfirmStaffOff = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffLifeCycle/ConfirmStaffOff",
    {
      data
    }
  );
};

//新建请假获取审批人员
export const CreateReviewers = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/CreateReviewers",
    {
      data
    }
  );
};

//撤回请假申请
export const Cancel = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/Cancel",
    {
      data
    }
  );
};

//撤回出差申请
export const Cancelcc = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BusiTripApply/Cancel",
    {
      data
    }
  );
};
//获取员工资质类型
export const GetStaffQualiTypes = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetStaffQualiTypes",
    {
      params
    }
  );
};

//获取员工在职状态
export const GeJobStatusListNv = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffLifeCycle/GeJobStatusListNv",
    {
      params
    }
  );
};

//获取请假状态
export const GetLeaveApplyStatus = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveApply/GetLeaveApplyStatus",
    {
      params
    }
  );
};

//获取出差方式类型
export const GetBusiTripMethodTypesNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BusiTripApply/GetBusiTripMethodTypesNV",
    {
      params
    }
  );
};
//获取出差状态
export const GetBusiTripApplyStatus = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BusiTripApply/GetBusiTripApplyStatus",
    {
      params
    }
  );
};

//获取出差城市
export const GetCityListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/ProvinceCity/GetCityListNV",
    {
      params
    }
  );
};

//获取所有出差类型MV
export const GetBusiTripApplyTypeNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BusiTripApply/GetBusiTripApplyTypeNV",
    {
      params
    }
  );
};

//获取离职表单详情
export const GetStaffOffDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffLifeCycle/GetStaffOffDetail",
    {
      params
    }
  );
};

//获取转正表单详情
export const GetStaffOnDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffLifeCycle/GetStaffOnDetail",
    {
      params
    }
  );
};

// 获取通讯录列表
export const GetStaffMailList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetStaffMailList",
    {
      params
    }
  );
};

// 获取学历列表
export const getEducationLevelNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetEducationLevelNV",
    {
      params
    }
  );
};

// 获取学位列表
export const getDegreeNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetDegreeNV",
    {
      params
    }
  );
};

// 获取奖惩列表
export const getRpTypeNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Staff/GetRpTypeNV",
    {
      params
    }
  );
};

// 获取所有员工在职状态nv
export const GeMyJobStatusListNv = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffLifeCycle/GeMyJobStatusListNv",
    {
      params
    }
  );
};
