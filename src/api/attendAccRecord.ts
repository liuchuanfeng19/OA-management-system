import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取当前用户指定月份考勤明细
export const getAttendanceQuickByStaff = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendAccRecord/GetQuickByStaff",
    {
      params
    }
  );
};

// 获取当前用户指定月份考勤明细
export const getMyRecordByStaff = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendAccRecord/GetMyRecordByStaff",
    {
      params
    }
  );
};

// 获取考勤统计列表
export const getAttendAccRecordList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendAccRecord/GetList",
    {
      params
    }
  );
};

// 获取考勤状态类型列表
export const getAttendRecordStaffBusiTypeNV = (
  params?: object
): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") +
      "/api/AttendAccRecord/GetAttendRecordStaffBusiTypeNV",
    {
      params
    }
  );
};

// 获取考勤统计详情
export const getAttendAccRecord = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendAccRecord/Get",
    {
      params
    }
  );
};

// 保存考勤统计
export const addAttendAccRecord = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendAccRecord/Create",
    {
      data
    }
  );
};

// 编辑考勤统计
export const editAttendAccRecord = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendAccRecord/Update",
    {
      data
    }
  );
};

// 删除考勤统计
export const deleteAttendAccRecord = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendAccRecord/Delete",
    {
      params
    }
  );
};

// 考勤统计V2
export const GetListV2 = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/AttendAccRecord/GetListV2",
    {
      params
    }
  );
};
