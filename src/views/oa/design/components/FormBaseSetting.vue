<script setup lang="ts">
import { storeToRefs } from "pinia";
import { message } from "@/utils/message";
import { isAllEmpty } from "@pureadmin/utils";
import { ref, onMounted, nextTick } from "vue";

import { getOrgTree } from "@/api/org";
import { getMeunTree } from "@/api/menu";
import { IconfontSelect } from "@/components/ReIcon";
import { useOAStoreHook } from "@/store/modules/oa";
import iconfont from "@/assets/iconfont/iconfont.json";
import OrgPicker from "@/components/common/OrgPicker.vue";
import { getFormGroups, createGroup } from "@/api/design";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "FormBaseSetting"
});

const treeSelectProps = {
  label: "title"
};

const { design } = storeToRefs(useOAStoreHook());
const nowUserSelect = ref(null);
const showIconSelect = ref(false);
const select = ref([]);
const menuTree = ref([]);
const userOptions = ref([]);
const baseSettingRef = ref();
const orgPickerRef = ref();
const newGroup = ref("");
const fromGroup = ref([]);
const notifyTypes = ref([
  { type: "APP", name: "应用内通知" },
  { type: "EMAIL", name: "邮件通知" },
  { type: "SMS", name: "短信通知" },
  { type: "WX", name: "微信通知" },
  { type: "DING", name: "钉钉通知" }
]);
const colors = ref([
  "#ff4500",
  "#ff8c00",
  "#ffd700",
  "#90ee90",
  "#00ced1",
  "#1e90ff",
  "#c71585",
  "rgba(255, 69, 0, 0.68)",
  "rgb(255, 120, 0)",
  "hsl(181, 100%, 37%)",
  "hsla(209, 100%, 56%, 0.73)",
  "#c7158577"
]);
const icons = ref([
  "el-icon-delete-solid",
  "el-icon-s-tools",
  "el-icon-s-goods",
  "el-icon-warning",
  "el-icon-circle-plus",
  "el-icon-camera-solid",
  "el-icon-s-promotion",
  "el-icon-s-cooperation",
  "el-icon-s-platform",
  "el-icon-s-custom",
  "el-icon-s-data",
  "el-icon-s-check",
  "el-icon-s-claim"
]);
const rules = ref({
  formName: [{}],
  formCode: [{}],
  applyMenuId: [{}],
  auditMenuId: [{}],
  groupId: []
});

function getRule(msg) {
  return [{ required: true, message: msg, trigger: "blur" }];
}
function loadIconfont() {
  if (iconfont && iconfont.id) {
    iconfont.glyphs.forEach(icon => {
      icons.value.push(
        `${iconfont.font_family} ${iconfont.css_prefix_text}${icon.font_class}`
      );
    });
  }
}
function getGroups() {
  getFormGroups()
    .then(({ data }) => {
      const _groups = data.data || [];
      fromGroup.value = _groups.map(item => {
        item.groupId = item.id;
        item.id = item.sort;
        return item;
      });
    })
    .catch(_err =>
      message("获取分组异常", { customClass: "el", type: "error" })
    );
}

function getOrgList() {
  getOrgTree({ deptId: "", query: "org", keyword: "" })
    .then(({ data }) => {
      userOptions.value = data || [];
      console.log("userOptions", userOptions.value);
    })
    .catch(err => {
      message(err.response.data, { customClass: "el", type: "error" });
    });
}

// 获取菜单树
function getMeunList() {
  getMeunTree()
    .then(({ data }) => {
      menuTree.value = data || [];
    })
    .catch(() => {
      menuTree.value = [];
    });
}

