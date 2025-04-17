"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft } from "lucide-react"
import { createModifierType } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z.object({
  key: z.string().min(1, "A chave é obrigatória"),
  displayName: z.string().min(1, "O nome de exibição é obrigatório"),
  description: z.string().min(1, "A descrição é obrigatória"),
  hasRestrictions: z.boolean().default(false),
  valueRestrictions: z.object({
    maxValues: z.number().min(1).default(1),
    restrictedCurrencies: z.array(z.string()).default([]),
    restrictedProducts: z.array(z.string()).default([])
  }).optional()
})

type FormValues = z.infer<typeof formSchema>

export default function NewModifierTypePage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      key: "",
      displayName: "",
      description: "",
      hasRestrictions: false,
      valueRestrictions: {
        maxValues: 1,
        restrictedCurrencies: [],
        restrictedProducts: []
      }
    }
  })

  const hasRestrictions = form.watch("hasRestrictions")

  const onSubmit = async (data: FormValues) => {
    setLoading(true)

    try {
      const modifierTypeData = {
        key: data.key,
        displayName: data.displayName,
        description: data.description,
        createdBy: "system",
        valueRestrictions: data.hasRestrictions ? data.valueRestrictions : null,
      }

      await createModifierType(modifierTypeData)
      toast({
        title: "Sucesso!",
        description: "Modificador criado com sucesso.",
        variant: "success",
      })
      router.push("/dashboard/modifier-types")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o modificador.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Novo Modificador</h1>
      </div>
      <div className="grid gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: discount_percentage" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="displayName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Exibição</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Desconto Percentual" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Descreva o modificador" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="hasRestrictions"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel>Aplicar restrições de valores</FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {hasRestrictions && (
              <div className="grid gap-6 p-4 border rounded-md bg-muted/30">
                <h3 className="text-lg font-medium">Configuração de Restrições</h3>

                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="valueRestrictions.maxValues"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número Máximo de Valores</FormLabel>
                        <FormControl>
                          <Select
                            value={field.value?.toString()}
                            onValueChange={(value) => field.onChange(Number.parseInt(value))}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o número máximo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1 (Valor único)</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="5">5</SelectItem>
                              <SelectItem value="10">10</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    Limita o número de valores que podem ser associados a um produto com este modificador
                  </p>
                </div>

                <div className="grid gap-3">
                  <FormField
                    control={form.control}
                    name="valueRestrictions.restrictedCurrencies"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condições de Aplicação</FormLabel>
                        <FormControl>
                          <div className="grid gap-2">
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="restrictUSD"
                                checked={field.value?.includes("curr-2")}
                                onCheckedChange={(checked) => {
                                  const currencies = [...(field.value || [])]
                                  if (checked) {
                                    currencies.push("curr-2") // USD currency ID
                                  } else {
                                    const index = currencies.indexOf("curr-2")
                                    if (index !== -1) currencies.splice(index, 1)
                                  }
                                  field.onChange(currencies)
                                }}
                              />
                              <Label htmlFor="restrictUSD">Aplicar restrição para produtos em USD</Label>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Switch
                                id="restrictTraining"
                                checked={field.value?.includes("Essential Training")}
                                onCheckedChange={(checked) => {
                                  const products = [...(field.value || [])]
                                  if (checked) {
                                    products.push("Essential Training")
                                  } else {
                                    const index = products.indexOf("Essential Training")
                                    if (index !== -1) products.splice(index, 1)
                                  }
                                  field.onChange(products)
                                }}
                              />
                              <Label htmlFor="restrictTraining">Aplicar restrição para produto "Essential Training"</Label>
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <p className="text-sm text-muted-foreground">
                    Quando estas condições forem atendidas, as restrições de valores serão aplicadas
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.push("/dashboard/modifier-types")}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando...
                  </>
                ) : (
                  "Criar Modificador"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
