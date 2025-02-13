<script setup lang="ts">
import { storeToRefs } from "pinia";
import { FormInstance } from "element-plus";
import { ref, onMounted, nextTick } from "vue";
import type { TableColumnCtx } from "element-plus";

import { exportExcel } from "@/api/exportAll";
import { GetStaffMailList } from "@/api/personnel";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { userDepartmentStoreHook } from "@/store/modules/department";

defineOptions({
  name: "AddressBook"
});
const { getDepartmentTree } = userDepartmentStoreHook();

interface AddressBook {
  deptName: string;
  staffName: string;
  jobTitle: string;
  shortNumber: string;
  mobile: string;
  qq: string;
  email: string;
  jobStatusExpr: string;
}

interface SpanMethodProps {
  row: AddressBook;
  column: TableColumnCtx<AddressBook>;
  rowIndex: number;
  columnIndex: number;
}

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const queryForm = ref({
  keyword: "",
  deptId: "",
  pageIndex: 1,
  pageSize: 20
});
const fold = ref(true);
const tableData = ref([]);
const totalPage = ref(0);
const spanArr = ref([]); // 合并单元格
const position = ref(0);
const maxItemNum = ref(1);
const loading = ref(true);
const tableHeight = ref(0);
const dialogFormRef = ref(null);
const formRef = ref<FormInstance>();
const { departmentTree } = storeToRefs(userDepartmentStoreHook());

//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
//导出
function handleExport() {
  const fileName = "通讯录导出";
  exportExcel("/api/Staff/ExportStaffMailList?", fileName, queryForm.value);
}

// 表格行选中回调
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

//切换“折叠”与“展开”
// function handleFold() {
//   fold.value = !fold.value;
//   setTableHeight();
// }

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  queryForm.value.deptId =
    queryForm.value.deptId == null ? "" : queryForm.value.deptId;
  const { data } = await GetStaffMailList(queryForm.value);
  tableData.value = data.data || [];
  totalPage.value = data.totalCount;
  loading.value = false;
  handleData();
}

/*
  rowspan（）这个函数就是用来返回 spanArr 数组的，定义每一行的 rowspan
  if( index === 0)，第一行，直接先给数组 push 进一个1，表示自己先占一行，position 是数组元素的位置
  （此时是从数组元素的第一个开始，所以position 为 0）， position为 0 意思表示的就是数组的第一个元素。

  当到了 index 为 2 的时候，if(listData.value[index][spanName] === listData.value[index-1][spanName])，
  让第二行与第一行作比较：
  （1）如果第二行与第一行相等的话，position 就 +1，当有 n 行第一行相同，position 就为 n，表示向下合并 n 行；
  第二行自己就 spanArr.push(0)，表示第二行“消失”，因为第一行和第二行合并了；
  （2）如果第二行与第一行不相等的话，那么 spanArr.push(1);就让第二行自己独占一行；

  position = index ：把指针拿到 index 这行来，表示设置数组 spanArr[position] 的元素值，然后定义从此行开始向下合并几行
  （可以根据示例研究下，当 index 为 2 时，position 为 2，当 index 为 3 时，第四行与第三行需要合并，
  那么在数组的 position 元素就要 +1 了，也就是 spanArr[position] += 1）
*/
function handleData() {
  spanArr.value = [];
  tableData.value.forEach((item, index) => {
    if (index == 0) {
      spanArr.value.push(1);
      position.value = 0;
    } else {
      if (
        tableData.value[index].deptName === tableData.value[index - 1].deptName
      ) {
        spanArr.value[position.value] += 1;
        spanArr.value.push(0);
      } else {
        spanArr.value.push(1);
        position.value = index;
      }
    }
  });
}

/*
  :span-method="objectSpanMethod"
  这个是官方给定的绑定属性和对应的方法，objectSpanMethod 传入了 { row, column, rowIndex, columnIndex }
  row: 当前行
  column: 当前列
  rowIndex：当前行号
  columnIndex ：当前列号

  该函数可以返回一个包含两个元素的数组，第一个元素代表rowspan，第二个元素代表 colspan。
  也可以返回一个键名为 rowspan 和 colspan 的对象。

  const _col = _row > 0 ? 1 : 0;  定义的这个单元格列的合并，我们项目只合并行，不合并列；

  _row：代表合并行的行数，_row 的值要么是 1，或者更大的自然正整数，要么是 0。
  1代表：独占一行
  更大的自然数：代表合并了若干行
  0：代表“消失”的哪那一个单元格，后面的单元格向前推一格
*/
const objectSpanMethod = ({ rowIndex, columnIndex }: SpanMethodProps) => {
  //表格合并行
  if (columnIndex == 1) {
    const _row = spanArr.value[rowIndex];
    const _col = _row > 0 ? 1 : 0;
    return {
      rowspan: _row,
      colspan: _col
    };
  }
};

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
onMounted(() => {
  if (departmentTree.value.length < 1) {
    getDepartmentTree();
  }
  onSearch();
  nextTick(() => {
    setTableHeight();
  });
});
function getDeptIdRecursive(treeData1) {
  if (!treeData1 || !treeData1.length) {
    return "00000000-0000-0000-0000-000000000000";
  }
  const item = treeData1[0];
  if (item.children && item.children.length > 0) {
    return getDeptIdRecursive(item.children);
  } else {
    return item.id;
  }
}

