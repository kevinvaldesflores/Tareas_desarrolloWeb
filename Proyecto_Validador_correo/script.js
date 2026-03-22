(function() {
    // Elementos del DOM
    const emailInput = document.getElementById('emailInput');
    const feedbackArea = document.getElementById('feedbackArea');

    // Expresión regular para validar correos electrónicos
    // Permite: letras, números, puntos, guiones, guion bajo, porcentaje, más, menos en la parte local
    // Dominio: letras, números, puntos y guiones, seguido de un punto y extensión de al menos 2 letras
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    // Función auxiliar para actualizar la interfaz según validez
    function updateEmailFeedback() {
        const emailValue = emailInput.value;
        const trimmedValue = emailValue.trim();  // Espacios al inicio/final no son válidos en un email real

        // Caso especial: campo vacío -> estado neutral 
        if (trimmedValue === "") {
            emailInput.classList.remove('valid', 'invalid');
            feedbackArea.innerHTML = "✍️ Ingresa una dirección de correo para validarla";
            feedbackArea.className = "feedback-message neutral-msg";
            return;
        }

        // Validar contra la expresión regular
        const isValid = emailRegex.test(trimmedValue);

        if (isValid) {
            // Correo válido
            emailInput.classList.add('valid');
            emailInput.classList.remove('invalid');
            feedbackArea.innerHTML = "✅ Correo electrónico válido. Formato correcto.";
            feedbackArea.className = "feedback-message success-msg";
        } else {
            // Correo no válido
            emailInput.classList.add('invalid');
            emailInput.classList.remove('valid');
            
            let errorDetail = "";
            if (!trimmedValue.includes('@')) {
                errorDetail = "❌ El correo debe contener el símbolo '@'.";
            } else if (trimmedValue.indexOf('@') === 0 || trimmedValue.lastIndexOf('@') === trimmedValue.length - 1) {
                errorDetail = "❌ El '@' no puede estar al inicio ni al final del correo.";
            } else if (trimmedValue.includes(' ')) {
                errorDetail = "❌ El correo no debe contener espacios en blanco.";
            } else if (!trimmedValue.includes('.', trimmedValue.indexOf('@'))) {
                errorDetail = "❌ Después del '@' debe haber un dominio con punto (ej: dominio.com).";
            } else {
                errorDetail = "⚠️ Formato inválido. Revisa que tenga: usuario@dominio.extensión (ej: nombre@empresa.com).";
            }
            feedbackArea.innerHTML = `❌ Correo no válido.<br>${errorDetail}`;
            feedbackArea.className = "feedback-message error-msg";
        }
    }

    // Eventos
    emailInput.addEventListener('input', updateEmailFeedback);
    emailInput.addEventListener('blur', function() {
        updateEmailFeedback();
        if (emailInput.value.trim() === "") {
            emailInput.classList.remove('valid', 'invalid');
            feedbackArea.innerHTML = "✍️ Ingresa una dirección de correo para validarla";
            feedbackArea.className = "feedback-message neutral-msg";
        }
    });
    emailInput.addEventListener('change', updateEmailFeedback);

    // Estado inicial
    emailInput.classList.remove('valid', 'invalid');
    feedbackArea.innerHTML = "✍️ Escribe un correo para validarlo";
    feedbackArea.className = "feedback-message neutral-msg";
})();
