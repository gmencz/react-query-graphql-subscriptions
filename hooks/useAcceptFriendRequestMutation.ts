import { query as q } from 'faunadb'
import { useRouter } from 'next/router'
import { useMutation, useQueryClient } from 'react-query'
import { useFauna } from './useFauna'
import {
  directMessage,
  DirectMessageMutation,
} from './useDirectMessageMutation'

interface AcceptFriendRequestVariables {
  friendRequestId: string
}

export function useAcceptFriendRequestMutation() {
  const { client, accessToken } = useFauna()
  const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation<
    DirectMessageMutation,
    unknown,
    AcceptFriendRequestVariables
  >(
    variables => {
      return client.query(
        q.Let(
          {
            friendRequestRef: q.Ref(
              q.Collection('user_friend_requests'),
              variables.friendRequestId,
            ),
            friendRequestDoc: q.Get(q.Var('friendRequestRef')),
            userRef: q.Select(['data', 'userRef'], q.Var('friendRequestDoc')),
            friendRef: q.Select(
              ['data', 'friendRef'],
              q.Var('friendRequestDoc'),
            ),
            userToAddRef: q.If(
              q.Equals(q.CurrentIdentity(), q.Var('userRef')),
              q.Var('friendRef'),
              q.Var('userRef'),
            ),
          },
          q.Do(
            q.Delete(q.Var('friendRequestRef')),

            q.Let(
              {
                friend: q.Create(q.Collection('user_friends'), {
                  data: {
                    user1Ref: q.CurrentIdentity(),
                    user2Ref: q.Var('userToAddRef'),
                    friendedAt: q.Now(),
                  },
                }),
                friendId: q.Select(['data', 'user2Ref', 'id'], q.Var('friend')),
              },
              directMessage({ friendId: q.Var('friendId') as string }),
            ),
          ),
        ),
        {
          secret: accessToken,
        },
      )
    },
    {
      onSuccess: data => {
        queryClient.invalidateQueries('pendingFriendRequests')
        queryClient.invalidateQueries('dms').then(() => {
          router.push(`/app/dms/${data.directMessageId}/${data.channelId}`)
        })
      },
    },
  )
}
