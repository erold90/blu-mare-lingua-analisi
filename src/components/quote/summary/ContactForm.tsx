
import React from "react";
import { FormValues } from "@/utils/quoteFormSchema";
import { UseFormReturn } from "react-hook-form";

interface ContactFormProps {
  formValues: FormValues;
  form: UseFormReturn<FormValues>;
}

const ContactForm: React.FC<ContactFormProps> = ({ formValues, form }) => {
  return (
    <>
      <h3 className="text-lg font-semibold mb-3">I tuoi dati di contatto</h3>
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="name" className="text-sm font-medium mb-1 block">Nome</label>
          <input
            id="name"
            type="text"
            className="w-full p-2 border rounded-md"
            placeholder="Inserisci il tuo nome"
            value={formValues.name || ""}
            onChange={(e) => form.setValue("name", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="email" className="text-sm font-medium mb-1 block">Email</label>
          <input
            id="email"
            type="email"
            className="w-full p-2 border rounded-md"
            placeholder="Inserisci la tua email"
            value={formValues.email || ""}
            onChange={(e) => form.setValue("email", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="phone" className="text-sm font-medium mb-1 block">Telefono</label>
          <input
            id="phone"
            type="tel"
            className="w-full p-2 border rounded-md"
            placeholder="Inserisci il tuo numero di telefono"
            value={formValues.phone || ""}
            onChange={(e) => form.setValue("phone", e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="notes" className="text-sm font-medium mb-1 block">Note</label>
          <textarea
            id="notes"
            className="w-full p-2 border rounded-md"
            placeholder="Eventuali note o richieste speciali"
            value={formValues.notes || ""}
            onChange={(e) => form.setValue("notes", e.target.value)}
            rows={2}
          />
        </div>
      </div>
    </>
  );
};

export default ContactForm;
