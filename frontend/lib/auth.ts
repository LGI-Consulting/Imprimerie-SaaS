import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

interface AuthResult {
  success: boolean;
  token?: string;
  user?: any;
  message?: string;
}

export async function checkRole(request: Request, allowedRoles: string[]): Promise<AuthResult> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return {
        success: false,
        message: 'Non authentifié'
      };
    }

    // Vérifier le token JWT
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jwtVerify(token, secret);

    // Vérifier si l'utilisateur a le rôle requis
    if (!payload.role || !allowedRoles.includes(payload.role as string)) {
      return {
        success: false,
        message: 'Non autorisé'
      };
    }

    return {
      success: true,
      token,
      user: payload
    };
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return {
      success: false,
      message: 'Erreur d\'authentification'
    };
  }
} 