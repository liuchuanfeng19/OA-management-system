import md5 from "js-md5";
import axios from "axios";
import { http, getBaseUrl } from "@/utils/http";
import type { RequestMethods } from "@/utils/http/types";

//上传图片
export const uploadImg = (fdata?: Object) => {
  const AppKey = "45090E3F-C224-47D7-BED9-A2166B3C0A02";
  const data = new FormData();
  const file: File = fdata["file"];
  const str = (fdata["path"] + "/" + file.name + "&" + AppKey).toUpperCase();
  const sign = md5(str);
  data.append("AppId", "Web");
  data.append("Path", fdata["path"]);
  data.append("Files", file);
  data.append("Sign", sign);
  data.append("Overwrite", "0");
  return new Promise((resolve, reject) => {
    http
      .request("post", getBaseUrl("DOMAIN_FILE") + "/file/upload", {
        data
      })
      .then((response: ResponseType) => {
        if (response) {
          const paths = response["data"] as unknown as String[];
          const tPaths = [];
          if (paths && paths.length > 0) {
            paths.forEach((item: string) => {
              item = getBaseUrl("DOMAIN_FILE") + item;
              tPaths.push(item);
            });
          }
          response["data"] = tPaths;
        }
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

//上传发票
export const uploadInvoice = (fdata?: Object) => {
  const AppKey = "45090E3F-C224-47D7-BED9-A2166B3C0A02";
  const data = new FormData();
  const file: File = fdata["file"];
  const str = (fdata["path"] + "/" + file.name + "&" + AppKey).toUpperCase();
  const sign = md5(str);
  data.append("AppId", "Web");
  data.append("Path", fdata["path"]);
  data.append("InvoiceCategory", fdata["invoiceCategory"]);
  data.append("Files", file);
  data.append("Sign", sign);
  data.append("Overwrite", "0");
  return new Promise<any>((resolve, reject) => {
    http
      .request(
        "post",
        getBaseUrl("DOMAIN_BUS") + "/api/DailyExpense/ReceiptUpload",
        {
          data
        }
      )
      .then((response: ResponseType) => {
        if (response) {
          const paths = response["data"] as unknown as String[];
          const tPaths = [];
          if (paths && paths.length > 0) {
            paths.forEach((item: string) => {
              item = getBaseUrl("DOMAIN_FILE") + item;
              tPaths.push(item);
            });
          }
          response["data"] = tPaths;
        }
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

//上传文件
export const filesUpload = (fdata?: Object, timeout?: number) => {
  const AppKey = "45090E3F-C224-47D7-BED9-A2166B3C0A02";
  const data = new FormData();
  const file: File = fdata["file"];
  const str = (fdata["path"] + "/" + file.name + "&" + AppKey).toUpperCase();
  const sign = md5(str);
  data.append("AppId", "Web");
  data.append("Path", fdata["path"]);
  data.append("Files", file);
  data.append("Sign", sign);
  data.append("Overwrite", "0");
  return new Promise((resolve, reject) => {
    http
      .request("post", getBaseUrl("DOMAIN_FILE") + "/file/upload", {
        data,
        timeout
      })
      .then((response: ResponseType) => {
        resolve(response);
      })
      .catch(error => {
        reject(error);
      });
  });
};

//下载文件
export const downloadFile = (fileInfo?: any) => {
  const { url, params } = fileInfo;
  return new Promise((reslove, reject) => {
    axios({
      method: "get",
      url: url,
      responseType: "blob", //服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'，默认是'json'
      timeout: 0, // 默认值是 `0` (永不超时)
      params: params
    })
      .then(({ data, headers }) => {
        let fileName = url.substr(url.lastIndexOf("/") + 1);
        const contentDisposition = headers["content-disposition"];
        if (contentDisposition) {
          const name1 = contentDisposition.split(";")[2];
          if (name1) {
            const name2 = name1.split("filename*=")[1];
            if (name2) {
              const name3 = name2.split("''")[1];
              if (name3) {
                const name4 = name3.split(".")[0];
                if (name4) {
                  fileName = decodeURI(name4);
                }
              }
            }
          }
        }
        if (!data) {
          reslove("");
          return;
        }
        let blobType = "";
        const contentType = headers["content-type"];
        if (contentType) {
          blobType = contentType;
        }
        const blob = new Blob([data], {
          type: blobType
        });
        // if (window.navigator.msSaveOrOpenBlob) {
        //   //兼容IE10
        //   navigator.msSaveBlob(blob, fileName);
        // } else {
        const URL = window.URL || window.webkitURL;
        const href = URL.createObjectURL(blob); //创建新的URL表示指定的blob对象
        const a = document.createElement("a"); //创建a标签
        a.style.display = "none";
        a.href = href; // 指定下载链接
        a.download = fileName; //指定下载文件名
        document.body.appendChild(a);
        a.click(); //触发下载
        URL.revokeObjectURL(a.href); //释放URL对象
        document.body.removeChild(a); //下载完成移除
        // }
        // 这里也可以不创建a链接，直接window.open(href)也能下载
        reslove("");
      })
      .catch(err => {
        console.log("downloadFile err", err);
        reject();
      });
  });
};

//导出Excell
export const exportExcel = (params: {
  baseUrl?: "DOMAIN_BFW" | "DOMAIN_BUS";
  tempUrl: string;
  fileName?: string;
  form: any;
  _blobType: string;
  requestType: RequestMethods;
}) => {
  let { baseUrl, tempUrl, fileName, form, _blobType, requestType } = params;
  let buffer = "";
  for (const key in form) {
    if (Object.prototype.hasOwnProperty.call(form, key)) {
      if (form[key] != undefined) {
        buffer += key + "=" + form[key] + "&";
      }
    }
  }
  if (buffer.length > 0) {
    buffer = buffer.substring(0, buffer.length - 1);
  }
  const url =
    requestType == "post"
      ? getBaseUrl(baseUrl ? baseUrl : "DOMAIN_BUS") + tempUrl
      : getBaseUrl(baseUrl ? baseUrl : "DOMAIN_BUS") + tempUrl + buffer;

  return new Promise((reslove, reject) => {
    http
      .request(requestType ? requestType : "get", url, {
        responseType: "blob",
        data: requestType == "post" ? form : {} //服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'，默认是'json'
      })
      .then((res: any) => {
        // BlobPart;
        const { data, headers } = res;
        const contentDisposition = headers["content-disposition"];
        const contentType = headers["content-type"];
        if (contentDisposition) {
          const name1 = contentDisposition.split(";")[2];
          if (name1) {
            const name2 = name1.split("filename*=")[1];
            if (name2) {
              const name3 = name2.split("''")[1];
              if (name3) {
                const name4 = name3.split(".")[0];
                if (name4) {
                  fileName = decodeURI(name4);
                }
              }
            }
          }
        }
        if (!data) {
          reslove(null);
          return;
        }
        let blobType =
          form.exportType && form.exportType != "1" && form.exportType != "2"
            ? form.exportType == "excel"
              ? _blobType == "xls"
                ? "application/vnd.ms-excel"
                : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              : form.exportType == "word"
                ? "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                : form.exportType == "pdf"
                  ? "application/pdf"
                  : "text"
            : _blobType == "xls"
              ? "application/vnd.ms-excel"
              : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        if (contentType) {
          blobType = contentType;
        }
        const blob = new Blob([data as BlobPart], {
          type: blobType
          //type: "application/vnd.ms-excel" //xls
          // type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" //xlsx
        });
        const nav = window.navigator as any;
        if (nav.msSaveOrOpenBlob) {
          //兼容IE10
          nav.msSaveBlob(blob, fileName);
        } else {
          const href = URL.createObjectURL(blob); //创建新的URL表示指定的blob对象
          //window.open(href);
          const a = document.createElement("a"); //创建a标签
          a.style.display = "none";
          a.href = href; // 指定下载链接
          a.download = fileName; //指定下载文件名
          a.click(); //触发下载
          URL.revokeObjectURL(href); //释放URL对象
        }
        // 这里也可以不创建a链接，直接window.open(href)也能下载
        reslove(null);
      })
      .catch(err => {
        console.log(err);
        reject();
      });
  });
};
