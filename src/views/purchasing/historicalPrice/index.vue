<script setup lang="ts">
import { ref, reactive, onMounted, nextTick } from "vue";
import { type FormInstance, ElMessage, ElMessageBox } from "element-plus";

import { exportExcel } from "@/api/exportAll";
import { deleteExample } from "@/api/example";
import { operationButtons } from "./constant";
import { TableProBar } from "@/components/ReTable";
import { batchExportExcel } from "@/api/exportAll";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { GetList, ImportHistoryItem } from "@/api/joinSignHistoryItem";
import { TableColumOperation } from "@/components/TableColumOperation";

defineOptions({
  name: "HistoricalPrice"
});

// 查询条件模型 vue3 声明对象类型的响应式变量，另外如果是原始数据类型，则使用ref方法
const queryForm = reactive({
  pageIndex: 1,
  pageSize: 20,
  projectName: "",
  materialName: "",
  materialSpec: "",
  supplyName: "",
  handStaffName: "",
  ids: []
});
const totalPage = ref(0); // 数据总页数
const tableData = ref([]); // Table组件显示数据
const tableHeight = ref(0); // Table组件高度
const queryFold = ref(true); // 查询条件折叠状态
const queryItemMaxNum = ref(1); // 查询项默认显示最大数量
const requestLoading = ref(true); // 请求加载状态
const queryFormRef = ref<FormInstance>(); // 查询条件表单组件实例
const multipleSelection = ref([]);
const allData = ref([]);
const allClick = ref(false);
const multipleTableRef = ref(null);
const importLoading = ref(false);
const exportLoading = ref(false);
// 获取表格数据
function onSearch() {
  requestLoading.value = true;
  GetList(queryForm)
    .then(({ data }) => {
      const list = data.data || [];
      tableData.value = list.map(item => {
        item.disabled = {};
        item.title = {};

        return item;
      });
      totalPage.value = data.totalCount;
      //不是全选状态 判断allData里面是否否已经有tableData的数据，没有则加上
      const nids = allData.value.map(item => item.id).join();
      tableData.value.forEach(item => {
        if (nids.indexOf(item.id) == -1) {
          allData.value.push(item);
        }
      });
      //然后再判断
      tableData.value.forEach(item => {
        allData.value.forEach(sitem => {
          if (item.id == sitem.id) {
            if (sitem.isSelected) {
              nextTick(() => {
                multipleTableRef.value.toggleRowSelection(item, true);
              });
            } else {
              nextTick(() => {
                multipleTableRef.value.toggleRowSelection(item, false);
              });
            }
          }
        });
      });

      multipleSelection.value = [];

      allData.value.forEach(item => {
        if (item.isSelected) {
          multipleSelection.value.push(item);
        }
      });
    })
    .catch(() => {
      tableData.value = [];
    })
    .finally(() => {
      requestLoading.value = false;
    });
}
//序号列
function getIndex(index) {
  const page = queryForm.pageIndex;
  const pagesize = queryForm.pageSize;
  return (page - 1) * pagesize + index + 1;
}
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

