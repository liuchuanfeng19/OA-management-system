<script setup lang="ts">
import { storeToRefs } from "pinia";
import { message } from "@/utils/message";
import { ElMessageBox } from "element-plus";
import { isAllEmpty } from "@pureadmin/utils";
import { useRoute, useRouter } from "vue-router";
import { ref, computed, onBeforeUnmount } from "vue";

import { useOAStoreHook } from "@/store/modules/oa";
import FormDesign from "./components/FormDesign.vue";
import LayoutHeader from "./components/LayoutHeader.vue";
import ProcessDesign from "./components/ProcessDesign.vue";
import FormProSetting from "./components/FormProSetting.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import FormBaseSetting from "./components/FormBaseSetting.vue";
import { getFormDetail, createForm, updateFormDetail } from "@/api/design";

defineOptions({
  name: "FormProcessDesign"
});

type ValidResult = {
  errs: any[];
  finished: boolean;
  success: boolean;
  title: string;
  action: string;
  desc: string;
};

const route = useRoute();
const router = useRouter();

const isNew = ref(true);
const validStep = ref(0);
const timer = ref(null);
const proSetting = ref();
const baseSetting = ref();
const formSetting = ref();
const processDesign = ref();
const activeSelect = ref("baseSetting");
const validVisible = ref(false);
const validResult = ref<ValidResult>();
const validOptions = ref([
  { title: "基础信息", description: "", icon: "", status: undefined },
  { title: "审批表单", description: "", icon: "", status: undefined },
  { title: "审批流程", description: "", icon: "", status: undefined },
  { title: "扩展设置", description: "", icon: "", status: undefined }
]);
const validComponents = ref([
  "baseSetting",
  "formSetting",
  "processDesign",
  "proSetting"
]);
const { design } = storeToRefs(useOAStoreHook());

const validComponentsRef = computed(() => {
  return [
    baseSetting.value,
    formSetting.value,
    processDesign.value,
    proSetting.value
  ];
});
const errTitle = computed(() => {
  if (validResult.value.finished && !validResult.value.success) {
    return (
      validResult.value.title + ` (${validResult.value.errs.length}项错误) 😥`
    );
  }
  return validResult.value.title;
});
const validIcon = computed(() => {
  if (!validResult.value.finished) {
    return "el-icon-loading";
  } else if (validResult.value.success) {
    return "success";
  } else {
    return "warning";
  }
});

