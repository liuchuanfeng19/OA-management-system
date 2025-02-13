import { defineStore } from "pinia";

import { store } from "@/store";
import type { projectType } from "./types";
import { getProjectWinBidNVList } from "@/api/projectWinBid";

export const userProjectStore = defineStore({
  id: "pure-project",
  state: (): projectType => ({
    winBidProjectNVList: []
  }),
  actions: {
    getProjectWinBidNVList() {
      return new Promise(resolve => {
        getProjectWinBidNVList({})
          .then(({ data }) => {
            this.winBidProjectNVList = data || [];
            resolve(data);
          })
          .catch(() => {
            resolve([]);
          });
      });
    }
  }
});

export function userProjectStoreHook() {
  return userProjectStore(store);
}
