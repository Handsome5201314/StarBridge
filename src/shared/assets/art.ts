import bandageArt from '../../assets/bandage.png'
import currentLevelArt from '../../assets/current.png'
import deerArt from '../../assets/deer.png'
import homeBackgroundArt from '../../assets/home-papercraft-bg.png'
import brandLogo from '../../assets/icon.png'
import mapBackgroundArt from '../../assets/map-background.png'
import mapArt from '../../assets/map.png'
import emotionLakeMapIsland from '../../assets/map-islands/emotion-lake.png'
import greetingMapIsland from '../../assets/map-islands/greeting-island.png'
import helpValleyMapIsland from '../../assets/help-valley/help-valley-island.png'
import queueCastleMapIsland from '../../assets/map-islands/queue-castle.png'
import sentenceBlocksMapIsland from '../../assets/map-islands/sentence-blocks-island.png'
import starlightMarketMapIsland from '../../assets/starlight-market/market-island.png'
import railBadgeIcon from '../../assets/icons/badge.png'
import railBuddyIcon from '../../assets/icons/buddy.png'
import railMapIcon from '../../assets/icons/map.png'
import moodIslandArt from '../../assets/mood-island.png'
import greetingIslandArt from '../../assets/greeting-game/greeting-island.png'
import helpValleyIslandArt from '../../assets/help-valley/help-valley-island.png'
import sentenceIslandArt from '../../assets/sentence-island.png'
import starlightMarketIslandArt from '../../assets/starlight-market/market-island.png'
import type { IslandId } from '../types/game'

export const artAssets = {
  bandage: bandageArt,
  currentLevel: currentLevelArt,
  deer: deerArt,
  homeBackground: homeBackgroundArt,
  logo: brandLogo,
  map: mapArt,
  mapBackground: mapBackgroundArt,
  railBadgeIcon,
  railBuddyIcon,
  railMapIcon,
}

export const mapIslandAssets = {
  greeting: greetingMapIsland,
  emotionLake: emotionLakeMapIsland,
  helpValley: helpValleyMapIsland,
  queueCastle: queueCastleMapIsland,
  sentenceBlocks: sentenceBlocksMapIsland,
  starlightMarket: starlightMarketMapIsland,
}

export const islandArtById: Record<IslandId, string> = {
  sentence_blocks: sentenceIslandArt,
  emotion_match: moodIslandArt,
  greeting_match: greetingIslandArt,
  help_valley: helpValleyIslandArt,
  starlight_market: starlightMarketIslandArt,
  shopping_market: queueCastleMapIsland,
}