function loadFormInfo(formId) {
  getFormDetail({ id: formId })
    .then(rsp => {
      console.log(rsp.data);
      const form = rsp.data;
      form.settings = JSON.parse(form.settings);
      form.formItems = JSON.parse(form.formItems);
      form.process = JSON.parse(form.process);
      design.value = form;
    })
    .catch(err => {
      message(err, { customClass: "el", type: "error" });
    });
}
function loadInitFrom() {
  design.value = {
    formId: null,
    formName: "未命名表单",
    formCode: "",
    ccIds: [],
    applyMenuId: "",
    auditMenuId: "",
    logo: {
      icon: "el-icon-eleme",
      background: "#1e90ff"
    },
    settings: {
      commiter: [],
      admin: [],
      sign: false,
      nowUserSelect: "",
      notify: {
        types: [],
        title: "消息通知标题"
      }
    },
    groupId: undefined,
    group: "",
    formItems: [],
    process: {
      id: "root",
      parentId: null,
      type: "ROOT",
      name: "发起人",
      desc: "任何人",
      props: {
        assignedUser: [],
        ccUser: [],
        formPerms: []
      },
      children: {}
    },
    remark: "备注说明"
  };
}
function validateDesign() {
  validVisible.value = true;
  validStep.value = 0;
  showValiding();
  stopTimer();
  timer.value = setInterval(() => {
    validResult.value.errs =
      validComponentsRef.value[validStep.value].validate();
    if (
      Array.isArray(validResult.value.errs) &&
      validResult.value.errs.length === 0
    ) {
      validStep.value++;
      if (validStep.value >= validOptions.value.length) {
        stopTimer();
        showValidFinish(true, null);
      }
    } else {
      stopTimer();
      validOptions.value[validStep.value].status = "error";
      showValidFinish(false, getDefaultValidErr());
    }
  }, 300);
}
function getDefaultValidErr() {
  switch (validStep.value) {
    case 0:
      return "请检查基础设置项:" + validResult.value.errs.join();
    case 1:
      return "请检查审批表单相关设置";
    case 2:
      return "请检查审批流程，查看对应标注节点错误信息";
    case 3:
      return "请检查扩展设置";
    default:
      return "未知错误";
  }
}
function showValidFinish(success, err) {
  validResult.value.success = success;
  validResult.value.finished = true;
  validResult.value.title = success ? "校验完成 😀" : "校验失败 ";
  validResult.value.desc = success ? "设置项校验成功，是否提交？" : err;
  validResult.value.action = success ? "提 交" : "去修改";
}
function showValiding() {
  validResult.value = {
    errs: [],
    finished: false,
    success: false,
    title: "检查中...",
    action: "处理",
    desc: "正在检查设置项"
  };
  validStep.value = 0;
  validOptions.value.forEach(op => {
    op.status = "";
    op.icon = "";
    op.description = "";
  });
}
function doAfter() {
  if (validResult.value.success) {
    doPublish();
  } else {
    activeSelect.value = validComponents.value[validStep.value];
    validVisible.value = false;
  }
}
function stopTimer() {
  if (timer.value) {
    clearInterval(timer.value);
  }
}
function preview() {
  validateDesign();
}
function publishProcess() {
  validateDesign();
}
function doPublish() {
  ElMessageBox.confirm(
    "如果您只想预览请选择预览，确认发布后流程立即生效，是否继续?",
    "提示",
    {
      confirmButtonText: "发布",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).then(() => {
    console.log(design.value);
    const template = {
      formId: design.value.formId,
      formName: design.value.formName,
      formCode: design.value.formCode,
      applyMenuId: design.value.applyMenuId,
      auditMenuId: design.value.auditMenuId,
      ccIds: design.value.ccIds,
      logo: design.value.logo,
      settings: JSON.stringify(design.value.settings),
      groupId: design.value.groupId,
      formItems: JSON.stringify(design.value.formItems),
      process: JSON.stringify(design.value.process),
      remark: design.value.remark
    };
    if (isNew.value || isAllEmpty(design.value.formId)) {
      createForm(template)
        .then(_rsp => {
          message("创建表单成功", { customClass: "el", type: "success" });
          // router.push("/formsPanel");
          router.go(-1);
        })
        .catch(err => {
          message(err, { customClass: "el", type: "error" });
        });
    } else {
      updateFormDetail(template)
        .then(_rsp => {
          message("更新表单成功", { customClass: "el", type: "success" });
          // router.push("/formsPanel");
          // loadFormInfo(formId);
          router.go(-1);
        })
        .catch(err => {
          message(err, { customClass: "el", type: "error" });
        });
    }
  });
}

onBeforeUnmount(() => {
  stopTimer();
});

showValiding();
const formId = route.query.code;
console.log("formId", formId);
console.log("!isAllEmpty(formId)", !isAllEmpty(formId));
//判断传参，决定是新建还是加载原始数据
loadInitFrom();
if (!isAllEmpty(formId)) {
  isNew.value = false;
  loadFormInfo(formId);
}
const group = route.query.group;
design.value.groupId = !isAllEmpty(group) ? parseInt(group) : null;
</script>

<template>
  <el-container>
    <el-header>
      <LayoutHeader
        v-model="activeSelect"
        @publish="publishProcess"
        @preview="preview"
      />
    </el-header>
    <div class="layout-body">
      <FormBaseSetting
        v-show="activeSelect === 'baseSetting'"
        ref="baseSetting"
      />
      <FormDesign v-show="activeSelect === 'formSetting'" ref="formSetting" />
      <ProcessDesign
        v-show="activeSelect === 'processDesign'"
        ref="processDesign"
      />
      <FormProSetting v-show="activeSelect === 'proSetting'" ref="proSetting" />
    </div>
    <WDialog v-model="validVisible" :showFooter="false" title="设置项检查">
      <el-steps align-center :active="validStep" finish-status="success">
        <el-step
          v-for="(step, i) in validOptions"
          :key="i"
          :title="step.title"
          :icon="step.icon"
          :status="step.status"
          :description="step.description"
        />
      </el-steps>
      <el-result
        :icon="validIcon"
        :title="errTitle"
        :subTitle="validResult.desc"
      >
        <template #icon>
          <component
            :is="useRenderIcon('loading')"
            v-if="!validResult.finished"
            style="font-size: 30px"
          />
        </template>
        <template #subTitle>
          <div v-if="validResult.errs.length > 0" class="err-info">
            <ellipsis
              v-for="(err, i) in validResult.errs"
              :key="i + '_err'"
              hover-tip
              :content="err"
            >
              <template #pre>
                <component :is="useRenderIcon('warningFilled')" />
              </template>
            </ellipsis>
          </div>
        </template>

        <template v-slot:extra>
          <el-button
            v-if="validResult.finished"
            type="primary"
            @click="doAfter"
          >
            {{ validResult.action }}
          </el-button>
        </template>
      </el-result>
    </WDialog>
  </el-container>
</template>

<style lang="scss" scoped>
.layout-body {
  min-width: 980px;
}

:deep(.el-step) {
  .is-success {
    color: #2a99ff;
    border-color: #2a99ff;
  }
}

.err-info {
  max-height: 180px;
  overflow-y: auto;

  & > div {
    width: 220px;
    padding: 5px;
    margin: 2px 0;
    text-align: left;
    background: rgb(242 242 242);
    border-radius: 3px;
  }

  i {
    margin: 0 5px;
  }
}

::-webkit-scrollbar {
  width: 2px;
  height: 2px;
  background-color: white;
}

::-webkit-scrollbar-thumb {
  background-color: #e8e8e8;
  border-radius: 16px;
}
</style>
