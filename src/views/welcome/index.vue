<script setup lang="ts">
import { ref, onMounted } from "vue";

// import { emitter } from "@/utils/mitt";
import TextCard from "./components/TextCard.vue";
import { markAsNotDisplay } from "@/api/auditNotice";
import WarningCard from "./components/WarningCard.vue";
import ScheduleCard from "./components/ScheduleCard.vue";
import { Attendance, Shortcuts, Dynamics } from "./components";
// import { MarkOneNoticeReceiverAsRead } from "@/api/noticeReceiver";
import ScheduleDialog from "./components/ScheduleDialog.vue";
import DialogFormQualificationsCompany from "../administration/qualifications/list/components/DialogForm.vue";
import DialogFormBusinessTender from "../administration/project/tend/businesstender/components/DialogForm.vue";
import DialogFormQualificationsPersonal from "../administration/qualifications/personal/components/DialogForm.vue";

defineOptions({
  name: "Welcome"
});

const loading = ref<boolean>(true);
const scheduleCardRef = ref(null);
const scheduleDialogRef = ref(null);
const businessTenderFormRef = ref(null);
const qualificationsCompanyFormRef = ref(null);
const qualificationsPersonalFormRef = ref(null);

// 搜索获取表格数据
async function onSearch(el) {
  el.handleRefresh();
}

//处理
async function handleDeal(row: any, type?) {
  scheduleDialogRef.value.handleDeal(row, type);
}
//隐藏
async function handleHidden(row: any) {
  const { code } = await markAsNotDisplay({ id: row.id });
  if (code == 0) {
    onSearch(scheduleCardRef.value);
  }
}

//处理
async function handleRead(row: any) {
  // const {success } = await MarkOneNoticeReceiverAsRead({ id: row.id });
  // if (code==0) {
  //   onSearch();
  //   emitter.emit("reloadStaffNoticeData"); //重新加载右上角通知信息
  // }
  const showType = row.isProcessed ? "read" : "read";
  if (row.busiType == "project") {
    businessTenderFormRef.value.show({ id: row.busiId }, showType);
  } else if (row.busiType == "companyCert") {
    qualificationsCompanyFormRef.value.show({ id: row.busiId }, showType);
  } else if (row.busiType == "qualification") {
    qualificationsPersonalFormRef.value.show({ id: row.busiId }, showType);
  }
}

setTimeout(() => {
  loading.value = !loading.value;
}, 800);

//mounted周期函数
onMounted(async () => {});
</script>

<template>
  <div class="welcome">
    <el-row :gutter="10" style="margin: 10px 5px 0">
      <el-col
        v-motion
        :xs="24"
        :sm="24"
        :md="18"
        :lg="18"
        :xl="18"
        style="margin-bottom: 10px"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 400
          }
        }"
      >
        <el-row :gutter="10">
          <!-- 个人待办 -->
          <el-col
            v-motion
            :xs="24"
            :sm="24"
            :md="16"
            :lg="16"
            :xl="16"
            style="margin-bottom: 10px"
            :initial="{
              opacity: 0,
              y: 100
            }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: {
                delay: 200
              }
            }"
          >
            <ScheduleCard
              ref="scheduleCardRef"
              @deal="handleDeal"
              @jump="handleDeal($event, 'jump')"
              @hidden="handleHidden"
            />
          </el-col>

          <!-- 快捷工具 -->
          <el-col
            v-motion
            :xs="24"
            :sm="24"
            :md="8"
            :lg="8"
            :xl="8"
            style="margin-bottom: 10px"
            :initial="{
              opacity: 0,
              y: 100
            }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: {
                delay: 200
              }
            }"
          >
            <Shortcuts />
          </el-col>

          <!-- 通知公告、规章制度、知识库 -->
          <el-col
            v-motion
            :xs="24"
            :sm="24"
            :md="16"
            :lg="16"
            :xl="16"
            style="margin-bottom: 10px"
            :initial="{
              opacity: 0,
              y: 100
            }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: {
                delay: 200
              }
            }"
          >
            <TextCard />
          </el-col>

          <!-- 员工动态 -->
          <el-col
            v-motion
            :xs="24"
            :sm="24"
            :md="8"
            :lg="8"
            :xl="8"
            style="margin-bottom: 10px"
            :initial="{
              opacity: 0,
              y: 100
            }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: {
                delay: 400
              }
            }"
          >
            <Dynamics />
          </el-col>
        </el-row>
      </el-col>

      <el-col
        v-motion
        :xs="24"
        :sm="24"
        :md="6"
        :lg="6"
        :xl="6"
        style="margin-bottom: 10px"
        :initial="{
          opacity: 0,
          y: 100
        }"
        :enter="{
          opacity: 1,
          y: 0,
          transition: {
            delay: 400
          }
        }"
      >
        <el-row :gutter="10">
          <!-- 考勤管理 -->
          <el-col
            v-motion
            :xs="24"
            :sm="24"
            :md="24"
            :lg="24"
            :xl="24"
            style="margin-bottom: 10px"
            :initial="{
              opacity: 0,
              y: 100
            }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: {
                delay: 400
              }
            }"
          >
            <el-card
              shadow="hover"
              style="height: 420px"
              :body-style="{ 'padding-bottom': '0px' }"
            >
              <el-skeleton :animated="true" :rows="7" :loading="loading">
                <template #default>
                  <Attendance />
                </template>
              </el-skeleton>
            </el-card>
          </el-col>

          <!-- 预警管理 -->
          <el-col
            v-motion
            :xs="24"
            :sm="24"
            :md="24"
            :lg="24"
            :xl="24"
            style="margin-bottom: 10px"
            :initial="{
              opacity: 0,
              y: 100
            }"
            :enter="{
              opacity: 1,
              y: 0,
              transition: {
                delay: 400
              }
            }"
          >
            <WarningCard @deal="handleRead" />
          </el-col>
        </el-row>
      </el-col>
    </el-row>
    <DialogFormBusinessTender ref="businessTenderFormRef" />
    <DialogFormQualificationsPersonal ref="qualificationsPersonalFormRef" />
    <DialogFormQualificationsCompany ref="qualificationsCompanyFormRef" />
    <ScheduleDialog
      ref="scheduleDialogRef"
      @search="onSearch(scheduleCardRef)"
    />
  </div>
</template>

<style module scoped>
.size {
  height: 335px;
}
</style>

<style lang="scss" scoped>
:deep(.el-tabs__nav-prev, .el-tabs__nav-next) {
  position: absolute;
  width: 20px;
  height: 44px;
  font-size: 12px;
  line-height: inherit;
  color: var(--el-text-color-secondary);
  text-align: center;
  cursor: pointer;

  i {
    top: 4px;
  }
}

:deep(.el-tabs__nav-next) {
  position: absolute;
  width: 20px;
  height: 44px;
  font-size: 12px;
  line-height: inherit;
  color: var(--el-text-color-secondary);
  text-align: center;
  cursor: pointer;

  i {
    top: 4px;
  }
}

.main-content {
  margin: 0 !important;
}

.welcome {
  height: 100%;

  .top-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 60px;
    background: var(--el-bg-color);

    .left-mark {
      display: flex;
      align-items: center;

      img {
        display: block;
        width: 50px;
        height: 50px;
        margin-right: 10px;
        cursor: pointer;
        border-radius: 50%;
      }

      span {
        font-size: 14px;
      }
    }
  }
}
</style>
