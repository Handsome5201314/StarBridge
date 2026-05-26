import type { LearnerProfile } from '../../src/shared/types/game'

export const defaultLearnerProfile: LearnerProfile = {
  ageBand: '7+',
  supportLevel: 'moderate',
  preferredVoice: 'guardian_familiar',
  toleratedModalities: ['visual', 'voice', 'text', 'sensor_mock'],
  promptPreference: 'medium',
  generalizationGoals: ['supermarket_social_generalization'],
  notes: '适合具备基础表达和高阶认知能力、需要把社交规则迁移到真实生活的儿童。',
}
