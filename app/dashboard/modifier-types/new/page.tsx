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
        title: "Sucesso",
        description: "Tipo de modificador criado com sucesso.",
      })
      router.push("/dashboard/modifier-types")
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar o tipo de modificador.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push("/dashboard/modifier-types")}>
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <h1 className="text-3xl font-bold">Novo Tipo de Modificador</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Informações do Tipo de Modificador</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid gap-3">
                <Label htmlFor="key">Chave</Label>
                <Input
                  id="key"
                  name="key"
                  value={formData.key}
                  onChange={handleChange}
                  placeholder="Ex: discount_percentage"
                  required
                />
                <p className="text-sm text-muted-foreground">
                  Identificador único para este tipo de modificador (sem espaços, use underscore)
                </p>
              </div>

              <div className="grid gap-3">
                <Label htmlFor="displayName">Nome de Exibição</Label>
                <Input
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Ex: Desconto Percentual"
                  required
                />
              </div>

              <div className="grid gap-3">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Descreva o tipo de modificador"
                  required
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="hasRestrictions" checked={formData.hasRestrictions} onCheckedChange={handleSwitchChange} />
                <Label htmlFor="hasRestrictions">Aplicar restrições de valores</Label>
              </div>

              {formData.hasRestrictions && (
                <div className="grid gap-6 p-4 border rounded-md bg-muted/30">
                  <h3 className="text-lg font-medium">Configuração de Restrições</h3>

                  <div className="grid gap-3">
                    <Label htmlFor="maxValues">Número Máximo de Valores</Label>
                    <Select
                      value={formData.valueRestrictions.maxValues.toString()}
                      onValueChange={(value) => handleRestrictionChange("maxValues", Number.parseInt(value))}
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
                    <p className="text-sm text-muted-foreground">
                      Limita o número de valores que podem ser associados a um produto com este modificador
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <Label>Condições de Aplicação</Label>
                    <div className="grid gap-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="restrictUSD"
                          checked={formData.valueRestrictions.restrictedCurrencies.includes("curr-2")}
                          onCheckedChange={(checked) => {
                            const currencies = [...formData.valueRestrictions.restrictedCurrencies]
                            if (checked) {
                              currencies.push("curr-2") // USD currency ID
                            } else {
                              const index = currencies.indexOf("curr-2")
                              if (index !== -1) currencies.splice(index, 1)
                            }
                            handleRestrictionChange("restrictedCurrencies", currencies)
                          }}
                        />
                        <Label htmlFor="restrictUSD">Aplicar restrição para produtos em USD</Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="restrictTraining"
                          checked={formData.valueRestrictions.restrictedProducts.includes("Essential Training")}
                          onCheckedChange={(checked) => {
                            const products = [...formData.valueRestrictions.restrictedProducts]
                            if (checked) {
                              products.push("Essential Training")
                            } else {
                              const index = products.indexOf("Essential Training")
                              if (index !== -1) products.splice(index, 1)
                            }
                            handleRestrictionChange("restrictedProducts", products)
                          }}
                        />
                        <Label htmlFor="restrictTraining">Aplicar restrição para produto "Essential Training"</Label>
                      </div>
                    </div>
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
                  {loading ? "Criando..." : "Criar Tipo de Modificador"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
