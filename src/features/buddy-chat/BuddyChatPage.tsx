import type { CSSProperties } from 'react'
import { useMemo, useRef, useState } from 'react'
import {
  ChevronRight,
  Clock3,
  Ellipsis,
  Heart,
  Mic,
  PanelLeftClose,
  PanelLeft,
  RefreshCw,
  Search,
  Send,
  Smile,
  MessageCircleMore,
  Plus,
} from 'lucide-react'
import { buddyChatArt } from '../../shared/assets/buddyChatArt'
import { artAssets } from '../../shared/assets/art'
import { Button } from '../../shared/components/Button'
import { PageShell } from '../../shared/components/PageShell'
import { SpeakButton } from '../../shared/components/SpeakButton'
import { buddyChatDefaultThreadId, buddyChatSystemPrompt, buddyChatThreads } from '../../shared/data/buddyChat'
import { requestDeepseekChatStream } from '../../shared/services/deepseekChat'
import type {
  BuddyChatMessage,
  BuddyChatThread,
  DeepseekChatMessage,
  DeepseekChatResponse,
} from '../../shared/types/chat'

function buildThreadMessages(thread: BuddyChatThread) {
  return thread.messages
}

function buildHistoryMessages(thread: BuddyChatThread, messages: BuddyChatMessage[]): DeepseekChatMessage[] {
  const systemMessage: DeepseekChatMessage = { role: 'system', content: buddyChatSystemPrompt }
  const historyMessages = messages.map<DeepseekChatMessage>((message) => ({
    role: message.speaker === 'child' ? 'user' : 'assistant',
    content: `${message.timeLabel} ${message.content}`,
  }))
  const continueMessage: DeepseekChatMessage = {
    role: 'user',
    content: `请继续陪我完成这段聊天。当前主题是「${thread.title}」。如果合适，请先接住我的情绪，再给一个很具体的小建议。`,
  }

  return [systemMessage, ...historyMessages, continueMessage]
}

function getDeepseekStatusMessage(response: DeepseekChatResponse) {
  if (!response.fallback) {
    return 'DeepSeek 已连接并回复成功'
  }

  if (response.fallbackReason === 'missing_api_key') {
    return '未检测到 DeepSeek API Key，已使用本地回复'
  }

  if (response.fallbackReason === 'deepseek_api_error') {
    return response.fallbackStatus
      ? `DeepSeek 返回 ${response.fallbackStatus}，已使用本地回复`
      : 'DeepSeek 请求失败，已使用本地回复'
  }

  return '本地温和回复已接管'
}