function addGroup() {
  if (newGroup.value.trim() !== "") {
    createGroup({ name: newGroup.value.trim() })
      .then(rsp => {
        message(rsp.message, { customClass: "el", type: "success" });
        getGroups();
      })
      .catch(err =>
        message(err.response.data, { customClass: "el", type: "error" })
      );
  }
}
function selected(_select) {
  design.value.settings.nowUserSelect = _select;
  design.value.settings.admin = _select;
  //design.value[nowUserSelect.value] = select
}
function selectUser(key) {
  select.value = design.value.settings[key];
  nowUserSelect.value = key;
  nextTick(() => {
    orgPickerRef.value.show();
  });
}
function validate() {
  baseSettingRef.value.validate();
  const err = [];
  if (isAllEmpty(design.value.formName)) {
    err.push("表单名称未设置");
  }
  if (isAllEmpty(design.value.formCode)) {
    err.push("表单编码未设置");
  }
  if (isAllEmpty(design.value.applyMenuId)) {
    err.push("申请菜单未设置");
  }
  if (isAllEmpty(design.value.auditMenuId)) {
    err.push("审核菜单未设置");
  }
  if (isAllEmpty(design.value.groupId)) {
    err.push("表单分组未设置");
  }
  if (design.value.settings.notify.types.length === 0) {
    err.push("审批消息通知方式未设置");
  }
  console.log("err", err);
  return err;
}
defineExpose({ validate });

onMounted(() => {
  getGroups();
  getOrgList();
  getMeunList();
});

loadIconfont();
</script>

<template>
  <div class="base-setup bg-bg_color" @click="showIconSelect = false">
    <el-form
      ref="baseSettingRef"
      :model="design"
      :rules="rules"
      label-position="top"
      label-width="80px"
    >
      <el-form-item label="表单图标">
        <component
          :is="useRenderIcon(design.logo.icon)"
          v-if="false"
          :style="'background:' + design.logo.background"
        />
        <IconfontSelect v-model="design.logo.icon" />
      </el-form-item>
      <el-form-item label="图标背景色">
        <el-input v-model="design.logo.background" disabled>
          <template #append>
            <el-button type="primary" size="default">
              <el-color-picker
                v-model="design.logo.background"
                show-alpha
                :predefine="colors"
              />
            </el-button>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item
        label="表单名称"
        :rules="getRule('请输入表单名称')"
        prop="formName"
      >
        <el-input v-model="design.formName" :disabled="!design.applyMenuId" />
      </el-form-item>
      <el-form-item
        label="表单编码"
        :rules="getRule('请输入表单编码')"
        prop="formCode"
      >
        <el-input v-model="design.formCode" />
      </el-form-item>
      <el-form-item
        label="申请菜单"
        :rules="getRule('请选择申请菜单')"
        prop="applyMenuId"
      >
        <el-tree-select
          ref="menuTreeSelectRef"
          v-model="design.applyMenuId"
          :data="menuTree"
          node-key="id"
          :props="treeSelectProps"
          filterable
          @change="handleMenuChange"
        />
      </el-form-item>
      <el-form-item
        label="审核菜单"
        :rules="getRule('请选择审核菜单')"
        prop="auditMenuId"
      >
        <el-tree-select
          v-model="design.auditMenuId"
          :data="menuTree"
          node-key="id"
          :props="treeSelectProps"
          filterable
        />
      </el-form-item>
      <el-form-item
        label="所在分组"
        :rules="getRule('请选择表单分组')"
        prop="groupId"
      >
        <el-select
          v-model="design.groupId"
          placeholder="请选择分组"
          style="widows: 100%"
        >
          <el-option
            v-for="(op, index) in fromGroup"
            v-show="op.id > 1"
            :key="index"
            :label="op.name"
            :value="op.groupId"
          />
        </el-select>
        <el-popover
          placement="bottom-end"
          title="新建表单分组"
          width="300"
          trigger="click"
        >
          <el-input v-model="newGroup" placeholder="请输入新的分组名">
            <template #append>
              <el-button type="primary" @click="addGroup">提交</el-button>
            </template>
            <template #reference>
              <el-button :icon="useRenderIcon('plus')" type="primary"
                >新建分组</el-button
              >
            </template>
          </el-input>
        </el-popover>
      </el-form-item>
      <el-form-item label="抄送人">
        <el-select
          v-model="design.ccIds"
          :teleported="true"
          placeholder="请选择抄送人"
          clearable
          multiple
        >
          <el-option
            v-for="(wc, index) in userOptions"
            :key="index"
            :label="wc.name"
            :value="wc.id"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="表单说明">
        <el-input
          v-model="design.remark"
          placeholder="请输入"
          type="textarea"
          show-word-limit
          :autosize="{ minRows: 2, maxRows: 5 }"
          maxlength="500"
        />
      </el-form-item>
      <el-form-item
        label="消息通知方式"
        :rules="getRule('请选择消息通知方式')"
        prop="settings.notify.types"
      >
        <el-select
          v-model="design.settings.notify.types"
          value-key="name"
          placeholder="选择消息通知方式"
          style="width: 30%"
          clearable
          multiple
          collapse-tags
        >
          <el-option
            v-for="(wc, index) in notifyTypes"
            :key="index"
            :label="wc.name"
            :value="wc"
          />
        </el-select>
        <el-input
          v-model="design.settings.notify.title"
          style="float: right; width: 68%"
          placeholder="消息通知标题"
        />
      </el-form-item>
      <el-form-item label="谁可以管理此表单">
        <el-select
          v-model="design.settings.admin"
          value-key="name"
          :teleported="false"
          popper-class="select-u"
          placeholder="请选择可以管理此表单的人员"
          clearable
          multiple
          @click="selectUser('admin')"
        >
          <el-option
            v-for="(wc, index) in design.settings.admin"
            :key="index"
            :label="wc.name"
            :value="wc"
          />
        </el-select>
      </el-form-item>
    </el-form>
    <OrgPicker
      ref="orgPickerRef"
      title="请选择可以管理此表单的人员"
      multiple
      :selected="select"
      @ok="selected"
    />
  </div>
