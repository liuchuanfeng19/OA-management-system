import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter, useRoute } from "vue-router";
import { onBeforeMount } from "vue";

export function useDetail() {
  const route = useRoute();
  const router = useRouter();
  const sellContractId = route.query?.sellContractId ?? -1;

  function toDetail(row: number | string | string[] | number[] | any) {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/administration/project/tend/tenderJoinDetail`,
      parentPath: route.matched[0].path,
      name: "TenderJoinDetail",
      query: row
        ? {
            id: String(row.id)
          }
        : undefined,
      meta: {
        title: {
          zh: `参与项目-${row.title1}`,
          en: `Employee - DetailInfo`
        },
        showLink: false,
        dynamicLevel: 3
      }
    });
    row
      ? router.push({
          name: "TenderJoinDetail",
          query: {
            id: String(row.id)
          }
        })
      : router.push({ name: "TenderJoinDetail" });
  }

  function initToDetail() {
    onBeforeMount(() => {
      if (sellContractId) toDetail(sellContractId);
    });
  }

  return { toDetail, initToDetail, sellContractId, router };
}
