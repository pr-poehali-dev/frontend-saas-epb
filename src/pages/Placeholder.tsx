import Icon from "@/components/ui/icon";

interface PlaceholderProps {
  title: string;
  description?: string;
  icon?: string;
}

export default function Placeholder({ title, description, icon = "Construction" }: PlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center animate-fade-in">
      <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mb-4">
        <Icon name={icon} fallback="Construction" size={24} className="text-muted-foreground" />
      </div>
      <h2 className="text-base font-semibold text-foreground mb-1">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        {description ?? "Раздел находится в разработке. Функциональность будет добавлена в следующих версиях."}
      </p>
    </div>
  );
}
