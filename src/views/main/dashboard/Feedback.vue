<template>
  <div>
    <div>
      <span><b>编号</b>: #{{ feedback.id }}</span
      >，
      <span><b>创建于</b>: {{ $dayjs.utc(feedback.created_at).local().fromNow() }}</span>
    </div>
    <div><b>描述</b>：#{{ feedback.description }}</div>
    <div><b>状态</b>: {{ statusCN[feedback.status] }}</div>
  </div>
  <!-- TODO: 截屏 -->
</template>

<script lang="ts">
import { Component, Prop } from 'vue-property-decorator';
import { CVue } from '@/common';
import { IFeedback } from '@/interfaces';

@Component
export default class Feedback extends CVue {
  @Prop() readonly feedback!: IFeedback;

  private readonly statusCN = {
    sent: '已发送',
    processing: '正在处理',
    closed: '已解决',
    wontfix: '无法解决',
  };
}
</script>