</template>

<style lang="scss" scoped>
:deep(.select-u .el-select-dropdown__wrap) {
  display: none !important;
}

:deep(.select-u .el-popper__arrow) {
  display: none !important;
}

:deep(.el-color-picker__trigger) {
  position: relative;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  height: auto;
  padding: 0;
  font-size: 0;
  cursor: pointer;
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
}

:deep(.el-select-dropdown) {
  display: none;
}

.icon-select {
  display: flex;
  flex-wrap: wrap;

  svg {
    max-width: 38px !important;
    padding: 10px;
    font-size: large;
    cursor: pointer;

    &:hover {
      box-shadow: 0 0 10px 2px #c2c2c2;
    }
  }
}

:deep(.select-u) {
  width: 100%;
}

.base-setup {
  width: 600px;
  height: calc(100vh - 105px);
  padding: 15px 20px;
  margin: 0 auto;
  margin-top: 10px;
  overflow: auto;

  svg:first-child {
    position: relative;
    padding: 10px;
    font-size: xx-large;
    color: #fff;
    cursor: pointer;
    border-radius: 10px;
  }

  .change-icon {
    margin-left: 20px;

    span {
      margin-right: 15px;
      font-size: small;
      color: #7a7a7a;
    }

    svg {
      font-size: x-large;
      color: #7a7a7a;
      cursor: pointer;
    }
  }

  :deep(.el-form-item__label) {
    padding: 0;
    font-weight: bold;
  }

  // :deep(.el-form-item) {
  //   margin-bottom: 5px;
  // }
}

:deep(.group) {
  .el-select {
    width: calc(100% - 130px);
  }

  .el-button {
    width: 120px;
    margin-left: 10px;
  }
}

::-webkit-scrollbar {
  width: 4px;
  height: 4px;
  background-color: #f8f8f8;
}

::-webkit-scrollbar-thumb {
  background-color: #e8e8e8;
  border-radius: 16px;
}
</style>
