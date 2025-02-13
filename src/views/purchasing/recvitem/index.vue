<script setup lang="ts">
import dayjs from "dayjs";
import { storeToRefs } from "pinia";
import { useRoute } from "vue-router";
import { ref, onMounted, nextTick, onBeforeMount } from "vue";
import DialogForm from "./components/DialogForm.vue";
import ContentForm from "./components/ContentForm.vue";
import InvoiceForm from "./components/InvoiceForm.vue";
import { TableProBar } from "@/components/ReTable";
import { GetAccList, UpdateAccReturn1, UpdateAccReturn2 } from "@/api/joinSign";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { FormInstance, ElMessageBox, ElMessage } from "element-plus";
import { GetSupplyListNV } from "@/api/purchasing";
// import { PreviewButton } from "@/components/PreviewButton";
// import { DownloadButton } from "@/components/DownloadButton";
import { exportExcel } from "@/api/exportAll";
import { useGlobal } from "@pureadmin/utils";
import { getUserListByRoleCodeNew } from "@/api/user";
import { TableColumOperation } from "@/components/TableColumOperation";
import { tableButtons, operationButtons, columns } from "./constant";
import { userProjectStoreHook } from "@/store/modules/project";
import ReadDialog from "@/components/ReadDialog";

const { getProjectWinBidNVList } = userProjectStoreHook();
const { $config } = useGlobal<GlobalPropertiesApi>();
const roleCodeStaffListMap = {
  purchasingSpeciaList: $config.RoleCodePurchasingSpecialist
};

defineOptions({
  name: "RecvItem"
});
const title = useRoute().meta.title as string;

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const switchLoadMap = ref({});
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const contentFormRef = ref(null);
const invoiceFormRef = ref(null);
const supplyList = ref([]);
const spanArr = ref([]); // 合并单元格
const position = ref(0);
const readDialogRef = ref(null); // 表单对话框组件实例
const staffList = ref({
  purchasingSpeciaList: []
});
const { winBidProjectNVList } = storeToRefs(userProjectStoreHook());
const queryForm = ref({
  keyword: "",
  projectId: "", //项目id
  supplyId: "", //供应商id
  handStaffId: "", //采购人id
  sellContractCode: "", //供应商合同编号
  pageIndex: 1,
  pageSize: 20
});
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// 查看表格行
function handleQuery(row) {
  readDialogRef.value.show(row, columns);
}

// 合同内容
function handleContract(row) {
  contentFormRef.value.show(row, "contract");
}

// 发票开具
function handleInvoice(row) {
  invoiceFormRef.value.show(row, "invoice");
}

//导出
async function handleExport() {
  const fileName = "项目合同台账";
  exportExcel("/api/JoinSign/ExportAccList?", fileName, queryForm.value);
}

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
  GetAccList(queryForm.value)
    .then(({ data }) => {
      const _data = data.data || [];
      dataList.value = _data.map(item => {
        item.disabled = {};
        item.title = {};

        return item;
      });

      totalPage.value = data.totalCount;
      loading.value = false;
      handleData();
    })
    .catch(() => {
      loading.value = false;
      dataList.value = [];
    });
}

function handleOperation(functionName, row?) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleExport":
      handleExport();
      break;
    case "handleQuery":
      handleQuery(row);
      break;
    case "handleContract":
      handleContract(row);
      break;
    case "handleInvoice":
      handleInvoice(row);
      break;
  }
}

// 根据部门Id获取员工列表
const getStaffListByDeptId = async (roleCode, staffType) => {
  const { data = {} } = await getUserListByRoleCodeNew({
    roleCode
  });
  staffList.value[staffType] = data || [];
};
function handlepurchasingSpeciachange(val) {
  const staff = staffList.value.purchasingSpeciaList.find(
    item => item.staffId == val
  );
  queryForm.value.handStaffId = staff.staffId;
  formRef.value.validateField("handStaffId", () => null);
}

//供应商NV;
async function getSupply() {
  const { data } = await GetSupplyListNV();
  supplyList.value = data;
}

