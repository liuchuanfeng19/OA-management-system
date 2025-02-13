<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { ElMessage, FormInstance, ElMessageBox } from "element-plus";

import {
  getLeaveTypeNV,
  getLeaveTypeList,
  deleteLeaveType
} from "@/api/attendance";
import { TableProBar } from "@/components/ReTable";
import DialogRuleForm from "./components/DialogRuleForm.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "VacationRules"
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const queryForm = ref({
  name: "",
  pageIndex: 1,
  pageSize: 20
});
const nvData = ref([]);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const maxItemNum = ref(1);
const tableHeight = ref(0);
const formRef = ref<FormInstance>();
const dialogRuleFormRef = ref(null);

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data } = await getLeaveTypeList(queryForm.value);
  dataList.value = data.data || [];
  totalPage.value = data.totalCount;
  loading.value = false;
}
// 获取假期类型
async function getNV() {
  const { data } = await getLeaveTypeNV();
  nvData.value = data || [];
}

//序号列
// function getIndex(index) {
//   const page = queryForm.value.pageIndex;
//   const pagesize = queryForm.value.pageSize;
//   return (page - 1) * pagesize + index + 1;
// }
// current-change 改变时触发
function handleCurrentChange() {
  onSearch();
}

// pageSize 改变时触发
function handleSizeChange() {
  onSearch();
}

//添加
function handleAdd() {
  dialogRuleFormRef.value.show("add", null);
}
//编辑
function handleRead(row) {
  dialogRuleFormRef.value.show("read", row);
}
//编辑
function handleEdit(row) {
  dialogRuleFormRef.value.show("edit", row);
}
//删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteLeaveType({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

// 设置表格组件高度
const setTableHeight = () => {
  nextTick(() => {
    maxItemNum.value =
      (formRef.value.$el.clientWidth -
        8 -
        32 -
        formRef.value.$el.children[formRef.value.$el.children.length - 1]
          .clientWidth) /
      (formRef.value.$el.children[0].clientWidth + 32);
    maxItemNum.value = Math.floor(maxItemNum.value);
    tableHeight.value =
      window.innerHeight - formRef.value.$el.clientHeight - 230;
  });
};

//mounted周期函数
onMounted(async () => {
  getNV();
  onSearch();
  nextTick(() => {
    setTableHeight();
  });
});

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
      label-width="80px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item v-show="maxItemNum >= 1" label="假期名称" prop="name">
        <el-input
          v-model="queryForm.name"
          placeholder="请输入"
          clearable
          @keyup.enter="onSearch"
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
      title="假期规则"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'VacationRules.add'"
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd()"
        >
          添加假期
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          border
          :size="size"
          :height="tableHeight"
          :data="dataList"
          highlight-current-row
          :default-expand-all="false"
          row-key="path"
        >
          <!-- <el-table-column
            v-if="checkList.includes('序号列')"
            fixed="left"
            type="index"
            :index="getIndex"
            label="序号"
            width="60"
            align="center"
          /> -->
          <el-table-column
            v-if="checkList.includes('序号列')"
            label="序号"
            fixed="left"
            align="center"
            prop="sortOrder"
            width="60"
          />
          <el-table-column
            label="假期名称"
            align="center"
            prop="name"
            show-overflow-tooltip
          />
          <el-table-column
            label="请假单位"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span v-show="row.unit == 1">按天请假</span>
              <span v-show="row.unit == 2">按半天请假</span>
              <span v-show="row.unit == 3">按小时请假</span>
            </template>
          </el-table-column>
          <el-table-column
            label="计算方式"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span v-show="row.calculate == 1">按自然日</span>
              <span v-show="row.calculate == 2">按工作日</span>
            </template>
          </el-table-column>
          <el-table-column
            label="余额规则"
            align="center"
            prop=""
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <div v-show="row.ruleFlag">
                <div v-if="row.balWay == 3">
                  <span>手动发放</span>
                </div>
                <div v-else>
                  <span v-show="row.balRule == 1"
                    >固定额度：{{ row.balDayQty }}天</span
                  >
                  <span v-show="row.balRule == 2"
                    >按社会工龄：{{ row.balDayQty }}天</span
                  >
                  <span v-show="row.balRule == 3"
                    >按司龄：{{ row.balDayQty }}天</span
                  >
                </div>
              </div>
              <div v-show="!row.ruleFlag">未设置</div>
            </template>
          </el-table-column>
          <el-table-column label="适用范围" align="center" prop="fitComment" />
          <el-table-column
            fixed="right"
            label="操作"
            width="160"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'VacationRules.query'"
                :size="size"
                link
                type="primary"
                @click="handleRead(scope.row)"
              >
                查看
              </el-button>
              <el-button
                v-auth="'VacationRules.edit'"
                :size="size"
                link
                type="primary"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-auth="'VacationRules.delete'"
                :size="size"
                link
                type="primary"
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
        <el-pagination
          v-model:current-page="queryForm.pageIndex"
          v-model:page-size="queryForm.pageSize"
          class="flex justify-end mt-4"
          :small="size === 'small' ? true : false"
          :page-sizes="[10, 20, 30, 50, 100, 200]"
          :background="true"
          layout="total, sizes, prev, pager, next, jumper"
          :total="totalPage"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </template>
    </TableProBar>
    <DialogRuleForm ref="dialogRuleFormRef" @search="onSearch" />
  </div>
</template>
