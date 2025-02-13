<script setup lang="ts">
import { ref, computed } from "vue";
import InsertButton from "../InsertButton.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ValueType } from "@/views/oa/common/form/ComponentsConfigExport";

defineOptions({
  name: "Condition"
});
const emit = defineEmits([
  "selected",
  "delNode",
  "insertNode",
  "rightMove",
  "leftMove",
  "copy"
]);
const props = defineProps({
  config: {
    type: Object,
    default: () => {
      return {};
    }
  },
  //索引位置
  level: {
    type: Number,
    default: 1
  },
  //条件数
  size: {
    type: Number,
    default: 0
  }
});

const groupNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];

const placeholder = ref("请设置条件");
const errorInfo = ref("");
const showError = ref(false);

const content = computed(() => {
  const groups = props.config.props.groups;
  const confitions = [];
  groups.forEach(group => {
    const subConditions = [];
    group.conditions.forEach(subCondition => {
      let subConditionStr = "";
      switch (subCondition.valueType) {
        case ValueType.dept:
        case ValueType.user:
          subConditionStr = `${subCondition.title}属于[${String(
            subCondition.value.map(u => u.name)
          ).replaceAll(",", ". ")}]之一`;
          break;
        case ValueType.number:
        case ValueType.string:
          subConditionStr = getOrdinaryConditionContent(subCondition);
          break;
      }
      subConditions.push(subConditionStr);
    });
    //根据子条件关系构建描述
    const subConditionsStr = String(subConditions).replaceAll(
      ",",
      subConditions.length > 1
        ? group.groupType === "AND"
          ? ") 且 ("
          : ") 或 ("
        : group.groupType === "AND"
          ? " 且 "
          : " 或 "
    );
    confitions.push(
      subConditions.length > 1 ? `(${subConditionsStr})` : subConditionsStr
    );
  });
  //构建最终描述
  return String(confitions).replaceAll(
    ",",
    props.config.props.groupsType === "AND" ? " 且 " : " 或 "
  );
});

function getDefault(val, df) {
  return val && val !== "" ? val : df;
}
function getOrdinaryConditionContent(subCondition) {
  switch (subCondition.compare) {
    case "IN":
      return `${subCondition.title}为[${String(subCondition.value).replaceAll(
        ",",
        "、"
      )}]中之一`;
    case "B":
      return `${subCondition.value[0]} < ${subCondition.title} < ${subCondition.value[1]}`;
    case "AB":
      return `${subCondition.value[0]} ≤ ${subCondition.title} < ${subCondition.value[1]}`;
    case "BA":
      return `${subCondition.value[0]} < ${subCondition.title} ≤ ${subCondition.value[1]}`;
    case "ABA":
      return `${subCondition.value[0]} ≤ ${subCondition.title} ≤ ${subCondition.value[1]}`;
    case "<=":
      return `${subCondition.title} ≤ ${getDefault(
        subCondition.value[0],
        " ?"
      )}`;
    case ">=":
      return `${subCondition.title} ≥ ${getDefault(
        subCondition.value[0],
        " ?"
      )}`;
    default:
      return `${subCondition.title}${subCondition.compare}${getDefault(
        subCondition.value[0],
        " ?"
      )}`;
  }
}
//校验数据配置的合法性
function validate(err) {
  const _props = props.config.props;
  if (_props.groups.length <= 0) {
    showError.value = true;
    errorInfo.value = "请设置分支条件";
    err.push(`${props.config.name} 未设置条件`);
  } else {
    for (let i = 0; i < _props.groups.length; i++) {
      if (_props.groups[i].cids.length === 0) {
        showError.value = true;
        errorInfo.value = `请设置条件组${groupNames[i]}内的条件`;
        err.push(
          `条件 ${props.config.name} 条件组${groupNames[i]}内未设置条件`
        );
        break;
      } else {
        const conditions = _props.groups[i].conditions;
        for (let ci = 0; ci < conditions.length; ci++) {
          const subc = conditions[ci];
          if (subc.value.length === 0) {
            showError.value = true;
          } else {
            showError.value = false;
          }
          if (showError.value) {
            errorInfo.value = `请完善条件组${groupNames[i]}内的${subc.title}条件`;
            err.push(
              `条件 ${props.config.name} 条件组${groupNames[i]}内${subc.title}条件未完善`
            );
            return false;
          }
        }
      }
    }
  }
  return !showError.value;
}
defineExpose({ validate });
</script>

