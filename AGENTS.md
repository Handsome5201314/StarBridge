# AGENTS.md｜星桥计划代码落地协作说明

> 项目阶段：先搭大框架，页面细节后续迭代。  
> 目标：让任何 AI Coding Agent / 团队成员进入项目后，都能优先完成“可跑通的产品闭环”，而不是陷入单页视觉细节。

---

## 1. 项目一句话定位

**星桥计划**是一个面向孤独症儿童的表达成长游戏。它通过“电子伙伴 + 集卡 + 闯关 + 家长端现实练习建议”，帮助孩子先学会表达自己的需求、情绪和社交意图，再把游戏中学到的能力迁移到现实生活中。

产品核心不是单纯做儿童游戏，而是做一条完整的成长闭环：

```text
儿童端游戏练习
  → 通关获得星星 / 图鉴卡 / 情绪徽章
  → 伙伴成长
  → 家长端收到 AI 陪练建议
  → 家长在现实生活中继续练习
  → 家长反馈打卡
  → 现实练习回流儿童端，带来额外成长奖励
```

---

## 2. 当前版本优先级

当前不是精修完整产品，而是先完成一个 **黑客松 Demo 可运行骨架**。

### 最高优先级

必须先跑通这条最小闭环：

```text
首页 / 游戏世界
  → 进入一个关卡
  → 完成小游戏
  → 掉落星星 / 图鉴卡 / 徽章进度
  → 更新游戏成就页
  → 家长端生成今日学习摘要与 AI 陪练建议
  → 家长点击“已练习”
  → 伙伴获得额外成长反馈
```

### 暂不追求

以下内容先不要做重：

- 登录注册
- 真实数据库
- 多账号系统
- 复杂 AI 多轮对话
- 真实语音识别
- 复杂动画系统
- 过多岛屿 / 过多关卡
- 每个页面的最终视觉细节

---

## 3. 产品页面结构

当前产品先分为三大页面。

### 3.1 儿童端游戏主页面

路由建议：`/` 或 `/game`

功能定位：

- 展示游戏世界地图
- 展示三个岛屿入口
- 展示今日目标
- 展示当前关卡
- 展示星光小鹿 / 星桥小助手
- 点击“开始今日任务”进入当前推荐关卡

必须包含的三个岛屿：

| 岛屿 | 游戏机制 | 训练目标 |
|---|---|---|
| 句子积木岛 | 句子积木 | 练习完整表达需求 / 问候 / 求助 |
| 情绪消消乐湖 | 情绪消消乐 | 识别、匹配、理解情绪 |
| 礼貌语跑酷镇 | 礼貌语收集跑酷 | 练习请、谢谢、对不起、轮流等社交礼貌语 |

页面骨架即可，视觉细节后续完善。

---

### 3.2 游戏成就页

路由建议：`/achievements`

功能定位：

- 展示今日成就
- 展示星星数量
- 展示已完成关卡
- 展示图鉴收集
- 展示三个岛屿对应的徽章进度
- 展示伙伴成长阶段

建议模块：

```text
AchievementPage
├── TodayAchievementPanel
├── BadgeWall
│   ├── 句子积木岛徽章
│   ├── 情绪消消乐湖徽章
│   └── 礼貌语跑酷镇徽章
├── CollectionPreview
└── BuddyGrowthPanel
```

徽章规则建议：

- 每个岛屿对应一个情绪 / 社交能力徽章。
- 完成该岛屿基础、中等、进阶三个难度后，徽章完全解锁。
- Demo 可先用进度条或 `1/3`、`2/3`、`3/3` 表示。

---

### 3.3 家长端页面

路由建议：`/parent`

功能定位：

- 展示孩子今天在游戏中学会了什么
- AI 根据今日游戏表现生成现实生活中的陪练建议
- 家长可以在建议基础上继续训练孩子能力
- 家长完成现实练习后打卡
- 打卡结果回流到儿童端，触发伙伴额外成长

建议模块：

```text
ParentPage
├── TodayLearningSummary
├── AIPracticeSuggestions
├── TodayProgressCard
├── ParentFeedbackPanel
└── RealLifePracticeHistory  // 可后续再做
```

AI 陪练建议示例：

```text
基于孩子今天完成的“句子积木岛 - 基础关”，建议家长在零食时间鼓励孩子主动表达需求。
做法：先提供两个明确选项，如“饼干”或“苹果”，等待孩子说出或选择“我要饼干”。
家长回应：及时给予，并用温和语气复述：“你说了我要饼干，我听见了。”
```

---

## 4. 三个游戏机制的代码边界

三个小游戏都必须遵守统一接口，方便后续替换玩法细节。

### 4.1 统一关卡组件接口

建议每个游戏组件接收：