//操作按钮
function handleOperation(functionName, row?) {
  switch (functionName) {
    // case "handleExportTemplate":
    //   handleExportTemplate();
    //   break;
    case "handleExport":
      handleExport();
      break;
    case "handleDelete":
      handleDelete(row);
      break;
  }
}

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteExample({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

//导出模板
async function handleExportTemplate() {
  const fileName = "历史价格模板";
  exportExcel("/api/JoinSignHistoryItem/ExportTemplate?", fileName, queryForm);
}

//导入
// const handleImport = async options => {
//   const { code, message } = await ImportHistoryItem(options.file);
//   if (code==0) {
//     ElMessage.success(message);
//     onSearch();
//   }
// };
async function handleImport(options) {
  const data = new FormData();
  data.append("file", options.file);
  importLoading.value = true;
  await ImportHistoryItem(data)
    .then(({ code, message }) => {
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(_err => {
      ElMessage.error("导入失败");
    });
  importLoading.value = false;
}

//导出
async function handleExport() {
  const fileName = "历史价格";
  const parma = Object.assign({}, queryForm);
  parma.ids = multipleSelection.value.map(item => item.id);
  exportLoading.value = true;
  await batchExportExcel("/api/JoinSignHistoryItem/Export?", fileName, parma);
  exportLoading.value = false;
  resetForm();
}

//导出单选
function handleSingleRow(selection, row) {
  multipleSelection.value = [];
  allData.value.forEach(item => {
    if (item.id == row.id) {
      item.isSelected = !item.isSelected;
    }
    if (item.isSelected) {
      multipleSelection.value.push(item);
    }
  });
}
//导出多选
function handleAllSelection(selection) {
  if (selection == 0) {
    allClick.value = false;
    tableData.value.forEach(item => {
      allData.value.forEach(sitem => {
        if (item.staffId == sitem.staffId) {
          sitem.isSelected = false;
        }
      });
    });
  } else {
    allClick.value = true;
    tableData.value.forEach(item => {
      allData.value.forEach(sitem => {
        if (item.staffId == sitem.staffId) {
          sitem.isSelected = true;
        }
      });
    });
  }
  multipleSelection.value = [];
  allData.value.forEach(item => {
    if (item.isSelected) {
      multipleSelection.value.push(item);
    }
  });
}

// 重置查询条件表单
const resetForm = () => {
  onSearch();
  allClick.value = false;
  multipleTableRef.value.clearSelection();
  multipleSelection.value = [];
  allData.value.forEach(item => {
    item.isSelected = false;
  });
};

// 表格行选中回调resetForm
// function handleSelectionChange(val) {
//   console.log("handleSelectionChange", val);
// }

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
      label-width="90px"
    >
      <el-form-item
        v-show="queryItemMaxNum >= 1 || !queryFold"
        label="项目名称"
        prop="projectName"
      >
        <el-input
          v-model.trim="queryForm.projectName"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 2 || !queryFold"
        label="物资名称"
        prop="materialName"
      >
        <el-input
          v-model.trim="queryForm.materialName"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 3 || !queryFold"
        label="规格型号"
        prop="materialSpec"
      >
        <el-input
          v-model.trim="queryForm.materialSpec"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 4 || !queryFold"
        label="供应商名称"
        prop="supplyName"
      >
        <el-input
          v-model.trim="queryForm.supplyName"
          placeholder="请输入"
          clearable
        />
      </el-form-item>
      <el-form-item
        v-show="queryItemMaxNum >= 5 || !queryFold"
        label="采购负责人"
        prop="handStaffName"
      >
        <el-input
          v-model.trim="queryForm.handStaffName"
          placeholder="请输入"
          clearable
        />
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
      title="采购历史价格"
      :loading="requestLoading"
      :dataList="tableData"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-upload
          v-auth="'HistoricalPrice.import'"
          action="#"
          :http-request="handleImport"
          :multiple="false"
          name="file"
          :show-file-list="false"
          :loading="importLoading"
        >
          <el-button :icon="useRenderIcon('import')" type="primary"
            >导入</el-button
          >
        </el-upload>
        <el-button
          v-auth="'HistoricalPrice.export'"
          style="margin-left: 20px"
          type="primary"
          :icon="useRenderIcon('export')"
          @click="handleExport()"
        >
          导出
        </el-button>
        <el-button
          v-auth="'HistoricalPrice.exportTemplate'"
          style="margin-left: 20px"
          type="primary"
          :icon="useRenderIcon('export')"
          @click="handleExportTemplate()"
        >
          下载模板
        </el-button>
        <!-- <el-button
          v-for="(item, index) in tableButtons"
          :key="index"
          :type="item.buttonType"
          :icon="useRenderIcon(item.buttonIcon)"
          @click="handleOperation(item.buttonClick)"
        >
          {{ item.buttonName }}
        </el-button> -->
      </template>
      <template v-slot="{ size, checkList }">
        <el-table
          ref="multipleTableRef"
          border
          :size="size"
          :height="tableHeight"
          highlight-current-row
          :data="tableData"
          row-key="id"
          @select="handleSingleRow"
          @select-all="handleAllSelection"
        >
          <el-table-column type="selection" align="center" width="60" />
          <el-table-column
            v-if="checkList.includes('序号列')"
            fixed="left"
            type="index"
            :index="getIndex"
            label="序号"
            align="center"
            width="60"
          />
          <el-table-column
            label="项目名称"
            align="left"
            prop="projectName"
            min-width="150"
            show-overflow-tooltip
          />
          <el-table-column
            label="物资名称"
            min-width="150"
            show-overflow-tooltip
            align="letf"
            prop="materialName"
          />
          <el-table-column
            label="规格型号"
            min-width="150"
            show-overflow-tooltip
            align="letf"
            prop="materialSpec"
          />
          <el-table-column
            label="单位"
            align="letf"
            prop="materialUnit"
            width="80"
            show-overflow-tooltip
          />
          <el-table-column
            label="数量"
            width="80"
            show-overflow-tooltip
            align="right"
            prop="materialQty"
          />
          <el-table-column
            label="采购单价"
            width="100"
            show-overflow-tooltip
            align="right"
            prop="materialPrice"
          />
          <el-table-column
            label="小计"
            width="80"
            show-overflow-tooltip
            align="right"
            prop="subTotal"
          />
          <el-table-column
            label="供应商名称"
            min-width="150"
            show-overflow-tooltip
            align="letf"
            prop="supplyName"
          />
          <el-table-column
            label="采购负责人"
            align="left"
            prop="handStaffName"
            min-width="100"
            show-overflow-tooltip
          />
          <el-table-column
            label="备注"
            min-width="120"
            show-overflow-tooltip
            align="letf"
            prop="remark"
          />

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
  </div>
</template>
