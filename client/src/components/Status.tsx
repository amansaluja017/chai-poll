import { CheckCircle2, Clock, AlertCircle, Info } from "lucide-react";

function Status({ text }: { text: string }) {
    const normalizedText = text.toLowerCase();
    
    let Icon = Info;
    let colorClasses = "bg-(--surface-strong) text-(--sea-ink-soft) border-(--line)";

    if (normalizedText.includes("completed") || normalizedText.includes("active") || normalizedText.includes("published") || normalizedText.includes("success")) {
        Icon = CheckCircle2;
        colorClasses = "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800/50";
    } else if (normalizedText.includes("expired") || normalizedText.includes("closed") || normalizedText.includes("failed") || normalizedText.includes("error")) {
        Icon = AlertCircle;
        colorClasses = "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50";
    } else if (normalizedText.includes("pending") || normalizedText.includes("waiting") || normalizedText.includes("draft")) {
        Icon = Clock;
        colorClasses = "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800/50";
    }

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold uppercase tracking-wider shadow-sm transition-all hover:scale-105 ${colorClasses}`}>
            <Icon className="w-3.5 h-3.5" />
            <span>{text}</span>
        </div>
    );
}

export default Status;
