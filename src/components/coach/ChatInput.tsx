import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const ChatInput = ({ value, onChange, onSubmit, isLoading }: ChatInputProps) => {
  return (
    <div className="p-4 border-t border-border">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
        className="flex gap-2"
      >
        <Input
          placeholder="Ask me to tweak your profile..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1"
          disabled={isLoading}
        />
        <Button type="submit" size="icon" disabled={!value.trim() || isLoading}>
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
};
