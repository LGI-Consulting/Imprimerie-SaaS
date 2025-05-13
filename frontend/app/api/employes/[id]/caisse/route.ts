import { NextResponse } from 'next/server';
import { checkRole } from '@/lib/auth';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les permissions
    const authResult = await checkRole(request, ['admin', 'caisse']);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Non autorisé' },
        { status: 401 }
      );
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employes/${params.id}/caisse`, {
      headers: {
        'Authorization': `Bearer ${authResult.token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.message || 'Erreur lors de la récupération de la caisse' },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Erreur lors de la récupération de la caisse:', error);
    return NextResponse.json(
      { success: false, message: 'Erreur serveur' },
      { status: 500 }
    );
  }
} 