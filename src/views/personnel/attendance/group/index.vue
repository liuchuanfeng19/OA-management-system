<script setup lang="ts">
import { ref, onMounted, nextTick } from "vue";
import { ElMessage, FormInstance, ElMessageBox } from "element-plus";

import router from "@/router";
import { TableProBar } from "@/components/ReTable";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { deleteAttendGroup, getAttendGroupList } from "@/api/attendance";

defineOptions({
  name: "AttendanceGroup"
});

// vue3 声明原始数据类型的响应式变量，另外如果是对象类型，则使用reactive方法
const tableHeight = ref(0);
const dataList = ref([
  {
    id: 1,
    title: "苏州某某公司",
    staffNums: 8,
    type: "固定班制",
    times: "周一、周二、周三、周四、周五默认班次: 09:00-18:00"
  }
]);
const totalPage = ref(0);
const loading = ref(true);
const maxItemNum = ref(1);
const formRef = ref<FormInstance>();
const queryForm = ref({
  name: "",
  pageIndex: 1,
  pageSize: 20
});
//序号列
function getIndex(index) {
  const page = queryForm.value.pageIndex;
  const pagesize = queryForm.value.pageSize;
  return (page - 1) * pagesize + index + 1;
}
// current-change 改变时触发
function handleCurrentChange() {
  onSearch();
}

// pageSize 改变时触发
function handleSizeChange() {
  onSearch();
}

// 搜索获取表格数据
async function onSearch() {
  loading.value = true;
  const { data } = await getAttendGroupList(queryForm.value);
  const list = data.data || [];
  list.forEach(item => {
    let times = "";
    if (
      item.day1Flag &&
      item.day2Flag &&
      item.day3Flag &&
      item.day4Flag &&
      item.day5Flag &&
      item.day1Period == item.day2Period &&
      item.day2Period == item.day3Period &&
      item.day3Period == item.day4Period &&
      item.day4Period == item.day5Period &&
      item.day1Period != null &&
      item.day2Period != null &&
      item.day3Period != null &&
      item.day4Period != null &&
      item.day5Period != null
    ) {
      times = "周一、周二、周三、周四、周五：" + "默认班次：" + item.day1Period;
    } else {
      if (item.day1Flag) {
        times = times + "周一" + item.day1Period;
      }
      if (item.day2Flag) {
        times = times + "周二" + item.day2Period;
      }
      if (item.day3Flag) {
        times = times + "周三" + item.day3Period;
      }
      if (item.day4Flag) {
        times = times + "周四" + item.day4Period;
      }
      if (item.day5Flag) {
        times = times + "周五" + item.day5Period;
      }
      if (item.day6Flag) {
        times =
          times + "周六" + (item.day6Period == "" ? "休息" : item.day6Period);
      }
      if (item.day7Flag) {
        times =
          times + "周日" + (item.day7Period == "" ? "休息" : item.day7Period);
      }
    }
    item.times = times;
  });
  dataList.value = data.data || [];
  totalPage.value = data.totalCount;
  loading.value = false;
}

//添加
async function handleAdd() {
  router.push({
    path: "/personnel/attendance/setUp",
    query: { id: "" }
  });
}
//查看
// function handleQuery(row) {
//   console.log(row);
//   router.push({
//     path: "/personnel/attendance/setUp",
//     query: { id: row.id }
//   });
// }
//编辑
function handleEdit(row) {
  console.log(row);
  router.push({
    path: "/personnel/attendance/setUp",
    query: { id: row.id }
  });
}
//删除
async function handleDelete(row) {
  ElMessageBox.confirm("确定要删除吗?", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      const { code, message } = await deleteAttendGroup({ id: row.id });
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
      label-width="100px"
      class="bg-bg_color w-100/100 pl-2 pt-4 mb-2"
    >
      <el-form-item v-show="maxItemNum >= 1" label="考勤组名称" prop="name">
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
      title="考勤组"
      :loading="loading"
      :dataList="dataList"
      @refresh="onSearch"
    >
      <template #buttons>
        <el-button
          v-auth="'AttendanceGroup.add'"
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
        >
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
            label="名称"
            width="200"
            align="center"
            prop="name"
            show-overflow-tooltip
          />
          <el-table-column
            label="人数"
            width="100"
            align="center"
            prop="staffCount"
            show-overflow-tooltip
          />
          <!-- <el-table-column
            label="类型"
            width="150"
            align="center"
            prop="type"
            show-overflow-tooltip
          /> -->
          <el-table-column
            label="考勤时间"
            min-width="200"
            align="center"
            prop="times"
            show-overflow-tooltip
          />
          <el-table-column
            fixed="right"
            label="操作"
            width="120"
            align="center"
          >
            <template #default="scope">
              <!-- <el-button
                v-auth="'AttendanceGroup.query'"
                :size="size"
                @click="handleQuery(scope.row)"
                link
                type="primary"
              >
                查看
              </el-button> -->
              <el-button
                v-auth="'AttendanceGroup.edit'"
                :size="size"
                link
                type="primary"
                @click="handleEdit(scope.row)"
              >
                编辑
              </el-button>
              <el-button
                v-auth="'AttendanceGroup.delete'"
                :size="size"
                link
                type="danger"
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
  </div>
</template>
