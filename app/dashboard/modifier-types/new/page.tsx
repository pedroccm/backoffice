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

export default function NewModifierTypePage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    key: "",
    displayName: "",
    description: "",
    createdBy: "system",
    hasRestrictions: false,
    valueRestrictions: {
      maxValues: 1,
      restrictedCurrencies: [] as string[],
      restrictedProducts: [] as string[],
    },
  })
  const router = useRouter()
  const { toast } = useToast()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      hasRestrictions: checked,
    }))
  }

  const handleRestrictionChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      valueRestrictions: {
        ...prev.valueRestrictions,
        [field]: value,
      },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Format the data for API
      const modifierTypeData = {
        key: formData.key,
        displayName: formData.displayName,
        description: formData.description,
        createdBy: formData.createdBy,
        valueRestrictions: formData.hasRestrictions ? formData.valueRestrictions : null,
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

  const form = {
    handleSubmit,
    control: {
      register: (name: string) => ({
        name,
        value: formData[name as keyof typeof formData],
        onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => handleChange(e),
      }),
    },
  }

  const isLoading = loading

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Novo Modificador</h1>
      </div>
      <div className="grid gap-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
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
            <div className="flex items-center space-x-2">
              <Switch
                id="hasRestrictions"
                checked={formData.hasRestrictions}
                onCheckedChange={handleSwitchChange}
              />
              <Label htmlFor="hasRestrictions">Aplicar restrições de valores</Label>
            </div>

            {formData.hasRestrictions && (
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
                            value={field.value?.toString() || "1"}
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
                                checked={field.value.includes("curr-2")}
                                onCheckedChange={(checked) => {
                                  const currencies = [...field.value]
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
                                checked={field.value.includes("Essential Training")}
                                onCheckedChange={(checked) => {
                                  const products = [...field.value]
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
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Criar Modificador
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
