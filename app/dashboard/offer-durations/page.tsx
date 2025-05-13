"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Trash } from "lucide-react"
import { getOfferDurations, type OfferDuration } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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
import { cn, formatDate } from "@/lib/utils"

export default function OfferDurationsPage() {
  const [offerDurations, setOfferDurations] = useState<OfferDuration[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function loadOfferDurations() {
      try {
        const data = await getOfferDurations()
        
        // Garantir que temos um array válido, mesmo que a API retorne algo inesperado
        if (!Array.isArray(data)) {
          console.warn("API retornou um formato inesperado:", data);
          setOfferDurations([]);
        } else {
          // Processar os dados para garantir a validade dos campos
          const processedData = data.map(duration => ({
            ...duration,
            months: Number(duration.months) || 0,
            discountPercentage: Number(duration.discountPercentage) || 0,
            createdAt: duration.createdAt || new Date().toISOString(),
            updatedAt: duration.updatedAt || new Date().toISOString()
          }));
          
          setOfferDurations(processedData);
        }
      } catch (error) {
        console.error("Erro ao carregar durações de ofertas:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as durações de ofertas.",
          variant: "destructive",
        })
        setOfferDurations([]);
      } finally {
        setLoading(false)
      }
    }

    loadOfferDurations()
  }, [toast])

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Durações de Ofertas</h1>
        <Button onClick={() => router.push("/dashboard/offer-durations/new")}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Duração
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Durações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center min-h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : offerDurations.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Nenhuma duração de oferta encontrada.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Meses</TableHead>
                  <TableHead>Desconto (%)</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Atualizado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offerDurations.map((duration) => {
                  // Função para formatar a data com segurança
                  const safeFormatDate = (dateString: string) => {
                    try {
                      if (!dateString) return 'Data não disponível';
                      const date = new Date(dateString);
                      // Verificar se a data é válida
                      if (isNaN(date.getTime())) return 'Data inválida';
                      return formatDate(date);
                    } catch (error) {
                      console.error('Erro ao processar data:', error);
                      return 'Data inválida';
                    }
                  };

                  return (
                    <TableRow key={duration.id}>
                      <TableCell>{duration.months}</TableCell>
                      <TableCell>{duration.discountPercentage}%</TableCell>
                      <TableCell>{safeFormatDate(duration.createdAt)}</TableCell>
                      <TableCell>{safeFormatDate(duration.updatedAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 