import GetMenu from "@/components/GetMenu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function GetsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">APIs GET</h2>
        <p className="text-muted-foreground">
          Consulte dados das APIs do sistema utilizando os métodos GET disponíveis.
        </p>
      </div>
      <GetMenu />
    </div>
  );
} 