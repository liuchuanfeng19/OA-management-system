<script setup lang="ts">
import { useRoute } from "vue-router";
import { ref, onMounted, nextTick } from "vue";
import { FormInstance, ElMessage, ElMessageBox } from "element-plus";

import {
  GetList,
  Delete,
  GetCarStatusTypesNV,
  GetCarLicensePlatePattern
} from "@/api/vehicle";
import router from "@/router";
import ReadDialog from "@/components/ReadDialog";
import { TableProBar } from "@/components/ReTable";
import CarMaintain from "./components/CarMaintain.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { tableButtons, operationButtons, columns } from "./constant";
import { TableColumOperation } from "@/components/TableColumOperation";

defineOptions({
  name: "VehicleList"
});
const title = useRoute().meta.title as string;

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const readDialogRef = ref(null); // 表单对话框组件实例
const maxItemNum = ref(1);
const CarStatusData = ref([]); //车辆状态
const dialogFormRef = ref(null);

const formRef = ref<FormInstance>();
const queryForm = ref({
  keyword: "",
  carLicensePlate: "",
  carStatus: "",
  pageIndex: 1,
  pageSize: 20
});
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
//新增操作
const handleAdd = () => {
  dialogFormRef.value.show();
};

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
      const { code, message } = await Delete({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

// 保险
function handleInsurance(row) {
  // dialogFormRef.value.show(row, "edit");
  router.push(
    "/administration/vehicle/insurance?carLicensePlate=" + row.carLicensePlate
  );
}

// 保养/维修
function handleMaintain(row) {
  router.push(
    "/administration/vehicle/maintain?carLicensePlate=" + row.carLicensePlate
  );
  // dialogFormRef.value.show(row, "edit");
}

// 违章
function handleViolation(row) {
  router.push(
    "/administration/vehicle/violation?carLicensePlate=" + row.carLicensePlate
  );
  // dialogFormRef.value.show(row, "edit");
}
// 驾驶员
// function handleDriver(row) {
//   router.push("/administration/vehicle/driver?Status=" + row.carStatus);
//   // dialogFormRef.value.show(row, "edit");
// }

//function handleExport() {}
// function handleMoreDelete() {}

// current-change 改变时触发
function handleCurrentChange() {
  onSearch();
}

// pageSize 改变时触发
function handleSizeChange() {
  onSearch();
}

// 表格行选中回调
function handleSelectionChange(val) {
  console.log("handleSelectionChange", val);
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  GetList(queryForm.value)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        item.disabled = {};
        item.title = {};

        return item;
      });

      totalPage.value = data.totalCount;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
      dataList.value = [];
    });
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleAdd":
      handleAdd();
      break;

    case "handleQuery":
      readDialogRef.value.show(row, columns);
      break;
    case "handleEdit":
      handleEdit(row);
      break;
    case "handleDelete":
      handleDelete(row);
      break;
  }
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

//获取车辆状态
async function GetCarStatus() {
  const { data } = await GetCarStatusTypesNV({ includeAll: false });
  CarStatusData.value = data || {};
}

//切换“折叠”与“展开”
function handleFold() {
  fold.value = !fold.value;
  setTableHeight();
}

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
  GetCarStatus();
  onSearch();
  nextTick(() => {
    setTableHeight();
  });
});

// 窗口尺寸改变事件回调
window.onresize = function () {
  console.log("onresize");
  nextTick(() => {
    setTableHeight();
  });
};

//获取车辆牌照
const queryCarLicense = async (queryString: string, cb: (arg: any) => void) => {
  const res = await GetCarLicensePlatePattern({ keyword: queryString });
  //debugger;

  cb(res.data);
};

const handleSelectCarLicense = item => {
  console.log(item);
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
        label="车辆牌照"
        prop="carLicensePlate"
      >
        <el-autocomplete
          v-model="queryForm.carLicensePlate"
          :fetch-suggestions="queryCarLicense"
          placeholder="车辆牌照"
          @select="handleSelectCarLicense"
        />
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="车辆状态"
        prop="carStatus"
      >
        <el-select v-model="queryForm.carStatus" clearable placeholder="请选择">
          <el-option
            v-for="item in CarStatusData"
            :key="item.value"
            :label="item.name"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="关键词"
        prop="keyword"
      >
        <el-input
          v-model="queryForm.keyword"
          placeholder="名称、品牌、型号、驾驶员"
          :style="{ width: '235px' }"
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
          搜索
        </el-button>
        <el-button :icon="useRenderIcon('refresh')" @click="resetForm(formRef)">
          重置
        </el-button>
        <el-button type="text" @click="handleFold">
          <span v-show="fold">展开</span>
          <span v-show="!fold">折叠</span>
          <IconifyIconOffline :icon="!fold ? 'arrow-up' : 'arrow-down'" />
        </el-button>
      </el-form-item>
    </el-form>

    <TableProBar
      :title="title"
      :loading="loading"
      :dataList="dataList"
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
          :data="dataList"
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
          <template v-for="column in columns" :key="column.prop">
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

          <el-table-column
            v-auth="
              'VehicleList.insurance|VehicleList.violation|VehicleList.maintain'
            "
            fixed="right"
            label="快捷跳转"
            width="190"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'VehicleList.insurance'"
                :size="size"
                link
                type="primary"
                @click="handleInsurance(scope.row)"
              >
                保险
              </el-button>
              <el-button
                v-auth="'VehicleList.maintain'"
                :size="size"
                link
                type="primary"
                @click="handleMaintain(scope.row)"
              >
                保养/维修
              </el-button>

              <el-button
                v-auth="'VehicleList.violation'"
                :size="size"
                link
                type="primary"
                @click="handleViolation(scope.row)"
              >
                违章
              </el-button>
            </template>
          </el-table-column>

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
    <CarMaintain ref="dialogFormRef" @search="onSearch" />
    <ReadDialog ref="readDialogRef" :title="title" :width="971" :column="3" />
  </div>
</template>
