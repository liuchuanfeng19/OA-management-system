<script setup lang="ts">
import { ref, computed } from "vue";
import { storeToRefs } from "pinia";

import Node from "./Node.vue";
import { useOAStoreHook } from "@/store/modules/oa";

defineOptions({
  name: "Approval"
});
const emit = defineEmits(["selected", "delNode", "insertNode"]);
const props = defineProps({
  config: {
    type: Object,
    default: () => {
      return {};
    }
  }
});

const errorInfo = ref("");
const showError = ref(false);
const { design } = storeToRefs(useOAStoreHook());

const content = computed(() => {
  const _config = props.config.props;
  switch (_config.assignedType) {
    case "ASSIGN_USER":
      if (_config.assignedUser.length > 0) {
        const texts = [];
        _config.assignedUser.forEach(org => texts.push(org.name));
        return String(texts).replaceAll(",", "、");
      } else {
        return "请指定审批人";
      }
    case "SELF":
      return "发起人自己";
    case "CUSTOM_ASSIGN_USER":
      return "系统自动分配";
    case "SELF_SELECT":
      return _config.selfSelect.multiple ? "发起人自选多人" : "发起人自选一人";
    case "LEADER_TOP":
      return "多级主管依次审批";
    case "LEADER":
      return _config.leader.level > 1
        ? "发起人的第 " + _config.leader.level + " 级主管"
        : "发起人的直接主管";
    case "FORM_USER":
      if (!_config.formUser || _config.formUser === "") {
        return "表单内联系人（未选择）";
      } else {
        const text = getFormItemById(_config.formUser);
        if (text && text.title) {
          return `表单（${text.title}）内的人员`;
        } else {
          return "该表单已被移除😥";
        }
      }
    case "ROLE":
      if (_config.role.length > 0) {
        // return String(_config.role).replaceAll(",", "、");
        const texts = [];
        _config.role.forEach(org => texts.push(org.name));
        return "指定角色（" + String(texts).replaceAll(",", "、") + "）";
      } else {
        return "指定角色（未设置）";
      }
    default:
      return "未知设置项😥";
  }
});
function getFormItemById(id) {
  return design.value.formItems.find(item => item.id === id);
}
//校验数据配置的合法性
function validate(err) {
  try {
    return (showError.value =
      !validateFun[`validate_${props.config.props.assignedType}`](err));
  } catch (e) {
    return true;
  }
}
defineExpose({ validate });

const validateFun = {
  validate_ASSIGN_USER: err => {
    if (props.config.props.assignedUser.length > 0) {
      return true;
    } else {
      errorInfo.value = "请指定审批人员";
      err.push(`${props.config.name} 未指定审批人员`);
      return false;
    }
  },
  validate_SELF_SELECT: _err => {
    return true;
  },
  validate_LEADER_TOP: _err => {
    return true;
  },
  validate_LEADER: _err => {
    return true;
  },
  validate_ROLE: err => {
    if (props.config.props.role.length <= 0) {
      errorInfo.value = "请指定负责审批的系统角色";
      err.push(`${props.config.name} 未指定审批角色`);
      return false;
    }
    return true;
  },
  validate_SELF: _err => {
    return true;
  },
  validate_FORM_USER: err => {
    if (props.config.props.formUser === "") {
      errorInfo.value = "请指定表单中的人员组件";
      err.push(`${props.config.name} 审批人为表单中人员，但未指定`);
      return false;
    }
    return true;
  },
  validate_REFUSE: _err => {
    return true;
  }
};
</script>

<template>
  <Node
    :title="config.name"
    :show-error="showError"
    :content="content"
    :error-info="errorInfo"
    placeholder="请设置审批人"
    header-bgc="#ff943e"
    header-icon="check"
    @selected="emit('selected')"
    @delNode="emit('delNode')"
    @insertNode="type => emit('insertNode', type)"
  />
</template>
