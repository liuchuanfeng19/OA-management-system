import { http, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取房屋详情
export const Getbuilds = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Builds/Get", {
    params
  });
};

// 新增房屋
export const Createbuild = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/Builds/Create", {
    data
  });
};

// 获取房屋列表
export const GetbuildsList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Builds/GetList", {
    params
  });
};

// 更新房屋
export const Updatebuild = (data?: object): ResponseType => {
  return http.request("post", getBaseUrl("DOMAIN_BUS") + "/api/Builds/Update", {
    data
  });
};

// 删除房屋列表信息
export const DeletebuildsList = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Builds/Delete", {
    params
  });
};

// 获取房屋列表NV
export const GetListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Builds/GetListNV",
    {
      params
    }
  );
};

// 获取闲置房屋列表NV
export const GetFreeListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Builds/GetFreeListNV",
    {
      params
    }
  );
};

// 获取所有房屋状态NV
export const GetBuildsStatusNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Builds/GetBuildsStatusNV",
    {
      params
    }
  );
};

// 获取所有房屋租赁方式NV
export const GetBuildsLeaseTypeNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Builds/GetBuildsLeaseTypeNV",
    {
      params
    }
  );
};

// 获取房屋来源NV
export const GetBuildsTypeNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Builds/GetBuildsTypeNV",
    {
      params
    }
  );
};

// 获取租赁列表
export const GetLeaseList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsLease/GetList",
    {
      params
    }
  );
};

// 获取租赁详情
export const GetLease = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsLease/Get",
    {
      params
    }
  );
};

// 获取所有租赁付款方式NV
export const GetPayMethodNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsLease/GetBuildsRenterMethodNV",
    {
      params
    }
  );
};

// 删除租赁
export const DeleteLease = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsLease/Delete",
    {
      params
    }
  );
};

// 新增租赁
export const CreateLease = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsLease/Create",
    {
      data
    }
  );
};

// 更新租赁
export const UpdateLease = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsLease/Update",
    {
      data
    }
  );
};

// 新增房间
export const CreateRoom = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsRoom/Create",
    {
      data
    }
  );
};

// 更新房间
export const UpdateRoom = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsRoom/Update",
    {
      data
    }
  );
};

// 删除房间
export const DeleteRoom = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsRoom/Delete",
    {
      params
    }
  );
};

// 房间详情
export const GetRoom = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/BuildsRoom/Get", {
    params
  });
};

// 获取所有租赁方式NV
export const GetBuildsRenterMethodNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsRoom/GetBuildsRenterMethodNV",
    {
      params
    }
  );
};

// 获取所有房间状态NV
export const GetBuildsRoomStatusNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsRoom/GetBuildsRoomStatusNV",
    {
      params
    }
  );
};

// 获取闲置房间列表NV
export const GetFreeRoomListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsRoom/GetFreeListNV",
    {
      params
    }
  );
};

// 获取房间列表
export const GetRoomList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsRoom/GetList",
    {
      params
    }
  );
};

// 获取房间列表NV
export const GetRoomListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsRoom/GetListNV",
    {
      params
    }
  );
};

// 获取租赁人列表
export const GetLesseeList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsRenter/GetList",
    {
      params
    }
  );
};

// 获取租赁人详情
export const GetLessee = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsRenter/Get",
    {
      params
    }
  );
};

// 删除租赁人
export const DeleteLessee = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsRenter/Delete",
    {
      params
    }
  );
};

// 更新租赁人
export const UpdateLessee = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsRenter/Update",
    {
      data
    }
  );
};

// 创建租赁人
export const CreateLessee = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsRenter/Create",
    {
      data
    }
  );
};

// 创建房屋租赁提醒
export const CreateNotify = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsNotifySetting/Create",
    {
      data
    }
  );
};

// 更新房屋租赁提醒
export const UpdateNotify = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsNotifySetting/Update",
    {
      data
    }
  );
};

// 删除房屋租赁提醒
export const DeleteNotify = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsNotifySetting/Delete",
    {
      params
    }
  );
};

// 房屋租赁提醒详情
export const GetNotify = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsNotifySetting/Get",
    {
      params
    }
  );
};

// 房屋租赁提醒列表
export const GetNotifyList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsNotifySetting/GetList",
    {
      params
    }
  );
};

// 房屋租赁提醒类型NV
export const GetBuildsNotifyTypeNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsNotifySetting/GetBuildsNotifyTypeNV",
    {
      params
    }
  );
};

// 退租
export const StopLease = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsLease/StopLease",
    {
      data
    }
  );
};

// 获取所有租赁状态NV
export const GetBuildsLeaseStatusNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuildsLease/GetBuildsLeaseStatusNV",
    {
      params
    }
  );
};
