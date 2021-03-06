import firebase from '@/lib/firebase/client'
import { ComponentType, useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'
import { useFauna } from '@/hooks/useFauna'
import { silentRefresh } from '@/util/silentRefresh'

const auth = firebase.auth()

const defaultOnRedirecting = () => <></>

interface WithAuthenticationRequiredOptions {
  /**
   * ```js
   * withAuthenticationRequired(Profile, {
   *   onRedirecting: () => <div>Redirecting you to the login...</div>
   * })
   * ```
   *
   * Render a message to show that the user is being redirected to the login.
   */
  onRedirecting?: () => JSX.Element
}

const withAuthenticationRequired = <P extends object>(
  Component: ComponentType<P>,
  options: WithAuthenticationRequiredOptions = {},
) => {
  return function WithAuthenticationRequired(props: P) {
    const [user, loading, error] = useAuthState(auth)
    const { onRedirecting = defaultOnRedirecting } = options
    const router = useRouter()
    const { setAccessToken, silentRefreshRef } = useFauna()
    const [isRefreshing, setIsRefreshing] = useState(!silentRefreshRef.current)

    const redirectToLogin = useCallback(() => {
      const nextPath = router.asPath
      router.push(`/login?next=${encodeURIComponent(nextPath)}`)
    }, [router])

    useEffect(() => {
      if (!silentRefreshRef.current) {
        silentRefresh()
          .then(({ secret, expInMs }) => {
            setAccessToken(secret)

            const thirtySeconds = 30 * 1000
            const silentRefreshMs = expInMs - thirtySeconds

            silentRefreshRef.current = setInterval(async () => {
              try {
                const refreshedAccessToken = await silentRefresh()
                setAccessToken(refreshedAccessToken.secret)
              } catch (error) {
                console.error(error)
                try {
                  await auth.signOut()
                } catch (error) {
                } finally {
                  redirectToLogin()
                }
              }
            }, silentRefreshMs)

            setIsRefreshing(false)
          })
          .catch(async () => {
            try {
              await auth.signOut()
            } catch (error) {
            } finally {
              redirectToLogin()
            }
          })
      }
    }, [redirectToLogin, setAccessToken, silentRefreshRef])

    const errorAuthenticating = !loading && (!user || error)
    if (errorAuthenticating) {
      redirectToLogin()
    }

    const success = !!user && !isRefreshing
    return success ? <Component {...props} /> : onRedirecting()
  }
}

export default withAuthenticationRequired
