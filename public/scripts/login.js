const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('error-message');
const quotesBox = document.querySelector('.quote-box');
const authorText = document.querySelector('.author');

const API_URL = 'http://localhost:3000/api/auth/login';

// --- Mock de frases ---

function displayRandomQuote() {
  const quotes = [
    { text: "Eu posso aceitar o fracasso. Todo mundo falha em alguma coisa. Mas eu não posso aceitar não tentar.", author: "Jordan, Michael." },
    { text: "A persistência é o caminho do êxito.", author: "Chaplin, Charles." },
    { text: "O único lugar onde o sucesso vem antes do trabalho é no dicionário.", author: "Einstein, Albert." },
    { text: "Tente de novo. Fracasse de novo. Mas fracasse melhor.", author: "Beckett, Samuel." },
    { text: "Sua única limitação é você mesmo.", author: "Anônimo" } 
  ];

  if (quotesBox && authorText) {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIndex];
    quotesBox.innerHTML = `<blockquote>“${randomQuote.text}”</blockquote>`; 
    authorText.textContent = `~ ${randomQuote.author}`; 
  }
}

// --- Lógica Principal ---

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  errorMessage.textContent = '';
  loginButton.disabled = true;
  loginButton.textContent = 'Entrando...';

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  if (!email.includes('@') || password.length < 3) {
    errorMessage.textContent = 'Preencha os campos corretamente.';
    loginButton.disabled = false;
    loginButton.textContent = 'Entrar';
    return;
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password
      }),
    }); 
  
    const data = await response.json();

    if (!response.ok) {
      errorMessage.textContent = data.message || 'E-mail ou senha inválidos.';
      throw new Error(data.message || 'Falha no login');
    }

    console.log('Login bem-sucedido!', data);

    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    window.location.href = 'templates/pagina_em_construcao.html';

  } catch (error) {
    console.error('Erro ao tentar fazer login:', error);
    if (!errorMessage.textContent) {
      errorMessage.textContent = 'Não foi possível conectar ao servidor. Tente novamente mais tarde.';
    }
  } finally {
    loginButton.disabled = false;
    loginButton.textContent = 'Entrar';
  }
});

document.addEventListener('DOMContentLoaded', () => {
  displayRandomQuote();
});