<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { useOAStoreHook } from "@/store/modules/oa";

defineOptions({
  name: "FormProSetting"
});
const { design } = storeToRefs(useOAStoreHook());
const settings = computed(() => {
  return design.value.settings;
});
function validate() {
  return [];
}
defineExpose({ validate });
</script>

<template>
  <div class="senior-setup bg-bg_color">
    <el-form label-position="top" label-width="80px">
      <el-form-item label="审批同意时是否签字">
        <el-switch
          v-model="settings.sign"
          inactive-text="无需签字"
          active-text="需要签字"
        />
        <div class="sign-tip">
          如果此处设置为 <b>需要签字</b>，则所有审批人“同意时” <b>必须签字</b>
        </div>
      </el-form-item>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.senior-setup {
  width: 600px;
  height: calc(100vh - 105px);
  padding: 15px 20px;
  margin: 0 auto;
  margin-top: 10px;
  overflow: auto;

  .sign-tip {
    margin-left: 20px;
    font-size: small;
    color: #949495;
  }
}
</style>