```ts
export interface LevelComponentProps {
  levelId: string;
  difficulty: 'basic' | 'medium' | 'advanced';
  onComplete: (result: LevelResult) => void;
  onExit?: () => void;
}

export interface LevelResult {
  levelId: string;
  islandId: IslandId;
  difficulty: Difficulty;
  starsEarned: number;
  cardsEarned: string[];
  skillTags: SkillTag[];
  completedAt: string;
}
```

### 4.2 句子积木

组件建议：`SentenceBlocksGame`

训练内容：

- 基础：按顺序拼出短句，如“我要 饼干”。
- 中等：在多个词块中选择正确表达，如“我想要 + 玩具”。
- 进阶：根据情境拼出更完整句子，如“你好，我可以一起玩吗？”

交互原则：

- 不要倒计时。
- 不要红叉。
- 答错只提示“我们再试一次”。
- 支持语音朗读句子。

---

### 4.3 情绪消消乐

组件建议：`EmotionMatchGame`

训练内容：

- 基础：相同情绪图标配对，如开心-开心。
- 中等：表情与情绪词配对，如哭脸-难过。
- 进阶：情境与情绪配对，如“玩具坏了”-难过。

注意：

- 虽然叫“消消乐”，但不要做快速连击和倒计时。
- 更像温和版匹配 / 消除。
- 目标是识别与理解情绪，不是追求刺激。

---

### 4.4 礼貌语收集跑酷

组件建议：`PoliteRunnerGame`

训练内容：

- 基础：收集正确礼貌语，如“请”“谢谢”。
- 中等：根据场景选择礼貌语，如拿到帮助后选择“谢谢”。
- 进阶：避开不合适表达，选择完整礼貌句，如“请帮帮我”。

注意：

- 跑酷只是轻量形式，不要加入速度压力。
- 移动速度固定且缓慢。
- 可用横向移动 / 点击选择代替真实高压跑酷。
- 没有失败惩罚，只做温和反馈。

---

## 5. 数据模型建议

先使用前端 mock 数据 + Zustand / Redux / Context 全局状态即可。

### 5.1 基础类型

```ts
export type IslandId = 'sentence_blocks' | 'emotion_match' | 'polite_runner';
export type Difficulty = 'basic' | 'medium' | 'advanced';

export type SkillTag =
  | 'express_need'
  | 'greeting'
  | 'ask_help'
  | 'recognize_emotion'
  | 'understand_others'
  | 'use_polite_words'
  | 'take_turns';
```

### 5.2 岛屿配置

```ts
export interface IslandConfig {
  id: IslandId;
  name: string;
  description: string;
  route: string;
  badgeId: string;
  themeSkill: SkillTag;
  levels: LevelConfig[];
}

export interface LevelConfig {
  id: string;
  islandId: IslandId;
  title: string;
  difficulty: Difficulty;
  targetSkill: SkillTag;
  rewardCardIds: string[];
  rewardStars: number;
}
```

### 5.3 玩家进度

```ts
export interface PlayerProgress {
  totalStars: number;
  todayStars: number;
  completedLevelIds: string[];
  collectedCardIds: string[];
  badgeProgress: Record<string, number>; // 0-3
  buddyGrowth: {
    stage: number;
    exp: number;
  };
  todaySkillTags: SkillTag[];
  realLifeTasks: RealLifeTask[];
}
```

### 5.4 现实任务

```ts
export interface RealLifeTask {
  id: string;
  sourceLevelId: string;
  title: string;
  skillTag: SkillTag;
  suggestion: string;
  parentTip: string;
  status: 'pending' | 'done';
  createdAt: string;
  completedAt?: string;
}
```

---

## 6. 推荐项目目录

以 React + TypeScript + Vite 为默认方向。

```text
src/
├── app/
│   ├── App.tsx
│   ├── router.tsx
│   └── providers.tsx
│
├── pages/
│   ├── GameHomePage.tsx
│   ├── AchievementsPage.tsx
│   ├── ParentPage.tsx
│   └── LevelPage.tsx
│
├── features/
│   ├── game-map/
│   │   ├── GameMap.tsx
│   │   └── IslandCard.tsx
│   │
│   ├── achievements/
│   │   ├── TodayAchievementPanel.tsx
│   │   ├── BadgeWall.tsx
│   │   ├── CollectionPreview.tsx
│   │   └── BuddyGrowthPanel.tsx
│   │
│   ├── parent/
│   │   ├── TodayLearningSummary.tsx
│   │   ├── AIPracticeSuggestions.tsx
│   │   └── ParentFeedbackPanel.tsx
│   │
│   ├── levels/
│   │   ├── SentenceBlocksGame.tsx
│   │   ├── EmotionMatchGame.tsx
│   │   └── PoliteRunnerGame.tsx
│   │
│   └── buddy/
│       ├── Buddy.tsx
│       └── BuddySpeechBubble.tsx
│
├── shared/
│   ├── components/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── SpeakButton.tsx
│   │   ├── ProgressBar.tsx
│   │   └── PageShell.tsx
│   │
│   ├── data/
│   │   ├── islands.ts
│   │   ├── levels.ts
│   │   ├── cards.ts
│   │   ├── badges.ts
│   │   └── practiceSuggestions.ts
│   │
│   ├── store/
│   │   └── useGameStore.ts
│   │
│   ├── types/
│   │   └── game.ts
│   │
│   └── utils/
│       ├── speech.ts
│       ├── rewards.ts
│       └── practice.ts
│
└── styles/
    ├── globals.css
    └── theme.css
```

