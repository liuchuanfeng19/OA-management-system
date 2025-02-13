<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, computed } from "vue";

import OrgItems from "../OrgItems.vue";
import { useOAStoreHook } from "@/store/modules/oa";
import OrgPicker from "@/components/common/OrgPicker.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { ValueType } from "@/views/oa/common/form/ComponentsConfigExport";

defineOptions({
  name: "ConditionGroupItemConfig"
});
const explains = [
  { label: "等于", value: "=" },
  { label: "大于", value: ">" },
  { label: "大于等于", value: ">=" },
  { label: "小于", value: "<" },
  { label: "小于等于", value: "<=" },
  { label: "包含在", value: "IN" },
  { label: "x < 值 < x", value: "B" },
  { label: "x ≤ 值 < x", value: "AB" },
  { label: "x < 值 ≤ x", value: "BA" },
  { label: "x ≤ 值 ≤ x", value: "ABA" }
];
const groupNames = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"];
const supportTypes = [
  ValueType.number,
  ValueType.string,
  ValueType.date,
  ValueType.dept,
  ValueType.user
];

const { selectedNode, design } = storeToRefs(useOAStoreHook());
const users = ref([]);
const orgPickerRef = ref();
const orgType = ref("user");

// const select = computed(() => {
//   return selectedNode.value.props.assignedUser || [];
// });
const formItems = computed(() => {
  return design.value.formItems;
});
const formMap = computed(() => {
  const map = new Map();
  formItems.value.forEach(item => itemToMap(map, item));
  return map;
});
const conditionList = computed(() => {
  //构造可用条件选项
  const conditionItems = [];
  formItems.value.forEach(item => filterCondition(item, conditionItems));
  if (conditionItems.length === 0 || conditionItems[0].id !== "root") {
    conditionItems.unshift({
      id: "root",
      title: "发起人",
      valueType: "User"
    });
  }
  return conditionItems;
});

function itemToMap(map, item) {
  map.set(item.id, item);
  if (item.name === "SpanLayout") {
    item.props.items.forEach(sub => itemToMap(map, sub));
  }
}
function isSelect(formId) {
  const form = formMap.value.get(formId);
  if (form && (form.name === "SelectInput" || form.name === "MultipleSelect")) {
    return true;
  }
  return false;
}
function getOptions(formId) {
  return formMap.value.get(formId).props.options || [];
}
function conditionValType(type) {
  switch (type) {
    case "=":
    case ">":
    case ">=":
    case "<":
    case "<=":
      return 0;
    case "IN":
      return 1;
    default:
      return 2;
  }
}
function selectUser(value, orgType) {
  orgType.value = orgType;
  users.value = value;
  orgPickerRef.value.show();
}
function filterCondition(item, list) {
  if (item.name === "SpanLayout") {
    item.props.items.forEach(sub => filterCondition(sub, list));
  } else if (supportTypes.indexOf(item.valueType) > -1 && item.props.required) {
    list.push({
      title: item.title,
      id: item.id,
      valueType: item.valueType
    });
  }
}
function selected(select) {
  console.log(select);
  users.value.length = 0;
  select.forEach(u => users.value.push(u));
}
function delGroup(index) {
  selectedNode.value.props.groups.splice(index, 1);
}
function rmSubCondition(group, index) {
  group.cids.splice(index, 1);
  group.conditions.splice(index, 1);
}
function conditionChange(index, group) {
  //判断新增的
  group.cids.forEach(cid => {
    if (0 > group.conditions.findIndex(cd => cd.id === cid)) {
      //新增条件
      const condition = { ...conditionList.value[index] };
      console.log(condition, conditionList.value, index);
      condition.compare = "";
      condition.value = [];
      group.conditions.push(condition);
    }
  });
  for (let i = 0; i < group.conditions.length; i++) {
    //去除没有选中的
    if (group.cids.indexOf(group.conditions[i].id) < 0) {
      group.conditions.splice(i, 1);
    }
  }
}
</script>

