import { http, downloadHttp, getBaseUrl } from "@/utils/http";

interface ResponseType extends Promise<any> {
  data?: object;
  status?: number;
  message?: string;
  success?: boolean;
  code?: number;
}

// 获取招标项目列表
export const getBiddingList = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/GetBiddingList",
    {
      data
    }
  );
};

// 获取招标项目name-value列表
export const getBiddingListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/GetListNV",
    {
      params
    }
  );
};

// 获取招标项目采购方式name-value列表
export const getBiddingBuyMethod = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/GetBiddingBuyMethod",
    {
      params
    }
  );
};

// 获取招标项目公告类型name-value列表
export const getBiddingNoticeType = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/GetBiddingNoticeType",
    {
      params
    }
  );
};

// 获取招标项目详情
export const getBiddingDetail = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/Bidding/Get", {
    params
  });
};

// 设置招标项目是否参与
export const markInBidding = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/MarkIn",
    {
      data
    }
  );
};

// 设置招标项目是否确认
export const confirmBidding = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/MarkConfirm",
    {
      data
    }
  );
};

// 保存招标项目
export const createBidding = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/Create",
    {
      data
    }
  );
};

// 编辑招标项目
export const updateBidding = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/Update",
    {
      data
    }
  );
};

// 删除招标项目
export const DeleteBidding = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/DeleteBidding",
    {
      params
    }
  );
};

//新增采购主体
export const Create = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuySubject/Create",
    {
      data
    }
  );
};

//删除采购主体
export const deleteBuySubject = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuySubject/Delete",
    {
      params
    }
  );
};

//根据id获取采购主体详情
export const GetBuySubject = (params?: object): ResponseType => {
  return http.request("get", getBaseUrl("DOMAIN_BUS") + "/api/BuySubject/Get", {
    params
  });
};

//获取采购详情树列表
export const GetTreeList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/BuySubject/GetTreeList",
    {
      params
    }
  );
};

//编辑/更新采购主体
export const Update = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/BuySubject/Update",
    {
      data
    }
  );
};

//导出招标公告
export const ExportBiddingList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/ExportBiddingList",
    {
      params
    }
  );
};

//导出参与项目
export const ExportInList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/ExportInList",
    {
      params
    }
  );
};

// 设置招标项目是否确认
export const MarkConfirm = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/MarkConfirm",
    {
      data
    }
  );
};

//获取所有参与状态
export const GetBiddingInStatus = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/GetBiddingInStatus",
    {
      params
    }
  );
};

//获取所有投标状态
export const GetBiddingStatus = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/GetBiddingStatus",
    {
      params
    }
  );
};

// 获取参与项目列表
export const GetInList = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/GetInList",
    {
      params
    }
  );
};

// 设置投标状态
export const UpdateBiddingStatus = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/UpdateBiddingStatus",
    {
      data
    }
  );
};

// 设置参与状态
export const UpdateInStatus = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/UpdateInStatus",
    {
      data
    }
  );
};

// 获取列表nv(投标状态：投标)
export const GetBiddingListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/GetBiddingListNV",
    {
      params
    }
  );
};

// 获取列表nv(参与状态：已参与)
export const GetInListNV = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/GetInListNV",
    {
      params
    }
  );
};

// 删除参与项目
export const DeleteIn = (params?: object): ResponseType => {
  return http.request(
    "get",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/DeleteIn",
    {
      params
    }
  );
};

// 添加招标公告
export const CreateBidding = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/CreateBidding",
    {
      data
    }
  );
};

// 添加参与项目
export const CreateIn = (data?: object): ResponseType => {
  return http.request(
    "post",
    getBaseUrl("DOMAIN_BUS") + "/api/Bidding/CreateIn",
    {
      data
    }
  );
};

///批量下载
export function getMoreDownload(form) {
  // let buffer = "";
  // for (const key in params) {
  //   if (Object.prototype.hasOwnProperty.call(params, key)) {
  //     buffer += key + "=" + params[key] + "&";
  //   }
  // }
  // if (buffer.length > 0) {
  //   buffer = buffer.substring(0, buffer.length - 1);
  // }
  // const url =
  //   getBaseUrl("DOMAIN_BUS") + "/api/Bidding/DownloadBiddingAttach?" + buffer;
  const url = getBaseUrl("DOMAIN_BUS") + "/api/Bidding/DownloadBiddingAttach";
  return new Promise((reslove, reject) => {
    downloadHttp
      .post(url, {
        responseType: "blob", //服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'，默认是'json'
        data: form
      })
      .then((res: BlobPart) => {
        if (!res) {
          reject(null);
          return;
        }
        const blob = new Blob([res], {
          type: "application/zip"
        });
        if (blob.size > 0) {
          const nav = window.navigator as any;
          if (nav.msSaveOrOpenBlob) {
            //兼容IE10
            nav.msSaveBlob(blob, "招标公告附件");
          } else {
            const href = URL.createObjectURL(blob); //创建新的URL表示指定的blob对象
            const a = document.createElement("a"); //创建a标签
            a.style.display = "none";
            a.href = href; // 指定下载链接
            a.download = "招标公告附件"; //指定下载文件名
            a.click(); //触发下载
            URL.revokeObjectURL(a.href); //释放URL对象
          }
        }
        reslove(null);
        // 这里也可以不创建a链接，直接window.open(href)也能下载
      })
      .catch(err => {
        console.log(err);
        reject(null);
      });
  });
}
