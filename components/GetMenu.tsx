"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { fetchCatalogData, fetchSalesData } from "@/lib/api-fetch";
import { ApiResponseViewer } from "./ui/api-response-viewer";

// Tipo para definir endpoints
interface ApiEndpoint {
  name: string;
  type: "sales" | "catalog";
  endpoint: string;
}

// Endpoints GET sem parâmetros
const endpoints: ApiEndpoint[] = [
  { name: "Coupons", type: "sales", endpoint: "coupons" },
  { name: "Offer Durations", type: "sales", endpoint: "offer-durations" },
  { name: "Installments", type: "sales", endpoint: "installments" },
  { name: "Payment Methods", type: "sales", endpoint: "payment-methods" },
  { name: "Products", type: "catalog", endpoint: "products" },
  { name: "Categories", type: "catalog", endpoint: "categories" },
  { name: "Currencies", type: "catalog", endpoint: "currencies" },
  { name: "Deliverables", type: "catalog", endpoint: "deliverables" },
  { name: "Modifier Types", type: "catalog", endpoint: "modifier-types" },
];

export default function GetMenu() {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);

  const fetchData = async (endpoint: ApiEndpoint) => {
    setLoading(true);
    setActiveEndpoint(endpoint.name);
    setResponse("Carregando...");

    try {
      let data;
      if (endpoint.type === "catalog") {
        data = await fetchCatalogData(endpoint.endpoint);
      } else {
        data = await fetchSalesData(endpoint.endpoint);
      }
      setResponse(JSON.stringify(data, null, 2));
    } catch (error) {
      setResponse(`Erro ao obter dados: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>GETS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {endpoints.map((endpoint) => (
              <Button
                key={endpoint.name}
                variant={activeEndpoint === endpoint.name ? "default" : "outline"}
                onClick={() => fetchData(endpoint)}
                disabled={loading && activeEndpoint !== endpoint.name}
              >
                {endpoint.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {response && <ApiResponseViewer response={response} />}
    </div>
  );
} 