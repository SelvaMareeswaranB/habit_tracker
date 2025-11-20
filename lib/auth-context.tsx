import React, { createContext, useContext, useEffect, useState } from "react";
import { ID, Models } from "react-native-appwrite";
import { account } from "./appwrite";

type AuthContextType = {
  user: Models.User<Models.Preferences> | null;
  signUp: (email: string, password: string) => Promise<string | null>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
  isFetchingSession: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  //appwrite user object
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );

  //fetching indicator
  const [isFetchingSession, setIsFetchingSession] = useState(true);

  useEffect(() => {
    getUserSession();
  }, []);

  //appwrite getUserSession
  const getUserSession = async () => {
    try {
      const session = await account.get();
      setUser(session);
    } catch (error) {
      setUser(null);
    } finally {
      setIsFetchingSession(false);
    }
  };

  //appwrite signUp
  const signUp = async (email: string, password: string) => {
    try {
      await account.create(ID.unique(), email, password);
      await signIn(email, password);

      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "An error occured during sign up";
    }
  };

  //appwrite signIn
  const signIn = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      await getUserSession();
      return null;
    } catch (error) {
      if (error instanceof Error) {
        return error.message;
      }
      return "An error occured during sign in";
    }
  };

  //appwrite signOut
  const signOut = async () => {
    try {
      await account.deleteSession("current");
    } catch (error: any) {
      setUser(null);
      if (!error.message?.includes("missing scopes")) {
        console.error(error);
      }
    } finally {
      setUser(null);
    }
  };
  return (
    <AuthContext.Provider
      value={{ user, signIn, signUp, signOut, isFetchingSession }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be inside of auth provider");
  }
  return context;
}
