# Marketplace 发布页 - 需求拆解文档

## 产品概述

- **产品类型**: 通用类型（兜底）—— 复刻/发布类需求
- **场景类型**: <scene_type>prototype-app</scene_type>
- **分类说明**: 本需求为通用类型兜底。用户诉求为「发布一下」并附带了一份完整的 `marketplace.html` 附件（含 `lockSpec: true` 锁定规格标记），核心意图是**将附件中的 Marketplace 页面发布为可访问的 Web 应用**
- **参照类型**: 复刻场景（以附件内容为唯一蓝本）+ 类型 4（展示/广场页）的区块拆分方法
- **目标用户**: 浏览该 Marketplace 页面的访客（查看市场中的商品/应用/插件条目）
- **核心价值**: 忠实还原附件 `marketplace.html` 的页面结构与内容，发布为可直接访问的线上页面
- **界面语言**: 中文（以附件实际内容为准）
- **主题偏好**: 以附件实际样式为准（复刻场景不自行指定 light/dark）
- **导航模式**: 以附件实际结构为准（marketplace 类页面通常为单页 + Topbar，最终以 design-agent 读取附件后的实际结构为准）

> 🔴 **复刻铁律（因 lockSpec: true）**:
> - 附件 `marketplace.html`（attachment_id: `70db4122-b9e7-4f24-a68b-9b1062cd3bbd`，已保存至 `.agent/conversation_4m1c2u0hwbf3a/attachments/marketplace.html`）是本需求的**唯一真相源**
> - 用户已锁定规格：**禁止自由发挥、禁止增删功能、禁止替换内容**，下游 design-agent 阶段 MUST 先通过 `summarize_attachment_or_file` 工具读取附件全文，再按附件实际结构逐区块复刻
> - 本文档中的页面/区块规划为**基于附件名的最小推测框架**，一切以附件实际内容为准；若附件实际结构与本文档冲突，以附件为准
> - 用户诉求「发布」= 生成可运行的应用并发布上线，不需要额外的“发布管理”功能

---

## 需求澄清

- **用户原话核心**: 「发布一下」（+ 附件 marketplace.html + lockSpec:true）
- **使用场景**: 用户已完成 marketplace 页面的制作（体现为附件 HTML），希望将其发布为可访问的 Web 应用
- **交付物形态**: 单页 Web 应用，内容与结构与附件一致
- **推测依据**: 附件名为 marketplace.html，推测是一个市场/广场类页面（商品/应用/插件列表 + 详情入口）。由于当前阶段无法读取附件内容，仅给出最小复刻框架，**不预设具体业务字段**，全部待 design-agent 读取附件后填充

---

## 页面结构

> 以附件实际结构为准，以下为 marketplace 类页面的典型骨架（供 design-agent 对照附件校验，附件中有则复刻、没有则不造）

**页面文件**: `MarketplacePage.tsx`

| 页面/区块 | 说明 | 文件名 |
|-----------|------|--------|
| Marketplace 主页 | 完整复刻附件页面：顶部栏 + 主视觉/标题区 + 市场条目列表（卡片/表格）+ 页脚（以上区块以附件实际存在为准） | `MarketplacePage.tsx` |

---

## 页面布局建议

- **布局模式**: 以附件实际布局为准（marketplace 类页面通常为「Topbar + 卡片网格/列表」结构，design-agent 读取附件后按原布局还原）
- **视觉重心**: 市场条目列表/卡片（页面的核心内容承载）
- **结果承载区**: 市场条目列表区；初始态即展示附件中的完整条目数据（复刻场景无空状态，数据一次性全量呈现）

---

## 数据来源声明

| 数据/操作 | 来源类型 | 实现要求 | mock 兜底 |
|---|---|---|---|
| 页面结构 / 样式 / 文案 | real-file | 由 design-agent 阶段读取附件 `marketplace.html`（attachment_id: 70db4122-b9e7-4f24-a68b-9b1062cd3bbd）提取页面结构、样式与文案，忠实复刻；lockSpec 锁定，禁止改动 | 无（必须以附件为准，不可凭空编造） |
| 市场条目数据（商品/应用/插件列表） | demo-mock | 数据内容 MUST 从附件 marketplace.html 中提取（原样迁移到 `src/data/*.ts`），每条记录保留附件中的原始字段与值；严禁编造附件中不存在的条目 | ✅ 数据本身即来自附件，非编造 mock |
| 条目交互（hover / 点击详情等） | demo-mock | 复刻附件中已有的交互行为；附件中不存在的交互不主动添加（lockSpec） | 无 |

> 🔴 复刻场景说明：所有内容以附件为唯一数据源，`demo-mock` 行的语义是「将附件中的静态内容迁移为代码内常量」，**不是**凭空生成示例数据。

---

## 功能列表

