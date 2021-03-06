import { Tooltip } from '@/components/ui/Tooltip'
import { useAcceptFriendRequestMutation } from '@/hooks/useAcceptFriendRequestMutation'
import { ReceivedFriendRequest as FriendRequest } from '@/hooks/usePendingFriendRequestQuery'
import { useRejectFriendRequestMutation } from '@/hooks/useRejectFriendRequestMutation'
import { formatMessageTimestamp } from '@/util/formatMessageTimestamp'
import 'twin.macro'

interface ReceivedFriendRequestProps {
  friendRequest: FriendRequest
}

function ReceivedFriendRequest({ friendRequest }: ReceivedFriendRequestProps) {
  const acceptMutation = useAcceptFriendRequestMutation()
  const rejectMutation = useRejectFriendRequestMutation()

  const onAccept = () => {
    acceptMutation.mutate({ friendRequestId: friendRequest.id })
  }

  const onReject = () => {
    rejectMutation.mutate({ friendRequestId: friendRequest.id })
  }

  return (
    <div tw="py-4 flex items-center space-x-4">
      <img
        src={friendRequest.fromUser.photo}
        alt={friendRequest.fromUser.name}
        tw="h-9 w-9 rounded-full"
      />

      <div tw="flex flex-1 items-center">
        <div tw="flex flex-col mr-6">
          <span tw="text-sm font-semibold text-gray-900">
            {friendRequest.fromUser.name}
          </span>
          <time
            dateTime={friendRequest.receivedAt}
            tw="text-xs font-medium text-gray-700"
          >
            {formatMessageTimestamp(friendRequest.receivedAt)}
          </time>
        </div>

        <div tw="ml-auto flex items-center space-x-4">
          <div className="group" tw="relative rounded-full">
            <Tooltip label="Accept" position="left">
              <button
                onClick={onAccept}
                tw="rounded-full bg-gray-200 group-hover:bg-gray-300 p-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  tw="h-5 w-5 text-gray-700 group-hover:text-green-500"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                <span tw="sr-only">Accept</span>
              </button>
            </Tooltip>
          </div>

          <div className="group" tw="relative rounded-full">
            <Tooltip label="Reject" position="left">
              <button
                onClick={onReject}
                tw="rounded-full bg-gray-200 group-hover:bg-gray-300 p-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  tw="h-5 w-5 text-gray-700 group-hover:text-red-600"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
                <span tw="sr-only">Reject</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReceivedFriendRequest
