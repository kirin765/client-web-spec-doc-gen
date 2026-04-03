import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { MessageSquare, RefreshCw, Send } from 'lucide-react';
import { Seo } from '@/components/seo/Seo';
import { LoadingButton } from '@/components/common/LoadingButton';
import { useAuthStore } from '@/store/useAuthStore';
import {
  getChatRoom,
  listChatMessages,
  listChatRooms,
  markChatRoomRead,
  sendChatMessage,
} from '@/lib/api';
import type { ChatMessageItem, ChatRoomSummary } from '@/types/api';

function formatDateTime(value: string | null) {
  if (!value) {
    return '-';
  }

  return new Date(value).toLocaleString('ko-KR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

export function ChatPage() {
  const { roomId } = useParams<{ roomId?: string }>();
  const navigate = useNavigate();
  const token = useAuthStore((state) => state.token);
  const activeMode = useAuthStore((state) => state.activeMode);

  const [rooms, setRooms] = useState<ChatRoomSummary[]>([]);
  const [activeRoom, setActiveRoom] = useState<ChatRoomSummary | null>(null);
  const [messages, setMessages] = useState<ChatMessageItem[]>([]);
  const [draft, setDraft] = useState('');
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const visibleRooms = useMemo(
    () =>
      rooms.filter((room) =>
        activeMode === 'expert'
          ? room.counterparty.role === 'customer'
          : room.counterparty.role === 'developer',
      ),
    [activeMode, rooms],
  );

  useEffect(() => {
    if (!token) {
      return;
    }

    let canceled = false;

    const loadRooms = async () => {
      try {
        setIsLoadingRooms(true);
        const nextRooms = await listChatRooms(token);
        if (canceled) {
          return;
        }

        setRooms(nextRooms);

        const preferredRoomId =
          roomId && nextRooms.some((room) => room.id === roomId) ? roomId : nextRooms[0]?.id;

        if (preferredRoomId && preferredRoomId !== roomId) {
          navigate(`/chat/${preferredRoomId}`, { replace: true });
        }
      } catch (error) {
        if (!canceled) {
          setErrorMessage(error instanceof Error ? error.message : '채팅방을 불러오지 못했습니다.');
        }
      } finally {
        if (!canceled) {
          setIsLoadingRooms(false);
        }
      }
    };

    void loadRooms();

    return () => {
      canceled = true;
    };
  }, [navigate, roomId, token]);

  useEffect(() => {
    if (!token || !roomId) {
      setActiveRoom(null);
      setMessages([]);
      return;
    }

    let canceled = false;

    const loadRoomData = async () => {
      try {
        setIsLoadingMessages(true);
        setErrorMessage(null);
        const [room, messageResponse] = await Promise.all([
          getChatRoom(token, roomId),
          listChatMessages(token, roomId),
        ]);

        if (canceled) {
          return;
        }

        setActiveRoom(room);
        setMessages(messageResponse.data);
      } catch (error) {
        if (!canceled) {
          setErrorMessage(error instanceof Error ? error.message : '대화 내용을 불러오지 못했습니다.');
        }
      } finally {
        if (!canceled) {
          setIsLoadingMessages(false);
        }
      }
    };

    void loadRoomData();

    const pollId = window.setInterval(() => {
      void loadRoomData();
    }, 5000);

    return () => {
      canceled = true;
      window.clearInterval(pollId);
    };
  }, [roomId, token]);

  useEffect(() => {
    if (!token || !activeRoom || messages.length === 0) {
      return;
    }

    const latestMessage = messages[messages.length - 1];
    if (activeRoom.unreadCount === 0 || latestMessage.isMine) {
      return;
    }

    void markChatRoomRead(token, activeRoom.id, latestMessage.id).then(() => {
      setRooms((current) =>
        current.map((room) =>
          room.id === activeRoom.id
            ? {
                ...room,
                unreadCount: 0,
                participantState: {
                  ...room.participantState,
                  lastReadAt: latestMessage.createdAt,
                  lastReadMessageId: latestMessage.id,
                },
              }
            : room,
        ),
      );
      setActiveRoom((current) =>
        current
          ? {
              ...current,
              unreadCount: 0,
              participantState: {
                ...current.participantState,
                lastReadAt: latestMessage.createdAt,
                lastReadMessageId: latestMessage.id,
              },
            }
          : current,
      );
    }).catch(() => {});
  }, [activeRoom, messages, token]);

  if (!token) {
    return <Navigate to="/" replace />;
  }

  const handleSend = async () => {
    if (!token || !activeRoom || !draft.trim()) {
      return;
    }

    setIsSending(true);
    setErrorMessage(null);

    try {
      const created = await sendChatMessage(token, activeRoom.id, draft);
      setDraft('');
      setMessages((current) => [...current, created]);
      setRooms((current) =>
        current.map((room) =>
          room.id === activeRoom.id
            ? {
                ...room,
                lastMessage: created,
                lastMessageAt: created.createdAt,
                updatedAt: created.createdAt,
              }
            : room,
        ),
      );
      setActiveRoom((current) =>
        current
          ? {
              ...current,
              lastMessage: created,
              lastMessageAt: created.createdAt,
              updatedAt: created.createdAt,
            }
          : current,
      );
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : '메시지 전송에 실패했습니다.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-secondary-50 px-6 py-10">
      <Seo title="상담 채팅 | 웹사이트 견적 자동 생성기" description="고객과 개발자가 견적 상담을 진행합니다." noIndex />
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-secondary-100">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-body-sm font-semibold text-primary-600">상담 채팅</p>
              <h1 className="mt-2 text-3xl font-bold text-secondary-900">고객-개발자 대화</h1>
              <p className="mt-3 text-secondary-600">
                견적 공유가 시작된 프로젝트별로 대화를 이어갈 수 있습니다.
              </p>
            </div>
            <Link
              to="/mypage"
              className="rounded-lg border border-secondary-300 px-4 py-2 font-semibold text-secondary-700"
            >
              마이페이지로 돌아가기
            </Link>
          </div>
        </section>

        {errorMessage ? (
          <section className="rounded-2xl border border-error-200 bg-error-50 p-6 text-error-700">
            {errorMessage}
          </section>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-secondary-100">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-secondary-900">대화방</h2>
              <button
                type="button"
                onClick={() => token && void listChatRooms(token).then(setRooms).catch(() => {})}
                className="rounded-lg border border-secondary-300 p-2 text-secondary-600"
                aria-label="채팅방 새로고침"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {isLoadingRooms ? (
                <div className="rounded-xl border border-dashed border-secondary-300 p-6 text-center text-secondary-600">
                  불러오는 중...
                </div>
              ) : visibleRooms.length === 0 ? (
                <div className="rounded-xl border border-dashed border-secondary-300 p-6 text-center text-secondary-600">
                  아직 시작된 대화가 없습니다.
                </div>
              ) : (
                visibleRooms.map((room) => (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => navigate(`/chat/${room.id}`)}
                    data-testid={`chat-room-item-${room.id}`}
                    className={`w-full rounded-xl border p-4 text-left ${
                      room.id === roomId ? 'border-primary-300 bg-primary-50/60' : 'border-secondary-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-secondary-900">
                          {room.projectRequest?.projectName || '이름 없는 프로젝트'}
                        </p>
                        <p className="mt-1 truncate text-body-sm text-secondary-500">
                          {room.counterparty.displayName}
                        </p>
                      </div>
                      {room.unreadCount > 0 ? (
                        <span className="rounded-full bg-primary-600 px-2.5 py-1 text-xs font-semibold text-white">
                          {room.unreadCount}
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-2 line-clamp-2 text-body-sm text-secondary-600">
                      {room.lastMessage?.body || '아직 메시지가 없습니다.'}
                    </p>
                    <p className="mt-2 text-caption-sm text-secondary-400">
                      {formatDateTime(room.lastMessageAt)}
                    </p>
                  </button>
                ))
              )}
            </div>
          </aside>

          <section className="rounded-2xl bg-white shadow-sm ring-1 ring-secondary-100">
            {!activeRoom ? (
              <div className="flex min-h-[560px] flex-col items-center justify-center px-6 text-center text-secondary-600">
                <MessageSquare className="h-10 w-10 text-secondary-300" />
                <p className="mt-4 font-semibold">대화방을 선택해 주세요.</p>
              </div>
            ) : (
              <>
                <div className="border-b border-secondary-100 px-6 py-5">
                  <p className="text-body-sm font-semibold text-primary-600">
                    {activeRoom.projectRequest?.projectName || '프로젝트 상담'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-secondary-900">
                        {activeRoom.counterparty.displayName}
                      </h2>
                      <p className="mt-1 text-body-sm text-secondary-500">
                        상태: {activeRoom.quoteShare.status} · 최근 갱신 {formatDateTime(activeRoom.updatedAt)}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        activeRoom.canSendMessage
                          ? 'bg-success-50 text-success-700'
                          : 'bg-secondary-100 text-secondary-600'
                      }`}
                    >
                      {activeRoom.canSendMessage ? '메시지 가능' : '읽기 전용'}
                    </span>
                  </div>
                </div>

                <div
                  data-testid="chat-message-list"
                  className="min-h-[420px] space-y-3 bg-secondary-50/60 px-6 py-5"
                >
                  {isLoadingMessages ? (
                    <div className="rounded-xl border border-dashed border-secondary-300 p-6 text-center text-secondary-600">
                      대화를 불러오는 중...
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-secondary-300 bg-white p-8 text-center text-secondary-600">
                      아직 대화가 없습니다. 첫 메시지를 보내 보세요.
                    </div>
                  ) : (
                    messages.map((message) =>
                      message.type === 'system' ? (
                        <div key={message.id} className="text-center">
                          <span className="inline-flex rounded-full bg-secondary-200 px-3 py-1 text-xs font-medium text-secondary-700">
                            {message.body}
                          </span>
                        </div>
                      ) : (
                        <div
                          key={message.id}
                          className={`flex ${message.isMine ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xl rounded-2xl px-4 py-3 shadow-sm ${
                              message.isMine
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-secondary-800 ring-1 ring-secondary-200'
                            }`}
                          >
                            <p
                              className={`whitespace-pre-wrap break-words text-body-sm leading-6 ${
                                message.isMine ? 'text-white' : 'text-secondary-800'
                              }`}
                            >
                              {message.body}
                            </p>
                            <p
                              className={`mt-2 text-right text-xs ${
                                message.isMine ? 'text-primary-100' : 'text-secondary-400'
                              }`}
                            >
                              {formatDateTime(message.createdAt)}
                            </p>
                          </div>
                        </div>
                      ),
                    )
                  )}
                </div>

                <div className="border-t border-secondary-100 px-6 py-5">
                  <div className="flex gap-3">
                    <textarea
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      data-testid="chat-message-input"
                      rows={3}
                      disabled={!activeRoom.canSendMessage}
                      placeholder={
                        activeRoom.canSendMessage
                          ? '메시지를 입력하세요.'
                          : '이 대화방은 더 이상 메시지를 보낼 수 없습니다.'
                      }
                      className="min-h-[96px] flex-1 rounded-2xl border border-secondary-300 px-4 py-3 disabled:bg-secondary-100"
                    />
                    <LoadingButton
                      type="button"
                      loading={isSending}
                      loadingLabel="전송 중..."
                      data-testid="chat-send-button"
                      onClick={() => void handleSend()}
                      disabled={!activeRoom.canSendMessage || !draft.trim()}
                      className="inline-flex h-fit items-center gap-2 rounded-2xl bg-primary-600 px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-secondary-300"
                    >
                      <Send className="h-4 w-4" />
                      전송
                    </LoadingButton>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