- **页面/区块**: Marketplace 主页（`MarketplacePage.tsx`）
  - **页面目标**: 完整复刻并发布附件 marketplace.html，访客可浏览市场内容
  - **功能点**（以附件实际内容为准，以下为复刻交付的验收要点）:
    - 结构复刻: 按 design-agent 读取附件后识别的区块顺序，逐区块还原页面结构（顶部栏 / 标题区 / 条目列表 / 页脚等）
    - 条目列表渲染: 将附件中的市场条目数据迁移为 `src/data/` 常量并循环渲染，样式与附件一致
    - 附件内已有交互还原: 附件中存在的 hover 效果、点击行为、锚点跳转等按原样实现
    - 响应式适配: 在桌面端还原附件布局的基础上保证基本可用（以附件本身设定为准，不过度扩展）

---

## 质量基线确认

- [ ] 核心功能完整可用（页面可访问、内容完整呈现）
- [ ] 有基本的视觉层次（复刻附件原有样式，非纯文字堆砌）
- [ ] 附件内已有交互有反馈
- [ ] 边界状态有处理（条目列表渲染异常时页面不白屏）
- [x] 本需求为通用类型兜底（复刻/发布），已按最简方案规划：**单页、无新增功能、无登录注册、无主题切换，一切以附件 marketplace.html 为准（lockSpec: true）**

-------

<scene_type>prototype-app</scene_type>

# UI 设计指南

## 1. 设计推导依据

- **参考意图**: Free Direction —— 附件为 marketplace.html 成品稿，本次请求为“发布”（lockSpec 锁定规格），设计指南延续并固化市集页面的既有方向，不引入新的视觉变量。
- **核心情绪 / 应用类型**: 应用市场 / 插件广场（营销 + 内容分发），核心情绪是“可探索、可信、被吸引”——让用户在琳琅满目的卡片中快速建立信任并产生点击欲。
- **独特记忆点**: 每张市集卡片以“封面即橱窗”的方式呈现——分类专属的抽象生成视觉 + 统一的青色描边悬浮态，像一条精心策展的 AI 长廊，而不是通用 SaaS 表格。

## 2. Art Direction

- **方向名**: 策展橱窗（Curated Gallery）
- **Design Style**: Swiss Minimalist 网格秩序 + Soft Blocks 柔色块 —— 网格保证多卡片浏览的扫描效率，柔色块与图像封面承载市集的探索感和商品性。
- **DNA 参数**: 圆角 subtle→soft（卡片 `rounded-xl`，按钮 `rounded-md`）；阴影 layered（卡片 `shadow-sm`，悬浮 `shadow-md` + 边框亮起）；间距 standard（`gap-4`/`p-6`）；字体方向：几何无衬线 display + 清晰中文正文；装饰手法：细网格分隔线、分类色角标、封面图占卡片上 60%。
- **应用类型**: Content / 营销分发 —— 瀑布感卡片网格 + 顶部筛选区，浏览优先。

## 3. Color System

**色彩关系**: 深青主色 + 同色极浅青反馈底 + 微冷纸白背景 + 近墨深蓝灰文字。
**配色设计理由**: primary 只承担“上架 CTA、分类激活、卡片悬浮描边”三件事；bg 用微冷白与纯白卡片形成一层微妙景深；accent 承接全部 hover/selected/Skeleton，避免主色滥用。
**主色推导**: 市集是“挑选与获得”的场景，深青（电光青偏深）既有 AI 工具的精密感，又比默认蓝更克制独特，与蒸珑 AI 的技术品牌气质对齐。
**使用比例**: 60% 中性（白/冷白/深灰文字）/ 30% 辅助（浅青底、边框、封面图）/ 10% primary。

| 角色 | CSS 变量 | Tailwind Class | HSL 值 | 设计说明 |
|---|---|---|---|---|
| bg | `--background` | `bg-background` | hsl(180 20% 97%) | 微冷白，市集地面 |
| card | `--card` | `bg-card` | hsl(0 0% 100%) | 纯白卡片，橱窗展台 |
| text | `--foreground` | `text-foreground` | hsl(215 28% 12%) | 近墨深蓝灰，标题正文 |
| textMuted | `--muted-foreground` | `text-muted-foreground` | hsl(215 12% 45%) | 描述、作者、下载量 |
| primary | `--primary` | `bg-primary` / `text-primary` | hsl(187 85% 36%) | 深青，CTA/激活/悬浮描边 |
| primaryForeground | `--primary-foreground` | `text-primary-foreground` | hsl(180 40% 98%) | primary 上的文字 |
| accent | `--accent` | `bg-accent` | hsl(186 45% 94%) | hover/选中浅青底、Skeleton |
| accentForeground | `--accent-foreground` | `text-accent-foreground` | hsl(190 70% 22%) | accent 上的图标文字 |
| border | `--border` | `border-border` | hsl(214 15% 89%) | 卡片、筛选器边界 |

**语义色提示**: 成功（已安装/在线）hsl(160 65% 36%)，警告（待审核）hsl(38 90% 48%)，错误（下架/失败）hsl(354 68% 46%)；三态均以 10% 透明度同色做 bg、40% 做边框、全值做文字；三者饱和度与 primary（85%/36%）保持在 ±15% 区间，均为冷调或中性暖，不出现刺眼报警感。

