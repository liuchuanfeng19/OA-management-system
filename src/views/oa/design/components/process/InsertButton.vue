<script setup lang="ts">
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
// import { storeToRefs } from "pinia";
// import { useOAStoreHook } from "@/store/modules/oa";

defineOptions({
  name: "InsertButton"
});
const emit = defineEmits(["insertNode"]);

// const { selectedNode } = storeToRefs(useOAStoreHook());

function addApprovalNode() {
  emit("insertNode", "APPROVAL");
}
function addCcNode() {
  emit("insertNode", "CC");
}
function addDelayNode() {
  emit("insertNode", "DELAY");
}
function addConditionsNode() {
  emit("insertNode", "CONDITIONS");
}
function addConcurrentsNode() {
  emit("insertNode", "CONCURRENTS");
}
function addTriggerNode() {
  emit("insertNode", "TRIGGER");
}
</script>

<template>
  <el-popover
    placement="bottom-start"
    title="添加流程节点"
    width="350"
    trigger="click"
  >
    <div class="node-select">
      <div @click="addApprovalNode">
        <component
          :is="useRenderIcon('check')"
          style="color: rgb(255, 148, 62)"
        />
        <span>审批人</span>
      </div>
      <div @click="addCcNode">
        <component
          :is="useRenderIcon('promotion')"
          style="color: rgb(50, 150, 250)"
        />
        <span>抄送人</span>
      </div>
      <div @click="addConditionsNode">
        <component
          :is="useRenderIcon('share')"
          style="color: rgb(21, 188, 131)"
        />
        <span>条件分支</span>
      </div>
      <div @click="addConcurrentsNode">
        <component :is="useRenderIcon('operation')" style="color: #718dff" />
        <span>并行分支</span>
      </div>
      <div @click="addDelayNode">
        <component :is="useRenderIcon('timer')" style="color: #f25643" />
        <span>延迟等待</span>
      </div>
      <div @click="addTriggerNode">
        <component :is="useRenderIcon('set-up')" style="color: #15bc83" />
        <span>触发器</span>
      </div>
    </div>
    <template #reference>
      <el-button :icon="useRenderIcon('plus')" type="primary" circle />
    </template>
  </el-popover>
</template>

<style lang="scss" scoped>
.node-select {
  div {
    display: inline-block;
    margin: 5px 5px;
    cursor: pointer;
    padding: 10px 15px;
    border: 1px solid #f8f9f9;
    background-color: #f8f9f9;
    border-radius: 10px;
    width: 120px;
    position: relative;
    box-sizing: content-box;

    span {
      position: absolute;
      left: 65px;
      top: 18px;
    }

    &:hover {
      background-color: #fff;
      box-shadow: 0 0 8px 2px #d6d6d6;
    }

    svg {
      font-size: 25px;
      padding: 5px;
      border: 1px solid #dedfdf;
      border-radius: 14px;
    }
  }
}
</style>
