import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sua-chave-secreta-super-segura-rh-vagas-2026'
)

export interface UserSessionPayload {
  id: string
  name: string
  email: string
  role: 'ADMIN' | 'RECRUITER'
}

/**
 * Criptografa uma senha em texto puro usando bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10)
}

/**
 * Compara uma senha em texto puro com o hash salvo
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash)
}

/**
 * Gera um token JWT com dados da sessão
 */
export async function createJwtToken(payload: UserSessionPayload): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY)
}

/**
 * Verifica e decodifica um token JWT
 */
export async function verifyJwtToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY)
    return payload as unknown as UserSessionPayload
  } catch (error) {
    return null
  }
}

/**
 * Recupera o usuário logado a partir dos cookies do servidor
 */
export async function getCurrentUser(): Promise<UserSessionPayload | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('auth_token')?.value

  if (!token) return null
  return await verifyJwtToken(token)
}
