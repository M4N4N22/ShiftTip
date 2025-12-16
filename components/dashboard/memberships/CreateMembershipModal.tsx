"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, X } from "lucide-react";

type CreateMembershipModalProps = {
  open: boolean;
  onClose: () => void;
  creatorWallet: string;
};

type FormState = {
  name: string;
  description: string;
  price: string;
  perks: string[];
  token: string;
  network: string;
};

export function CreateMembershipModal({
  open,
  onClose,
  creatorWallet,
}: CreateMembershipModalProps) {
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    price: "",
    perks: [],
    token: "USDC",
    network: "Ethereum",
  });

  const [perkInput, setPerkInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supportedTokens = [
    { label: "USDC", value: "USDC" },
    { label: "USDT", value: "USDT" },
    { label: "DAI", value: "DAI" },
  ];

  const supportedChains = [
    { label: "Ethereum", value: "Ethereum" },
    { label: "Polygon", value: "Polygon" },
    { label: "Arbitrum", value: "Arbitrum" },
    { label: "Optimism", value: "Optimism" },
  ];

  type FormErrors = Partial<Record<keyof FormState, string>>;

  const [errors, setErrors] = useState<FormErrors>({});

  // ---------------------------------------------
  // Handlers
  // ---------------------------------------------
  const update = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const addPerk = () => {
    if (!perkInput.trim()) return;
    update("perks", [...form.perks, perkInput.trim()]);
    setPerkInput("");
  };

  const removePerk = (index: number) => {
    update(
      "perks",
      form.perks.filter((_, i) => i !== index)
    );
  };

  const validate = () => {
    const nextErrors: FormErrors = {};

    if (!form.name.trim()) {
      nextErrors.name = "Plan name is required";
    }

    if (!form.description.trim()) {
      nextErrors.description = "Description is required";
    }

    if (!form.price || Number(form.price) <= 0) {
      nextErrors.price = "Price must be greater than 0";
    }

    if (form.perks.length === 0) {
      nextErrors.perks = "Add at least one perk";
    }

    if (!supportedTokens.find((t) => t.value === form.token)) {
      nextErrors.token = "Select a supported stablecoin";
    }

    if (!supportedChains.find((c) => c.value === form.network)) {
      nextErrors.network = "Select a supported network";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };
  const handleCreate = async () => {
    if (!validate()) return;

    try {
      setIsSubmitting(true);

      const res = await fetch("/api/creator/memberships/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorWallet,
          name: form.name,
          description: form.description,
          price: form.price,
          perks: form.perks,
          token: form.token,
          network: form.network,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create plan");
      }

      // optional: const data = await res.json();

      onClose();
    } catch (err) {
      console.error("Create membership failed:", err);
      alert("Failed to create membership plan");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    form.name &&
    form.description &&
    Number(form.price) > 0 &&
    form.perks.length > 0;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="min-w-5xl">
        <DialogHeader>
          <DialogTitle>Create Membership Plan</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8  items-center">
          {/* -------------------------------- */}
          {/* LEFT: FORM */}
          {/* -------------------------------- */}
          <div className="space-y-6">
            {/* Basics */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Basics</h3>

              <Input
                placeholder="Plan name (e.g. Gold, VIP)"
                value={form.name}
                onChange={(e) => {
                  update("name", e.target.value);
                  setErrors((p) => ({ ...p, name: undefined }));
                }}
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}

              <Textarea
                placeholder="Describe what members get access to"
                value={form.description}
                onChange={(e) => update("description", e.target.value)}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}

              <Input
                type="number"
                placeholder="Price per month (USDC)"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Perks */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Perks</h3>

              <div className="flex gap-2">
                <Input
                  placeholder="Add a perk (e.g. Exclusive posts)"
                  value={perkInput}
                  onChange={(e) => setPerkInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addPerk()}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={addPerk}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {form.perks.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.perks.map((perk, i) => (
                    <Badge
                      key={i}
                      variant="secondary"
                      className="flex items-center gap-2 pr-1"
                    >
                      <span>{perk}</span>

                      <button
                        type="button"
                        onClick={() => removePerk(i)}
                        className="ml-1 rounded hover:bg-muted p-0.5"
                        aria-label="Remove perk"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Settlement (visually secondary) */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold">Settlement (Advanced)</h3>

              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Token"
                  value={form.token}
                  onChange={(e) => update("token", e.target.value)}
                />
                <Input
                  placeholder="Network"
                  value={form.network}
                  onChange={(e) => update("network", e.target.value)}
                />
              </div>
            </div>
            {Object.keys(errors).length > 0 && (
              <p className="text-xs text-muted-foreground">
                Please fix the highlighted fields to continue
              </p>
            )}

            <Button
              className="w-full"
              onClick={handleCreate}
              disabled={isSubmitting || !isFormValid}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating on-chain...
                </>
              ) : (
                "Create Membership"
              )}
            </Button>
          </div>

          {/* -------------------------------- */}
          {/* RIGHT: LIVE PREVIEW */}
          {/* -------------------------------- */}
          <div className="border rounded-lg p-6 bg-muted/30">
            <p className="text-xs uppercase text-muted-foreground mb-2">
              Live Preview
            </p>

            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold">
                  {form.name || "Membership Name"}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {form.description ||
                    "Membership description will appear here"}
                </p>
              </div>

              <div className="text-2xl font-bold">
                ${form.price || "0"} / month
              </div>

              {form.perks.length > 0 ? (
                <ul className="text-sm space-y-1">
                  {form.perks.map((perk, i) => (
                    <li key={i}>• {perk}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No perks added yet
                </p>
              )}

              <Button className="w-full" disabled>
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
