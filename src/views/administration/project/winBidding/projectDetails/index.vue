<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, onBeforeMount } from "vue";
import DialogForm from "./components/DialogForm.vue";
import DialogSupplyForm from "./components/DialogSupplyForm.vue";
import { TableProBar } from "@/components/ReTable";
import { GetAccListV2 } from "@/api/joinSignItem";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { FormInstance } from "element-plus";
import { GetListNVForApp } from "@/api/projectWinBid";
import { GetSupplyListNV } from "@/api/purchasing";
import { exportExcel } from "@/api/exportAll";
import { useGlobal } from "@pureadmin/utils";
import { getUserListByRoleCodeNew } from "@/api/user";
import { tableButtons, operationButtons } from "./constant";
import { TableColumOperation } from "@/components/TableColumOperation";

const { $config, $storage } = useGlobal<GlobalPropertiesApi>();
const roleCodeStaffListMap = {
  purchasingSpeciaList: $config.RoleCodePurchasingSpecialist
};
const projectDetailConfigure = reactive({
  proDetailPartycontract:
    $storage.projectDetailConfigure.projectDetailPartycontract,
  proDetailConstruction:
    $storage.projectDetailConfigure.projectDetailConstruction,
  proDetailPurchase: $storage.projectDetailConfigure.projectDetailPurchase,
  proDetailDelivery: $storage.projectDetailConfigure.projectDetailDelivery
});
function storageConfigureChange<T>(key: string, val: T): void {
  const projectDetailConfigure = $storage.projectDetailConfigure;
  projectDetailConfigure[key] = val;
  $storage.projectDetailConfigure = projectDetailConfigure;
}

