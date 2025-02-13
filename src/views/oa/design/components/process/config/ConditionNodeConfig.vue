<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";

import { useOAStoreHook } from "@/store/modules/oa";
import draggable from "vuedraggable/src/vuedraggable";
import GroupItem from "./ConditionGroupItemConfig.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "ConditionNodeConfig"
});
const sortOption = {
  animation: 300,
  chosenClass: "choose",
  scroll: true,
  sort: true
};

const { selectedNode, nodeMap } = storeToRefs(useOAStoreHook());
const config = computed(() => {
  return selectedNode.value.props;
});

// const select = computed(() => {
//   return props.config.assignedUser || [];
// });
const nowNodeLeave = computed(() => {
  return prioritySortList.value.indexOf(selectedNode.value);
});
//条件节点
const prioritySortList = computed(() => {
  const node = nodeMap.value.get(selectedNode.value.parentId);
  console.log(selectedNode.value.id, node);
  if (node) {
    return node.branchs || [];
  }
  return [];
});

function addConditionGroup() {
  config.value.groups.push({
    cids: [],
    groupType: "OR",
    conditions: []
  });
}
// function selected(select) {
//   console.log(select);
//   this.showOrgSelect = false;
//   select.forEach(val => select.value.push(val));
// }
// defineExpose({ selected });
</script>

<template>
  <div>
    <el-form inline label-width="100px">
      <el-form-item label="调整优先级" prop="level">
        <el-popover
          placement="right"
          title="拖拽条件调整优先级顺序"
          width="250"
          trigger="click"
        >
          <draggable
            style="width: 100%; min-height: 25px"
            :list="prioritySortList"
            group="from"
            :options="sortOption"
          >
            <template #item="{ element, index }">
              <div
                :class="{
                  'drag-no-choose': true,
                  'drag-hover': element.id === selectedNode.id
                }"
              >
                <ellipsis
                  style="width: 160px"
                  hover-tip
                  :content="element.name"
                />
                <div>优先级 {{ index + 1 }}</div>
              </div>
            </template>
          </draggable>
          <template #reference>
            <el-button :icon="useRenderIcon('sort')"
              >第{{ nowNodeLeave + 1 }}级</el-button
            >
          </template>
        </el-popover>
      </el-form-item>
      <el-form-item label="条件组关系" label-width="150px">
        <el-switch
          v-model="config.groupsType"
          active-color="#409EFF"
          inactive-color="#c1c1c1"
          active-value="AND"
          inactive-value="OR"
          active-text="且"
          inactive-text="或"
        />
      </el-form-item>
      <el-form-item label="条件组表达式">
        <el-input
          v-model="config.expression"
          placeholder="输入条件组关系表达式  &为与，|为或"
        />
        <span class="item-desc">使用表达式构建复杂逻辑，例如: (A & B) | C</span>
      </el-form-item>
    </el-form>
    <div>
      <el-button
        type="primary"
        :icon="useRenderIcon('plus')"
        style="margin: 0 15px 15px 0"
        round
        @click="addConditionGroup"
      >
        添加条件组
      </el-button>
      <span class="item-desc">只有必填选项才能作为审批条件</span>
    </div>
    <GroupItem />
  </div>
</template>

<style lang="scss" scoped>
.choose {
  border-radius: 5px;
  margin-top: 2px;
  background: #f4f4f4;
  border: 1px dashed #1890ff !important;
}

.drag-hover {
  color: #1890ff;
}

.drag-no-choose {
  cursor: move;
  background: #f8f8f8;
  border-radius: 5px;
  margin: 5px 0;
  height: 25px;
  line-height: 25px;
  padding: 5px 10px;
  border: 1px solid #ffffff;

  div {
    display: inline-block;
    font-size: small !important;
  }

  div:nth-child(2) {
    float: right !important;
  }
}
</style>
