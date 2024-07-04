
function validateEmail(email) {
    // Validação simples de email
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
}

function validateUsername(username) {
    // Verifica se o nome de usuário tem mais de 3 caracteres
    return username.length > 3;
}

function validatePassword(password) {
    // Verifica se a senha tem pelo menos 6 caracteres, incluindo números e letras
    const re = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{6,}$/;
    return re.test(password);
}

export {validateEmail, validateUsername, validatePassword};