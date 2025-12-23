export function formatPhone(value: string | undefined | null): string {
    if (!value) return ''

    // Remove non-numeric characters
    const numericValue = value.replace(/\D/g, '')

    // Limit to 11 digits
    const truncatedValue = numericValue.slice(0, 11)

    // Format based on length
    if (truncatedValue.length <= 2) {
        return truncatedValue
    } else if (truncatedValue.length <= 6) {
        return `(${truncatedValue.slice(0, 2)}) ${truncatedValue.slice(2)}`
    } else if (truncatedValue.length <= 10) {
        return `(${truncatedValue.slice(0, 2)}) ${truncatedValue.slice(2, 6)}-${truncatedValue.slice(6)}`
    } else {
        return `(${truncatedValue.slice(0, 2)}) ${truncatedValue.slice(2, 7)}-${truncatedValue.slice(7)}`
    }
}
