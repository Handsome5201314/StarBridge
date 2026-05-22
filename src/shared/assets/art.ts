import bandageArt from '../../assets/bandage.png'
import currentLevelArt from '../../assets/current.png'
import deerArt from '../../assets/deer.png'
import brandLogo from '../../assets/icon.png'
import mapArt from '../../assets/map.png'
import moodIslandArt from '../../assets/mood-island.png'
import parkourIslandArt from '../../assets/parkour-island.png'
import sentenceIslandArt from '../../assets/sentence-island.png'
import type { IslandId } from '../types/game'

export const artAssets = {
  bandage: bandageArt,
  currentLevel: currentLevelArt,
  deer: deerArt,
  logo: brandLogo,
  map: mapArt,
}

export const islandArtById: Record<IslandId, string> = {
  sentence_blocks: sentenceIslandArt,
  emotion_match: moodIslandArt,
  polite_runner: parkourIslandArt,
}
