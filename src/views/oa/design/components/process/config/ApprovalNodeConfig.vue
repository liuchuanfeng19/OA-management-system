<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, computed, watch } from "vue";

import OrgItems from "../OrgItems.vue";
import { useOAStoreHook } from "@/store/modules/oa";
import OrgPicker from "@/components/common/OrgPicker.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "ApprovalNodeConfig"
});
const approvalTypes = [
  { name: "指定人员", type: "ASSIGN_USER" },
  { name: "发起人自选", type: "SELF_SELECT" },
  { name: "连续多级主管", type: "LEADER_TOP" },
  { name: "主管", type: "LEADER" },
  { name: "角色", type: "ROLE" },
  { name: "发起人自己", type: "SELF" },
  { name: "表单内联系人", type: "FORM_USER" },
  { name: "系统自动分配", type: "CUSTOM_ASSIGN_USER" }
];
const ccTypes = [
  { name: "指定人员", type: "ASSIGN_USER" },
  { name: "角色", type: "ROLE" }
];

const { selectedNode, design, nodeMap } = storeToRefs(useOAStoreHook());
const orgPickerSelected = ref([]);
const ccOrgPickerSelected = ref([]);
const orgPickerRef = ref();
const ccOrgPickerRef = ref();
const ccSelect = ref([]);
const ccRoleSelectRole = ref([]);

const orgPickerType = computed(() => {
  let _orgPickerType = "user";
  switch (nodeProps.value.assignedType) {
    case "ASSIGN_USER":
      _orgPickerType = "user";
      break;
    case "SELF_SELECT":
      _orgPickerType = "user";
      break;
    case "LEADER_TOP":
      _orgPickerType = "user";
      break;
    case "FORM_USER":
      _orgPickerType = "user";
      break;
    case "ROLE":
      _orgPickerType = "role";
      break;
    default:
      break;
  }
  return _orgPickerType;
});
const ccOrgPickerType = computed(() => {
  let _ccOrgPickerType = "user";
  switch (nodeProps.value.ccType) {
    case "ASSIGN_USER":
      _ccOrgPickerType = "user";
      break;
    case "ROLE":
      _ccOrgPickerType = "role";
      break;
    default:
      break;
  }
  return _ccOrgPickerType;
});

const nodeProps = computed(() => {
  return selectedNode.value.props;
});
const select = computed(() => {
  return nodeProps.value.assignedUser || [];
});

const roleSelectRole = computed(() => {
  return nodeProps.value.role || [];
});
const forms = computed(() => {
  return design.value.formItems.filter(f => {
    return f.name === "UserPicker";
  });
});
const pickerTitle = computed(() => {
  switch (orgPickerType.value) {
    case "user":
      return "请选择人员";
    case "role":
      return "请选择系统角色";
    default:
      return null;
  }
});
const ccPickerTitle = computed(() => {
  switch (ccOrgPickerType.value) {
    case "user":
      return "请选择人员";
    case "role":
      return "请选择系统角色";
    default:
      return null;
  }
});

const nodeOptions = computed(() => {
  const values = [];
  const excType = [
    "ROOT",
    "EMPTY",
    "CONDITION",
    "CONDITIONS",
    "CONCURRENT",
    "CONCURRENTS"
  ];
  nodeMap.value.forEach(v => {
    if (excType.indexOf(v.type) === -1) {
      values.push({ id: v.id, name: v.name });
    }
  });
  return values;
});
const showMode = computed(() => {
  switch (nodeProps.value.assignedType) {
    case "ASSIGN_USER":
      return nodeProps.value.assignedUser.length > 0;
    case "SELF_SELECT":
      return nodeProps.value.selfSelect.multiple;
    case "LEADER_TOP":
      return nodeProps.value.formUser !== "";
    case "FORM_USER":
      return true;
    case "ROLE":
      return true;
    default:
      return false;
  }
});

