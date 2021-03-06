import firebase from '@/lib/firebase/client'
import { AuthProvider, FaunaAuthTokens } from '@/lib/types'
import { useFauna } from '@/hooks/useFauna'
import { silentRefresh } from '@/util/silentRefresh'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { ParsedUrlQuery } from 'node:querystring'
import 'twin.macro'

// Providers
const googleProvider = new firebase.auth.GoogleAuthProvider()
const githubProvider = new firebase.auth.GithubAuthProvider()
const auth = firebase.auth()

interface RouterQuery extends ParsedUrlQuery {
  next: string | undefined
}

function Login() {
  const router = useRouter()
  const { silentRefreshRef, setAccessToken } = useFauna()

  const signIn = (provider: AuthProvider) => {
    auth.useDeviceLanguage()
    auth
      .signInWithPopup(provider)
      .then(async result => {
        if (result.user) {
          const idToken = await result.user.getIdToken()
          const { secret, expInMs } = (await fetch('/api/fauna/login', {
            method: 'POST',
            headers: {
              authorization: `Bearer ${idToken}`,
            },
          }).then(res => res.json())) as FaunaAuthTokens['access']

          if (secret && expInMs) {
            setAccessToken(secret)

            const thirtySeconds = 30 * 1000
            const silentRefreshMs = expInMs - thirtySeconds

            silentRefreshRef.current = setInterval(async () => {
              try {
                const refreshedAccessToken = await silentRefresh()
                setAccessToken(refreshedAccessToken.secret)
              } catch (error) {
                console.error(error)
                await auth.signOut()
              }
            }, silentRefreshMs)

            const { next = '/app' } = router.query as RouterQuery
            router.push(next)
          }
        }
      })
      .catch(error => {
        console.error(error)
      })
  }

  const signInWithGoogle = () => signIn(googleProvider)
  const signInWithGithub = () => signIn(githubProvider)

  return (
    <div tw="min-h-screen flex items-center justify-center flex-col space-y-6">
      <h2 tw="mt-6 text-center text-4xl font-extrabold text-gray-900">
        Log in to Chatskee
      </h2>

      <div tw="flex flex-col space-y-3">
        <button
          type="button"
          onClick={() => signInWithGoogle()}
          tw="inline-flex items-center space-x-4 px-6 py-3 border border-gray-300 shadow-sm text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >
          <Image width={24} height={24} src="/google.png" alt="Google" />

          <span>Continue with Google</span>
        </button>

        <button
          type="button"
          onClick={() => signInWithGithub()}
          tw="inline-flex items-center space-x-4 px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            tw="h-6 w-6"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>

          <span>Continue with Github</span>
        </button>
      </div>
    </div>
  )
}

export default Login
