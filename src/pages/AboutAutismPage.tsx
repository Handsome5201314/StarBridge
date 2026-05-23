import { Link } from 'react-router-dom'
import {
  BookOpen,
  ExternalLink,
  Heart,
  Home,
  School,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from 'lucide-react'
import aboutSceneBg from '../assets/about-autism/about-scene-bg.png'
import heroFamilyBridge from '../assets/about-autism/hero-family-bridge.png'
import statChinaMap from '../assets/about-autism/stat-china-map.png'
import statGlobe from '../assets/about-autism/stat-globe.png'
import statHeart from '../assets/about-autism/stat-heart.png'
import supportCommunity from '../assets/about-autism/support-community.png'
import supportFamily from '../assets/about-autism/support-family.png'
import supportSchool from '../assets/about-autism/support-school.png'
import supportSociety from '../assets/about-autism/support-society.png'
import aboutAutismHero from '../assets/about-autism-hero.png'
import { Button } from '../shared/components/Button'
import { Card } from '../shared/components/Card'
import { PageShell } from '../shared/components/PageShell'
import { SpeakButton } from '../shared/components/SpeakButton'

const articleText = [
  '人们常把孤独症儿童称为“来自星星的孩子”。这个名字很美，但在美好的称呼之外，他们和他们的家庭面对的，往往是漫长、具体而日常的现实。',
  '孤独症不是孩子“不听话”，也不是父母“没有教好”。它是一种神经发育差异，通常会影响孩子的语言沟通、社交互动、情绪理解、感官适应和行为方式。不同孩子的表现差异很大：有的孩子很少说话，有的孩子会反复说同一句话；有的孩子不太看人眼睛，有的孩子害怕嘈杂声音、突然变化或拥挤环境；有的孩子能记住许多细节，却很难表达“我难过”“我需要帮助”。',
  '这些表现并不意味着他们没有情感，也不意味着他们不需要他人。很多时候，他们不是不想靠近这个世界，而是这个世界对他们来说太快、太吵、太复杂。',
  '对一些孩子来说，普通人轻易说出口的一句话，可能需要很长时间学习。比如“我要喝水”“我不喜欢”“请帮帮我”“我可以一起玩吗”。这些话看起来简单，却关系到一个孩子能不能表达需求、能不能减少崩溃、能不能进入一段关系，也关系到他能否在家庭、学校和社区中获得更多理解。',
  '全球范围内，孤独症儿童并不少见。世界卫生组织在公开资料中估计，2021 年全球大约每 127 人中就有 1 人患有自闭症。不同国家和地区由于筛查方式、诊断资源和社会认知不同，统计数字会有所差异。在中国，公开报告中的估计口径也并不完全一致，但普遍认为孤独症儿童数量庞大，且许多家庭仍在诊断、康复、教育和社会融入之间艰难寻找路径。',
  '他们并不是一个遥远的群体。也许就在我们身边的小区、学校、游乐场、地铁车厢和医院走廊里。只是很多时候，他们被误解为“奇怪”“任性”“不合群”，他们的父母也常常承受着旁人的眼光、解释的疲惫和长期照护的压力。',
  '有人以为孤独症孩子都是天才。现实是，少数孩子可能在记忆、音乐、绘画、数字或视觉细节上有突出的能力，但更多孩子需要的是持续、细致、稳定的支持。把他们浪漫化成“天才”，有时会遮住他们真实的困难。',
  '有人以为孩子不说话、不看人，就是不喜欢别人。事实上，有些孩子可能无法自然理解眼神、表情和语气，也可能因为眼神接触带来压力而回避视线。他们的沉默不一定是拒绝，退后也不一定是冷漠。',
  '也有人以为孩子长大自然会好，或者只要“多逼一逼”就能变得和别人一样。可孤独症不是靠责备、催促和惩罚就能消失的。许多孩子需要长期的康复训练、家庭陪伴、学校支持和社会接纳。越是稳定、温和、可预测的环境，越有可能帮助他们建立安全感，并逐渐发展生活和沟通能力。',
  '真正的支持，常常不是宏大的口号，而是很具体的日常。在家庭里，支持可能是父母把一句话拆得更小一点，给孩子明确选择，等待他慢慢回应；也可能是在孩子情绪失控时，先帮助他安静下来，而不是急着讲道理。',
  '在学校里，支持可能是老师用清楚的流程图告诉孩子一天会发生什么，允许他用图片、手势或简单词语表达；也可能是同学知道，他不是故意“不合群”，而是需要更明确、更友善的邀请。',
  '在公共空间里，支持可能是当一个孩子因为声音、灯光或拥挤而哭闹时，旁人少一点围观和指责，多一点理解和距离。对那个家庭来说，这一点点善意，可能已经很重要。',
  '孤独症孩子需要学习表达，也需要被允许以自己的节奏成长。他们需要规则，但也需要耐心；需要训练，但更需要尊重；需要帮助适应社会，也需要社会为他们留出可以进入的位置。',
  '“来自星星的孩子”并不是真的离我们很远。他们生活在同一个世界里，只是感受世界的方式和多数人不同。声音可能更响，光线可能更刺眼，变化可能更难承受，语言和社交规则可能更不容易理解。',
  '如果这个世界愿意慢一点、清楚一点、温柔一点，他们就可能多一点安全感，多一点表达自己的机会，也多一点走向他人的可能。',
]

const misunderstandings = [
  ['误解一', '孤独症孩子都是天才', '少数孩子可能有突出的能力，但更多孩子需要长期、细致、稳定的支持。'],
  ['误解二', '不说话就是不喜欢别人', '沉默不一定是拒绝，回避视线也不一定是冷漠，很多孩子只是需要更安全的互动方式。'],
  ['误解三', '长大自然就会好', '成长需要持续支持，早期干预、家庭陪伴和融合环境都很重要。'],
  ['误解四', '多逼一逼就能学会', '催促和惩罚常常增加压力，清晰选择、耐心等待和温和回应更有效。'],
]

type SupportItem = {
  title: string
  description: string
  Icon: LucideIcon
}

const supportItems: SupportItem[] = [
  {
    title: '家庭',
    description: '把表达练习放进吃饭、穿衣、出门等真实生活里，给孩子明确选择和足够等待。',
    Icon: Home,
  },
  {
    title: '学校',
    description: '用稳定流程、可视化提示和友善同伴支持，帮助孩子有机会参与集体生活。',
    Icon: School,
  },
  {
    title: '社区',
    description: '在公共空间少一点围观和指责，多一点理解、距离和善意。',
    Icon: Users,
  },
  {
    title: '社会',
    description: '提供持续、可及、尊重差异的服务，让孩子和家庭不必独自面对。',
    Icon: Heart,
  },
]

const sourceLinks = [
  {
    title: '世界卫生组织：自闭症事实清单',
    description: '介绍孤独症谱系障碍的基本事实、流行病学、评估与照护、人权与支持环境。',
    href: 'https://www.who.int/zh/news-room/fact-sheets/detail/autism-spectrum-disorders',
  },
  {
    title: '中国残联等七部门：孤独症儿童关爱促进行动实施方案（2024-2028年）',
    description: '提出完善孤独症儿童发展全程关爱服务体系，改善健康成长和融合发展环境。',
    href: 'https://www.cdpf.org.cn/zwgk/zcwj/wjfb/e9e23982df5248e3b0d82d180c368996.htm',
  },
  {
    title: 'CDC：孤独症谱系障碍数据与统计',
    description: '提供美国 ADDM 网络关于儿童 ASD 识别率、趋势和监测方法的公开数据。',
    href: 'https://www.cdc.gov/autism/data-research/index.html',
  },
  {
    title: 'WHO：疫苗与孤独症安全性声明',
    description: '回应疫苗与孤独症相关误解，提供世界卫生组织疫苗安全委员会的说明。',
    href: 'https://www.who.int/news/item/11-12-2025-statement-gacvs-vaccines-autism',
  },
]

const fullArticleText = articleText.join('\n')

const posterStats = [
  {
    title: '全球估计',
    value: '约 1 / 127',
    note: 'WHO 估计，2021 年全球约每 127 人中有 1 人患有自闭症。',
    image: statGlobe,
  },
  {
    title: '中国儿童',
    value: '约 200万-500万',
    note: '公开报告口径不同，0-14 岁孤独症儿童数量多以估计区间呈现。',
    image: statChinaMap,
  },
  {
    title: '支持关键词',
    value: '早发现 长陪伴',
    note: '他们需要稳定、清晰、温和、可进入的环境与回应。',
    image: statHeart,
  },
]

const posterMyths = [
  {
    label: '误解一',
    title: '孤独症孩子都是天才',
    truth: '少数孩子可能有突出能力，但更多孩子需要长期、细致、稳定的支持。',
  },
  {
    label: '误解二',
    title: '不说话就是不喜欢别人',
    truth: '沉默不一定是拒绝，回避视线也不一定是冷漠，很多孩子只是需要更安全的互动方式。',
  },
  {
    label: '误解三',
    title: '长大自然就会好',
    truth: '成长需要持续支持，早期干预、家庭陪伴和融合环境都很重要。',
  },
  {
    label: '误解四',
    title: '多逼一逼就能学会',
    truth: '催促和惩罚常常增加压力，清晰选择、耐心等待和温和回应更有效。',
  },
]

const posterSupport = [
  {
    title: '家庭',
    copy: '把表达练习放进吃饭、穿衣、出门等真实生活里，给孩子明确选择和足够等待。',
    image: supportFamily,
  },
  {
    title: '学校',
    copy: '用稳定流程、可视化提示和友善同伴支持，帮助孩子有机会参与集体生活。',
    image: supportSchool,
  },
  {
    title: '社区',
    copy: '少一点围观和指责，多一点理解、距离和善意。',
    image: supportCommunity,
  },
  {
    title: '社会',
    copy: '提供持续、可及、尊重差异的服务，让孩子和家庭不必独自面对。',
    image: supportSociety,
  },
]

export function AboutAutismPage() {
  return (
    <PageShell activePath="/about-autism" contentClassName="about-infographic-main">
      <section className="about-infographic" aria-labelledby="about-poster-title">
        <img className="about-infographic-bg" src={aboutSceneBg} alt="" />

        <div className="about-infographic-content">
          <header className="about-infographic-hero">
            <div className="about-title-paper">
              <span>星桥计划公益认知页</span>
              <h1 id="about-poster-title">了解来自星星的孩子</h1>
              <p>
                他们并不是离我们很远的人，只是感受世界、表达自己和靠近他人的方式，与多数人不同。
              </p>
            </div>
            <img
              className="about-family-asset"
              src={heroFamilyBridge}
              alt="纸艺风格的家长与孩子坐在星桥旁"
            />
          </header>

          <section className="about-stat-strip" aria-label="孤独症儿童相关数据">
            {posterStats.map((stat) => (
              <article className="about-info-card about-stat-tile" key={stat.title}>
                <img src={stat.image} alt="" />
                <div>
                  <span>{stat.title}</span>
                  <strong>{stat.value}</strong>
                  <p>{stat.note}</p>
                </div>
              </article>
            ))}
          </section>

          <div className="about-poster-grid">
            <section className="about-info-panel about-myth-panel" aria-labelledby="about-myth-title">
              <div className="about-ribbon">常见误解</div>
              <h2 id="about-myth-title">有些误解，正在让他们更难被看见</h2>
              <div className="about-myth-grid">
                {posterMyths.map((item) => (
                  <article className="about-info-card about-myth-card" key={item.label}>
                    <span>{item.label}</span>
                    <strong>{item.title}</strong>
                    <p>{item.truth}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="about-info-panel about-support-panel" aria-labelledby="about-support-poster-title">
              <div className="about-ribbon is-blue">怎样支持</div>
              <h2 id="about-support-poster-title">真正的帮助，往往发生在日常里</h2>
              <div className="about-support-tile-grid">
                {posterSupport.map((item) => (
                  <article className="about-info-card about-support-tile" key={item.title}>
                    <img src={item.image} alt="" />
                    <strong>{item.title}</strong>
                    <p>{item.copy}</p>
                  </article>
                ))}
              </div>
            </section>
          </div>

          <section className="about-care-strip" aria-label="理解与关怀">
            <article className="about-info-card about-care-note is-wide">
              <strong>群体现状与关怀</strong>
              <p>
                他们不是标签，而是正在努力生活的孩子。很多时候，他们不是不想靠近这个世界，
                而是这个世界对他们来说太快、太响、太复杂。
              </p>
            </article>
            <article className="about-info-card about-care-note">
              <strong>少一点标签，多一点理解</strong>
              <p>少说“这孩子怎么这样”，多想一想“他是不是遇到了困难”。</p>
            </article>
            <article className="about-info-card about-care-note is-blue">
              <strong>慢一点，也是一种支持</strong>
              <p>很多孩子需要的不是更响的指令，而是更清晰、更温柔、更可预测的世界。</p>
            </article>
          </section>

          <p className="about-data-note">
            数据口径说明：全球数据参考世界卫生组织公开资料；中国相关数字采用公开报告中的估计区间，用于公众认知介绍。
          </p>
        </div>
      </section>
    </PageShell>
  )
}

export function AboutAutismArticlePage() {
  return (
    <PageShell activePath="/about-autism">
      <section className="about-hero" aria-labelledby="about-title">
        <div className="about-hero-copy">
          <div className="about-title-mark" aria-hidden="true">
            <Sparkles size={34} />
          </div>
          <h1 id="about-title">了解来自星星的孩子</h1>
          <p>
            他们并不是离我们很远的人，只是感受世界、表达自己和靠近他人的方式，与多数人不同。
          </p>
          <div className="about-hero-actions">
            <SpeakButton text={fullArticleText} label="朗读文章" />
            <Button as={Link} to="/game" variant="ghost">
              回到游戏世界
            </Button>
          </div>
        </div>
        <img
          className="about-hero-art"
          src={aboutAutismHero}
          alt="纸艺风插图：家长和孩子坐在星桥旁，周围有云朵、星星和表达卡片"
        />
      </section>

      <section className="about-stat-grid" aria-label="孤独症儿童相关数据">
        <Card className="about-stat-card">
          <span>全球估计</span>
          <strong>约 1 / 127</strong>
          <p>世界卫生组织估计，2021 年全球大约每 127 人中有 1 人患有自闭症。</p>
        </Card>
        <Card className="about-stat-card">
          <span>中国儿童</span>
          <strong>约 200万-500万</strong>
          <p>公开报告口径不同，0-14 岁孤独症儿童数量多以估计区间呈现。</p>
        </Card>
        <Card className="about-stat-card">
          <span>支持关键词</span>
          <strong>早发现 长陪伴</strong>
          <p>他们需要稳定、清晰、温和、可进入的家庭、学校和社会环境。</p>
        </Card>
      </section>

      <section className="about-misunderstanding-section" aria-labelledby="misunderstanding-title">
        <div className="section-heading">
          <p className="section-label">常见误解</p>
          <h2 id="misunderstanding-title">有些误解，正在让他们更难被看见</h2>
        </div>
        <div className="about-misunderstanding-grid">
          {misunderstandings.map(([label, title, truth]) => (
            <Card className="about-misunderstanding-card" key={title}>
              <span>{label}</span>
              <h3>{title}</h3>
              <p>{truth}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="about-support-section" aria-labelledby="support-title">
        <div className="section-heading">
          <p className="section-label">怎样支持</p>
          <h2 id="support-title">真正的帮助，往往发生在日常里</h2>
        </div>
        <div className="about-support-grid">
          {supportItems.map(({ title, description, Icon }) => (
            <Card className="about-support-card" key={title}>
              <Icon size={34} />
              <h3>{title}</h3>
              <p>{description}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="about-content-layout">
        <article className="about-article" aria-labelledby="article-title">
          <div className="about-article-heading">
            <BookOpen size={30} />
            <div>
              <p className="section-label">群体现状与关怀</p>
              <h2 id="article-title">他们不是标签，而是正在努力生活的孩子</h2>
            </div>
          </div>
          {articleText.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <blockquote>
            关怀孤独症儿童，不只是关怀某一个特殊群体。它也在提醒我们：一个真正友好的社会，不只属于表达流利、适应迅速、行为标准的人，也应该属于那些说得慢一点、反应不同一点、需要更多帮助的人。
          </blockquote>
        </article>

        <aside className="about-side-notes" aria-label="理解孤独症儿童的辅助信息">
          <Card className="about-care-card">
            <ShieldCheck size={34} />
            <h2>少一点标签，多一点理解</h2>
            <p>
              少说“这孩子怎么这样”，多想一想“他是不是遇到了困难”。少一点评判，可能就能为一个家庭留出喘息的空间。
            </p>
          </Card>
          <Card className="about-care-card">
            <Heart size={34} />
            <h2>慢一点，也是一种支持</h2>
            <p>
              慢一点说话，慢一点催促，慢一点评价。很多孩子需要的不是更响的指令，而是更清楚、更温柔、更可预测的世界。
            </p>
          </Card>
        </aside>
      </section>

      <Card className="about-sources">
        <p className="section-label">数据口径说明</p>
        <p>
          页面中的全球数据参考世界卫生组织公开资料；中国相关数字采用公开报告与政策文件中的估计区间表述。由于筛查、诊断和统计口径不同，相关数字适合用于公众认知介绍，不应被理解为精确普查值。
        </p>
        <div className="about-source-list">
          {sourceLinks.map((source) => (
            <a key={source.href} className="about-source-link" href={source.href} target="_blank" rel="noreferrer">
              <span>
                <strong>{source.title}</strong>
                <small>{source.description}</small>
              </span>
              <ExternalLink size={22} aria-hidden="true" />
            </a>
          ))}
        </div>
      </Card>
    </PageShell>
  )
}