watch(
  nodeProps,
  newVal => {
    console.log("nodeProps", newVal);
    if (!newVal.ccType) {
      newVal.ccType = "ASSIGN_USER";
    }
    if (newVal.ccRole == undefined) {
      newVal.ccRole = [];
    }
    if (newVal.ccUser == undefined) {
      newVal.ccUser = [];
    }
  },
  {
    deep: true
  }
);
watch(
  () => nodeProps.value.ccUser,
  newVal => {
    console.log("ccUser", newVal);
    ccSelect.value = newVal || [];
  },
  {
    immediate: true
  }
);
watch(
  () => nodeProps.value.ccRole,
  newVal => {
    console.log("ccUser", newVal);
    ccRoleSelectRole.value = newVal || [];
  },
  {
    immediate: true
  }
);
watch(
  ccSelect,
  newVal => {
    console.log("ccSelect", newVal);
  },
  {
    immediate: true
  }
);

watch(
  ccOrgPickerSelected,
  newVal => {
    console.log("ccOrgPickerSelected", newVal);
  },
  {
    immediate: true
  }
);

function selectUser() {
  orgPickerSelected.value = select.value;
  orgPickerRef.value.show();
}
function selectCcUser() {
  ccRoleSelectRole.value = [];
  ccOrgPickerSelected.value = ccSelect.value;
  ccOrgPickerRef.value.show();
}
function selectNoSetUser() {
  orgPickerSelected.value = nodeProps.value.nobody.assignedUser;
  orgPickerRef.value.show();
}
function selectRole() {
  orgPickerSelected.value = roleSelectRole.value;
  orgPickerRef.value.show();
}
function selectCcRole() {
  ccSelect.value = [];
  ccOrgPickerSelected.value = ccRoleSelectRole.value;
  ccOrgPickerRef.value.show();
}
function selected(select) {
  console.log(select);
  orgPickerSelected.value.length = 0;
  select.forEach(val => orgPickerSelected.value.push(val));
}
function ccSelected(select) {
  console.log(select);
  ccOrgPickerSelected.value = [];
  select.forEach(val => ccOrgPickerSelected.value.push(val));
  console.log("ccOrgPickerSelected", ccOrgPickerSelected.value);

  if (ccOrgPickerType.value == "role") {
    ccSelect.value = [];
    nodeProps.value.ccUser = [];
    ccRoleSelectRole.value = ccOrgPickerSelected.value;
    nodeProps.value.ccRole = ccRoleSelectRole.value;
  } else {
    ccRoleSelectRole.value = [];
    nodeProps.value.ccRole = [];
    ccSelect.value = ccOrgPickerSelected.value;
    nodeProps.value.ccUser = ccSelect.value;
  }
  console.log("ccRoleSelectRole", ccRoleSelectRole.value);
  console.log("ccSelect", ccSelect.value);
}
// function removeOrgItem(index) {
//   select.value.splice(index, 1);
// }
</script>

