import bandageArt from '../../assets/bandage.png'
import currentLevelArt from '../../assets/current.png'
import deerArt from '../../assets/deer.png'
import homeBackgroundArt from '../../assets/home-papercraft-bg.png'
import brandLogo from '../../assets/icon.png'
import mapArt from '../../assets/map.png'
import railBadgeIcon from '../../assets/icons/badge.png'
import railBuddyIcon from '../../assets/icons/buddy.png'
import railMapIcon from '../../assets/icons/map.png'
import moodIslandArt from '../../assets/mood-island.png'
import greetingIslandArt from '../../assets/greeting-game/greeting-island.png'
import sentenceIslandArt from '../../assets/sentence-island.png'
import type { IslandId } from '../types/game'

export const artAssets = {
  bandage: bandageArt,
  currentLevel: currentLevelArt,
  deer: deerArt,
  homeBackground: homeBackgroundArt,
  logo: brandLogo,
  map: mapArt,
  railBadgeIcon,
  railBuddyIcon,
  railMapIcon,
}

export const islandArtById: Record<IslandId, string> = {
  sentence_blocks: sentenceIslandArt,
  emotion_match: moodIslandArt,
  greeting_match: greetingIslandArt,
}