<template>
  <div>
    <div
      v-for="(group, index) in selectedNode.props.groups"
      :key="index + '_g'"
      class="group"
    >
      <div class="group-header">
        <span class="group-name">条件组 {{ groupNames[index] }}</span>
        <div class="group-cp">
          <span>组内条件关系：</span>
          <el-switch
            v-model="group.groupType"
            active-color="#409EFF"
            inactive-color="#c1c1c1"
            active-value="AND"
            inactive-value="OR"
            active-text="且"
            inactive-text="或"
          />
        </div>
        <div class="group-operation">
          <el-popover
            placement="bottom"
            title="选择审批条件"
            width="300"
            trigger="click"
          >
            <!-- <div>以下条件将决定具体的审批流程</div>-->
            <el-checkbox-group v-model="group.cids" value-key="id">
              <el-checkbox
                v-for="(condition, cindex) in conditionList"
                :key="condition.id"
                :label="condition.id"
                @change="conditionChange(cindex, group)"
              >
                {{ condition.title }}
              </el-checkbox>
            </el-checkbox-group>
            <template #reference>
              <IconifyIconOffline icon="plus" />
            </template>
          </el-popover>
          <IconifyIconOffline icon="delete" @click="delGroup(index)" />
        </div>
      </div>
      <div class="group-content">
        <p v-if="group.conditions.length === 0">
          点击右上角 + 为本条件组添加条件 ☝
        </p>
        <div v-else>
          <el-form ref="condition-form" label-width="100px">
            <!--构建表达式-->
            <el-form-item
              v-for="(condition, cindex) in group.conditions"
              :key="condition.id + '_' + cindex"
            >
              <template #label>
                <ellipsis hover-tip :content="condition.title" />
              </template>
              <span v-if="condition.valueType === ValueType.string">
                <el-select
                  v-model="condition.compare"
                  placeholder="判断符"
                  style="width: 120px"
                  @change="condition.value = []"
                >
                  <el-option label="等于" value="=" />
                  <el-option label="包含在" value="IN" />
                </el-select>
                <span v-if="isSelect(condition.id)" style="margin-left: 10px">
                  <el-select
                    v-if="condition.compare === 'IN'"
                    v-model="condition.value"
                    style="width: 280px"
                    clearable
                    multiple
                    placeholder="选择值"
                  >
                    <el-option
                      v-for="(option, oi) in getOptions(condition.id)"
                      :key="oi"
                      :label="option"
                      :value="option"
                    />
                  </el-select>
                  <el-select
                    v-else
                    v-model="condition.value[0]"
                    style="width: 280px"
                    clearable
                    placeholder="选择值"
                  >
                    <el-option
                      v-for="(option, oi) in getOptions(condition.id)"
                      :key="oi"
                      :label="option"
                      :value="option"
                    />
                  </el-select>
                </span>
                <span v-else style="margin-left: 10px">
                  <el-input
                    v-if="condition.compare === '='"
                    v-model="condition.value[0]"
                    style="width: 280px"
                    placeholder="输入比较值"
                  />
                  <el-select
                    v-else
                    v-model="condition.value"
                    style="width: 280px"
                    multiple
                    clearable
                    filterable
                    allow-create
                    placeholder="输入可能包含的值"
                  />
                </span>
              </span>
              <span v-else-if="condition.valueType === ValueType.number">
                <el-select
                  v-model="condition.compare"
                  placeholder="判断符"
                  style="width: 120px"
                >
                  <el-option
                    v-for="exp in explains"
                    :key="exp.value"
                    :label="exp.label"
                    :value="exp.value"
                  />
                </el-select>
                <span style="margin-left: 10px">
                  <el-input
                    v-if="conditionValType(condition.compare) === 0"
                    v-model="condition.value[0]"
                    style="width: 280px"
                    placeholder="输入比较值"
                    type="number"
                  />
                  <el-select
                    v-else-if="conditionValType(condition.compare) === 1"
                    v-model="condition.value"
                    style="width: 280px"
                    multiple
                    filterable
                    allow-create
                    placeholder="输入可能包含的值"
                  />
                  <span v-else>
                    <el-input
                      v-model="condition.value[0]"
                      style="width: 130px"
                      type="number"
                      placeholder="输入比较值"
                    />
                    <span>
                      ~
                      <el-input
                        v-model="condition.value[1]"
                        style="width: 130px"
                        type="number"
                        placeholder="输入比较值"
                      />
                    </span>
                  </span>
                </span>
              </span>
              <span v-else-if="condition.valueType === ValueType.user">
                <span class="item-desc" style="margin-right: 20px"
                  >属于某部门 / 为某些人其中之一</span
                >
                <el-button
                  :icon="useRenderIcon('plus')"
                  type="primary"
                  round
                  @click="selectUser(condition.value, 'user')"
                  >选择人员/部门</el-button
                >
                <org-items v-model="condition.value" />
              </span>
              <span v-else-if="condition.valueType === ValueType.dept">
                <span class="item-desc" style="margin-right: 20px"
                  >为某部门 / 某部门下的部门</span
                >
                <el-button
                  :icon="useRenderIcon('plus')"
                  type="primary"
                  round
                  @click="selectUser(condition.value, 'dept')"
                  >选择部门</el-button
                >
                <org-items v-model="condition.value" />
              </span>
              <span v-else-if="condition.valueType === ValueType.date" />
              <component
                :is="useRenderIcon('delete')"
                class="el-icon-delete"
                @click="rmSubCondition(group, cindex)"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>
    </div>
    <OrgPicker
      ref="orgPickerRef"
      :type="orgType"
      multiple
      :selected="users"
      @ok="selected"
    />
  </div>
</template>

<style lang="scss" scoped>
.group {
  margin-bottom: 20px;
  overflow: hidden;
  color: #5e5e5e;
  border: 1px solid #e3e3e3;
  border-radius: 6px;

  .group-header {
    position: relative;
    padding: 5px 10px;
    background: #e3e3e3;

    div {
      display: inline-block;
    }

    .group-name {
      font-size: small;
    }

    .group-cp {
      position: absolute;
      top: 5px;
      left: 100px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: small;
    }

    .group-operation {
      position: absolute;
      right: 10px;

      i {
        padding: 0 10px;

        &:hover {
          cursor: pointer;
        }
      }
    }
  }

  .group-content {
    padding: 10px 5px;

    p {
      font-size: small;
      text-align: center;
    }

    .el-icon-delete {
      position: absolute;
      top: 12px;
      right: 0;
      cursor: pointer;
    }
  }

  .condition-title {
    display: block;
    width: 100px;
  }
}
</style>
