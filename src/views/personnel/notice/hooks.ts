import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter, useRoute } from "vue-router";
import { onBeforeMount } from "vue";

export function useDetail() {
  const route = useRoute();
  const router = useRouter();
  const sellContractId = route.query?.sellContractId ?? -1;

  function toDetail(row: number | string | string[] | number[] | any) {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/personnel/noticeDetail`,
      parentPath: route.matched[0].path,
      name: "NoticeDetail",
      query: row
        ? {
            id: String(row.id)
          }
        : undefined,
      meta: {
        title: {
          zh: `查看-${row.title1}`,
          en: `Employee - DetailInfo`
        },
        showLink: false,
        dynamicLevel: 3
      }
    });
    row
      ? router.push({
          name: "NoticeDetail",
          query: {
            id: String(row.id)
          }
        })
      : router.push({ name: "NoticeDetail" });
  }

  function initToDetail() {
    onBeforeMount(() => {
      if (sellContractId) toDetail(sellContractId);
    });
  }

  return { toDetail, initToDetail, sellContractId, router };
}
