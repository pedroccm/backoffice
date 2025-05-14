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
import { addProductDeliverable } from "@/lib/catalog-api";
import type { Deliverable } from "@/lib/catalog-api";

const deliverableFormSchema = z.object({
  deliverableId: z.string().uuid("Por favor, selecione um entregável válido"),
});

type DeliverableFormValues = z.infer<typeof deliverableFormSchema>;

interface AddDeliverableDialogProps {
  productId: string;
  deliverables: Deliverable[];
  onDeliverableAdded: () => void;
}

export function AddDeliverableDialog({ 
  productId, 
  deliverables,
  onDeliverableAdded 
}: AddDeliverableDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<DeliverableFormValues>({
    resolver: zodResolver(deliverableFormSchema),
    defaultValues: {
      deliverableId: "",
    },
  });

  const onSubmit = async (data: DeliverableFormValues) => {
    setLoading(true);
    try {
      await addProductDeliverable({
        productId,
        deliverableId: data.deliverableId,
      });

      toast({
        title: "Entregável adicionado",
        description: "O entregável foi adicionado com sucesso!",
      });

      form.reset();
      setOpen(false);
      onDeliverableAdded();
    } catch (error) {
      console.error("Erro ao adicionar entregável:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o entregável. Tente novamente.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Verificar se há entregáveis disponíveis
  const hasDeliverables = deliverables && deliverables.length > 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Adicionar Entregável
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar entregável</DialogTitle>
          <DialogDescription>
            Associe um entregável ao produto.
          </DialogDescription>
        </DialogHeader>
        {!hasDeliverables ? (
          <div className="py-4 text-center text-muted-foreground">
            Não há entregáveis disponíveis para adicionar.
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="deliverableId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Entregável</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um entregável" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {deliverables.map((deliverable) => (
                          <SelectItem key={deliverable.id} value={deliverable.id}>
                            {deliverable.name}
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
        )}
      </DialogContent>
    </Dialog>
  );
} 