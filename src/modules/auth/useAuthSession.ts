import { useSyncExternalStore } from 'react'
import { getAuthSnapshot, subscribeAuthSession } from './authStorage'

export function useAuthSession() {
  return useSyncExternalStore(subscribeAuthSession, getAuthSnapshot, getAuthSnapshot)
}