getSupply();

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
  dataList.value.forEach((item, index) => {
    if (index == 0) {
      spanArr.value.push(1);
      position.value = 0;
    } else {
      if (dataList.value[index].id === dataList.value[index - 1].id) {
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
    columnIndex == 1 ||
    columnIndex == 2 ||
    columnIndex == 3 ||
    columnIndex == 4 ||
    columnIndex == 5 ||
    columnIndex == 6 ||
    columnIndex == 7 ||
    columnIndex == 8 ||
    columnIndex == 9 ||
    columnIndex == 10 ||
    columnIndex == 11 ||
    columnIndex == 12 ||
    columnIndex == 13 ||
    columnIndex == 14 ||
    columnIndex == 18 ||
    columnIndex == 19 ||
    columnIndex == 20 ||
    columnIndex == 21 ||
    columnIndex == 22 ||
    columnIndex == 23 ||
    columnIndex == 24 ||
    columnIndex == 25
  ) {
    const _row = spanArr.value[rowIndex];
    const _col = _row > 0 ? 1 : 0;
    return {
      rowspan: _row,
      colspan: _col
    };
  }
};

//合同原件返还
function onChangecontractIsReturn({ $index, row }) {
  ElMessageBox.confirm(`请确认合同原件是否返还`, "温馨提示", {
    confirmButtonText: "是",
    cancelButtonText: "否",
    type: "warning"
  })
    .then(async () => {
      switchLoadMap.value[$index] = Object.assign(
        {},
        switchLoadMap.value[$index],
        {
          loading: true
        }
      );
      const { code, message } = await UpdateAccReturn1({
        id: row.id,
        isContractReturn: row.isContractReturn
      });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
      switchLoadMap.value[$index] = Object.assign(
        {},
        switchLoadMap.value[$index],
        {
          loading: false
        }
      );
    })
    .catch(() => {
      row.isContractReturn
        ? (row.isContractReturn = false)
        : (row.isContractReturn = true);
    });
}

//签收单/验收单返还
function onChangerecvSignIsReturn({ $index, row }) {
  ElMessageBox.confirm(`请确认签收单/验收单是否返还`, "温馨提示", {
    confirmButtonText: "是",
    cancelButtonText: "否",
    type: "warning"
  })
    .then(async () => {
      switchLoadMap.value[$index] = Object.assign(
        {},
        switchLoadMap.value[$index],
        {
          loading: true
        }
      );
      const { code, message } = await UpdateAccReturn2({
        id: row.id,
        isRecvSignReturn: row.isRecvSignReturn
      });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
      switchLoadMap.value[$index] = Object.assign(
        {},
        switchLoadMap.value[$index],
        {
          loading: false
        }
      );
    })
    .catch(() => {
      row.isRecvSignReturn
        ? (row.isRecvSignReturn = false)
        : (row.isRecvSignReturn = true);
    });
}

// //切换“折叠”与“展开”
// function handleFold() {
//   fold.value = !fold.value;
//   setTableHeight();
// }

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

function formatDatetime(dt) {
  return dayjs(dt).format("YYYY-MM-DD");
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
onMounted(async () => {
  onSearch();
  if (winBidProjectNVList.value.length < 1) {
    getProjectWinBidNVList();
  }
  nextTick(() => {
    setTableHeight();
  });
});

onBeforeMount(() => {
  Object.keys(roleCodeStaffListMap).forEach(item => {
    getStaffListByDeptId(roleCodeStaffListMap[item], item);
  });
});

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
      label-width="90px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item
        v-show="maxItemNum >= 1 || !fold"
        label="项目名称"
        prop="projectId"
      >
        <el-select v-model="queryForm.projectId" clearable placeholder="请选择"
          ><el-option
            v-for="item in winBidProjectNVList"
            :key="item.value"
            :label="item.name"
            :value="item.value"
        /></el-select>
      </el-form-item>
      <el-form-item
        v-show="maxItemNum >= 2 || !fold"
        label="供应商名称"
        prop="supplyId"
      >
        <el-select v-model="queryForm.supplyId" clearable placeholder="请选择"
          ><el-option
            v-for="item in supplyList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
        /></el-select>
      </el-form-item>

      <el-form-item
        v-show="maxItemNum >= 3 || !fold"
        label="采购负责人"
        prop="handStaffId"
      >
        <el-select
          v-model="queryForm.handStaffId"
          clearable
          placeholder="请选择"
          @change="handlepurchasingSpeciachange"
          ><el-option
            v-for="item in staffList.purchasingSpeciaList"
            :key="item.staffId"
            :label="item.staffName"
            :value="item.staffId"
        /></el-select>
      </el-form-item>

      <el-form-item
        v-show="maxItemNum >= 4 || !fold"
        label="合同编号"
        prop="sellContractCode"
      >
        <el-input
          v-model="queryForm.sellContractCode"
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
        <!-- <el-button type="text" @click="handleFold">
          <span v-show="fold">展开</span>
          <span v-show="!fold">折叠</span>
          <IconifyIconOffline :icon="!fold ? 'arrow-up' : 'arrow-down'" />
        </el-button> -->
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
          :span-method="objectSpanMethod"
          highlight-current-row
          :default-expand-all="false"
          row-key="path"
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
            width="60"
            align="center"
          />
          <el-table-column
            label="项目名称"
            fixed="left"
            prop="projectShortName"
            min-width="300"
            align="letf"
            show-overflow-tooltip
          />
          <el-table-column
            label="合同日期"
            fixed="left"
            prop="supplyContractTime"
            min-width="120"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{
                row.supplyContractTime
                  ? formatDatetime(row.supplyContractTime)
                  : "-"
              }}
            </template>
          </el-table-column>
          <el-table-column
            label="合同编号"
            fixed="left"
            prop="sellContractCode"
            min-width="200"
            align="letf"
            show-overflow-tooltip
          />
          <el-table-column
            min-width="120"
            label="类别"
            prop="businessTypeName"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="签订主体名称"
            prop="customer"
            min-width="200"
            align="letf"
            show-overflow-tooltip
          />
          <el-table-column
            label="供应单位名称"
            prop="supplyName"
            width="120"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            min-width="200"
            label="合同内容"
            prop="contractContent"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="合同金额"
            prop="amount"
            width="120"
            align="right"
            show-overflow-tooltip
          />
          <el-table-column
            label="税率"
            prop="taxRateStr"
            min-width="100"
            align="left"
            show-overflow-tooltip
          />
          <el-table-column
            label="付款方式"
            prop="payMethod"
            width="120"
            align="letf"
            show-overflow-tooltip
          />
          <el-table-column
            label="付款日期"
            prop="payTime"
            width="150"
            align="center"
          >
            <template #default="{ row }">
              {{ row.payTime ? formatDatetime(row.payTime) : "-" }}
            </template>
          </el-table-column>
          <el-table-column
            label="付款金额"
            prop="payTotal"
            width="120"
            align="right"
            show-overflow-tooltip
          />
          <el-table-column
            label="合同已付"
            prop="payAmount"
            width="120"
            align="right"
            show-overflow-tooltip
          />

          <el-table-column
            label="合同未付"
            prop="unPayAmount"
            width="120"
            align="right"
            show-overflow-tooltip
          />
          <el-table-column
            label="发票已开"
            prop="invoiceAmount"
            width="120"
            align="right"
            show-overflow-tooltip
          />

          <el-table-column
            label="发票未开"
            prop="unInvoiceAmount"
            width="120"
            align="right"
            show-overflow-tooltip
          />
          <el-table-column
            label="质保期"
            prop="qualityTime"
            width="120"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ row.qualityTime ? formatDatetime(row.qualityTime) : "-" }}
            </template>
          </el-table-column>

          <el-table-column
            label="采购负责人(业务经办人)"
            prop="handStaffName"
            min-width="180"
            align="center"
            show-overflow-tooltip
          />

          <el-table-column
            label="合同原件是否返还"
            prop="isContractReturn"
            min-width="140"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row, $index }">
              <el-switch
                v-model="row.isContractReturn"
                :size="size === 'small' ? 'small' : 'default'"
                :loading="switchLoadMap[$index]?.loading"
                style="