---

## 7. 路由建议

```ts
const routes = [
  { path: '/', element: <GameHomePage /> },
  { path: '/achievements', element: <AchievementsPage /> },
  { path: '/parent', element: <ParentPage /> },
  { path: '/level/:levelId', element: <LevelPage /> },
];
```

导航关系：

```text
GameHomePage
  → LevelPage
  → 完成后更新 store
  → 可跳转 AchievementsPage
  → ParentPage 读取今日学习结果
```

---

## 8. 全局状态必须先搭

优先写 `useGameStore.ts`，不要等页面做完再补。

必须提供这些 action：

```ts
completeLevel(result: LevelResult): void;
collectCards(cardIds: string[]): void;
addStars(count: number): void;
updateBadgeProgress(islandId: IslandId, difficulty: Difficulty): void;
generateRealLifeTask(result: LevelResult): void;
completeRealLifeTask(taskId: string): void;
addBuddyExp(exp: number): void;
resetDemoProgress(): void;
```

核心原则：

- 页面只负责展示和触发事件。
- 奖励计算放在 `shared/utils/rewards.ts`。
- 家长建议生成放在 `shared/utils/practice.ts`。
- 不要在页面组件里散落业务规则。

---

## 9. AI 使用边界

当前代码可以先写本地 fallback，不急着接真实 API。

### 可以用 AI 的地方

- 家长端生成陪练建议
- 家长端生成社交故事
- 宠物鼓励语的轻量变化

### 不应该用 AI 的地方

- 核心图卡发声
- 正确答案判断
- 儿童端关键反馈
- 任何需要稳定、确定、可预测的表达训练内容

### 建议接口

```ts
export interface PracticeSuggestionInput {
  completedLevelIds: string[];
  skillTags: SkillTag[];
  collectedCardIds: string[];
}

export interface PracticeSuggestion {
  id: string;
  title: string;
  scenario: string;
  steps: string[];
  parentTip: string;
  relatedSkill: SkillTag;
}
```

先实现：

```ts
getFallbackPracticeSuggestions(input): PracticeSuggestion[]
```

后续再替换为：

```ts
getAIPracticeSuggestions(input): Promise<PracticeSuggestion[]>
```

并保留 fallback：

```ts
try {
  return await getAIPracticeSuggestions(input);
} catch {
  return getFallbackPracticeSuggestions(input);
}
```

---

## 10. 感官友好与可访问性规则

所有页面和小游戏都必须遵守：

- 不使用倒计时压迫。
- 不使用突然闪烁。
- 不使用刺耳音效。
- 不用红叉、扣分、失败惩罚。
- 答错文案统一使用温和提示，例如“我们再试一次”。
- 动效要慢、柔和、可预期。
- 所有关键文字都应支持朗读。
- 颜色低饱和、对比清晰但不刺激。
- 页面元素不要太密，优先大按钮、大卡片、大间距。
- 所有任务都允许跳过或重复。

`SpeakButton` 是全局必备组件。

建议实现：

```ts
export function speak(text: string) {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'zh-CN';
  utterance.rate = 0.85;
  utterance.pitch = 1;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}
```

---

## 11. UI 风格方向

当前视觉方向：

- 横版 Web / 平板优先
- 手工纸艺 / 拼贴风
- 柔和蓝天背景
- 低饱和暖色
- 缝线卡片
- 星星、桥、地图、叶子、云朵元素
- 星光小鹿作为陪伴角色

代码阶段先用 CSS 变量锁定主题，不要过早堆图片资源。

建议变量：

```css
:root {
  --color-bg: #d7ecf7;
  --color-paper: #fff6e6;
  --color-paper-deep: #f1dfc1;
  --color-primary: #f2b84b;
  --color-primary-deep: #c9792e;
  --color-blue: #79bde0;
  --color-green: #96c38a;
  --color-text: #4a3326;
  --radius-card: 24px;
  --shadow-soft: 0 10px 24px rgba(80, 60, 40, 0.14);
}
```

---

