import { http, exportHttp, getBaseUrl } from "@/utils/http";

export const exportExcel = (tempUrl, fileName, form) => {
  let buffer = "";
  for (const key in form) {
    if (Object.prototype.hasOwnProperty.call(form, key)) {
      buffer += key + "=" + form[key] + "&";
    }
  }
  if (buffer.length > 0) {
    buffer = buffer.substring(0, buffer.length - 1);
  }
  const url = getBaseUrl("DOMAIN_BUS") + tempUrl + buffer;

  return new Promise((reslove, reject) => {
    exportHttp
      .request("get", url, {
        responseType: "blob" //服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'，默认是'json'
      })
      .then((res: any) => {
        // BlobPart;
        const { data, headers } = res;
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
          reslove(null);
          return;
        }
        const blob = new Blob([data as BlobPart], {
          //type: "application/vnd.ms-excel" //xls
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" //xlsx
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

export const batchExportExcel = (tempUrl, fileName, form) => {
  // let buffer = "";
  // for (const key in form) {
  //   if (Object.prototype.hasOwnProperty.call(form, key)) {
  //     buffer += key + "=" + form[key] + "&";
  //   }
  // }
  // if (buffer.length > 0) {
  //   buffer = buffer.substring(0, buffer.length - 1);
  // }
  // const url = getBaseUrl("DOMAIN_BUS") + tempUrl + buffer;
  const url = getBaseUrl("DOMAIN_BUS") + tempUrl;
  return new Promise((reslove, reject) => {
    http
      .request("post", url, {
        responseType: "blob", //服务器响应的数据类型，可以是 'arraybuffer', 'blob', 'document', 'json', 'text', 'stream'，默认是'json'
        data: form
      })
      .then((res: BlobPart) => {
        if (!res) {
          reject(null);
          return;
        }
        const blob = new Blob([res], {
          //type: "application/vnd.ms-excel" //xls
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" //xlsx
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
        reslove(null);
        // 这里也可以不创建a链接，直接window.open(href)也能下载
      })
      .catch(err => {
        console.log(err);
        reject(null);
      });
  });
};
