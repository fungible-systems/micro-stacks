import type { GetServerSidePropsContext, GetStaticPropsContext, NextPageContext } from 'next';
import { StacksSessionState } from 'micro-stacks/connect';
import nookies, { destroyCookie, setCookie } from 'nookies';
import { PartialStacksSession, SessionCookie } from './types';
import { StacksNetwork } from 'micro-stacks/network';

function formatStacksNetworkCookie(payload: StacksNetwork) {
  return [payload.getCoreApiUrl(), payload.chainId];
}
function formatSessionCookie(payload: StacksSessionState) {
  return [
    payload.addresses.mainnet,
    payload.addresses.testnet,
    payload.identityAddress,
    payload.profile_url,
    payload.hubUrl,
  ];
}

export function parseSessionCookie(payload?: string): PartialStacksSession | null {
  if (!payload) return null;
  const parsed = JSON.parse(payload) as SessionCookie;
  return {
    addresses: {
      mainnet: parsed[0],
      testnet: parsed[1],
    },
    identityAddress: parsed[2],
    profile_url: parsed[3],
    hubUrl: parsed[4],
  };
}

export function getStacksSessionFromCookies(ctx: GetServerSidePropsContext | NextPageContext) {
  return nookies.get(ctx)?.StacksSessionState;
}
export function getStacksNetworkFromCookies(ctx: GetServerSidePropsContext | NextPageContext) {
  return nookies.get(ctx)?.StacksNetwork;
}

export function stacksSessionFromCtx(
  ctx: GetServerSidePropsContext | NextPageContext | GetStaticPropsContext
) {
  if ('preview' in ctx) {
    console.warn('GetStaticPropsContext cannot be passed to stacksSessionFromCtx');
    return { partialStacksSession: null };
  }
  const partialStacksSession = parseSessionCookie(
    getStacksSessionFromCookies(ctx as GetServerSidePropsContext | NextPageContext)
  );
  return {
    partialStacksSession,
    isSignedIn: !!partialStacksSession,
  };
}
export function stacksNetworkFromCtx(
  ctx: GetServerSidePropsContext | NextPageContext | GetStaticPropsContext
) {
  if ('preview' in ctx) {
    console.warn('GetStaticPropsContext cannot be passed to stacksNetworkFromCtx');
    return { partialStacksSession: null };
  }
  const partialStacksSession = parseSessionCookie(
    getStacksSessionFromCookies(ctx as GetServerSidePropsContext | NextPageContext)
  );
  return {
    partialStacksSession,
    isSignedIn: !!partialStacksSession,
  };
}

export function setSessionCookies(payload: StacksSessionState) {
  setCookie(null, 'StacksSessionState', JSON.stringify(formatSessionCookie(payload)), {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
}
export function setNetworkCookies(payload: StacksNetwork) {
  setCookie(null, 'StacksNetwork', JSON.stringify(formatStacksNetworkCookie(payload)), {
    maxAge: 30 * 24 * 60 * 60,
    path: '/',
  });
}

export function resetSessionCookies() {
  destroyCookie(null, 'StacksSessionState');
  destroyCookie(null, 'StacksNetwork');
}