## 4. 字体与节奏

- **font-display**: Space Grotesk —— 几何切角感强化“AI 应用橱窗”的标题气质，适合英文品名。
- **font-body**: Noto Sans SC —— 中文描述、标签、筛选文案清晰可读。
- **字号**: H1 text-5xl；分类 H2 text-2xl；卡片标题 text-base font-semibold；描述/元信息 text-sm text-muted-foreground。
- **圆角**: 卡片与封面 `rounded-xl`，按钮/标签 `rounded-md`，pill 标签 `rounded-full` —— 大容器柔、小控件利，形成层级对比。

## 5. 全局布局契约

- **Reference Layout Use**: 按需求结构推导——顶部导航 + Hero 精选横幅 + 分类筛选 + 卡片网格。
- **Page / Section Order**: Nav → Hero 精选（1-3 个主推应用）→ 分类 Tab / 搜索筛选 → 应用卡片网格（分类分组）→ 底部“提交上架”CTA 区 → Footer。
- **Standard Content Zone**: `max-w-6xl mx-auto`（市集卡片网格需要横向密度）。
- **Shell / Frame Alignment**: 同宽——导航、Hero、网格、Footer 共享同一 max-w 与左右 padding。
- **Padding & Rhythm**: `px-4 md:px-6 lg:px-8`，区块间 `py-12 md:py-16`，卡片网格 `gap-5`。
- **Full-bleed Zones**: Hero 背景可全宽（含浅青渐变/网格纹理），内部文案与 CTA 仍受 max-w-6xl 约束。
- **Local Narrowing**: 应用详情/上架表单在容器内收窄至 `max-w-2xl mx-auto`。
- **Overflow Strategy**: 分类标签行、横向“编辑推荐”列表用 `overflow-x-auto` + 隐藏滚动条，不为此放大全局 max-w。
- **Flexibility Boundary**: 移动端卡片网格从 4 列降为 2 列→1 列，padding 可减至 `px-4`；不允许改 max-w、圆角、主色与阴影语言。

## 6. 视觉与动效

- **装饰**: 细网格纹理背景（Hero 区）、分类色小圆点角标。
- **阴影/边界**: 中 —— 卡片常态 `shadow-sm` + border，悬浮时 `shadow-md` 且 border 过渡为 primary。
- **动效**: 精致 —— 卡片 hover 上浮 `translate-y-[-2px]` + 边框亮起（180ms ease-out）；分类切换时网格 `opacity` 渐入（200ms）；Skeleton 用 accent 底的呼吸脉冲；无大幅位移动画。

## 7. 组件原则

- 卡片：封面图（16:10）+ 标题 + 一句话描述 + 作者 + 安装量 + 分类标签 + “获取”按钮，五态齐全；hover 边框变 primary、focus-visible 边框加 `ring-2 ring-ring`。
- 分类 Tab：激活态用 accent 底 + accentForeground 文字，而非 primary 填充；搜索框 focus 显示 primary 边框。
- 空状态（无搜索结果）用插画感的浅青色空盒图形 + “提交上架”引导，不回退默认样式。

## 8. Image Direction

- **Image Role**: 卡片封面（每个应用一张 16:10 橱窗图）+ Hero 精选主视觉。
- **Image Art Direction**: 封面为“抽象功能隐喻图”——按应用类别（写作/绘图/数据/语音等）生成统一风格的几何抽象构图：深青主色系 + 单一辅助色，前中后景分层的柔和渐变体积、玻璃与线框材质、左侧留白可叠品名；光线为均匀柔光带一个青色高光点，情绪是精密而友好。
- **Image Prompt Keywords**: geometric abstract cover art, teal and deep indigo palette, layered translucent shapes, soft volumetric lighting, glass and wireframe materials, minimal composition with left whitespace, AI tool metaphor, subtle grid texture, editorial poster quality, high resolution, no text
- **Image Avoidance**: 避免机器人插画、通用赛博紫色渐变、3D 小人商务图、真实照片拼贴、无主题光斑背景、封面内出现乱码文字。

## 9. Anti-patterns

- **Split personality**: 详情页或上架页另起一套紫色调或换圆角；全站共享本青色系与 rounded 体系。
- **Phantom tokens**: 编造 `--market-accent` 等变量；只使用上表 9 token + 主题内补齐。
- **Default SaaS drift**: 沦为默认蓝按钮 + 无封面灰卡列表；封面图和悬浮青边是本产品的识别核心。
- **Invisible interaction**: 卡片和 Tab 只做 hover 不做 focus-visible；键盘浏览必须可见。
- **Mono-hue tyranny**: 主按钮、激活 Tab、图标、边框、标签全部 primary；按 60-30-10 收回，激活态交 accent。
- **Status color drift**: 成功/警告色饱和度爆表盖过主色；语义色与 primary 同冷调同饱和区间。