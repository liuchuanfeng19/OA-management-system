<script setup lang="ts">
import _ from "lodash";
import { storeToRefs } from "pinia";
import type { ElTree } from "element-plus";
import { ref, reactive } from "vue";
import { getStaffList } from "@/api/staff";
import { userDepartmentStoreHook } from "@/store/modules/department";

//回调方法
const emit = defineEmits(["staffCallBack"]);
const { getDepartmentTree } = userDepartmentStoreHook();

const requesting = ref(false);
const formVisible = ref(false);
const dialogTitle = ref("考勤组人员设置");
interface Tree {
  id: number;
  name: string;
  highlight?: boolean;
  children?: Tree[];
}
const defaultProps = {
  children: "children",
  label: "fullName"
};
const treeRef = ref<InstanceType<typeof ElTree>>();
const searchValue = ref("");
const highlightMap = ref({});
const units = ref("");
const depts = ref("");
const staffData = ref([]);
const isCheckedAll = ref(false);
const isIndeterminate = ref(true);
const selectStaffs = ref([]);
const selectStaffIds = ref("");
const queryForm = reactive({
  staffName: "",
  deptId: "",
  pageIndex: 1,
  pageSize: 999
});
const { departmentTree } = storeToRefs(userDepartmentStoreHook());

// 子组件暴露给父组件调用的方法
const show = (staffIds, staffNames) => {
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  formVisible.value = true;
  selectStaffs.value = [];
  if (staffIds != null && staffIds.length > 0) {
    selectStaffIds.value = staffIds.join(",");
    const sNames = staffNames.split(",");
    for (let i = 0; i < staffIds.length; i++) {
      const val = staffIds[i];
      const nval = sNames[i];
      const item = {
        isChecked: true,
        staffId: val,
        staffName: nval
      };
      selectStaffs.value.push(item);
    }
  }
};
defineExpose({ show });

function nodeClick(value) {
  const nodeId = value.$treeNodeId;
  highlightMap.value[nodeId] = highlightMap.value[nodeId]?.highlight
    ? Object.assign({ id: nodeId }, highlightMap.value[nodeId], {
        highlight: false
      })
    : Object.assign({ id: nodeId }, highlightMap.value[nodeId], {
        highlight: true
      });
  Object.values(highlightMap.value).forEach((v: Tree) => {
    if (v.id !== nodeId) {
      v.highlight = false;
    }
  });
  console.log("value----->", value);
  units.value = value.parentName != undefined ? value.parentName + ">" : "";
  depts.value = value.shortName;
  queryForm.deptId = value.id;
  onSearch();
}

// 搜索获取表格数据
async function onSearch() {
  const { data = {} } = await getStaffList(queryForm);
  const list = data.data || [];
  list.forEach(item => {
    if (selectStaffs.value.length > 0) {
      const index = selectStaffs.value.findIndex(
        sitem => item.staffId === sitem.staffId
      );
      if (index != -1) {
        item.isChecked = true;
      } else {
        item.isChecked = false;
      }
    } else {
      item.isChecked = false;
    }
  });
  staffData.value = list;
  let isAll = true;
  staffData.value.forEach(item => {
    if (!item.isChecked) {
      isAll = false;
    }
  });
  isIndeterminate.value = isAll;
}
function onBack() {
  staffData.value = [];
  isCheckedAll.value = false;
}
function handleCheckAllChange(val: boolean) {
  staffData.value.forEach(item => {
    item.isChecked = val;
    if (val) {
      let ishas = false;
      selectStaffs.value.forEach(sitem => {
        if (item.staffId == sitem.staffId) {
          ishas = true;
        }
      });
      if (!ishas) {
        selectStaffs.value.push(item);
      }
    } else {
      const index = selectStaffs.value.findIndex(
        sitem => item.staffId === sitem.staffId
      );
      selectStaffs.value.splice(index, 1);
    }
  });
  isIndeterminate.value = false;
}
function handleCheckLChange(idx) {
  const idxitem = staffData.value[idx];
  console.log("idx---->", idx);
  console.log("staffData.value---->", staffData.value);
  if (idxitem.isChecked) {
    let ishas = false;
    selectStaffs.value.forEach(item => {
      if (item.staffId == idxitem.staffId) {
        ishas = true;
      }
    });
    if (!ishas) {
      selectStaffs.value.push(idxitem);
    }
  } else {
    let index = null;
    for (let i = 0; i < selectStaffs.value.length; i++) {
      const element = selectStaffs.value[i];
      if (element.staffId == idxitem.staffId) {
        index = i;
      }
    }
    if (index != null) {
      selectStaffs.value.splice(index, 1);
    }
  }
  isCheckedAll.value = selectStaffs.value.length == staffData.value.length;
  isIndeterminate.value =
    selectStaffs.value.length > 0 &&
    selectStaffs.value.length < staffData.value.length;
}
function handleCheckRChange(idx) {
  const itemidx = selectStaffs.value[idx];
  staffData.value.forEach(item => {
    if (item.staffId == itemidx.staffId) {
      item.isChecked = false;
    }
  });
  selectStaffs.value.splice(idx, 1);
  if (selectStaffs.value.length > 0) {
    selectStaffIds.value = selectStaffs.value.map(item => item.id).join();
  }
  isCheckedAll.value = selectStaffs.value.length == staffData.value.length;
  isIndeterminate.value =
    selectStaffs.value.length > 0 &&
    selectStaffs.value.length < staffData.value.length;
}

