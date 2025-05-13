"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";

// URLs das APIs
const SALES_API_URL = "https://api.sales.dev.mktlab.app";
const CATALOG_API_URL = "https://api.catalog.dev.mktlab.app";

// Endpoints GET sem parâmetros
const endpoints = [
  { name: "Coupons", url: `${SALES_API_URL}/coupons` },
  { name: "Offer Durations", url: `${SALES_API_URL}/offer-durations` },
  { name: "Installments", url: `${SALES_API_URL}/installments` },
  { name: "Payment Methods", url: `${SALES_API_URL}/payment-methods` },
  { name: "Products", url: `${CATALOG_API_URL}/products` },
  { name: "Categories", url: `${CATALOG_API_URL}/categories` },
  { name: "Currencies", url: `${CATALOG_API_URL}/currencies` },
  { name: "Deliverables", url: `${CATALOG_API_URL}/deliverables` },
  { name: "Modifier Types", url: `${CATALOG_API_URL}/modifier-types` },
];

export default function GetMenu() {
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [activeEndpoint, setActiveEndpoint] = useState<string | null>(null);

  const fetchData = async (url: string, name: string) => {
    setLoading(true);
    setActiveEndpoint(name);
    setResponse("Carregando...");

    try {
      const response = await fetch(url);
      const data = await response.json();
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
                onClick={() => fetchData(endpoint.url, endpoint.name)}
                disabled={loading && activeEndpoint !== endpoint.name}
              >
                {endpoint.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {response && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px] w-full rounded-md border">
              <pre className="p-4 text-sm">{response}</pre>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
} 