<template>
  <div>
    <el-form label-position="top" label-width="90px">
      <el-form-item label="⚙ 选择审批对象" prop="text" class="user-type">
        <el-radio-group v-model="nodeProps.assignedType">
          <el-radio v-for="t in approvalTypes" :key="t.type" :label="t.type">{{
            t.name
          }}</el-radio>
        </el-radio-group>
        <div v-if="nodeProps.assignedType === 'ASSIGN_USER'">
          <el-button
            :icon="useRenderIcon('plus')"
            type="primary"
            round
            @click="selectUser"
            >选择人员</el-button
          >
          <OrgItems v-model="nodeProps.assignedUser" />
        </div>
        <div v-else-if="nodeProps.assignedType === 'SELF_SELECT'">
          <el-radio-group v-model="nodeProps.selfSelect.multiple">
            <el-radio-button :label="false">自选一个人</el-radio-button>
            <el-radio-button :label="true">自选多个人</el-radio-button>
          </el-radio-group>
        </div>
        <div v-else-if="nodeProps.assignedType === 'LEADER_TOP'">
          <el-divider />
          <el-form-item label="审批终点" prop="text" class="approve-end">
            <el-radio-group v-model="nodeProps.leaderTop.endCondition">
              <el-radio label="TOP">直到最上层主管</el-radio>
              <el-radio label="LEAVE">不超过发起人的</el-radio>
            </el-radio-group>
            <div
              v-if="nodeProps.leaderTop.endCondition === 'LEAVE'"
              class="approve-end-leave"
            >
              <span>第 </span>
              <el-input-number
                v-model="nodeProps.leaderTop.level"
                :min="1"
                :max="20"
                :step="1"
              />
              <span> 级主管</span>
            </div>
          </el-form-item>
        </div>
        <div v-else-if="nodeProps.assignedType === 'LEADER'">
          <el-divider />
          <el-form-item label="指定主管" prop="text">
            <div class="flex">
              <span>发起人的第 </span>
              <el-input-number
                v-model="nodeProps.leader.level"
                class="flex-1 mx-1"
                :min="1"
                :max="20"
                :step="1"
              />
              <span> 级主管</span>
            </div>
            <div style=" font-size: small;color: #409eff">
              👉 直接主管为 第 1 级主管
            </div>
          </el-form-item>
          <el-divider />
          <el-form-item label="主管类型" prop="text">
            <el-switch
              v-model="nodeProps.leader.type"
              inactive-text="副"
              active-text="正"
            />
            <el-tooltip
              v-if="false"
              class="item"
              effect="dark"
              content="如果全局设置了需要签字，则此处不生效"
              placement="top-start"
            >
              <component
                :is="useRenderIcon('questionFilled')"
                style="margin-left: 10px; font-size: medium; color: #b0b0b1"
              />
            </el-tooltip>
          </el-form-item>
        </div>
        <div v-else-if="nodeProps.assignedType === 'ROLE'">
          <el-button
            :icon="useRenderIcon('plus')"
            type="primary"
            round
            @click="selectRole"
            >选择系统角色</el-button
          >
          <OrgItems v-model="nodeProps.role" />
        </div>
        <div v-else-if="nodeProps.assignedType === 'FORM_USER'">
          <el-form-item
            label="选择表单联系人项"
            prop="text"
            class="approve-end"
          >
            <el-select
              v-model="nodeProps.formUser"
              style="width: 80%"
              placeholder="请选择"
            >
              <el-option
                v-for="op in forms"
                :key="op.id"
                :label="op.title"
                :value="op.id"
              />
            </el-select>
          </el-form-item>
        </div>
        <div v-else>
          <span class="item-desc">发起人自己作为审批人进行审批</span>
        </div>
      </el-form-item>

      <el-divider />
      <el-form-item label="👤 审批人为空时" prop="text" class="line-mode">
        <el-radio-group v-model="nodeProps.nobody.handler">
          <el-radio label="TO_PASS">自动通过</el-radio>
          <el-radio label="TO_REFUSE">自动驳回</el-radio>
          <el-radio label="TO_ADMIN">转交审批管理员</el-radio>
          <el-radio label="TO_USER">转交到指定人员</el-radio>
        </el-radio-group>

        <div
          v-if="nodeProps.nobody.handler === 'TO_USER'"
          style="margin-top: 10px"
        >
          <el-button
            :icon="useRenderIcon('plus')"
            type="primary"
            round
            @click="selectNoSetUser"
            >选择人员</el-button
          >
          <OrgItems v-model="nodeProps.assignedUser" />
        </div>
      </el-form-item>

      <div v-if="showMode">
        <el-divider />
        <el-form-item
          label="👩‍👦‍👦 多人审批时审批方式"
          prop="text"
          class="approve-mode"
        >
          <el-radio-group v-model="nodeProps.mode">
            <el-radio label="NEXT"
              >会签 （按选择顺序审批，每个人必须同意）</el-radio
            >
            <el-radio label="AND">会签（可同时审批，每个人必须同意）</el-radio>
            <el-radio label="OR">或签（有一人同意即可）</el-radio>
          </el-radio-group>
        </el-form-item>
      </div>

      <el-divider>高级设置</el-divider>
      <el-form-item label="✍ 审批同意时是否需要签字" prop="text">
        <el-switch
          v-model="nodeProps.sign"
          inactive-text="不用"
          active-text="需要"
        />
        <el-tooltip
          class="item"
          effect="dark"
          content="如果全局设置了需要签字，则此处不生效"
          placement="top-start"
        >
          <component
            :is="useRenderIcon('questionFilled')"
            style="margin-left: 10px; font-size: medium; color: #b0b0b1"
          />
        </el-tooltip>
      </el-form-item>
      <el-form-item label="⏱ 审批期限（为 0 则不生效）" prop="timeLimit">
        <el-input
          v-model="nodeProps.timeLimit.timeout.value"
          style="width: 180px"
          placeholder="时长"
          type="number"
        >
          <template #append>
            <el-select
              v-model="nodeProps.timeLimit.timeout.unit"
              style="width: 75px"
              placeholder="请选择"
            >
              <el-option label="天" value="D" />
              <el-option label="小时" value="H" />
            </el-select>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item
        v-if="nodeProps.timeLimit.timeout.value > 0"
        label="审批期限超时后执行"
        prop="level"
      >
        <el-radio-group v-model="nodeProps.timeLimit.handler.type">
          <el-radio label="PASS">自动通过</el-radio>
          <el-radio label="REFUSE">自动驳回</el-radio>
          <el-radio label="NOTIFY">发送提醒</el-radio>
        </el-radio-group>
        <div v-if="nodeProps.timeLimit.handler.type === 'NOTIFY'">
          <div style=" font-size: small;color: #409eef">默认提醒当前审批人</div>
          <el-switch
            v-model="nodeProps.timeLimit.handler.notify.once"
            inactive-text="循环"
            active-text="一次"
          />
          <span
            v-if="!nodeProps.timeLimit.handler.notify.once"
            style="margin-left: 20px"
          >
            每隔
            <el-input-number
              v-model="nodeProps.timeLimit.handler.notify.hour"
              :min="0"
              :max="10000"
              :step="1"
            />
            小时提醒一次
          </span>
        </div>
      </el-form-item>
      <el-form-item label="🙅‍ 如果审批被驳回 👇">
        <el-radio-group v-model="nodeProps.refuse.type">
          <el-radio label="TO_END">直接结束流程</el-radio>
          <el-radio label="TO_BEFORE">驳回到上级审批节点</el-radio>
          <el-radio label="TO_NODE">驳回到指定节点</el-radio>
        </el-radio-group>
        <div v-if="nodeProps.refuse.type === 'TO_NODE'">
          <span>指定节点:</span>
          <el-select
            v-model="nodeProps.refuse.target"
            style=" width: 150px;margin-left: 10px"
            placeholder="选择跳转步骤"
          >
            <el-option
              v-for="(node, i) in nodeOptions"
              :key="i"
              :label="node.name"
              :value="node.id"
            />
          </el-select>
        </div>
      </el-form-item>

      <el-divider>抄送设置</el-divider>
      <el-form-item label="⚙ 选择抄送对象" prop="text" class="user-type">
        <el-radio-group v-model="nodeProps.ccType">
          <el-radio v-for="t in ccTypes" :key="t.type" :label="t.type">{{
            t.name
          }}</el-radio>
        </el-radio-group>
        <div v-if="nodeProps.ccType === 'ASSIGN_USER'">
          <el-button
            :icon="useRenderIcon('plus')"
            type="primary"
            round
            @click="selectCcUser"
            >选择人员</el-button
          >
          <OrgItems v-model="nodeProps.ccUser" />
        </div>
        <div v-else-if="nodeProps.ccType === 'ROLE'">
          <el-button
            :icon="useRenderIcon('plus')"
            type="primary"
            round
            @click="selectCcRole"
            >选择系统角色</el-button
          >
          <OrgItems v-model="nodeProps.ccRole" />
        </div>
      </el-form-item>
    </el-form>
    <OrgPicker
      ref="orgPickerRef"
      :title="pickerTitle"
      multiple
      :type="orgPickerType"
      :selected="orgPickerSelected"
      @ok="selected"
    />
    <OrgPicker
      ref="ccOrgPickerRef"
      :title="ccPickerTitle"
      multiple
      :type="ccOrgPickerType"
      :selected="ccOrgPickerSelected"
      @ok="ccSelected"
    />
  </div>
</template>

<style lang="scss" scoped>
.user-type {
  :deep(.el-radio) {
    width: 110px;
    margin-top: 10px;
    margin-bottom: 20px;
  }
}

:deep(.line-mode) {
  .el-radio {
    width: 150px;
    margin: 5px;
  }
}

:deep(.el-form-item__label) {
  line-height: 25px;
}

:deep(.approve-mode) {
  .el-radio {
    display: block;
    float: left;
    width: 100%;
    margin-top: 15px;
  }
}

:deep(.approve-end) {
  position: relative;

  .el-radio-group {
    width: 160px;
  }

  .el-radio {
    width: 100%;
    margin-bottom: 5px;
  }

  .approve-end-leave {
    position: absolute;
    bottom: -5px;
    left: 150px;
  }
}

:deep(.el-divider--horizontal) {
  margin: 10px 0;
}
</style>