## 12. Demo 初始数据建议

### 岛屿

```ts
export const islands = [
  {
    id: 'sentence_blocks',
    name: '句子积木岛',
    description: '用词语积木拼出自己的想法',
    badgeId: 'friendly_expression_badge',
    themeSkill: 'express_need',
  },
  {
    id: 'emotion_match',
    name: '情绪消消乐湖',
    description: '认识开心、难过、生气和平静',
    badgeId: 'emotion_helper_badge',
    themeSkill: 'recognize_emotion',
  },
  {
    id: 'polite_runner',
    name: '礼貌语跑酷镇',
    description: '收集请、谢谢和对不起',
    badgeId: 'polite_friend_badge',
    themeSkill: 'use_polite_words',
  },
];
```

### 难度

每个岛屿先配置 3 关：

```text
basic    基础
medium   中等
advanced 进阶
```

Demo 第一阶段只需要每个岛屿至少能完成一关。完整三难度可用 mock 状态展示。

---

## 13. 开发顺序建议

严格按这个顺序写，不要先美化。

### 第 1 步：项目骨架

- Vite + React + TypeScript
- React Router
- Zustand 或 Context
- 全局 CSS 变量
- 三个页面空壳
- LevelPage 动态读取 levelId

### 第 2 步：全局状态

- 初始 mock 数据
- completeLevel
- addStars
- collectCards
- updateBadgeProgress
- generateRealLifeTask
- completeRealLifeTask

### 第 3 步：跑通一个关卡

先做最简单的 `SentenceBlocksGame`：

```text
显示题目
拖 / 点词块
拼出句子
点击完成
触发 onComplete
```

### 第 4 步：成就页读状态

- 今日星星数
- 已完成关卡数
- 图鉴卡数
- 徽章进度
- 伙伴成长值

### 第 5 步：家长端读状态

- 根据 todaySkillTags 展示学习摘要
- 根据 todaySkillTags 生成 fallback 陪练建议
- 家长点击“已练习”
- 伙伴加额外经验

### 第 6 步：补另外两个小游戏

- EmotionMatchGame
- PoliteRunnerGame

### 第 7 步：视觉统一

- 替换卡片样式
- 地图样式
- 纸艺风背景
- 星光小鹿素材
- 动效与过渡

---

## 14. Coding Agent 行为规则

当你作为 Coding Agent 修改本项目时，请遵守：

1. **先保证闭环能跑通，再做页面美化。**
2. **不要引入不必要的复杂依赖。**
3. **不要添加登录、数据库、后端服务，除非明确要求。**
4. **所有新增业务规则必须集中在 store / utils / mock data 中。**
5. **页面组件尽量保持展示层，不要写复杂业务逻辑。**
6. **所有小游戏都必须通过统一 `onComplete(result)` 回传结果。**
7. **所有儿童端反馈必须温和、稳定、可预测。**
8. **AI 相关能力必须有本地 fallback。**
9. **不要把真实 AI 输出用于判断儿童答案对错。**
10. **如果页面细节未定，优先使用占位卡片，但保留正确模块边界。**

---

## 15. 当前待完善问题

页面细节后续还需要继续明确：

- 每个岛屿的完整关卡题库
- 三档难度的具体题目数量
- 图鉴卡内容与视觉
- 三个徽章的名称、图案、解锁条件
- 伙伴成长阶段与动画
- 家长端 AI 建议的语气规范
- 家长反馈后的儿童端奖励表现
- 最终 UI 资源切图与组件样式

在这些细节未定前，代码中应使用 mock 数据和清晰 TODO 注释占位。

---

## 16. 最小可验收标准

当前阶段完成后，应至少能做到：

- 打开首页看到三个岛屿。
- 点击开始任务进入关卡。
- 完成关卡后获得星星和卡片。
- 成就页能显示进度变化。
- 家长端能根据今日技能显示陪练建议。
- 家长点击“已练习”后，伙伴成长值增加。
- 关键文字可以被朗读。
- 全流程无需登录、无需后端、无需真实数据库。

---

## 17. 推荐提交粒度

建议按以下 commit 拆分：

```text
chore: initialize react vite project structure
feat: add routes and page shells
feat: add game store and mock data
feat: implement sentence blocks demo level
feat: connect level completion rewards
feat: add achievements dashboard
feat: add parent practice suggestions page
feat: add speech synthesis helper
style: apply soft papercraft theme tokens
```

---

## 18. 项目最终判断标准

这个项目的 Demo 成功，不是因为页面有多完整，而是因为它能清楚展示：

```text
孩子在游戏中学会表达
  → 游戏记录成长
  → 家长知道今天该怎么练
  → 现实练习回流游戏
```

只要这条链路跑通，后续页面细节、题库、美术和 AI 能力都可以继续迭代。
