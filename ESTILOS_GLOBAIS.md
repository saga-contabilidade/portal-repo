# 🎨 Sistema de Estilos Globais - SagaHub

## 📋 Visão Geral

Este sistema resolve o problema de inconsistência de estilos entre páginas, garantindo que cabeçalho, rodapé e componentes comuns tenham aparência uniforme em todo o projeto.

## ✅ Problema Resolvido

**Antes**: Cada página tinha suas próprias classes CSS, causando:
- ❌ Inconsistência no peso da fonte (font-weight)
- ❌ Padding diferente entre páginas
- ❌ Classes geradas automaticamente pelo Cursor
- ❌ Duplicação de código CSS

**Depois**: Sistema centralizado com:
- ✅ Classes fixas e consistentes
- ✅ Estilos globais reutilizáveis
- ✅ Manutenção simplificada
- ✅ Aparência uniforme

## 🚀 Como Implementar

### 1. Importar CSS Global

Adicione em todas as páginas HTML:

```html
<link rel="stylesheet" href="/public/styles/global.css">
```

### 2. Usar Classes Padrão

#### Cabeçalho
```html
<header class="cabecalho-principal">
    <div class="conteudo-navbar">
        <a href="hub.html" class="logo-principal">
            <img src="/public/assets/img/logo-cubo.png" alt="SagaHub Logo">
            <span>SagaHub</span>
        </a>
        <nav class="menu-navegacao">
            <a href="hub.html" class="ativo">
                <svg>...</svg>
                Notícias
            </a>
            <!-- Outros links -->
        </nav>
        <div class="area-direita-navbar">
            <div class="area-notificacoes">
                <span class="icone-sino"></span>
                <span class="ponto-notificacao"></span>
            </div>
            <div class="perfil-usuario">
                <span class="icone-perfil"></span>
                <div class="informacoes-perfil">
                    <span class="nome-perfil">João Silva</span>
                    <span class="cargo-perfil">Admin</span>
                </div>
            </div>
        </div>
    </div>
</header>
```

#### Conteúdo Principal
```html
<main class="conteudo-principal">
    <div class="card-padrao">
        <h1 class="titulo-pagina">Título da Página</h1>
        <p class="subtitulo-pagina">Descrição da página</p>
    </div>
</main>
```

#### Botões
```html
<button class="botao-primario">
    <svg>...</svg>
    Ação Principal
</button>

<button class="botao-secundario">
    <svg>...</svg>
    Ação Secundária
</button>
```

## 📁 Estrutura de Arquivos

```
public/styles/
├── global.css          # Estilos globais (OBRIGATÓRIO)
├── kanban.css          # Estilos específicos do Kanban
├── hub.css            # Estilos específicos do Hub
├── fiscal.css         # Estilos específicos do Fiscal
└── ...
```

## 🎯 Classes Disponíveis

### Layout
- `.cabecalho-principal` - Cabeçalho principal
- `.conteudo-principal` - Container do conteúdo
- `.card-padrao` - Card com fundo branco e sombra

### Tipografia
- `.titulo-pagina` - Título principal (h1)
- `.subtitulo-pagina` - Subtítulo (p)

### Botões
- `.botao-primario` - Botão principal (vermelho)
- `.botao-secundario` - Botão secundário (cinza)

### Navegação
- `.menu-navegacao` - Menu de navegação
- `.ativo` - Link ativo no menu
- `.logo-principal` - Logo clicável

### Perfil
- `.perfil-usuario` - Container do perfil
- `.area-notificacoes` - Área de notificações
- `.icone-sino` - Ícone de sino
- `.ponto-notificacao` - Ponto vermelho de notificação

### Utilitários
- `.texto-centralizado` - Texto centralizado
- `.margem-superior` - Margem superior
- `.margem-inferior` - Margem inferior
- `.esconder-mobile` - Esconder no mobile

## 📱 Responsividade

O sistema já inclui breakpoints responsivos:
- **Desktop**: > 768px
- **Tablet**: 768px - 480px  
- **Mobile**: < 480px

## 🔧 Migração de Páginas Existentes

### Passo 1: Adicionar CSS Global
```html
<link rel="stylesheet" href="/public/styles/global.css">
```

### Passo 2: Atualizar Classes HTML
```html
<!-- Antes -->
<header class="navbar">
<div class="logo">
<nav class="nav-menu">

<!-- Depois -->
<header class="cabecalho-principal">
<a href="..." class="logo-principal">
<nav class="menu-navegacao">
```

### Passo 3: Remover CSS Duplicado
Remover do CSS específico da página:
- Estilos de navbar
- Estilos de botões padrão
- Estilos de tipografia básica

## 🎨 Personalização

Para estilos específicos de cada página, mantenha apenas:
- Layouts únicos
- Componentes específicos
- Cores temáticas
- Animações especiais

## 📝 Exemplo Completo

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Minha Página - SagaHub</title>
    <link rel="stylesheet" href="/public/styles/global.css">
    <link rel="stylesheet" href="/public/styles/minha-pagina.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="icon" href="/public/assets/img/logo-cubo.png" type="image/png" />
</head>
<body>
    <!-- Cabeçalho Padrão -->
    <header class="cabecalho-principal">
        <!-- ... conteúdo do cabeçalho ... -->
    </header>

    <!-- Conteúdo Principal -->
    <main class="conteudo-principal">
        <div class="card-padrao">
            <h1 class="titulo-pagina">Título da Página</h1>
            <p class="subtitulo-pagina">Descrição da página</p>
            
            <button class="botao-primario">
                <svg>...</svg>
                Ação Principal
            </button>
        </div>
    </main>
</body>
</html>
```

## ✅ Benefícios

1. **Consistência Visual**: Todas as páginas têm aparência uniforme
2. **Manutenção Simplificada**: Mudanças globais em um só lugar
3. **Performance**: Menos código duplicado
4. **Escalabilidade**: Fácil adição de novas páginas
5. **Responsividade**: Funciona em todos os dispositivos

## 🚨 Importante

- **SEMPRE** importe o `global.css` antes dos CSS específicos
- **NUNCA** sobrescreva classes globais sem necessidade
- **USE** apenas classes específicas para funcionalidades únicas
- **TESTE** em diferentes tamanhos de tela

---

*Sistema criado para resolver inconsistências de estilo entre páginas do SagaHub* 