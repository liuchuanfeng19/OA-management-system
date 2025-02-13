import { defineStore } from "pinia";

import { store } from "@/store";
import type { staffType } from "./types";
import { getStaffListNV } from "@/api/staff";

export const userStaffStore = defineStore({
  id: "pure-staff",
  state: (): staffType => ({
    staffListNV: []
  }),
  actions: {
    getStaffListNV() {
      return new Promise(resolve => {
        getStaffListNV({
          staffName: "",
          jobStatus: 0
        })
          .then(({ data }) => {
            this.staffListNV = data || [];
            resolve(data);
          })
          .catch(() => {
            resolve([]);
          });
      });
    }
  }
});

export function userStaffStoreHook() {
  return userStaffStore(store);
}
