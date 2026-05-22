import { practiceSuggestionTemplates } from '../data/practiceSuggestions'
import type {
  LevelResult,
  PracticeSuggestion,
  PracticeSuggestionInput,
  RealLifeTask,
  SkillTag,
} from '../types/game'

export function getFallbackPracticeSuggestions(
  input: PracticeSuggestionInput,
): PracticeSuggestion[] {
  const orderedSkills: SkillTag[] = input.skillTags.length
    ? input.skillTags
    : ['express_need', 'recognize_emotion', 'use_polite_words']

  const defaultSkills: SkillTag[] = ['express_need', 'recognize_emotion', 'use_polite_words']
  const dedupedSkills = Array.from(new Set<SkillTag>([...orderedSkills, ...defaultSkills]))
  const suggestions = dedupedSkills
    .map((skillTag) => practiceSuggestionTemplates[skillTag])
    .filter(Boolean)

  return suggestions.slice(0, 3)
}

export function createRealLifeTask(result: LevelResult): RealLifeTask {
  const skillTag = result.skillTags[0] ?? 'express_need'
  const suggestion = practiceSuggestionTemplates[skillTag]

  return {
    id: `task-${result.levelId}`,
    sourceLevelId: result.levelId,
    title: suggestion.title,
    skillTag,
    suggestion: suggestion.scenario,
    parentTip: suggestion.parentTip,
    status: 'pending',
    createdAt: result.completedAt,
  }
}
