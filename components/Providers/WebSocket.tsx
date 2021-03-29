import {
  createContext,
  ReactNode,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { connect, Connection } from '@/lib/ws/raw'
import useUser from '@/hooks/useUser'

type V = Connection | null

interface IWebSocketContext {
  conn: V
}

export const WebSocketContext = createContext<IWebSocketContext>({
  conn: null,
})

interface WebSocketProviderProps {
  children: ReactNode
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const user = useUser()
  const [conn, setConn] = useState<V>(null)
  const isConnecting = useRef(false)

  useEffect(() => {
    if (!conn && !isConnecting.current && !!user) {
      isConnecting.current = true

      user.getIdToken().then(token => {
        connect(token)
          .then(x => setConn(x))
          .catch(err => console.error(err))
          .finally(() => {
            isConnecting.current = false
          })
      })
    }
  }, [conn, user])

  const value = useMemo<IWebSocketContext>(
    () => ({
      conn,
    }),
    [conn],
  )

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  )
}
