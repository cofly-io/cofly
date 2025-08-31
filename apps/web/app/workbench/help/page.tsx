"use client";

import React from 'react';
import {
  Header,
  Title,
  SubTitle,
  ContentArea
} from '@repo/ui';

export default function HelpPage() {
  return (
    <>
      <Header>
        <div>
          <Title>帮助中心</Title>
          <SubTitle>获取使用指南和支持</SubTitle>
        </div>
      </Header>
      <ContentArea>
        {/* 帮助中心内容 */}
        <p>帮助中心页面内容</p>
      </ContentArea>
    </>
  );
}