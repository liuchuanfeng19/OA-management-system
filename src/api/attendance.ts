import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取考勤明细
export const getItemsList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Attendance/GetItemsList",
    {
      params
    }
  );
};

// 获取考勤统计
export const getStatisticsList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendAccRecord/GetList",
    {
      params
    }
  );
};

// 考勤统计
export const attendAccRecordStatistics = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendAccRecord/BatchSaveOrUpdate",
    {
      params
    }
  );
};

// 获取所有考勤类型
export const getBidCompanyNVList = (): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Attendance/GetAttTypes"
  );
};

// 获取当前用户的考勤
export const getAttendRecordCur = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Attendance/GetAttendRecordCur",
    {
      params
    }
  );
};

export const createAttend = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Attendance/Create",
    {
      data
    }
  );
};

// 获取考勤组
export const getAttendGroupList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/GetAttendGroupList",
    {
      params
    }
  );
};
// 删除考勤组
export const deleteAttendGroup = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/Delete",
    {
      params
    }
  );
};
// 获取考勤组详情
export const getAttendGroupDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/Get",
    {
      params
    }
  );
};
export const getAttendGroupDetailBasic = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/GetBasicData",
    {
      params
    }
  );
};
// 创建考勤组
// export const createAttendGroup = (data?: object): ResponseType => {
//   return http.request(
//     "post",
//     getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/Create",
//     {
//       data
//     }
//   );
// };
export const createAttendGroupBasic = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/CreateBasicData",
    {
      data
    }
  );
};
// 更新考勤组基本信息
export const updateAttendGroupBasic = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/UpdateBasicData",
    {
      data
    }
  );
};
// 更新考勤组加班规则信息
export const updateAttendGroupExData = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/UpdateExData",
    {
      data
    }
  );
};
// 获取加班详情
export const getExData = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/GetExData",
    {
      params
    }
  );
};
// 更新考勤组补卡规则信息
export const updateAttendGroupFixData = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/UpdateFixData",
    {
      data
    }
  );
};
// 获取补卡详情
export const getFixData = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/GetFixData",
    {
      params
    }
  );
};
// 更新考勤组打卡方式信息
export const updateAttendGroupHitData = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/UpdateHitData",
    {
      data
    }
  );
};

// 获取考勤组打卡方式地点
export const getAttendGroupHitAddrList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroupHitAddr/GetList",
    {
      params
    }
  );
};
// 添加考勤地点
export const createAttendGroupHitAddr = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroupHitAddr/Create",
    {
      data
    }
  );
};
// 删除考勤地点
export const deleteAttendGroupHitAddr = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroupHitAddr/Delete",
    {
      params
    }
  );
};
// 获取考勤组打卡方式wifi
export const getAttendGroupHitWiFiList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroupHitWiFi/GetList",
    {
      params
    }
  );
};
// 添加考勤wifi
export const createAttendGroupHitWiFi = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroupHitWiFi/Create",
    {
      data
    }
  );
};
// 删除考勤wifi
export const deleteAttendGroupHitWiFi = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroupHitWiFi/Delete",
    {
      params
    }
  );
};

// 更新考勤组休息日规则信息
export const updateAttendGroupRestData = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/UpdateRestData",
    {
      data
    }
  );
};
// 获取休息日详情
export const getRestData = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/GetRestData",
    {
      params
    }
  );
};
// 更新考勤组考勤时间信息
export const updateAttendGroupWorkData = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/UpdateWorkDay",
    {
      data
    }
  );
};
// 获取考勤时间详情
export const getWorkDay = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/GetWorkDay",
    {
      params
    }
  );
};
// 更新外勤
export const updateAttendGroupOutData = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/UpdateOutData",
    {
      data
    }
  );
};
// 获取外勤详情
export const getOutData = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendGroup/GetOutData",
    {
      params
    }
  );
};

// 获取员工剩余假期
export const getStaffLeaveBalanceList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffLeaveBalance/GetList",
    {
      params
    }
  );
};

// 获取员工剩余假期详情
export const getStaffLeaveBalance = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffLeaveBalanceItem/GetV2",
    {
      params
    }
  );
};

// 修改员工假期剩余天数
export const modifyDays = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffLeaveBalanceItem/ModifyDays",
    {
      data
    }
  );
};

// 获取员工原始打卡记录
export const getStaffAttendanceList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Attendance/GetList",
    {
      params
    }
  );
};

// 获取假期类型
export const getLeaveTypeNV = (): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveType/GetListNV"
  );
};
// 创建假期规则
export const createLeaveType = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveType/Create",
    {
      data
    }
  );
};
// 更新假期规则
export const updateLeaveType = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveType/Update",
    {
      data
    }
  );
};
// 删除假期规则
export const deleteLeaveType = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveType/Delete",
    {
      params
    }
  );
};
// 获取假期规则列表
export const getLeaveTypeList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/LeaveType/GetList",
    {
      params
    }
  );
};
// 获取假期规则详情
export const getLeaveType = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/LeaveType/Get", {
    params
  });
};

// 获取员工假期余额日志详情
export const getStaffLeaveBalanceItemLog = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffLeaveBalanceItemLog/Get",
    {
      params
    }
  );
};

// 获取员工假期余额日志列表
export const getStaffLeaveBalanceItemLogList = (
  params?: object
): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/StaffLeaveBalanceItemLog/GetList",
    {
      params
    }
  );
};

// 创建国假
export const createAttendFestival = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendFestival/Create",
    {
      data
    }
  );
};
// 更新国假
export const updateAttendFestival = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendFestival/Update",
    {
      data
    }
  );
};
// 删除国假
export const deleteAttendFestival = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendFestival/Delete",
    {
      params
    }
  );
};
// 获取国假列表
export const getAttendFestivalList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendFestival/GetList",
    {
      params
    }
  );
};
// 获取国假详情
export const getAttendFestival = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendFestival/Get",
    {
      params
    }
  );
};

// 创建补班
export const addAttendWorkDay = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendWorkDay/Add",
    {
      data
    }
  );
};
// 更新补班
export const updateAttendWorkDay = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendWorkDay/Update",
    {
      data
    }
  );
};
// 删除补班
export const deleteAttendWorkDay = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendWorkDay/Delete",
    {
      data
    }
  );
};
// 获取补班列表
export const getAttendWorkDayPages = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendWorkDay/GetPages",
    {
      params
    }
  );
};
// 获取补班详情
export const getAttendWorkDay = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendWorkDay/GetOne",
    {
      params
    }
  );
};
