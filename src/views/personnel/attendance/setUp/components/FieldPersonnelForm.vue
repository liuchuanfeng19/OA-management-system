<script setup lang="ts">
import _ from "lodash";
import { ref, onMounted } from "vue";
import { getOutData } from "@/api/attendance";
defineExpose({ getData });
const props = defineProps({
  gid: {
    require: false,
    default: "",
    type: String
  }
});
function getData() {
  let param = {
    switch: formData.value.switch,
    check1: formData.value.check1,
    radio: formData.value.radio,
    check2: formData.value.check2,
    check3: formData.value.check3,
    check4: formData.value.check4
  };
  return param;
}
const formData = ref({
  id: undefined,
  switch: true,
  check1: false,
  radio: 0,
  check2: false,
  check3: false,
  check4: false
});
async function getDetail() {
  const { data } = await getOutData({ id: formData.value.id });
  console.log("data---->", data);
  formData.value.switch = data.outFlag;
  formData.value.check1 = data.outAuditFlag;
  formData.value.radio = data.outAuditWay;
  formData.value.check2 = data.outCommentFlag;
  formData.value.check3 = data.outPhotoFlag;
  formData.value.check4 = data.outAddrFlag;
}
//mounted周期函数
onMounted(async () => {
  formData.value.id = props.gid;
  if (formData.value.id != null && formData.value.id != "") {
    getDetail();
  }
});
</script>

<template>
  <div class="mainView">
    <div style="margin-top: 20px">
      <span style="margin-right: 10px">允许外勤打卡</span>
      <el-switch v-model="formData.switch" />
    </div>
    <div v-if="formData.switch" class="checkMain">
      <el-checkbox v-model="formData.check1" label="外勤打卡需要审批" />
      <div v-if="formData.check1" class="audit">
        <span style="margin-bottom: 10px">审批方式</span>
        <el-radio-group v-model="formData.radio">
          <el-radio :label="1" size="large">先审批，后打卡</el-radio>
          <el-radio :label="2" size="large">先打卡，后审批</el-radio>
        </el-radio-group>
      </div>
      <el-checkbox v-model="formData.check2" label="外勤打卡需要填写备注" />
      <el-checkbox v-model="formData.check3" label="外勤打卡需要拍照" />
      <el-checkbox v-model="formData.check4" label="外勤打卡需要详细地址" />
    </div>
  </div>
  <TimesDialog ref="timesDialogRef" />
</template>
<style scoped lang="scss">
.checkMain {
  display: flex;
  flex-direction: column;
  margin-top: 20px;

  .audit {
    padding: 20px;
    margin: 20px 0;
    display: flex;
    flex-direction: column;
    background-color: #f1f1f1;
    border-radius: 4px;
  }
}
</style>
