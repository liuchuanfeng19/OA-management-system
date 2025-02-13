<script setup lang="ts">
import { storeToRefs } from "pinia";
import { ref, computed, watch } from "vue";

import { useOAStoreHook } from "@/store/modules/oa";
defineOptions({
  name: "FormAuthorityConfig"
});

const permSelect = ref("");
const { selectedNode, design } = storeToRefs(useOAStoreHook());

const nowNode = computed(() => {
  return selectedNode.value;
});
const formData = computed(() => {
  return design.value.formItems;
});
const formPerms = computed(() => {
  return selectedNode.value.props.formPerms;
});

watch(formPerms, () => {
  const set = new Set(formPerms.value.map(f => f.perm));
  permSelect.value = set.size === 1 ? set.values()[0] : "";
});

function allSelect(type) {
  permSelect.value = type;
  formPerms.value.forEach(f => (f.perm = type));
}
function formPermsLoad(oldPermMap, forms) {
  forms.forEach(form => {
    if (form.name === "SpanLayout") {
      formPermsLoad(oldPermMap, form.props.items);
    } else {
      //刷新名称
      const old = oldPermMap.get(form.id);
      if (old) {
        old.title = form.title;
        old.required = form.props.required;
        formPerms.value.push(old);
      } else {
        formPerms.value.push({
          id: form.id,
          title: form.title,
          required: form.props.required,
          perm: selectedNode.value.type === "ROOT" ? "E" : "R"
        });
      }
    }
  });
}

//备份
const map = new Map();
formPerms.value.forEach(v => map.set(v["id"], v));
const oldPermMap = map;
//重新清空，按顺序加载权限
formPerms.value.length = 0;
formPermsLoad(oldPermMap, formData.value);
</script>

<template>
  <div>
    <el-table :data="formPerms" border style="width: 100%">
      <el-table-column prop="title" show-overflow-tooltip label="表单字段">
        <template v-slot="scope">
          <span v-if="scope.row.required" style="color: #c75450"> * </span>
          <span>{{ scope.row.title }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="readOnly" label="只读" width="80">
        <template #header>
          <el-radio v-model="permSelect" label="R" @change="allSelect('R')"
            >只读</el-radio
          >
        </template>
        <template #default="{ row }">
          <el-radio v-model="row.perm" label="R" :name="row.id" />
        </template>
      </el-table-column>
      <el-table-column
        v-if="nowNode.type !== 'CC'"
        prop="editable"
        label="可编辑"
        width="90"
      >
        <template #header>
          <el-radio v-model="permSelect" label="E" @change="allSelect('E')"
            >可编辑</el-radio
          >
        </template>
        <template #default="{ row }">
          <el-radio v-model="row.perm" label="E" :name="row.id" />
        </template>
      </el-table-column>
      <el-table-column prop="hide" label="隐藏" width="80">
        <template #header>
          <el-radio v-model="permSelect" label="H" @change="allSelect('H')"
            >隐藏</el-radio
          >
        </template>
        <template #default="{ row }">
          <el-radio v-model="row.perm" label="H" :name="row.id" />
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-table__row) {
  & > td:first-child {
    .cell {
      text-align: left;
    }
  }

  .cell {
    text-align: center;
  }

  .el-radio__label {
    display: none;
  }
}
</style>
