<script setup lang="ts">
import { ref, nextTick } from "vue";
import { storeToRefs } from "pinia";
import router from "@/router/index";

import { markAsProcessed } from "@/api/auditNotice";
import { usePermissionStoreHook } from "@/store/modules/permission";
import AssetAudit from "@/views/administration/asset/apply/components/DialogForm.vue";
import AssetApply from "@/views/administration/asset/mineApply/components/DialogForm.vue";
import PurchasingOrderApply from "@/views/purchasing/myprocurement/components/DialogForm.vue";
import PurchasingOrderAudit from "@/views/purchasing/purchasingorder/components/DialogForm.vue";
import PurchaseRequestApply from "@/views/purchasing/purchaseRequest/components/DialogForm.vue";
import ProveDialog from "@/views/administration/project/bid/prove/components/DialogForm.vue";
const emit = defineEmits(["search"]);

const { allMenuLeavesMap, allPathLeavesMap } = storeToRefs(
  usePermissionStoreHook()
);
const componentRef = ref();
const currentCom = ref();

function handleSearch() {
  emit("search");
}

async function handleDeal(row, type) {
  console.log("row", row);
  if (row.canFinish && !type) {
    const { code } = await markAsProcessed({ id: row.id });
    if (code == 0) {
      handleSearch();
    }
    return;
  }
  const menuDialogLoader = allMenuLeavesMap.value.get(row.menuId);
  const menuPageLoader = allPathLeavesMap.value.get(row.menuId);
  const showType = row.canAudit ? "audit" : row.canEdit ? "edit" : "read";
  if (menuDialogLoader == undefined) {
    if (row.busiType == "资产审批") {
      if (showType == "audit") {
        currentCom.value = AssetAudit;
      } else {
        currentCom.value = AssetApply;
      }
    } else if (row.busiType == "下采单") {
      if (showType == "audit") {
        currentCom.value = PurchasingOrderAudit;
      } else {
        currentCom.value = PurchasingOrderApply;
      }
    } else if (row.busiType == "采购会签申请") {
      currentCom.value = PurchaseRequestApply;
    } else if (row.busiType == "资信证明") {
      currentCom.value = ProveDialog;
    }
    nextTick(() => {
      componentRef.value.show({ id: row.busiId }, showType);
    });
    return;
  }
  if (type && type == "jump") {
    router.push(menuPageLoader);
    return;
  }
  menuDialogLoader().then(res => {
    currentCom.value = res.default;
    // const {success } = await MarkOneNoticeReceiverAsRead({ id: row.id });
    // if (code==0) {s
    //   onSearch();
    //   emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
    // }
    nextTick(() => {
      componentRef.value.show({ id: row.busiId }, showType);
    });
  });
}

defineExpose({ handleDeal });
</script>

<template>
  <component :is="currentCom" ref="componentRef" @search="handleSearch" />
</template>