function deptVisibleChange(val) {
  //console.log(val, "asdasd");
  if (val) {
    if (
      queryForm.value.deptId == "" ||
      queryForm.value.deptId == "00000000-0000-0000-0000-000000000000"
    ) {
      queryForm.value.deptId = getDeptIdRecursive(departmentTree.value);
      setTimeout(() => {
        queryForm.value.deptId = "00000000-0000-0000-0000-000000000000";
      }, 1);
    }
  }
}

//el-cascader props属性值
const selProps = {
  children: "children",
  label: "fullName",
  multiple: false,
  emitPath: false,
  value: "id",
  checkStrictly: true
};

// 窗口尺寸改变事件回调
window.onresize = function () {
  console.log("onresize");
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
      label-width="70px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="任职部门"
        prop="deptId"
      >
        <el-cascader
          v-model="queryForm.deptId"
          clearable
          :options="departmentTree"
          placeholder="请选择"
          class="w-100/100"
          :props="selProps"
          :show-all-levels="false"
          @visible-change="deptVisibleChange"
        >
          <template #default="{ data }">
            <span>{{ data.fullName }}</span>
          </template>
        </el-cascader>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model="queryForm.keyword"
          placeholder="姓名,电话"
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
        <!-- <el-button type="text" @click="handleFold">
          <span v-show="fold">展开</span>
          <span v-show="!fold">折叠</span>
          <IconifyIconOffline :icon="!fold ? 'arrow-up' : 'arrow-down'" />
        </el-button> -->
      </el-form-item>
    </el-form>

    <TableProBar
      title="通讯录列表"
      :loading="loading"
      :tableData="tableData"
      @refresh="onSearch"
    >
      <template #buttons>
        <!-- <el-button
          v-auth="'BusinessTravel.apply'"
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd"
        >
          申请
        </el-button> -->
        <el-button
          v-auth="'AddressBook.export'"
          type="primary"
          :icon="useRenderIcon('export')"
          @click="handleExport()"
        >
          导出
        </el-button>
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          border
          :size="size"
          :height="tableHeight"
          :data="tableData"
          :span-method="objectSpanMethod"
          highlight-current-row
          :default-expand-all="false"
          row-key="path"
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            width="60"
            align="center"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            fixed="left"
            type="index"
            :index="getIndex"
            label="序号"
            width="60"
            align="center"
          />
          <el-table-column
            label="部门"
            prop="deptName"
            mim-width="150"
            show-overflow-tooltip
            align="center"
          />

          <el-table-column
            label="姓名"
            prop="staffName"
            min-width="120"
            show-overflow-tooltip
            align="center"
          />
          <el-table-column
            min-width="120"
            label="岗位"
            prop="jobTitle"
            show-overflow-tooltip
            align="letf"
          />
          <el-table-column
            label="分机"
            width="120"
            prop="shortNumber"
            show-overflow-tooltip
            align="center"
          >
            <template #default="{ row }">
              {{ row.shortNumber ? row.shortNumber : "-" }}
            </template>
          </el-table-column>

          <el-table-column
            label="手机"
            min-width="120"
            prop="mobile"
            show-overflow-tooltip
            align="center"
          />
          <el-table-column
            label="QQ号"
            width="120"
            prop="qq"
            show-overflow-tooltip
            align="center"
          >
            <template #default="{ row }">
              {{ row.qq ? row.qq : "-" }}
            </template>
          </el-table-column>

          <el-table-column
            label="邮箱"
            min-width="120"
            prop="email"
            show-overflow-tooltip
            align="center"
          >
            <template #default="{ row }">
              {{ row.email ? row.email : "-" }}
            </template>
          </el-table-column>

          <!-- <el-table-column
            label="状态"
            prop="workStatusDesc"
            width="120"
            align="center"
          /> -->

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
          @size-change="onSearch"
          @current-change="onSearch"
        />
      </template>
    </TableProBar>

    <DialogForm ref="dialogFormRef" @search="onSearch" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}

:deep() {
  .el-input__wrapper {
    width: 220px;
  }
}
</style>