--el-switch-off-color: grey"
                inline-prompt
                isContractReturn
                inactive-text="否"
                :active-value="true"
                active-text="是"
                @change="onChangecontractIsReturn({ row, $index })"
              />
            </template>
          </el-table-column>
          <el-table-column
            label="签收单/验收单是否返还"
            prop="isRecvSignReturn"
            min-width="170"
            align="center"
            show-overflow-tooltip
          >
            <template #default="{ row, $index }">
              <el-switch
                v-model="row.isRecvSignReturn"
                :size="size === 'small' ? 'small' : 'default'"
                :loading="switchLoadMap[$index]?.loading"
                style="

--el-switch-off-color: grey"
                inline-prompt
                :inactive-value="false"
                inactive-text="否"
                :active-value="true"
                active-text="是"
                @change="onChangerecvSignIsReturn({ row, $index })"
              />
            </template>
          </el-table-column>

          <el-table-column
            label="备注"
            prop="remark"
            width="200"
            align="letf"
            show-overflow-tooltip
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
    <DialogForm ref="dialogFormRef" @search="onSearch" />
    <ContentForm ref="contentFormRef" @search="onSearch" />
    <ReadDialog ref="readDialogRef" :title="title" :width="940" :column="2" />
    <InvoiceForm ref="invoiceFormRef" @search="onSearch" />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
