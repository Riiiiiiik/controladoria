
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { logAdminAction, AuditActions } from '@/lib/audit-log'

// Helper to standardise date to YYYY-MM-DD
function parseDate(dateStr: any): string | null {
    if (!dateStr) return null;

    // If it's already a string in standard format, return it
    if (typeof dateStr === 'string') {
        // Handle DD/MM/YYYY or DD-MM-YYYY
        const brDateMatch = dateStr.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/)
        if (brDateMatch) {
            const [_, day, month, year] = brDateMatch
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`
        }

        // Handle YYYY-MM-DD (ISO)
        const isoMatch = dateStr.match(/^\d{4}-\d{2}-\d{2}/)
        if (isoMatch) return dateStr;
    }

    // Attempt to parse as standard Date if string is something else (like "Dec 23 2024")
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0]
    }

    return null
}

export async function DELETE(request: Request) {
    // SECURITY: Verify authentication
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // SECURITY: Verify admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (profile?.role !== 'admin') {
        return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 })
    }

    // Now safe to delete - user is authenticated admin
    const supabaseAdmin = createAdminClient()

    // SECURITY: Log this critical action before executing
    await logAdminAction({
        userId: user.id,
        action: AuditActions.DELETE_ALL_REGISTROS,
        details: { timestamp: new Date().toISOString() }
    })

    const { error } = await supabaseAdmin
        .from('registros')
        .delete()
        .neq('id', 0) // Delete all where ID is not 0 (effectively all)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}

export async function POST(request: Request) {
    // Use Admin client to bypass RLS policies for bulk import
    const supabaseAdmin = createAdminClient()
    const supabaseAuth = await createClient() // To get current user context if available

    try {
        const body = await request.json()
        const { records } = body

        if (!records || !Array.isArray(records)) {
            return NextResponse.json(
                { error: 'Invalid data format. Expected an array of records.' },
                { status: 400 }
            )
        }

        const { data: { user } } = await supabaseAuth.auth.getUser()

        // Helper to find value by "slugifying" keys (remove special chars, lowercase)
        const normalizeKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, '');

        const getValue = (record: any, targetKeys: string[]) => {
            const recordKeys = Object.keys(record);
            let val = undefined;

            // 1. Try exact matches first
            for (const key of targetKeys) {
                if (record[key] !== undefined) {
                    val = record[key];
                    break;
                }
            }

            // 2. Try slug match
            if (val === undefined) {
                for (const key of targetKeys) {
                    const normalizedTarget = normalizeKey(key);
                    const foundKey = recordKeys.find(k => normalizeKey(k) === normalizedTarget);
                    if (foundKey && record[foundKey] !== undefined) {
                        val = record[foundKey];
                        break;
                    }
                }
            }

            // Clean up string values (remove tabs, trim)
            if (typeof val === 'string') {
                return val.trim();
            }
            return val;
        };

        const parseValue = (val: any) => {
            if (typeof val === 'number') return val;
            if (typeof val === 'string') {
                // If it's already a clean number string like "26389.29"
                if (/^-?\d+(\.\d+)?$/.test(val)) return parseFloat(val);
                // If it asks for currency formatting parsing
                return parseFloat(val.replace(/[R$\s]/g, '').replace(/\./g, '').replace(',', '.'));
            }
            return 0;
        }

        const parseStatus = (val: any) => {
            if (!val || typeof val !== 'string') return 'Pendente';
            const upper = val.toUpperCase();
            if (upper.includes('APROVADO') || upper.includes('OLA') || upper.includes('OK') || upper.includes('PAGO')) return 'Aprovado';
            if (upper.includes('REPROVADO') || upper.includes('REJEITADO') || upper.includes('CANCELADO')) return 'Reprovado';
            // Constraint likely only matches: Pendente, Aprovado, Reprovado
            return 'Pendente';
        }

        const mappedRecords = records.map((record: any) => {
            const rawDate = getValue(record, ['Data', 'DATA', 'data']);
            const parsedDate = parseDate(rawDate) || new Date().toISOString().split('T')[0];

            // Debug Log
            if (rawDate && rawDate.includes('2024')) {
                console.log(`[DEBUG_DATE] Raw: ${rawDate} | Parsed: ${parsedDate}`);
            }

            const extraFields = {
                gestor: getValue(record, ['Gestor', 'GESTOR']),
                numero_op: getValue(record, ['Nº OP', 'N OP', 'OP', 'Numero OP', 'Number OP']),
                nome_contato: getValue(record, ['Nome do Contato', 'NOME DO CONTATO', 'Contato', 'Nome Contato']),
                telefone: getValue(record, ['Telefone', 'TELEFONE', 'Tel']),
                boleto_status: getValue(record, ['Boleto', 'BOLETO']),
                entrega_mercadoria: getValue(record, ['Entrega de Mercadoria', 'ENTREGA DE MERCADORIA', 'Entrega', 'Entrega de Mercadorias', 'ENTREGA DE MERCADORIAS', 'Entrega Mercadoria', 'Entrega Mercadorias', 'Status Entrega']),
                meio_confirmacao: getValue(record, ['Meio de Conf.', 'MEIO DE CONF.', 'MEIO DE CONFIRMAÇÃO', 'Meio de Confirmação', 'Meio Confirmacao', 'Meio de Conf', 'Meio', 'Canal', 'Confirmacao', 'Confirmação']),
                original_obs: getValue(record, ['Observações', 'Observacoes', 'OBSERVACOES', 'Obs', 'OBS', 'Detalhes', 'Motivo', 'Comentarios', 'Comentários', 'Notas', 'Lastro', 'OBSERVAÇÃO', 'Observação', 'OBSERVACAO', 'Observacao'])
            };

            // Heuristic Fix: If "Meio de Conf" is missing, but "Boleto" contains "Whatsapp"/"Email", swap them.
            if (!extraFields.meio_confirmacao && extraFields.boleto_status) {
                const statusUpper = String(extraFields.boleto_status).toUpperCase();
                if (statusUpper.includes('WHATSAPP') || statusUpper.includes('EMAIL') || statusUpper.includes('TELEFONE') || statusUpper.includes('LIGAÇÃO')) {
                    extraFields.meio_confirmacao = extraFields.boleto_status;
                    extraFields.boleto_status = undefined; // Clear it so it doesn't duplicate
                }
            }

            // Capture any other unmapped fields to avoid data loss
            const usedKeys = new Set([
                'Data', 'DATA', 'data',
                'Gestor', 'GESTOR',
                'Nº OP', 'N OP', 'OP', 'Numero OP', 'Number OP',
                'Nome do Contato', 'NOME DO CONTATO', 'Contato', 'Nome Contato',
                'Telefone', 'TELEFONE', 'Tel',
                'Boleto', 'BOLETO',
                'Conf Boleto', 'CONF BOLETO', 'Conf. Boleto', 'Conf Boleto', // Kept here to be ignored (not in unmapped)
                'Entrega de Mercadoria', 'ENTREGA DE MERCADORIA', 'Entrega', 'Entrega de Mercadorias', 'ENTREGA DE MERCADORIAS', 'Entrega Mercadoria', 'Entrega Mercadorias', 'Status Entrega',
                'Meio de Conf.', 'MEIO DE CONF.', 'Meio Confirmacao', 'Meio de Conf', 'Meio', 'Canal', 'Confirmacao', 'Confirmação',
                'Observações', 'Observacoes', 'OBSERVACOES', 'Obs', 'OBS', 'Detalhes', 'Motivo', 'Comentarios', 'Comentários', 'Notas',
                'Sacado', 'SACADO', 'Cliente', 'Nome', 'Nome do Cliente',
                'Tipo', 'TIPO', 'tipo',
                'Cedente', 'CEDENTE', 'Produto',
                'Valor', 'VALOR', 'valor',
                'Status', 'STATUS', 'status'
            ]);

            const unmapped: any = {};
            Object.keys(record).forEach(key => {
                // simple check if key is likely one of the used ones (this is approximate as normalization happens in getValue)
                // for robust check we'd need to normalize everything, but for now we just want to save "unknowns"
                const norm = normalizeKey(key);
                let isUsed = false;
                for (const u of usedKeys) {
                    if (normalizeKey(u) === norm) {
                        isUsed = true;
                        break;
                    }
                }
                if (!isUsed) {
                    unmapped[key] = record[key];
                }
            });

            return {
                data_contato: parsedDate,
                cliente_nome: getValue(record, ['Sacado', 'SACADO', 'Cliente', 'Nome', 'Nome do Cliente']),
                tipo_contato: getValue(record, ['Tipo', 'TIPO', 'tipo']),
                produto: getValue(record, ['Produto', 'PRODUTO', 'Cedente', 'CEDENTE']), // Keep fallback for compatibility if needed, or strict? Let's follow client: product is product or cedente if missing.
                // Actually, let's match client strictness:
                // produto: findKeyCI(row, 'Produto') || findKeyCI(row, 'Cedente')

                cedente: getValue(record, ['Cedente', 'CEDENTE']), // Strict mapping for Cedente column
                sacado: getValue(record, ['Sacado', 'SACADO', 'Cliente']), // Strict mapping for Sacado column

                valor: parseValue(getValue(record, ['Valor', 'VALOR', 'valor'])),
                status: parseStatus(getValue(record, ['Status', 'STATUS', 'status'])),

                // System fields with defaults
                meio_confirmacao: extraFields.meio_confirmacao || 'WhatsApp',
                boleto_status: extraFields.boleto_status || 'Email',
                entrega_mercadoria: extraFields.entrega_mercadoria || 'Entregue',

                gestor: extraFields.gestor,
                numero_op: extraFields.numero_op,
                nome_contato: extraFields.nome_contato,
                telefone: extraFields.telefone,

                observacoes: JSON.stringify({ ...extraFields, ...unmapped, original_obs: extraFields.original_obs }),
                user_id: user?.id
            };
        });

        const validRecords = mappedRecords.filter((r: any) => r.cliente_nome && r.data_contato);

        if (validRecords.length === 0) {
            return NextResponse.json(
                { error: 'No valid records found to insert.' },
                { status: 400 }
            )
        }

        const { data, error } = await supabaseAdmin
            .from('registros')
            .insert(validRecords)
            .select()

        if (error) {
            console.error('Supabase error:', error)
            return NextResponse.json(
                { error: 'Failed to insert records: ' + error.message },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true, count: data.length })

    } catch (error) {
        console.error('Import error:', error)
        return NextResponse.json(
            { error: 'Internal server error processing CSV.' },
            { status: 500 }
        )
    }
}
