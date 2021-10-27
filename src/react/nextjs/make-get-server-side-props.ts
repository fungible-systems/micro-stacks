import { stacksSessionFromCtx } from './cookies';
import { getServerSideQueryProps, Queries } from 'jotai-query-toolkit/nextjs';
import { GetServerSideProps, GetServerSidePropsContext, NextPageContext } from 'next';
import { QueriesLiteral, queryMap } from './query-map';
import { PartialStacksSession } from './types';

type GetQueriesFromServerSideProps = (params: {
  ctx: NextPageContext | GetServerSidePropsContext;
  session: PartialStacksSession | null;
}) => Queries | null;

const getBuiltInQuery = (
  query: QueriesLiteral,
  {
    session,
    networkUrl = 'https://stacks-node-api.mainnet.stacks.co',
  }: { session: PartialStacksSession | null; networkUrl?: string }
): Queries[number] | undefined => {
  const match = query in queryMap;
  if (match && session) return queryMap[query](session, networkUrl);
};

export const makeGetServerSideProps = (
  queries: (QueriesLiteral | GetQueriesFromServerSideProps)[],
  getServerSideProps?: GetServerSideProps
) => {
  return getServerSideQueryProps(context => {
    const session = stacksSessionFromCtx(context).partialStacksSession;
    const ctx = context as NextPageContext | GetServerSidePropsContext;

    const builtIn = queries.filter(item => typeof item === 'string') as QueriesLiteral[];

    const custom = queries.filter(
      item => typeof item === 'function'
    ) as GetQueriesFromServerSideProps[];

    const final: Queries = [];
    const builtInQueries = builtIn
      .map(item => getBuiltInQuery(item, { session }))
      .filter(Boolean) as Queries;

    custom.forEach(queryBuilder => {
      const q = queryBuilder({
        ctx,
        session,
      });
      if (q?.length) final.push(...q);
    });

    final.push(...builtInQueries);

    return builtInQueries;
  })(async context => {
    const serverProps = (await getServerSideProps?.(context)) || {};
    const session = stacksSessionFromCtx(context);
    const props = {
      ...session,
      ...serverProps,
    };
    return {
      props,
    };
  });
};