<template>
  <div :class="{ node: true, 'node-error-state': showError }">
    <div :class="{ 'node-body': true, error: showError }">
      <div v-if="level > 1" class="node-body-left" @click="emit('leftMove')">
        <component :is="useRenderIcon('arrow-left-s-line')" />
      </div>
      <div class="node-body-main" @click="emit('selected')">
        <div class="node-body-main-header">
          <ellipsis
            class="title"
            hover-tip
            :content="config.name ? config.name : '条件' + level"
          />
          <span class="level">优先级{{ level }}</span>
          <span class="option">
            <el-tooltip effect="dark" content="复制条件" placement="top">
              <component
                :is="useRenderIcon('copy-document')"
                @click.stop="emit('copy')"
              />
            </el-tooltip>
            <component
              :is="useRenderIcon('close')"
              @click.stop="emit('delNode')"
            />
          </span>
        </div>
        <div class="node-body-main-content">
          <span v-if="(content || '').trim() === ''" class="placeholder">{{
            placeholder
          }}</span>
          <ellipsis v-else hoverTip :row="4" :content="content" />
        </div>
      </div>
      <div
        v-if="level < size"
        class="node-body-right"
        @click="emit('rightMove')"
      >
        <component :is="useRenderIcon('arrow-right-s-line')" />
      </div>
      <div v-if="showError" class="node-error">
        <el-tooltip effect="dark" :content="errorInfo" placement="top-start">
          <component :is="useRenderIcon('warningFilled')" />
        </el-tooltip>
      </div>
    </div>
    <div class="node-footer">
      <div class="btn">
        <insert-button @insertNode="type => emit('insertNode', type)" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.node-error-state {
  .node-body {
    box-shadow: 0 0 5px 0 #f56c6c !important;
  }
}

.node {
  box-sizing: content-box;
  width: 220px;
  padding: 30px 55px 0;

  .node-body {
    position: relative;
    min-height: 80px;
    max-height: 120px;
    cursor: pointer;
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 0 5px 0 #d8d8d8;

    &:hover {
      box-shadow: 0 0 3px 0 $subMenuActiveBg;

      .node-body-left,
      .node-body-right {
        i {
          display: block !important;
        }
      }

      .node-body-main {
        .level {
          display: none !important;
        }

        .option {
          display: inline-block !important;
        }
      }
    }

    .node-body-left,
    .node-body-right {
      position: absolute;
      display: flex;
      align-items: center;
      height: 100%;

      i {
        display: none;
      }

      &:hover {
        background-color: #ececec;
      }
    }

    .node-body-left {
      left: 0;
    }

    .node-body-right {
      top: 0;
      right: 0;
    }

    .node-body-main {
      display: inline-block;
      //position: absolute;
      width: 188px;
      margin-left: 17px;

      .node-body-main-header {
        position: relative;
        padding: 10px 0 5px;
        font-size: xx-small;

        .title {
          display: inline-block;
          width: 125px;
          height: 14px;
          color: #15bca3;
        }

        .level {
          position: absolute;
          right: 15px;
          color: #888;
        }

        .option {
          position: absolute;
          right: 0;
          display: none;
          font-size: medium;

          i {
            padding: 0 3px;
            color: #888;
          }
        }
      }

      .node-body-main-content {
        padding: 6px;
        font-size: 14px;
        color: #656363;

        i {
          position: absolute;
          top: 55%;
          right: 10px;
          font-size: medium;
        }

        .placeholder {
          color: #8c8c8c;
        }
      }
    }

    .node-error {
      position: absolute;
      top: 20px;
      right: -40px;
      font-size: 25px;
      color: #f56c6c;
    }
  }

  .node-footer {
    position: relative;

    .btn {
      display: flex;
      justify-content: center;
      width: 100%;
      height: 70px;
      padding: 20px 0 32px;
    }

    :deep(.el-button) {
      height: 32px;
    }

    &::before {
      position: absolute;
      inset: 0;
      z-index: -1;
      width: 2px;
      height: 100%;
      margin: auto;
      content: "";
      background-color: #cacaca;
    }
  }
}
</style>
