"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, Edit } from "lucide-react"
import { getModifierTypeByKey, type ModifierType } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { AlertDialog, AlertDialogTitle, AlertDialogDescription } from "@/components/ui/alert-dialog"

export default function ModifierTypeDetailPage({ params }: { params: { key: string } }) {
  const [modifierType, setModifierType] = useState<ModifierType | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadModifierType() {
      try {
        const data = await getModifierTypeByKey(params.key)
        setModifierType(data)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os detalhes do modificador.",
          variant: "destructive",
        })
        router.push("/dashboard/modifier-types")
      } finally {
        setLoading(false)
      }
    }

    loadModifierType()
  }, [params.key, router, toast])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!modifierType) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-xl font-semibold mb-2">Modificador não encontrado</h2>
        <Button onClick={() => router.push("/dashboard/modifier-types")}>Voltar para a lista</Button>
      </div>
    )
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/modifier-types")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-3xl font-bold">{modifierType.displayName}</h1>
        <div className="ml-auto">
          <Button onClick={() => router.push(`/dashboard/modifier-types/${modifierType.key}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalhes do Modificador</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Chave</h3>
              <p className="text-sm font-mono">{modifierType.key}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Nome de Exibição</h3>
              <p className="text-lg font-semibold">{modifierType.displayName}</p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Descrição</h3>
              <p className="text-sm">{modifierType.description}</p>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Restrições de Valores</h3>
              {modifierType.valueRestrictions ? (
                <div className="mt-2 space-y-4">
                  <div>
                    <Badge variant="secondary">
                      {modifierType.valueRestrictions.maxValues === 1
                        ? "Valor único"
                        : `Máximo de ${modifierType.valueRestrictions.maxValues} valores`}
                    </Badge>
                  </div>

                  {modifierType.valueRestrictions.restrictedCurrencies?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Moedas com restrição:</p>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {modifierType.valueRestrictions.restrictedCurrencies.map((currency) => (
                          <li key={currency}>{currency === "curr-2" ? "USD (Dólar Americano)" : currency}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {modifierType.valueRestrictions.restrictedProducts?.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">Produtos com restrição:</p>
                      <ul className="list-disc list-inside text-sm mt-1">
                        {modifierType.valueRestrictions.restrictedProducts.map((product) => (
                          <li key={product}>{product}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">Sem restrições de valores</p>
              )}
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Criado por</h3>
              <p className="text-sm">{modifierType.createdBy}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog>
        <AlertDialogTitle>Excluir Modificador</AlertDialogTitle>
        <AlertDialogDescription>
          Tem certeza que deseja excluir este modificador?
          Esta ação não pode ser desfeita.
        </AlertDialogDescription>
      </AlertDialog>
    </div>
  )
}
