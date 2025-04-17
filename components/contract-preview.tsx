"use client"

import { useEffect, useState } from "react"
import { populateTemplate, type ContractData } from "@/lib/pdf-generator"

interface ContractPreviewProps {
  templateContent: string
  contractData: ContractData
}

export function ContractPreview({ templateContent, contractData }: ContractPreviewProps) {
  const [populatedContent, setPopulatedContent] = useState("")

  useEffect(() => {
    setPopulatedContent(populateTemplate(templateContent, contractData))
  }, [templateContent, contractData])

  return (
    <div
      id="contract-preview"
      className="bg-white p-8 border rounded-md shadow-sm max-w-4xl mx-auto"
      style={{ fontFamily: "Arial, sans-serif" }}
    >
      <div dangerouslySetInnerHTML={{ __html: populatedContent }} className="contract-content" />
      <style jsx global>{`
        .contract-content h1 {
          font-size: 24px;
          font-weight: bold;
          text-align: center;
          margin-bottom: 20px;
          color: #bc132b;
        }
        
        .contract-content h2 {
          font-size: 18px;
          font-weight: bold;
          margin-top: 20px;
          margin-bottom: 10px;
          color: #333;
          border-bottom: 1px solid #ddd;
          padding-bottom: 5px;
        }
        
        .contract-content p {
          margin-bottom: 10px;
          line-height: 1.5;
        }
        
        .contract-content ul {
          margin-left: 20px;
          margin-bottom: 15px;
        }
        
        .contract-content li {
          margin-bottom: 5px;
        }
        
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
        }
        
        .signature-block {
          width: 45%;
          text-align: center;
        }
        
        .signature-line {
          border-bottom: 1px solid #000;
          margin: 40px 0 10px;
        }
      `}</style>
    </div>
  )
}
