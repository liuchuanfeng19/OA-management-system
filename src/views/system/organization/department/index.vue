<script setup lang="ts">
import { ref, onMounted, reactive, nextTick } from "vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { deleteDepartment, getDeptMarks, getTree } from "@/api/department";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "DepartmentManage"
});
// vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  keyword: ""
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableRef = ref();
const maps = ref(new Map());
const expands = ref([]);
const unitNatures = ref([]);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const tableHeight = ref(0);
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const multipleSelection = ref([]);

//新增操作
const handleAdd = () => {
  dialogFormRef.value.show();
};

// 修改表格行
function handleEdit(row) {
  dialogFormRef.value.show(row);
}

// 删除表格行
async function handleDelete(row?) {
  let ids = "";
  if (row) {
    ids = row.id;
  } else {
    ids = multipleSelection.value.map(item => item.id).join();
  }
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteDepartment({ ids });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

// 表格树加载孩子数据
const load = async (tree, treeNode, resolve) => {
  // console.log('tree', tree)
  const parentId = tree.id;
  maps.value.set(parentId, { tree, treeNode, resolve }); //将当前选中节点数据存储到maps中
  const { data } = await getTree();
  if (data && data.length > 0) {
    tree.children = data;
    tree.hasChildren = true;
  } else {
    delete tree.children;
    tree.hasChildren = false;
  }
  if (resolve) {
    resolve(data || []);
  }
};

// 获取企业性质列表
const getUnitNatures = async () => {
  const { data } = await getDeptMarks();
  unitNatures.value = data || [];
};

const formatDeptMark = (row, column, cellValue) => {
  let config = unitNatures.value.find(item => item.value == cellValue);
  config = config || {};
  return config.name;
};

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data, total } = await getTree(queryForm);
  const _data = data || [];
  deleteHasChildren(_data);
  dataList.value = _data || [];
  totalPage.value = total;
  loading.value = false;
}

function deleteHasChildren(_dataList) {
  _dataList.forEach(element => {
    delete element.hasChildren;
    if (element.children.length > 0) {
      deleteHasChildren(element.children);
    }
  });
}

/**
 * 表格行选中回调resetForm
 */
function handleSelectionChange(val) {
  multipleSelection.value = val;
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

// 设置表格组件高度
const setTableHeight = () => {
  tableHeight.value = window.innerHeight - formRef.value.$el.clientHeight - 178;
};

// mounted周期函数
onMounted(async () => {
  onSearch();
  nextTick(() => {
    setTableHeight();
  });
});

getUnitNatures();

// 窗口尺寸改变事件回调
window.onresize = function () {
  nextTick(() => {
    setTableHeight();
  });
};
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="queryForm"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      @keyup.enter="onSearch"
    >
      <el-form-item label="关键词" prop="keyword">
        <el-input
          v-model.trim="queryForm.keyword"
          placeholder="部门名称、编号"
          clearable
        />
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('search')"
          :loading="loading"
          @click="onSearch"
        >
          查询
        </el-button>
        <el-button :icon="useRenderIcon('refresh')" @click="resetForm(formRef)">
          重置
        </el-button>
      </el-form-item>
    </el-form>

    <TableProBar
      title="部门列表"
      :loading="loading"
      :dataList="dataList"
      :tableRef="tableRef"
      :checkList="['勾选列']"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'DepartmentManage.add'"
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd"
        >
          添加
        </el-button>
        <el-button
          v-auth="'DepartmentManage.delete'"
          type="danger"
          :icon="useRenderIcon('delete')"
          @click="handleDelete()"
        >
          批量删除
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          ref="tableRef"
          border
          :size="size"
          :expand-row-keys="expands"
          :lazy="false"
          :load="load"
          :height="tableHeight"
          :data="dataList"
          highlight-current-row
          :default-expand-all="false"
          row-key="id"
          :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            fixed="left"
            align="center"
            width="60"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            prop="sequence"
            label="序号"
            fixed="left"
            align="center"
            width="90"
          />
          <el-table-column
            label="部门名称"
            prop="fullName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="部门简称"
            prop="shortName"
            min-width="200"
            show-overflow-tooltip
          />
          <el-table-column
            label="部门编号"
            min-width="200"
            prop="deptCode"
            show-overflow-tooltip
          />
          <el-table-column label="负责人" width="100" prop="manager" />
          <el-table-column
            label="副负责人1"
            width="120"
            prop="assistantManager"
          />
          <el-table-column
            label="副负责人2"
            width="120"
            prop="assistantManager2"
          />
          <el-table-column
            min-width="200"
            label="企业性质"
            prop="deptMark"
            :formatter="formatDeptMark"
            show-overflow-tooltip
          />
          <el-table-column
            v-auth="'DepartmentManage.edit|DepartmentManage.edit'"
            fixed="right"
            label="操作"
            width="150"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'DepartmentManage.edit'"
                class="reset-margin"
                link
                type="primary"
                :size="size"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-auth="'DepartmentManage.delete'"
                link
                type="primary"
                :size="size"
                @click="handleDelete(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
      </template>
    </TableProBar>
    <DialogForm
      ref="dialogFormRef"
      :unitNatures="unitNatures"
      @search="onSearch"
    />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
