<script setup lang="ts">
import { ref, onMounted, markRaw } from "vue";

import { getActiveNoticeList } from "@/api/activeNotice";
import { useRenderFlicker } from "@/components/ReFlicker";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

const loading = ref<boolean>(true);
const activities = ref([
  // {
  //   content: "恭喜德华新入职",
  //   createTime: "2022-14-22 20:46",
  //   size: "large",
  //   type: "primary",
  //   icon: useRenderIcon("more-Filled")
  // },
  // {
  //   content: "项目经理 小张 由于个人原因离职了",
  //   createTime: "2018-04-03 20:46",
  //   color: "#0bbd87"
  // },
  // {
  //   content: "今天是员工 小杨的生日，大家祝他生日快乐吧",
  //   createTime: "2018-04-03 20:46",
  //   size: "large"
  // },
  // {
  //   content: "前端开发工程师 小李 因身体不适请假一天",
  //   createTime: "2018-04-03 20:46",
  //   type: "primary",
  //   hollow: true
  // },
  // {
  //   content: "新征程",
  //   createTime: "2018-04-03 20:46"
  // }
]);

function getData() {
  getActiveNoticeList()
    .then(({ data }) => {
      activities.value = data.data || [];
    })
    .finally(() => {
      loading.value = false;
    });
}

onMounted(() => {
  getData();
});
</script>

<template>
  <el-card
    shadow="hover"
    :style="{
      height: '420px'
    }"
  >
    <template #header>
      <span style="font-size: 16px; font-weight: 500"> 员工动态 </span>
    </template>
    <el-skeleton animated :rows="7" :loading="loading">
      <template #default>
        <el-scrollbar height="326px" :min-size="0">
          <el-timeline v-if="activities.length > 0" class="pl-2 pt-2">
            <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :icon="
                activity.icon
                  ? useRenderIcon(activity.icon, {
                      color: 'var(--el-color-primary)'
                    })
                  : markRaw(
                      useRenderFlicker({
                        borderRadius: '50%',
                        background: 'var(--el-color-primary)'
                      })
                    )
              "
              :type="activity.type"
              :color="activity.color"
              :size="activity.size"
              :hollow="activity.hollow"
              :timestamp="activity.createTime"
            >
              {{ activity.content }}
            </el-timeline-item>
          </el-timeline>
          <el-empty v-else :image-size="64">
            <el-button v-if="false" type="primary" @click="getData()"
              >刷新</el-button
            >
          </el-empty>
        </el-scrollbar>
      </template>
    </el-skeleton>
  </el-card>
</template>
