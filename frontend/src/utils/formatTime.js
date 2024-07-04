export function formatDate(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Mês em JavaScript é 0-indexado
    const year = String(date.getFullYear()).slice(-2); // Pegar os últimos 2 dígitos do ano
    return `${day}/${month}/${year}`;
}