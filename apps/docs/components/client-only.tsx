import React from 'react';

export function ClientOnly({ children, ...delegated }) {
  const [hasMounted, setHasMounted] = React.useState(false);
  React.useEffect(() => {
    setHasMounted(true);
  }, []);
  if (!hasMounted) {
    return null;
  }
  return <div {...delegated}>{children}</div>;
}
