"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit, Eye, Trash2 } from "lucide-react"
import { getModifierTypes, deleteModifierType, type ModifierType } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function ModifierTypesPage() {
  const [modifierTypes, setModifierTypes] = useState<ModifierType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    loadModifierTypes()
  }, [])

  async function loadModifierTypes() {
    try {
      const data = await getModifierTypes()
      setModifierTypes(data)
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar os tipos de modificadores.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (key: string) => {
    try {
      await deleteModifierType(key)
      setModifierTypes(modifierTypes.filter((modifierType) => modifierType.key !== key))
      toast({
        title: "Sucesso",
        description: "Tipo de modificador excluído com sucesso.",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o tipo de modificador.",
        variant: "destructive",
      })
    }
  }

  const filteredModifierTypes = modifierTypes.filter(
    (modifierType) =>
      modifierType.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      modifierType.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tipos de Modificadores</h1>
        <Button onClick={() => router.push("/dashboard/modifier-types/new")}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Tipo de Modificador
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Tipos de Modificadores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar tipos de modificadores..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Restrições</TableHead>
                    <TableHead>Criado por</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredModifierTypes.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum tipo de modificador encontrado.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredModifierTypes.map((modifierType) => (
                      <TableRow key={modifierType.key}>
                        <TableCell className="font-medium">{modifierType.displayName}</TableCell>
                        <TableCell>{modifierType.description}</TableCell>
                        <TableCell>
                          {modifierType.valueRestrictions ? (
                            <Badge variant="secondary">
                              {modifierType.valueRestrictions.maxValues === 1
                                ? "Valor único"
                                : `Máx. ${modifierType.valueRestrictions.maxValues} valores`}
                            </Badge>
                          ) : (
                            <Badge variant="outline">Sem restrições</Badge>
                          )}
                        </TableCell>
                        <TableCell>{modifierType.createdBy}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/modifier-types/${modifierType.key}`)}
                          >
                            <Eye className="h-4 w-4" />
                            <span className="sr-only">Ver</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push(`/dashboard/modifier-types/${modifierType.key}/edit`)}
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Editar</span>
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-destructive" />
                                <span className="sr-only">Excluir</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir tipo de modificador</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir este tipo de modificador? Esta ação não pode ser
                                  desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(modifierType.key)}>
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
