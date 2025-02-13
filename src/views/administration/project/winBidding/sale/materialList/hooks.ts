import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { useRouter, useRoute } from "vue-router";
import { onBeforeMount } from "vue";

export function useDetail() {
  const route = useRoute();
  const router = useRouter();
  const sellContractId = route.query?.sellContractId ?? -1;

  function toDetail(row: number | string | string[] | number[] | any) {
    useMultiTagsStoreHook().handleTags("push", {
      path: `/administration/project/winBidding/sale/materialDetail`,
      parentPath: route.matched[0].path,
      name: "MaterialDetail",
      query: row
        ? {
            sellContractId: String(row.sellContractId),
            sellContractItemAttachId: String(row.id),
            projectId: row.projectId
          }
        : undefined,
      meta: {
        title: {
          zh: `物资合同清单明细-${row.sellContractCode}`,
          en: `Employee - DetailInfo`
        },
        showLink: false,
        dynamicLevel: 3
      }
    });
    row
      ? router.push({
          name: "MaterialDetail",
          query: {
            sellContractId: String(row.sellContractId),
            sellContractItemAttachId: String(row.id),
            projectId: row.projectId
          }
        })
      : router.push({ name: "MaterialDetail" });
  }

  function initToDetail() {
    onBeforeMount(() => {
      if (sellContractId) toDetail(sellContractId);
    });
  }

  return { toDetail, initToDetail, sellContractId, router };
}
