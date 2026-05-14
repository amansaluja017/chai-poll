import Responses, { type Responders } from '#/components/Responses';
import Results from '#/components/Results';
import type { PollResponse } from '#/services/apiClient.service';
import { useSocket } from '#/socket/use-socket';
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react';

export const Route = createFileRoute('/_protected/poll/$pollId/results')({
  component: RouteComponent,
})

function RouteComponent() {
  const [poll, setPoll] = useState<PollResponse | null>(null);
  const [responders, setResponders] = useState<Responders[]>([]);
  const { pollId } = Route.useParams();

  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.connect();

    socket.on("server:poll:response:result", (data: PollResponse) => {
      if (!data) return;

      setPoll(data);
    });

    socket.on("server:poll:response:responders", (data: Responders[]) => {
      if (!data) return;

      setResponders((data as Responders[]).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
    });

    return () => {
      socket.off();
    }
  }, [socket]);

  return (
    <main className="min-h-screen p-6 md:p-12 font-sans w-full" style={{ paddingTop: '150px' }}>
      <div className="max-w-5xl mx-auto w-full space-y-16">
        <section>
          <Results poll={poll as PollResponse} pollId={pollId} />
        </section>

        <section className="pt-8 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-(--line) to-transparent opacity-60"></div>
          <Responses pollId={pollId} responders={responders} />
        </section>
      </div>
    </main>
  );
}
