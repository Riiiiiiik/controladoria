export default function StatusBadge({ status }: { status: string }) {
    let colorClass = 'bg-slate-500/10 text-slate-400 border-slate-500/20'

    switch (status) {
        case 'Aprovado':
            colorClass = 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
            break
        case 'Reprovado':
            colorClass = 'bg-red-500/10 text-red-500 border-red-500/20'
            break
        case 'Em Andamento':
            colorClass = 'bg-blue-500/10 text-blue-500 border-blue-500/20'
            break
        case 'Pendente':
            colorClass = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
            break
    }

    return (
        <span className={`block w-full h-full px-2 py-1 text-[11px] uppercase font-bold tracking-wide text-center border ${colorClass} rounded`}>
            {status}
        </span>
    )
}
