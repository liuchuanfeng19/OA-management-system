<script setup lang="ts">
import moment from "moment";

const props = defineProps({
  itemData: {
    require: true,
    type: Object,
    default: () => {
      return {};
    }
  }
});
const emit = defineEmits(["deal"]);
//处理
function handleDeal() {
  emit("deal", props.itemData);
}
</script>

<template>
  <div class="item flex flex-wrap items-center text-sm">
    <div class="icon-name flex flex-wrap flex-1 items-center">
      <div
        class="icon mr-4 text-white flex justify-center items-center bg-red-300"
      >
        <FontIcon svg icon="icon-renshiyujing-1" />
      </div>
      <div
        class="name flex-1 w-[0px] text-ellipsis overflow-hidden whitespace-nowrap"
        :title="itemData.content"
      >
        {{ itemData.content }}
      </div>
    </div>
    <div class="item-right flex flex-wrap justify-end">
      <div class="time text-gray-400 ml-5">
        {{ moment(itemData.createTime).fromNow() }}
      </div>
      <el-button
        type="primary"
        link
        size="default"
        class="ml-4"
        @click="handleDeal"
        >查看</el-button
      >
    </div>
  </div>
</template>

<style lang="scss" scoped>
.item {
  position: relative;
  height: 34px;
  margin-bottom: 12px;

  // &::before {
  //   position: absolute;
  //   bottom: 0;
  //   width: 100%;
  //   height: 1px;
  //   background-color: var(--el-border-color-light);
  //   content: "";
  // }

  .icon-name {
    flex: 1;
  }
}

.icon {
  width: 34px;
  height: 34px;
  border-radius: 17px;
  padding: 8px;
  font-weight: bolder;
  cursor: pointer;
  color: red;
  -webkit-text-fill-color: white;
}
</style>
