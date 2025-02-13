<script setup lang="ts">
import { computed } from "vue";
import { storeToRefs } from "pinia";
import { message } from "@/utils/message";

import { useOAStoreHook } from "@/store/modules/oa";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";

defineOptions({
  name: "TriggerNodeConfig"
});
const config = computed(() => {
  return selectedNode.value.props;
});

const { design, selectedNode } = storeToRefs(useOAStoreHook());

const forms = computed(() => {
  return design.value.formItems;
});

function addItem(items) {
  if (
    items.length > 0 &&
    (items[items.length - 1].name.trim() === "" ||
      items[items.length - 1].value.trim() === "")
  ) {
    message("请完善之前项后在添加", { customClass: "el", type: "warning" });
    return;
  }
  items.push({ name: "", value: "", isField: true });
}
function delItem(items, index) {
  items.splice(index, 1);
}
</script>

<template>
  <div>
    <el-form label-position="top" label-width="90px">
      <el-form-item label="选择触发的动作" prop="text" class="user-type">
        <el-radio-group v-model="config.type">
          <el-radio label="WEBHOOK">发送网络请求</el-radio>
          <el-radio label="EMAIL">发送邮件</el-radio>
        </el-radio-group>
      </el-form-item>
      <div v-if="config.type === 'WEBHOOK'">
        <el-form-item label="请求地址" prop="text">
          <el-input v-model="config.http.url" placeholder="请输入">
            <template #prepend>
              <el-select
                v-model="config.http.method"
                style="width: 85px"
                placeholder="URL"
              >
                <el-option label="GET" value="GET" />
                <el-option label="POST" value="POST" />
                <el-option label="PUT" value="PUT" />
                <el-option label="DELETE" value="DELETE" />
              </el-select>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item label="Header请求头" prop="text">
          <template #label>
            <div>
              <span style="margin-right: 10px">Header请求头</span>
              <el-button type="text" @click="addItem(config.http.headers)">
                + 添加</el-button
              >
            </div>
          </template>

          <div
            v-for="(header, index) in config.http.headers"
            :key="header.name"
            class="flex items-center"
          >
            -
            <el-input
              v-model="header.name"
              placeholder="参数名"
              style="width: 100px"
            />
            <el-radio-group v-model="header.isField" style="margin: 0 5px">
              <el-radio-button :label="true">表单</el-radio-button>
              <el-radio-button :label="false">固定</el-radio-button>
            </el-radio-group>
            <el-select
              v-if="header.isField"
              v-model="header.value"
              style="width: 180px"
              placeholder="请选择表单字段"
            >
              <el-option
                v-for="form in forms"
                :key="form.id"
                :label="form.title"
                :value="form.title"
              />
            </el-select>
            <el-input
              v-else
              v-model="header.value"
              placeholder="请设置字段值"
              style="width: 180px"
            />
            <component
              :is="useRenderIcon('delete')"
              class="el-icon-delete"
              style="margin-left: 5px; color: #c75450; cursor: pointer"
              @click="delItem(config.http.headers, index)"
            />
          </div>
        </el-form-item>
        <el-form-item label="Header请求参数" prop="text">
          <template #label>
            <div>
              <span style="margin-right: 10px">Header请求参数 </span>
              <el-button
                style="margin-right: 20px"
                type="text"
                @click="addItem(config.http.params)"
              >
                + 添加</el-button
              >
              <span>参数类型 - </span>
              <el-radio-group
                v-model="config.http.contentType"
                style="margin: 0 5px"
              >
                <el-radio-button label="JSON">json</el-radio-button>
                <el-radio-button label="FORM">form</el-radio-button>
              </el-radio-group>
            </div>
          </template>

          <div
            v-for="(param, index) in config.http.params"
            :key="param.name"
            class="flex items-center"
          >
            -
            <el-input
              v-model="param.name"
              placeholder="参数名"
              style="width: 100px"
            />
            <el-radio-group v-model="param.isField" style="margin: 0 5px">
              <el-radio-button :label="true">表单</el-radio-button>
              <el-radio-button :label="false">固定</el-radio-button>
            </el-radio-group>
            <el-select
              v-if="param.isField"
              v-model="param.value"
              style="width: 180px"
              placeholder="请选择表单字段"
            >
              <el-option
                v-for="form in forms"
                :key="form.id"
                :label="form.title"
                :value="form.title"
              />
            </el-select>
            <el-input
              v-else
              v-model="param.value"
              placeholder="请设置字段值"
              style="width: 180px"
            />
            <component
              :is="useRenderIcon('delete')"
              class="el-icon-delete"
              style="margin-left: 5px; color: #c75450; cursor: pointer"
              @click="delItem(config.http.params, index)"
            />
          </div>
          <div />
        </el-form-item>
        <el-form-item label="请求结果处理" prop="text">
          <template #label>
            <div>
              <span>请求结果处理</span>
              <span style="margin-left: 20px">自定义脚本: </span>
              <el-switch v-model="config.http.handlerByScript" />
            </div>
          </template>

          <span v-if="config.http.handlerByScript" class="item-desc">
            👉 返回值为 ture 则流程通过，为 false 则流程将被驳回
            <div>
              支持函数
              <span style="color: dodgerblue"
                >setFormByName(
                <span style="color: #939494">'表单字段名', '表单字段值'</span>
                )</span
              >
              可改表单数据
            </div>
          </span>
          <span v-else class="item-desc">👉 无论请求结果如何，均通过</span>
          <div v-if="config.http.handlerByScript">
            <div>
              <span>请求成功😀：</span>
              <el-input
                v-model="config.http.success"
                type="textarea"
                :rows="3"
              />
            </div>
            <div>
              <span>请求失败😥：</span>
              <el-input v-model="config.http.fail" type="textarea" :rows="3" />
            </div>
          </div>
        </el-form-item>
      </div>
      <div v-else-if="config.type === 'EMAIL'">
        <el-form-item label="邮件主题" prop="text">
          <el-input v-model="config.email.subject" placeholder="请输入" />
        </el-form-item>
        <el-form-item label="收件方" prop="text">
          <el-select
            v-model="config.email.to"
            style="width: 100%"
            filterable
            multiple
            allow-create
            default-first-option
            placeholder="请输入"
          >
            <el-option
              v-for="item in config.email.to"
              :key="item"
              :label="item"
              :value="item"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="邮件正文" prop="text">
          <el-input
            v-model="config.email.content"
            type="textarea"
            :rows="4"
            placeholder="邮件内容，支持变量提取表单数据 ${表单字段名} "
          />
        </el-form-item>
      </div>
    </el-form>
  </div>
</template>

<style lang="scss" scoped>
.item-desc {
  color: #939494;
}
</style>
