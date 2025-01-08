# Music App

Uma aplicação web para gerenciamento de músicas e partituras, construída com React e Firebase.

## 🚀 Funcionalidades

- Autenticação de usuários (login/cadastro)
- Gerenciamento de músicas
- Interface moderna e responsiva
- Validação de formulários
- Feedback visual para ações do usuário
- Tratamento de erros

## 🛠️ Tecnologias Utilizadas

- React 18
- Firebase (Auth e Firestore)
- Styled Components
- React Router Dom
- React Loading
- React Toastify
- PropTypes
- ESLint e Prettier para qualidade de código

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- NPM ou Yarn
- Conta no Firebase

## 🔧 Configuração

1. Clone o repositório:
```bash
git clone [url-do-repositório]
cd music-app
```

2. Instale as dependências:
```bash
npm install
# ou
yarn install
```

3. Configure as variáveis de ambiente:
   - Crie um arquivo `.env` na raiz do projeto
   - Adicione suas configurações do Firebase:
```env
REACT_APP_FIREBASE_API_KEY=seu_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=seu_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=seu_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=seu_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=seu_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=seu_app_id
```

## 🚀 Scripts Disponíveis

### `npm start`

Inicia o app em modo de desenvolvimento.\
Abra [http://localhost:3000](http://localhost:3000) para ver no navegador.

### `npm run build`

Compila o app para produção na pasta `build`.\
O app estará otimizado e pronto para deploy!

### `npm run lint`

Executa o ESLint para verificar problemas no código.

### `npm run format`

Formata o código usando Prettier.

## 📝 Boas Práticas

- Utilize os componentes de erro (ErrorBoundary) para tratamento de erros
- Mantenha o código formatado usando `npm run format`
- Verifique erros de lint usando `npm run lint`
- Sempre adicione PropTypes aos componentes
- Utilize os componentes de loading para feedback visual
- Trate todos os erros possíveis nas chamadas ao Firebase

## 🤝 Contribuindo

1. Faça o fork do projeto
2. Crie sua branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 🎉 Agradecimentos

- [Create React App](https://github.com/facebook/create-react-app)
- [Firebase](https://firebase.google.com/)
- [Styled Components](https://styled-components.com/)
