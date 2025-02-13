<script setup lang="ts">
import InsertButton from "../InsertButton.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "Concurrent"
});
const emit = defineEmits([
  "selected",
  "delNode",
  "insertNode",
  "rightMove",
  "leftMove",
  "copy"
]);
defineProps({
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
</script>
<template>
  <div class="node">
    <div class="node-body" @click="emit('selected')">
      <div
        v-if="level > 1"
        class="node-body-left"
        @click.stop="emit('leftMove')"
      >
        <component :is="useRenderIcon('arrow-left-s-line')" />
      </div>
      <div class="node-body-main">
        <div class="node-body-main-header">
          <span class="title">
            <component :is="useRenderIcon('0peration')" />
            <ellipsis
              class="name"
              hover-tip
              :content="config.name ? config.name : '并行任务' + level"
            />
          </span>
          <span class="option">
            <el-tooltip effect="dark" content="复制分支" placement="top">
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
          <span>并行任务（同时进行）</span>
        </div>
      </div>
      <div
        v-if="level < size"
        class="node-body-right"
        @click.stop="emit('rightMove')"
      >
        <component :is="useRenderIcon('arrow-right-s-line')" />
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
.node {
  box-sizing: content-box;
  width: 220px;
  padding: 30px 55px 0;

  .node-body {
    position: relative;
    min-height: 80px;
    max-height: 120px;
    overflow: hidden;
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
      right: 0;
    }

    .node-body-main {
      position: absolute;
      left: 17px;
      display: inline-block;
      width: 188px;

      .node-body-main-header {
        position: relative;
        padding: 10px 0 5px;
        font-size: xx-small;

        .title {
          color: #718dff;

          .name {
            display: inline-block;
            width: 130px;
            height: 14px;
            margin-left: 2px;
          }
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
      }
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