export function BuddyChatPage() {
  const shellStyle = {
    '--world-background-image': `url(${artAssets.homeBackground})`,
  } as CSSProperties
  const [collapsed, setCollapsed] = useState(false)
  const [activeThreadId, setActiveThreadId] = useState(buddyChatDefaultThreadId)
  const [draft, setDraft] = useState('')
  const [messagesByThread, setMessagesByThread] = useState<Record<string, BuddyChatMessage[]>>(() =>
    Object.fromEntries(buddyChatThreads.map((thread) => [thread.id, buildThreadMessages(thread)])),
  )
  const [isThinking, setIsThinking] = useState(false)
  const [statusMessage, setStatusMessage] = useState('已连接星桥小鹿')
  const [sidebarSearch, setSidebarSearch] = useState('')
  const messageIdRef = useRef(0)

  const activeThread = useMemo(
    () => buddyChatThreads.find((thread) => thread.id === activeThreadId) ?? buddyChatThreads[0],
    [activeThreadId],
  )

  const visibleThreads = useMemo(() => {
    const keyword = sidebarSearch.trim().toLowerCase()
    if (!keyword) return buddyChatThreads

    return buddyChatThreads.filter((thread) => {
      const haystack = [thread.title, thread.subtitle, thread.preview, thread.moodLabel].join(' ').toLowerCase()
      return haystack.includes(keyword)
    })
  }, [sidebarSearch])

  const activeMessages = messagesByThread[activeThread.id] ?? activeThread.messages

  const sendMessage = async (content: string) => {
    const text = content.trim()
    if (!text || isThinking) {
      return
    }

    const nextMessageId = messageIdRef.current + 1
    messageIdRef.current = nextMessageId

    const userMessage: BuddyChatMessage = {
      id: `msg-${nextMessageId}`,
      speaker: 'child',
      content: text,
      timeLabel: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
    }

    const thread = activeThread
    const threadId = thread.id
    const replyId = `reply-${nextMessageId}`
    const replyTimeLabel = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
    const reply: BuddyChatMessage = {
      id: replyId,
      speaker: 'buddy',
      content: '',
      timeLabel: replyTimeLabel,
    }
    const nextMessages = [...activeMessages, userMessage]
    setMessagesByThread((current) => ({
      ...current,
      [threadId]: [...nextMessages, reply],
    }))
    setDraft('')
    setIsThinking(true)
    setStatusMessage('DeepSeek 正在流式回复...')

    try {
      const response = await requestDeepseekChatStream(
        {
          messages: buildHistoryMessages(thread, nextMessages),
        },
        {
          onDelta: ({ content: streamedContent }) => {
            setMessagesByThread((current) => ({
              ...current,
              [threadId]: (current[threadId] ?? nextMessages).map((message) =>
                message.id === replyId ? { ...message, content: streamedContent } : message,
              ),
            }))
          },
        },
      )

      setMessagesByThread((current) => ({
        ...current,
        [threadId]: (current[threadId] ?? nextMessages).map((message) =>
          message.id === replyId ? { ...message, content: response.content } : message,
        ),
      }))
      setStatusMessage(getDeepseekStatusMessage(response))
    } catch {
      setMessagesByThread((current) => ({
        ...current,
        [threadId]: (current[threadId] ?? nextMessages).map((message) =>
          message.id === replyId
            ? {
                ...message,
                content:
                  '我听见你了。先让自己慢一点，深呼吸一次，然后只做一件很小的事就好，比如喝一口水、坐稳一点，或者告诉我你最想先解决哪一部分。',
              }
            : message,
        ),
      }))
      setStatusMessage('已切换到本地温和回复')
    } finally {
      setIsThinking(false)
    }
  }

  const handleQuestion = (question: string) => {
    void sendMessage(question)
  }

  return (
    <PageShell activePath="/buddy-chat" activeRail="buddy" className="app-shell-world-bg" style={shellStyle}>
      <div className="buddy-chat-layout">
        <aside className={collapsed ? 'buddy-chat-sidebar is-collapsed' : 'buddy-chat-sidebar'}>
          <div className="buddy-chat-sidebar-top">
            <Button
              className="buddy-chat-new-button"
              icon={<Plus size={20} />}
              onClick={() => setActiveThreadId(buddyChatDefaultThreadId)}
            >
              新聊天
            </Button>

            <div className="buddy-chat-sidebar-toolbar">
              <button
                className="buddy-chat-toolbar-button"
                type="button"
                onClick={() => setCollapsed((current) => !current)}
                aria-label={collapsed ? '展开聊天侧栏' : '收起聊天侧栏'}
              >
                {collapsed ? <PanelLeft size={20} /> : <PanelLeftClose size={20} />}
              </button>
            </div>
          </div>

          <div className="buddy-chat-filter-row">
            <button className="buddy-chat-filter-chip" type="button">
              <MessageCircleMore size={16} />
              切换聊天
            </button>
            <button className="buddy-chat-filter-chip is-ghost" type="button">
              最新
              <ChevronRight size={16} />
            </button>
          </div>

          <label className="buddy-chat-search">
            <Search size={16} />
            <input
              value={sidebarSearch}
              onChange={(event) => setSidebarSearch(event.target.value)}
              placeholder="搜索聊天"
              aria-label="搜索聊天"
            />
          </label>

          <div className="buddy-chat-thread-list">
            {visibleThreads.map((thread) => {
              const active = thread.id === activeThread.id
              return (
                <button
                  key={thread.id}
                  className={active ? 'buddy-chat-thread is-active' : 'buddy-chat-thread'}
                  type="button"
                  onClick={() => setActiveThreadId(thread.id)}
                >
                  <img className="buddy-chat-thread-avatar" src={thread.avatar} alt="" />
                  <div className="buddy-chat-thread-copy">
                    <strong>{thread.title}</strong>
                    <p>{thread.preview}</p>
                    <span>{thread.startedAtLabel}</span>
                  </div>
                  <span className="buddy-chat-thread-dot" aria-hidden="true" />
                </button>
              )
            })}
          </div>

          <Button className="buddy-chat-history-button" variant="ghost" icon={<Clock3 size={18} />}>
            查看全部聊天记录
          </Button>

          <section className="buddy-chat-sidebar-emotion" aria-labelledby="buddy-chat-emotion-title">
            <div className="buddy-chat-card-heading">
              <Heart size={18} />
              <h2 id="buddy-chat-emotion-title">情绪状态</h2>
            </div>
            <div className="buddy-chat-emotion-box">
              <img src={buddyChatArt.emotionCloud} alt="" />
              <strong>{activeThread.moodLabel}</strong>
              <div className="buddy-chat-progress-row">
                <span>情绪能量</span>
                <div className="buddy-chat-progress-track">
                  <div style={{ width: `${activeThread.moodProgress}%` }} />
                </div>
                <b>{activeThread.moodProgress}%</b>
              </div>
              <p>{activeThread.moodNote}</p>
            </div>
          </section>
        </aside>

        <main className="buddy-chat-main">
          <section className="buddy-chat-stage paper-card">
            <div className="buddy-chat-stage-header">
              <div className="buddy-chat-stage-heading">
                <img className="buddy-chat-stage-avatar" src={activeThread.avatar} alt="" />
                <div>
                  <p className="buddy-chat-stage-kicker">星桥小助手</p>
                  <h1>{activeThread.title}</h1>
                  <p className="buddy-chat-stage-subtitle">{activeThread.subtitle}</p>
                </div>
              </div>

              <div className="buddy-chat-stage-tools">
                <button className="buddy-chat-icon-button" type="button" aria-label="搜索">
                  <Search size={20} />
                </button>
                <button className="buddy-chat-icon-button" type="button" aria-label="更多">
                  <Ellipsis size={20} />
                </button>
              </div>
            </div>

            <div className="buddy-chat-message-list">
              {activeMessages.map((message) => (
                <article
                  key={message.id}
                  className={
                    message.speaker === 'child'
                      ? 'buddy-chat-message is-child'
                      : 'buddy-chat-message is-buddy'
                  }
                >
                  <img
                    className="buddy-chat-message-avatar"
                    src={message.speaker === 'child' ? buddyChatArt.childAvatar : activeThread.avatar}
                    alt=""
                  />
                  <div className="buddy-chat-bubble">
                    <p>{message.content || (message.speaker === 'buddy' ? '小鹿正在输入...' : '')}</p>
                    <span>{message.timeLabel}</span>
                    {message.speaker === 'child' ? (
                      <button className="buddy-chat-play-button" type="button" aria-label="播放消息">
                        <Send size={14} />
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>

            <div className="buddy-chat-quick-replies">
              <p>你可以这样回复我：</p>
              <div className="buddy-chat-chip-row">
                {['我想冷静一下', '我需要一点时间', '我希望能说清楚', '我想把它修好', '换一组'].map(
                  (item, index) => (
                    <button
                      key={item}
                      className={index === 4 ? 'buddy-chat-reply-chip is-refresh' : 'buddy-chat-reply-chip'}
                      type="button"
                      onClick={() => {
                        if (index === 4) {
                          setStatusMessage('已换一组建议')
                          return
                        }
                        handleQuestion(item)
                      }}
                    >
                      {index === 4 ? <RefreshCw size={16} /> : null}
                      {item}
                    </button>
                  ),
                )}
              </div>
            </div>

            <div className="buddy-chat-compose">
              <SpeakButton text={draft || '输入你想对星桥小鹿说的话'} label="朗读输入框" />
              <div className="buddy-chat-input-shell">
                <button className="buddy-chat-mic-button" type="button" aria-label="语音输入">
                  <Mic size={20} />
                </button>
                <textarea
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                      event.preventDefault()
                      void sendMessage(draft)
                    }
                  }}
                  placeholder="输入你想对精灵小鹿说的话..."
                  rows={2}
                />
                <button
                  className="buddy-chat-smile-button"
                  type="button"
                  aria-label="表情"
                >
                  <Smile size={18} />
                </button>
              </div>
              <Button
                className="buddy-chat-send-button"
                icon={<Send size={18} />}
                onClick={() => void sendMessage(draft)}
                disabled={isThinking || !draft.trim()}
              >
                发送
              </Button>
              <p className="buddy-chat-input-note">
                按 Enter 发送，按 Shift + Enter 换行
              </p>
            </div>
          </section>
        </main>

        <div className="buddy-chat-float-note">
          <img src={buddyChatArt.deerBedtime} alt="" />
          <div>
            <p>初始模式 已并连接</p>
            <strong>{statusMessage}</strong>
          </div>
        </div>
      </div>
    </PageShell>
  )
}
