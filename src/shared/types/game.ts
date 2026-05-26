export type IslandId =
  | 'sentence_blocks'
  | 'emotion_match'
  | 'greeting_match'
  | 'help_valley'
  | 'starlight_market'
  | 'shopping_market'

export type Difficulty = 'basic' | 'medium' | 'advanced'

export type SkillTag =
  | 'express_need'
  | 'greeting'
  | 'ask_help'
  | 'recognize_emotion'
  | 'understand_others'
  | 'use_polite_words'
  | 'take_turns'
  | 'daily_life_choice'
  | 'shopping'
  | 'role_play'
  | 'money_exchange'
  | 'social_generalization'
  | 'conversation_repair'

export type CardType = 'expression' | 'emotion' | 'greeting' | 'help' | 'daily_life' | 'shopping'

export type PromptLevel = 'low' | 'medium' | 'high'

export type VoicePurpose = 'guardian_prompt' | 'npc_line' | 'coach_preview'

export type VoiceProfileStatus = 'ready' | 'pending_provider' | 'disabled'

export type SensorModality = 'camera' | 'microphone' | 'wearable' | 'environment'

export type SensorMetric =
  | 'gaze_on_task'
  | 'head_pose_stable'
  | 'turn_taking'
  | 'speech_volume'
  | 'noise_level'
  | 'hr_zone'
  | 'eda_arousal'
  | 'movement_level'
  | 'ambient_light'

export interface LevelComponentProps {
  levelId: string
  difficulty: Difficulty
  onComplete: (result: LevelResult) => void
  onExit?: () => void
}

export interface LevelResult {
  levelId: string
  islandId: IslandId
  difficulty: Difficulty
  starsEarned: number
  cardsEarned: string[]
  skillTags: SkillTag[]
  completedAt: string
}

export interface IslandConfig {
  id: IslandId
  name: string
  description: string
  route: string
  badgeId: string
  themeSkill: SkillTag
  levels: LevelConfig[]
}

export interface LevelConfig {
  id: string
  islandId: IslandId
  title: string
  difficulty: Difficulty
  targetSkill: SkillTag
  rewardCardIds: string[]
  rewardStars: number
  mechanic:
    | 'sentence_blocks'
    | 'emotion_match'
    | 'friendly_speech_match'
    | 'help_valley'
    | 'starlight_market'
    | 'social_scenario'
}

export interface CardConfig {
  id: string
  type: CardType
  name: string
  description: string
  voiceText: string
  skillTag: SkillTag
}

export interface BadgeConfig {
  id: string
  islandId: IslandId
  name: string
  description: string
  unlockText: string
}

export interface BuddyGrowth {
  stage: number
  exp: number
}

export interface RealLifeTask {
  id: string
  sourceLevelId: string
  title: string
  skillTag: SkillTag
  suggestion: string
  parentTip: string
  status: 'pending' | 'done'
  createdAt: string
  completedAt?: string
}

export interface PlayerProgress {
  totalStars: number
  todayStars: number
  completedLevelIds: string[]
  collectedCardIds: string[]
  badgeProgress: Record<string, number>
  buddyGrowth: BuddyGrowth
  todaySkillTags: SkillTag[]
  realLifeTasks: RealLifeTask[]
}

export interface PracticeSuggestionInput {
  completedLevelIds: string[]
  skillTags: SkillTag[]
  collectedCardIds: string[]
}

export interface PracticeSuggestion {
  id: string
  title: string
  scenario: string
  steps: string[]
  parentTip: string
  relatedSkill: SkillTag
}

export interface SceneChoice {
  id: string
  label: string
  feedback: string
  npcReply: string
}

export interface SceneStep {
  id: string
  title: string
  sceneText: string
  prompt: string
  expectedChoiceId: string
  choices: SceneChoice[]
  skillTag: SkillTag
  visualFocus: string
}

export interface RoleCard {
  id: string
  role: string
  goal: string
  sampleLine: string
}

export interface GeneralizationTask {
  title: string
  scenario: string
  steps: string[]
  parentTip: string
}

export interface SceneScript {
  sceneId: string
  levelId: string
  islandId: IslandId
  title: string
  description: string
  targetAgeBand: string
  targetSkill: SkillTag
  steps: SceneStep[]
  roleCards: RoleCard[]
  generalizationTask: GeneralizationTask
}

export interface LearnerProfile {
  ageBand: string
  supportLevel: 'light' | 'moderate' | 'high'
  preferredVoice: 'guardian_familiar' | 'neutral_safe'
  toleratedModalities: Array<'visual' | 'voice' | 'text' | 'sensor_mock'>
  promptPreference: PromptLevel
  generalizationGoals: string[]
  notes: string
}

export interface SceneAttempt {
  id: string
  sceneId: string
  levelId: string
  promptLevel: PromptLevel
  targetSkill: SkillTag
  currentStepId: string
  completedStepIds: string[]
  status: 'active' | 'completed'
  startedAt: string
  completedAt?: string
}

export interface VoiceProfile {
  id: string
  displayName: string
  consentGranted: boolean
  purpose: VoicePurpose
  status: VoiceProfileStatus
  createdAt: string
}

export interface SensorBridgeEvent {
  modality: SensorModality
  metric: SensorMetric
  value: number | string
  confidence: number
  recordedAt: string
  rawMediaStored: false
}

export interface AICoachArtifact {
  sceneId: string
  title: string
  targetSkill: SkillTag
  promptLevel: PromptLevel
  roleCards: RoleCard[]
  homePractice: string
  reflectionQuestions: string[]
  safetyNotes: string[]
}
