<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";

import {
  tableButtons,
  operationButtons,
  columns1,
  columns2,
  columns3,
  columns4
} from "./constant";
import {
  getProjectWinBidList,
  deleteProjectWinBid,
  getProjectWinBid,
  GetProgressStatusNV
} from "@/api/projectWinBid";
import { exportExcel } from "@/api/exportAll";
import { TableProBar } from "@/components/ReTable";
import DialogForm from "./components/DialogForm.vue";
import { getBidCompanyNVList } from "@/api/bidCompany";
import { getProjectBidNVList } from "@/api/projectBid";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import DescriptionsDialog from "./components/DescriptionsDialog.vue";
import { TableColumOperation } from "@/components/TableColumOperation";

defineOptions({
  name: "WinBiddingProjectInfo"
});
const title = useRoute().meta.title as string;

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  fullName: "",
  reBidCompanyId: "",
  progressStatus: 2
});
const spanArr = ref([]); // 合并单元格
const position = ref(0);
const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const tableHeight = ref(0); // Table组件高度
const projectList = ref([]); // 投标项目信息列表
const projectStatusNV = ref([]); // 项目状态列表
const queryFold = ref(true); // 查询条件折叠状态
const bidCompanyList = ref([]); // 投标单位列表
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const dialogFormRef = ref(null); // 表单对话框组件实例
const requestLoading = ref(true); // 请求加载状态
const descriptionsDialogRef = ref(null); // 表单对话框组件实例
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例
//序号列
function getIndex(index) {
  const page = queryForm.pageIndex;
  const pagesize = queryForm.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  getProjectList();
  getProjectWinBidList(queryForm)
    .then(({ data }) => {
      const _data = data.data || [];
      tableData.value = _data.map(item => {
        item.disabled = {};
        item.title = {};
        //编辑
        item.disabled["handleEdit"] = !item.canDelete;
        item.title["handleEdit"] = !item.canDelete
          ? "该项目已生成合同，不可编辑"
          : "";
        //删除
        item.disabled["handleDelete"] = !item.canDelete;
        item.title["handleDelete"] = !item.canDelete
          ? "该项目已生成合同，不可删除"
          : "";
        return item;
      });
      console.log("tableData", tableData.value);
      totalPage.value = data.totalCount;
      requestLoading.value = false;
      handleData();
    })
    .catch(() => {
      requestLoading.value = false;
      tableData.value = [];
    });
}

//获取项目进度状态NV
async function getProjectStatus() {
  const { data } = await GetProgressStatusNV();
  projectStatusNV.value = data;
}

// 获取项目列表数据
function getProjectList() {
  getProjectBidNVList({ keyword: "" })
    .then(({ data }) => {
      projectList.value = data || [];
    })
    .catch(() => {
      projectList.value = [];
    });
}

// 获取投标列表数据
function getBidCompanyList() {
  getBidCompanyNVList()
    .then(({ data }) => {
      bidCompanyList.value = data || [];
    })
    .catch(() => {
      bidCompanyList.value = [];
    });
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
        tableData.value[index].fullName === tableData.value[index - 1].fullName
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
const objectSpanMethod = ({ rowIndex, columnIndex }) => {
  //表格合并行
  if (
    columnIndex != 0 &&
    columnIndex != 4 &&
    columnIndex != 5 &&
    columnIndex != 6 &&
    columnIndex != 7 &&
    columnIndex != 8 &&
    columnIndex != 9 &&
    columnIndex != 10 &&
    columnIndex != 22
  ) {
    const _row = spanArr.value[rowIndex];
    const _col = _row > 0 ? 1 : 0;
    return {
      rowspan: _row,
      colspan: _col
    };
  }
};

//切换“折叠”与“展开”
function handleFold() {
  queryFold.value = !queryFold.value;
  setTableHeight();
}

// 重置查询条件表单
const handleReset = () => {
  queryFormRef.value.resetFields();
  onSearch();
};

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;
    case "handleExport":
      handleExport();
      break;
    case "handleRead":
      handleRead(row);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
  }
}

//新增操作
const handleAdd = () => {
  dialogFormRef.value.show(null, "add");
};

// 查看表格行
function handleRead(row) {
  // dialogFormRef.value.show(row, "read");
  getProjectWinBid({
    id: row.id
  }).then(({ data }) => {
    descriptionsDialogRef.value.show(
      data,
      columns1,
      columns2,
      columns3,
      columns4
    );
  });
}

