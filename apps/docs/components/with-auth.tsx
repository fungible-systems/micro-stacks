import { useAuth } from '@micro-stacks/react';

export const WithAuth = ({ children }) => {
  const { isSignedIn, openAuthRequest } = useAuth();

  if (!isSignedIn)
    return (
      <button
        style={{
          margin: '2rem',
        }}
        onClick={() => openAuthRequest()}
      >
        Connect Stacks Wallet
      </button>
    );

  return children;
};
