import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: "Django",

            credentials: {
                username: { label: "Username", type: "text" },
                password: { label: "Password", type: "password" },
                assertion: { label: "Assertion", type: "text" },
                challenge_id: { label: "Challenge ID", type: "text" },
                isPasskey: { label: "IsPasskey", type: "text" }
            },
            async authorize(credentials) {
                try {
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';
                    let res;


                    if (credentials?.isPasskey === 'true') {
                        console.log("➡️ Enviando verificación de Passkey a Django...");
                        const verifyUrl = `${backendUrl}/api/auth/passkey/login/verify/`;

                        res = await fetch(verifyUrl, {
                            method: 'POST',
                            body: JSON.stringify({
                                challenge_id: credentials.challenge_id,
                                assertion: JSON.parse(credentials.assertion as string)
                            }),
                            headers: { "Content-Type": "application/json" }
                        });

                    }

                    else {
                        console.log("➡️ Enviando Login normal a Django...");
                        const loginUrl = `${backendUrl}/api/token/`;

                        res = await fetch(loginUrl, {
                            method: 'POST',
                            body: JSON.stringify({
                                username: credentials?.username,
                                password: credentials?.password
                            }),
                            headers: { "Content-Type": "application/json" }
                        });
                    }

                    const data = await res.json();
                    console.log("⬅️ Status de Django:", res.status);


                    if (res.ok && data.access) {
                        console.log("✅ Acceso concedido para:", data.username);
                        return {
                            id: data.username,
                            name: data.username,
                            accessToken: data.access,
                            refreshToken: data.refresh,
                        } as any;
                    }


                    console.log("❌ Rechazado por backend:", data);
                    return null;

                } catch (e) {
                    console.error("🚨 Error crítico de fetch:", e);
                    return null;
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.accessToken = (user as any).accessToken;
                token.refreshToken = (user as any).refreshToken;
            }
            return token;
        },
        async session({ session, token }) {
            (session as any).accessToken = token.accessToken;
            return session;
        }
    },
    pages: {
        signIn: '/login',
    },
    session: { strategy: "jwt" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };