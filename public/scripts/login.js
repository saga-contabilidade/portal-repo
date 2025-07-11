const form = document.getElementById('login-form');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMessage = document.getElementById('error-message');
const quotesBox = document.querySelector('.quote-box');
const authorText = document.querySelector('.author');

form.addEventListener('submit', (event) => {
  event.preventDefault();
 // 1. Mock de objetos com as citações e autores, futuramente gerado automaticamente
  const quotes = [
    {
      text: "Eu posso aceitar o fracasso. Todo mundo falha em alguma coisa. Mas eu não posso aceitar não tentar.",
      author: "Jordan, Michael."
    },
    {
      text: "A persistência é o caminho do êxito.",
      author: "Chaplin, Charles."
    },
    {
      text: "O único lugar onde o sucesso vem antes do trabalho é no dicionário.",
      author: "Einstein, Albert."
    },
    {
        text: "Tente de novo. Fracasse de novo. Mas fracasse melhor.",
        author: "Beckett, Samuel."
    },
    {
        text: "Sua única limitação é você mesmo.",
        author: "Anônimo"
    } 
  ]

  if (quotesBox && authorText){
    const randomIdex = Math.floor(Math.random() * quotes.length);
    const randomQuote = quotes[randomIdex];
    quotesBox.innerHTML = `<blockquote>"${randomQuote.text}”</blockquote>`;

    authorText.innerHTML = `- ${randomQuote.author}`;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  errorMessage.textContent = '';

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
