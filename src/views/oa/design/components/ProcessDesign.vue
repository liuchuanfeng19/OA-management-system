<script setup lang="ts">
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";

import { useOAStoreHook } from "@/store/modules/oa";
import ProcessTree from "./process/ProcessTree.vue";
import NodeConfig from "./process/config/NodeConfig.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "ProcessDesign"
});

const { selectedNode } = storeToRefs(useOAStoreHook());

const scale = ref(100);
const processTreeRef = ref();
// const selected = ref({});
const showInput = ref(false);
const showConfig = ref(false);

function validate() {
  return processTreeRef.value.validateProcess();
}
defineExpose({ validate });

function nodeSelected(node) {
  console.log("配置节点", node);
  showConfig.value = true;
}
watch(selectedNode, newVal => {
  console.log("newVal", newVal);
  /*selectedNode:{
      deep: true,
      handler(node){
        console.log("更新")
        processTreeRef.value.nodeDomUpdate(node)
      }
    }*/
});
</script>

<template>
  <el-main>
    <div class="scale">
      <el-button
        :icon="useRenderIcon('plus')"
        :disabled="scale >= 150"
        circle
        @click="scale += 10"
      />
      <span>{{ scale }}%</span>
      <el-button
        :icon="useRenderIcon('minus')"
        :disabled="scale <= 40"
        circle
        @click="scale -= 10"
      />
      <!--      <el-button @click="validate">校验流程</el-button>-->
    </div>
    <div class="design" :style="'transform: scale(' + scale / 100 + ');'">
      <ProcessTree ref="processTreeRef" @selectedNode="nodeSelected" />
    </div>
    <el-drawer
      v-if="selectedNode"
      v-model="showConfig"
      :title="selectedNode.name"
      :modal-append-to-body="false"
      :size="selectedNode.type === 'CONDITION' ? '600px' : '500px'"
      direction="rtl"
      :modal="false"
      destroy-on-close
    >
      <template #title>
        <div>
          <el-input
            v-show="showInput"
            v-model="selectedNode.name"
            style="width: 300px"
            @blur="showInput = false"
          />
          <el-link
            v-show="!showInput"
            style="font-size: medium"
            @click="showInput = true"
          >
            <component :is="useRenderIcon('edit')" style="margin-right: 10px" />
            {{ selectedNode.name }}
          </el-link>
        </div>
      </template>

      <div class="node-config-content">
        <NodeConfig />
      </div>
    </el-drawer>
  </el-main>
</template>

<style lang="scss" scoped>
.design {
  display: flex;
  margin-top: 100px;
  transform-origin: 50% 0 0;
}

.scale {
  position: fixed;
  top: 80px;
  right: 40px;
  z-index: 999;

  span {
    width: 50px;
    margin: 0 10px;
    font-size: 15px;
    color: #7a7a7a;
  }
}

.node-config-content {
  padding: 0 20px 20px;
}

:deep(.el-drawer__body) {
  overflow-y: auto;
}
</style>
