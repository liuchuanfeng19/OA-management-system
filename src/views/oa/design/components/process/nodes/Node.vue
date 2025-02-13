<script setup lang="ts">
import InsertButton from "../InsertButton.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "Node"
});
const emit = defineEmits(["selected", "delNode", "insertNode"]);
defineProps({
  //是否为根节点
  isRoot: {
    type: Boolean,
    default: false
  },
  //是否显示节点体
  show: {
    type: Boolean,
    default: true
  },
  //节点内容区域文字
  content: {
    type: String,
    default: ""
  },
  title: {
    type: String,
    default: "标题"
  },
  placeholder: {
    type: String,
    default: "请设置"
  },
  //节点体左侧图标
  leftIcon: {
    type: String,
    default: undefined
  },
  //头部图标
  headerIcon: {
    type: String,
    default: ""
  },
  //头部背景色
  headerBgc: {
    type: String,
    default: "#576a95"
  },
  //是否显示错误状态
  showError: {
    type: Boolean,
    default: false
  },
  errorInfo: {
    type: String,
    default: "无信息"
  }
});
</script>

<template>
  <div
    :class="{
      node: true,
      root: isRoot || !show,
      'node-error-state': showError
    }"
  >
    <div
      v-if="show"
      :class="{ 'node-body': true, error: showError }"
      @click="emit('selected')"
    >
      <div
        class="node-body-header flex justify-between items-center"
        :style="{ 'background-color': headerBgc }"
      >
        <div class="flex-1 flex justify-start items-center">
          <component
            :is="useRenderIcon(headerIcon)"
            v-if="(headerIcon || '') !== ''"
            :class="headerIcon"
            style="margin-right: 5px"
          />
          <Ellipsis class="w-[168px]" hover-tip :content="title" />
        </div>
        <component
          :is="useRenderIcon('close')"
          v-if="!isRoot"
          class="el-icon-close"
          @click="emit('delNode')"
        />
      </div>
      <div class="node-body-content">
        <component :is="useRenderIcon(leftIcon)" v-if="leftIcon" />
        <span v-if="(content || '').trim() === ''" class="placeholder">{{
          placeholder
        }}</span>
        <Ellipsis v-else :row="3" :content="content" />
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
        <InsertButton @insertNode="type => emit('insertNode', type)" />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.root {
  &::before {
    display: none !important;
  }
}

.node-error-state {
  .node-body {
    box-shadow: 0 0 5px 0 #f56c6c !important;
  }
}

.node {
  position: relative;
  width: 220px;

  &::before {
    position: absolute;
    top: -12px;
    left: 50%;
    width: 0;
    content: "";
    background: #f5f5f7;
    border-color: #cacaca transparent transparent;
    border-style: solid;
    border-width: 8px 6px 4px;
    transform: translateX(-50%);
    transform: translateX(-50%);
  }

  .node-body {
    position: relative;
    max-height: 120px;
    cursor: pointer;
    background-color: white;
    border-radius: 5px;
    box-shadow: 0 0 5px 0 #d8d8d8;

    &:hover {
      box-shadow: 0 0 3px 0 $subMenuActiveBg;

      .node-body-header {
        .el-icon-close {
          display: inline;
          font-size: medium;
        }
      }
    }

    .node-body-header {
      display: flex;
      height: 32px;
      padding: 0 10px;
      font-size: medium;
      line-height: 32px;
      color: white;
      border-top-left-radius: 5px;
      border-top-right-radius: 5px;

      .el-icon-close {
        display: none;
      }
    }

    .node-body-content {
      padding: 18px;
      font-size: 14px;
      color: #656363;

      svg {
        position: absolute;
        top: 55%;
        right: 5px;
        font-size: medium;
      }

      .placeholder {
        color: #8c8c8c;
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
