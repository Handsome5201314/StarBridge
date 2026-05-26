import { useEffect, useMemo, useReducer, useRef, type PropsWithChildren } from 'react'
import {
  claimInvite,
  completeLevelRemote,
  completeRealLifeTaskRemote,
  loadGameBootstrap,
  SESSION_TOKEN_STORAGE_KEY,
} from '../services/apiClient'
import type { GameActions } from './gameStoreCore'
import {
  createActions,
  gameReducer,
  GameStoreContext,
  loadProgress,
  STORAGE_KEY,
} from './gameStoreCore'

export function GameProvider({ children }: PropsWithChildren) {
  const [progress, dispatch] = useReducer(gameReducer, undefined, loadProgress)
  const sessionTokenRef = useRef<string | null>(null)
  const remoteReadyRef = useRef(false)
  const localActions = useMemo(() => createActions(dispatch), [])
  const actions = useMemo<GameActions>(
    () => ({
      completeLevel(result) {
        localActions.completeLevel(result)

        const sessionToken = sessionTokenRef.current
        if (!sessionToken || !remoteReadyRef.current) {
          return
        }

        completeLevelRemote(sessionToken, result.levelId)
          .then((response) => {
            dispatch({ type: 'replaceProgress', progress: response.progress })
          })
          .catch(() => {
            remoteReadyRef.current = false
          })
      },
      collectCards(cardIds) {
        localActions.collectCards(cardIds)
      },
      addStars(count) {
        localActions.addStars(count)
      },
      updateBadgeProgress(result) {
        localActions.updateBadgeProgress(result)
      },
      generateRealLifeTask(result) {
        localActions.generateRealLifeTask(result)
      },
      completeRealLifeTask(taskId) {
        localActions.completeRealLifeTask(taskId)

        const sessionToken = sessionTokenRef.current
        if (!sessionToken || !remoteReadyRef.current) {
          return
        }

        completeRealLifeTaskRemote(sessionToken, taskId)
          .then((response) => {
            dispatch({ type: 'replaceProgress', progress: response.progress })
          })
          .catch(() => {
            remoteReadyRef.current = false
          })
      },
      addBuddyExp(exp) {
        localActions.addBuddyExp(exp)
      },
      resetDemoProgress() {
        window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY)
        sessionTokenRef.current = null
        remoteReadyRef.current = false
        localActions.resetDemoProgress()
      },
    }),
    [localActions],
  )
  const value = useMemo(() => ({ progress, actions }), [actions, progress])

  useEffect(() => {
    let isCurrent = true

    async function connectSession() {
      try {
        let sessionToken = window.localStorage.getItem(SESSION_TOKEN_STORAGE_KEY)

        if (!sessionToken) {
          const claim = await claimInvite()
          sessionToken = claim.sessionToken
          window.localStorage.setItem(SESSION_TOKEN_STORAGE_KEY, sessionToken)
        }

        const bootstrap = await loadGameBootstrap(sessionToken)

        if (!isCurrent) {
          return
        }

        sessionTokenRef.current = sessionToken
        remoteReadyRef.current = true
        dispatch({ type: 'replaceProgress', progress: bootstrap.progress })
      } catch {
        if (!isCurrent) {
          return
        }

        window.localStorage.removeItem(SESSION_TOKEN_STORAGE_KEY)
        sessionTokenRef.current = null
        remoteReadyRef.current = false
      }
    }

    void connectSession()

    return () => {
      isCurrent = false
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
  }, [progress])

  return <GameStoreContext.Provider value={value}>{children}</GameStoreContext.Provider>
}
