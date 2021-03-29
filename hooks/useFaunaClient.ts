import { useContext } from 'react'
import { FaunaClientContext } from '@/components/Providers/FaunaClient'

export function useFaunaClient() {
  const context = useContext(FaunaClientContext)

  if (!context) {
    throw new Error(
      `Can't use hook 'useFaunaClient' outside of a FaunaProvider`,
    )
  }

  return context.client
}
