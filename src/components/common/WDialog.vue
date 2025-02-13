<script setup lang="ts">
defineOptions({
  name: "WDialog"
});

const emit = defineEmits(["update:modelValue", "cancel", "ok"]);

defineProps({
  title: {
    type: String,
    default: ""
  },
  width: {
    type: String,
    default: "50%"
  },
  modelValue: {
    type: Boolean,
    default: false
  },
  clickClose: {
    type: Boolean,
    default: false
  },
  closeFree: {
    type: Boolean,
    default: false
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  cancelText: {
    type: String,
    default: "取 消"
  },
  okText: {
    type: String,
    default: "确 定"
  },
  border: {
    type: Boolean,
    default: true
  }
});
</script>

<template>
  <el-dialog
    custom-class="custom-dialog"
    class="border"
    :width="width"
    :title="title"
    append-to-body
    :close-on-click-modal="clickClose"
    :destroy-on-close="closeFree"
    :modelValue="modelValue"
    @close="emit('update:modelValue', false)"
  >
    <slot />
    <template v-if="showFooter" #footer>
      <el-button
        @click="
          emit('update:modelValue', false);
          $emit('cancel');
        "
        >{{ cancelText }}</el-button
      >
      <el-button type="primary" @click="$emit('ok')">
        {{ okText }}
      </el-button>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
:deep(.custom-dialog) {
  .el-dialog__header {
    padding: 10px 20px;

    .el-dialog__title {
      font-size: 17px;
    }

    .el-dialog__headerbtn {
      top: 15px;

      .i {
        font-size: large;
      }
    }
  }

  .el-dialog__footer {
    padding: 10px 20px;
  }
}

.border {
  :deep(.el-dialog__header) {
    border-bottom: 1px solid #e8e8e8;
  }

  :deep(.el-dialog__footer) {
    border-top: 1px solid #e8e8e8;
  }
}
</style>