// 提交表单
const submitForm = _.debounce(async () => {
  formVisible.value = false;
  emit("staffCallBack", selectStaffs.value);
}, 300);

//关闭对话框
const closeDialog = () => {
  formVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="formVisible"
    :title="dialogTitle"
    :width="800"
    draggable
    @close="closeDialog"
  >
    <div class="mainView">
      <div class="left">
        <div class="title">选择：</div>
        <div class="deptView">
          <!-- <div>
            <el-input
              v-model="queryForm.staffName"
              placeholder="请输入姓名"
              clearable
              @keyup.enter="onSearch"
            />
          </div> -->
          <div v-if="staffData.length > 0" class="staffView">
            <div class="dept">
              <span class="back" @click="onBack">返回</span>
              <span>{{ units }}</span>
              <span>{{ depts }}</span>
            </div>
            <div class="staffs">
              <div>
                <el-checkbox
                  v-model="isCheckedAll"
                  label="全选"
                  size="large"
                  :indeterminate="isIndeterminate"
                  @change="handleCheckAllChange"
                />
              </div>
              <div v-for="(item, index) in staffData" :key="item.staffId">
                <el-checkbox
                  v-model="item.isChecked"
                  :label="item.staffName"
                  size="large"
                  @change="handleCheckLChange(index)"
                />
              </div>
            </div>
          </div>
          <div v-else class="tree">
            <el-scrollbar>
              <el-tree
                ref="treeRef"
                :data="departmentTree"
                node-key="id"
                size="small"
                :props="defaultProps"
                default-expand-all
                :expand-on-click-node="false"
                @node-click="nodeClick"
              >
                <template #default="{ node, data }">
                  <span
                    :class="[
                      'pl-1',
                      'pr-1',
                      'rounded',
                      'flex',
                      'items-center',
                      'select-none',
                      searchValue.trim().length > 0 &&
                        node.label.includes(searchValue) &&
                        'text-red-500'
                    ]"
                    :style="{
                      background: highlightMap[node.id]?.highlight
                        ? 'var(--el-color-primary-light-7)'
                        : 'transparent'
                    }"
                  >
                    <IconifyIconOffline
                      :icon="
                        data.type === 1
                          ? 'office-building'
                          : data.type === 2
                            ? 'location-company'
                            : 'dept'
                      "
                    />
                    {{ node.label }}
                  </span>
                </template>
              </el-tree>
            </el-scrollbar>
          </div>
        </div>
      </div>
      <div class="right">
        <div class="title">已选：</div>
        <div class="selectView">
          <div v-for="(item, index) in selectStaffs" :key="item.staffId">
            <el-checkbox
              v-model="item.isChecked"
              :label="item.staffName"
              size="large"
              @change="handleCheckRChange(index)"
            />
          </div>
        </div>
      </div>
    </div>
    <template #footer>
      <el-button @click="formVisible = false">取消</el-button>
      <el-button :loading="requesting" type="primary" @click="submitForm()"
        >提交
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.mainView {
  display: flex;
  flex-direction: row;
  padding: 0 40px;

  .left {
    width: 320px;
    height: 540px;

    .deptView {
      display: flex;
      flex-direction: column;
      height: 500px;
      padding: 10px;
      margin-top: 10px;
      border: 1px #f1f1f1 solid;

      .dept {
        margin-top: 10px;
      }

      .staffs {
        height: 400px;
        margin-top: 10px;
        margin-left: 20px;
        overflow-y: auto;
      }

      .tree {
        box-sizing: border-box;
        width: 100%;
        height: 100%;
        margin-top: 10px;
        overflow: hidden;
      }
    }
  }

  .right {
    width: 320px;
    height: 540px;
    margin-left: 40px;

    .selectView {
      box-sizing: border-box;
      width: 100%;
      height: 500px;
      padding: 10px 30px;
      margin-top: 10px;
      overflow-y: auto;
      border: 1px #f1f1f1 solid;
    }
  }

  .title {
    font-size: 16px;
  }

  .back {
    margin-right: 20px;
    font-size: 14px;
    color: #3276ff;
    cursor: pointer;
  }
}
</style>