// 修改表格行
function handleEdit(row) {
  dialogFormRef.value.show(row, "edit");
}

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteProjectWinBid({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//导出
function handleExport() {
  const fileName = "中标项目信息表";
  exportExcel("/api/ProjectWinBid/Export?", fileName, queryForm);
}

// 表格行选中回调resetForm
function handleSelectionChange(_val) {}

const projectSearch = (queryString: string, cb: any) => {
  const results = queryString
    ? projectList.value.filter(createFilter(queryString))
    : projectList.value;
  cb(results);
};

const createFilter = (queryString: string) => {
  return (projectList: any) => {
    return (
      projectList.value.toLowerCase().indexOf(queryString.toLowerCase()) === 0
    );
  };
};

const handleProjectSelect = (item: any) => {
  queryForm.fullName = item.name;
};

// 设置表格组件高度
const setTableHeight = () => {
  nextTick(() => {
    queryItemMaxNum.value =
      (queryFormRef.value.$el.clientWidth -
        8 -
        32 -
        queryFormRef.value.$el.children[
          queryFormRef.value.$el.children.length - 1
        ].clientWidth) /
      (queryFormRef.value.$el.children[0].clientWidth + 32);
    queryItemMaxNum.value = Math.floor(queryItemMaxNum.value);
    tableHeight.value =
      window.innerHeight - queryFormRef.value.$el.clientHeight - 230;
  });
};

// mounted周期函数
onMounted(async () => {
  onSearch();
  getProjectStatus();
  getBidCompanyList();
  setTableHeight();
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
      ref="queryFormRef"
      :inline="true"
      :model="queryForm"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
      label-width="68px"
    >
      <el-form-item
        v-show="queryItemMaxNum >= 1 || !queryFold"
        label="项目名称"
        prop="fullName"
      >
        <el-autocomplete
          v-model.trim="queryForm.fullName"
          style="width: 100%"
          :fetch-suggestions="projectSearch"
          clearable
          value-key="name"
          placeholder="请输入"
          @select="handleProjectSelect"
        >
          <template #suffix>
            <el-icon class="el-input__icon">
              <IconifyIconOffline icon="arrow-down" />
            </el-icon>
          </template>
        </el-autocomplete>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 2 || !queryFold"
        label="投标单位"
        prop="reBidCompanyId"
      >
        <el-select
          v-model="queryForm.reBidCompanyId"
          placeholder="请选择"
          filterable
          clearable
          style="width: 100%"
        >
          <el-option label="全部" value="" />
          <el-option
            v-for="item in bidCompanyList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 3 || !queryFold"
        label="项目进度"
        prop="progressStatus"
      >
        <el-select
          v-model="queryForm.progressStatus"
          placeholder="请选择"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in projectStatusNV"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('search')"
          :loading="requestLoading"
          @click="onSearch"
        >
          查询
        </el-button>
        <el-button :icon="useRenderIcon('refresh')" @click="handleReset">
          重置
        </el-button>
        <el-button type="text" @click="handleFold">
          <span v-show="queryFold">展开</span>
          <span v-show="!queryFold">折叠</span>
          <IconifyIconOffline :icon="!queryFold ? 'arrow-up' : 'arrow-down'" />
        </el-button>
      </el-form-item>
    </el-form>
    <TableProBar
      :title="title"
      :loading="requestLoading"
      :dataList="tableData"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-for="(item, index) in tableButtons"
          :key="index"
          :type="item.buttonType"
          :icon="useRenderIcon(item.buttonIcon)"
          @click="handleOperation(item.buttonClick)"
        >
          {{ item.buttonName }}
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
          @selection-change="handleSelectionChange"
        >
          <el-table-column
            v-if="checkList.includes('勾选列')"
            type="selection"
            align="center"
            width="60"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            fixed="left"
            type="index"
            :index="getIndex"
            label="序号"
            align="center"
            width="60"
          />
          <template v-for="column in columns1" :key="column.prop">
            <el-table-column
              v-if="column.read"
              :label="column.label"
              :prop="column.prop"
              :align="column.align"
              :min-width="column.width"
              :fixed="column.fixed"
              :show-overflow-tooltip="column.showOverflowTooltip"
            >
              <template #default="{ row }">
                <el-text
                  type="primary"
                  class="cursor-pointer"
                  @click="handleOperation('handleRead', row)"
                >
                  {{ row[column.prop] }}
                </el-text>
              </template>
            </el-table-column>
            <el-table-column
              v-else-if="column.prop != 'projectItemList'"
              :align="column.align"
              :fixed="column.fixed"
              :label="column.label"
              :prop="column.prop"
              :show-overflow-tooltip="column.showOverflowTooltip"
              :min-width="column.width"
              :formatter="column.formatter"
            >
              <template #default="{ row }">
                <template v-if="column.tableColumnSlot">
                  <component :is="column.tableColumnSlot(row)" />
                </template>
                <template v-else-if="column.formatter">
                  {{ column.formatter(row) }}
                </template>
                <template v-else>
                  {{ row[column.prop] }}
                </template>
              </template>
            </el-table-column>
          </template>
          <el-table-column
            label="标书制作人员"
            align="center"
            prop="columnCenter"
            width="100"
          >
            <template v-for="column in columns2" :key="column.prop">
              <el-table-column
                v-if="column.read"
                :label="column.label"
                :prop="column.prop"
                :align="column.align"
                :min-width="column.width"
                :fixed="column.fixed"
                :show-overflow-tooltip="column.showOverflowTooltip"
              >
                <template #default="{ row }">
                  <el-text
                    type="primary"
                    class="cursor-pointer"
                    @click="handleOperation('handleRead', row)"
                  >
                    {{ row[column.prop] }}
                  </el-text>
                </template>
              </el-table-column>
              <el-table-column
                v-else
                :align="column.align"
                :fixed="column.fixed"
                :label="column.label"
                :prop="column.prop"
                :show-overflow-tooltip="column.showOverflowTooltip"
                :min-width="column.width"
                :formatter="column.formatter"
              >
                <template #default="{ row }">
                  <template v-if="column.tableColumnSlot">
                    <component :is="column.tableColumnSlot(row)" />
                  </template>
                  <template v-else-if="column.formatter">
                    {{ column.formatter(row) }}
                  </template>
                  <template v-else>
                    {{ row[column.prop] }}
                  </template>
                </template>
              </el-table-column>
            </template>
          </el-table-column>
          <el-table-column
            label="中标单位信息"
            align="center"
            prop="columnCenter"
            width="150"
          >
            <template v-for="column in columns3" :key="column.prop">
              <el-table-column
                v-if="column.read"
                :label="column.label"
                :prop="column.prop"
                :align="column.align"
                :min-width="column.width"
                :fixed="column.fixed"
                :show-overflow-tooltip="column.showOverflowTooltip"
              >
                <template #default="{ row }">
                  <el-text
                    type="primary"
                    class="cursor-pointer"
                    @click="handleOperation('handleRead', row)"
                  >
                    {{ row[column.prop] }}
                  </el-text>
                </template>
              </el-table-column>
              <el-table-column
                v-else
                :align="column.align"
                :label="column.label"
                :prop="column.prop"
                :show-overflow-tooltip="column.showOverflowTooltip"
                :min-width="column.width"
                :fixed="column.fixed"
                :formatter="column.formatter"
              >
                <template #default="{ row }">
                  <template v-if="column.tableColumnSlot">
                    <component :is="column.tableColumnSlot(row)" />
                  </template>
                  <template v-else-if="column.formatter">
                    {{ column.formatter(row) }}
                  </template>
                  <template v-else>
                    {{ row[column.prop] }}
                  </template>
                </template>
              </el-table-column>
            </template>
          </el-table-column>
          <el-table-column
            label="项目立项信息"
            align="center"
            prop="columnCenter"
            width="200"
          >
            <template v-for="column in columns4" :key="column.prop">
              <el-table-column
                v-if="column.read"
                :label="column.label"
                :prop="column.prop"
                :align="column.align"
                :min-width="column.width"
                :fixed="column.fixed"
                :show-overflow-tooltip="column.showOverflowTooltip"
              >
                <template #default="{ row }">
                  <el-text
                    type="primary"
                    class="cursor-pointer"
                    @click="handleOperation('handleRead', row)"
                  >
                    {{ row[column.prop] }}
                  </el-text>
                </template>
              </el-table-column>
              <el-table-column
                v-else
                :align="column.align"
                :label="column.label"
                :prop="column.prop"
                :show-overflow-tooltip="column.showOverflowTooltip"
                :min-width="column.width"
                :fixed="column.fixed"
                :formatter="column.formatter"
              >
                <template #default="{ row }">
                  <template v-if="column.tableColumnSlot">
                    <component :is="column.tableColumnSlot(row)" />
                  </template>
                  <template v-else-if="column.formatter">
                    {{ column.formatter(row) }}
                  </template>
                  <template v-else>
                    {{ row[column.prop] }}
                  </template>
                </template>
              </el-table-column>
            </template>
          </el-table-column>
          <!-- <el-table-column
            label="项目进度"
            align="center"
            prop="progressStatus"
            width="110"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              <span v-if="row.progressStatus == 1">未开始</span>
              <span v-else-if="row.progressStatus == 2">进行中</span>
              <span v-else-if="row.progressStatus == 3">已结束</span>
              <span v-else />
            </template>
          </el-table-column>
          <el-table-column
            label="备注"
            align="left"
            prop="winBidComment"
            min-width="200"
            show-overflow-tooltip
          /> -->
          <TableColumOperation
            v-if="operationButtons().length > 0"
            :size="size"
            :operationButtons="operationButtons()"
            @operation="handleOperation"
          />
          <template #empty>
            <el-empty description="暂无数据" />
          </template>
        </el-table>
        <el-pagination
          v-model:page-size="queryForm.pageSize"
          v-model:current-page="queryForm.pageIndex"
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
    <DialogForm
      ref="dialogFormRef"
      :projectList="projectList"
      :bidCompanyList="bidCompanyList"
      @search="onSearch"
    />
    <DescriptionsDialog
      ref="descriptionsDialogRef"
      :title="title"
      :width="1180"
      :column="3"
    />
  </div>
</template>
