import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取车辆列表
export const getCarList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInfo/GetCarInfoList",
    {
      params
    }
  );
};

// 获取车辆详情
export const getCarDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInfo/GetCarInfoDetail",
    {
      params
    }
  );
};

// 创建车辆
export const createCar = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInfo/Create",
    {
      data
    }
  );
};
// 更新车辆
export const updateCar = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInfo/Update",
    {
      data
    }
  );
};

// 删除车辆
export const deleteCar = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInfo/Delete",
    {
      data
    }
  );
};

// 获取我的车辆申请列表
export const getMyApplyCarList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInfo/AppliedCars",
    {
      params
    }
  );
};

// 获取司机列表
export const getDriverInfoList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/DriverInfo/GetDriverInfoList",
    {
      params
    }
  );
};

// 获取司机详情
export const getDriverInfo = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/DriverInfo/GetDriverInfoDetail",
    {
      params
    }
  );
};

// 保存司机
export const saveDriverInfo = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/DriverInfo/Save",
    {
      data
    }
  );
};

// 申请用车
export const applyUseCar = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApply/Create",
    {
      data
    }
  );
};

// 获取车辆申请列表
export const getCarApplyNoteList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApply/GetApplyNoteList",
    {
      params
    }
  );
};

// 新增违章记录
export const createCarIllegal = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarIllegal/Create",
    {
      data
    }
  );
};

// 删除违章记录
export const deleteCarIllegal = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarIllegal/Delete",
    {
      params
    }
  );
};

// 获取违章记录详情
export const getCarIllegalDetail = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/CarIllegal/Get", {
    params
  });
};

// 获取违章记录列表
export const getCarIllegalList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarIllegal/GetList",
    {
      params
    }
  );
};

// 修改违章记录
export const updateCarIllegal = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarIllegal/Update",
    {
      data
    }
  );
};

// -------------------------新接口
// 获取车辆列表新
export const GetList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInformation/GetList",
    {
      params
    }
  );
};

// 删除车辆
export const Delete = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInformation/Delete",
    {
      params
    }
  );
};

// 新增车辆
export const Create = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInformation/Create",
    {
      data
    }
  );
};

// 更新车辆
export const Update = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInformation/Update",
    {
      data
    }
  );
};

// 获取所有车辆状态
export const GetCarStatusTypesNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInformation/GetCarStatusTypesNV",
    {
      params
    }
  );
};

// 更新获取详情信息
export const Get = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInformation/Get",
    {
      params
    }
  );
};

// 获取车辆保险记录列表
export const GetByCarInformationIdList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInsurance/GetByCarInformationIdList",
    {
      params
    }
  );
};

// 新增车辆保险记录
export const CreateInsurance = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInsurance/Create",
    {
      data
    }
  );
};

// 更新车辆保险记录
export const UpdateInsurance = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInsurance/Update",
    {
      data
    }
  );
};

// 更新获取车辆保险记录详情信息
export const GetInsurance = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInsurance/Get",
    {
      params
    }
  );
};

// 删除车辆保险记录
export const DeleteInsurance = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInsurance/Delete",
    {
      params
    }
  );
};

// 车辆信息列表（NV）获取车辆id
export const GetListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInformation/GetListNV",
    {
      params
    }
  );
};

// 获取车辆保养/维修列表
export const GetListByCarInformationId = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarMaintain/GetListByCarInformationId",
    {
      params
    }
  );
};

// 新增车辆维修/保养
export const CreateMaintain = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarMaintain/Create",
    {
      data
    }
  );
};

// 更新车辆车辆维修/保养
export const UpdateMaintain = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarMaintain/Update",
    {
      data
    }
  );
};

// 删除车辆维修/保养
export const DeleteMaintain = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarMaintain/Delete",
    {
      params
    }
  );
};

// 更新获取车辆维修/保养详情信息
export const GetMaintain = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarMaintain/Get",
    {
      params
    }
  );
};

// 获取车辆违章列表
export const GetListByCarIllegal = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarIllegal/GetListByCarInformationId",
    {
      params
    }
  );
};

// 新增车辆违章
export const CreateIllegal = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarIllegal/Create",
    {
      data
    }
  );
};

// 更新车辆车辆违章
export const UpdateIllegal = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarIllegal/Update",
    {
      data
    }
  );
};

// 删除车辆违章
export const DeleteIllegal = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarIllegal/Delete",
    {
      params
    }
  );
};

// 更新获取车辆违章详情
export const GeIllegal = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/CarIllegal/Get", {
    params
  });
};

// 新增驾驶员
export const createDriver = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarDriverInformation/Create",
    {
      data
    }
  );
};

// 删除驾驶员
export const deleteDriver = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarDriverInformation/Delete",
    {
      params
    }
  );
};

// 获取驾驶员详情
export const getDriverDetail = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarDriverInformation/Get",
    {
      params
    }
  );
};

// 获取驾驶员列表
export const getDriverList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarDriverInformation/GetList",
    {
      params
    }
  );
};

// 更新驾驶员
export const updateDriver = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarDriverInformation/Update",
    {
      data
    }
  );
};

// 获取驾驶员状态列表
export const getDriverStatusList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") +
      "/api/CarDriverInformation/GetDriverStatusTypesNV",
    {
      params
    }
  );
};

// 获取所有状态（保养/维修）
export const GetCarMaintainTypeNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarMaintain/GetCarMaintainTypeNV",
    {
      params
    }
  );
};

// 车牌模糊查询
export const GetCarLicensePlatePattern = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInformation/GetCarLicensePlatePattern",
    {
      params
    }
  );
};

//获取司机列表
export const GetDriverListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarDriverInformation/GetDriverListNV",
    {
      params
    }
  );
};

//获取可用司机列表
export const GetAvailableDriverListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarDriverInformation/GetAvailableListNV",
    {
      params
    }
  );
};

// 用车申请审核
export const Approve = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/Approve",
    {
      data
    }
  );
};

// 用车申请新增
export const CarApplyCreate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/Create",
    {
      data
    }
  );
};

//删除用车申请
export const CarApplyDelete = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/Delete",
    {
      params
    }
  );
};

//获取用车申请详情
export const GetCarApply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/Get",
    {
      params
    }
  );
};

//获取所有审核类型NV
export const GetCarApplyStatusNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/GetCarApplyStatusNV",
    {
      params
    }
  );
};

//用车申请列表
export const GetListCarApply = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/GetList",
    {
      params
    }
  );
};

// 更新用车申请
export const CarApplyUpdate = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/Update",
    {
      data
    }
  );
};

//获取可用车辆NV
export const GetAvailableListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/CarInformation/GetAvailableListNV",
    {
      params
    }
  );
};

// 还车
export const ReturnBack = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/CarApplyRecord/ReturnBack",
    {
      data
    }
  );
};
