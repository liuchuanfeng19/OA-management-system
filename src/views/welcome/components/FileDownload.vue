<script setup lang="ts"></script>

<template>
  <el-scrollbar height="320px" :min-size="0">
    <div
      v-for="item in 20"
      :key="item"
      class="item flex flex-wrap items-center"
    >
      <div class="icon-name flex flex-wrap flex-1 items-center">
        <IconifyIconOffline icon="tickets" class="icon mr-1" />
        <div
          class="name flex-1 w-[0px] text-ellipsis overflow-hidden whitespace-nowrap"
        >
          文件名称文件名称文件名称文件名称文件名称文件名称文件名称.text
        </div>
      </div>
      <IconifyIconOffline icon="more" class="!text-gray-400 ml-5 icon" />
    </div>
  </el-scrollbar>
</template>

<style lang="scss" scoped>
.item {
  position: relative;
  height: 48px;

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
  // width: 24px;
  // height: 24px;
  cursor: pointer;
}
</style>
