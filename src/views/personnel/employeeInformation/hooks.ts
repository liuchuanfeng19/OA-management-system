import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter, useRoute } from "vue-router";
import { onBeforeMount } from "vue";

export function useDetail() {
  const route = useRoute();
  const router = useRouter();
  const id = route.query?.id ?? -1;

  function toDetail(row: number | string | string[] | number[] | any) {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/personnel/employeeInformationDetail`,
      parentPath: route.matched[0].path,
      name: "EmployeeInformationDetail",
      query: row ? { id: String(row.staffId) } : undefined,
      meta: {
        title: {
          zh: `${row ? row.staffName : "员工"} - ${row ? "编辑" : "添加"}`,
          en: `Employee - DetailInfo`
        },
        showLink: false,
        dynamicLevel: 3
      }
    });
    row
      ? router.push({
          name: "EmployeeInformationDetail",
          query: { id: String(row.staffId) }
        })
      : router.push({ name: "EmployeeInformationDetail" });
  }

  function initToDetail() {
    onBeforeMount(() => {
      if (id) toDetail(id);
    });
  }

  return { toDetail, initToDetail, id, router };
}
