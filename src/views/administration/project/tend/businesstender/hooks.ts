import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter, useRoute } from "vue-router";
import { onBeforeMount } from "vue";

export function useDetail() {
  const route = useRoute();
  const router = useRouter();
  const sellContractId = route.query?.sellContractId
    ? route.query?.sellContractId
    : route.params?.sellContractId;

  function toDetail(row: number | string | string[] | number[] | any) {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/administration/project/tend/tenderDetail`,
      parentPath: route.matched[0].path,
      name: "TenderDetail",
      query: row
        ? {
            id: String(row.id)
          }
        : undefined,
      meta: {
        title: {
          zh: `招标公告-${row.title1}`,
          en: `Employee - DetailInfo`
        },
        showLink: false,
        dynamicLevel: 3
      }
    });
    row
      ? router.push({
          name: "TenderDetail",
          query: {
            id: String(row.id)
          }
        })
      : router.push({ name: "TenderDetail" });
  }

  function initToDetail() {
    onBeforeMount(() => {
      if (sellContractId) toDetail(sellContractId);
    });
  }

  return { toDetail, initToDetail, sellContractId, router };
}
