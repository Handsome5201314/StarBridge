# 星桥计划

面向孤独症儿童的表达成长游戏 Demo。当前阶段优先跑通黑客松最小闭环：

```text
儿童端游戏练习
  -> 通关获得星星 / 图鉴卡 / 徽章进度
  -> 游戏成就页展示成长
  -> 家长端生成现实陪练建议
  -> 家长标记已练习
  -> 现实练习回流为星光小鹿成长
```

## 本地运行

```bash
npm install
npm run dev
```

默认开发地址为 Vite 输出的本地地址，当前验证使用：

```bash
http://127.0.0.1:5173
```

## 已落地范围

- React + TypeScript + Vite 项目骨架
- React Router 路由：`/game`、`/achievements`、`/parent`、`/level/:levelId`
- 前端 Context store + localStorage demo 进度
- 三个基础小游戏：句子积木、情绪匹配、礼貌语选择
- 通关奖励：星星、图鉴卡、徽章进度、伙伴成长
- 家长端 fallback 陪练建议与“已练习”回流
- 关键文本朗读按钮

## 当前边界

- 不含登录注册、后端服务、真实数据库
- 不接真实 AI API，家长端先使用稳定 fallback 模板
- 不使用倒计时、惩罚、红叉或高压失败反馈
