import { defineStore } from "pinia";

import { store } from "@/store";
import type { EmployeeInformationType } from "./types";

export const useEmployeeInformationStore = defineStore({
  id: "pure-employeeInformation",
  state: (): EmployeeInformationType => ({
    queryFormData: {
      deptId: "",
      keyword: "",
      major: "",
      jobType: "",
      educationLevels: [],
      jobStatus: "",
      startYears: 0,
      endYears: 99,
      startAge: 0,
      stopAge: 99,
      years: "",
      companyIds: [],
      contractDate: null,
      startEndDate: "",
      stopEndDate: "",
      staffIds: [],
      pageIndex: 1,
      pageSize: 20
    }
  })
});

export function useEmployeeInformationStoreHook() {
  return useEmployeeInformationStore(store);
}
