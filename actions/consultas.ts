'use server'

interface CNPJResponse {
    razao_social: string
    nome_fantasia: string
    ddd_telefone_1: string
    logradouro: string
    numero: string
    bairro: string
    municipio: string
    uf: string
    cep: string
}

export async function consultarCNPJ(cnpj: string) {
    // Remove characters that are not digits
    const cleanCNPJ = cnpj.replace(/\D/g, '')

    if (cleanCNPJ.length !== 14) {
        return { error: 'CNPJ deve conter 14 dígitos.' }
    }

    try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCNPJ}`, {
            cache: 'no-store',
            headers: {
                'Content-Type': 'application/json',
                'User-Agent': 'SalesContactSystem/1.0' // Good practice to identify the client
            }
        })

        if (!response.ok) {
            console.error(`BrasilAPI Error: ${response.status} - ${response.statusText}`)

            if (response.status === 404) {
                return { error: 'CNPJ não encontrado.' }
            }
            if (response.status === 429) {
                return { error: 'Muitas requisições. Tente novamente em instantes.' }
            }
            return { error: `Erro na API (${response.status}). Tente novamente.` }
        }

        const data = await response.json() as CNPJResponse

        return {
            success: true,
            dados: {
                razao_social: data.razao_social,
                nome_fantasia: data.nome_fantasia,
                telefone: data.ddd_telefone_1,
                endereco: {
                    logradouro: data.logradouro,
                    numero: data.numero,
                    bairro: data.bairro,
                    cidade: data.municipio,
                    uf: data.uf,
                    cep: data.cep
                }
            }
        }
    } catch (e) {
        console.error('Erro na consulta de CNPJ:', e)
        return { error: 'Falha na comunicação com o serviço de consulta.' }
    }
}
