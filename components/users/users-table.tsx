'use client'

export default function UsersTable({ profiles }: { profiles: any[] }) {
    return (
        <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow-sm ring-1 ring-apple-border rounded-xl">
                        <table className="min-w-full divide-y divide-apple-border">
                            <thead className="bg-apple-bg-secondary">
                                <tr>
                                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-bold uppercase tracking-widest text-apple-text-secondary sm:pl-6">
                                        Email
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-apple-text-secondary">
                                        Role
                                    </th>
                                    <th scope="col" className="px-3 py-3.5 text-left text-xs font-bold uppercase tracking-widest text-apple-text-secondary">
                                        Created At
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-apple-border bg-white">
                                {profiles.map((profile) => (
                                    <tr key={profile.id} className="hover:bg-apple-bg-secondary/50 transition-colors">
                                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-apple-text-primary sm:pl-6">
                                            {profile.email}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-apple-text-secondary capitalize">
                                            {profile.role}
                                        </td>
                                        <td className="whitespace-nowrap px-3 py-4 text-sm text-apple-text-secondary font-mono">
                                            {new Date(profile.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
