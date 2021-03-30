import firebase from '@/lib/firebase/client'
import {
  ComponentType,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useRouter } from 'next/router'
import { useAuthState } from 'react-firebase-hooks/auth'
import { silentRefresh } from '@/util/silentRefresh'
import { useFaunaStore } from '@/hooks/useFaunaStore'
import { WebSocketContext } from '../Providers/WebSocket'

const auth = firebase.auth()

const defaultOnAuthenticating = () => <>Authenticating...</>

interface WithAuthenticationRequiredOptions {
  /**
   * ```js
   * withAuthenticationRequired(Profile, {
   *   onAuthenticating: () => <div>Redirecting you to the login...</div>
   * })
   * ```
   *
   * Render a message to show that the user is being redirected to the login.
   */
  onAuthenticating?: () => JSX.Element
}

const withAuthenticationRequired = <P extends object>(
  Component: ComponentType<P>,
  options: WithAuthenticationRequiredOptions = {},
) => {
  return function WithAuthenticationRequired(props: P) {
    const [user, loading, error] = useAuthState(auth)
    const { onAuthenticating = defaultOnAuthenticating } = options
    const router = useRouter()
    const accessToken = useFaunaStore(state => state.accessToken)
    const setAccessToken = useFaunaStore(state => state.setAccessToken)
    const [isRefreshing, setIsRefreshing] = useState(!accessToken)
    const { conn } = useContext(WebSocketContext)

    const redirectToLogin = useCallback(() => {
      router.push(`/login?next=${window.location.pathname}`)
    }, [router])

    useEffect(() => {
      if (!accessToken) {
        silentRefresh()
          .then(({ secret, expInMs }) => {
            setAccessToken(secret)

            const thirtySeconds = 30 * 1000
            const silentRefreshMs = expInMs - thirtySeconds

            setInterval(async () => {
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
    }, [accessToken, redirectToLogin, setAccessToken])

    const errorAuthenticating = !loading && (!user || error)
    if (errorAuthenticating) {
      redirectToLogin()
    }

    const success = !!user && !isRefreshing && !!conn
    return success ? <Component {...props} /> : onAuthenticating()
  }
}

export default withAuthenticationRequired