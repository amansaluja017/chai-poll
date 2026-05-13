import Responses from '#/components/Responses';
import Results from '#/components/Results';
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/poll/$pollId/results')({
  component: RouteComponent,
})

function RouteComponent() {
  const { pollId } = Route.useParams();

  return (
    <main className="min-h-screen p-6 md:p-12 font-sans w-full" style={{ paddingTop: '150px' }}>
      <div className="max-w-5xl mx-auto w-full space-y-16">
        <section>
          <Results pollId={pollId} />
        </section>

        <section className="pt-8 relative">
          <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-(--line) to-transparent opacity-60"></div>
          <Responses pollId={pollId} />
        </section>
      </div>
    </main>
  );
}
