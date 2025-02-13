import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter, useRoute } from "vue-router";
import { onBeforeMount } from "vue";

export function useDetail() {
  const route = useRoute();
  const router = useRouter();
  const id = route.query?.id ?? -1;

  function toDetail(row: number | string | string[] | number[] | any) {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/personnel/attendance/ProjectAttendanceDetail`,
      parentPath: route.matched[0].path,
      name: "ProjectAttendanceDetail",
      query: row
        ? { id: String(row.id), proTitle: String(row.attachTitle) }
        : undefined,
      meta: {
        title: {
          zh: ` 项目出勤明细`,
          en: `Employee - DetailInfo`
        },
        showLink: false,
        dynamicLevel: 3
      }
    });
    row
      ? router.push({
          name: "ProjectAttendanceDetail",
          query: { id: String(row.id), proTitle: String(row.attachTitle) }
        })
      : router.push({ name: "ProjectAttendanceDetail" });
  }

  function initToDetail() {
    onBeforeMount(() => {
      if (id) toDetail(id);
    });
  }

  return { toDetail, initToDetail, id, router };
}
