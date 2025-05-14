import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { addProductPrice } from "@/lib/catalog-api";
import type { Currency, ModifierType } from "@/lib/catalog-api";

// Definição do schema de validação
const priceFormSchema = z.object({
  amount: z.coerce.number().positive("O preço deve ser um valor positivo"),
  currencyId: z.string().uuid("Por favor, selecione uma moeda válida"),
  modifierTypeId: z.string().optional(),
});

type PriceFormValues = z.infer<typeof priceFormSchema>;

interface AddPriceDialogProps {
  productId: string;
  currencies: Currency[];
  modifierTypes: ModifierType[];
  onPriceAdded: () => void;
}

export function AddPriceDialog({ 
  productId, 
  currencies, 
  modifierTypes,
  onPriceAdded 
}: AddPriceDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<PriceFormValues>({
    resolver: zodResolver(priceFormSchema),
    defaultValues: {
      amount: 0,
      currencyId: "",
      modifierTypeId: "none", // Valor padrão não vazio
    },
  });

  const onSubmit = async (data: PriceFormValues) => {
    setLoading(true);
    try {
      // Se modifierTypeId for "none", envie undefined para a API
      const modifierTypeId = data.modifierTypeId === "none" ? undefined : data.modifierTypeId;
      
      await addProductPrice({
        productId,
        currencyId: data.currencyId,
        amount: data.amount,
        modifierTypeId,
      });

      toast({
        title: "Preço adicionado",
        description: "O preço foi adicionado com sucesso!",
      });

      form.reset();
      setOpen(false);
      onPriceAdded();
    } catch (error) {
      console.error("Erro ao adicionar preço:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o preço. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Preço
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar novo preço</DialogTitle>
          <DialogDescription>
            Defina o preço para o produto em uma moeda específica.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currencyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Moeda</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma moeda" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {currencies.map((currency) => (
                        <SelectItem key={currency.id} value={currency.id}>
                          {currency.symbol} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0.00"
                      step="0.01"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="modifierTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Modificador (opcional)</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um modificador" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="none">Nenhum</SelectItem>
                      {modifierTypes.map((modifier) => (
                        <SelectItem key={modifier.id} value={modifier.id}>
                          {modifier.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Adicionando..." : "Adicionar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
} 