"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarIcon, FileText, Download } from "lucide-react"
import { format } from "date-fns"
import { pt } from "date-fns/locale"
import { ContractPreview } from "@/components/contract-preview"
import { contractTemplates, generatePdfFromHtml, type ContractData } from "@/lib/pdf-generator"
import { getGuidelines, type Product, type Guideline } from "@/lib/api-client"
import { useToast } from "@/components/ui/use-toast"

interface ContractGeneratorProps {
  product: Product
}

export function ContractGenerator({ product }: ContractGeneratorProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("customize")
  const [allGuidelines, setAllGuidelines] = useState<Guideline[]>([])
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)

  const [contractData, setContractData] = useState<ContractData>({
    product,
    companyName: "V4 Company SA",
    customerName: "",
    contractDate: format(new Date(), "dd/MM/yyyy"),
    expirationDate: format(new Date(new Date().setMonth(new Date().getMonth() + 6)), "dd/MM/yyyy"),
    additionalTerms: "",
    selectedGuidelines: product.guidelines || [],
    signatureRequired: true,
  })

  const [selectedTemplate, setSelectedTemplate] = useState(contractTemplates[0])
  const [contractDate, setContractDate] = useState<Date>(new Date())
  const [expirationDate, setExpirationDate] = useState<Date>(new Date(new Date().setMonth(new Date().getMonth() + 6)))
  const [additionalGuidelineIds, setAdditionalGuidelineIds] = useState<string[]>([])
  const [selectedGuidelines, setSelectedGuidelines] = useState<string[]>([])
  const availableGuidelines = allGuidelines.filter(
    (guideline) => !product.guidelines.map((g) => g.id).includes(guideline.id),
  )

  useEffect(() => {
    async function loadGuidelines() {
      setLoading(true)
      try {
        const guidelines = await getGuidelines()

        // Filter out guidelines that are already associated with the product
        const productGuidelineIds = product.guidelines.map((g) => g.id)
        const additionalGuidelines = guidelines.filter((g) => !productGuidelineIds.includes(g.id))

        setAllGuidelines(additionalGuidelines)

        // Pre-select product guidelines
        if (product.guidelines && product.guidelines.length > 0) {
          setContractData((prev) => ({
            ...prev,
            selectedGuidelines: product.guidelines,
          }))
        }
      } catch (error) {
        console.error("Failed to load guidelines:", error)
        toast({
          title: "Erro",
          description: "Não foi possível carregar as diretrizes.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    loadGuidelines()
  }, [product, toast])

  const handleGeneratePdf = async () => {
    setGenerating(true)
    try {
      await generatePdfFromHtml("contract-preview", `contrato-${product.name.toLowerCase().replace(/\s+/g, "-")}.pdf`)
      toast({
        title: "Sucesso",
        description: "Contrato gerado com sucesso!",
      })
    } catch (error) {
      console.error("Failed to generate PDF:", error)
      toast({
        title: "Erro",
        description: "Não foi possível gerar o PDF.",
        variant: "destructive",
      })
    } finally {
      setGenerating(false)
    }
  }

  const handleAdditionalGuidelineToggle = (guidelineId: string) => {
    setAdditionalGuidelineIds((prev) => {
      const isSelected = prev.includes(guidelineId)

      if (isSelected) {
        // Remove from additional guidelines
        const newIds = prev.filter((id) => id !== guidelineId)

        // Update contract data
        const selectedGuideline = allGuidelines.find((g) => g.id === guidelineId)
        if (selectedGuideline) {
          setContractData((prev) => ({
            ...prev,
            selectedGuidelines: prev.selectedGuidelines.filter((g) => g.id !== guidelineId),
          }))
        }

        return newIds
      } else {
        // Add to additional guidelines
        const newIds = [...prev, guidelineId]

        // Update contract data
        const selectedGuideline = allGuidelines.find((g) => g.id === guidelineId)
        if (selectedGuideline) {
          setContractData((prev) => ({
            ...prev,
            selectedGuidelines: [...prev.selectedGuidelines, selectedGuideline],
          }))
        }

        return newIds
      }
    })
  }

  const updateContractDate = (date: Date | undefined) => {
    if (date) {
      setContractDate(date)
      setContractData((prev) => ({
        ...prev,
        contractDate: format(date, "dd/MM/yyyy"),
      }))
    }
  }

  const updateExpirationDate = (date: Date | undefined) => {
    if (date) {
      setExpirationDate(date)
      setContractData((prev) => ({
        ...prev,
        expirationDate: format(date, "dd/MM/yyyy"),
      }))
    }
  }

  return (
    <div className="grid gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary-600" />
            Gerador de Contrato
          </CardTitle>
          <CardDescription>Personalize e gere um contrato para o produto {product.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customize">Personalizar</TabsTrigger>
              <TabsTrigger value="preview">Visualizar</TabsTrigger>
            </TabsList>

            <TabsContent value="customize" className="space-y-6 py-4">
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="template">Modelo de Contrato</Label>
                  <Select
                    value={selectedTemplate.id}
                    onValueChange={(value) => {
                      const template = contractTemplates.find((t) => t.id === value)
                      if (template) setSelectedTemplate(template)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTemplates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="companyName">Nome da Empresa</Label>
                  <Input id="companyName" value={contractData.companyName} disabled className="bg-muted" />
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="customerName">Nome do Cliente</Label>
                  <Input
                    id="customerName"
                    value={contractData.customerName}
                    onChange={(e) => setContractData((prev) => ({ ...prev, customerName: e.target.value }))}
                    placeholder="Nome completo do cliente"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <Label>Data do Contrato</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {contractDate ? format(contractDate, "PPP", { locale: pt }) : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar mode="single" selected={contractDate} onSelect={updateContractDate} initialFocus />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="grid gap-3">
                    <Label>Data de Expiração</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full justify-start text-left font-normal">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {expirationDate ? format(expirationDate, "PPP", { locale: pt }) : "Selecione uma data"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={expirationDate}
                          onSelect={updateExpirationDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label>Diretrizes do Produto</Label>
                  <Card className="p-4">
                    <div className="space-y-2">
                      {product.guidelines.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Este produto não possui diretrizes associadas.</p>
                      ) : (
                        <>
                          <p className="text-sm text-muted-foreground mb-2">
                            As seguintes diretrizes estão associadas a este produto e serão incluídas no contrato:
                          </p>
                          <div className="space-y-2">
                            {product.guidelines.map((guideline) => (
                              <div key={guideline.id} className="flex items-start space-x-2">
                                <div className="grid gap-1.5">
                                  <p className="font-medium">{guideline.name}</p>
                                  <p className="text-sm text-muted-foreground">{guideline.description}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </Card>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="selectedGuidelines">Diretrizes para o Contrato</Label>
                  <div className="rounded-md border p-4 max-h-60 overflow-y-auto">
                    <p className="text-sm text-muted-foreground mb-3">
                      Selecione as diretrizes a serem incluídas no contrato:
                    </p>
                    {availableGuidelines.map((guideline) => (
                      <div key={guideline.id} className="flex items-start space-x-2 mb-2">
                        <Checkbox
                          id={`contract-guideline-${guideline.id}`}
                          checked={selectedGuidelines.includes(guideline.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedGuidelines([...selectedGuidelines, guideline.id])
                            } else {
                              setSelectedGuidelines(selectedGuidelines.filter((id) => id !== guideline.id))
                            }
                          }}
                        />
                        <div className="grid gap-1.5 leading-none">
                          <Label htmlFor={`contract-guideline-${guideline.id}`} className="text-sm font-medium">
                            {guideline.name}
                          </Label>
                          <p className="text-xs text-muted-foreground">{guideline.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="additionalTerms">Termos Adicionais</Label>
                  <Textarea
                    id="additionalTerms"
                    value={contractData.additionalTerms}
                    onChange={(e) => setContractData((prev) => ({ ...prev, additionalTerms: e.target.value }))}
                    placeholder="Insira termos adicionais específicos para este contrato"
                    rows={5}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="signatureRequired"
                    checked={contractData.signatureRequired}
                    onCheckedChange={(checked) =>
                      setContractData((prev) => ({
                        ...prev,
                        signatureRequired: checked === true,
                      }))
                    }
                  />
                  <Label htmlFor="signatureRequired">Incluir campos para assinatura</Label>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => setActiveTab("preview")} className="gap-2">
                    Visualizar Contrato
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview" className="space-y-6">
              <div className="flex justify-between items-center mb-4">
                <Button variant="outline" onClick={() => setActiveTab("customize")}>
                  Voltar para Edição
                </Button>
                <Button onClick={handleGeneratePdf} disabled={generating} className="gap-2">
                  <Download className="h-4 w-4" />
                  {generating ? "Gerando PDF..." : "Baixar PDF"}
                </Button>
              </div>

              <div className="border rounded-md p-1 bg-gray-50">
                <ContractPreview templateContent={selectedTemplate.content} contractData={contractData} />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
