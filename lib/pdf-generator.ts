import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import type { Product, Guideline } from "./api-client"

export interface ContractTemplate {
  id: string
  name: string
  content: string
}

export interface ContractData {
  product: Product
  companyName: string
  customerName: string
  contractDate: string
  expirationDate: string
  additionalTerms: string
  selectedGuidelines: Guideline[]
  signatureRequired: boolean
}

// Sample contract templates
export const contractTemplates: ContractTemplate[] = [
  {
    id: "template-1",
    name: "Contrato Padrão",
    content: `
      <h1>CONTRATO DE FORNECIMENTO DE PRODUTO</h1>
      <p>Este contrato é celebrado entre {{companyName}} ("Fornecedor") e {{customerName}} ("Cliente") na data de {{contractDate}}.</p>
      
      <h2>1. OBJETO</h2>
      <p>O presente contrato tem por objeto o fornecimento do produto {{productName}}, conforme descrito abaixo:</p>
      <p><strong>Descrição:</strong> {{productDescription}}</p>
      <p><strong>Preço:</strong> {{productPrice}}</p>
      
      <h2>2. ENTREGÁVEIS</h2>
      <div>{{deliverables}}</div>
      
      <h2>3. DIRETRIZES</h2>
      <div>{{guidelines}}</div>
      
      <h2>4. TERMOS ADICIONAIS</h2>
      <p>{{additionalTerms}}</p>
      
      <h2>5. VIGÊNCIA</h2>
      <p>Este contrato tem validade até {{expirationDate}}.</p>
      
      <div class="signatures">
        <div class="signature-block">
          <p>{{companyName}}</p>
          <div class="signature-line"></div>
          <p>Fornecedor</p>
        </div>
        
        <div class="signature-block">
          <p>{{customerName}}</p>
          <div class="signature-line"></div>
          <p>Cliente</p>
        </div>
      </div>
    `,
  },
  {
    id: "template-2",
    name: "Contrato Simplificado",
    content: `
      <h1>CONTRATO SIMPLIFICADO</h1>
      <p>Data: {{contractDate}}</p>
      
      <p>Entre {{companyName}} e {{customerName}}.</p>
      
      <h2>PRODUTO</h2>
      <p>{{productName}} - {{productPrice}}</p>
      <p>{{productDescription}}</p>
      
      <h2>ENTREGÁVEIS</h2>
      <div>{{deliverables}}</div>
      
      <h2>DIRETRIZES</h2>
      <div>{{guidelines}}</div>
      
      <h2>TERMOS ADICIONAIS</h2>
      <p>{{additionalTerms}}</p>
      
      <p>Válido até {{expirationDate}}.</p>
      
      <div class="signatures">
        <div class="signature-block">
          <div class="signature-line"></div>
          <p>Fornecedor</p>
        </div>
        
        <div class="signature-block">
          <div class="signature-line"></div>
          <p>Cliente</p>
        </div>
      </div>
    `,
  },
]

// Function to replace template variables with actual data
export function populateTemplate(template: string, data: ContractData): string {
  let content = template
    .replace(/{{companyName}}/g, data.companyName)
    .replace(/{{customerName}}/g, data.customerName)
    .replace(/{{contractDate}}/g, data.contractDate)
    .replace(/{{expirationDate}}/g, data.expirationDate)
    .replace(/{{productName}}/g, data.product.name)
    .replace(/{{productDescription}}/g, data.product.description)
    .replace(/{{additionalTerms}}/g, data.additionalTerms || "Não há termos adicionais.")

  // Format price with currency
  const price =
    data.product.prices && data.product.prices.length > 0
      ? `${data.product.prices[0].amount.toFixed(2)}`
      : "Preço não definido"
  content = content.replace(/{{productPrice}}/g, price)

  // Format deliverables
  let deliverablesHtml = "<ul>"
  if (data.product.deliverables && data.product.deliverables.length > 0) {
    data.product.deliverables.forEach((deliverable) => {
      deliverablesHtml += `<li><strong>${deliverable.name}:</strong> ${deliverable.description}</li>`
    })
  } else {
    deliverablesHtml += "<li>Não há entregáveis definidos.</li>"
  }
  deliverablesHtml += "</ul>"
  content = content.replace(/{{deliverables}}/g, deliverablesHtml)

  // Format guidelines
  let guidelinesHtml = "<ul>"
  if (data.selectedGuidelines && data.selectedGuidelines.length > 0) {
    data.selectedGuidelines.forEach((guideline) => {
      guidelinesHtml += `<li><strong>${guideline.name}:</strong> ${guideline.description}</li>`
    })
  } else {
    guidelinesHtml += "<li>Não há diretrizes definidas.</li>"
  }
  guidelinesHtml += "</ul>"
  content = content.replace(/{{guidelines}}/g, guidelinesHtml)

  return content
}

// Function to generate PDF from HTML content
export async function generatePdfFromHtml(elementId: string, filename: string): Promise<void> {
  const element = document.getElementById(elementId)
  if (!element) {
    throw new Error("Element not found")
  }

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
  })

  const imgData = canvas.toDataURL("image/png")

  // A4 dimensions: 210 x 297 mm
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const imgWidth = 210
  const pageHeight = 297
  const imgHeight = (canvas.height * imgWidth) / canvas.width
  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
  heightLeft -= pageHeight

  // Add new pages if content overflows
  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight)
    heightLeft -= pageHeight
  }

  pdf.save(filename)
}
