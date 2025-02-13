<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from "vue";
import { FormInstance, ElMessageBox, ElMessage } from "element-plus";

import {
  getAppFiles,
  deleteAppFile,
  saveMustStatus,
  savePublishStatus
} from "@/api/appFile";
import ReQrcode from "@/components/ReQrcode";
import DialogForm from "./components/DialogForm.vue";
import { TableProBar } from "@/components/ReTable";
import { getAppSystemListNv } from "@/api/nameValue";
import QrcodeDialog from "./components/QrcodeDialog.vue";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "AppManageAndroid"
});

// 表单模型
const INITIAL_DATA = {
  id: undefined,
  appSys: 1,
  isEnterprise: false, //是否为企业版(0:否,1:是）
  appName: "",
  appVersionName: "",
  appVersion: "",
  downloadUrl: "",
  filePackage: "",
  packageName: "",
  requiredMinVersion: "",
  packageSize: 0,
  packagePassword: "",
  description: "",
  isMust: false,
  isPublished: false,
  validity: false,
  creater: "",
  createTime: "",
  modifier: "",
  updateTime: "",
  isPushed: false
};

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const queryForm = ref({
  appSys: 0,
  pageIndex: 1,
  pageSize: 20
});
const dataList = ref([]);
const totalPage = ref(0);
const loading = ref(true);
const tableHeight = ref(0);
const appSystemList = ref([]);
const qrcodeDialogRef = ref();
const formRef = ref<FormInstance>();
const formDialogVisible = ref(false);
const formData = ref({ ...INITIAL_DATA });

// vue3 使用从vue导入的watch函数监听响应式数据
watch(
  () => formDialogVisible.value,
  val => {
    if (!val) {
      formData.value = { ...INITIAL_DATA };
    }
  }
);

function getAppSystemList() {
  getAppSystemListNv({ isSearch: 1 })
    .then(({ data }) => {
      appSystemList.value = data || [];
    })
    .catch(() => {
      appSystemList.value = [];
    });
}

//强制升级
function onUpgradeChange(row) {
  row.isMust = !row.isMust;
  ElMessageBox.confirm("确定要操作强制升级状态吗", "温馨提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { data, message } = await saveMustStatus({
        id: row.id,
        isMust: !row.isMust
      });

      if (data) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {
      console.log("cancel");
    });
}

//发布状态
function onStatusChange(row) {
  console.log(row);
  row.isPublished = !row.isPublished;
  ElMessageBox.confirm("确定要操作发布状态吗", "温馨提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { data, message } = await savePublishStatus({
        id: row.id,
        isPublished: !row.isPublished
      });
      if (data) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {
      console.log("cancel");
    });
}
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
//新增操作
const handleAdd = () => {
  formData.value = { ...INITIAL_DATA };
  formDialogVisible.value = true;
};

// 修改表格行
function handleEdit(row) {
  formData.value = Object.assign({ ...INITIAL_DATA }, { ...row });
  formDialogVisible.value = true;
}

// 删除表格行
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteAppFile({ id: row.id });
      if (code == 0) {
        ElMessage.success(message);
        onSearch();
      }
    })
    .catch(() => {});
}

const codeClick = row => {
  qrcodeDialogRef.value.showDialog(row.downloadUrl);
};

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
  const { data } = await getAppFiles(queryForm.value);
  dataList.value = data.data || [];
  totalPage.value = data.totalCount;
  loading.value = false;
}

// 重置查询条件表单
const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return;
  formEl.resetFields();
  onSearch();
};

// 设置表格组件高度
const setTableHeight = () => {
  tableHeight.value = window.innerHeight - formRef.value.$el.clientHeight - 230;
};
//mounted周期函数
onMounted(async () => {
  await getAppSystemList();
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
</script>

<template>
  <div class="main">
    <el-form
      ref="formRef"
      :inline="true"
      :model="queryForm"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item label="系统平台" prop="appSys">
        <el-select v-model="queryForm.appSys" placeholder="请选择">
          <el-option
            v-for="item in appSystemList"
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
      title="版本管理表"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'AppManageAndroid.add'"
          type="primary"
          :icon="useRenderIcon('add')"
          @click="handleAdd"
        >
          添加
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
            align="left"
            width="60"
          />
          <el-table-column
            v-if="checkList.includes('序号列')"
            type="index"
            :index="getIndex"
            label="序号"
            align="center"
            fixed="left"
            width="60"
          />
          <el-table-column
            align="left"
            label="系统平台"
            prop="appSys"
            width="100"
            :formatter="
              ({ appSys }) =>
                appSystemList.find(item => item.value == appSys).name
            "
          />
          <el-table-column
            align="left"
            label="软件名称"
            min-width="200px"
            prop="appName"
            show-overflow-tooltip
          />
          <el-table-column
            align="center"
            label="软件版本"
            min-width="120px"
            prop="appVersionName"
          />
          <el-table-column
            align="center"
            label="业务版本"
            min-width="90px"
            prop="appVersion"
          />
          <el-table-column align="center" label="强制升级" min-width="120px">
            <template #default="{ row }">
              <el-switch v-model="row.isMust" @change="onUpgradeChange(row)" />
            </template>
          </el-table-column>
          <el-table-column align="center" label="发布状态" min-width="120px">
            <template #default="{ row }">
              <el-switch
                v-model="row.isPublished"
                @change="onStatusChange(row)"
              />
            </template>
          </el-table-column>
          <el-table-column align="center" label="企业版" min-width="120px">
            <template #default="{ row }">
              <el-tag :type="row.isEnterprise ? '' : 'info'">
                {{ row.isEnterprise ? "是" : "否" }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            label="升级包"
            min-width="200px"
            prop="packageName"
            show-overflow-tooltip
          />
          <el-table-column
            align="left"
            label="升级描述"
            min-width="200px"
            prop="description"
            show-overflow-tooltip
          />
          <el-table-column label="二维码" width="120" align="center">
            <template #default="{ row }">
              <ReQrcode
                v-if="false && row.downloadUrl != '' && row.downloadUrl != null"
                :text="row.downloadUrl"
                :width="32"
                :logo="{
                  src: 'https://avatars.githubusercontent.com/u/44761321?v=4',
                  logoSize: 0.2,
                  borderSize: 0.05,
                  borderRadius: 50,
                  bgColor: 'blue'
                }"
                @click="codeClick(row)"
              />
              <el-link
                v-if="row.downloadUrl != '' && row.downloadUrl != null"
                :href="row.downloadUrl"
                type="primary"
                class="mr-4"
              >
                下载
              </el-link>
              <el-button
                v-if="row.downloadUrl != '' && row.downloadUrl != null"
                type="text"
                :size="size"
                @click="codeClick(row)"
                >查看</el-button
              >
              <span v-else />
            </template>
          </el-table-column>
          <el-table-column
            v-auth="'AppManageAndroid.edit|AppManageAndroid.delete'"
            fixed="right"
            label="操作"
            width="140"
            align="center"
          >
            <template #default="scope">
              <el-button
                v-auth="'AppManageAndroid.edit'"
                :size="size"
                link
                type="primary"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-auth="'AppManageAndroid.delete'"
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
    <QrcodeDialog ref="qrcodeDialogRef" />
    <DialogForm
      v-model:visible="formDialogVisible"
      :data="formData"
      @search="onSearch"
    />
  </div>
</template>

<style scoped lang="scss">
:deep(.el-dropdown-menu__item i) {
  margin: 0;
}
</style>