defineOptions({
  name: "ProjectSubledger"
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const columnPartycontract = ref([]); //甲方合同数量明细
const columnConstruction = ref([]); //施工图数量明细
const columnPurchase = ref([]); //实际采购数量
const columnDelivery = ref([]); //发货统计数量
const partycontract = ref(true);
const construction = ref(true);
const purchase = ref(true);
const delivery = ref(true);
const tableHeight = ref(0);
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const fold = ref(true);
const maxItemNum = ref(1);
const supplyList = ref([]); //申请状态
const formRef = ref<FormInstance>();
const dialogFormRef = ref(null);
const dialogSupplyFormRef = ref(null);
const projectList = ref([]);
const staffList = ref({
  purchasingSpeciaList: []
});

const queryForm = ref({
  projectId: "",
  // supplyId: "",
  // staffId: "",
  keyword: "",
  // supplyContractCode: "",
  pageIndex: 1,
  pageSize: 20
});
//序号列
// function getIndex(index) {
//   const page = queryForm.value.pageIndex;
//   const pagesize = queryForm.value.pageSize;
//   return (page - 1) * pagesize + index + 1;
// }
//查看发货日期详情
function handleDetails(row) {
  dialogFormRef.value.show(row, "details");
}

//查看采购日期详情
function handleSupplyDetails(row) {
  dialogSupplyFormRef.value.show(row, "details");
}

//导出
async function handleExport() {
  const fileName = "项目明细台账";
  exportExcel("/api/JoinSignItem/ExportAccListV2?", fileName, queryForm.value);
}
//显示设置
function handleSetting() {
  drawerVisible.value = true;
}

const drawerVisible = ref(false); //显示
//关闭
function handleClose() {
  drawerVisible.value = false;
  storageConfigureChange("projectDetailPartycontract", partycontract.value);
  storageConfigureChange("projectDetailConstruction", construction.value);
  storageConfigureChange("projectDetailPurchase", purchase.value);
  storageConfigureChange("projectDetailDelivery", delivery.value);
}
//取消
// function cancelClick() {
//   drawerVisible.value = false;
// }
//确定
// function confirmClick() {
//   drawerVisible.value = false;
// }
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
  GetAccListV2(queryForm.value)
    .then(({ data }) => {
      const _data = data || [];
      dataList.value = _data.map(item => {
        item.disabled = {};
        item.title = {};
        return item;
      });
      if (dataList.value.length > 0) {
        const item = dataList.value[0];
        columnPartycontract.value = item.sellSiteItems || [];
        columnConstruction.value = item.drawingSiteItems || [];
        columnPurchase.value = item.buySiteItems || [];
        columnDelivery.value = item.recvSignSiteItems || [];
      }
      totalPage.value = data.totalCount;
      loading.value = false;
    })
    .catch(() => {
      loading.value = false;
      dataList.value = [];
    });
}

//合并单元格
/*rowspan（）这个函数就是用来返回 spanArr 数组的，定义每一行的 rowspan
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
// const spanArr = ref([]);
// const position = ref(0);
// function rowspan() {
//   spanArr.value = [];
//   dataList.value.forEach((item, index) => {
//     if (index == 0) {
//       spanArr.value.push(1);
//       position.value = 0;
//     } else {
//       const pitem = dataList.value[index - 1];
//       if (
//         pitem.preParentId == "00000000-0000-0000-0000-000000000000" &&
//         pitem.preId === item.preParentId
//       ) {
//         spanArr.value[position.value] += 1;
//         spanArr.value.push(0);
//       } else {
//         spanArr.value.push(1);
//         position.value = index;
//       }
//     }
//   });
// }
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
// function objectSpanMethod({ rowIndex, columnIndex }) {
//   console.log("spanArr---->", spanArr);

//   //表格合并行
//   if (columnIndex === 0) {
//     const _row = spanArr.value[rowIndex];
//     const _col = _row > 0 ? 1 : 0;
//     return {
//       rowspan: _row,
//       colspan: _col
//     };
//   }
// }

function handleOperation(functionName) {
  console.log("functionName", functionName);
  switch (functionName) {
    case "handleExport":
      handleExport();
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
// function handlepurchasingSpeciachange(val) {
//   const staff = staffList.value.purchasingSpeciaList.find(
//     item => item.staffId == val
//   );
//   queryForm.value.staffId = staff.staffId;
//   formRef.value.validateField("staffId", () => null);
// }

onBeforeMount(() => {
  Object.keys(roleCodeStaffListMap).forEach(item => {
    getStaffListByDeptId(roleCodeStaffListMap[item], item);
    console.log("roleCodeStaffListMapitem--->", roleCodeStaffListMap[item]);
  });
});

// //切换“折叠”与“展开”
// function handleFold() {
//   fold.value = !fold.value;
//   setTableHeight();
// }

// 重置查询条件表单
const resetForm = () => {
  let projectId = "";
  if (projectList.value.length > 0) {
    projectId = projectList.value[0].id;
  }
  formRef.value.resetFields();
  queryForm.value.projectId = projectId;
  onSearch();
};

//供应商NV;
async function getSupply() {
  const { data } = await GetSupplyListNV();
  supplyList.value = data;
}

getSupply();

// 获取中标项目NV数据
function getProjectList() {
  GetListNVForApp(queryForm)
    .then(({ data }) => {
      projectList.value = data || [];
      if (projectList.value.length > 0) {
        const item = projectList.value[0];
        queryForm.value.projectId = item.id;
        onSearch();
      } else {
        loading.value = false;
      }
    })
    .catch(() => {
      projectList.value = [];
      loading.value = false;
    });
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
  partycontract.value = projectDetailConfigure.proDetailPartycontract ?? true;
  construction.value = projectDetailConfigure.proDetailConstruction ?? true;
  purchase.value = projectDetailConfigure.proDetailPurchase ?? true;
  delivery.value = projectDetailConfigure.proDetailDelivery ?? true;
  getProjectList();

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
        <el-select
          v-model="queryForm.projectId"
          placeholder="请选择"
          filterable
          style="width: 100%"
        >
          <el-option
            v-for="item in projectList"
            :key="item.id"
            :label="item.fullName"
            :value="item.id"
          />
        </el-select>
      </el-form-item>
      <!-- <el-form-item
        label="供应商名称"
        prop="supplyId"
        v-show="maxItemNum >= 2 || !fold"
      >
        <el-select clearable v-model="queryForm.supplyId" placeholder="请选择"
          ><el-option
            v-for="item in supplyList"
            :key="item.id"
            :label="item.name"
            :value="item.id"
        /></el-select>
      </el-form-item>

      <el-form-item
        label="采购负责人"
        prop="staffId"
        v-show="maxItemNum >= 3 || !fold"
      >
        <el-select
          clearable
          v-model="queryForm.staffId"
          placeholder="请选择"
          @change="handlepurchasingSpeciachange"
          ><el-option
            v-for="item in staffList.purchasingSpeciaList"
            :key="item.staffId"
            :label="item.staffName"
            :value="item.staffId"
        /></el-select>
      </el-form-item> -->

      <!-- <el-form-item
        label="合同编号"
        prop="supplyContractCode"
        v-show="maxItemNum >= 4 || !fold"
      >
        <el-input
          placeholder="请输入"
          v-model="queryForm.supplyContractCode"
          clearable
          @keyup.enter="onSearch"
        />
      </el-form-item> -->
      <el-form-item>
        <el-button
          type="primary"
          :icon="useRenderIcon('search')"
          :loading="loading"
          @click="onSearch"
        >
          查询
        </el-button>
        <el-button :icon="useRenderIcon('refresh')" @click="resetForm">
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
      title="项目明细账"
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
        <el-button
          type="primary"
          :icon="useRenderIcon('setting')"
          @click="handleSetting"
        >
          显示设置
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
          row-key="historyItemId"
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
            prop="seq"
            label="序号"
            width="60"
            align="center"
          />
          <el-table-column label="甲方合同清单">
            <el-table-column
              label="物资名称"
              prop="sellMaterialName"
              min-width="150"
              align="letf"
              show-overflow-tooltip
            />
            <el-table-column
              label="规格型号"
              prop="sellMaterialSpec"
              min-width="150"
              align="letf"
              show-overflow-tooltip
            />
            <el-table-column
              label="单位"
              prop="sellMaterialUnit"
              width="100"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column
              label="数量"
              prop="sellMaterialQty"
              width="100"
              align="right"
              show-overflow-tooltip
            />

            <el-table-column label="金额（元）">
              <el-table-column
                label="单价（含税）"
                prop="sellMaterialPrice"
                min-width="120"
                align="right"
                show-overflow-tooltip
              />
              <el-table-column
                label="合价（合税）"
                prop="sellSubTotal"
                min-width="120"
                align="right"
                show-overflow-tooltip
              />
            </el-table-column>

            <el-table-column
              label="税率"
              prop="sellTaxRate"
              width="120"
              align="right"
              show-overflow-tooltip
            />
            <el-table-column
              label="税额"
              prop="sellTaxAmount"
              min-width="150"
              align="right"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column v-if="partycontract" label="甲方合同数量明细">
            <el-table-column
              v-for="(item, idx) in columnPartycontract"
              :key="item.siteId"
              :label="item.siteName"
              width="100"
              align="right"
            >
              <template #default="{ row }">
                <span v-if="row.sellSiteItems.length > 0">{{
                  row.sellSiteItems[idx].materialQty
                }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column
              label="合计"
              prop="sellMaterialQty"
              width="100"
              align="right"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column v-if="construction" label="施工图数量">
            <el-table-column
              v-for="(item, idx) in columnConstruction"
              :key="item.siteId"
              :label="item.siteName"
              width="100"
              align="right"
            >
              <template #default="{ row }">
                <span v-if="row.drawingSiteItems.length > 0">{{
                  row.drawingSiteItems[idx].materialQty
                }}</span>
                <span v-else>-</span>
              </template>
            </el-table-column>

            <el-table-column
              label="合计"
              prop="subTotal"
              width="100"
              align="right"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column label="实际采购部分">
            <el-table-column
              min-width="150"
              label="物资名称"
              prop="buyMaterialName"
              align="left"
            />
            <el-table-column
              label="品牌"
              prop="buyMaterialBrand"
              min-width="150"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              label="规格型号"
              prop="buyMaterialSpec"
              min-width="150"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              label="单位"
              prop="buyMaterialUnit"
              width="100"
              align="center"
              show-overflow-tooltip
            />
            <el-table-column label="数量">
              <template v-if="purchase">
                <el-table-column
                  v-for="(item, idx) in columnPurchase"
                  :key="item.siteId"
                  :label="item.siteName"
                  width="100"
                  align="right"
                >
                  <template #default="{ row }">
                    <span>{{ row.buySiteItems[idx].materialQty }}</span>
                  </template>
                </el-table-column>
              </template>
              <el-table-column
                label="合计"
                prop="buyMaterialQty"
                width="100"
                align="right"
                show-overflow-tooltip
              />
            </el-table-column>
            <el-table-column label="金额（元）">
              <el-table-column
                label="单价"
                prop="buyMaterialPrice"
                width="100"
                align="right"
                show-overflow-tooltip
              />
              <el-table-column
                label="合价"
                prop="buySubTotal"
                width="100"
                align="right"
                show-overflow-tooltip
              />
            </el-table-column>
            <el-table-column
              label="供应商"
              prop="supplyName"
              min-width="200"
              align="letf"
              show-overflow-tooltip
            />
            <el-table-column
              min-width="100"
              label="采购人"
              prop="handStaffName"
              align="left"
              show-overflow-tooltip
            />
            <el-table-column
              label="采购时间"
              prop="supplyContractTime"
              min-width="100"
              align="center"
              show-overflow-tooltip
            >
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  :size="size"
                  @click="handleSupplyDetails(scope.row)"
                >
                  明细
                </el-button>
              </template>
            </el-table-column>
            <el-table-column
              label="备注"
              prop="buyRemark"
              min-width="150"
              align="left"
              show-overflow-tooltip
            />
          </el-table-column>
          <el-table-column label="发货统计">
            <el-table-column label="数量">
              <template v-if="delivery">
                <el-table-column
                  v-for="(item, idx) in columnDelivery"
                  :key="item.siteId"
                  :label="item.siteName"
                  width="100"
                  align="right"
                >
                  <template #default="{ row }">
                    <span>{{ row.recvSignSiteItems[idx].materialQty }}</span>
                  </template>
                </el-table-column>
              </template>
              <el-table-column
                label="合计"
                prop="materialQty"
                width="100"
                align="right"
                show-overflow-tooltip
              />
            </el-table-column>

            <el-table-column label="发货时间" min-width="100" align="center">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  :size="size"
                  @click="handleDetails(scope.row)"
                >
                  明细
                </el-button>
              </template>
            </el-table-column>
            <el-table-column
              label="备注"
              prop="recvSignRemark"
              min-width="150"
              align="letf"
              show-overflow-tooltip
            />
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
    <el-drawer
      v-model="drawerVisible"
      title="列表显示设置"
      direction="rtl"
      size="300"
      :before-close="handleClose"
    >
      <div>
        <div class="setting-item">
          <span class="text">甲方合同数量明细</span>
          <el-switch
            v-model="partycontract"
            inline-prompt
            class="ml-2 mr-2"
            style="

--el-switch-off-color: grey"
            inactive-text="隐藏"
            active-text="显示"
          />
        </div>
        <div class="setting-item">
          <span class="text">施工图数量明细</span>
          <el-switch
            v-model="construction"
            inline-prompt
            class="ml-2 mr-2"
            style="

--el-switch-off-color: grey"
            inactive-text="隐藏"
            active-text="显示"
          />
        </div>
        <div class="setting-item">
          <span class="text">实际采购数量</span>
          <el-switch
            v-model="purchase"
            inline-prompt
            class="ml-2 mr-2"
            style="

--el-switch-off-color: grey"
            inactive-text="隐藏"
            active-text="显示"
          />
        </div>
        <div class="setting-item">
          <span class="text">发货统计数量</span>
          <el-switch
            v-model="delivery"
            inline-prompt
            class="ml-2 mr-2"
            style="

--el-switch-off-color: grey"
            inactive-text="隐藏"
            active-text="显示"
          />
        </div>
      </div>
      <!-- <template #footer>
        <div style="flex: auto">
          <el-button @click="cancelClick">取消</el-button>
          <el-button type="primary" @click="confirmClick">确认</el-button>
        </div>
      </template> -->
    </el-drawer>
    <DialogForm ref="dialogFormRef" @search="onSearch" />
    <DialogSupplyForm ref="dialogSupplyFormRef" @search="onSearch" />
  </div>
</template>

<style scoped lang="scss">
.setting-item {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  width: 260px;
  margin-bottom: 25px;

  .text {
    width: 200px;
    font-size: 14px;
  }
}

:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
