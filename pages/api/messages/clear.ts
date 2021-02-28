import { NextApiHandler } from 'next'
import {
  ClearMessagesDocument,
  ClearMessagesMutation,
  ClearMessagesMutationVariables,
} from '../../../generated/graphql'
import graphql from '../../../utils/graphql'

const handler: NextApiHandler = async (_req, res) => {
  const clearedMessages = await graphql.request<
    ClearMessagesMutation,
    ClearMessagesMutationVariables
  >(
    ClearMessagesDocument,
    {},
    {
      'x-hasura-admin-secret': process.env.HASURA_ADMIN_SECRET!,
    },
  )

  return res.json({
    clearedMessagesCount: clearedMessages.delete_messages?.affected_rows,
  })
}

export default handler