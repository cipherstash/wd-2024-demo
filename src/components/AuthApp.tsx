"use client";
import { Auth0Provider } from "@auth0/auth0-react";
import { PropsWithChildren } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import React from "react";

function AppInner({ children }: PropsWithChildren<{}>) {
  const { isLoading, isAuthenticated, error, loginWithRedirect } = useAuth0();

  if (isLoading) {
    return <div>Loading...</div>;
  }
  if (error) {
    return <div>Oops... {error.message}</div>;
  }

  if (isAuthenticated) {
    return <>{children}</>;
  } else {
    return <button onClick={() => loginWithRedirect()}>Log in</button>;
  }
}

export default function AuthApp({ children }: PropsWithChildren<{}>) {
  const clientId = "PGZYQAtlpX9Dh3yWNb1PF2pZQZk03nKD";
  const domain = "cipherstash-dev.au.auth0.com";

  return (
    <>
      <Auth0Provider
        domain={domain}
        clientId={clientId}
        authorizationParams={{
          redirect_uri: "http://localhost:3001",
        }}
      >
        <AppInner>{children}</AppInner>
      </Auth0Provider>
    </>
  );
}
