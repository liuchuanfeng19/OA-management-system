<script setup lang="ts">
import { ref, reactive } from "vue";
import { templateRef } from "@vueuse/core";
import SeamlessScroll from "@/components/ReSeamlessScroll";
import { GetUnReadFirst } from "@/api/notice";
import dayjs from "dayjs";
// import router from "@/router";

// vue3 在 <script setup> 中使用 defineEmits API 来声明 emits
const emit = defineEmits(["showNotice"]);

const scroll = templateRef<ElRef | null>("scroll", null);

const listData = ref([]);

const classOption = reactive({
  direction: "top"
});

// //通知
function handle(item) {
  emit("showNotice", item);
}

async function loadNoticeData() {
  const { data } = await GetUnReadFirst({ pageSize: 20, pageIndex: 1 });
  data.data.forEach(item => {
    const str = item.createTime.slice(5, 16);
    item.createTime = str;
  });
  listData.value = data.data;
  //解决不滚动代码
  scroll.value.reset();
}
//抛出
defineExpose({ loadNoticeData });
loadNoticeData();
</script>

<template>
  <div class="infinite bg-bg_color">
    <ul class="top">
      <li style="width: 10% !important">类型</li>
      <li style="width: 25% !important">标题</li>
      <li style="width: 40% !important">内容</li>
      <li style="width: 20% !important">创建时间</li>
    </ul>
    <SeamlessScroll
      ref="scroll"
      :data="listData"
      :class-option="classOption"
      class="warp"
    >
      <ul class="item">
        <li
          v-for="(item, index) in listData"
          :key="index"
          @click="handle(item)"
        >
          <span
            style="width: 10% !important"
            v-text="
              item.noticeType == '1'
                ? '通知'
                : item.noticeType == '2'
                  ? '审核'
                  : '公告'
            "
          />
          <span style="width: 25% !important" v-text="item.title" />
          <span style="width: 40% !important" v-text="item.content" />
          <span
            style="width: 20% !important"
            v-text="dayjs(item.createTime).format('MM.DD hh:mm')"
          />
        </li>
      </ul>
    </SeamlessScroll>
  </div>
</template>

<style lang="scss" scoped>
.infinite {
  height: 35vh;

  .top {
    display: flex;
    width: 95%;
    height: 40px;
    margin: 0 auto;
    font-size: 14px;
    font-weight: 400;
    line-height: 40px;
    color: #909399;
    background: #fafafa;

    li {
      width: 40%;
      margin-left: 15px;
      overflow: hidden;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .warp {
    width: 95%;
    height: 215px;
    margin: 0 auto;
    overflow: hidden;

    li {
      display: flex;
      height: 30px;
      font-size: 15px;
      line-height: 30px;
    }

    li:hover {
      color: rgb(113 174 236);
    }

    span {
      width: 40%;
      margin-left: 10px;
      overflow: hidden;
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}
</style>
