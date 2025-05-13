'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { categoriesDepensesService } from '@/lib/api/categoriesDepenses.service';
import { rapportsDepensesService } from '@/lib/api/rapportsDepenses.service';
import { mouvementsDepensesService } from '@/lib/api/mouvementsDepenses.service';
import { CategorieDepense, MouvementDepense, RapportDepense, TypeCategorie } from '@/types/depenses';

export default function DepensesPage() {
  const [activeTab, setActiveTab] = useState('mouvements');
  const [categories, setCategories] = useState<CategorieDepense[]>([]);
  const [mouvements, setMouvements] = useState<MouvementDepense[]>([]);
  const [rapports, setRapports] = useState<RapportDepense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // État pour le formulaire de mouvement
  const [nouveauMouvement, setNouveauMouvement] = useState({
    type_mouvement: 'sortie',
    montant: '',
    categorie: '',
    description: '',
  });

  // État pour le formulaire de catégorie
  const [nouvelleCategorie, setNouvelleCategorie] = useState<{
    nom: string;
    description: string;
    type: TypeCategorie;
  }>({
    nom: '',
    description: '',
    type: 'caisse',
  });

  // Charger les données initiales
  useEffect(() => {
    loadCategories();
    loadMouvements();
    loadRapports();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await categoriesDepensesService.getAll();
      if (response.success) {
        setCategories(response.data);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les catégories',
        variant: 'destructive',
      });
    }
  };

  const loadMouvements = async () => {
    try {
      const dateDebut = new Date();
      dateDebut.setMonth(dateDebut.getMonth() - 1);
      const response = await mouvementsDepensesService.getAll(
        dateDebut.toISOString(),
        new Date().toISOString()
      );
      if (response.success) {
        setMouvements(response.data);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les mouvements',
        variant: 'destructive',
      });
    }
  };

  const loadRapports = async () => {
    try {
      const dateDebut = new Date();
      dateDebut.setMonth(dateDebut.getMonth() - 1);
      const response = await rapportsDepensesService.getRapportGeneral(
        dateDebut.toISOString(),
        new Date().toISOString()
      );
      if (response.success) {
        setRapports(response.data.mouvements);
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les rapports',
        variant: 'destructive',
      });
    }
  };

  const handleAjouterMouvement = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await mouvementsDepensesService.create({
        type_mouvement: nouveauMouvement.type_mouvement as 'entrée' | 'sortie',
        montant: parseFloat(nouveauMouvement.montant),
        categorie: nouveauMouvement.categorie,
        description: nouveauMouvement.description,
      });
      if (response.success) {
        toast({
          title: 'Succès',
          description: 'Mouvement enregistré avec succès',
        });
        setNouveauMouvement({
          type_mouvement: 'sortie',
          montant: '',
          categorie: '',
          description: '',
        });
        loadMouvements();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'enregistrer le mouvement',
        variant: 'destructive',
      });
    }
  };

  const handleAjouterCategorie = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await categoriesDepensesService.create({
        ...nouvelleCategorie,
        type: nouvelleCategorie.type as TypeCategorie
      });
      if (response.success) {
        toast({
          title: 'Succès',
          description: 'Catégorie ajoutée avec succès',
        });
        setNouvelleCategorie({
          nom: '',
          description: '',
          type: 'caisse',
        });
        loadCategories();
      }
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible d\'ajouter la catégorie',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <h1 className="text-2xl font-bold">Gestion des Dépenses</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="mouvements">Mouvements</TabsTrigger>
          <TabsTrigger value="categories">Catégories</TabsTrigger>
          <TabsTrigger value="rapports">Rapports</TabsTrigger>
        </TabsList>

        {/* Onglet Mouvements */}
        <TabsContent value="mouvements">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Nouveau Mouvement</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAjouterMouvement} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Type</Label>
                      <Select
                        value={nouveauMouvement.type_mouvement}
                        onValueChange={(value) =>
                          setNouveauMouvement({ ...nouveauMouvement, type_mouvement: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entrée">Entrée</SelectItem>
                          <SelectItem value="sortie">Sortie</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Montant</Label>
                      <Input
                        type="number"
                        value={nouveauMouvement.montant}
                        onChange={(e) =>
                          setNouveauMouvement({ ...nouveauMouvement, montant: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Catégorie</Label>
                    <Select
                      value={nouveauMouvement.categorie}
                      onValueChange={(value) =>
                        setNouveauMouvement({ ...nouveauMouvement, categorie: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat.categorie_id} value={cat.nom}>
                            {cat.nom}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={nouveauMouvement.description}
                      onChange={(e) =>
                        setNouveauMouvement({ ...nouveauMouvement, description: e.target.value })
                      }
                    />
                  </div>
                  <Button type="submit">Enregistrer le mouvement</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Derniers Mouvements</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Catégorie</TableHead>
                      <TableHead>Montant</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mouvements.map((mouvement) => (
                      <TableRow key={mouvement.mouvement_id}>
                        <TableCell>{new Date(mouvement.date_mouvement).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={mouvement.type_mouvement === 'entrée' ? 'default' : 'destructive'}>
                            {mouvement.type_mouvement}
                          </Badge>
                        </TableCell>
                        <TableCell>{mouvement.categorie}</TableCell>
                        <TableCell>{mouvement.montant} €</TableCell>
                        <TableCell>{mouvement.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Catégories */}
        <TabsContent value="categories">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Nouvelle Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAjouterCategorie} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Nom</Label>
                    <Input
                      value={nouvelleCategorie.nom}
                      onChange={(e) =>
                        setNouvelleCategorie({ ...nouvelleCategorie, nom: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={nouvelleCategorie.description}
                      onChange={(e) =>
                        setNouvelleCategorie({ ...nouvelleCategorie, description: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={nouvelleCategorie.type}
                      onValueChange={(value) =>
                        setNouvelleCategorie({ ...nouvelleCategorie, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="caisse">Caisse</SelectItem>
                        <SelectItem value="exploitant">Exploitant</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit">Ajouter la catégorie</Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Liste des Catégories</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {categories.map((categorie) => (
                      <TableRow key={categorie.categorie_id}>
                        <TableCell>{categorie.nom}</TableCell>
                        <TableCell>{categorie.description}</TableCell>
                        <TableCell>
                          <Badge variant={categorie.type === 'caisse' ? 'default' : 'secondary'}>
                            {categorie.type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={categorie.est_active ? 'default' : 'destructive'}>
                            {categorie.est_active ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Onglet Rapports */}
        <TabsContent value="rapports">
          <Card>
            <CardHeader>
              <CardTitle>Rapport des Dépenses</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Entrées</TableHead>
                    <TableHead>Sorties</TableHead>
                    <TableHead>Solde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rapports.map((rapport, index) => (
                    <TableRow key={index}>
                      <TableCell>{new Date(rapport.date).toLocaleDateString()}</TableCell>
                      <TableCell>{rapport.categorie}</TableCell>
                      <TableCell>{rapport.entrees} €</TableCell>
                      <TableCell>{rapport.depenses} €</TableCell>
                      <TableCell>{rapport.solde} €</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 