import apiClient from '#/services/apiClient.service'
import { refresh } from '#/slice/authSlice'
import {
    createContext,
    useEffect,
    useState,
} from 'react'
import { useDispatch } from 'react-redux'

export type User = {
    _id: string;
    sub: string;
    email: string;
    given_name: string;
    family_name: string;
    name: string;
}

export type AuthContextType = {
    user: User | null
    accessToken: string | null
    setAccessToken: React.Dispatch<
        React.SetStateAction<string | null>
    >
    setUser: React.Dispatch<
        React.SetStateAction<User | null>
    >
    loading: boolean
    updateTokens: (token: string) => Promise<void>
}

export const AuthContext =
    createContext<AuthContextType | null>(null)

export function AuthProvider({
    children,
}: {
    children: React.ReactNode
}) {
    const [user, setUser] =
        useState<User | null>(null)

    const [accessToken, setAccessToken] =
        useState<string | null>(null)

    const [loading, setLoading] =
        useState(true);

    const dispatch = useDispatch();

    useEffect(() => {
        refreshAuth()
    }, [])

    const refreshAuth = async () => {
        try {
            const response = await apiClient.refresh();
            const data = response.data.data;

            setAccessToken(data.accessToken);
            setUser(data.user);

            dispatch(refresh(data.accessToken));
        } catch {
            setAccessToken(null)
            setUser(null)
        } finally {
            setLoading(false)
        }
    };

    const updateTokens = async (token: string) => {
        setAccessToken(token);
        dispatch(refresh(token));
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                accessToken,
                updateTokens,
                setAccessToken,
                setUser,
                loading,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
};
