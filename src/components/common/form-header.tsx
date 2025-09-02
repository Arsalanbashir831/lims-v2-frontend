import { BackButton } from "../ui/back-button"

export const FormHeader = ({ title, description, label, href, children }: { title: string, description: string, label: string | null, href: string, children?: React.ReactNode }) => {
    return (
        <div className="flex items-center justify-between gap-4 pb-2">
            <div className="flex items-center gap-4">
                <BackButton size="icon" label={label} href={href} />
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
                    <p className="text-muted-foreground">
                        {description}
                    </p>
                </div>
            </div>
            {children}
        </div>
    )
}