// ================================
// SagaHub - Script de Login Simples
// ================================

// Seleciona elementos do DOM
const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');

form.addEventListener('submit', (event) => {
  event.preventDefault(); // Previne recarregamento da página

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  errorMessage.textContent = ''; // Limpa mensagens anteriores

  // Validação básica
  if (!email.includes('@') || password.length < 3) {
    errorMessage.textContent = 'Preencha os campos corretamente.';
    console.warn('Validação falhou: email ou senha inválidos.');
    return;
  }

  // Log no console
  console.log('Login simulado com os dados:');
  console.log('Email:', email);
  console.log('Senha:', password);

  // Alerta pra avisar que entrou aqui
  alert('Login simulado com sucesso!');
});
