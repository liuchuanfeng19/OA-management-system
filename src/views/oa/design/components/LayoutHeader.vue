<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessageBox } from "element-plus";

import { useOAStoreHook } from "@/store/modules/oa";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "LayoutHeader"
});
const emit = defineEmits(["update:modelValue", "publish", "preview"]);
defineProps({
  modelValue: {
    type: String,
    default: "baseSetup"
  }
});
const router = useRouter();

const viewCode = ref(false);
const { design, isEdit } = storeToRefs(useOAStoreHook());

function publish() {
  emit("publish");
}
function preview() {
  emit("preview");
  viewCode.value = true;
}
// function valid() {
//   if (!this.$isNotEmpty(this.design.group)) {
//     this.$message.warning("请选择分组");
//     this.$router.push("/layout/baseSetup");
//     return false;
//   }
//   return true;
// }
function exit() {
  ElMessageBox.confirm("未发布的内容将不会被保存，是否直接退出 ?", "提示", {
    confirmButtonText: "退出",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    //window.location.reload()
    //this.$store.commit('clearTemplate')
    // router.push("/formsPanel");
    router.go(-1);
  });
}
function to(path) {
  emit("update:modelValue", path);
}
function handleSelect(key: string, keyPath: string[]) {
  console.log(key, keyPath);
}
function listener() {
  window.onunload = () => false;
  window.onbeforeunload = () => false;
}

function check() {
  if (isEdit.value === null) {
    //router.push("/workPanel");
  }
}

onMounted(() => {
  console.log(document.body.offsetWidth);
  if (document.body.offsetWidth <= 970) {
    ElMessageBox.alert(
      "本设计器未适配中小屏幕，建议您在PC电脑端浏览器进行操作"
    );
  }
  listener();
});

check();
</script>

<template>
  <div>
    <div class="header bg-bg_color">
      <el-menu
        :default-active="modelValue"
        class="el-menu-demo"
        mode="horizontal"
        @select="handleSelect"
      >
        <el-menu-item index="baseSetting" @click="to('baseSetting')"
          >① 基础信息</el-menu-item
        >
        <el-menu-item index="formSetting" @click="to('formSetting')"
          >② 审批表单</el-menu-item
        >
        <el-menu-item index="processDesign" @click="to('processDesign')"
          >③ 审批流程
        </el-menu-item>
        <el-menu-item index="proSetting" @click="to('proSetting')"
          >④ 扩展设置</el-menu-item
        >
      </el-menu>
      <div class="publish">
        <el-button
          type="default"
          :icon="useRenderIcon('view')"
          @click="preview"
        >
          预览
        </el-button>
        <el-button
          type="primary"
          :icon="useRenderIcon('promotion')"
          @click="publish"
        >
          发布
        </el-button>
      </div>
      <div class="back flex items-center">
        <el-button
          class="mr-1 text-text_color_regular"
          :icon="useRenderIcon('arrow-left-s-line')"
          circle
          @click="exit"
        />
        <span class="flex items-center">
          <component
            :is="useRenderIcon(design.logo.icon)"
            :style="'background:' + design.logo.background"
          />
          <span>{{ design.formName }}</span>
        </span>
      </div>
    </div>
    <el-dialog
      v-model:visible="viewCode"
      title="请使用手机扫码预览"
      width="300px"
      :close-on-click-modal="false"
      center
    >
      <img src="../../../../assets/code.png" width="250" height="250" />
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
:deep(.header) {
  position: relative;
  min-width: 980px;

  .el-menu {
    top: 0;
    z-index: 999;
    display: flex;
    justify-content: center;
    width: 100%;
  }

  .publish {
    position: absolute;
    top: 15px;
    right: 20px;
    z-index: 1000;

    i {
      margin-right: 6px;
    }

    button {
      border-radius: 15px;
    }
  }

  .back {
    position: absolute;
    top: 8px;
    left: 20px;
    z-index: 1000;
    font-size: small;

    span {
      i {
        box-sizing: content-box;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        padding: 6px;
        margin: 0 10px;
        // font-size: 14px;
        color: #fff;
        border-radius: 10px;
      }
    }
  }
}
</style>
