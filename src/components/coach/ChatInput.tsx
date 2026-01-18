import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
  placeholder?: string;
}

export const ChatInput = ({ value, onChange, onSubmit, isLoading, placeholder = "Ask me to tweak your profile..." }: ChatInputProps) => {
  return (
    <div className="pt-4 pb-4 border-t border-border">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex gap-2 items-end"
      >
        <Input
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button
          type="submit"
          size="icon"
          disabled={!value.trim() || isLoading}
          className="h-12 w-12 shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
