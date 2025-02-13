import { defineStore } from "pinia";

import { store } from "@/store";
import type { commpnType } from "./types";
import { GetDocNV } from "@/api/projDocLend";
import { GetCityListNV } from "@/api/personnel";
import { GetBuildsLeaseTypeNV } from "@/api/builds";

export const userCommonStore = defineStore({
  id: "pure-common",
  state: (): commpnType => ({
    cityNVList: [],
    docLendNVList: [],
    leaseTypeNVList: []
  }),
  actions: {
    /**
     * 获取城市列表
     * @returns
     */
    getCityNVList() {
      return new Promise(resolve => {
        GetCityListNV({ includeAll: false })
          .then(({ data }) => {
            this.cityNVList = data || [];
            resolve(data);
          })
          .catch(() => {
            resolve([]);
          });
      });
    },
    /**
     * 获取借阅资料NV列表
     * @returns
     */
    getLendNVList() {
      return new Promise(resolve => {
        GetDocNV({ includeAll: false })
          .then(({ data }) => {
            this.docLendNVList = data || [];
            resolve(data);
          })
          .catch(() => {
            resolve([]);
          });
      });
    },
    /**
     * 获取租赁方式NV列表
     * @returns
     */
    getLeaseTypeNVList() {
      return new Promise(resolve => {
        GetBuildsLeaseTypeNV()
          .then(({ data }) => {
            this.leaseTypeNVList = data || [];
            resolve(data);
          })
          .catch(() => {
            resolve([]);
          });
      });
    }
  }
});

export function userCommonStoreHook() {
  return userCommonStore(store);
}
